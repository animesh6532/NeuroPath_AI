def generate_questions_from_skills(skills: list, limit: int = 5):
    questions = []

    for skill in skills[:limit]:
        questions.append(f"Explain {skill} in detail.")
        questions.append(f"What are real-world applications of {skill}?")
        questions.append(f"What are common interview questions related to {skill}?")

    # Remove duplicates while preserving order
    seen = set()
    unique_questions = []

    for q in questions:
        if q not in seen:
            seen.add(q)
            unique_questions.append(q)

    return unique_questions[:5]