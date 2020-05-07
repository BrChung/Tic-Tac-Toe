import { Component, OnInit, OnDestroy, HostListener } from "@angular/core";
import { AngularFireAuth } from "@angular/fire/auth";
import { ActivatedRoute } from "@angular/router";
import { Subscription } from "rxjs";
import { tap, take } from "rxjs/operators";
import { AngularFireDatabase } from "@angular/fire/database";
import { AngularFirestore } from "@angular/fire/firestore";
import { NbToastrService } from "@nebular/theme";
import { User } from "../models/user";

@Component({
  selector: "app-online-tictactoe",
  templateUrl: "./online-tictactoe.component.html",
  styleUrls: ["./online-tictactoe.component.scss"],
})
export class OnlineTictactoeComponent implements OnInit, OnDestroy {
  @HostListener("window:resize", ["$event"])
  onResize(event) {
    this.innerWidth = event.target.innerWidth;
  }
  innerWidth: number;

  private routerSub: Subscription;
  private boardSub: Subscription;
  private loadedBoard = false;
  private key: string;
  player1UID: string;
  player1ImgURL: string;
  player1Name: string;
  player2UID: string;
  player2ImgURL: string;
  player2Name: string;

  // Game State
  squares: any[];
  xIsNext: boolean;
  xCounter: number;
  oCounter: number;
  winner: string;
  draw: boolean;
  gameOver: boolean;
  winningLine: any[];
  gamesXWon: string;
  gamesOWon: string;

  constructor(
    private route: ActivatedRoute,
    private db: AngularFireDatabase,
    private afs: AngularFirestore,
    private toastrService: NbToastrService,
    public afAuth: AngularFireAuth
  ) {}

  ngOnInit(): void {
    this.innerWidth = window.innerWidth;

    this.routerSub = this.route.params.subscribe((params) => {
      this.key = params["key"];
    });

    this.boardSub = this.db
      .object(`tictactoe/${this.key}`)
      .valueChanges()
      .subscribe((data) => {
        if (!this.loadedBoard) {
          this.afs
            .doc<User>(`users/${data["player1"]}`)
            .valueChanges()
            .pipe(take(1))
            .subscribe((user) => {
              this.player1ImgURL = user.photoURL;
              this.player1Name = user.displayName;
            });
          this.afs
            .doc<User>(`users/${data["player2"]}`)
            .valueChanges()
            .pipe(take(1))
            .subscribe((user) => {
              this.player2ImgURL = user.photoURL;
              this.player2Name = user.displayName;
            });
          this.player1UID = data["player1"];
          this.player2UID = data["player2"];
          this.loadedBoard = true;
        }

        if (data["squares"]) {
          const squares = data["squares"];
          if (typeof squares !== "object") {
            this.squares = squares;
            for (let i = squares.length; i < 9; i++) {
              this.squares.push(null);
            }
          } else {
            this.squares = [];
            for (let i = 0; i < 9; i++) {
              this.squares.push(squares.hasOwnProperty(i) ? squares[i] : null);
            }
          }
        } else {
          this.squares = Array(9).fill(null);
        }
        if (data["winningLine"]) {
          this.winningLine = data["winningLine"];
        } else {
          this.winningLine = [...Array(9).keys()]; //Fills array from 0-8
        }

        this.oCounter = data["oCounter"];
        this.xCounter = data["xCounter"];
        this.gamesXWon = "👑 ".concat(String(this.xCounter));
        this.gamesOWon = "👑 ".concat(String(this.oCounter));
        this.xIsNext = data["xIsNext"];
        this.gameOver = data["gameOver"];
      });

    this.winner = null;
    this.draw = false;
  }
  ngOnDestroy(): void {
    this.routerSub.unsubscribe();
    this.boardSub.unsubscribe();
  }

  newGame(): void {
    this.winner = null;
    this.draw = false;
    this.db.list("tictactoe").update(this.key, {
      xIsNext: Boolean(Math.round(Math.random())),
      squares: null,
      gameOver: false,
      winningLine: null,
    });
  }

  get player(): string {
    return this.xIsNext ? "O" : "X";
  }

  takeTurn(index: number) {
    if (!this.squares[index]) {
      this.squares.splice(index, 1, this.player);
      this.xIsNext = !this.xIsNext;

      this.winner = this.calculateWinner();
      this.draw = this.checkDraw();
      if (this.winner === "X") {
        this.showToast("", "Player 1 Won", "bottom-start", "success");
        this.xCounter++;
      } else if (this.winner === "O") {
        this.showToast("", "Player 2 Won", "bottom-end", "info");
        this.oCounter++;
      }
      if (this.draw) {
        this.showToast("", "It's a Draw!", "bottom-end", "warning");
        this.winningLine = [];
      }
      if (this.winner || this.draw) {
        this.gameOver = true;
      }
      this.db.list("tictactoe").update(this.key, {
        xIsNext: this.xIsNext,
        squares: this.squares,
        oCounter: this.oCounter,
        xCounter: this.xCounter,
        winningLine: this.winningLine,
        gameOver: this.gameOver,
      });
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
