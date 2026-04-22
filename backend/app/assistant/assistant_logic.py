import re
from backend.app.assistant.project_knowledge import PROJECT_KNOWLEDGE, REFUSAL_RESPONSE

def preprocess_text(text: str) -> list:
    """Lowercases the text, removes punctuation, and splits into words."""
    text = text.lower()
    text = re.sub(r'[^\w\s]', '', text)
    words = text.split()
    
    # Simple stopword removal to focus on key terms
    stopwords = {"the", "a", "an", "is", "of", "and", "in", "to", "how", "do", "you", "my", "on", "it", "this", "can", "for", "with", "are", "have"}
    return [w for w in words if w not in stopwords]

def get_assistant_response(question: str) -> str:
    """
    Finds the best matching answer for the user's question from the knowledge base.
    Uses keyword matching and topic density scoring.
    """
    
    # 1. Direct match on keywords/phrases
    lower_q = question.lower()
    
    best_match = None
    highest_score = 0
    
    for item in PROJECT_KNOWLEDGE:
        score = 0
        
        # Exact substring phrase match provides a high score
        for kw in item["keywords"]:
            if kw in lower_q:
                score += 5  # Strong match
                
        # Word overlap score
        q_words = preprocess_text(question)
        for kw in item["keywords"]:
            kw_words = preprocess_text(kw)
             # Count how many words in the keyword phrase are in the question
            overlap = sum(1 for w in kw_words if w in q_words)
            if overlap > 0:
                 score += overlap
                 
        if score > highest_score:
            highest_score = score
            best_match = item
            
    # Fallback reasoning or Refusal
    if highest_score > 0 and best_match:
        return best_match["answer"]
        
    return REFUSAL_RESPONSE
