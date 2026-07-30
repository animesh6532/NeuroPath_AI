from fastapi import APIRouter, UploadFile, File, Query
from pydantic import BaseModel
from typing import Optional
import logging
from backend.app.proctoring.face_monitor import analyze_frame
from backend.app.config.config import settings

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/proctoring", tags=["Proctoring"])

class ProctoringAnalysisResult(BaseModel):
    face_detected: bool
    face_count: int
    multiple_faces: bool
    face_confidence: float
    tracking_confidence: float
    landmark_confidence: float
    face_centered: bool
    good_lighting: bool
    brightness: float
    face_size: float
    look_away: bool
    yaw: float
    pitch: float
    roll: float
    warning: Optional[str] = None

@router.get("/config")
async def get_proctoring_config():
    """Returns the current proctoring configurations and thresholds to the frontend."""
    return {
        "detection_threshold": settings.PROCTORING_DETECTION_THRESHOLD,
        "frame_rate_ms": settings.PROCTORING_FRAME_RATE_MS,
        "warning_timeout_s": settings.PROCTORING_WARNING_TIMEOUT_S,
        "pause_timeout_s": settings.PROCTORING_PAUSE_TIMEOUT_S,
        "lighting_min": settings.PROCTORING_LIGHTING_MIN,
        "lighting_max": settings.PROCTORING_LIGHTING_MAX,
    }

@router.post("/analyze-frame", response_model=ProctoringAnalysisResult)
async def analyze_frame_route(
    file: UploadFile = File(...),
    session_id: str = Query(None, description="The active interview session ID")
):
    frame_bytes = await file.read()
    result = analyze_frame(frame_bytes, session_id=session_id)
    
    # Dev-mode logging of types (Phase 6)
    if settings.ENV == "development":
        logger.info("=== Proctoring Analysis Result Type Inspection ===")
        supported_types = (bool, int, float, str, type(None), list, dict)
        for key, value in result.items():
            val_type = type(value)
            is_supported = isinstance(value, supported_types)
            logger.info(f"Field: {key} | Type: {val_type.__name__} | Value: {value} | Supported: {is_supported}")
            if not is_supported:
                logger.error(f"UNSUPPORTED TYPE DETECTED: Field '{key}' has type '{val_type.__name__}' which is not standard JSON serializable.")
        logger.info("==================================================")
        
    return result
