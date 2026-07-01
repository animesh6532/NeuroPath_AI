def explain_career(skills, top_career):

    if not skills:
        return "Not enough data to explain career."

    skill_text = ", ".join(skills[:5])

    explanation = f"""
Based on your skills in {skill_text}, you are well aligned with the role of {top_career}.
These skills are commonly required in this domain and indicate strong potential.
"""

    return explanation.strip()
