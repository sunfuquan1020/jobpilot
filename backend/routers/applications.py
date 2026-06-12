from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from database import get_db
from models.application import Application
from models.job import Job

router = APIRouter(prefix="/applications", tags=["applications"])

DEFAULT_USER_ID = 1


class ApplicationCreate(BaseModel):
    job_id: int
    resume_id: int | None = None
    notes: str | None = None


class ApplicationStatusUpdate(BaseModel):
    status: str


@router.get("")
async def list_applications(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Application, Job)
        .join(Job, Application.job_id == Job.id)
        .where(Application.user_id == DEFAULT_USER_ID)
        .order_by(Application.applied_at.desc())
    )
    rows = result.all()
    return [
        {
            "id": app.id, "status": app.status, "notes": app.notes,
            "applied_at": app.applied_at, "resume_id": app.resume_id,
            "job": {
                "id": job.id, "title": job.title, "company": job.company,
                "location": job.location, "job_type": job.job_type,
                "salary_min": job.salary_min, "salary_max": job.salary_max,
            }
        }
        for app, job in rows
    ]


@router.post("")
async def create_application(data: ApplicationCreate, db: AsyncSession = Depends(get_db)):
    # Check not already applied
    existing = await db.execute(
        select(Application).where(Application.user_id == DEFAULT_USER_ID, Application.job_id == data.job_id)
    )
    if existing.scalars().first():
        raise HTTPException(status_code=400, detail="Already applied to this job")

    app = Application(user_id=DEFAULT_USER_ID, **data.model_dump())
    db.add(app)
    await db.commit()
    await db.refresh(app)
    return app


@router.patch("/{app_id}/status")
async def update_status(app_id: int, data: ApplicationStatusUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Application).where(Application.id == app_id))
    app = result.scalars().first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    app.status = data.status
    await db.commit()
    return {"id": app_id, "status": data.status}
