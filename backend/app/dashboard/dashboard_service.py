def generate_dashboard(data):

    return {
        "resume_score": data.get("resume_score"),
        "interview_score": data.get("interview_score"),
        "placement_score": data.get("placement_score"),
        "weak_areas": data.get("weak_areas"),
        "progress": data.get("progress", [])
    }
