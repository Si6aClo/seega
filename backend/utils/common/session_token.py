from fastapi import (
    WebSocket,
    WebSocketException,
    HTTPException,
    status,
)
from fastapi.requests import Request


async def get_session_token_request(
        request: Request,
):
    session = request.headers.get('Xusertoken')
    if session is None:
        raise HTTPException(status_code=403)
    return session


async def get_session_token_websocket(
        websocket: WebSocket,
):
    session = websocket.headers.get('XUserToken')
    if session is None:
        raise WebSocketException(code=status.WS_1008_POLICY_VIOLATION)
    return session
