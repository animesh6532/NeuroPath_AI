import random
import json
from datetime import datetime
from sqlalchemy.orm import Session
from backend.app.db.models import AptitudeQuestion, AptitudeAttempt

CATEGORY_MAP = {
    "Quantitative Aptitude": "Quantitative Aptitude",
    "Logical Reasoning": "Logical Reasoning",
    "Verbal Ability": "Verbal Ability",
    "Analytical Thinking": "Analytical Thinking",
    "Data Interpretation": "Data Interpretation",
    "Critical Thinking": "Critical Thinking",
    "Decision Making": "Decision Making",
    "Pattern Recognition": "Pattern Recognition",
    "General Intelligence": "General Intelligence",
    "Situational Judgement": "Situational Judgement"
}

def get_personalized_weights(domain: str) -> dict:
    domain_lower = (domain or "General").lower()
    
    # Baseline defaults (10% each)
    weights = {cat: 0.1 for cat in CATEGORY_MAP.keys()}
    
    # Software / Engineering / Tech Roles
    if any(kw in domain_lower for kw in ["software", "tech", "engineer", "developer", "coding", "computer", "cyber", "data", "system"]):
        weights = {
            "Quantitative Aptitude": 0.30,
            "Logical Reasoning": 0.30,
            "Analytical Thinking": 0.10,
            "Pattern Recognition": 0.10,
            "General Intelligence": 0.10,
            "Situational Judgement": 0.05,
            "Decision Making": 0.05,
            "Verbal Ability": 0.0,
            "Data Interpretation": 0.0,
            "Critical Thinking": 0.0
        }
    # HR / Human Resources / Management
    elif any(kw in domain_lower for kw in ["hr", "human resource", "recruitment", "talent", "people", "management", "leader", "admin"]):
        weights = {
            "Verbal Ability": 0.30,
            "Situational Judgement": 0.30,
            "Decision Making": 0.20,
            "Logical Reasoning": 0.10,
            "Critical Thinking": 0.10,
            "Quantitative Aptitude": 0.0,
            "Analytical Thinking": 0.0,
            "Data Interpretation": 0.0,
            "Pattern Recognition": 0.0,
            "General Intelligence": 0.0
        }
    # Finance / Accounting / Banking
    elif any(kw in domain_lower for kw in ["finance", "account", "bank", "invest", "tax", "audit", "wealth"]):
        weights = {
            "Quantitative Aptitude": 0.30,
            "Data Interpretation": 0.30,
            "Logical Reasoning": 0.20,
            "Analytical Thinking": 0.10,
            "Decision Making": 0.10,
            "Verbal Ability": 0.0,
            "Critical Thinking": 0.0,
            "Pattern Recognition": 0.0,
            "General Intelligence": 0.0,
            "Situational Judgement": 0.0
        }
    # Teaching / Education
    elif any(kw in domain_lower for kw in ["teach", "edu", "school", "prof", "lecture", "train", "pedagogy"]):
        weights = {
            "Verbal Ability": 0.35,
            "Logical Reasoning": 0.25,
            "Situational Judgement": 0.20,
            "General Intelligence": 0.20,
            "Quantitative Aptitude": 0.0,
            "Analytical Thinking": 0.0,
            "Data Interpretation": 0.0,
            "Critical Thinking": 0.0,
            "Decision Making": 0.0,
            "Pattern Recognition": 0.0
        }
        
    return weights

