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
        return {"topics": roadmap}

    for i, area in enumerate(combined_areas):
        level = "Beginner" if i % 2 == 0 else "Intermediate"
        roadmap.append({
            "skill": area,
            "level": level,
            "steps": [
                f"Understand the core concepts of {area} architecture",
                f"Build a small project implementing {area} patterns",
                f"Practice debugging and optimizing {area} workflows"
            ],
            "resources": [
                f"https://www.coursera.org/search?query={area.replace(' ', '%20')}",
                f"https://github.com/search?q={area.replace(' ', '+')}+tutorial",
                f"https://www.freecodecamp.org/news/search/?q={area.replace(' ', '%20')}"
            ]
        })

    return {"topics": roadmap}
