from sqlalchemy import String, Text, Float, Integer, DateTime, JSON, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from datetime import datetime, UTC
from database import Base


class Resume(Base):
    __tablename__ = "resumes"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    filename: Mapped[str] = mapped_column(String(255))
    target_role: Mapped[str | None] = mapped_column(String(200))
    status: Mapped[str] = mapped_column(String(50), default="processing")  # processing, ready, error

    # Parsed structured data
    name: Mapped[str | None] = mapped_column(String(100))
    email: Mapped[str | None] = mapped_column(String(255))
    phone: Mapped[str | None] = mapped_column(String(50))
    location: Mapped[str | None] = mapped_column(String(200))
    summary: Mapped[str | None] = mapped_column(Text)
    skills: Mapped[list | None] = mapped_column(JSON)  # ["Python", "SQL", ...]
    education: Mapped[list | None] = mapped_column(JSON)  # [{school, degree, field, start, end}, ...]
    experience: Mapped[list | None] = mapped_column(JSON)  # [{company, title, start, end, description}, ...]
    projects: Mapped[list | None] = mapped_column(JSON)

    # Scoring
    score_overall: Mapped[int | None] = mapped_column(Integer)
    score_completeness: Mapped[int | None] = mapped_column(Integer)
    score_quantification: Mapped[int | None] = mapped_column(Integer)
    score_keywords: Mapped[int | None] = mapped_column(Integer)
    score_format: Mapped[int | None] = mapped_column(Integer)

    raw_text: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(UTC))
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(UTC), onupdate=lambda: datetime.now(UTC))
