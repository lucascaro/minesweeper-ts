import Board from "./Board";
import Game from "./Game";

console.log('TypeScript Minesweeper')

const board = new Board(10, 10, 10)

console.log()

const game = new Game(board)
game.start()