import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { HomeComponent } from "./home/home.component";
import { BoardComponent } from "./board/board.component";
import { OnlineGamesComponent } from "./online-games/online-games.component";
import { OnlineTictactoeComponent } from "./online-tictactoe/online-tictactoe.component";

const routes: Routes = [
  { path: "", component: HomeComponent },
  { path: "local", component: BoardComponent },
  { path: "online", component: OnlineGamesComponent },
  { path: "tictactoe/:key", component: OnlineTictactoeComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
