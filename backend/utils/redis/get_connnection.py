import aioredis
from aioredis.client import Redis
from fastapi.requests import Request

REDIS_URL = 'redis://127.0.0.1'
REDIS_DB = 0


def get_redis(request: Request) -> Redis:
    return request.state.redis


async def get_redis_websocket():
    return await aioredis.from_url(REDIS_URL, db=REDIS_DB)
