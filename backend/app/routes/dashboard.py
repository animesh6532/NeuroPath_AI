from fastapi import APIRouter, Depends
from backend.app.dependencies.auth import get_current_user
from backend.app.dashboard.dashboard_service import generate_dashboard

router = APIRouter(tags=["User Dashboard"])

@router.post("/dashboard")
async def dashboard_post(data: dict):
    try:
        res = generate_dashboard(data)
        return {"success": True, "message": "Dashboard data fetched", "data": res}
    except Exception as e:
        return {"success": False, "message": str(e), "data": None}

@router.get("/dashboard")
def dashboard_get(user=Depends(get_current_user)):
    return {"success": True, "message": f"Welcome {user}", "data": None}
