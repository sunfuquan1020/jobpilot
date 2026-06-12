from pydantic import BaseModel
from datetime import datetime


class EducationItem(BaseModel):
    school: str
    degree: str | None = None
    field: str | None = None
    start_year: int | None = None
    start_month: int | None = None
    end_year: int | None = None
    end_month: int | None = None
    description: str | None = None


class ExperienceItem(BaseModel):
    company: str
    title: str
    start_year: int | None = None
    start_month: int | None = None
    end_year: int | None = None
    end_month: int | None = None
    is_current: bool = False
    description: str | None = None
    type: str = "work"  # work, internship


class ResumeResponse(BaseModel):
    id: int
    filename: str
    target_role: str | None
    status: str
    name: str | None
    email: str | None
    phone: str | None
    location: str | None
    summary: str | None
    skills: list[str] | None
    education: list[EducationItem] | None
    experience: list[ExperienceItem] | None
    score_overall: int | None
    score_completeness: int | None
    score_quantification: int | None
    score_keywords: int | None
    score_format: int | None
    created_at: datetime

    model_config = {"from_attributes": True}


class VisualizeResponse(BaseModel):
    timeline: list[dict]       # [{label, category, start, end, color}, ...]
    skill_bubbles: list[dict]  # [{name, value, category}, ...]
    skill_matrix: list[dict]   # [{skill, level, category}, ...]
    experience_tree: list[dict] # [{name, value, children?}, ...]
