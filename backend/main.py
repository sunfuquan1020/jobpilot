import json
from contextlib import asynccontextmanager
from pathlib import Path

from dotenv import load_dotenv
load_dotenv(Path(__file__).parent / ".env")

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import init_db, AsyncSessionLocal
from routers import jobs, resumes, agent, profile, applications


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    await seed_jobs()
    yield


async def seed_jobs():
    from models.job import Job
    from sqlalchemy import select
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(Job).limit(1))
        if result.scalars().first():
            return
        seed_file = Path(__file__).parent / "data" / "jobs_seed.json"
        with open(seed_file) as f:
            jobs_data = json.load(f)
        for jd in jobs_data:
            db.add(Job(**jd))
        await db.commit()


app = FastAPI(title="JobPilot API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(jobs.router)
app.include_router(resumes.router)
app.include_router(agent.router)
app.include_router(profile.router)
app.include_router(applications.router)


@app.get("/health")
async def health():
    return {"status": "ok", "service": "JobPilot API"}
