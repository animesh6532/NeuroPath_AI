from fastapi import FastAPI, UploadFile, File, Depends
import shutil
import os
import json

from pdfminer.high_level import extract_text

from backend.app.ml.resume_scorer import calculate_resume_score
from backend.app.ml.career_explainer import explain_career
from backend.app.ml.semantic_matcher import semantic_match
from backend.app.ml.skill_analyzer import extract_skills, extract_projects, extract_experience
from backend.app.ml.career_data import CAREER_DATA
from backend.app.ml.skill_gap import find_skill_gap

from backend.app.ml.interview.question_generator import generate_questions_from_skills
from backend.app.ml.interview.interview_engine import evaluate_interview_answers

from backend.app.ml.placement.placement_engine import predict_placement_result
from backend.app.ml.learning.roadmap_generator import generate_learning_roadmap
from backend.app.ml.aptitude.aptitude_generator import generate_aptitude_test, evaluate_aptitude_test
from backend.app.ml.coding.coding_challenges import get_daily_challenges

from backend.app.dashboard.dashboard_service import generate_dashboard

from backend.app.auth.routes import router as auth_router
from backend.app.auth.dependencies import get_current_user

from fastapi.middleware.cors import CORSMiddleware

# ✅ ONLY KEEP PROCTOR ROUTER
from backend.app.proctoring.proctor_routes import router as proctor_router

from backend.app.assistant.assistant_routes import router as assistant_router

app = FastAPI()

# ================= CORS =================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ================= ROUTERS =================
app.include_router(auth_router, prefix="/auth", tags=["Authentication"])
app.include_router(proctor_router)  # ✅ KEEP THIS
app.include_router(assistant_router, tags=["Assistant"])

