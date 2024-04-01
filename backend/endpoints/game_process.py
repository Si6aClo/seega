import asyncio
import random
import uuid
import json
from typing import Annotated

from aioredis.client import Redis
from fastapi import (
    Body,
    Depends,
    APIRouter,
    WebSocket,
    WebSocketException,
    HTTPException,
    Query,
    status,
)

from utils.redis import get_redis, get_redis_websocket
from utils.common.session_token import get_session_token_request
from utils.common.game import create_new_board
from schemas.game_process import CreateGameRequest, CreateGameResponse, GameData, Color, GameStage, Message, \
    MessageType, TurnData, PublicGamesResponse, GameLink

api_router = APIRouter(tags=["Game process"])
all_connections = {}


@api_router.websocket("/games/{game_id}")
async def websocket_endpoint(
        websocket: WebSocket,
        game_id: str,
        redis: Redis = Depends(get_redis_websocket),
        token: Annotated[str | None, Query()] = None
):
    raw_game_data = await redis.get(game_id)
    if not raw_game_data:
        raise WebSocketException(code=status.WS_1001_GOING_AWAY)
    game_data_object = GameData.parse_obj(json.loads(raw_game_data))
    if game_data_object.white_player and game_data_object.black_player and token not in [game_data_object.black_player,
                                                                                         game_data_object.white_player]:
        raise WebSocketException(code=status.WS_1008_POLICY_VIOLATION)

    await websocket.accept()
    if game_data_object.black_player == token:
        all_connections.setdefault(game_id, dict())["black"] = websocket
    elif game_data_object.white_player == token:
        all_connections.setdefault(game_id, dict())["white"] = websocket

    if game_data_object.game_stage == GameStage.WAITING:
        while True:
            if game_data_object.white_player and game_data_object.black_player:
                for socket in [all_connections[game_id].get("white"), all_connections[game_id].get("black")]:
                    if not socket:
                        continue
                    await socket.send_text(Message(
                        message_type=MessageType.GAME,
                        turn_data=TurnData(
                            board=game_data_object.game_field,
                            x_from=None,
                            y_from=None,
                            x_to=None,
                            y_to=None,
                        ),
                        sender=None,
                        game_stage=game_data_object.game_stage,
                        turn_color=game_data_object.player_turn,
                    ).model_dump_json())
                break

            for socket in [all_connections[game_id].get("white"), all_connections[game_id].get("black")]:
                if not socket:
                    continue
                await socket.send_text(Message(
                    message_type=MessageType.WAITING,
                    turn_data=None,
                    sender=None,
                    game_stage=game_data_object.game_stage,
                    turn_color=None,
                ).model_dump_json())
            await asyncio.sleep(1)
            raw_game_data = await redis.get(game_id)
            game_data_object = GameData.parse_obj(json.loads(raw_game_data))
    if game_data_object.game_stage == GameStage.ARRANGEMENT or game_data_object.game_stage == GameStage.GAME:
        while True:
            try:
                data = await websocket.receive_json()
            except Exception as e:
                break

            message = Message.parse_obj(data)
            raw_game_data = await redis.get(game_id)
            game_data_object = GameData.parse_obj(json.loads(raw_game_data))

            game_data_object.game_stage = message.game_stage
            game_data_object.game_field = message.turn_data.board
            game_data_object.player_turn = Color.BLACK if game_data_object.player_turn == Color.WHITE else Color.WHITE

            await redis.set(game_id, game_data_object.model_dump_json())
            for socket in [all_connections[game_id].get("white"), all_connections[game_id].get("black")]:
                if not socket:
                    continue
                await socket.send_text(message.model_dump_json())

            if game_data_object.game_stage == GameStage.END:
                break
    raw_game_data = await redis.get(game_id)
    game_data_object = GameData.parse_obj(json.loads(raw_game_data))
    if game_data_object.game_stage == GameStage.END:
        await redis.hdel(token, "online")
        await redis.srem("public_games", game_id)
        for socket in [all_connections[game_id].get("white"), all_connections[game_id].get("black")]:
            if not socket:
                continue
            await socket.close()


