import { Component, Inject, OnInit } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";
import { ApplicationRef } from "@angular/core";
import {
  FormControl,
  FormGroupDirective,
  NgForm,
  Validators,
  FormGroup,
  FormBuilder
} from "@angular/forms";

import { UtilService } from "../../../shared/service/util.service";
import { FileService } from "../../../shared/service/file.service";
import { HttpService } from "../../../shared/service/http.service";
import { ConstantsService } from "../../../shared/service/constants.service";
import { DialogComponent } from "../../../shared/model/dialog/dialog.component";
import { GlobalService } from "../../../shared/service/global.service";
import { AppConfig, APP_CONFIG } from "../../../app-config.module";

@Component({
  selector: "app-csv-preview",
  templateUrl: "./csv-preview.component.html",
  styleUrls: [
    "./csv-preview.component.scss",
    "../../onboarding/onboarding-guide/onboarding-guide.component.css"
  ]
})
export class CsvPreviewComponent implements OnInit {
  pageData: any = {
    isEdit: false,
    isError: false,
    pageData: false,
    dragOver: false,
    newFileUpload: false,
    isThumbnailSet: false,
    CsvData: [],
    successMsg: "",
    validRecord: 0,
    InvalidRecord: 0,
    moduleType: "",
    invalidUrl: ""
  };
  public errMsg: string = "";
  public successMsg: string = "";
  public field: string = "";
  public isError: boolean = false;
  public submitted: boolean = false;
  public isSuccess: boolean = false;
  public removeFlage: boolean = false;
  public redirectUrl: string = "";

  constructor(
    @Inject(APP_CONFIG)
    private config: AppConfig,
    public router: Router,
    public route: ActivatedRoute,
    private fb: FormBuilder,
    public util: UtilService,
    private file: FileService,
    private dialog: MatDialog,
    private ref: ApplicationRef,
    private http: HttpService,
    public constant: ConstantsService,
    private global: GlobalService
  ) {}

  ngOnInit() {
    let self = this;
    this.util.setPageTitle(this.route);
    self.pageData.moduleType = this.route.snapshot.paramMap.get("type");
    this.pageData.CsvData = JSON.parse(
      sessionStorage.getItem("csvData")
    ).csvData.data;
    this.pageData.invalidUrl = JSON.parse(sessionStorage.getItem("csvData"))
      .csvData.invalid_csv
      ? this.config.domainIP +
        "api/download/csv" +
        JSON.parse(sessionStorage.getItem("csvData")).csvData.invalid_csv
      : "";

    for (let index = 0; index < this.pageData.CsvData.length; index++) {
      if (this.pageData.CsvData[index].is_valid == 1) {
        self.pageData.validRecord++;
      } else {
        self.pageData.InvalidRecord++;
      }
    }
  }

  insertValidData() {
    let self = this;
    let apiEndPoint: string;
    switch (self.pageData.moduleType) {
      case "business-type":
        apiEndPoint = "nature-of-business/csv/update";

        break;
      case "supplier":
        apiEndPoint = "suppliers/csv/update";
        break;

      case "manufacturer":
        apiEndPoint = "manufacturer/csv/update";
        break;
      case "assets":
        apiEndPoint = "assets/csv/update";
        break;
      case "product":
        apiEndPoint = "product/csv/update";
        break;
      case "material":
        apiEndPoint = "material/csv/update";
        break;
      case "client":
        apiEndPoint = "clients/csv/update";
        break;
      case "employee":
        apiEndPoint = "employee/csv/update";
        break;
      default:
        break;
    }

    if (self.pageData.validRecord > 0) {
      self.util.addSpinner("update-field-btn", "Insert Valid Data");
      this.http.doPost(
        apiEndPoint,
        { dataResults: self.pageData.CsvData },
        function(error: boolean, response: any) {
          self.util.removeSpinner("update-field-btn", "Insert Valid Data");
          if (error) {
            self.errMsg = response.message;
            self.isError = true;
          } else {
            // self.successMsg = response.message;
            if (JSON.parse(sessionStorage.getItem("csvData")).redirectUrl) {
              self.redirectUrl = JSON.parse(
                sessionStorage.getItem("csvData")
              ).redirectUrl;
            } else {
              self.redirectUrl = "/csa-onboarding/guide";
            }
            sessionStorage.removeItem("csvData");
            self.util.showDialog(DialogComponent, response.message, [
              self.redirectUrl
            ]);
            // self.router.navigate(['/csa-onboarding/guide']);
          }
        }
      );
    } else {
      self.errMsg = "No Valid Record Found.";
    }
  }
  cancelUploadData() {
    try {
      console.log("hello");
      console.log(JSON.parse(sessionStorage.getItem("csvData")));
      let self = this;
      if (JSON.parse(sessionStorage.getItem("csvData")).redirectUrl) {
        self.redirectUrl = JSON.parse(
          sessionStorage.getItem("csvData")
        ).redirectUrl;
      } else {
        self.redirectUrl = "/csa-onboarding/guide";
      }
      sessionStorage.removeItem("csvData");
      self.router.navigate([self.redirectUrl]);
    } catch (err) {
      this.global.addException("CSV preview", "cancelUploadData()", err);
    }
  }
}
