"""Resume upload, parsing, and analysis endpoints."""

import io
import uuid
from typing import Optional
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, BackgroundTasks
from pydantic import BaseModel
import asyncpg

from core.database import get_db
from ml.analyzer import analyze_resume, extract_skills
from ml.parser import parse_pdf, parse_docx, parse_txt

router = APIRouter()


class AnalyzeRequest(BaseModel):
    target_role: str
    user_id: str = "demo-user"


class AnalyzeResponse(BaseModel):
    success: bool
    predicted_role: str
    ml_confidence: float
    extracted_skills: list
    matched_skills: list
    missing_skills: list
    partial_skills: list
    ml_score: float
    fuzzy_score: float
    final_score: float
    match_percentage: float
    resume_id: Optional[str] = None


@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze_resume_endpoint(
    file: UploadFile = File(...),
    target_role: str = "software_developer",
    user_id: str = "00000000-0000-0000-0000-000000000001",
    background_tasks: BackgroundTasks = BackgroundTasks(),
    db: asyncpg.Connection = Depends(get_db),
):
    """Upload and analyze a resume. Returns ML predictions + skill match."""
    # Validate file type
    allowed = {"application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain"}
    if file.content_type not in allowed:
        raise HTTPException(400, "Only PDF, DOCX, and TXT files are supported")

    content = await file.read()
    if len(content) > 10 * 1024 * 1024:
        raise HTTPException(400, "File size must be under 10MB")

    # Extract text
    try:
        if file.content_type == "application/pdf":
            text = parse_pdf(content)
        elif "wordprocessingml" in file.content_type:
            text = parse_docx(content)
        else:
            text = content.decode("utf-8", errors="ignore")
    except Exception as e:
        raise HTTPException(422, f"Failed to parse file: {str(e)}")

    if len(text.strip()) < 50:
        raise HTTPException(422, "Could not extract sufficient text from the file")

    # Run ML analysis
    result = analyze_resume(text, target_role)

    # Store in DB (background)
    resume_id = str(uuid.uuid4())
    background_tasks.add_task(
        _store_analysis, db, resume_id, user_id, file.filename, text, target_role, result
    )

    return AnalyzeResponse(
        success=True,
        predicted_role=result["predictedRole"],
        ml_confidence=result["mlConfidence"],
        extracted_skills=result["extractedSkills"],
        matched_skills=result["matchedSkills"],
        missing_skills=result["missingSkills"],
        partial_skills=result.get("partialSkills", []),
        ml_score=result["mlScore"],
        fuzzy_score=result["fuzzyScore"],
        final_score=result["finalScore"],
        match_percentage=result["matchPercentage"],
        resume_id=resume_id,
    )


async def _store_analysis(db, resume_id, user_id, filename, text, target_role, result):
    try:
        await db.execute("""
            INSERT INTO resumes (id, user_id, file_name, raw_text, target_role)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT DO NOTHING
        """, resume_id, user_id, filename, text[:50000], target_role)

        await db.execute("""
            INSERT INTO job_matches
              (user_id, target_role, match_percentage, matched_skills,
               missing_skills, recommendations, ml_result, fuzzy_score, final_score)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        """,
            user_id, target_role, result["matchPercentage"],
            result["matchedSkills"], result["missingSkills"], [],
            {"predicted_role": result["predictedRole"], "confidence": result["mlConfidence"]},
            result["fuzzyScore"], result["finalScore"]
        )
    except Exception as e:
        import logging
        logging.getLogger(__name__).warning(f"DB store failed: {e}")


@router.get("/history/{user_id}")
async def get_history(user_id: str, limit: int = 10, db: asyncpg.Connection = Depends(get_db)):
    rows = await db.fetch("""
        SELECT id, file_name, target_role, uploaded_at
        FROM resumes WHERE user_id = $1
        ORDER BY uploaded_at DESC LIMIT $2
    """, user_id, limit)
    return [dict(r) for r in rows]
