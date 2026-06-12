CATEGORY_COLORS = {
    "education": "#4ECDC4",
    "internship": "#FFB347",
    "work": "#FF6B6B",
}

SKILL_LEVEL_MAP = {
    "Python": "Intermediate", "R": "Upper-Intermediate", "SPSS": "Intermediate",
    "SQL": "Intermediate", "Java": "Lower-Intermediate", "JavaScript": "Intermediate",
    "TypeScript": "Intermediate", "React": "Lower-Intermediate", "FastAPI": "Intermediate",
    "Django": "Lower-Intermediate", "Machine Learning": "Lower-Intermediate",
    "Deep Learning": "Beginner", "Docker": "Lower-Intermediate", "AWS": "Beginner",
    "Tableau": "Intermediate", "Excel": "Upper-Intermediate", "MongoDB": "Beginner",
}


def build_timeline(education: list[dict], experience: list[dict]) -> list[dict]:
    items = []
    for edu in (education or []):
        items.append({
            "label": edu.get("school", ""),
            "sublabel": edu.get("degree") or edu.get("field") or "",
            "category": "education",
            "color": CATEGORY_COLORS["education"],
            "start_year": edu.get("start_year"),
            "start_month": edu.get("start_month", 1),
            "end_year": edu.get("end_year"),
            "end_month": edu.get("end_month", 12),
        })
    for exp in (experience or []):
        cat = exp.get("type", "work")
        items.append({
            "label": exp.get("company", ""),
            "sublabel": exp.get("title", ""),
            "category": cat,
            "color": CATEGORY_COLORS.get(cat, CATEGORY_COLORS["work"]),
            "start_year": exp.get("start_year"),
            "start_month": exp.get("start_month", 1),
            "end_year": exp.get("end_year"),
            "end_month": exp.get("end_month", 12),
            "is_current": exp.get("is_current", False),
        })
    return items


def build_skill_bubbles(skills: list[str], experience: list[dict]) -> list[dict]:
    """Bubble size based on how many experience descriptions mention the skill."""
    skill_counts: dict[str, int] = {}
    all_exp_text = " ".join(
        (exp.get("description") or "") for exp in (experience or [])
    ).lower()

    for skill in (skills or []):
        count = all_exp_text.count(skill.lower())
        skill_counts[skill] = max(1, count * 10 + 20)  # min size 20

    return [
        {"name": skill, "value": size, "category": "tool"}
        for skill, size in skill_counts.items()
    ]


def build_skill_matrix(skills: list[str]) -> list[dict]:
    levels = ["Beginner", "Lower-Intermediate", "Intermediate", "Upper-Intermediate", "Advanced"]
    result = []
    for skill in (skills or []):
        level = SKILL_LEVEL_MAP.get(skill, "Intermediate")
        result.append({
            "skill": skill,
            "level": level,
            "level_index": levels.index(level) if level in levels else 2,
            "category": "tool",
        })
    return result


def build_experience_tree(experience: list[dict]) -> list[dict]:
    """Treemap: group by type (work/internship/project), then by company."""
    groups: dict[str, list[dict]] = {}
    for exp in (experience or []):
        t = exp.get("type", "work").capitalize()
        groups.setdefault(t, []).append(exp)

    tree = []
    for group_name, exps in groups.items():
        children = []
        for exp in exps:
            # size = duration in months (approximate)
            sy = exp.get("start_year") or 2020
            ey = exp.get("end_year") or 2025
            sm = exp.get("start_month") or 1
            em = exp.get("end_month") or 12
            duration = max(1, (ey - sy) * 12 + (em - sm))
            children.append({
                "name": exp.get("company", "Unknown"),
                "value": duration,
                "title": exp.get("title", ""),
                "description": (exp.get("description") or "")[:100],
            })
        tree.append({"name": group_name, "children": children})
    return tree


def build_visualize_data(resume: dict) -> dict:
    education = resume.get("education") or []
    experience = resume.get("experience") or []
    skills = resume.get("skills") or []

    return {
        "timeline": build_timeline(education, experience),
        "skill_bubbles": build_skill_bubbles(skills, experience),
        "skill_matrix": build_skill_matrix(skills),
        "experience_tree": build_experience_tree(experience),
    }
