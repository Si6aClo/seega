from logging import getLogger

import aioredis
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.requests import Request
from fastapi.responses import JSONResponse
from uvicorn import run

from config import DefaultSettings
from config.utils import get_settings
from endpoints import list_of_routes
from utils.common import get_hostname

logger = getLogger(__name__)

REDIS_URL = 'redis://127.0.0.1'
REDIS_DB = 0


def bind_routes(application: FastAPI, setting: DefaultSettings) -> None:
    """
    Bind all routes to application.
    """
    for route in list_of_routes:
        application.include_router(route, prefix=setting.PATH_PREFIX)


def get_app(redis=None) -> FastAPI:
    """
    Creates application and all dependable objects.
    """
    description = "Микросервис, реализующий игру в Сиджа."

    tags_metadata = [
        {
            "name": "Health check",
            "description": "API health check.",
        },
    ]

    application = FastAPI(
        title="Sigga game API",
        description=description,
        docs_url="/swagger",
        openapi_url="/openapi",
        version="1.0.0",
        openapi_tags=tags_metadata,
    )
    settings = get_settings()
    bind_routes(application, settings)
    application.state.settings = settings

    @application.on_event('startup')
    async def startup():
        nonlocal redis

        if redis is None:
            redis = await aioredis.from_url(
                REDIS_URL, db=REDIS_DB
            )
        assert await redis.ping()

    @application.middleware('http')
    async def http_middleware(request: Request, call_next):
        nonlocal redis
        err = {'error': True, 'message': "Internal server error"},
        response = JSONResponse(err, status_code=500)

        try:
            request.state.redis = redis
            response = await call_next(request)
        finally:
            return response

    application.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"]
    )

    return application


app = get_app()

if __name__ == "__main__":  # pragma: no cover
    settings_for_application = get_settings()
    run(
        "main:app",
        host=get_hostname(settings_for_application.APP_HOST),
        port=settings_for_application.APP_PORT,
        reload=True,
        log_level="debug",
    )
