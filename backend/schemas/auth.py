from pydantic import BaseModel, Field


class AuthResponse(BaseModel):
    token: str = Field()
