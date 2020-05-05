import { Component, OnInit, HostListener } from "@angular/core";
import { NbToastrService } from "@nebular/theme";

@Component({
  selector: "app-board",
  templateUrl: "./board.component.html",
  styleUrls: ["./board.component.scss"],
})
export class BoardComponent implements OnInit {
  @HostListener("window:resize", ["$event"])
  onResize(event) {
    this.innerWidth = event.target.innerWidth;
  }
  innerWidth: number;

  // Game State
  squares: any[];
  xIsNext: boolean;
  xCounter: number = 0;
  oCounter: number = 0;

  // Front End
  winner: string;
  draw: boolean;
  gameOver: boolean;
  winningLine: any[];
  gamesXWon: string;
  gamesOWon: string;

  constructor(private toastrService: NbToastrService) {}

  ngOnInit(): void {
    this.innerWidth = window.innerWidth;
    this.newGame();
  }

  newGame(): void {
    this.squares = Array(9).fill(null);
    this.winner = null;
    this.xIsNext = Boolean(Math.round(Math.random())); //X or O start random
    this.gameOver = false;
    this.draw = false;
    this.winningLine = [...Array(9).keys()]; //Fills array from 0-8
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
    if (this.winner === "X") {
      this.showToast("", "Player 1 Won", "bottom-start", "success");
      this.xCounter++;
      this.gamesXWon = "👑 ".concat(String(this.xCounter));
    } else if (this.winner === "O") {
      this.showToast("", "Player 2 Won", "bottom-end", "info");
      this.oCounter++;
      this.gamesOWon = "👑 ".concat(String(this.oCounter));
    }
    if (this.draw) {
      this.showToast("", "It's a Draw!", "bottom-end", "warning");
      this.winningLine = [];
    }
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

  showToast(message: string, title: string, position: any, status: any) {
    this.toastrService.show(message, title, {
      position,
      status,
      icon: "heart",
    });
  }
}
