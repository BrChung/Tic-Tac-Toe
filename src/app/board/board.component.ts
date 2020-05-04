import { Component, OnInit } from "@angular/core";

@Component({
  selector: "app-board",
  templateUrl: "./board.component.html",
  styleUrls: ["./board.component.scss"],
})
export class BoardComponent implements OnInit {
  squares: any[];
  xIsNext: boolean;
  winner: string;
  draw: boolean;
  gameOver: boolean;
  winningLine: any[];

  constructor() {}

  ngOnInit(): void {
    this.newGame();
  }

  newGame(): void {
    this.squares = Array(9).fill(null);
    this.winner = null;
    this.xIsNext = true;
    this.gameOver = false;
    this.draw = false;
    this.winningLine = [...Array(9).keys()];
  }

  get player(): string {
    return this.xIsNext ? "O" : "X";
  }

  takeTurn(index: number) {
    if (!this.squares[index]) {
      this.squares.splice(index, 1, this.player);
      this.xIsNext = !this.xIsNext;
    }

    this.winner = this.calculateWinner();
    this.draw = this.checkDraw();
    if (this.winner || this.draw) {
      this.gameOver = true;
    }
  }

  calculateWinner() {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (
        this.squares[a] &&
        this.squares[a] === this.squares[b] &&
        this.squares[a] === this.squares[c]
      ) {
        this.winningLine = [a, b, c];
        return this.squares[a];
      }
    }
    return null;
  }

  checkDraw() {
    for (let i = 0; i < this.squares.length; i++) {
      if (!this.squares[i]) {
        return false;
      }
    }
    if (!this.winner) {
      return true;
    } else {
      return false;
    }
  }
}
