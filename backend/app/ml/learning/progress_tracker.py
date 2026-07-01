def generate_roadmap(missing_skills):

    roadmap = []

    for skill in missing_skills:
        roadmap.append({
            "skill": skill,
            "steps": [
                f"Learn basics of {skill}",
                f"Practice projects in {skill}",
                f"Master advanced concepts of {skill}"
            ]
        })

    return roadmap
