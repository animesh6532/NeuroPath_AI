from fastapi import FastAPI, UploadFile, File, Depends
import shutil
import os
import json

from pdfminer.high_level import extract_text

from app.ml.resume_scorer import calculate_resume_score
from app.ml.career_explainer import explain_career
from app.ml.semantic_matcher import semantic_match
from app.ml.skill_analyzer import extract_skills, extract_projects, extract_experience
from app.ml.skill_gap import find_skill_gap


from app.ml.interview.question_generator import generate_questions_from_skills
from app.ml.interview.interview_engine import evaluate_interview_answers

from app.ml.placement.placement_engine import predict_placement_result
from app.ml.learning.roadmap_generator import generate_learning_roadmap
from app.ml.aptitude.aptitude_generator import generate_aptitude_test, evaluate_aptitude_test
from app.ml.coding.coding_challenges import get_daily_challenges

from app.dashboard.dashboard_service import generate_dashboard

from app.auth.routes import router as auth_router
from app.auth.dependencies import get_current_user

from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.proctoring.proctor_routes import router as proctor_router
from app.assistant.assistant_routes import router as assistant_router
from app.interview.routes import router as interview_router

app = FastAPI(title="NeuroPath AI Backend", version="1.1.0")

from app.db.database import engine
from app.db.models import Base

@app.on_event("startup")
def startup_db_init():
    Base.metadata.create_all(bind=engine)
    from app.services.matching_engine import init_matching_cache
    init_matching_cache()
    from app.services.question_graph import seed_interview_questions
    seed_interview_questions()
    from app.ml.aptitude.seeder import seed_aptitude_questions
    from app.ml.coding.seeder import seed_coding_problems
    from app.db.database import SessionLocal
    db = SessionLocal()
    try:
        seed_aptitude_questions(db)
        seed_coding_problems(db)
    finally:
        db.close()

