def generate_followup(question, score):

    if score < 5:
        return f"Can you explain '{question}' with a real-world example?"

    elif score < 7:
        return f"Can you go deeper into '{question}'?"

    else:
        return None
