import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Subscription, Observable } from "rxjs";

@Component({
  selector: "app-online-tictactoe",
  templateUrl: "./online-tictactoe.component.html",
  styleUrls: ["./online-tictactoe.component.scss"],
})
export class OnlineTictactoeComponent implements OnInit {
  private routerSub: Subscription;
  key: string;

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.routerSub = this.route.params.subscribe((params) => {
      this.key = params["key"];
    });
  }
}
