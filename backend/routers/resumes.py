import os
import shutil
from pathlib import Path
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from database import get_db
from models.resume import Resume
from models.user import User
from schemas.resume import ResumeResponse, VisualizeResponse
from services.resume_parser import parse_resume
from services.visualize_builder import build_visualize_data

router = APIRouter(prefix="/resumes", tags=["resumes"])

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)
DEFAULT_USER_ID = 1


@router.get("", response_model=list[ResumeResponse])
async def list_resumes(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Resume).where(Resume.user_id == DEFAULT_USER_ID).order_by(Resume.created_at.desc()))
    return result.scalars().all()


@router.post("", response_model=ResumeResponse)
async def upload_resume(
    file: UploadFile = File(...),
    target_role: str = Form(default=""),
    db: AsyncSession = Depends(get_db),
):
    # Ensure default user exists
    user_result = await db.execute(select(User).where(User.id == DEFAULT_USER_ID))
    user = user_result.scalars().first()
    if not user:
        user = User(id=DEFAULT_USER_ID, email="user@jobpilot.ai", name="Job Seeker")
        db.add(user)
        await db.flush()

    allowed = {".pdf", ".docx", ".doc"}
    ext = Path(file.filename or "").suffix.lower()
    if ext not in allowed:
        raise HTTPException(status_code=400, detail="Only PDF and DOCX files are supported")

    save_path = UPLOAD_DIR / f"resume_{DEFAULT_USER_ID}_{file.filename}"
    with open(save_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    resume = Resume(
        user_id=DEFAULT_USER_ID,
        filename=file.filename,
        target_role=target_role or None,
        status="processing",
    )
    db.add(resume)
    await db.flush()

    parsed = parse_resume(str(save_path))
    resume.raw_text = parsed.get("raw_text")
    resume.name = parsed.get("name")
    resume.email = parsed.get("email")
    resume.phone = parsed.get("phone")
    resume.skills = parsed.get("skills")
    resume.education = parsed.get("education")
    resume.experience = parsed.get("experience")
    resume.score_overall = parsed.get("score_overall")
    resume.score_completeness = parsed.get("score_completeness")
    resume.score_quantification = parsed.get("score_quantification")
    resume.score_keywords = parsed.get("score_keywords")
    resume.score_format = parsed.get("score_format")
    resume.status = "ready"

    await db.commit()
    await db.refresh(resume)
    return resume


@router.get("/{resume_id}", response_model=ResumeResponse)
async def get_resume(resume_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Resume).where(Resume.id == resume_id))
    resume = result.scalars().first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    return resume


@router.get("/{resume_id}/visualize", response_model=VisualizeResponse)
async def visualize_resume(resume_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Resume).where(Resume.id == resume_id))
    resume = result.scalars().first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    data = build_visualize_data({
        "education": resume.education or [],
        "experience": resume.experience or [],
        "skills": resume.skills or [],
    })
    return data
