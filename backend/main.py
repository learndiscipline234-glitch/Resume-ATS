"""
Next Step Career AI — FastAPI Backend
Production-grade resume intelligence API
"""

from fastapi import FastAPI, UploadFile, File, HTTPException, Depends, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from contextlib import asynccontextmanager
import uvicorn
import logging

from routers import resume, match, search, analytics, auth, backup
from core.config import settings
from core.database import init_db

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting Resume Intelligence API...")
    await init_db()
    yield
    logger.info("Shutting down...")


app = FastAPI(
    title="Resume Intelligence Platform API",
    description="Production-grade resume parsing, ML role prediction, and job matching",
    version="2.0.0",
    lifespan=lifespan,
)

# Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(GZipMiddleware, minimum_size=1000)

# Routers
app.include_router(auth.router,      prefix="/api/auth",      tags=["Auth"])
app.include_router(resume.router,    prefix="/api/resume",    tags=["Resume"])
app.include_router(match.router,     prefix="/api/match",     tags=["Matching"])
app.include_router(search.router,    prefix="/api/search",    tags=["Search"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["Analytics"])
app.include_router(backup.router,    prefix="/api/backup",    tags=["Backup"])


@app.get("/health")
async def health():
    return {"status": "ok", "version": "2.0.0"}


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
