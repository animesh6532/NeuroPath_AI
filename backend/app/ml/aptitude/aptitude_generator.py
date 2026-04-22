import random

APTITUDE_QUESTIONS = [
    {"question": "What is the next number in the series: 2, 6, 12, 20, 30, ...?", "options": ["40", "42", "44", "48"], "correct_answer": "42"},
    {"question": "If a train 120 meters long passes a telegraph pole in 6 seconds, find the speed of the train.", "options": ["60 km/hr", "72 km/hr", "80 km/hr", "85 km/hr"], "correct_answer": "72 km/hr"},
    {"question": "The sum of ages of 5 children born at the intervals of 3 years each is 50 years. What is the age of the youngest child?", "options": ["4 years", "8 years", "10 years", "None of these"], "correct_answer": "4 years"},
    {"question": "A father said to his son, 'I was as old as you are at the present at the time of your birth'. If the father's age is 38 years now, the son's age five years back was:", "options": ["14 years", "19 years", "33 years", "38 years"], "correct_answer": "14 years"},
    {"question": "A grocer has a sale of Rs. 6435, Rs. 6927, Rs. 6855, Rs. 7230 and Rs. 6562 for 5 consecutive months. How much sale must he have in the sixth month so that he gets an average sale of Rs. 6500?", "options": ["Rs. 4991", "Rs. 5991", "Rs. 6001", "Rs. 6991"], "correct_answer": "Rs. 4991"},
    {"question": "In a certain code language, '134' means 'good and tasty', '478' means 'see good pictures' and '729' means 'pictures are faint'. Which of the following digits stands for 'see'?", "options": ["9", "2", "1", "8"], "correct_answer": "8"},
    {"question": "Look at this series: 7, 10, 8, 11, 9, 12, ... What number should come next?", "options": ["7", "10", "12", "13"], "correct_answer": "10"},
    {"question": "A man is 24 years older than his son. In two years, his age will be twice the age of his son. The present age of his son is:", "options": ["14 years", "18 years", "20 years", "22 years"], "correct_answer": "22 years"},
    {"question": "What is the probability of getting a sum 9 from two throws of a dice?", "options": ["1/6", "1/8", "1/9", "1/12"], "correct_answer": "1/9"},
    {"question": "Find the odd one out: 3, 5, 11, 14, 17, 21", "options": ["21", "17", "14", "3"], "correct_answer": "14"},
    {"question": "If A is the brother of B; B is the sister of C; and C is the father of D, how D is related to A?", "options": ["Brother", "Sister", "Nephew", "Cannot be determined"], "correct_answer": "Cannot be determined"},
    {"question": "Pointing to a photograph of a boy Suresh said, 'He is the son of the only son of my mother.' How is Suresh related to that boy?", "options": ["Brother", "Uncle", "Cousin", "Father"], "correct_answer": "Father"},
    {"question": "A train running at the speed of 60 km/hr crosses a pole in 9 seconds. What is the length of the train?", "options": ["120 metres", "180 metres", "324 metres", "150 metres"], "correct_answer": "150 metres"},
    {"question": "The angle between the minute hand and the hour hand of a clock when the time is 4:20, is:", "options": ["0 degrees", "10 degrees", "5 degrees", "20 degrees"], "correct_answer": "10 degrees"},
    {"question": "Two numbers are respectively 20% and 50% more than a third number. The ratio of the two numbers is:", "options": ["2:5", "3:5", "4:5", "6:7"], "correct_answer": "4:5"},
    {"question": "A sum of money at simple interest amounts to Rs. 815 in 3 years and to Rs. 854 in 4 years. The sum is:", "options": ["Rs. 650", "Rs. 690", "Rs. 698", "Rs. 700"], "correct_answer": "Rs. 698"},
    {"question": "Evaluate: (0.00032)^(2/5)", "options": ["0.04", "0.4", "0.004", "0.0004"], "correct_answer": "0.04"},
    {"question": "Find the greatest number that will divide 43, 91 and 183 so as to leave the same remainder in each case.", "options": ["4", "7", "9", "13"], "correct_answer": "4"},
    {"question": "3 pumps, working 8 hours a day, can empty a tank in 2 days. How many hours a day must 4 pumps work to empty the tank in 1 day?", "options": ["9", "10", "11", "12"], "correct_answer": "12"},
    {"question": "If log 2 = 0.3010 and log 3 = 0.4771, the value of log5 512 is:", "options": ["2.870", "2.967", "3.876", "3.912"], "correct_answer": "3.876"},
    {"question": "A fruit seller had some apples. He sells 40% apples and still has 420 apples. Originally, he had:", "options": ["588 apples", "600 apples", "672 apples", "700 apples"], "correct_answer": "700 apples"},
    {"question": "Three unbiased coins are tossed. What is the probability of getting at most two heads?", "options": ["3/4", "1/4", "3/8", "7/8"], "correct_answer": "7/8"},
    {"question": "In a 100 m race, A can give B 10 m and C 28 m. In the same race B can give C:", "options": ["18 m", "20 m", "27 m", "9 m"], "correct_answer": "20 m"},
    {"question": "The cost price of 20 articles is the same as the selling price of x articles. If the profit is 25%, then the value of x is:", "options": ["15", "16", "18", "25"], "correct_answer": "16"},
    {"question": "A bag contains 2 red, 3 green and 2 blue balls. Two balls are drawn at random. What is the probability that none of the balls drawn is blue?", "options": ["10/21", "11/21", "2/7", "5/7"], "correct_answer": "10/21"}
]

def generate_aptitude_test(num_questions=20):
    return random.sample(APTITUDE_QUESTIONS, min(num_questions, len(APTITUDE_QUESTIONS)))

def evaluate_aptitude_test(user_answers: list):
    score = 0
    total = len(user_answers)
    if total == 0:
        return {"score": 0, "accuracy": 0}

    for answer_obj in user_answers:
        q_text = answer_obj.get("question")
        user_ans = answer_obj.get("answer")
        
        # Find original question
        original_q = next((q for q in APTITUDE_QUESTIONS if q["question"] == q_text), None)
        if original_q and original_q["correct_answer"] == user_ans:
            score += 1
            
    accuracy = round((score / total) * 100, 2)
    return {
        "score": score,
        "total": total,
        "accuracy": accuracy
    }
