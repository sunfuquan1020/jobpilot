from pydantic import BaseModel


class ChatMessage(BaseModel):
    role: str  # user | assistant
    content: str


class ChatRequest(BaseModel):
    messages: list[ChatMessage]
    resume_id: int | None = None
    job_id: int | None = None


class AnalyzeResumeRequest(BaseModel):
    resume_id: int
    job_id: int | None = None


class AgentSuggestion(BaseModel):
    type: str  # resume_tip | interview_question | action_item | match_reason
    title: str
    content: str
    priority: str = "medium"  # high | medium | low


class AnalyzeResumeResponse(BaseModel):
    overall_assessment: str
    suggestions: list[AgentSuggestion]
    match_summary: str | None = None
