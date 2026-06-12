from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from database import get_db
from models.user import User

router = APIRouter(prefix="/profile", tags=["profile"])

DEFAULT_USER_ID = 1


class ProfileUpdate(BaseModel):
    name: str | None = None
    email: str | None = None
    location: str | None = None
    phone: str | None = None
    linkedin_url: str | None = None
    target_role: str | None = None
    target_location: str | None = None
    bio: str | None = None


@router.get("")
async def get_profile(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.id == DEFAULT_USER_ID))
    user = result.scalars().first()
    if not user:
        return {"id": DEFAULT_USER_ID, "name": "Job Seeker", "email": "", "location": "", "phone": "", "linkedin_url": "", "target_role": "", "target_location": "", "bio": ""}
    return user


@router.put("")
async def update_profile(data: ProfileUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.id == DEFAULT_USER_ID))
    user = result.scalars().first()
    if not user:
        user = User(id=DEFAULT_USER_ID, email=data.email or "user@jobpilot.ai", name=data.name or "Job Seeker")
        db.add(user)

    for field, value in data.model_dump(exclude_none=True).items():
        setattr(user, field, value)

    await db.commit()
    await db.refresh(user)
    return user
