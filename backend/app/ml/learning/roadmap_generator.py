def generate_learning_roadmap(skills: list, weaknesses: list):
    roadmap = []

    for weakness in weaknesses:
        roadmap.append({
            "title": weakness,
            "action": f"Improve by practicing concepts and interview questions related to {weakness.lower()}."
        })

    for skill in skills[:3]:
        roadmap.append({
            "title": f"Advance {skill}",
            "action": f"Build projects and solve interview problems using {skill}."
        })

    return roadmap
