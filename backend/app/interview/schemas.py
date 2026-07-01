from pydantic import BaseModel
from typing import List, Dict, Any

class AnswerItem(BaseModel):
    question: str
    answer: str

class InterviewSubmitRequest(BaseModel):
    skills: List[str]
    answers: List[AnswerItem]

class PlacementAnalysisRequest(BaseModel):
    skills: List[str]
    interview_result: Dict[str, Any]

class LearningRoadmapRequest(BaseModel):
    skills: List[str]
    weaknesses: List[str]
