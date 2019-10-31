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
import { NewCrmService } from "../crm-service";
import { AdminService } from "../../admin/admin.service";
import { GlobalService } from "../../../shared/service/global.service";
import { ConstantsService } from "../../../shared/service/constants.service";
declare var $: any;

@Component({
  selector: "",
  templateUrl: "./client-dialog.component.html",
  styleUrls: ["./client-dialog.component.css"]
})
export class NewClientDialog {
  public errMsg: string = "";
  public successMsg: string = "";
  public submitted: boolean = false;
  public isError: boolean = false;
  public isSuccess: boolean = false;
  public action: string;
  public client_id: number;
  public listCount: number = 0;
  ReferalTypeFrm: FormGroup;
  public selectedQuotation: any = "";
  public selectedIndex: any = null;
  public paginationKey: any;
  pageData: any = {
    quotationList: [],
    isEdit: false,
    isError: false,
    errMsg: "",
    sortColumn: "status_text",
    sortColumnType: "A",
    sortOrder: "ASC"
  };

  constructor(
    private util: UtilService,
    private router: Router,
    private route: ActivatedRoute,
    public constant: ConstantsService,
    private crm: NewCrmService,
    private admin: AdminService,
    private http: HttpService,
    private fb: FormBuilder,
    private global: GlobalService,
    public dialogRef: MatDialogRef<NewClientDialog>,
    @Inject(MAT_DIALOG_DATA) public dataObj: any
  ) {
    this.action = dataObj.action;
    if(dataObj && dataObj.client_id)
    {
      this.client_id = dataObj.client_id;
    }
  }

  ngOnInit() {
    this.createForm();
    this.dataObj.action == "quotationList" ? this.quotationList(this.client_id) : "";
    this.paginationKey = {
      itemsPerPage: 5,
      currentPage: this.constant.CURRENT_PAGE
    };
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
  changePage(event) {
    this.paginationKey.currentPage = event;
    window.scrollTo(0, 0);
  }
  changeItemPerPage() {
    window.scrollTo(0, 0);
  }
  updateCount(count) {
    this.constant.ITEM_COUNT = count;
    this.listCount = count;
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
    //reqObj.company_id = this.util.getCompanyId();
    self.util.addSpinner("removeClient", "Delete");
    try {
      this.http.doPost("client/delete", reqObj, function(
        error: boolean,
        response: any
      ) {
        self.util.removeSpinner("removeClient", "Delete");
        if (error) {
          self.isError = true;
          self.errMsg = response.message;
          console.log("error");
        } else {
          //self.admin.deleteRecordFromList(self.dataObj.clientId);
          console.log("Deleted", reqObj.client_id);
          self.isSuccess = true;
          self.successMsg = self.dataObj.successMsg + " Successfully Deleted.";

          self.util.changeEvent({
            source: "DELETE_CLIENT",
            action: "DELETE_CLIENT"
          });
          self.router.navigate(["/new-crm/csa/client-list/0"]);
        }
      });
    } catch (err) {
      this.global.addException("Client dailog", "removeClient()", err);
    }
  }

  quotationList(clientId : any) {
    var self = this;
    self.pageData.quotationList = [];
    this.util.showProcessing("processing-spinner");
    try {
      this.http.doGet("getProjectEstimateListForWo/"+clientId, function(
        error: boolean,
        response: any
      ) {
        if (error) {
          console.log(error);
        } else {
          self.pageData.quotationList = response.data;
          for (let i = 0; i < response.data.length; i++) {
            // Client Last Name
            response.data[i].client_details.last_name =
              response.data[i].client_details.last_name !== null
                ? response.data[i].client_details.last_name
                : "";

            // Follower Last_name
            self.pageData.quotationList[i].last_name = response.data[i].follower
              ? response.data[i].follower.last_name !== null
                ? response.data[i].follower.last_name
                : ""
              : "";

            self.pageData.quotationList[i].status_text =
              response.data[i].status_details.status;
            self.pageData.quotationList[i].company_name = response.data[i]
              .client_details.company_name
              ? response.data[i].client_details.company_name
              : response.data[i].client_details.first_name +
                " " +
                response.data[i].client_details.last_name;
            self.pageData.quotationList[i].first_name = response.data[i]
              .follower
              ? response.data[i].follower.first_name +
                " " +
                response.data[i].follower.last_name
              : "N/A";
            self.pageData.quotationList[i].follower = {
              first_name: response.data[i].follower
                ? response.data[i].follower.first_name +
                  " " +
                  response.data[i].follower.last_name
                : "N/A"
            };
          }
          self.constant.ITEM_COUNT = response.data.length;
          self.util.hideProcessing("processing-spinner");
          // self.pageData.quotationList = self.pageData.quotationList.filter(item=>(item.status_text == "Approved" || item.status_text == "Scheduled"));
          // console.log(self.pageData.quotationList);
        }
      });
    } catch (err) {
      this.global.addException("Error Log", "constructor()", err);
    }
  }

  getSelectedQuotation(quotation, index) {
    try {
      var self = this;
      self.selectedIndex = index;
      self.selectedQuotation = quotation;
      this.pageData.isError = false;
      this.pageData.errMsg = "";
    } catch (err) {
      this.global.addException(
        "QuotationSelection",
        "getSelectedQuotation()",
        err
      );
    }
  }

  goToWoSetup() {
    try {
      if (this.selectedQuotation) {
        let create_WO_Obj: any = {};
        create_WO_Obj.project_estimate_id = this.selectedQuotation.project_estimate_id;
        create_WO_Obj.WO_TYPE = "External Contractor";
        localStorage.setItem("CREATE_WO", JSON.stringify(create_WO_Obj));
        this.dialogRef.close();
        this.router.navigate(["/workflow/wo/csa/wo-setup"]);
      } else {
        this.pageData.isError = true;
        this.pageData.errMsg =
          "Please select quotation from the list to proceed.";
      }
    } catch (err) {
      this.global.addException("WO", "goToWoSetup()", err);
    }
  }
  goToNewWOReview() {
    if (this.selectedQuotation) {
      let create_WO_Obj: any = {};
      create_WO_Obj.project_estimate_id = this.selectedQuotation.project_estimate_id;
      create_WO_Obj.WO_TYPE = "External Contractor";
      localStorage.setItem("CREATE_WO", JSON.stringify(create_WO_Obj));
      this.dialogRef.close();
      this.router.navigate(["/workflow/wo/csa/wo-quotation-review"]);
    } else {
      this.pageData.isError = true;
      this.pageData.errMsg =
        "Please select quotation from the list to proceed.";
    }
  }
}
