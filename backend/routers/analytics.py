"""Analytics endpoints for dashboard charts."""

from fastapi import APIRouter, Depends
import asyncpg
from core.database import get_db

router = APIRouter()


@router.get("/overview")
async def get_overview(db: asyncpg.Connection = Depends(get_db)):
    """Top-level metrics for dashboard."""
    total_resumes = await db.fetchval("SELECT COUNT(*) FROM resumes")
    avg_score = await db.fetchval("SELECT ROUND(AVG(match_percentage), 1) FROM job_matches")
    total_skills = await db.fetchval("SELECT COUNT(DISTINCT jsonb_array_elements_text(matched_skills)) FROM job_matches")
    total_analyses = await db.fetchval("SELECT COUNT(*) FROM job_matches")

    return {
        "total_resumes":   total_resumes or 0,
        "avg_match_score": float(avg_score or 0),
        "total_skills":    total_skills or 0,
        "total_analyses":  total_analyses or 0,
    }


@router.get("/role-distribution")
async def role_distribution(db: asyncpg.Connection = Depends(get_db)):
    rows = await db.fetch("SELECT * FROM role_distribution")
    return [dict(r) for r in rows]


@router.get("/upload-trend")
async def upload_trend(days: int = 30, db: asyncpg.Connection = Depends(get_db)):
    rows = await db.fetch("""
        SELECT upload_date, upload_count, unique_users
        FROM daily_upload_stats
        WHERE upload_date >= NOW() - INTERVAL '1 day' * $1
        ORDER BY upload_date ASC
    """, days)
    return [dict(r) for r in rows]


@router.get("/top-skills")
async def top_skills(limit: int = 20, db: asyncpg.Connection = Depends(get_db)):
    rows = await db.fetch("SELECT skill, frequency FROM top_skills_view LIMIT $1", limit)
    return [dict(r) for r in rows]


@router.get("/ml-vs-fuzzy")
async def ml_vs_fuzzy(db: asyncpg.Connection = Depends(get_db)):
    rows = await db.fetch("""
        SELECT target_role,
               ROUND(AVG(match_percentage), 2) AS avg_ml_score,
               ROUND(AVG(fuzzy_score), 2)       AS avg_fuzzy_score,
               ROUND(AVG(final_score), 2)        AS avg_final_score,
               COUNT(*)                          AS total
        FROM job_matches
        WHERE final_score IS NOT NULL
        GROUP BY target_role
        ORDER BY avg_final_score DESC
    """)
    return [dict(r) for r in rows]
