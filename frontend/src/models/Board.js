import Cell from './Cell.js';
import colors from './Colors.js';
import dicts from '../utils/requestData.js';

export default class Board {
    cells = [];

    initCells = () => {
        for (let i = 0; i < 5; i++) {
            let row = [];
            for (let j = 0; j < 5; j++) {
                if ((i + j) % 2 !== 0) {
                    row.push(new Cell(i, j, colors.white, null, this))
                } else {
                    row.push(new Cell(i, j, colors.black, null, this))
                }
            }
            this.cells.push(row);
        }
        this.cells[1][2].figure_color = colors.white;
        this.cells[2][1].figure_color = colors.black;
        this.cells[2][3].figure_color = colors.black;
        this.cells[3][2].figure_color = colors.white;
    }

    initCellsFromData = (data) => {
        const { colorsDict } = dicts;
        for (let i = 0; i < 5; i++) {
            let row = [];
            for (let j = 0; j < 5; j++) {
                if ((i + j) % 2 !== 0) {
                    row.push(new Cell(i, j, colors.white, colorsDict[data[i][j]], this))
                } else {
                    row.push(new Cell(i, j, colors.black, colorsDict[data[i][j]], this))
                }
            }
            this.cells.push(row);
        }
    }

    addFigure = (x, y, figure_color) => {
        this.cells[x][y].figure_color = figure_color;
    }

    removeFigure = (x, y) => {
        this.cells[x][y].figure_color = null;
    }

    getFreeCells = () => {
        let free_cells = [];
        for (let i = 0; i < this.cells.length; i++) {
            for (let j = 0; j < this.cells[i].length; j++) {
                if (this.cells[i][j].figure_color === null) {
                    free_cells.push([i, j]);
                }
            }
        }
        return free_cells;
    }

    getFreeCellsForFigure = (x, y) => {
        let cell = this.cells[x][y];
        if (cell.figure_color == null) {
            return [];
        }
        let freeCells = [];
        for (let xi = x - 1; xi <= x + 1; xi++) {
            for (let yi = y - 1; yi <= y + 1; yi++) {
                if (xi < 0 || xi > 4 || yi < 0 || yi > 4 || (xi === x && yi === y)) {
                    continue;
                }
                if (this.cells[xi][yi].figure_color == null) {
                    freeCells.push([xi, yi]);
                }
            }
        }
        return freeCells;
    }

    moveFigure = (x, y, xMove, yMove) => {
        let figure = this.cells[x][y];
        this.addFigure(xMove, yMove, figure.figure_color);
        this.removeFigure(x, y);
        figure = this.cells[xMove][yMove];
        for (let xi = xMove - 1; xi <= xMove + 1; xi++) {
            for (let yi = yMove - 1; yi <= yMove + 1; yi++) {
                if (xi - xMove === 0 && yi - yMove === 0) {
                    continue;
                }
                this.removeOpponentFigures(xi, yi, figure.figure_color, xi - xMove, yi - yMove);
            }
        }
    }

    removeOpponentFigures = (x, y, figure_color, directionX, directionY) => {
        if (x < 0 || x > 4 || y < 0 || y > 4 || this.cells[x][y].figure_color === null) {
            return false;
        }
        if (this.cells[x][y].figure_color === figure_color) {
            return true;
        }
        const isDelete = this.removeOpponentFigures(x + directionX, y + directionY, figure_color, directionX, directionY);
        if (isDelete) {
            this.removeFigure(x, y);
        }
        return isDelete;
    }

    getBlackWhiteCount = () => {
        let blackCount = 0;
        let whiteCount = 0;
        for (let i = 0; i < this.cells.length; i++) {
            for (let j = 0; j < this.cells[i].length; j++) {
                if (this.cells[i][j].figure_color === colors.black) {
                    blackCount++;
                } else if (this.cells[i][j].figure_color === colors.white) {
                    whiteCount++;
                }
            }
        }
        return [blackCount, whiteCount];
    }
}
