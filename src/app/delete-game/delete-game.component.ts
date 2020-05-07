import { Component, OnInit, Input } from "@angular/core";
import { NbDialogRef } from "@nebular/theme";
import { AngularFireDatabase } from "@angular/fire/database";
import {
  AngularFirestore,
  AngularFirestoreDocument,
} from "@angular/fire/firestore";
import { firestore } from "firebase/app";
import { User } from "../models/user";

@Component({
  selector: "app-delete-game",
  templateUrl: "./delete-game.component.html",
  styleUrls: ["./delete-game.component.scss"],
})
export class DeleteGameComponent implements OnInit {
  @Input() key: string;
  @Input() uid: string;

  constructor(
    protected dialogRef: NbDialogRef<DeleteGameComponent>,
    private db: AngularFireDatabase,
    private afs: AngularFirestore
  ) {}

  ngOnInit(): void {}

  async deleteGame() {
    // Delete Game from RTDB
    const gameRef = this.db.list("tictactoe");
    gameRef.remove(this.key);
    // Decrement Counter
    const player1Ref: AngularFirestoreDocument<User> = this.afs.doc(
      `users/${this.uid}`
    );
    const decrement = firestore.FieldValue.increment(-1);
    player1Ref.update({ createdGames: decrement });
    // Close Dialogue
    this.dialogRef.close();
  }

  dismiss() {
    this.dialogRef.close();
  }
}
