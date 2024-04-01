import { useEffect, useState } from "react";
import gameStages from "../models/GameStage";
import colors from "../models/Colors";
import Board from "../models/Board";
import turnStages from "../models/TurnStages";

export const useGame = () => {
    const [board, setBoard] = useState(new Board());
    const [playerColor, setPlayerColor] = useState(0);

    const [gameStage, setGameStage] = useState(0);
    const [turnStage, setTurnStage] = useState(1);
    
    const [availableCells, setAvailableCells] = useState([]);
    const [choosedFigure, setChoosedFigure] = useState([]);

    const [figuresCount, setFiguresCount] = useState(4);
    const [whiteCount, setWhiteCount] = useState(0);
    const [blackCount, setBlackCount] = useState(0);
    console.log(whiteCount, blackCount);

    function restart() {
        const newBoard = new Board();
        newBoard.initCells();
        setBoard(newBoard);
    }

    useEffect(() => {
        if (figuresCount === 24) {
            setGameStage(gameStages.play);
            setTurnStage(turnStages.chooseFigure);
            setWhiteCount(12);
            setBlackCount(12);
        }
    }, [figuresCount])

    useEffect(() => {
        if (gameStage === gameStages.play) {
            const [whiteCount, blackCount] = board.getBlackWhiteCount();

            if (whiteCount < 2) {
                setGameStage(gameStages.finish);
            }
            if (blackCount < 2) {
                setGameStage(gameStages.finish);
            }
        }
    }, [figuresCount, whiteCount, blackCount])

    useEffect(() => {
        restart();
    }, [])

    const incrementFigures = () => {
        const [whiteCount, blackCount] = board.getBlackWhiteCount();
        setFiguresCount(whiteCount + blackCount);
        if (playerColor === colors.white) {
            setPlayerColor(colors.black);
        } else {
            setPlayerColor(colors.white);
        }
    }

    const getAvailableCells = (x, y) => {
        if (gameStage === gameStages.arrangement) {
            return board.getFreeCells();
        }
        if (gameStage === gameStages.play) {
            return board.getFreeCellsForFigure(x, y);
        }
        return [];
    }

    const addFigure = (x, y) => {
        board.addFigure(x, y, playerColor);
        incrementFigures();
    }

    const chooseFigure = (x, y) => {
        const availableCellsFromBoard = getAvailableCells(x, y);
        setAvailableCells(availableCellsFromBoard);
        setTurnStage(turnStages.chooseField);
        setChoosedFigure([x, y]);
    }

    const moveFigure = (x, y) => {
        board.moveFigure(choosedFigure[0], choosedFigure[1], x, y);
        const [whiteCount, blackCount] = board.getBlackWhiteCount();
        setWhiteCount(whiteCount);
        setBlackCount(blackCount);
        setChoosedFigure([]);
        setTurnStage(turnStages.chooseFigure);
        setPlayerColor(playerColor === colors.white ? colors.black : colors.white);
        setAvailableCells([]);
    }

    return {board, gameStage, turnStage, playerColor, addFigure, availableCells, chooseFigure, moveFigure}
}