def cheating_risk(events: dict):
    score = 0

    score += events.get("tab_switches", 0) * 3
    score += events.get("no_face_count", 0) * 4
    score += events.get("multiple_faces_count", 0) * 6

    if score >= 12:
        level = "high"
    elif score >= 6:
        level = "medium"
    else:
        level = "low"

    return {
        "risk_score": score,
        "risk_level": level
    }