from fastapi import FastAPI, UploadFile, File, Depends
import shutil
import os

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

    file_location = f"temp_{file.filename}"

    with open(file_location, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    resume_text = extract_text(file_location)

    skills = extract_skills(resume_text)
    projects = extract_projects(resume_text)
    experience = extract_experience(resume_text)

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

# ================= GENERATE INTERVIEW =================
@app.post("/generate-interview")
async def generate_interview(data: dict):
    skills = data.get("skills", [])
    questions = generate_questions_from_skills(skills)

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
        "score": results.get("score", 0),
        "confidence": results.get("confidence_score", 0),
        "weaknesses": weak,
        "full_results": results
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
@app.post("/generate-roadmap")
async def generate_roadmap(data: dict):

    weaknesses = data.get("weaknesses", [])
    missing_skills = data.get("missing_skills", [])
    domain = data.get("domain", "")

    roadmap = generate_learning_roadmap(weaknesses, missing_skills, domain)
    return roadmap

# ================= DAILY CHALLENGE =================
@app.get("/daily-challenge")
async def daily_challenge():
    challenges = get_daily_challenges()
    return {
        "challenges": challenges
    }

# ================= APTITUDE TEST =================
@app.get("/aptitude-test")
async def aptitude_test():
    questions = generate_aptitude_test(20)
    # Don't send correct_answer to frontend for security, but since instructions say
    # "return each question: {question, options[], correct_answer}", I will include it.
    # In a real system, the frontend shouldn't know the answer, but evaluating on backend is better.
    # Since POST /submit-aptitude sends answers and expects score, we'll keep the backend eval.
    return {"questions": questions}

@app.post("/submit-aptitude")
async def submit_aptitude(data: dict):
    answers = data.get("answers", [])
    result = evaluate_aptitude_test(answers)
    return result

# ================= DASHBOARD =================
@app.post("/dashboard")
async def dashboard(data: dict):
    return generate_dashboard(data)

@app.get("/dashboard")
def dashboard(user=Depends(get_current_user)):
    return {"message": f"Welcome {user}"}