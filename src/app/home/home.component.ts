import { Component, OnInit, OnDestroy } from "@angular/core";
import { Observable, Observer, fromEvent, merge, Subscription } from "rxjs";
import { map } from "rxjs/operators";

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.scss"],
})
export class HomeComponent implements OnInit, OnDestroy {
  networkSub: Subscription;
  networkAvailable: boolean;

  constructor() {}

  ngOnInit(): void {
    this.networkSub = this.createOnline$().subscribe((isOnline) => {
      this.networkAvailable = isOnline;
    });
  }

  ngOnDestroy(): void {
    this.networkSub.unsubscribe();
  }

  createOnline$() {
    return merge<boolean>(
      fromEvent(window, "offline").pipe(map(() => false)),
      fromEvent(window, "online").pipe(map(() => true)),
      new Observable((sub: Observer<boolean>) => {
        sub.next(navigator.onLine);
        sub.complete();
      })
    );
  }
}
