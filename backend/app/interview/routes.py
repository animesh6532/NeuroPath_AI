from fastapi import APIRouter, UploadFile, File
import shutil
import os

from backend.app.interview.schemas import (
    InterviewSubmitRequest,
    PlacementAnalysisRequest,
    LearningRoadmapRequest
)

from backend.app.interview.service import (
    generate_questions_from_skills,
    analyze_interview_submission,
    predict_placement,
    build_learning_roadmap
)

# ⚠️ adjust this import if needed
from backend.app.resume.utils import extract_text, extract_skills

# ✅ THIS LINE IS THE MOST IMPORTANT
router = APIRouter(tags=["AI Interview"])


@router.post("/start-ai-interview")
async def start_ai_interview(file: UploadFile = File(...)):
    temp_path = f"temp_{file.filename}"

    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    resume_text = extract_text(temp_path)
    skills = extract_skills(resume_text)
    questions = generate_questions_from_skills(skills)

    if os.path.exists(temp_path):
        os.remove(temp_path)

    return {
        "skills": skills,
        "questions": questions
    }


@router.post("/submit-interview")
async def submit_interview(data: InterviewSubmitRequest):
    answers = [a.dict() for a in data.answers]
    result = analyze_interview_submission(answers, data.skills)

    return result


@router.post("/placement-analysis")
async def placement_analysis(data: PlacementAnalysisRequest):
    return predict_placement(data.interview_result, data.skills)


@router.post("/learning-roadmap")
async def learning_roadmap(data: LearningRoadmapRequest):
    return {
        "roadmap": build_learning_roadmap(data.skills, data.weaknesses)
    }