# ── CORS ────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Static Files & Routers ───────────────────────────────────────────────────
os.makedirs("static", exist_ok=True)
os.makedirs("static/reports", exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")


app.include_router(auth_router, prefix="/auth", tags=["Authentication"])
app.include_router(proctor_router)
app.include_router(assistant_router, tags=["Assistant"])
app.include_router(interview_router)



# ── Response helpers ─────────────────────────────────────────────────────────
def ok(data, message="OK"):
    return {"success": True, "message": message, "data": data}

def err(message):
    return {"success": False, "message": str(message), "data": None}


# ── Profile store helpers ────────────────────────────────────────────────────
PROFILE_FILE = "user_profiles.json"

def _load_profiles() -> dict:
    try:
        if os.path.exists(PROFILE_FILE):
            with open(PROFILE_FILE, "r") as f:
                content = f.read().strip()
                if content:
                    return json.loads(content)
    except Exception as e:
        print(f"[profile] load error: {e}")
    return {}

def _save_profiles(profiles: dict):
    try:
        with open(PROFILE_FILE, "w") as f:
            json.dump(profiles, f, indent=2)
    except Exception as e:
        print(f"[profile] save error: {e}")

def _build_safe_profile(raw: dict, email: str = "") -> dict:
    """Return a guaranteed-safe profile dict — no missing keys, no None values."""
    custom = raw.get("custom_skills", [])
    if not isinstance(custom, list):
        custom = []
    
    languages = raw.get("languages", [])
    if not isinstance(languages, list):
        languages = []
        
    soft_skills = raw.get("soft_skills", [])
    if not isinstance(soft_skills, list):
        soft_skills = []
        
    education = raw.get("education", [])
    if not isinstance(education, list):
        education = []
        
    achievements = raw.get("achievements", [])
    if not isinstance(achievements, list):
        achievements = []
        
    projects = raw.get("projects", [])
    if not isinstance(projects, list):
        projects = []
        
    certifications = raw.get("certifications", [])
    if not isinstance(certifications, list):
        certifications = []
        
    work_exp = raw.get("work_experience", [])
    if not isinstance(work_exp, list):
        work_exp = []
        
    goals = raw.get("career_goals", {})
    if not isinstance(goals, dict):
        goals = {}
        
    settings = raw.get("settings", {})
    if not isinstance(settings, dict):
        settings = {}
        
    return {
        "name":                 str(raw.get("name",          "") or ""),
        "bio":                  str(raw.get("bio",           "") or ""),
        "profile_image":        str(raw.get("profile_image", "") or ""),
        "cover_image":          str(raw.get("cover_image",   "") or ""),
        "custom_skills":        [str(s) for s in custom if s],
        "email":                str(raw.get("email", email) or email),
        
        # New profile fields
        "career_title":         str(raw.get("career_title", "") or ""),
        "current_status":       str(raw.get("current_status", "") or ""),
        "current_org":          str(raw.get("current_org", "") or ""),
        "github":               str(raw.get("github", "") or ""),
        "linkedin":             str(raw.get("linkedin", "") or ""),
        "portfolio":            str(raw.get("portfolio", "") or ""),
        "career_objective":     str(raw.get("career_objective", "") or ""),
        "interests":            str(raw.get("interests", "") or ""),
        "passion":              str(raw.get("passion", "") or ""),
        "languages":            [str(l) for l in languages if l],
        "soft_skills":          [str(s) for s in soft_skills if s],
        "education":            education,
        "achievements":         [str(a) for a in achievements if a],
        "projects":             projects,
        "certifications":       certifications,
        "work_experience":      work_exp,
        "career_goals":         {
            "target_role":      str(goals.get("target_role", "") or ""),
            "dream_company":    str(goals.get("dream_company", "") or ""),
            "preferred_domain": str(goals.get("preferred_domain", "") or ""),
            "learning_focus":   str(goals.get("learning_focus", "") or "")
        },
        "settings":             {
            "theme":            str(settings.get("theme", "light") or "light"),
            "notifications":    bool(settings.get("notifications", True)),
            "privacy":          str(settings.get("privacy", "public") or "public")
        },
        "verified":             bool(raw.get("verified", False))
    }


# ── RESUME ANALYSIS ──────────────────────────────────────────────────────────
from app.services.resume_parser import parse_resume
from app.services.matching_engine import match_resume_to_careers

@app.post("/analyze-resume")
async def analyze_resume(file: UploadFile = File(...)):
    file_location = f"temp_{file.filename}"
    try:
        with open(file_location, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        resume_text = extract_text(file_location)
        parsed_profile = parse_resume(resume_text)
        result = match_resume_to_careers(parsed_profile)

        return ok(result, "Resume analyzed successfully")
    except Exception as e:
        return err(e)
    finally:
        if os.path.exists(file_location):
            try: os.remove(file_location)
            except: pass


# ── GENERATE INTERVIEW ────────────────────────────────────────────────────────
@app.post("/generate-interview")
async def generate_interview(data: dict):
    try:
        skills    = data.get("skills", [])
        questions = generate_questions_from_skills(skills)
        return ok({"skills": skills, "questions": questions}, "Questions generated")
    except Exception as e:
        return err(e)


# ── SUBMIT INTERVIEW ──────────────────────────────────────────────────────────
@app.post("/submit-interview")
async def submit_interview(data: dict):
    try:
        skills  = data.get("skills", [])
        answers = data.get("answers", [])
        results = evaluate_interview_answers(answers, skills)
        weak    = results.get("weaknesses", [])
        if not isinstance(weak, list):
            weak = []
        return ok({
            "score":        results.get("score", 0),
            "confidence":   results.get("confidence_score", 0),
            "communication":results.get("communication_score", 0),
            "weaknesses":   weak,
            "full_results": results,
        }, "Interview evaluated")
    except Exception as e:
        return err(e)


# ── AI INTERVIEW TEST ─────────────────────────────────────────────────────────
@app.post("/ai-interview")
async def ai_interview(data: dict):
    try:
        results    = evaluate_interview_answers(data.get("answers", []), data.get("skills", []))
        weak_areas = results.get("weaknesses", [])
        if not isinstance(weak_areas, list):
            weak_areas = []
        return ok({"interview_results": results, "weak_areas": weak_areas}, "AI interview evaluated")
    except Exception as e:
        return err(e)


# ── PLACEMENT ─────────────────────────────────────────────────────────────────
@app.post("/placement-analysis")
async def placement_analysis(data: dict):
    try:
        resume_score = data.get("resume_score", 0)
        interview_score = data.get("interview_score", 0)
        coding_score = data.get("coding_score", 0)
        aptitude_score = data.get("aptitude_score", 0)
        profile_completeness = data.get("profile_completeness", 0)
        domain = data.get("domain", "Technology")
        missing_skills = data.get("missing_skills", [])
        
        result = predict_placement_result(
            resume_score=resume_score,
            interview_score=interview_score,
            coding_score=coding_score,
            aptitude_score=aptitude_score,
            profile_completeness=profile_completeness,
            domain=domain,
            missing_skills=missing_skills
        )
        return ok(result, "Placement analyzed")
    except Exception as e:
        return err(e)


# ── ROADMAP ───────────────────────────────────────────────────────────────────
@app.post("/generate-roadmap")
async def generate_roadmap(data: dict, user=Depends(get_current_user)):
    from app.db.database import SessionLocal
    db = SessionLocal()
    try:
        roadmap = generate_learning_roadmap(
            weaknesses=data.get("weaknesses", []),
            missing_skills=data.get("missing_skills", []),
            domain=data.get("domain", "General"),
            coding_score=data.get("coding_score", 100),
            aptitude_score=data.get("aptitude_score", 100),
            resume_score=data.get("resume_score", 70),
            interview_score=data.get("interview_score", 70),
            profile_completeness=data.get("profile_completeness", 70),
            email=user,
            db=db
        )
        return ok(roadmap, "Roadmap generated")
    except Exception as e:
        import traceback
        traceback.print_exc()
        return err(e)
    finally:
        db.close()


# ── DAILY CHALLENGE ───────────────────────────────────────────────────────────
@app.get("/daily-challenge")
async def daily_challenge(user=Depends(get_current_user)):
    from app.db.database import SessionLocal
    from app.db.models import CodingAttempt
    from app.ml.coding.coding_engine import select_daily_challenges
    db = SessionLocal()
    try:
        # Load user profile to check career_title
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
        return ok(res, "Challenges fetched")
    except Exception as e:
        return err(e)
    finally:
        db.close()


@app.post("/run-code")
async def run_code(data: dict, user=Depends(get_current_user)):
    from app.db.database import SessionLocal
    from app.db.models import CodingProblem
    from app.ml.coding.executor import execute_code
    db = SessionLocal()
    try:
        pid = data.get("problem_id")
        code = data.get("code", "")
        lang = data.get("language", "python")
        
        problem = db.query(CodingProblem).filter(CodingProblem.id == pid).first()
        if not problem:
            return err("Problem not found.")
            
        test_cases = json.loads(problem.test_cases) if problem.test_cases else []
        res = execute_code(code, lang, test_cases)
        return ok(res, "Code executed against public test cases.")
    except Exception as e:
        import traceback
        traceback.print_exc()
        return err(e)
    finally:
        db.close()


@app.post("/submit-code")
async def submit_code(data: dict, user=Depends(get_current_user)):
    from app.db.database import SessionLocal
    from app.db.models import CodingProblem, CodingAttempt
    from app.ml.coding.executor import execute_code
    from datetime import datetime
    db = SessionLocal()
    try:
        pid = data.get("problem_id")
        code = data.get("code", "")
        lang = data.get("language", "python")
        
        problem = db.query(CodingProblem).filter(CodingProblem.id == pid).first()
        if not problem:
            return err("Problem not found.")
            
        public_tests = json.loads(problem.test_cases) if problem.test_cases else []
        hidden_tests = json.loads(problem.hidden_test_cases) if problem.hidden_test_cases else []
        all_tests = public_tests + hidden_tests
        
        res = execute_code(code, lang, all_tests)
        
        # Log attempt in DB
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
        
        # Calculate updated coding stats for the user
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
        
        return ok({
            "run_result": res,
            "coding_stats": coding_stats
        }, "Code submitted successfully.")
    except Exception as e:
        db.rollback()
        import traceback
        traceback.print_exc()
        return err(e)
    finally:
        db.close()


# ── APTITUDE ──────────────────────────────────────────────────────────────────
@app.get("/aptitude-test")
async def aptitude_test(domain: str = "General", user=Depends(get_current_user)):
    from app.db.database import SessionLocal
    db = SessionLocal()
    try:
        questions = generate_aptitude_test(db, email=user, domain=domain, num_questions=20)
        return ok({"questions": questions}, "Test fetched")
    except Exception as e:
        import traceback
        traceback.print_exc()
        return err(e)
    finally:
        db.close()

@app.post("/submit-aptitude")
async def submit_aptitude(data: dict, user=Depends(get_current_user)):
    from app.db.database import SessionLocal
    db = SessionLocal()
    try:
        answers = data.get("answers", [])
        time_taken = data.get("time_taken", 1200)
        result = evaluate_aptitude_test(
            db, email=user, user_answers=answers, time_taken=time_taken
        )
        return ok(result, "Test evaluated")
    except Exception as e:
        import traceback
        traceback.print_exc()
        return err(e)
    finally:
        db.close()


# ── DASHBOARD ─────────────────────────────────────────────────────────────────
@app.post("/dashboard")
async def dashboard_post(data: dict):
    try:
        return ok(generate_dashboard(data), "Dashboard data fetched")
    except Exception as e:
        return err(e)

@app.get("/dashboard")
def dashboard_get(user=Depends(get_current_user)):
    return ok(None, f"Welcome {user}")


# ── PROFILE ───────────────────────────────────────────────────────────────────

@app.get("/profile/{user_id}")
async def get_profile_by_id(user_id: str):
    """Fetch profile by email / user_id."""
    try:
        profiles = _load_profiles()
        raw      = profiles.get(user_id, {})
        return ok(_build_safe_profile(raw, user_id), "Profile fetched")
    except Exception as e:
        return err(e)


@app.get("/get-profile")
async def get_profile_legacy():
    """Legacy single-profile endpoint — returns first stored profile."""
    try:
        profiles = _load_profiles()
        raw      = next(iter(profiles.values()), {})
        return ok(_build_safe_profile(raw), "Profile fetched")
    except Exception as e:
        return err(e)


@app.post("/profile/update")
async def update_profile(data: dict):
    """
    Save profile keyed by email.
    Always returns the FULL saved profile object (not just a message).
    """
    try:
        email    = str(data.get("email", "") or "default").strip()
        profiles = _load_profiles()
        # Merge with existing so we never lose fields not included in this request
        existing = profiles.get(email, {})
        merged   = {**existing, **data}
        safe     = _build_safe_profile(merged, email)
        profiles[email] = safe
        _save_profiles(profiles)
        print(f"[profile] saved for '{email}': {list(safe.keys())}")
        return ok(safe, "Profile updated")
    except Exception as e:
        print(f"[profile] update error: {e}")
        return err(e)


@app.post("/update-profile")
async def update_profile_legacy(data: dict):
    """Legacy endpoint — same logic as /profile/update."""
    return await update_profile(data)
