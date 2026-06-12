import re
from pathlib import Path


SKILL_KEYWORDS = [
    "Python", "Java", "JavaScript", "TypeScript", "Go", "Rust", "C++", "C#", "Ruby", "Swift",
    "React", "Vue", "Angular", "Next.js", "Node.js", "FastAPI", "Django", "Flask", "Spring",
    "SQL", "MySQL", "PostgreSQL", "MongoDB", "Redis", "SQLite", "Elasticsearch",
    "Docker", "Kubernetes", "AWS", "GCP", "Azure", "Terraform", "CI/CD",
    "Git", "Linux", "REST", "GraphQL", "gRPC", "Kafka", "RabbitMQ",
    "Machine Learning", "Deep Learning", "NLP", "TensorFlow", "PyTorch", "scikit-learn",
    "R", "SPSS", "MATLAB", "Tableau", "PowerBI", "Excel", "Pandas", "NumPy",
    "Data Analysis", "Data Visualization", "Statistics", "SQL", "ETL",
]


def _extract_text_from_pdf(filepath: str) -> str:
    try:
        import pdfplumber
        with pdfplumber.open(filepath) as pdf:
            return "\n".join(page.extract_text() or "" for page in pdf.pages)
    except Exception:
        return ""


def _extract_text_from_docx(filepath: str) -> str:
    try:
        from docx import Document
        doc = Document(filepath)
        return "\n".join(p.text for p in doc.paragraphs)
    except Exception:
        return ""


def extract_text(filepath: str) -> str:
    ext = Path(filepath).suffix.lower()
    if ext == ".pdf":
        return _extract_text_from_pdf(filepath)
    elif ext in (".docx", ".doc"):
        return _extract_text_from_docx(filepath)
    return ""


def extract_email(text: str) -> str | None:
    match = re.search(r"[\w.+-]+@[\w-]+\.[a-zA-Z]{2,}", text)
    return match.group(0) if match else None


def extract_phone(text: str) -> str | None:
    match = re.search(r"(\+?\d[\d\s\-().]{7,}\d)", text)
    return match.group(0).strip() if match else None


def extract_skills(text: str) -> list[str]:
    found = []
    text_lower = text.lower()
    for skill in SKILL_KEYWORDS:
        if skill.lower() in text_lower:
            found.append(skill)
    return list(dict.fromkeys(found))  # deduplicate, preserve order


def _parse_year_month(text: str) -> tuple[int | None, int | None]:
    MONTHS = {
        "jan": 1, "feb": 2, "mar": 3, "apr": 4, "may": 5, "jun": 6,
        "jul": 7, "aug": 8, "sep": 9, "oct": 10, "nov": 11, "dec": 12,
    }
    year_match = re.search(r"\b(20\d{2}|19\d{2})\b", text)
    year = int(year_match.group(1)) if year_match else None
    month = None
    for abbr, num in MONTHS.items():
        if abbr in text.lower():
            month = num
            break
    return year, month


def extract_education(text: str) -> list[dict]:
    """
    Heuristic: look for degree keywords near university keywords
    Returns list of dicts with school/degree/field/start_year/end_year
    """
    results = []
    lines = text.split("\n")
    edu_keywords = ["university", "college", "institute", "school", "academy", "bachelor", "master", "phd", "mba", "大学", "学院", "研究生", "本科"]
    degree_keywords = ["bachelor", "master", "phd", "mba", "b.s", "m.s", "b.a", "m.a", "doctor", "undergraduate", "graduate", "学士", "硕士", "博士"]

    i = 0
    while i < len(lines):
        line = lines[i].strip()
        line_lower = line.lower()
        if any(kw in line_lower for kw in edu_keywords):
            entry: dict = {"school": line}
            # look ahead a few lines for degree/dates
            for j in range(i + 1, min(i + 5, len(lines))):
                next_line = lines[j].strip()
                next_lower = next_line.lower()
                if any(kw in next_lower for kw in degree_keywords):
                    entry["degree"] = next_line
                # date range like "2015 - 2019" or "Sep 2015 - Jun 2019"
                date_range = re.search(r"((?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)?\s*\d{4})\s*[-–]\s*((?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)?\s*\d{4}|present|now|至今)", next_lower)
                if date_range:
                    sy, sm = _parse_year_month(date_range.group(1))
                    ey, em = _parse_year_month(date_range.group(2))
                    entry["start_year"] = sy
                    entry["start_month"] = sm
                    entry["end_year"] = ey
                    entry["end_month"] = em
            if entry.get("school"):
                results.append(entry)
        i += 1
    return results


