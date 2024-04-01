import enum
from pydantic import BaseModel, Field


class Color(enum.Enum):
    BLACK = "black"
    WHITE = "white"
    WITHOUT = "without"


class GameStage(enum.Enum):
    WAITING = "waiting"
    ARRANGEMENT = "arrangement"
    GAME = "game"
    END = "end"


class MessageType(enum.Enum):
    WAITING = "waiting"
    GAME = "game"


class GameData(BaseModel):
    game_field: list[list[Color]] = Field()
    name: str = Field()
    player_turn: Color = Field()
    white_player: str | None = Field()
    black_player: str | None = Field()
    game_stage: GameStage = Field()


class CreateGameRequest(BaseModel):
    name: str = Field()
    is_public: bool = Field()
    is_bot: bool = Field()


class CreateGameResponse(BaseModel):
    game_id: str = Field()


class TurnData(BaseModel):
    x_from: int | None = Field()
    y_from: int | None = Field()
    x_to: int | None = Field()
    y_to: int | None = Field()
    board: list[list[Color]] = Field()


class Message(BaseModel):
    message_type: MessageType = Field()
    game_stage: GameStage = Field()
    turn_data: TurnData | None = Field()
    sender: str | None = Field()
    turn_color: Color | None = Field()


class GameLink(BaseModel):
    game_id: str = Field()
    game_name: str = Field()


class PublicGamesResponse(BaseModel):
    games: list[GameLink] = Field()

