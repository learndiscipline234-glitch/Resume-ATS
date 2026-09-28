import asyncpg
from core.config import settings
import logging

logger = logging.getLogger(__name__)
_pool = None


async def init_db():
    global _pool
    try:
        _pool = await asyncpg.create_pool(
            settings.DATABASE_URL,
            min_size=2,
            max_size=10,
            command_timeout=60,
        )
        logger.info("Database pool initialized")
    except Exception as e:
        logger.error(f"Database init failed: {e}")
        raise


async def get_db():
    async with _pool.acquire() as conn:
        yield conn
