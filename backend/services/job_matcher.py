from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np


def compute_match_score(resume_text: str, job_text: str) -> float:
    """Returns 0-100 match score using TF-IDF cosine similarity."""
    if not resume_text or not job_text:
        return 0.0
    try:
        vectorizer = TfidfVectorizer(stop_words="english", max_features=500)
        tfidf = vectorizer.fit_transform([resume_text, job_text])
        score = cosine_similarity(tfidf[0:1], tfidf[1:2])[0][0]
        return round(float(score) * 100, 1)
    except Exception:
        return 0.0


def compute_skill_overlap(resume_skills: list[str], job_skills: list[str]) -> float:
    """Jaccard-based skill overlap score 0-100."""
    if not resume_skills or not job_skills:
        return 0.0
    r = {s.lower() for s in resume_skills}
    j = {s.lower() for s in job_skills}
    if not j:
        return 0.0
    overlap = len(r & j) / len(r | j)
    return round(overlap * 100, 1)


def rank_jobs(resume_text: str, resume_skills: list[str], jobs: list[dict]) -> list[dict]:
    """Attach match_score to each job dict, sorted descending."""
    for job in jobs:
        job_text = f"{job.get('title', '')} {job.get('description', '')} {' '.join(job.get('skills') or [])}"
        tfidf_score = compute_match_score(resume_text, job_text)
        skill_score = compute_skill_overlap(resume_skills, job.get("skills") or [])
        # weighted blend: 60% TF-IDF + 40% skill overlap
        job["match_score"] = round(tfidf_score * 0.6 + skill_score * 0.4, 1)
    return sorted(jobs, key=lambda j: j["match_score"], reverse=True)
