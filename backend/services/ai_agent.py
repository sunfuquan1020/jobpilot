import os
from typing import AsyncIterator

def get_ai_provider() -> str:
    return os.getenv("AI_PROVIDER", "ollama")  # ollama | claude | openai


async def stream_chat(messages: list[dict], context: str = "") -> AsyncIterator[str]:
    """Stream chat completion tokens from the configured AI provider."""
    system_prompt = (
        "You are JobPilot AI, an expert career coach and job search assistant. "
        "Help users optimize their resumes, prepare for interviews, and find matching jobs. "
        "Be concise, actionable, and encouraging."
    )
    if context:
        system_prompt += f"\n\nContext about the user:\n{context}"

    provider = get_ai_provider()
    if provider == "claude":
        async for token in _stream_claude(messages, system_prompt):
            yield token
    elif provider == "openai":
        async for token in _stream_openai(messages, system_prompt):
            yield token
    else:
        async for token in _stream_ollama(messages, system_prompt):
            yield token


async def _stream_claude(messages: list[dict], system: str) -> AsyncIterator[str]:
    import anthropic
    client = anthropic.AsyncAnthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
    async with client.messages.stream(
        model="claude-haiku-4-5-20251001",
        max_tokens=1024,
        system=system,
        messages=messages,
    ) as stream:
        async for text in stream.text_stream:
            yield text


async def _stream_openai(messages: list[dict], system: str) -> AsyncIterator[str]:
    from openai import AsyncOpenAI
    client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    full_messages = [{"role": "system", "content": system}] + messages
    async with await client.chat.completions.create(
        model="gpt-4o-mini",
        messages=full_messages,
        stream=True,
    ) as stream:
        async for chunk in stream:
            delta = chunk.choices[0].delta.content
            if delta:
                yield delta


async def _stream_ollama(messages: list[dict], system: str) -> AsyncIterator[str]:
    import httpx
    ollama_url = os.getenv("OLLAMA_URL", "http://localhost:11434")
    model = os.getenv("OLLAMA_MODEL", "llama3.2")
    full_messages = [{"role": "system", "content": system}] + messages
    async with httpx.AsyncClient(timeout=60) as client:
        async with client.stream(
            "POST",
            f"{ollama_url}/api/chat",
            json={"model": model, "messages": full_messages, "stream": True},
        ) as response:
            import json
            async for line in response.aiter_lines():
                if line:
                    data = json.loads(line)
                    content = data.get("message", {}).get("content", "")
                    if content:
                        yield content


async def analyze_resume(resume: dict, job: dict | None = None) -> dict:
    """Generate structured suggestions for a resume, optionally against a job."""
    resume_summary = (
        f"Name: {resume.get('name')}\n"
        f"Skills: {', '.join(resume.get('skills') or [])}\n"
        f"Education: {len(resume.get('education') or [])} entries\n"
        f"Experience: {len(resume.get('experience') or [])} entries\n"
        f"Score: {resume.get('score_overall')}/100"
    )
    job_summary = ""
    if job:
        job_summary = f"\nTarget Job: {job.get('title')} at {job.get('company')}\nRequired Skills: {', '.join(job.get('skills') or [])}"

    prompt = (
        f"Analyze this resume and provide 3-5 specific, actionable suggestions:\n\n"
        f"{resume_summary}{job_summary}\n\n"
        "Return a JSON object with keys: overall_assessment (string), suggestions (array of "
        "{type, title, content, priority}), match_summary (string or null). "
        "suggestion types: resume_tip | interview_question | action_item | match_reason"
    )

    full_response = ""
    async for token in stream_chat([{"role": "user", "content": prompt}]):
        full_response += token

    import json, re
    json_match = re.search(r"\{.*\}", full_response, re.DOTALL)
    if json_match:
        try:
            return json.loads(json_match.group(0))
        except Exception:
            pass

    return {
        "overall_assessment": full_response[:300],
        "suggestions": [],
        "match_summary": None,
    }
