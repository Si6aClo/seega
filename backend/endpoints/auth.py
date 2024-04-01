import uuid

from fastapi import APIRouter
from fastapi.requests import Request
from starlette import status

from schemas import AuthResponse

api_router = APIRouter(tags=["Simple auth"])


@api_router.get(
    "/auth",
    response_model=AuthResponse,
    status_code=status.HTTP_200_OK,
)
async def auth(request: Request):
    req_cookie = request.headers.get("XUserToken")
    print(1)
    if not req_cookie or req_cookie == "undefined":
        req_cookie = str(uuid.uuid4())
    return AuthResponse(token=req_cookie)
