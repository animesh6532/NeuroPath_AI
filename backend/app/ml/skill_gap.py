from app.ml.skill_data import SKILL_DATA


def find_skill_gap(user_skills, top_career):

    required_skills = SKILL_DATA.get(top_career, [])

    missing_skills = []

    for skill in required_skills:
        if skill.lower() not in [s.lower() for s in user_skills]:
            missing_skills.append(skill)

    return missing_skills[:5]
