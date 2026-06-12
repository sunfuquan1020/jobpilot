from pydantic import BaseModel
from datetime import datetime


class JobBase(BaseModel):
    title: str
    company: str
    company_logo: str | None = None
    location: str
    job_type: str = "Full-time"
    experience_level: str = "Mid-level"
    salary_min: int | None = None
    salary_max: int | None = None
    description: str
    requirements: str | None = None
    skills: list[str] | None = None
    h1b_sponsor: bool = False
    remote: bool = False
    source: str = "internal"
    apply_url: str | None = None


class JobResponse(JobBase):
    id: int
    posted_at: datetime
    match_score: float | None = None  # computed per-request

    model_config = {"from_attributes": True}


class JobListResponse(BaseModel):
    jobs: list[JobResponse]
    total: int
    page: int
    page_size: int
