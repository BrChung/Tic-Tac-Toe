import { Component, OnInit, OnDestroy } from "@angular/core";
import { AngularFireAuth } from "@angular/fire/auth";
import {
  AngularFirestore,
  AngularFirestoreDocument,
} from "@angular/fire/firestore";
import { AngularFireDatabase } from "@angular/fire/database";
import {
  tap,
  first,
  map,
  take,
  debounceTime,
  startWith,
  flatMap,
} from "rxjs/operators";
import {
  FormBuilder,
  FormGroup,
  FormControl,
  FormArray,
  Validators,
  ValidationErrors,
  AbstractControl,
} from "@angular/forms";
import { User } from "../models/user";
import { Subscription } from "rxjs";
import { Router } from "@angular/router";
import { firestore } from "firebase/app";

@Component({
  selector: "app-online-games",
  templateUrl: "./online-games.component.html",
  styleUrls: ["./online-games.component.scss"],
})
export class OnlineGamesComponent implements OnInit, OnDestroy {
  emailForm: FormGroup;
  player1: User;
  player2: User;
  gamesCreated: any;
  gamesJoined: any;
  private player1Sub: Subscription;
  private player2Sub: Subscription;
  loadedData: boolean = false;
  profileImage = new Map();

  constructor(
    private fb: FormBuilder,
    public afAuth: AngularFireAuth,
    private afs: AngularFirestore,
    private db: AngularFireDatabase,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.emailForm = this.fb.group({
      email: [
        [],
        [Validators.required, Validators.email],
        EmailValidator.Email(this.afs),
      ],
    });
  }

  ngOnDestroy(): void {
    this.player1Sub.unsubscribe();
    this.player2Sub.unsubscribe();
  }

  get email() {
    return this.emailForm.get("email");
  }

  async getActiveGames() {
    if (!this.loadedData) {
      const currentUser = await this.afAuth.currentUser;
      const gamesCreatedQuery = this.db
        .list("tictactoe", (ref) =>
          ref.orderByChild("player1").equalTo(currentUser.uid)
        )
        .snapshotChanges();
      gamesCreatedQuery.subscribe(async (data) => {
        data.forEach((entry) => {
          const uid = entry.payload.val()["player2"];
          if (!this.profileImage.has(uid)) {
            this.profileImage.set(uid, null);
          }
        });
        const keys = Array.from(this.profileImage.keys());
        let lookUp = [];
        keys.forEach((key) => {
          if (!this.profileImage.get(key)) {
            lookUp.push(key);
          }
        });
        if (lookUp.length > 0) {
          await new Promise((resolve) => {
            lookUp.forEach((uid) => {
              this.afs
                .doc<User>(`users/${uid}`)
                .valueChanges()
                .pipe(take(1))
                .subscribe((user) => {
                  this.profileImage.set(uid, user.photoURL);
                  resolve();
                });
            });
          });
        }
        this.gamesCreated = data;
      });
    }
    this.loadedData = true;
  }

  async submitHandler() {
    const currentUser = await this.afAuth.currentUser;
    const player2Email = this.emailForm.value.email;

    if (this.emailForm.value.email === currentUser.email) {
      console.log("Error! You cannot start a game with yourself");
    } else {
      await new Promise((resolve) => {
        const player1Doc = this.afs
          .collection<User>("users", (ref) =>
            ref.where("email", "==", currentUser.email).limit(1)
          )
          .valueChanges()
          .pipe(flatMap((users) => users));
        this.player1Sub = player1Doc.subscribe((data) => {
          this.player1 = data;
          resolve();
        });
      });
      await new Promise((resolve) => {
        const player2Doc = this.afs
          .collection<User>("users", (ref) =>
            ref.where("email", "==", player2Email).limit(1)
          )
          .valueChanges()
          .pipe(flatMap((users) => users));

        this.player2Sub = player2Doc.subscribe((data) => {
          this.player2 = data;
          resolve();
        });
      });
      if (
        (this.player1.createdGames >= 3 && !this.player1.roles.pro) ||
        this.player1.createdGames >= 25
      ) {
        console.log("error too many games");
      } else {
        const player1Ref: AngularFirestoreDocument<User> = this.afs.doc(
          `users/${this.player1.uid}`
        );
        const increment = firestore.FieldValue.increment(1);
        player1Ref.update({ createdGames: increment });

        const ticTacToeRef = this.db.list("tictactoe").push({
          player1: this.player1.uid,
          player2: this.player2.uid,
          xIsNext: true,
          xCounter: 0,
          oCounter: 0,
          gameOver: false,
        });

        this.router.navigate([`/tictactoe/${(await ticTacToeRef).key}`]);
      }
    }
  }
}

export class EmailValidator {
  static Email(afs: AngularFirestore) {
    return (control: AbstractControl) => {
      const email = control.value.toLowerCase();
      return afs
        .collection("users", (ref) => ref.where("email", "==", email))
        .valueChanges()
        .pipe(
          debounceTime(1000),
          take(1),
          map((arr) => (!arr.length ? { emailExists: false } : null))
        );
    };
  }
}
