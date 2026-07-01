import random
import json
from sqlalchemy.orm import Session
from app.db.models import CodingProblem, CodingAttempt
from app.ml.placement.placement_engine import is_technical_domain

CAREER_TOPICS = {
    "software": ["Algorithms", "Arrays", "Stacks", "Sorting"],
    "tech": ["Algorithms", "Arrays", "Stacks", "Sorting"],
    "ai": ["Machine Learning", "Linear Algebra"],
    "data scientist": ["Data Science", "Statistics"],
    "data science": ["Data Science", "Statistics"],
    "frontend": ["Frontend", "JavaScript", "DOM"],
    "backend": ["Backend", "API Development"],
    "devops": ["DevOps", "Networking"]
}

def get_career_topics(domain: str) -> list:
    domain_lower = (domain or "General").lower()
    
    for key, topics in CAREER_TOPICS.items():
        if key in domain_lower:
            return topics
            
    # Default fallback tech topics if domain is technical but not specifically matched
    return ["Algorithms", "Arrays"]

def select_daily_challenges(db: Session, email: str, domain: str = "General") -> dict:
    """
    Selects 3 coding challenges personalized for the user.
    - Non-technical domains skip coding completely.
    - Excludes previously solved/Accepted questions.
    - Personalizes by career tracks.
    - Balances difficulty dynamically: Easy, Medium, Hard.
    """
    is_tech = is_technical_domain(domain)
    if not is_tech:
        return {
            "skip": True,
            "message": "Coding challenges are skipped for non-technical career paths.",
            "challenges": []
        }

    # Get target topics
    topics = get_career_topics(domain)

    # 1. Fetch solved problem IDs for this user
    solved_pids = set()
    if email:
        solved_attempts = db.query(CodingAttempt).filter(
            CodingAttempt.email == email,
            CodingAttempt.status == "Accepted"
        ).all()
        for att in solved_attempts:
            solved_pids.add(att.problem_id)

    # 2. Fetch history of attempts to calculate recent accuracy and determine adaptive difficulty
    attempts = db.query(CodingAttempt).filter(CodingAttempt.email == email).all()
    accuracy = 1.0
    if attempts:
        passed = sum(1 for a in attempts if a.status == "Accepted")
        accuracy = passed / len(attempts)

    # Adaptive difficulty ratio based on success rate
    if accuracy >= 0.8:
        # High competency: 1 Medium, 2 Hard
        diff_targets = {"Easy": 0, "Medium": 1, "Hard": 2}
    elif accuracy >= 0.5:
        # Medium competency: 1 Easy, 1 Medium, 1 Hard
        diff_targets = {"Easy": 1, "Medium": 1, "Hard": 1}
    else:
        # Beginner competency: 2 Easy, 1 Medium
        diff_targets = {"Easy": 2, "Medium": 1, "Hard": 0}

    selected = []
    
    # Query coding problems matching the topic
    # If the database is not seeded or has fewer questions, we fall back to any topic
    for diff, target_count in diff_targets.items():
        if target_count <= 0:
            continue
            
        # Query pool of this difficulty and career topics
        q_pool = db.query(CodingProblem).filter(
            CodingProblem.difficulty == diff,
            CodingProblem.topic.in_(topics)
        ).all()
        
        # Fallback if no problems found for specific topic
        if not q_pool:
            q_pool = db.query(CodingProblem).filter(CodingProblem.difficulty == diff).all()
            
        if not q_pool:
            q_pool = db.query(CodingProblem).all()

        if not q_pool:
            continue

        # Separate unseen and seen
        unseen = [q for q in q_pool if q.id not in solved_pids]
        pool_to_draw = unseen if len(unseen) >= target_count else q_pool
        
        # Draw random unique samples
        drawn = random.sample(pool_to_draw, min(target_count, len(pool_to_draw)))
        selected.extend(drawn)

    # Map to frontend model schema
    challenges = []
    for q in selected:
        try:
            constraints = json.loads(q.constraints) if q.constraints else []
            examples = json.loads(q.examples) if q.examples else []
            hints = json.loads(q.hints) if q.hints else []
            starter = json.loads(q.starter_code) if q.starter_code else {}
            tests = json.loads(q.test_cases) if q.test_cases else []
            tags = json.loads(q.tags) if q.tags else []
            companies = json.loads(q.companies) if q.companies else []
        except Exception as e:
            print(f"[Coding Engine] JSON parse problem error: {e}")
            constraints, examples, hints, starter, tests, tags, companies = [], [], [], {}, [], [], []

        challenges.append({
            "id": q.id,
            "title": q.title,
            "description": q.description,
            "difficulty": q.difficulty,
            "topic": q.topic,
            "subtopic": q.subtopic,
            "constraints": constraints,
            "examples": examples,
            "hints": hints,
            "starter_code": starter,
            "test_cases": tests,
            "tags": tags,
            "companies": companies,
            "complexity": q.complexity
        })

    return {
        "skip": False,
        "message": "Challenges compiled.",
        "challenges": challenges
    }