@api_router.websocket("/games/bot/{token}")
async def websocket_bot_endpoint(
        websocket: WebSocket,
        token: str,
        redis: Redis = Depends(get_redis_websocket),
):
    game_id = await redis.hget(token, "bot")
    raw_game_data = await redis.get(game_id)
    if not raw_game_data:
        raise WebSocketException(code=status.WS_1001_GOING_AWAY)
    game_data_object = GameData.parse_obj(json.loads(raw_game_data))
    await websocket.accept()
    if game_data_object.game_stage == GameStage.WAITING:
        await websocket.send_text(Message(
            message_type=MessageType.GAME,
            turn_data=TurnData(
                board=game_data_object.game_field,
                x_from=None,
                y_from=None,
                x_to=None,
                y_to=None,
            ),
            sender=None,
            game_stage=game_data_object.game_stage,
            turn_color=game_data_object.player_turn,
        ).model_dump_json())
        game_data_object.game_stage = GameStage.ARRANGEMENT
        await redis.set(game_id, game_data_object.model_dump_json())
    if game_data_object.game_stage == GameStage.ARRANGEMENT or game_data_object.game_stage == GameStage.GAME:
        while True:
            raw_game_data = await redis.get(game_id)
            game_data_object = GameData.parse_obj(json.loads(raw_game_data))
            if game_data_object.player_turn == (Color.WHITE if game_data_object.white_player == token else Color.BLACK):
                data = await websocket.receive_json()
                message = Message.parse_obj(data)

                game_data_object.game_stage = message.game_stage
                game_data_object.game_field = message.turn_data.board
                game_data_object.player_turn = Color.BLACK if game_data_object.player_turn == Color.WHITE else Color.WHITE

                await redis.set(game_id, game_data_object.model_dump_json())
                continue

            fr, to = _process_game(game_data_object, token)
            game_data_object.player_turn = Color.BLACK if game_data_object.player_turn == Color.WHITE else Color.WHITE
            await redis.set(game_id, game_data_object.model_dump_json())
            await websocket.send_text(Message(
                message_type=MessageType.GAME,
                turn_data=TurnData(
                    board=game_data_object.game_field,
                    x_from=fr[0] if fr else None,
                    y_from=fr[1] if fr else None,
                    x_to=to[0] if to else None,
                    y_to=to[1] if to else None,
                ),
                sender="bot",
                game_stage=game_data_object.game_stage,
                turn_color=game_data_object.player_turn,
            ).model_dump_json())

            if game_data_object.game_stage == GameStage.END:
                break
    raw_game_data = await redis.get(game_id)
    game_data_object = GameData.parse_obj(json.loads(raw_game_data))
    if game_data_object.game_stage == GameStage.END:
        await websocket.close()
        await redis.hdel(token, "bot")


@api_router.post(
    "/games/create",
    status_code=status.HTTP_201_CREATED,
    response_model=CreateGameResponse,
)
async def create_game(
        model: CreateGameRequest = Body(..., example={
            "name": "example",
            "is_public": True,
            "is_bot": False,
        }),
        redis: Redis = Depends(get_redis),
        token: str = Depends(get_session_token_request),
):
    if model.is_bot:
        bot_game_id = await redis.hget(token, "bot")
        if bot_game_id:
            return CreateGameResponse(game_id=bot_game_id)
    game_id = await redis.hget(token, 'online')
    if game_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User already in game")
    game_name = model.name
    player_color = random.choice(["white", "black"])
    game_info = GameData(
        game_field=create_new_board(),
        name=game_name,
        player_turn=Color.WHITE,
        white_player=token if player_color == "white" else None,
        black_player=token if player_color == "black" else None,
        game_stage=GameStage.WAITING,
    )
    game_id = str(uuid.uuid4())
    if model.is_bot:
        game_id = "bot" + game_id
    await redis.set(game_id, game_info.model_dump_json())
    if not model.is_bot:
        await redis.hset(token, "online", game_id)
    else:
        await redis.hset(token, "bot", game_id)
    if model.is_public:
        await redis.sadd("public_games", game_id)
    return CreateGameResponse(game_id=game_id)


@api_router.get(
    "/games/public",
    response_model=PublicGamesResponse,
    status_code=status.HTTP_200_OK,
)
async def get_public_games(
        redis: Redis = Depends(get_redis),
        token: str = Depends(get_session_token_request),
):
    game_ids = await redis.smembers("public_games")
    games = []
    for game_id in game_ids:
        raw_game_data = await redis.get(game_id)
        if not raw_game_data:
            continue
        game_data_object = GameData.parse_obj(json.loads(raw_game_data))
        if game_data_object.black_player and game_data_object.white_player:
            continue
        games.append(GameLink(game_id=game_id, game_name=game_data_object.name))

    return PublicGamesResponse(games=games)


