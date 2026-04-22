from fastapi import APIRouter, UploadFile, File
from backend.app.proctoring.face_monitor import analyze_frame

router = APIRouter(prefix="/proctoring", tags=["Proctoring"])


@router.post("/analyze-frame")
async def analyze_frame_route(file: UploadFile = File(...)):
    frame_bytes = await file.read()
    result = analyze_frame(frame_bytes)
    return result