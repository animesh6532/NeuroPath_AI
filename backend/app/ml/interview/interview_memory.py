class InterviewMemory:

    def __init__(self):
        self.history = []

    def add(self, question, answer, score):
        self.history.append({
            "question": question,
            "answer": answer,
            "score": score
        })

    def get_weak_areas(self):
        return [h["question"] for h in self.history if h["score"] < 5]
