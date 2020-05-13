import { Component, OnInit, OnDestroy, HostListener } from "@angular/core";
import { AngularFireAuth } from "@angular/fire/auth";
import {
  AngularFirestore,
  AngularFirestoreDocument,
} from "@angular/fire/firestore";
import { AngularFireDatabase } from "@angular/fire/database";
import { map, take, debounceTime, flatMap, switchMap } from "rxjs/operators";
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
} from "@angular/forms";
import { NbDialogService } from "@nebular/theme";
import { Subscription, Observable, of, combineLatest } from "rxjs";
import { Router } from "@angular/router";
import { firestore } from "firebase/app";
import { DeleteGameComponent } from "../delete-game/delete-game.component";
import { GenericDialogueAlertComponent } from "../generic-dialogue-alert/generic-dialogue-alert.component";
import { User } from "../models/user";

@Component({
  selector: "app-online-games",
  templateUrl: "./online-games.component.html",
  styleUrls: ["./online-games.component.scss"],
})
export class OnlineGamesComponent implements OnInit, OnDestroy {
  @HostListener("window:resize", ["$event"])
  onResize(event) {
    this.innerWidth = event.target.innerWidth;
  }
  innerWidth: number;

  emailForm: FormGroup;
  player1: User;
  player2: User;
  private player1Sub: Subscription;
  private player2Sub: Subscription;
  loadedData: boolean = false;

  gamesCreated$: Observable<any>;
  gamesJoined$: Observable<any>;

  constructor(
    private fb: FormBuilder,
    public afAuth: AngularFireAuth,
    private afs: AngularFirestore,
    private db: AngularFireDatabase,
    private router: Router,
    private dialogService: NbDialogService
  ) {}

  ngOnInit(): void {
    this.innerWidth = window.innerWidth;
    this.emailForm = this.fb.group({
      email: [
        [],
        [Validators.required, Validators.email],
        EmailValidator.Email(this.afs),
      ],
    });
  }

  ngOnDestroy(): void {
    if (this.player1Sub) {
      this.player1Sub.unsubscribe();
    }
    if (this.player2Sub) {
      this.player2Sub.unsubscribe();
    }
  }

  get email() {
    return this.emailForm.get("email");
  }

  async activeGames() {
    if (this.loadedData) return;
    const currentUser = await this.afAuth.currentUser;
    this.gamesCreated$ = this.joinUsers(
      this.createGameQuery("tictactoe", "player1", currentUser.uid),
      "player2"
    );
    this.gamesJoined$ = this.joinUsers(
      this.createGameQuery("tictactoe", "player2", currentUser.uid),
      "player1"
    );
    this.loadedData = true;
  }

  createGameQuery(game: string, uidVar: string, uid: string) {
    return this.db
      .list(game, (ref) => ref.orderByChild(uidVar).equalTo(uid))
      .snapshotChanges();
  }

  joinUsers(games$: Observable<any>, uidVar: string) {
    let games;
    const joinKeys = {};

    return games$.pipe(
      switchMap((g) => {
        games = g;
        const uids = Array.from(new Set(g.map((v) => v.payload.val()[uidVar])));
        // Firestore User Doc Reads
        const userDocs = uids.map((u) =>
          this.afs.doc<User>(`users/${u}`).valueChanges()
        );
        return userDocs.length ? combineLatest(userDocs) : of([]);
      }),
      map((arr: any[]) => {
        arr.forEach((v) => (joinKeys[(<any>v).uid] = v));
        games = games.map((v) => {
          return { ...v, user: joinKeys[v.payload.val()[uidVar]] };
        });
        return games;
      })
    );
  }

  async createGame() {
    const currentUser = await this.afAuth.currentUser;
    const player2Email = this.emailForm.value.email;

    if (this.emailForm.value.email === currentUser.email) {
      this.dialogService.open(GenericDialogueAlertComponent, {
        context: {
          message: "You cannot start an online game with yourself silly!",
        },
      });
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
        this.player1.createdGames >= 50
      ) {
        this.dialogService.open(GenericDialogueAlertComponent, {
          context: {
            message:
              "You have reached the available limit of how many games you can create. Limit is 3 for users and 50 for pro members. Other players may still invite you to games.",
          },
        });
      } else {
        const player1Ref: AngularFirestoreDocument<User> = this.afs.doc(
          `users/${this.player1.uid}`
        );
        const increment = firestore.FieldValue.increment(1);
        player1Ref.update({ createdGames: increment });

        const ticTacToeRef = this.db.list("tictactoe").push({
          player1: this.player1.uid,
          player2: this.player2.uid,
          xIsNext: false,
          xCounter: 0,
          oCounter: 0,
          gameOver: false,
        });

        this.router.navigate([`/tictactoe/${(await ticTacToeRef).key}`]);
      }
    }
  }

  deleteGameDialog(key: string, uid: string) {
    this.dialogService.open(DeleteGameComponent, {
      context: {
        key: key,
        uid: uid,
      },
    });
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
