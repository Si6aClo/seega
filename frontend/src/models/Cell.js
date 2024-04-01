export default class Cell {
    constructor(x, y, color, figure_color, board) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.figure_color = figure_color;
        this.board = board;
        this.available = false;
        this.id = Math.random();
    }
}