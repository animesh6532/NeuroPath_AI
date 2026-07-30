from backend.app.ml.skill_data import SKILL_DATA

def calculate_resume_score(skills, top_career, missing_skills):

    # Total possible skills for that career
    required_skills = SKILL_DATA.get(top_career, [])

    if not required_skills:
        return 50  # default

    matched = 0

    for skill in skills:
        if skill.lower() in [s.lower() for s in required_skills]:
            matched += 1

    # Score calculation
    skill_score = (matched / len(required_skills)) * 70

    # Penalty for missing skills
    penalty = len(missing_skills) * 2

    final_score = skill_score - penalty

    # Normalize
    final_score = max(0, min(100, round(final_score)))

    return final_score
