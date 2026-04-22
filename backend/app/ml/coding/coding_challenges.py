import random
from datetime import datetime

# Sample pool of challenges
CHALLENGES_POOL = [
    {
        "id": "c1",
        "title": "Two Sum",
        "difficulty": "Easy",
        "description": "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
        "topic": "Arrays",
        "test_cases": [{"input": "[2,7,11,15], 9", "output": "[0,1]"}, {"input": "[3,2,4], 6", "output": "[1,2]"}]
    },
    {
        "id": "c2",
        "title": "Reverse Linked List",
        "difficulty": "Easy",
        "description": "Given the head of a singly linked list, reverse the list, and return the reversed list.",
        "topic": "Linked Lists",
        "test_cases": [{"input": "[1,2,3,4,5]", "output": "[5,4,3,2,1]"}]
    },
    {
        "id": "c3",
        "title": "Merge Intervals",
        "difficulty": "Medium",
        "description": "Given an array of intervals where intervals[i] = [starti, endi], merge all overlapping intervals.",
        "topic": "Sorting",
        "test_cases": [{"input": "[[1,3],[2,6],[8,10],[15,18]]", "output": "[[1,6],[8,10],[15,18]]"}]
    },
    {
        "id": "c4",
        "title": "LRU Cache",
        "difficulty": "Medium",
        "description": "Design a data structure that follows the constraints of a Least Recently Used (LRU) cache.",
        "topic": "Design",
        "test_cases": []
    },
    {
        "id": "c5",
        "title": "N-Queens",
        "difficulty": "Hard",
        "description": "The n-queens puzzle is the problem of placing n queens on an n x n chessboard such that no two queens attack each other.",
        "topic": "Backtracking",
        "test_cases": [{"input": "4", "output": "[[.Q..,...Q,Q...,..Q.],[..Q.,Q...,...Q,.Q..]]"}]
    },
    {
        "id": "c6",
        "title": "Valid Parentheses",
        "difficulty": "Easy",
        "description": "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
        "topic": "Stacks",
        "test_cases": [{"input": "'()[]{}'", "output": "true"}, {"input": "'(]'", "output": "false"}]
    },
    {
        "id": "c7",
        "title": "Maximum Subarray",
        "difficulty": "Medium",
        "description": "Given an integer array nums, find the contiguous subarray (containing at least one number) which has the largest sum and return its sum.",
        "topic": "Dynamic Programming",
        "test_cases": [{"input": "[-2,1,-3,4,-1,2,1,-5,4]", "output": "6"}]
    }
]

def get_daily_challenges():
    """
    Returns 3 challenges based on the current date, ensuring consistency
    throughout the day.
    """
    # Use today's date as the seed so it stays the same all day
    today_seed = int(datetime.utcnow().strftime("%Y%m%d"))
    random.seed(today_seed)
    
    selected = random.sample(CHALLENGES_POOL, 3)
    
    # Reset seed to unpredictable state for other uses
    random.seed()
    
    return selected
