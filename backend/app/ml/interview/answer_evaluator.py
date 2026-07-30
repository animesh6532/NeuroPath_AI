import json
import re
from sentence_transformers import util

_model = None

def get_model():
    global _model
    if _model is None:
        import os
        os.environ["TRANSFORMERS_OFFLINE"] = "1"
        os.environ["HF_HUB_OFFLINE"] = "1"
        from sentence_transformers import SentenceTransformer
        try:
            _model = SentenceTransformer('all-MiniLM-L6-v2', local_files_only=True)
        except Exception:
            _model = SentenceTransformer('all-MiniLM-L6-v2')
    return _model

def evaluate_candidate_answer(question_text: str, expected_answer: str, rubric_json: str, candidate_answer: str, violations_count: int = 0) -> dict:
    """
    Evaluates a candidate's spoken response against an expected answer and rubric.
    Returns technical, communication, confidence, and overall scores with feedback.
    """
    if not candidate_answer or len(candidate_answer.strip()) < 5 or "no answer" in candidate_answer.lower():
        return {
            "overall_score": 10,
            "technical_score": 10,
            "communication_score": 10,
            "confidence_score": 10,
            "feedback": "Answer was empty or too brief to evaluate.",
            "missed_topics": ["Explain the topic in more depth"]
        }

    # 1. Semantic Similarity
    model = get_model()
    emb_candidate = model.encode(candidate_answer, convert_to_tensor=True)
    emb_expected = model.encode(expected_answer, convert_to_tensor=True)
    similarity = util.cos_sim(emb_candidate, emb_expected).item()
    
    # Calculate base technical score (mapped from similarity range 0.0 - 1.0)
    base_tech = max(20, min(100, int(similarity * 90 + 20)))
    
    # 2. Rubric / Keyphrase Overlap
    rubric_items = []
    try:
        rubric_items = json.loads(rubric_json)
    except:
        # Fallback to splitting standard words
        rubric_items = [w for w in expected_answer.split() if len(w) > 5][:3]
        
    matched_rubrics = []
    missed_topics = []
    
    candidate_lower = candidate_answer.lower()
    for item in rubric_items:
        # Simple string inclusion check for rubric concepts
        clean_item = re.sub(r'[^\w\s]', '', item).strip().lower()
        # Check matching of individual key words
        keywords = [w for w in clean_item.split() if len(w) > 3]
        if keywords and any(kw in candidate_lower for kw in keywords):
            matched_rubrics.append(item)
        else:
            missed_topics.append(item)
            
    # Apply rubric bonus (up to 30 points bonus to technical score)
    rubric_match_ratio = len(matched_rubrics) / len(rubric_items) if rubric_items else 1.0
    tech_score = min(100, int(base_tech * 0.7 + (rubric_match_ratio * 30)))
    
    # 3. Communication Score Heuristic
    words = candidate_answer.split()
    word_count = len(words)
    
    # Base communication score on length
    if word_count < 15:
        comm_base = 35
    elif word_count < 40:
        comm_base = 65
    elif word_count < 100:
        comm_base = 85
    else:
        comm_base = 95
        
    # Filler word deduction
    fillers = ["um", "uh", "like", "so", "you know", "ah", "basically", "actually"]
    filler_count = sum(1 for w in words if w.lower().strip(",.!?") in fillers)
    filler_penalty = min(40, filler_count * 4)
    comm_score = max(30, comm_base - filler_penalty)
    
    # 4. Confidence Score Heuristic
    # Heavily penalized by proctoring violations and speech hesitancy
    confidence_base = max(30, min(100, 100 - filler_count * 3 - (violations_count * 12)))
    
    # Adjust confidence slightly by length
    if word_count < 15:
        confidence_base = max(20, confidence_base - 20)
        
    # 5. Overall Weighted Score
    overall_score = int(tech_score * 0.5 + comm_score * 0.3 + confidence_base * 0.2)
    
    # 6. Feedback Generation
    feedback = ""
    if overall_score >= 80:
        feedback = "Excellent answer. Demonstrates strong topic mastery and clear, structured communication."
    elif overall_score >= 60:
        feedback = "Good response. The core concepts were mentioned, but adding specific examples or structured summaries would improve the score."
    else:
        feedback = f"Needs improvement. The response was brief or lacked key technical details. Focus on topics: {', '.join(missed_topics[:2])}."
        
    return {
        "overall_score": overall_score,
        "technical_score": tech_score,
        "communication_score": comm_score,
        "confidence_score": confidence_base,
        "feedback": feedback,
        "missed_topics": missed_topics
    }
