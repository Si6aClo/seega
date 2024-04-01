from endpoints.health_check import api_router as health_check_router
from endpoints.auth import api_router as auth_router
from endpoints.game_process import api_router as game_router


list_of_routes = [
    health_check_router,
    auth_router,
    game_router,
]


__all__ = [
    "list_of_routes",
]