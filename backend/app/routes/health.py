from fastapi import APIRouter
from backend.app.database.database import engine
from sqlalchemy import text
import time

router = APIRouter(prefix="/api", tags=["Health & Status"])

START_TIME = time.time()

@router.get("/health")
def health_check():
    db_status = "unhealthy"
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        db_status = "healthy"
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"

    return {
        "status": "healthy" if db_status == "healthy" else "degraded",
        "version": "1.1.0",
        "uptime": f"{round(time.time() - START_TIME, 2)}s",
        "database": db_status
    }

@router.get("/version")
def version():
    return {"version": "1.1.0"}

@router.get("/status")
def status():
    return {
        "status": "online",
        "timestamp": time.time()
    }
