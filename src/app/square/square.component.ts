import { Component, Input } from "@angular/core";

@Component({
  selector: "app-square",
  templateUrl: "./square.component.html",
  styleUrls: ["./square.component.scss"],
})
export class SquareComponent {
  @Input() state: "X" | "O";
  @Input() gameOver: boolean;
  constructor() {}

  ngOnInit(): void {}
}