def extract_experience(text: str) -> list[dict]:
    """
    Heuristic: find company/title blocks with date ranges
    """
    results = []
    lines = text.split("\n")
    exp_section = False
    section_headers = ["experience", "employment", "work history", "professional", "internship", "实习", "工作经历", "工作"]

    for i, line in enumerate(lines):
        line_stripped = line.strip()
        if not line_stripped:
            continue
        if any(kw in line_stripped.lower() for kw in section_headers):
            exp_section = True
            continue
        if exp_section and any(kw in line_stripped.lower() for kw in ["education", "skills", "projects", "awards", "教育", "技能"]):
            exp_section = False

        if exp_section:
            date_range = re.search(
                r"((?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)?\s*\d{4})\s*[-–]\s*((?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)?\s*\d{4}|present|now|至今)",
                line_stripped.lower()
            )
            if date_range and i > 0:
                sy, sm = _parse_year_month(date_range.group(1))
                is_current = any(kw in date_range.group(2) for kw in ["present", "now", "至今"])
                ey, em = (None, None) if is_current else _parse_year_month(date_range.group(2))
                # title is likely the line before or the same line
                title_line = lines[i - 1].strip() if i > 0 else line_stripped
                company_line = lines[i - 2].strip() if i > 1 else ""
                # gather description from following lines
                desc_lines = []
                for j in range(i + 1, min(i + 8, len(lines))):
                    dl = lines[j].strip()
                    if not dl:
                        break
                    desc_lines.append(dl)
                results.append({
                    "company": company_line or title_line,
                    "title": title_line,
                    "start_year": sy,
                    "start_month": sm,
                    "end_year": ey,
                    "end_month": em,
                    "is_current": is_current,
                    "description": " ".join(desc_lines) or None,
                    "type": "internship" if "intern" in title_line.lower() else "work",
                })
    return results


def score_resume(text: str, skills: list[str], education: list[dict], experience: list[dict]) -> dict[str, int]:
    # Completeness: has all key sections
    has_education = len(education) > 0
    has_experience = len(experience) > 0
    has_skills = len(skills) > 0
    has_contact = bool(extract_email(text) and extract_phone(text))
    completeness = int((has_education + has_experience + has_skills + has_contact) / 4 * 100)

    # Quantification: count numeric metrics in experience
    numeric_count = len(re.findall(r"\d+%|\$\d+|\d+\s*(?:million|billion|k|users|projects|teams?)", text.lower()))
    quantification = min(100, numeric_count * 15)

    # Keyword coverage: common job-related terms
    common_keywords = ["led", "developed", "improved", "reduced", "increased", "managed", "built", "designed", "implemented", "launched"]
    kw_count = sum(1 for kw in common_keywords if kw in text.lower())
    keywords = min(100, kw_count * 10)

    # Format: length check
    word_count = len(text.split())
    format_score = 80 if 300 <= word_count <= 1000 else (60 if word_count < 300 else 70)

    overall = int((completeness + quantification + keywords + format_score) / 4)
    return {
        "score_overall": overall,
        "score_completeness": completeness,
        "score_quantification": quantification,
        "score_keywords": keywords,
        "score_format": format_score,
    }


def parse_resume(filepath: str) -> dict:
    text = extract_text(filepath)
    skills = extract_skills(text)
    education = extract_education(text)
    experience = extract_experience(text)
    scores = score_resume(text, skills, education, experience)

    lines = [l.strip() for l in text.split("\n") if l.strip()]
    name = lines[0] if lines else None

    return {
        "raw_text": text,
        "name": name,
        "email": extract_email(text),
        "phone": extract_phone(text),
        "skills": skills,
        "education": education,
        "experience": experience,
        **scores,
    }
