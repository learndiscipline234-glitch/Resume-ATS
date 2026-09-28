"""Backup and data export endpoints."""

from fastapi import APIRouter, Depends, Response
import asyncpg
import json
from core.database import get_db

router = APIRouter()


@router.get("/export/{user_id}")
async def export_user_data(
    user_id: str,
    db: asyncpg.Connection = Depends(get_db),
):
    """Export all user data as JSON — uses PostgreSQL export_user_data() function."""
    result = await db.fetchval("SELECT export_user_data($1)", user_id)
    data = json.loads(result) if result else {}

    return Response(
        content=json.dumps(data, indent=2, default=str),
        media_type="application/json",
        headers={"Content-Disposition": f"attachment; filename=backup_{user_id[:8]}.json"},
    )


@router.get("/stats")
async def backup_stats(db: asyncpg.Connection = Depends(get_db)):
    """Database table sizes and row counts."""
    rows = await db.fetch("SELECT * FROM get_backup_stats()")
    return [dict(r) for r in rows]
