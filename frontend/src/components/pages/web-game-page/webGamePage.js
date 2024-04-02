import { useState, useEffect } from "react";
import { useParams } from 'react-router-dom';

import Board from "../../../models/Board";
import dicts from "../../../utils/requestData";
import WebBoardComponent from "../../web-board/Board";

import "./webGamePage.css";
import gameStages from "../../../models/GameStage";

const WebGamePage = () => {
    const { russianGameStagesToStr, russianColorsToStr } = dicts;

    const [ board, setBoard ] = useState(new Board());
    const [ gameStage, setGameStage ] = useState(0);
    const [ playerColor, setPlayerColor ] = useState(2);
    const [ playerTurn, setPlayerTurn ] = useState(false);

    const { gameId } = useParams();


    const updateOuterState = (newState) => {
        setBoard(newState.board);
        setGameStage(newState.gameStage);
        setPlayerColor(newState.playerColor);
        setPlayerTurn(newState.playerTurn);
    }

    return (
        <>
            <h1 className="webpage__title">Игра по сети</h1>
            {
                gameStage === gameStages.waiting ?
                    <div className="webpage__link">
                        <div className="webpage__linkblock">
                            <p className="link__text">Ссылка для приглашения:</p>
                            <button className="link__url" onClick={() => {
                                navigator.clipboard.writeText(window.location.href);
                                document.querySelector(".link__message").innerText = "Ссылка скопирована";
                            }}></button>
                        </div>
                        <p className="link__message"></p>
                    </div>
                    : null
            }
            <div className="webpage__board">
                <p className="board__game-stage">Стадия: {russianGameStagesToStr[gameStage]}</p>
                <WebBoardComponent key={gameId} gameId={gameId} isBot={false} updateOuterState={updateOuterState}/>
                <p className={`board__whos-turn ${playerTurn ? "your" : "enemy"}`}>
                    {
                        playerTurn ? "Ваш ход" : "Ход противника"
                    
                    }
                </p>
                <p className="board__players-color">
                    Вы играете <span>{russianColorsToStr[playerColor]}</span> фигурами
                </p>
            </div>
        </>
    );
}

export default WebGamePage;
