from fastapi import FastAPI, UploadFile, File, Depends
import shutil
import os

from pdfminer.high_level import extract_text

from backend.app.ml.resume_scorer import calculate_resume_score
from backend.app.ml.career_explainer import explain_career
from backend.app.ml.semantic_matcher import semantic_match
from backend.app.ml.skill_analyzer import extract_skills
from backend.app.ml.career_data import CAREER_DATA
from backend.app.ml.skill_gap import find_skill_gap

from backend.app.ml.interview.question_generator import generate_questions_from_skills
from backend.app.ml.interview.interview_engine import evaluate_interview_answers

from backend.app.ml.placement.placement_engine import predict_placement_result
from backend.app.ml.learning.roadmap_generator import generate_learning_roadmap

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

    file_location = f"temp_{file.filename}"

    with open(file_location, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    resume_text = extract_text(file_location)

    skills = extract_skills(resume_text)

    careers = semantic_match(resume_text)
    top_career = careers[0]["career"]

    missing_skills = find_skill_gap(skills, top_career)

    domain_scores = {}
    for item in careers:
        career_name = item["career"]
        score = item["score"]
        domain = CAREER_DATA.get(career_name, {}).get("domain", "General")
        domain_scores[domain] = domain_scores.get(domain, 0) + score

    best_domain = max(domain_scores, key=domain_scores.get)

    resume_score = calculate_resume_score(skills, top_career, missing_skills)
    career_explanation = explain_career(skills, top_career)

    os.remove(file_location)

    return {
        "detected_skills": skills,
        "recommended_careers": careers,
        "top_career": top_career,
        "missing_skills": missing_skills,
        "resume_score": resume_score,
        "career_explanation": career_explanation,
        "best_domain": best_domain,
        "domain_scores": domain_scores
    }

# ================= START INTERVIEW =================
@app.post("/start-ai-interview")
async def start_ai_interview(file: UploadFile = File(...)):

    file_location = f"temp_{file.filename}"

    with open(file_location, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    resume_text = extract_text(file_location)
    skills = extract_skills(resume_text)

    questions = generate_questions_from_skills(skills)

    os.remove(file_location)

    return {
        "skills": skills,
        "questions": questions
    }

# ================= SUBMIT INTERVIEW =================
@app.post("/submit-interview")
async def submit_interview(data: dict):

    skills = data.get("skills", [])
    answers = data.get("answers", [])

    results = evaluate_interview_answers(answers, skills)
    weak = results.get("weaknesses", [])

    return {
        "results": results,
        "weak_areas": weak
    }

# ================= AI INTERVIEW TEST =================
@app.post("/ai-interview")
async def ai_interview(data: dict):

    skills = data.get("skills", [])
    answers = data.get("answers", [])

    results = evaluate_interview_answers(answers, skills)
    weak_areas = results.get("weaknesses", [])

    return {
        "interview_results": results,
        "weak_areas": weak_areas
    }

# ================= PLACEMENT =================
@app.post("/placement-analysis")
async def placement_analysis(data: dict):

    resume_score = data.get("resume_score", 0)
    interview_score = data.get("interview_score", 0)
    missing_skills = data.get("missing_skills", [])

    return predict_placement_result(
    {"score": interview_score},
    missing_skills
    )

# ================= ROADMAP =================
@app.post("/learning-roadmap")
async def learning_roadmap(data: dict):

    missing_skills = data.get("missing_skills", [])

    roadmap = generate_learning_roadmap([], missing_skills)
    return {
        "roadmap": roadmap
    }

# ================= DASHBOARD =================
@app.post("/dashboard")
async def dashboard(data: dict):
    return generate_dashboard(data)

@app.get("/dashboard")
def dashboard(user=Depends(get_current_user)):
    return {"message": f"Welcome {user}"}