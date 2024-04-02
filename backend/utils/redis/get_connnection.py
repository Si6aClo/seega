import aioredis
from aioredis.client import Redis
from fastapi.requests import Request

from config import get_settings


def get_redis(request: Request) -> Redis:
    return request.state.redis


async def get_redis_websocket():
    settings = get_settings()
    return await aioredis.from_url(settings.REDIS_URL, db=settings.REDIS_DB)
