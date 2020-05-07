import { Component, OnInit, Input } from "@angular/core";
import { NbDialogRef } from "@nebular/theme";

@Component({
  selector: "app-generic-dialogue-alert",
  templateUrl: "./generic-dialogue-alert.component.html",
  styleUrls: ["./generic-dialogue-alert.component.scss"],
})
export class GenericDialogueAlertComponent implements OnInit {
  @Input() message: string;

  constructor(
    protected dialogRef: NbDialogRef<GenericDialogueAlertComponent>
  ) {}

  ngOnInit(): void {}

  dismiss() {
    this.dialogRef.close();
  }
}
