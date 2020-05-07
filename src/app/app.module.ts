import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { SquareComponent } from "./square/square.component";
import { BoardComponent } from "./board/board.component";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import {
  NbThemeModule,
  NbLayoutModule,
  NbButtonModule,
  NbUserModule,
  NbIconModule,
  NbCardModule,
  NbToastrModule,
  NbDialogModule,
  NbTabsetModule,
  NbInputModule,
  NbFormFieldModule,
  NbListModule,
} from "@nebular/theme";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { NbEvaIconsModule } from "@nebular/eva-icons";
import { UserComponent } from "./user/user.component";
import { AngularFireModule } from "@angular/fire";
import { AngularFirestoreModule } from "@angular/fire/firestore";
import { AngularFireAuthModule } from "@angular/fire/auth";
import { AngularFireDatabaseModule } from "@angular/fire/database";
import { environment } from "../environments/environment";
import { HomeComponent } from "./home/home.component";
import { OnlineGamesComponent } from "./online-games/online-games.component";
import { OnlineTictactoeComponent } from "./online-tictactoe/online-tictactoe.component";
import { DeleteGameComponent } from './delete-game/delete-game.component';
import { GenericDialogueAlertComponent } from './generic-dialogue-alert/generic-dialogue-alert.component';

@NgModule({
  declarations: [
    AppComponent,
    SquareComponent,
    BoardComponent,
    UserComponent,
    HomeComponent,
    OnlineGamesComponent,
    OnlineTictactoeComponent,
    DeleteGameComponent,
    GenericDialogueAlertComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    NbThemeModule.forRoot({ name: "dark" }),
    NbToastrModule.forRoot(),
    NbDialogModule.forRoot(),
    NbLayoutModule,
    NbEvaIconsModule,
    NbButtonModule,
    NbUserModule,
    NbIconModule,
    NbCardModule,
    NbTabsetModule,
    NbInputModule,
    NbListModule,
    FormsModule,
    ReactiveFormsModule,
    NbFormFieldModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule,
    AngularFireAuthModule,
    AngularFireDatabaseModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
