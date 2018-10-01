import Field, { FieldState } from './Field'


export default class Board {
  private fields: Field[][]
  private nMines: number
  readonly width: number
  readonly height: number
  private _lost: boolean = false
  private _won: boolean = false

  get lost() {
    return this._lost
  }
  get won() {
    return this._won
  }

  constructor(width: number, height: number, nMines: number) {
    this.width = width
    this.height = height
    this.nMines = 0 // This will be updated later

    // Create a width * height matrix of default fields
    this.fields = arrayWith(height, _ => arrayWith(width, _ => new Field()))

    this.addRandomMines(nMines)
    this.setNeighbours()
  }

  addRandomMines(nMines: number) {
    while (this.nMines < nMines) {
      const x = Math.floor(Math.random() * this.width)
      const y = Math.floor(Math.random() * this.height)
      const field = this.fields[y][x]
      if (!field.hasMine) {
        field.hasMine = true
        this.nMines++
      }
    }
  }

  setNeighbours() {
    this.forEach((row, col, field) => {
      if (field.hasMine) {
        this.forNeighbours(row, col, (field) => field.neighbours++)
      }
    })
  }

  flag(row: number, col: number): void {
    this.fields[row][col].toggleFlag()
  }

  reveal(row: number, col: number): void {
    const field = this.fields[row][col]
    if (field.isRevealed) {
      return
    }
    field.reveal()
    if (field.state === FieldState.EXPLODED) {
      this._lost = true
      return
    }
    if (field.neighbours === 0){
      this.forNeighbours(row, col, (_, row, col) => this.reveal(row, col))
    }
    this.checkWinningConditions()
  }

  checkWinningConditions() {
    const values = this.forEach((row, col, field) => field.isRevealed ? 0 : 1)
    if (values) {
      // Assume all mines are hidden since we exit when one explodes.
      const hiddenCells = [].concat(...values).reduce((p,c) => p + c, 0)
      if (hiddenCells === this.nMines) {
        this._won = true
      }
    }
  }

  forEach<T>(fn: (row: number, col: number, field: Field) => T): T[][]|void {
    return this.fields.map((row, y) => row.map((field, x) => fn(y, x, field)))
  }
  
  forNeighbours(row: number, col: number, fn: (field: Field, row: number, col: number) => void): void {
    // Imperative version
    for (let r = row - 1; r <= row + 1; r++) {
      for (let c = col - 1; c <= col + 1; c ++) {
        if ((r != row || c != col) && r >= 0 && r < this.height && c >= 0 && c < this.width) {
          fn(this.fields[r][c], r, c)
        }
      }
    }
    // Functional version
    // const neighbourRows = this.fields.slice(Math.max(row - 1, 0), row + 2)
    // neighbourRows.forEach((_row, r) => {
    //   const neighbourCells = _row.slice(Math.max(col - 1, 0), col + 2)
    //   neighbourCells.forEach((cell, c) => {
    //     // Ignore the center cell
    //     if (cell !== this.fields[row][col]) {
    //       fn(cell, row + r, col + c)
    //     }
    //   })
    // })
  }

  toString(revealAll: boolean = false) {
    const rowHeaderWidth = (this.height - 1).toString().length + 2 // extra space for the colon
    const colHeaderWidth = (this.width - 1).toString().length + 1
    return colHeaders(this.width, rowHeaderWidth, colHeaderWidth) +
    this.fields
    .map((row, r) => 
      `${r}: `.padStart(rowHeaderWidth) +
      row.map(cell => cell.toString(revealAll).padStart(colHeaderWidth))
      .join(''))
    .join('\n')
  }
}

function arrayWith(size: number, item: Function) {
  return Array(size).fill(0).map((k, i) => item(k, i))
}

function colHeaders(width: number, leftPadding: number, colPadding: number) {
  return ' '.repeat(leftPadding) +
    arrayWith(width, (_, i) => String(i).padStart(colPadding)).join('') + '\n' +
    ' '.repeat(leftPadding) + '_'.padStart(colPadding).repeat(width) + '\n'

}