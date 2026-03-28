from backend.app.ml.interview.question_generator import generate_questions_from_skills
from backend.app.ml.interview.interview_engine import evaluate_interview_answers
from backend.app.ml.placement.placement_engine import predict_placement_result
from backend.app.ml.learning.roadmap_generator import generate_learning_roadmap


def start_interview_from_resume(skills: list):
    questions = generate_questions_from_skills(skills)
    return {
        "skills": skills,
        "questions": questions
    }


def submit_interview_answers(answers: list, skills: list):
    return evaluate_interview_answers(answers, skills)


def analyze_placement(interview_result: dict, skills: list):
    return predict_placement_result(interview_result, skills)


def build_learning_roadmap(skills: list, weaknesses: list):
    return generate_learning_roadmap(skills, weaknesses)