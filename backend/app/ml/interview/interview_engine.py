def score_single_answer(answer: str, skills: list):
    answer_lower = answer.lower()

    matched_skills = sum(1 for skill in skills if skill.lower() in answer_lower)
    technical_score = min(100, matched_skills * 12 + 40)

    word_count = len(answer.split())

    if word_count < 10:
        communication_score = 40
        confidence_score = 35
    elif word_count < 25:
        communication_score = 60
        confidence_score = 55
    elif word_count < 50:
        communication_score = 78
        confidence_score = 72
    else:
        communication_score = 90
        confidence_score = 85

    overall = int(
        technical_score * 0.5 +
        communication_score * 0.3 +
        confidence_score * 0.2
    )

    return {
        "technical_score": technical_score,
        "communication_score": communication_score,
        "confidence_score": confidence_score,
        "overall_score": overall
    }


def evaluate_interview_answers(answers: list, skills: list):
    if not answers:
        return {
            "score": 0,
            "technical_score": 0,
            "communication_score": 0,
            "confidence_score": 0,
            "strengths": [],
            "weaknesses": ["No answers submitted"],
            "missing_skills": skills[:5]
        }

    technical_scores = []
    communication_scores = []
    confidence_scores = []

    for item in answers:
        answer_text = item.get("answer", "")
        result = score_single_answer(answer_text, skills)

        technical_scores.append(result["technical_score"])
        communication_scores.append(result["communication_score"])
        confidence_scores.append(result["confidence_score"])

    technical_avg = int(sum(technical_scores) / len(technical_scores))
    communication_avg = int(sum(communication_scores) / len(communication_scores))
    confidence_avg = int(sum(confidence_scores) / len(confidence_scores))

    final_score = int(
        technical_avg * 0.5 +
        communication_avg * 0.3 +
        confidence_avg * 0.2
    )

    strengths = []
    weaknesses = []
    missing_skills = []

    if technical_avg >= 70:
        strengths.append("Good technical understanding")
    else:
        weaknesses.append("Technical answers need more depth")

    if communication_avg >= 70:
        strengths.append("Clear communication")
    else:
        weaknesses.append("Need better structured explanations")

    if confidence_avg >= 70:
        strengths.append("Shows reasonable confidence")
    else:
        weaknesses.append("Answers appear too short or uncertain")

    if technical_avg < 75:
        missing_skills = skills[:5]

    return {
        "score": final_score,
        "technical_score": technical_avg,
        "communication_score": communication_avg,
        "confidence_score": confidence_avg,
        "strengths": strengths,
        "weaknesses": weaknesses,
        "missing_skills": missing_skills
    }