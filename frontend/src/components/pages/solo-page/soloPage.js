import { useState } from "react";
import { useParams } from 'react-router-dom';

import Board from "../../../models/Board";
import dicts from "../../../utils/requestData";
import WebBoardComponent from "../../web-board/Board";

import useCheckGameExists from "../../../services/checkGameExists";

import "./soloPage.css";
import BoardComponent from "../../solo-board/Board";

const SoloPage = () => {
    useCheckGameExists();
    const { russianGameStagesToStr, russianColorsToStr } = dicts;

    const [ board, setBoard ] = useState(new Board());
    const [ gameStage, setGameStage ] = useState(0);
    const [ playerColor, setPlayerColor ] = useState(2);

    const updateOuterState = (newState) => {
        setBoard(newState.board);
        setGameStage(newState.gameStage);
        setPlayerColor(newState.playerColor);
    }

    return (
        <>
            <h1 className="webpage__title">Игра на одном устройстве</h1>
            <div className="webpage__board">
                <p className="board__game-stage">Стадия: {russianGameStagesToStr[gameStage]}</p>
                <BoardComponent updateOuterState={updateOuterState}/>
                <p className="board__players-color">
                    Ход игрока, играющего <span>{russianColorsToStr[playerColor]}</span> фигурами
                </p>
            </div>
        </>
    );
}

export default SoloPage;
