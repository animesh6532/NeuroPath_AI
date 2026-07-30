import json
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.app.database.database import get_db, SessionLocal
from backend.app.models.models import CodingProblem, CodingAttempt
from backend.app.dependencies.auth import get_current_user
from backend.app.ml.coding.coding_engine import select_daily_challenges
from backend.app.ml.coding.executor import execute_code

# Helper profiles loader
PROFILE_FILE = "user_profiles.json"
def _load_profiles() -> dict:
    import os
    try:
        if os.path.exists(PROFILE_FILE):
            with open(PROFILE_FILE, "r") as f:
                content = f.read().strip()
                if content:
                    return json.loads(content)
    except Exception:
        pass
    return {}

router = APIRouter(tags=["Daily Coding Challenges"])

@router.get("/daily-challenge")
async def daily_challenge(user=Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        profiles = _load_profiles()
        profile = profiles.get(user, {})
        domain = profile.get("career_title") or "General"
        
        res = select_daily_challenges(db, email=user, domain=domain)
        if not res.get("skip") and res.get("challenges"):
            cids = [c["id"] for c in res["challenges"]]
            attempts = db.query(CodingAttempt).filter(
                CodingAttempt.email == user,
                CodingAttempt.problem_id.in_(cids)
            ).order_by(CodingAttempt.timestamp.desc()).all()
            res["attempts"] = [{
                "problem_id": a.problem_id,
                "language": a.language,
                "status": a.status,
                "runtime": a.runtime,
                "memory": a.memory,
                "passed_test_cases": a.passed_test_cases,
                "total_test_cases": a.total_test_cases,
                "timestamp": a.timestamp
            } for a in attempts]
        else:
            res["attempts"] = []
        return {"success": True, "message": "Challenges fetched", "data": res}
    except Exception as e:
        return {"success": False, "message": str(e), "data": None}

@router.post("/run-code")
async def run_code(data: dict, user=Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        pid = data.get("problem_id")
        code = data.get("code", "")
        lang = data.get("language", "python")
        
        problem = db.query(CodingProblem).filter(CodingProblem.id == pid).first()
        if not problem:
            return {"success": False, "message": "Problem not found.", "data": None}
            
        test_cases = json.loads(problem.test_cases) if problem.test_cases else []
        res = execute_code(code, lang, test_cases)
        return {"success": True, "message": "Code executed against public test cases.", "data": res}
    except Exception as e:
        import traceback
        traceback.print_exc()
        return {"success": False, "message": str(e), "data": None}

@router.post("/submit-code")
async def submit_code(data: dict, user=Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        pid = data.get("problem_id")
        code = data.get("code", "")
        lang = data.get("language", "python")
        
        problem = db.query(CodingProblem).filter(CodingProblem.id == pid).first()
        if not problem:
            return {"success": False, "message": "Problem not found.", "data": None}
            
        public_tests = json.loads(problem.test_cases) if problem.test_cases else []
        hidden_tests = json.loads(problem.hidden_test_cases) if problem.hidden_test_cases else []
        all_tests = public_tests + hidden_tests
        
        res = execute_code(code, lang, all_tests)
        
        attempt = CodingAttempt(
            email=user,
            problem_id=pid,
            code=code,
            language=lang,
            status=res["status"],
            runtime=res["runtime"],
            memory=res["memory"],
            passed_test_cases=res["passed_test_cases"],
            total_test_cases=res["total_test_cases"],
            timestamp=datetime.now().isoformat()
        )
        db.add(attempt)
        db.commit()
        
        solved_count = db.query(CodingAttempt).filter(
            CodingAttempt.email == user,
            CodingAttempt.status == "Accepted"
        ).group_by(CodingAttempt.problem_id).count()
        
        coding_stats = {
            "streak": 1 if solved_count > 0 else 0,
            "completedToday": res["status"] == "Accepted",
            "lastActive": datetime.now().isoformat(),
            "solvedCount": solved_count
        }
        
        return {
            "success": True,
            "message": "Code submitted successfully.",
            "data": {
                "run_result": res,
                "coding_stats": coding_stats
            }
        }
    except Exception as e:
        db.rollback()
        import traceback
        traceback.print_exc()
        return {"success": False, "message": str(e), "data": None}
