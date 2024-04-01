import { useEffect, useState } from "react";
import useWebGameService from "../services/webGameService";
import gameStages from "../models/GameStage";
import turnStages from "../models/TurnStages";

export const useWebGame = (gameId, isBot) => {
    const { board, lastMove, playerColor, playerTurn, gameStage, setGameStage, sendTurn } = useWebGameService(gameId, isBot);

    const [turnStage, setTurnStage] = useState(1);
    const [availableCells, setAvailableCells] = useState([]);
    const [choosedFigure, setChoosedFigure] = useState([]);

    useEffect(() => {
        updateCounts();
    }, [lastMove]);

    const getAvailableCells = (x, y) => {
        if (gameStage === gameStages.arrangement) {
            return board.getFreeCells();
        }
        if (gameStage === gameStages.play) {
            return board.getFreeCellsForFigure(x, y);
        }
        return [];
    }

    const updateCounts = () => {
        const [whiteCountF, blackCountF] = board.getBlackWhiteCount();
        if (whiteCountF + blackCountF === 24) {
            setGameStage(gameStages.play);
            setTurnStage(turnStages.chooseFigure);
            return gameStages.play;
        }
        return gameStage;
    }

    const addFigure = (x, y) => {
        board.addFigure(x, y, playerColor);
        const stage = updateCounts();
        sendTurn(stage);
    }

    const chooseFigure = (x, y) => {
        const availableCellsFromBoard = getAvailableCells(x, y);
        setAvailableCells(availableCellsFromBoard);
        setTurnStage(turnStages.chooseField);
        setChoosedFigure([x, y]);
    }

    const moveFigure = (x, y) => {
        board.moveFigure(choosedFigure[0], choosedFigure[1], x, y);
        const [ whiteCount, blackCount ] = board.getBlackWhiteCount();
        setChoosedFigure([]);
        setTurnStage(turnStages.chooseFigure);
        setAvailableCells([]);
        let stage = null;
        if (gameStage === gameStages.play) {
            if (whiteCount < 2) {
                setGameStage(gameStages.finish);
                stage = gameStages.finish;
            }
            if (blackCount < 2) {
                setGameStage(gameStages.finish);
                stage = gameStages.finish;
            }
        }
        sendTurn(stage, choosedFigure[0], choosedFigure[1], x, y);
    }

    return { board, gameStage, turnStage, playerColor, addFigure, availableCells, chooseFigure, moveFigure, lastMove, playerTurn }
}