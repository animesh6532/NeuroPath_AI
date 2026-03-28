from fastapi import APIRouter, UploadFile, File
import shutil
import os

from backend.app.proctoring.face_monitor import analyze_frame
from backend.app.proctoring.behavior_rules import cheating_risk

router = APIRouter(prefix="/proctoring", tags=["Proctoring"])


@router.post("/analyze-frame")
async def analyze_frame_route(file: UploadFile = File(...)):
    temp_path = f"temp_{file.filename}"

    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    result = analyze_frame(temp_path)

    if os.path.exists(temp_path):
        os.remove(temp_path)

    return result


@router.post("/analyze-events")
async def analyze_events(data: dict):
    return cheating_risk(data)