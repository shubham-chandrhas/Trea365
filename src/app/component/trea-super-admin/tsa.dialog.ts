import { Component, Inject, OnInit } from "@angular/core";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";
import { Router } from "@angular/router";

import { UtilService } from "../../shared/service/util.service";
import { HttpService } from "../../shared/service/http.service";
import { FileService } from "../../shared/service/file.service";

@Component({
  selector: "",
  templateUrl: "./tsa.dialog.html",
  styleUrls: ["../../shared/model/dialog/dialog.component.css"]
})
export class TSADialogComponent {
  public errMsg: string = "";
  public successMsg: string = "";
  public isSuccess: boolean = false;
  public isError: boolean = false;
  public redirectURL: string;
  public isActive: number = 0;
  constructor(
    private util: UtilService,
    private router: Router,
    private http: HttpService,
    private file: FileService,
    public dialogRef: MatDialogRef<TSADialogComponent>,
    @Inject(MAT_DIALOG_DATA) public dialog: any
  ) {
    this.redirectURL = this.dialog.redirectURL
      ? this.dialog.redirectURL[0]
      : [];
    this.dialog.redirectURL = this.dialog.redirectURL
      ? this.dialog.redirectURL
      : [];
  }

  ngOnInit() {}

  //ngOnDestroy() { this.dialog.redirectURL.length > 0 ? this.router.navigate([this.redirectURL]) : ''; }

  deleteAPICall(): void {
    var self = this;
    self.util.addSpinner("remove-btn", "Delete");
    this.file.formDataAPICall(
      self.dialog.data.reqObj,
      self.dialog.data.API_URL,
      function(error: boolean, response: any) {
        self.util.removeSpinner("updateComp", "Update");
        if (error) {
          self.isError = true;
          self.errMsg = response.message;
        } else {
          self.isSuccess = true;
          //self.util.showDialog(DialogComponent, response.message,  [ "/su/tsa/dashboard" ]);
          self.util.changeEvent({
            source: "UPDATE_STATUS",
            action: "delete",
            data: {}
          });
          self.successMsg = response.message;
          //self.dialog.open(EditAccountDialog, { data: { 'action': 'updateSuccess' } });
        }
      }
    );

    // this.http.doPost(self.dialog.data.API_URL, self.dialog.data.reqObj, function(error: boolean, response: any){
    //     self.util.removeSpinner('remove-btn', "Yes");
    //     if(error){
    //         self.isError = true;
    //         self.errMsg = response.message;
    //     }else{
    //         self.isSuccess = true;
    //         self.util.changeEvent(self.dialog.data.event);
    //         self.successMsg = response.message;
    //     }
    // });
  }

  // continueCreating(): void {
  //     this.redirectURL = this.dialog.redirectURL.length > 0 ? this.dialog.redirectURL[1] : '';
  //     this.dialogRef.close();
  // }

  closeDialog(): void {
    this.dialogRef.close();
  }
}
