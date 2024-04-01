import colors from "../../models/Colors"
import gameStages from "../../models/GameStage";
import turnStages from "../../models/TurnStages";

import "./Cell.css";

const CellComponent = ({ cell, gameStage, turnStage, playerColor, addFigure, availableCells, chooseFigure, moveFigure, playerTurn, move }) => {
    let color;
    if (cell.color === colors.black) {
        color = "black";
    } else {
        color = "white";
    }

    let available = "available";
    if (!playerTurn) {
        available = "unavailable";
    }
    if (gameStage === gameStages.arrangement) {
        if (cell.figure_color !== null || (cell.x === 2 && cell.y === 2)) {
            available = "unavailable";
        }
    }
    if (gameStage === gameStages.play) {
        if (turnStage === turnStages.block) {
            available = "unavailable";
        }
        if (turnStage === turnStages.chooseFigure) {
            if (cell.figure_color !== playerColor) {
                available = "unavailable";
            }
        }
        if (turnStage === turnStages.chooseField) {
            if (cell.figure_color === (playerColor + 1) % 2) {
                available = "unavailable";
            }
            if (cell.figure_color === null && JSON.stringify(availableCells).indexOf(JSON.stringify([cell.x, cell.y])) === -1) {
                available = "unavailable";
            }
        }
    }
    if (gameStage === gameStages.finish) {
        available = "unavailable";
    }

    let figureClass = "";
    if (cell.figure_color === colors.black) {
        figureClass = "blackFigure";
    }
    if (cell.figure_color === colors.white) {
        figureClass = "whiteFigure";
    }

    let triggerFunction;
    if (gameStage === gameStages.arrangement) {
        triggerFunction = () => {
            addFigure(cell.x, cell.y)
        }
    }
    if (gameStage === gameStages.play) {
        if (turnStage === turnStages.chooseFigure) {
            triggerFunction = () => {
                chooseFigure(cell.x, cell.y);
            }
        }
        if (turnStage === turnStages.chooseField) {
            if (cell.figure_color === null) {
                triggerFunction = () => {
                    moveFigure(cell.x, cell.y);
                }
            } else {
                triggerFunction = () => {
                    chooseFigure(cell.x, cell.y);
                }
            }
        }
    }

    let focus = "";
    if (gameStage === gameStages.arrangement) {
        if (cell.figure_color === null && (cell.x !== 2 || cell.y !== 2)) {
            focus = "focus";
        }
    }
    if (gameStage === gameStages.play) {
        if (turnStage === turnStages.chooseField) {
            if (JSON.stringify(availableCells).indexOf(JSON.stringify([cell.x, cell.y])) !== -1) {
                focus = "focus";
            }
        }    
    }
    if (!playerTurn) {
        focus = "";
    }

    let colored = "";
    if (move) {
        colored = "colored";
    }

    return (
        <div
            className={['cell', color, available, figureClass, focus, colored].join(" ")}
            onClick={triggerFunction}
        ></div>
    )
}

export default CellComponent