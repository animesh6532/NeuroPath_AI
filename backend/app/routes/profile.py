import json
import os
from fastapi import APIRouter

PROFILE_FILE = "user_profiles.json"

def _load_profiles() -> dict:
    try:
        if os.path.exists(PROFILE_FILE):
            with open(PROFILE_FILE, "r") as f:
                content = f.read().strip()
                if content:
                    return json.loads(content)
    except Exception as e:
        print(f"[profile] load error: {e}")
    return {}

def _save_profiles(profiles: dict):
    try:
        with open(PROFILE_FILE, "w") as f:
            json.dump(profiles, f, indent=2)
    except Exception as e:
        print(f"[profile] save error: {e}")

def _build_safe_profile(raw: dict, email: str = "") -> dict:
    """Return a guaranteed-safe profile dict — no missing keys, no None values."""
    custom = raw.get("custom_skills", [])
    if not isinstance(custom, list):
        custom = []
    
    languages = raw.get("languages", [])
    if not isinstance(languages, list):
        languages = []
        
    soft_skills = raw.get("soft_skills", [])
    if not isinstance(soft_skills, list):
        soft_skills = []
        
    education = raw.get("education", [])
    if not isinstance(education, list):
        education = []
        
    achievements = raw.get("achievements", [])
    if not isinstance(achievements, list):
        achievements = []
        
    projects = raw.get("projects", [])
    if not isinstance(projects, list):
        projects = []
        
    certifications = raw.get("certifications", [])
    if not isinstance(certifications, list):
        certifications = []
        
    work_exp = raw.get("work_experience", [])
    if not isinstance(work_exp, list):
        work_exp = []
        
    goals = raw.get("career_goals", {})
    if not isinstance(goals, dict):
        goals = {}
        
    settings = raw.get("settings", {})
    if not isinstance(settings, dict):
        settings = {}
        
    return {
        "name":                 str(raw.get("name",          "") or ""),
        "bio":                  str(raw.get("bio",           "") or ""),
        "profile_image":        str(raw.get("profile_image", "") or ""),
        "cover_image":          str(raw.get("cover_image",   "") or ""),
        "custom_skills":        [str(s) for s in custom if s],
        "email":                str(raw.get("email", email) or email),
        
        # New profile fields
        "career_title":         str(raw.get("career_title", "") or ""),
        "current_status":       str(raw.get("current_status", "") or ""),
        "current_org":          str(raw.get("current_org", "") or ""),
        "github":               str(raw.get("github", "") or ""),
        "linkedin":             str(raw.get("linkedin", "") or ""),
        "portfolio":            str(raw.get("portfolio", "") or ""),
        "career_objective":     str(raw.get("career_objective", "") or ""),
        "interests":            str(raw.get("interests", "") or ""),
        "passion":              str(raw.get("passion", "") or ""),
        "languages":            [str(l) for l in languages if l],
        "soft_skills":          [str(s) for s in soft_skills if s],
        "education":            education,
        "achievements":         [str(a) for a in achievements if a],
        "projects":             projects,
        "certifications":       certifications,
        "work_experience":      work_exp,
        "career_goals":         {
            "target_role":      str(goals.get("target_role", "") or ""),
            "dream_company":    str(goals.get("dream_company", "") or ""),
            "preferred_domain": str(goals.get("preferred_domain", "") or ""),
            "learning_focus":   str(goals.get("learning_focus", "") or "")
        },
        "settings":             {
            "theme":            str(settings.get("theme", "light") or "light"),
            "notifications":    bool(settings.get("notifications", True)),
            "privacy":          str(settings.get("privacy", "public") or "public")
        },
        "verified":             bool(raw.get("verified", False))
    }

router = APIRouter(tags=["User Profile"])

@router.get("/profile/{user_id}")
async def get_profile_by_id(user_id: str):
    """Fetch profile by email / user_id."""
    try:
        profiles = _load_profiles()
        raw      = profiles.get(user_id, {})
        return {"success": True, "message": "Profile fetched", "data": _build_safe_profile(raw, user_id)}
    except Exception as e:
        return {"success": False, "message": str(e), "data": None}

@router.get("/get-profile")
async def get_profile_legacy():
    """Legacy single-profile endpoint — returns first stored profile."""
    try:
        profiles = _load_profiles()
        raw      = next(iter(profiles.values()), {})
        return {"success": True, "message": "Profile fetched", "data": _build_safe_profile(raw)}
    except Exception as e:
        return {"success": False, "message": str(e), "data": None}

@router.post("/profile/update")
async def update_profile(data: dict):
    """
    Save profile keyed by email.
    Always returns the FULL saved profile object.
    """
    try:
        email    = str(data.get("email", "") or "default").strip()
        profiles = _load_profiles()
        existing = profiles.get(email, {})
        merged   = {**existing, **data}
        safe     = _build_safe_profile(merged, email)
        profiles[email] = safe
        _save_profiles(profiles)
        print(f"[profile] saved for '{email}': {list(safe.keys())}")
        return {"success": True, "message": "Profile updated", "data": safe}
    except Exception as e:
        print(f"[profile] update error: {e}")
        return {"success": False, "message": str(e), "data": None}

@router.post("/update-profile")
async def update_profile_legacy(data: dict):
    """Legacy endpoint — same logic as /profile/update."""
    return await update_profile(data)