def generate_aptitude_test(db: Session, email: str, domain: str = "General", num_questions: int = 20) -> list:
    """
    Generates a personalized cognitive aptitude test.
    - Balances by Difficulty: 20% Easy, 40% Medium, 30% Hard, 10% Expert
    - Balances by Category: Personalized weights based on career domain
    - Prevents repetition: Queries history to avoid showing already seen questions.
    """
    # 1. Target counts by difficulty
    diff_targets = {
        "Easy": max(1, int(num_questions * 0.20)),
        "Medium": max(1, int(num_questions * 0.40)),
        "Hard": max(1, int(num_questions * 0.30)),
        "Expert": max(1, int(num_questions * 0.10))
    }
    # Adjust total count to be exactly num_questions
    current_sum = sum(diff_targets.values())
    if current_sum != num_questions:
        diff_targets["Medium"] += (num_questions - current_sum)

    # 2. Get seen question IDs for this user
    seen_qids = set()
    if email:
        attempts = db.query(AptitudeAttempt).filter(AptitudeAttempt.email == email).all()
        for attempt in attempts:
            try:
                qids = json.loads(attempt.question_ids)
                if isinstance(qids, list):
                    seen_qids.update(qids)
            except Exception as e:
                print(f"[Aptitude Generator] Parse attempt seen IDs error: {e}")

    # 3. Determine category weights
    cat_weights = get_personalized_weights(domain)
    active_categories = [cat for cat, w in cat_weights.items() if w > 0]
    if not active_categories:
        active_categories = list(CATEGORY_MAP.keys())

    selected_questions = []

    # For each difficulty, select target questions
    for diff, target_count in diff_targets.items():
        # Query all questions of this difficulty
        q_pool = db.query(AptitudeQuestion).filter(AptitudeQuestion.difficulty == diff).all()
        if not q_pool:
            # Fallback to any difficulty if this difficulty is empty
            q_pool = db.query(AptitudeQuestion).all()
        
        # Separate into unseen and seen
        unseen_q = [q for q in q_pool if q.id not in seen_qids]
        
        # If unseen is exhausted, reuse seen questions
        pool_to_use = unseen_q if len(unseen_q) >= target_count else q_pool
        if not pool_to_use:
            continue

        # Distribute selection across active categories based on weights
        diff_selected = []
        
        # Group pool by category
        by_category = {cat: [] for cat in CATEGORY_MAP.keys()}
        for q in pool_to_use:
            if q.category in by_category:
                by_category[q.category].append(q)

        # Draw questions proportionally
        attempts_draw = 0
        while len(diff_selected) < target_count and attempts_draw < 100:
            attempts_draw += 1
            for cat in active_categories:
                if len(diff_selected) >= target_count:
                    break
                
                # Check weight probability
                weight = cat_weights.get(cat, 0.1)
                if random.random() <= weight or attempts_draw > 5:
                    cat_list = by_category.get(cat, [])
                    if cat_list:
                        chosen = random.choice(cat_list)
                        if chosen not in diff_selected:
                            diff_selected.append(chosen)
                            cat_list.remove(chosen)

        # Fallback: if we still need questions, pull from any category in pool
        if len(diff_selected) < target_count:
            flat_pool = [q for cat, list_q in by_category.items() for q in list_q]
            random.shuffle(flat_pool)
            for q in flat_pool:
                if len(diff_selected) >= target_count:
                    break
                if q not in diff_selected:
                    diff_selected.append(q)

        selected_questions.extend(diff_selected)

    # Return structured questions
    result = []
    for q in selected_questions:
        try:
            opts = json.loads(q.options) if q.options else []
        except:
            opts = []
        result.append({
            "id": q.id,
            "question": q.question_text,
            "category": q.category,
            "topic": q.topic,
            "subtopic": q.subtopic,
            "difficulty": q.difficulty,
            "options": opts,
            "correct_answer": q.correct_answer,
            "explanation": q.explanation
        })

    random.shuffle(result)
    return result

def evaluate_aptitude_test(db: Session, email: str, user_answers: list, difficulty_mix: str = "Personalized", category_mix: str = "Personalized", time_taken: int = 1200) -> dict:
    """
    Evaluates user answers, tracks concepts, and saves an attempt history record.
    """
    score = 0
    total = len(user_answers)
    
    wrong_concepts = set()
    weak_concepts = set()
    
    question_ids = []
    answers_submitted = {}

    for ans_obj in user_answers:
        q_id = ans_obj.get("id")
        q_text = ans_obj.get("question")
        user_ans = ans_obj.get("answer")
        
        # Query question
        original_q = None
        if q_id:
            original_q = db.query(AptitudeQuestion).filter(AptitudeQuestion.id == q_id).first()
        if not original_q and q_text:
            original_q = db.query(AptitudeQuestion).filter(AptitudeQuestion.question_text == q_text).first()
            
        if original_q:
            question_ids.append(original_q.id)
            answers_submitted[str(original_q.id)] = user_ans
            
            if original_q.correct_answer == user_ans:
                score += 1
            else:
                wrong_concepts.add(original_q.topic)
                weak_concepts.add(original_q.category)
        else:
            # Fallback if question was not in the new seeder pool (e.g. legacy static fallback)
            # Find in legacy hardcoded list if present
            pass

    accuracy = round((score / total) * 100, 2) if total > 0 else 0.0

    # Save attempt in database
    if email:
        attempt = AptitudeAttempt(
            email=email,
            question_ids=json.dumps(question_ids),
            answers_submitted=json.dumps(answers_submitted),
            timestamp=datetime.utcnow().isoformat(),
            difficulty=difficulty_mix,
            category=category_mix,
            score=score,
            total=total,
            time_taken=time_taken,
            wrong_concepts=json.dumps(list(wrong_concepts)),
            weak_concepts=json.dumps(list(weak_concepts))
        )
        db.add(attempt)
        db.commit()
        print(f"[Aptitude Evaluator] Saved attempt for '{email}' with score {score}/{total}.")

    return {
        "score": score,
        "total": total,
        "accuracy": accuracy,
        "wrong_concepts": list(wrong_concepts),
        "weak_concepts": list(weak_concepts)
    }
