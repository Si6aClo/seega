import React, { useEffect } from 'react';
import CellComponent from "./Cell";
import "./Board.css"
import { useWebGame } from '../../hooks/web.game.hook';

const WebBoardComponent = ({ gameId, isBot, updateOuterState }) => {
    const {
        board,
        gameStage,
        turnStage,
        playerColor,
        addFigure,
        availableCells,
        chooseFigure,
        moveFigure,
        lastMove,
        playerTurn,
    } = useWebGame(gameId, isBot);
    let from = [];
    let to = [];
    if (lastMove.length === 2) {
        from = lastMove[0];
        to = lastMove[1];
    }

    useEffect(() => {
        updateOuterState({
            board: board,
            gameStage: gameStage,
            playerColor: playerColor,
            playerTurn: playerTurn
        })
    }, [playerTurn, gameStage])

    return (
        <div
            className="board"
            style={{ width: `calc(64px * ${board.cells.length})`, height: `calc(64px * ${board.cells.length})` }}>
            {
                board.cells.map((row, index) =>
                    <React.Fragment key={index}>
                        {
                            // if cell have from or to coordinates, 
                            row.map(cell => {
                                let move = false;
                                if (from.length !== 0 && to.length !== 0) {
                                    if (cell.x === from[0] && cell.y === from[1]) {
                                        move = true;
                                    }
                                    if (cell.x === to[0] && cell.y === to[1]) {
                                        move = true;
                                    }
                                }
                                return <CellComponent
                                    cell={cell}
                                    gameStage={gameStage}
                                    turnStage={turnStage}
                                    playerColor={playerColor}
                                    addFigure={addFigure}
                                    availableCells={availableCells}
                                    chooseFigure={chooseFigure}
                                    moveFigure={moveFigure}
                                    playerTurn={playerTurn}
                                    move={move}
                                    key={cell.id}
                                >
                                </CellComponent>
                            })
                        }
                    </React.Fragment>
                )
            }
        </div>
    )
}

export default WebBoardComponent;