def score_single_answer(answer: str, skills: list):
    answer_lower = answer.lower()

    matched_skills = sum(1 for skill in skills if skill.lower() in answer_lower)
    technical_score = min(100, matched_skills * 15 + 30)

    word_count = len(answer.split())

    # Basic NLP/length heuristics for communication and confidence
    if word_count < 10:
        communication_score = 30
        confidence_score = 25
    elif word_count < 25:
        communication_score = 50
        confidence_score = 45
    elif word_count < 50:
        communication_score = 75
        confidence_score = 65
    else:
        communication_score = 85
        confidence_score = 80

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
    if not answers or len(answers) < 3:
        return {
            "score": 0,
            "technical_score": 0,
            "communication_score": 0,
            "confidence_score": 0,
            "strengths": [],
            "weaknesses": ["Not enough answers to evaluate"],
            "missing_skills": skills[:5]
        }

    technical_scores = []
    communication_scores = []
    confidence_scores = []

    valid_answers_count = 0

    for item in answers:
        answer_text = item.get("answer", "")
        # If the user essentially skipped the question
        if len(answer_text.strip()) < 5 or "no answer" in answer_text.lower():
            technical_scores.append(0)
            communication_scores.append(0)
            confidence_scores.append(0)
            continue
            
        valid_answers_count += 1
        result = score_single_answer(answer_text, skills)

        technical_scores.append(result["technical_score"])
        communication_scores.append(result["communication_score"])
        confidence_scores.append(result["confidence_score"])

    # Calculate base averages
    technical_avg = int(sum(technical_scores) / len(answers))
    communication_avg = int(sum(communication_scores) / len(answers))
    
    # Confidence is heavily influenced by completion rate
    completion_rate = valid_answers_count / len(answers)
    base_confidence_avg = sum(confidence_scores) / len(answers)
    confidence_avg = int(base_confidence_avg * completion_rate)

    final_score = int(
        technical_avg * 0.5 +
        communication_avg * 0.3 +
        confidence_avg * 0.2
    )

    # Ensure constraints
    confidence_avg = min(confidence_avg, final_score)
    communication_avg = min(communication_avg, final_score)

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
        weaknesses.append("Answers appear too short, skipped, or uncertain")

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