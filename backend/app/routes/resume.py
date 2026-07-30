import os
import shutil
from fastapi import APIRouter, UploadFile, File
from pdfminer.high_level import extract_text

from backend.app.services.resume_parser import parse_resume
from backend.app.services.matching_engine import match_resume_to_careers
from backend.app.config.config import settings

router = APIRouter(tags=["Resume Analysis"])

@router.post("/analyze-resume")
async def analyze_resume(file: UploadFile = File(...)):
    # Use config-defined UPLOAD_DIR
    upload_dir = settings.UPLOAD_DIR
    os.makedirs(upload_dir, exist_ok=True)
    
    file_location = os.path.join(upload_dir, f"temp_{file.filename}")
    try:
        with open(file_location, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        resume_text = extract_text(file_location)
        parsed_profile = parse_resume(resume_text)
        result = match_resume_to_careers(parsed_profile)

        return {"success": True, "message": "Resume analyzed successfully", "data": result}
    except Exception as e:
        return {"success": False, "message": str(e), "data": None}
    finally:
        if os.path.exists(file_location):
            try:
                os.remove(file_location)
            except Exception:
                pass
