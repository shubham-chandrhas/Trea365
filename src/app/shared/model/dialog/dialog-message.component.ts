import { Component, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";
import { Router } from "@angular/router";
@Component({
  selector: "",
  templateUrl: "./dialog.component.html",
  styleUrls: ["./dialog.component.css"]
})
export class DialogMessageComponent {
  public errMsg: string = "";
  public successMsg: string = "";
  public isSuccess: boolean = false;
  public isError: boolean = false;
  public redirectURL: string;
  public isActive: number = 0;
  deleteBtnTxt: string = "Yes";
  //limitToNo: number = 4;
  woList: any[] = [];
  constructor(
    private router: Router,
    public dialogRef: MatDialogRef<DialogMessageComponent>,
    @Inject(MAT_DIALOG_DATA)
    public dialog: any
  ) {
    this.redirectURL = this.dialog.redirectURL
      ? this.dialog.redirectURL[0]
      : [];
    this.dialog.redirectURL = this.dialog.redirectURL
      ? this.dialog.redirectURL
      : [];
  }
  ngOnInit() {
    console.log("this.dialog:::", this.dialog);
  }
  ngOnDestroy() {
    this.dialog.redirectURL.length > 0
      ? this.router.navigate([this.redirectURL])
      : "";
  }
  closeDialog(): void {
    this.dialogRef.close();
  }
}
