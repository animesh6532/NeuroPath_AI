# backend/app/ml/placement/scoring.py

def calculate_base_score(resume_score: float, interview_score: float):
    """
    Combines resume and interview scores
    """

    resume_weight = 0.4
    interview_weight = 0.6

    return (resume_score * resume_weight) + (interview_score * interview_weight)


def apply_skill_penalty(base_score: float, missing_skills: list):
    """
    Deduct points for missing skills
    """

    penalty_per_skill = 2

    penalty = len(missing_skills) * penalty_per_skill

    return base_score - penalty


def normalize_score(score: float):
    """
    Keep score between 0–100
    """

    return max(0, min(100, round(score, 2)))


def get_readiness_level(score: float):
    """
    Convert score to human-readable level
    """

    if score >= 80:
        return "High (Ready for placement)"
    elif score >= 60:
        return "Medium (Needs improvement)"
    else:
        return "Low (Not ready)"
