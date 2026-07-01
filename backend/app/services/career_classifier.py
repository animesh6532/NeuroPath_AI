import re
from app.services.matching_engine import match_resume_to_careers

def classify_career_profile(resume_profile: dict) -> dict:
    """
    Classifies a parsed resume profile into an industry, job family,
    primary role, secondary roles, career level, and confidence score.
    """
    # 1. Retrieve ranked career matches from the matching engine
    match_results = match_resume_to_careers(resume_profile)
    top_careers = match_results.get("top_careers", [])
    
    if not top_careers:
        return {
            "industry": "Technology",
            "job_family": "Software Engineering",
            "primary_role": "Software Developer",
            "secondary_roles": ["Frontend Developer", "Backend Developer"],
            "career_level": "Entry",
            "confidence_score": 0.5
        }
        
    primary_career = top_careers[0]
    secondary_careers = [c["career"] for c in top_careers[1:4]]
    
    industry = primary_career.get("industry", "Technology")
    job_family = primary_career.get("subdomain", "Software Engineering")
    primary_role = primary_career.get("career", "Software Developer")
    confidence_score = float(primary_career.get("score", 70)) / 100.0
    
    # 2. Heuristics to determine Career Level
    # Combine title indicators and total experience length
    experience_list = resume_profile.get("structured_experience", [])
    total_months = 0
    experience_text = ""
    
    # Parse durations (e.g., "June 2021 - Present", "2018 - 2021", etc.)
    for exp in experience_list:
        role = exp.get("role", "").lower()
        responsibilities = " ".join(exp.get("responsibilities", [])).lower()
        experience_text += f" {role} {responsibilities}"
        
        duration = exp.get("duration", "")
        # Try to parse years to estimate months
        years = re.findall(r'\b(19|20)\d{2}\b', duration)
        if len(years) == 2:
            try:
                y1, y2 = int(years[0]), int(years[1])
                total_months += max(12, (y2 - y1) * 12)
            except:
                total_months += 12
        elif len(years) == 1 and any(p in duration.lower() for p in ["present", "current", "now"]):
            try:
                y1 = int(years[0])
                current_year = 2026 # Context local year
                total_months += max(12, (current_year - y1) * 12)
            except:
                total_months += 12
        else:
            total_months += 12 # Fallback to 1 year per experience listing if unparseable
            
    # Calculate years
    total_years = total_months / 12.0
    
    # Title weights
    level = "Entry"
    if total_years >= 8.0 or any(kw in experience_text for kw in ["principal", "director", "head of", "architect", "lead"]):
        level = "Lead"
    elif total_years >= 5.0 or any(kw in experience_text for kw in ["senior", "sr."]):
        level = "Senior"
    elif total_years >= 2.0 or any(kw in experience_text for kw in ["mid", "associate"]):
        level = "Mid"
    else:
        # Check if they have direct manager or lead keywords but less than 8 years
        if any(kw in experience_text for kw in ["manager", "lead"]):
            level = "Mid"
            
    return {
        "industry": industry,
        "job_family": job_family,
        "primary_role": primary_role,
        "secondary_roles": secondary_careers,
        "career_level": level,
        "confidence_score": confidence_score
    }
