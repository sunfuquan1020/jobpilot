from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from database import get_db
from models.job import Job
from models.resume import Resume
from schemas.job import JobResponse, JobListResponse
from services.job_matcher import compute_match_score, compute_skill_overlap

router = APIRouter(prefix="/jobs", tags=["jobs"])

DEFAULT_USER_ID = 1  # single-user mode for MVP


@router.get("", response_model=JobListResponse)
async def list_jobs(
    keyword: str = Query(default=""),
    location: str = Query(default=""),
    job_type: str = Query(default=""),
    source: str = Query(default=""),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=50),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Job)
    if keyword:
        stmt = stmt.where(or_(Job.title.ilike(f"%{keyword}%"), Job.company.ilike(f"%{keyword}%"), Job.description.ilike(f"%{keyword}%")))
    if location:
        stmt = stmt.where(Job.location.ilike(f"%{location}%"))
    if job_type:
        stmt = stmt.where(Job.job_type == job_type)
    if source:
        stmt = stmt.where(Job.source == source)

    total_result = await db.execute(stmt)
    all_jobs = total_result.scalars().all()

    # Get latest resume for match scoring
    resume_stmt = select(Resume).where(Resume.user_id == DEFAULT_USER_ID, Resume.status == "ready").order_by(Resume.created_at.desc())
    resume_result = await db.execute(resume_stmt)
    resume = resume_result.scalars().first()

    job_dicts = []
    for job in all_jobs:
        d = {
            "id": job.id, "title": job.title, "company": job.company,
            "company_logo": job.company_logo, "location": job.location,
            "job_type": job.job_type, "experience_level": job.experience_level,
            "salary_min": job.salary_min, "salary_max": job.salary_max,
            "description": job.description, "requirements": job.requirements,
            "skills": job.skills or [], "h1b_sponsor": job.h1b_sponsor,
            "remote": job.remote, "source": job.source, "apply_url": job.apply_url,
            "posted_at": job.posted_at, "match_score": None,
        }
        if resume and resume.raw_text:
            job_text = f"{job.title} {job.description} {' '.join(job.skills or [])}"
            tfidf = compute_match_score(resume.raw_text, job_text)
            skill = compute_skill_overlap(resume.skills or [], job.skills or [])
            d["match_score"] = round(tfidf * 0.6 + skill * 0.4, 1)
        job_dicts.append(d)

    if resume:
        job_dicts.sort(key=lambda j: j["match_score"] or 0, reverse=True)

    offset = (page - 1) * page_size
    paginated = job_dicts[offset: offset + page_size]

    return {"jobs": paginated, "total": len(all_jobs), "page": page, "page_size": page_size}


@router.get("/{job_id}", response_model=JobResponse)
async def get_job(job_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Job).where(Job.id == job_id))
    job = result.scalars().first()
    if not job:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Job not found")
    return JobResponse.model_validate(job)
