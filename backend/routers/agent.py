import json
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from database import get_db
from models.resume import Resume
from models.job import Job
from schemas.agent import ChatRequest, AnalyzeResumeRequest, AnalyzeResumeResponse
from services.ai_agent import stream_chat, analyze_resume

router = APIRouter(prefix="/agent", tags=["agent"])


@router.post("/chat")
async def chat(request: ChatRequest, db: AsyncSession = Depends(get_db)):
    context = ""
    if request.resume_id:
        result = await db.execute(select(Resume).where(Resume.id == request.resume_id))
        resume = result.scalars().first()
        if resume:
            context += f"User's resume: {resume.name}, Skills: {', '.join(resume.skills or [])}, Score: {resume.score_overall}/100\n"

    if request.job_id:
        result = await db.execute(select(Job).where(Job.id == request.job_id))
        job = result.scalars().first()
        if job:
            context += f"Target job: {job.title} at {job.company}, Required skills: {', '.join(job.skills or [])}\n"

    messages = [{"role": m.role, "content": m.content} for m in request.messages]

    async def event_stream():
        async for token in stream_chat(messages, context):
            yield f"data: {json.dumps({'token': token})}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(event_stream(), media_type="text/event-stream")


@router.post("/analyze-resume", response_model=AnalyzeResumeResponse)
async def analyze(request: AnalyzeResumeRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Resume).where(Resume.id == request.resume_id))
    resume = result.scalars().first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    job_data = None
    if request.job_id:
        job_result = await db.execute(select(Job).where(Job.id == request.job_id))
        job = job_result.scalars().first()
        if job:
            job_data = {"title": job.title, "company": job.company, "skills": job.skills or []}

    resume_data = {
        "name": resume.name,
        "skills": resume.skills or [],
        "education": resume.education or [],
        "experience": resume.experience or [],
        "score_overall": resume.score_overall,
    }

    result_data = await analyze_resume(resume_data, job_data)
    return result_data
