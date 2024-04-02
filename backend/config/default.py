from os import environ

from pydantic_settings import BaseSettings


class DefaultSettings(BaseSettings):
    """
    Default configs for application.

    Usually, we have three environments: for development, testing and production.
    But in this situation, we only have standard settings for local development.
    """

    ENV: str = environ.get("ENV", "local")
    PATH_PREFIX: str = environ.get("PATH_PREFIX", "/api/v1")
    APP_HOST: str = environ.get("APP_HOST", "http://0.0.0.0")
    APP_PORT: int = int(environ.get("APP_PORT", 8000))

    REDIS_URL: str = environ.get("REDIS_URL", "redis://127.0.0.1")
    REDIS_DB: int = int(environ.get("REDIS_DB", 0))

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"