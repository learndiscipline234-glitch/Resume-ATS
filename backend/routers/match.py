"""Job matching and multi-resume ranking endpoints."""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
from ml.analyzer import analyze_resume, calculate_match, extract_skills

router = APIRouter()


class MatchRequest(BaseModel):
    resume_text: str
    job_description: str
    target_role: str = "software_developer"


class MultiRankRequest(BaseModel):
    resumes: List[dict]  # [{name, text}]
    target_role: str


@router.post("/job")
async def match_resume_to_job(req: MatchRequest):
    """Compare resume against a job description."""
    resume_skills = extract_skills(req.resume_text)
    jd_skills = extract_skills(req.job_description)

    # Skills in JD but not in resume
    resume_set = set(s.lower() for s in resume_skills)
    jd_set = set(s.lower() for s in jd_skills)

    matched = list(resume_set & jd_set)
    missing = list(jd_set - resume_set)
    extra = list(resume_set - jd_set)

    match_pct = round(len(matched) / len(jd_set) * 100) if jd_set else 0

    return {
        "match_percentage": match_pct,
        "matched_skills":   matched,
        "missing_skills":   missing,
        "extra_skills":     extra,
        "resume_skill_count": len(resume_skills),
        "jd_skill_count":     len(jd_skills),
    }


@router.post("/rank")
async def rank_resumes(req: MultiRankRequest):
    """Rank multiple resumes against a target role."""
    results = []
    for r in req.resumes:
        analysis = analyze_resume(r.get("text", ""), req.target_role)
        results.append({
            "name":           r.get("name", "Unknown"),
            "predicted_role": analysis["predictedRole"],
            "match_score":    analysis["finalScore"],
            "matched_skills": analysis["matchedSkills"][:5],
            "missing_count":  len(analysis["missingSkills"]),
        })

    results.sort(key=lambda x: x["match_score"], reverse=True)
    for i, r in enumerate(results):
        r["rank"] = i + 1

    return {"target_role": req.target_role, "rankings": results}
