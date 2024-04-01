import React, { useEffect } from 'react';
import CellComponent from "./Cell";
import "./Board.css"
import { useGame } from '../../hooks/game.hook';

const BoardComponent = ({ updateOuterState }) => {
    const { board, gameStage, turnStage, playerColor, addFigure, availableCells, chooseFigure, moveFigure } = useGame();
    useEffect(() => {
        updateOuterState({ board, gameStage, playerColor });
    }, [board, gameStage, playerColor]);
    return (
        <div
            className="board"
            style={{ width: `calc(64px * ${board.cells.length})`, height: `calc(64px * ${board.cells.length})` }}>
            {
                board.cells.map((row, index) =>
                    <React.Fragment key={index}>
                        {
                            row.map(cell =>
                                <CellComponent
                                    cell={cell}
                                    gameStage={gameStage}
                                    turnStage={turnStage}
                                    playerColor={playerColor}
                                    addFigure={addFigure}
                                    availableCells={availableCells}
                                    chooseFigure={chooseFigure}
                                    moveFigure={moveFigure}
                                    key={cell.id}
                                >
                                </CellComponent>
                            )
                        }
                    </React.Fragment>
                )
            }
        </div>
    )
}

export default BoardComponent;