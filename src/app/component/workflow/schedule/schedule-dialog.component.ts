import { Component, Inject, OnInit } from "@angular/core";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";
import { Router, ActivatedRoute } from "@angular/router";
import { GlobalService } from "../../../shared/service/global.service";
import { UtilService } from "../../../shared/service/util.service";
import { HttpService } from "../../../shared/service/http.service";

@Component({
  selector: "",
  templateUrl: "./schedule-dialog.component.html",
  styleUrls: ["../../../shared/model/dialog/dialog.component.css"]
})
export class ScheduleDialogComponent {
  public errMsg: string = "";
  public successMsg: string = "";
  public isSuccess: boolean = false;
  public isError: boolean = false;
  public redirectURL: string;
  public isActive: number = 0;
  deleteBtnTxt: string = "Yes";
  //limitToNo: number = 4;
  woList: any[] = [];
  assetList: any[] = [];
  personList: any[] = [];
  constructor(
    private util: UtilService,
    private router: Router,
    private route: ActivatedRoute,
    private http: HttpService,
    public dialogRef: MatDialogRef<ScheduleDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public dialog: any,
    public global: GlobalService
  ) {
    this.redirectURL = this.dialog.redirectURL
      ? this.dialog.redirectURL[0]
      : [];
    this.dialog.redirectURL = this.dialog.redirectURL
      ? this.dialog.redirectURL
      : [];

    this.woList =
      this.dialog.action == "CONFIRMATION_WITH_WARNING"
        ? JSON.parse(
            JSON.stringify(this.dialog.data.details.work_orders.slice(0, 4))
          )
        : [];

    this.assetList =
      this.dialog.action == "CONFIRMATION_WITH_WARNING" &&
      this.dialog.data.type == "Person"
        ? JSON.parse(
            JSON.stringify(this.dialog.data.details.assets.slice(0, 4))
          )
        : [];
    this.personList =
      this.dialog.action == "CONFIRMATION_WITH_WARNING" &&
      this.dialog.data.type == "Asset"
        ? JSON.parse(
            JSON.stringify(this.dialog.data.details.persons.slice(0, 4))
          )
        : [];
    this.deleteBtnTxt =
      this.dialog.action == "CONFIRMATION_WITH_WARNING"
        ? "Delete Anyway"
        : "Yes";

    this.assetList =
      this.dialog.action == "CONFIRMATION_WITH_WARNING_2" &&
      this.dialog.data.type == "Person"
        ? JSON.parse(
            JSON.stringify(this.dialog.data.details.assets.slice(0, 4))
          )
        : [];
    this.personList =
      this.dialog.action == "CONFIRMATION_WITH_WARNING_2" &&
      this.dialog.data.type == "Asset"
        ? JSON.parse(
            JSON.stringify(this.dialog.data.details.persons.slice(0, 4))
          )
        : [];
    this.deleteBtnTxt =
      this.dialog.action == "CONFIRMATION_WITH_WARNING_2"
        ? "Delete Anyway"
        : "Yes";
  }

  ngOnInit() {
    console.log("this.dialog:::", this.dialog);
    this.util.setPageTitle(this.route);
  }

  //ngOnDestroy() { this.dialog.redirectURL.length > 0 ? this.router.navigate([this.redirectURL]) : ''; }

  continueMark(option): void {
    try {
      let reqObj = JSON.parse(sessionStorage.getItem("schedulingInfo"));
      reqObj.reqData.schedule_both = option;
      sessionStorage.setItem("schedulingInfo", JSON.stringify(reqObj));
      this.router.navigate([this.dialog.redirectURL[0]]);
      //this.redirectURL = this.dialog.redirectURL.length > 0 ? this.dialog.redirectURL[1] : '';
      this.dialogRef.close();
    } catch (err) {
      this.global.addException("Schedule dialog", "continueMark()", err);
    }
  }
  deleteSchedule(option): void {
    try {
      let self = this;
      let reqObj = JSON.parse(sessionStorage.getItem("deleteSchedulingInfo"));
      console.log("reqObj == ", reqObj);

      reqObj.schedule_both = option;
      sessionStorage.setItem("editSchedulingInfo", JSON.stringify(reqObj));

      let requestObj = {
        scheduling_id: reqObj.scheduling_id,
        delete_both: reqObj.schedule_both
      };
      this.http.doPost("schedule/delete", requestObj, function(
        error: boolean,
        response: any
      ) {
        // self.util.removeSpinner('next-btn', "Next");
        if (error) {
          console.log(error);
        } else {
          self.util.changeEvent({
            source: "DELETE_SCHEDULE"
          });
          self.isSuccess = true;
         self.successMsg = response.message;
        }
      });

      this.router.navigate([this.dialog.redirectURL[0]]);
      //this.redirectURL = this.dialog.redirectURL.length > 0 ? this.dialog.redirectURL[1] : '';
      this.dialogRef.close();
    } catch (err) {
      this.global.addException("Schedule dialog", "continueMark()", err);
    }
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
  showAll(): void {
    try {
      this.woList = JSON.parse(
        JSON.stringify(this.dialog.data.details.work_orders)
      );
    } catch (err) {
      this.global.addException("Schedule dialog", "showAll()", err);
    }
  }
}
