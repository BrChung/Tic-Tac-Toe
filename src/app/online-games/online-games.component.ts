import { Component, OnInit } from "@angular/core";
import { AngularFireAuth } from "@angular/fire/auth";
import { FormControl, Validators } from "@angular/forms";

@Component({
  selector: "app-online-games",
  templateUrl: "./online-games.component.html",
  styleUrls: ["./online-games.component.scss"],
})
export class OnlineGamesComponent implements OnInit {
  email = new FormControl("", Validators.required);

  constructor(public afAuth: AngularFireAuth) {}

  ngOnInit(): void {}
}