# ================= RESUME ANALYSIS =================
@app.post("/analyze-resume")
async def analyze_resume(file: UploadFile = File(...)):
    try:
        file_location = f"temp_{file.filename}"
        with open(file_location, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        resume_text = extract_text(file_location)

        skills = extract_skills(resume_text)
        projects = extract_projects(resume_text)
        experience = extract_experience(resume_text)

        careers = semantic_match(resume_text)
        top_career = careers[0]["career"] if careers else "Software Engineer"

        missing_skills = find_skill_gap(skills, top_career)

        domain_scores = {}
        for item in careers:
            career_name = item["career"]
            score = item["score"]
            domain = CAREER_DATA.get(career_name, {}).get("domain", "General")
            domain_scores[domain] = domain_scores.get(domain, 0) + score

        best_domain = max(domain_scores, key=domain_scores.get) if domain_scores else "General"

        resume_score = calculate_resume_score(skills, top_career, missing_skills)
        career_explanation = explain_career(skills, top_career)

        os.remove(file_location)

        return {
            "success": True,
            "message": "Resume analyzed successfully",
            "data": {
                "detected_skills": skills,
                "projects": projects,
                "experience": experience,
                "recommended_careers": careers,
                "top_career": top_career,
                "missing_skills": missing_skills,
                "resume_score": resume_score,
                "career_explanation": career_explanation,
                "best_domain": best_domain,
                "domain_scores": domain_scores
            }
        }
    except Exception as e:
        return {"success": False, "message": str(e), "data": None}

# ================= GENERATE INTERVIEW =================
@app.post("/generate-interview")
async def generate_interview(data: dict):
    try:
        skills = data.get("skills", [])
        questions = generate_questions_from_skills(skills)
        return {
            "success": True,
            "message": "Questions generated successfully",
            "data": {
                "skills": skills,
                "questions": questions
            }
        }
    except Exception as e:
        return {"success": False, "message": str(e), "data": None}

# ================= SUBMIT INTERVIEW =================
@app.post("/submit-interview")
async def submit_interview(data: dict):
    try:
        skills = data.get("skills", [])
        answers = data.get("answers", [])

        results = evaluate_interview_answers(answers, skills)
        weak = results.get("weaknesses", [])

        return {
            "success": True,
            "message": "Interview evaluated successfully",
            "data": {
                "score": results.get("score", 0),
                "confidence": results.get("confidence_score", 0),
                "communication": results.get("communication_score", 0),
                "weaknesses": weak,
                "full_results": results
            }
        }
    except Exception as e:
        return {"success": False, "message": str(e), "data": None}

# ================= AI INTERVIEW TEST =================
@app.post("/ai-interview")
async def ai_interview(data: dict):
    try:
        skills = data.get("skills", [])
        answers = data.get("answers", [])

        results = evaluate_interview_answers(answers, skills)
        weak_areas = results.get("weaknesses", [])

        return {
            "success": True,
            "message": "AI interview evaluated successfully",
            "data": {
                "interview_results": results,
                "weak_areas": weak_areas
            }
        }
    except Exception as e:
        return {"success": False, "message": str(e), "data": None}

# ================= PLACEMENT =================
@app.post("/placement-analysis")
async def placement_analysis(data: dict):
    try:
        resume_score = data.get("resume_score", 0)
        interview_score = data.get("interview_score", 0)
        missing_skills = data.get("missing_skills", [])
        confidence = data.get("confidence", 0)
        communication = data.get("communication", 0)
        domain = data.get("domain", "Technology")

        result = predict_placement_result(
            {
                "score": interview_score,
                "confidence_score": confidence,
                "communication_score": communication
            },
            missing_skills,
            domain
        )
        return {"success": True, "message": "Placement analyzed", "data": result}
    except Exception as e:
        return {"success": False, "message": str(e), "data": None}

# ================= ROADMAP =================
@app.post("/generate-roadmap")
async def generate_roadmap(data: dict):
    try:
        weaknesses = data.get("weaknesses", [])
        missing_skills = data.get("missing_skills", [])
        domain = data.get("domain", "")

        roadmap = generate_learning_roadmap(weaknesses, missing_skills, domain)
        return {"success": True, "message": "Roadmap generated", "data": roadmap}
    except Exception as e:
        return {"success": False, "message": str(e), "data": None}

# ================= DAILY CHALLENGE =================
@app.get("/daily-challenge")
async def daily_challenge():
    try:
        challenges = get_daily_challenges()
        return {"success": True, "message": "Challenges fetched", "data": {"challenges": challenges}}
    except Exception as e:
        return {"success": False, "message": str(e), "data": None}

# ================= APTITUDE TEST =================
@app.get("/aptitude-test")
async def aptitude_test():
    try:
        questions = generate_aptitude_test(20)
        return {"success": True, "message": "Test fetched", "data": {"questions": questions}}
    except Exception as e:
        return {"success": False, "message": str(e), "data": None}

@app.post("/submit-aptitude")
async def submit_aptitude(data: dict):
    try:
        answers = data.get("answers", [])
        result = evaluate_aptitude_test(answers)
        return {"success": True, "message": "Test evaluated", "data": result}
    except Exception as e:
        return {"success": False, "message": str(e), "data": None}

# ================= DASHBOARD =================
@app.post("/dashboard")
async def dashboard_post(data: dict):
    try:
        result = generate_dashboard(data)
        return {"success": True, "message": "Dashboard data fetched", "data": result}
    except Exception as e:
        return {"success": False, "message": str(e), "data": None}

@app.get("/dashboard")
def dashboard_get(user=Depends(get_current_user)):
    return {"success": True, "message": f"Welcome {user}", "data": None}

# ================= PROFILE =================
PROFILE_FILE = "user_profile.json"

@app.get("/get-profile")
async def get_profile():
    try:
        if os.path.exists(PROFILE_FILE):
            with open(PROFILE_FILE, "r") as f:
                profile_data = json.load(f)
            return {"success": True, "message": "Profile fetched", "data": profile_data}
        return {"success": True, "message": "No profile found", "data": {}}
    except Exception as e:
        return {"success": False, "message": str(e), "data": None}

@app.post("/update-profile")
async def update_profile(data: dict):
    try:
        with open(PROFILE_FILE, "w") as f:
            json.dump(data, f)
        return {"success": True, "message": "Profile updated", "data": data}
    except Exception as e:
        return {"success": False, "message": str(e), "data": None}