from schemas.game_process import Color


def create_new_board() -> list[list[Color]]:
    board = [[Color.WITHOUT for _ in range(5)] for _ in range(5)]
    board[1][2] = Color.WHITE
    board[3][2] = Color.WHITE
    board[2][1] = Color.BLACK
    board[2][3] = Color.BLACK
    return board

