import { Component, OnInit, HostListener } from "@angular/core";
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
import { Observable, of, combineLatest } from "rxjs";
import { Router } from "@angular/router";
import { firestore } from "firebase/app";
import { DeleteGameComponent } from "../delete-game/delete-game.component";
import { GenericDialogueAlertComponent } from "../generic-dialogue-alert/generic-dialogue-alert.component";
import { User } from "../models/user";
import { promise } from "protractor";

@Component({
  selector: "app-online-games",
  templateUrl: "./online-games.component.html",
  styleUrls: ["./online-games.component.scss"],
})
export class OnlineGamesComponent implements OnInit {
  @HostListener("window:resize", ["$event"])
  onResize(event) {
    this.innerWidth = event.target.innerWidth;
  }
  innerWidth: number;

  emailForm: FormGroup;
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
    let games: any;
    const joinKeys = {};

    return games$.pipe(
      switchMap((g) => {
        games = g;
        const uids = Array.from(
          new Set(g.map((game: any) => game.payload.val()[uidVar]))
        );
        // Firestore User Doc Reads
        const userDocs = uids.map((u) =>
          this.afs.doc<User>(`users/${u}`).valueChanges()
        );
        return userDocs.length ? combineLatest(userDocs) : of([]);
      }),
      map((arr: any[]) => {
        arr.forEach((user) => (joinKeys[(<any>user).uid] = user));
        games = games.map((game: any) => {
          return { ...game, user: joinKeys[game.payload.val()[uidVar]] };
        });
        return games;
      })
    );
  }

  getUserPromise(email: string) {
    return this.afs
      .collection<User>("users", (ref) =>
        ref.where("email", "==", email).limit(1)
      )
      .valueChanges()
      .pipe(
        take(1),
        flatMap((users) => users)
      )
      .toPromise();
  }

  async createGame() {
    const currentUser = await this.afAuth.currentUser;
    const invitee = this.emailForm.value.email;
    if (invitee === currentUser.email)
      return this.dialogService.open(GenericDialogueAlertComponent, {
        context: {
          message: "You cannot start an online game with yourself silly!",
        },
      });

    try {
      const p1Promise = this.getUserPromise(currentUser.email);
      const p2Promise = this.getUserPromise(invitee);
      const [p1, p2] = await Promise.all([p1Promise, p2Promise]);
      if (p1.createdGames >= 3 && !p1.roles.pro)
        return this.dialogService.open(GenericDialogueAlertComponent, {
          context: {
            message:
              "You have reached the available limit of how many games you can create. Limit is 3 for users, upgrade to pro membership to create more games. Other players may still invite you to games.",
          },
        });
      if (p1.createdGames >= 50)
        return this.dialogService.open(GenericDialogueAlertComponent, {
          context: {
            message:
              "You have reached the available limit of how many games you can create (50). Other players may still invite you to games.",
          },
        });
      const player1Ref: AngularFirestoreDocument<User> = this.afs.doc(
        `users/${p1.uid}`
      );
      const increment = firestore.FieldValue.increment(1);
      player1Ref.update({ createdGames: increment });

      const ticTacToeRef = this.db.list("tictactoe").push({
        player1: p1.uid,
        player2: p2.uid,
        xIsNext: false,
        xCounter: 0,
        oCounter: 0,
        gameOver: false,
      });

      this.router.navigate([`/tictactoe/${(await ticTacToeRef).key}`]);
    } catch (error) {
      console.error(error);
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
