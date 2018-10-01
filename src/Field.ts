import {  } from "process";

export enum FieldState {
  DEFAULT,
  REVEALED,
  EXPLODED,
  FLAGGED,
}

// FSM for states
// DEFAULT -> REVEALED | EXPLODED | FLAGGED
// FLAGGED -> REVEALED | EXPLODED | DEFAULT
// REVEALED -> 
// EXPLODED -> 

export default class Field {
  public isRevealed: boolean = false
  public hasMine: boolean = false
  public isFlagged: boolean = false
  public state: FieldState = process.env.NODE_ENV === 'debug' ? FieldState.REVEALED : FieldState.DEFAULT
  public neighbours: number = 0

  /**
   * Reveal a field
   * Entry states: DEFAULT | FLAGGED
   */
  reveal(): void {
    if (this.state != FieldState.DEFAULT && this.state != FieldState.FLAGGED) {
      return
    }
    this.isRevealed = true
    // A flag on a revealed field doesn't apply
    this.isFlagged = false
    if (this.hasMine) {
      this.state = FieldState.EXPLODED
    }
    else {
      this.state = FieldState.REVEALED
    }
  }

  toggleFlag(): void {
    // Game rules don't allow flagging of revealed fields
    if (this.state != FieldState.DEFAULT && this.state != FieldState.FLAGGED) {
      return
    }
    this.isFlagged = !this.isFlagged
    this.state = this.isFlagged ? FieldState.FLAGGED : FieldState.DEFAULT
  }

  toString(revealAll: boolean = false): string {
    const S = {
      [FieldState.DEFAULT]: '.',
      [FieldState.REVEALED]: this.hasMine ? 'x' : '' + this.neighbours,
      [FieldState.EXPLODED]: 'X',
      [FieldState.FLAGGED]: '!',
    }

    const state = revealAll && this.state === FieldState.DEFAULT ? FieldState.REVEALED : this.state
    return S[state]
  }

}