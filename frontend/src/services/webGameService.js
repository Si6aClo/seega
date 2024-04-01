import { useState, useEffect } from "react";
import { useHttp } from "../hooks/http.hook";
import Cookies from "js-cookie";
import Board from "../models/Board";
import colors from "../models/Colors";
import dicts from "../utils/requestData";

const useWebGameService = (gameId, isBot = false) => {
  const { colorsDict, gameStagesDict, gameStagesToStr, ColorsToStr } = dicts;
  const [board, setBoard] = useState(new Board());
  const [lastMove, setLastMove] = useState([]);
  const [playerColor, setPlayerColor] = useState(2);
  const [playerTurn, setPlayerTurn] = useState(false);
  const [gameStage, setGameStage] = useState(0);

  const [lastMessage, setLastMessage] = useState(null);
  const [socket, setSocket] = useState(null);
  const { request } = useHttp();

  const baseUrl = "http://127.0.0.1:8000/api/v1";
  const userToken = Cookies.get("XUserToken");

  useEffect(() => {
    getGame();
    let newSocket;
    if (!isBot) {
      newSocket = new WebSocket(`ws://127.0.0.1:8000/api/v1/games/${gameId}?token=${userToken}`);
    } else {
      newSocket = new WebSocket(`ws://127.0.0.1:8000/api/v1/games/bot/${userToken}`);
    }
    setSocket(newSocket);
  }, []);

  useEffect(() => {
    if (lastMessage === null) return;
    const data = lastMessage;
    console.log(data);
    if (data.sender === userToken || data.message_type === "waiting") {
      return;
    }
    setGameStage(gameStagesDict[data.game_stage]);
    const newBoard = new Board();
    newBoard.initCellsFromData(data.turn_data.board);
    setBoard(newBoard);
    setLastMove([[data.turn_data.x_from, data.turn_data.y_from], [data.turn_data.x_to, data.turn_data.y_to]]);
    if (colorsDict[data.turn_color] === playerColor) {
      setPlayerTurn(true);
    }
  }, [lastMessage]);

  useEffect(() => {
    if (!socket) return;
    socket.onmessage = (event, localPlayerColor = playerColor) => {
      setLastMessage(JSON.parse(event.data));
    };
  }, [socket]);

  const getGame = async () => {
    const data = await request(`${baseUrl}/games/${gameId}/`, "GET");
    let color
    if (data.white_player === userToken) {
      setPlayerColor(colors.white);
      color = colors.white;
    } else if (data.black_player === userToken) {
      setPlayerColor(colors.black);
      color = colors.black;
    }
    if (colorsDict[data.player_turn] === colors.white) {
      setPlayerTurn(color === colors.white);
    }
    if (colorsDict[data.player_turn] === colors.black) {
      setPlayerTurn(color === colors.black);
    }
    const board = new Board();
    board.initCellsFromData(data.game_field);
    setBoard(board);
    setGameStage(gameStagesDict[data.game_stage]);
  };

  const sendTurn = (stage = null, x_from = null, y_from = null, x_to = null, y_to = null) => {
    if (stage === null) {
      stage = gameStage;
    }
    setLastMove([[x_from, y_from], [x_to, y_to]]);
    const data = {
      message_type: "game",
      game_stage: gameStagesToStr[stage],
      turn_data: {
        board: board.cells.map(row => row.map(cell => ColorsToStr[cell.figure_color])),
        x_from: x_from,
        y_from: y_from,
        x_to: x_to,
        y_to: y_to,
      },
      sender: userToken,
      turn_color: playerColor === colors.white ? ColorsToStr[colors.black] : ColorsToStr[colors.white],
    }
    socket.send(JSON.stringify(data));
    setPlayerTurn(false);
  }

  return { board, lastMove, playerColor, playerTurn, gameStage, setGameStage, sendTurn };
}

export default useWebGameService;