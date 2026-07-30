from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.app.database.database import get_db
from backend.app.dependencies.auth import get_current_user
from backend.app.ml.aptitude.aptitude_generator import generate_aptitude_test, evaluate_aptitude_test

router = APIRouter(tags=["Aptitude Testing"])

@router.get("/aptitude-test")
async def aptitude_test(domain: str = "General", user=Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        questions = generate_aptitude_test(db, email=user, domain=domain, num_questions=20)
        return {"success": True, "message": "Test fetched", "data": {"questions": questions}}
    except Exception as e:
        import traceback
        traceback.print_exc()
        return {"success": False, "message": str(e), "data": None}

@router.post("/submit-aptitude")
async def submit_aptitude(data: dict, user=Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        answers = data.get("answers", [])
        time_taken = data.get("time_taken", 1200)
        result = evaluate_aptitude_test(
            db, email=user, user_answers=answers, time_taken=time_taken
        )
        return {"success": True, "message": "Test evaluated", "data": result}
    except Exception as e:
        import traceback
        traceback.print_exc()
        return {"success": False, "message": str(e), "data": None}
