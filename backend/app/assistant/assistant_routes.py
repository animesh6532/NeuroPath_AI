from fastapi import APIRouter
from pydantic import BaseModel
from backend.app.assistant.assistant_logic import get_assistant_response

router = APIRouter()

class AssistantRequest(BaseModel):
    question: str
    current_page: str = None
    context_type: str = None

@router.post("/assistant-chat")
async def assistant_chat(request: AssistantRequest):
    answer = get_assistant_response(request.question)
    return {
        "answer": answer
    }
