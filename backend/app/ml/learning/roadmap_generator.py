def generate_learning_roadmap(weaknesses: list, missing_skills: list, domain: str = ""):
    roadmap = []
    
    # Combine weaknesses and missing skills
    combined_areas = list(set(weaknesses + missing_skills))
    
    if not combined_areas:
        roadmap.append({
            "skill": f"General {domain} System Design" if domain else "General System Design",
            "level": "Intermediate",
            "steps": [
                "Review system architecture patterns.",
                "Study scalability principles.",
                "Practice system design mock interviews."
            ],
            "resources": [
                "https://github.com/donnemartin/system-design-primer"
            ]
        })
        return roadmap

    for i, area in enumerate(combined_areas):
        level = "Beginner" if i % 2 == 0 else "Intermediate"
        roadmap.append({
            "skill": area,
            "level": level,
            "steps": [
                f"Learn basics of {area}",
                f"Implement simple models or projects using {area}",
                f"Study advanced {area} concepts and optimizations"
            ],
            "resources": [
                f"https://www.youtube.com/results?search_query={area.replace(' ', '+')}+tutorial",
                f"https://www.google.com/search?q={area.replace(' ', '+')}+documentation"
            ]
        })

    return roadmap
