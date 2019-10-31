import { Component, Inject, OnInit } from "@angular/core";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";
import { Router, ActivatedRoute } from "@angular/router";
import {
  FormControl,
  FormGroup,
  FormBuilder,
  FormArray,
  Validators,
  NgForm,
  AbstractControl
} from "@angular/forms";
import { MatFormFieldModule } from "@angular/material/form-field";

import { UtilService } from "../../../shared/service/util.service";
import { HttpService } from "../../../shared/service/http.service";
import { CrmService } from "../crm-service";
import { AdminService } from "../../admin/admin.service";
import { GlobalService } from "../../../shared/service/global.service";
declare var $: any;

@Component({
  selector: "",
  templateUrl: "./client-dialog.component.html",
  styleUrls: ["./client-dialog.component.css"]
})
export class ClientDialog {
  public errMsg: string = "";
  public successMsg: string = "";
  public submitted: boolean = false;
  public isError: boolean = false;
  public isSuccess: boolean = false;
  public action: string;
  ReferalTypeFrm: FormGroup;
  constructor(
    private util: UtilService,
    private router: Router,
    private route: ActivatedRoute,
    private crm: CrmService,
    private admin: AdminService,
    private http: HttpService,
    private fb: FormBuilder,
    private global: GlobalService,
    public dialogRef: MatDialogRef<ClientDialog>,
    @Inject(MAT_DIALOG_DATA) public dataObj: any
  ) {
    this.action = dataObj.action;
  }

  ngOnInit() {
    this.createForm();
    this.util.setPageTitle(this.route);
  }

  public createForm() {
    this.ReferalTypeFrm = this.fb.group({
      referral_type: new FormControl("", [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(30)
      ])
    });
  }
  get referral_type() {
    return this.ReferalTypeFrm.get("referral_type");
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  addReferalType(form: FormGroup) {
    console.log(form.value);
    let self = this;
    this.errMsg = "";
    this.isError = false;
    this.submitted = true;
    try {
      if (form.valid) {
        self.util.addSpinner("addRefType", "Save");
        this.http.doPost("referaltype", form.value, function(
          error: boolean,
          response: any
        ) {
          self.util.removeSpinner("addRefType", "Save");
          if (error) {
            self.isError = true;
            self.errMsg = response.message;
          } else {
            self.admin.updateList("referralType");
            self.isSuccess = true;
            self.successMsg = response.message;
            self.dialogRef.close();
          }
        });
      }
    } catch (err) {
      this.global.addException("Client dailog", "addReferalType()", err);
    }
  }

  removeClient() {
    var self = this;
    let reqObj: any = {};
    reqObj.client_id = self.dataObj.clientId;
    reqObj.company_id = this.util.getCompanyId();
    self.util.addSpinner("removeClient", "Delete");
    try {
      this.http.doPost("clients/delete", reqObj, function(
        error: boolean,
        response: any
      ) {
        self.util.removeSpinner("removeClient", "Delete");
        if (error) {
          self.isError = true;
          self.errMsg = response.message;
          console.log("error");
        } else {
          self.admin.deleteRecordFromList(self.dataObj.clientId);
          console.log("Deleted", reqObj.client_id);
          self.isSuccess = true;
          self.successMsg = self.dataObj.successMsg + " Successfully Deleted.";
        }
      });
    } catch (err) {
      this.global.addException("Client dailog", "removeClient()", err);
    }
  }
}
