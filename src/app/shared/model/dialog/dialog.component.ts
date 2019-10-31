import { Component, Inject, OnInit } from "@angular/core";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";
import { Router } from "@angular/router";

import { UtilService } from "../../../shared/service/util.service";
import { HttpService } from "../../../shared/service/http.service";
import { GlobalService } from "../../../shared/service/global.service";
@Component({
  selector: "",
  templateUrl: "./dialog.component.html",
  styleUrls: ["./dialog.component.css"]
})
export class DialogComponent {
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
    private util: UtilService,
    private router: Router,
    private http: HttpService,
    public dialogRef: MatDialogRef<DialogComponent>,
    @Inject(MAT_DIALOG_DATA) public dialog: any,
    private global: GlobalService
  ) {
    this.redirectURL = this.dialog.redirectURL
      ? this.dialog.redirectURL[0]
      : [];
    this.dialog.redirectURL = this.dialog.redirectURL
      ? this.dialog.redirectURL
      : [];
    this.woList =
      this.dialog.action == "CONFIRMATION_WITH_WARNING"
        ? JSON.parse(JSON.stringify(this.dialog.data.assignedWO.slice(0, 4)))
        : [];
    this.deleteBtnTxt =
      this.dialog.action == "CONFIRMATION_WITH_WARNING"
        ? "Delete Anyway"
        : "Yes";
  }

  ngOnInit() {
    console.log("this.dialog:::", this.dialog);
  }

  ngOnDestroy() {
    this.dialog.redirectURL.length > 0
      ? this.router.navigate([this.redirectURL])
      : "";
  }

  deleteAPICall(): void {
    try {
      var self = this;
      self.util.addSpinner("remove-btn", self.deleteBtnTxt);
      this.http.doPost(
        self.dialog.data.API_URL,
        self.dialog.data.reqObj,
        function(error: boolean, response: any) {
          self.util.removeSpinner("remove-btn", self.deleteBtnTxt);
          if (error) {
            self.isError = true;
            self.errMsg = response.message;
          } else {
            self.isSuccess = true;
            self.util.changeEvent(self.dialog.data.event);
            self.successMsg = response.message;
          }
        }
      );
    } catch (err) {
      this.global.addException("Dialog", "deleteAPICall()", err);
    }
  }

  continueCreating(): void {
    try {
      console.log(this.dialog.redirectURL);
      this.redirectURL =
        this.dialog.redirectURL.length > 0 ? this.dialog.redirectURL[1] : "";
      this.dialogRef.close();
    } catch (err) {
      this.global.addException("Dialog", "continueCreating()", err);
    }
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
  closeDialogEmail(): void {
    this.dialogRef.close();
    this.util.changeEvent({
      source: "EMAIL_CHANGE",
      data: {
        "email": "email not changed",
        "index" : this.dialog.data.event.data
      }
    });
  }
  showAll(): void {
    this.woList = JSON.parse(JSON.stringify(this.dialog.data.assignedWO));
  }
  confirmEmail() {
    // alert(this.dialog.data.event.data);
    this.dialogRef.close();
    this.util.changeEvent({
      source: "EMAIL_CHANGE",
      data: {

        "email": "email changed",
        "index" : this.dialog.data.event.data
      }
    });
  }
}
