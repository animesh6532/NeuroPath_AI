import json
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.app.database.database import get_db
from backend.app.dependencies.auth import get_current_user
from backend.app.ml.placement.placement_engine import predict_placement_result
from backend.app.ml.learning.roadmap_generator import generate_learning_roadmap

router = APIRouter(tags=["Placement & Learning Roadmap"])

@router.post("/placement-analysis")
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
        return {"success": True, "message": "Placement analyzed", "data": result}
    except Exception as e:
        return {"success": False, "message": str(e), "data": None}

@router.post("/generate-roadmap")
async def generate_roadmap(data: dict, user=Depends(get_current_user), db: Session = Depends(get_db)):
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
        return {"success": True, "message": "Roadmap generated", "data": roadmap}
    except Exception as e:
        import traceback
        traceback.print_exc()
        return {"success": False, "message": str(e), "data": None}