@api_router.get(
    "/games/{game_id}",
    response_model=GameData,
    status_code=status.HTTP_200_OK,
)
async def get_game(
        game_id: str,
        redis: Redis = Depends(get_redis),
        token: str = Depends(get_session_token_request),
):
    raw_game_data = await redis.get(game_id)
    if not raw_game_data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Game not found")
    game_data_object = GameData.parse_obj(json.loads(raw_game_data))
    if game_data_object.black_player and game_data_object.white_player and token not in [game_data_object.black_player,
                                                                                         game_data_object.white_player]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Game is full")

    if token not in [game_data_object.white_player, game_data_object.black_player]:
        if not game_data_object.white_player:
            game_data_object.white_player = token
        elif not game_data_object.black_player:
            game_data_object.black_player = token
        game_data_object.game_stage = GameStage.ARRANGEMENT
        await redis.hset(token, "online", game_id)
        await redis.set(game_id, game_data_object.model_dump_json())

    return game_data_object


@api_router.get(
    "/games/user/current",
    response_model=CreateGameResponse,
    status_code=status.HTTP_200_OK,
)
async def get_current_game(
        redis: Redis = Depends(get_redis),
        token: str = Depends(get_session_token_request),
):
    game_id = await redis.hget(token, "online")
    if not game_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Game not found")
    return CreateGameResponse(game_id=game_id)


def _process_game(game_data_object: GameData, token: str) -> tuple[tuple[int, int] | None, tuple[int, int] | None]:
    def _eat_pieces(cell: tuple[int, int], direction: tuple[int, int], color: Color, game_data: GameData) -> bool:
        if (
                (cell[0] < 0 or cell[0] >= 5 or cell[1] < 0 or cell[1] >= 5)
                or game_data.game_field[cell[0]][cell[1]] == Color.WITHOUT
        ):
            return False
        if game_data.game_field[cell[0]][cell[1]] == color:
            return True
        check_next = _eat_pieces((cell[0] + direction[0], cell[1] + direction[1]), direction, color, game_data)
        if check_next:
            game_data.game_field[cell[0]][cell[1]] = Color.WITHOUT
        return check_next

    bot_color = Color.BLACK if game_data_object.white_player == token else Color.WHITE
    board = game_data_object.game_field
    if game_data_object.game_stage == GameStage.ARRANGEMENT:
        available_cells = []
        for i in range(5):
            for j in range(5):
                if i == 2 and j == 2:
                    continue
                if board[i][j] == Color.WITHOUT:
                    available_cells.append((i, j))
        added_figure = random.choice(available_cells)
        game_data_object.game_field[added_figure[0]][added_figure[1]] = bot_color
        pieces_count = 0
        for i in range(5):
            for j in range(5):
                if board[i][j] != Color.WITHOUT:
                    pieces_count += 1
        if pieces_count == 24:
            game_data_object.game_stage = GameStage.GAME
        return None, None
    if game_data_object.game_stage == GameStage.GAME:
        available_figures = []
        for i in range(5):
            for j in range(5):
                if board[i][j] == bot_color:
                    available_figures.append((i, j))
        available_cells = []
        figure = None
        while not available_cells:
            figure = random.choice(available_figures)
            for i in range(figure[0] - 1, figure[0] + 2):
                for j in range(figure[1] - 1, figure[1] + 2):
                    if 0 <= i < 5 and 0 <= j < 5 and board[i][j] == Color.WITHOUT:
                        available_cells.append((i, j))
        move = random.choice(available_cells)
        board[move[0]][move[1]] = bot_color
        board[figure[0]][figure[1]] = Color.WITHOUT
        for direction in [(1, 0), (-1, 0), (0, 1), (0, -1), (1, 1), (-1, -1), (1, -1), (-1, 1)]:
            _eat_pieces((move[0] + direction[0], move[1] + direction[1]), direction, bot_color, game_data_object)
        white_count, black_count = 0, 0
        for i in range(5):
            for j in range(5):
                if board[i][j] == Color.WHITE:
                    white_count += 1
                elif board[i][j] == Color.BLACK:
                    black_count += 1
        if white_count < 2 or black_count < 2:
            game_data_object.game_stage = GameStage.END
        return figure, move
