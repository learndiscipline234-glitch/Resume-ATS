"""Full-text search endpoint using PostgreSQL tsvector."""

from fastapi import APIRouter, Depends, Query
from typing import Optional
import asyncpg
from core.database import get_db

router = APIRouter()


@router.get("/resumes")
async def search_resumes(
    q: str = Query(..., min_length=2, description="Search query"),
    user_id: Optional[str] = None,
    role: Optional[str] = None,
    limit: int = Query(20, le=100),
    offset: int = 0,
    db: asyncpg.Connection = Depends(get_db),
):
    """
    Full-text search across resumes using PostgreSQL tsvector + GIN index.
    Uses plainto_tsquery for natural language queries.
    Returns ranked results with highlighted snippets.
    """
    rows = await db.fetch("""
        SELECT * FROM search_resumes($1, $2, $3, $4, $5)
    """, q, user_id, role, limit, offset)

    return {
        "query": q,
        "total": len(rows),
        "results": [dict(r) for r in rows],
    }


@router.get("/skills")
async def search_by_skills(
    skills: str = Query(..., description="Comma-separated skills"),
    db: asyncpg.Connection = Depends(get_db),
):
    """Search job_matches by skills using JSONB GIN index."""
    skill_list = [s.strip().lower() for s in skills.split(",")]

    rows = await db.fetch("""
        SELECT user_id, target_role, match_percentage, matched_skills, created_at
        FROM job_matches
        WHERE matched_skills @> $1::jsonb
        ORDER BY match_percentage DESC
        LIMIT 20
    """, skill_list)

    return {"skills": skill_list, "results": [dict(r) for r in rows]}
