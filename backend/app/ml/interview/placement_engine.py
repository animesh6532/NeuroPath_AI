def predict_placement_result(interview_result: dict, skills: list):
    interview_score = interview_result.get("score", 0)
    skill_factor = min(100, len(skills) * 10)

    placement_score = int(
        interview_score * 0.7 +
        skill_factor * 0.3
    )

    if placement_score >= 80:
        label = "High"
    elif placement_score >= 60:
        label = "Moderate"
    else:
        label = "Low"

    return {
        "placement_prediction": placement_score,
        "placement_label": label
    }