import Board from './Board'
import { ReadLine, createInterface } from 'readline';

export default class Game {
  private board: Board
  public ended: boolean = false
  public won: boolean = false
  
  private rl: ReadLine

  constructor(board: Board) {
    this.board = board
    this.rl = createInterface({input: process.stdin, output: process.stdout})
  }

  async start() {
    console.log('Starting new game...')
    this.showHelp()
    while (!this.ended) {
      await this.gameLoop()
    }
    console.log(this.board.toString(true))
    if (this.board.lost) {
      console.log('You lost! Better luck next time!')
    }
    else if (this.board.won) {
      console.log('You won! Congratulations!')
    }
    else {
      console.log('Bye!')
    }
    this.rl.close()
  }

  gameLoop() {
    return new Promise((resolve) => {
      console.log('')
      console.log(this.board.toString())
      this.rl.question('Your action? <rfq?>\n', (answer) => {
        const [cmd, row, col] = answer.split(' ').map(i => i.toUpperCase())
        const methods = { 'F': 'flag', 'R': 'reveal'}
        switch (cmd) {
          case '?':
            this.showHelp()
            break
          case 'Q':
            this.ended = true
            break;
          case 'F':
          case 'R':
            const method = methods[cmd]
            this.checkInput(row, col, (row, col) => this.board[method](row, col))
            if (this.board.won || this.board.lost) {
              this.ended = true
            }
            break
          default:
            console.warn(`Invalid command: ${cmd}`)
        }
        resolve(answer)
      })
    })
  }

  checkInput(row: string, col: string, fn: (row: number, col: number) => void) {
    const rowN = parseInt(row)
    const colN = parseInt(col)
    const invalidRow = isNaN(rowN) || rowN < 0 || rowN >= this.board.width 
    const invalidCol = isNaN(colN) || colN < 0 || colN >= this.board.height
    if (invalidRow || invalidCol) {
      console.warn('Invalid input: row and column must be numbers')
    }
    else {
      fn(rowN, colN)
    }
  }
  
  showHelp() {
    console.log('')
    console.log('In-game commands:')
    console.log('<(R)eveal|(F)lag> <ROW> <COL>')
    console.log('    -- Reveal or flag a given cell')
    console.log('    Example: R52 -- reveal cell at row 5, column 2')
    console.log('<(Q)uit>')
    console.log('? -- show this help')
    console.log('')
  }
}