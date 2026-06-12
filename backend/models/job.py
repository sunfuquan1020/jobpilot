from sqlalchemy import String, Text, Float, Boolean, DateTime, JSON
from sqlalchemy.orm import Mapped, mapped_column
from datetime import datetime, UTC
from database import Base


class Job(Base):
    __tablename__ = "jobs"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(200))
    company: Mapped[str] = mapped_column(String(200))
    company_logo: Mapped[str | None] = mapped_column(String(500))
    location: Mapped[str] = mapped_column(String(200))
    job_type: Mapped[str] = mapped_column(String(50), default="Full-time")  # Full-time, Part-time, Contract
    experience_level: Mapped[str] = mapped_column(String(50), default="Mid-level")  # Entry, Mid-level, Senior
    salary_min: Mapped[int | None] = mapped_column()
    salary_max: Mapped[int | None] = mapped_column()
    description: Mapped[str] = mapped_column(Text)
    requirements: Mapped[str | None] = mapped_column(Text)
    skills: Mapped[list | None] = mapped_column(JSON)  # ["Python", "FastAPI", ...]
    h1b_sponsor: Mapped[bool] = mapped_column(Boolean, default=False)
    remote: Mapped[bool] = mapped_column(Boolean, default=False)
    source: Mapped[str] = mapped_column(String(50), default="internal")  # internal, linkedin, external
    apply_url: Mapped[str | None] = mapped_column(String(500))
    posted_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(UTC))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(UTC))
