import { Component, Inject, OnInit } from "@angular/core";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";
import { MatFormFieldModule } from "@angular/material/form-field";
import {
  FormControl,
  FormGroupDirective,
  Validators,
  FormGroup,
  FormBuilder,
  FormArray
} from "@angular/forms";

import { Router, ActivatedRoute } from "@angular/router";
//import { HrService } from '../../hr/hr.service';
import { AdminService } from "../../admin/admin.service";
import { UtilService } from "../../../shared/service/util.service";
import { HttpService } from "../../../shared/service/http.service";
import { FileService } from "../../../shared/service/file.service";
import { AppConfig, APP_CONFIG } from "../../../app-config.module";
@Component({
  selector: "app-onboarding-guide",
  templateUrl: "./onboarding-guide.component.html",
  styleUrls: ["./onboarding-guide.component.css"]
})
export class OnboardingGuideComponent implements OnInit {
  moduleList: any;

  constructor(
    @Inject(APP_CONFIG)
    private config: AppConfig,
    private router: Router,
    public dialog: MatDialog,
    private util: UtilService,
    private http: HttpService,
    private admin: AdminService,
    public route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.util.setWindowHeight();
    this.util.setPageTitle(this.route);
    this.util.menuChange({ menu: "guide", subMenu: "" });
    this.getCompanyOnboardingGuide();
  }

  getCompanyOnboardingGuide() {
    let self = this;
    this.util.showProcessing("processing-spinner");
    this.http.doGet("companyOnboardingGuide", function(
      error: boolean,
      response: any
    ) {
      self.util.hideProcessing("processing-spinner");
      if (error) {
      } else {
        self.moduleList = response.data;
      }
    });
  }

  redirectTo(moduleName, option) {
    switch (moduleName) {
      case "Nature of Business":
        sessionStorage.removeItem("businessNature");
        option == 1
          ? this.router.navigate(["/admin/csa-onboarding/business-nature/0"])
          : this.router.navigate([
              "/admin/csa-onboarding/add-business-nature/" + btoa("0")
            ]);
        break;

      case "Location":
        option == 1
          ? this.router.navigate(["/admin/csa-onboarding/location-list/0"])
          : this.router.navigate(["/admin/csa-onboarding/add-location"]);
        break;

      case "Manufacturer":
        option == 1
          ? this.util.setPopupFlag(false)
          : this.util.setPopupFlag(true);
        this.router.navigate(["/admin/csa-onboarding/manufacturer/0"]);
        break;

      case "Item Definition":
        this.util.setMfgPartData([]);
        sessionStorage.removeItem("newPart");
        sessionStorage.removeItem("class");
        option == 1
          ? this.router.navigate(["/admin/csa-onboarding/manufacturer-part/0"])
          : this.router.navigate([
              "/admin/csa-onboarding/add-manufacturer-part/" + btoa("1")
            ]);
        break;

      case "Item Categories":
        option == 1
          ? this.util.setPopupFlag(false)
          : this.util.setPopupFlag(true);
        this.router.navigate(["/admin/csa-onboarding/item-classes/0"]);
        break;

      case "Permission":
        option == 1
          ? this.router.navigate(["/admin/csa-onboarding/role-list/0"])
          : this.router.navigate(["/admin/csa-onboarding/add-role"]);
        break;

      case "Employee":
        option == 1
          ? this.router.navigate(["/hr/csa-onboarding/employee-list/0"])
          : (sessionStorage.removeItem("emp"),
            this.util.setDocumentObj([]),
            this.router.navigate(["/csa-onboarding/emp-fields"]));
        break;

      case "Sub Contractor":
        option == 1
          ? this.router.navigate(["/hr/csa-onboarding/sub-contractor-list/0"])
          : (sessionStorage.removeItem("subContractor"),
            this.util.setDocumentObj([]),
            this.router.navigate(["/hr/csa-onboarding/add-subcontractor"]));
        break;

      case "Assets":
        option == 1
          ? this.router.navigate(["/inventory/csa-onboarding/asset-list/0"])
          : (sessionStorage.removeItem("ASSET_OLD"),
            this.router.navigate(["/inventory/csa-onboarding/add-asset"]));
        break;

      case "Products":
        option == 1
          ? this.router.navigate(["/inventory/csa-onboarding/product-list/0"])
          : this.router.navigate(["/inventory/csa-onboarding/add-product"]);
        break;

      case "Materials":
        option == 1
          ? this.router.navigate(["/inventory/csa-onboarding/material-list/0"])
          : this.router.navigate(["/inventory/csa-onboarding/add-material"]);
        break;

      case "Supplier":
        option == 1
          ? this.router.navigate(["/admin/csa-onboarding/supplier-list/0"])
          : this.router.navigate(["/admin/csa-onboarding/add-supplier"]);
        break;

      case "Client":
        option == 1
          ? this.router.navigate(["/crm/csa-onboarding/client-list/0"])
          : (sessionStorage.removeItem("client"),
            this.router.navigate(["/crm/csa-onboarding/add-client"]));
        break;

      default:
        // code...
        break;
    }
  }

  checkAccess(moduleName, option) {
    let access = { add: true, edit: true };
    switch (moduleName) {
      case "Nature of Business":
        return {
          view: this.util.getModulePermission(7).viewNatureofBusiness,
          add: this.util.getModulePermission(7).createNatureofBusiness
        };

      case "Location":
        return {
          view: this.util.getModulePermission(12).viewLocations,
          add: this.util.getModulePermission(12).createLocations
        };

      case "Manufacturer":
        return {
          view: this.util.getModulePermission(23).viewManufacturer,
          add: this.util.getModulePermission(23).createManufacturer
        };

      case "Item Definition":
        return {
          view: this.util.getModulePermission(28).viewItemDefinition,
          add: this.util.getModulePermission(28).createItemDefinition
        };

      case "Item Categories":
        return {
          view: this.util.getModulePermission(18).viewItemCategory,
          add: this.util.getModulePermission(18).createItemCategory
        };

      case "Permission":
        return {
          view: this.util.getModulePermission(44).viewPermissionRole,
          add: this.util.getModulePermission(44).createPermissionRole
        };

      case "Employee":
        return {
          view: this.util.getModulePermission(126).viewEmployee,
          add: this.util.getModulePermission(126).createEmployee
        };

      case "Sub Contractor":
        return {
          view: this.util.getModulePermission(135).viewSubContractor,
          add: this.util.getModulePermission(135).createSubContractor
        };

      case "Assets":
        return {
          view: this.util.getModulePermission(61).viewAssets,
          add: this.util.getModulePermission(61).createAssets
        };

      case "Products":
        return {
          view: this.util.getModulePermission(51).viewProducts,
          add: this.util.getModulePermission(51).createProducts
        };

      case "Materials":
        return {
          view: this.util.getModulePermission(75).viewMaterials,
          add: this.util.getModulePermission(75).createMaterials
        };

      case "Supplier":
        return {
          view: this.util.getModulePermission(38).viewSupplier,
          add: this.util.getModulePermission(38).createSupplier
        };

      case "Client":
        return {
          view: this.util.getModulePermission(122).viewClients,
          add: this.util.getModulePermission(122).createClients
        };

      default:
        // code...
        return {
          view: false,
          add: false
        };
    }
  }

  addSupplier() {
    sessionStorage.removeItem("supplierObject");
    this.router.navigate(["/admin/csa-onboarding/add-supplier"]);
  }
  csvUpload(munu: string = "upload") {
    let route: string, apiEndPoint: string, csvTemplateUrl: string;
    switch (munu) {
      case "Nature of Business":
        route = "/csa-onboarding/csv-preview/business-type";
        apiEndPoint = "nature-of-business/csv";
        csvTemplateUrl =
          this.config.domainIP + "api/download/csv/business_type.csv";

        break;
      case "Supplier":
        route = "/csa-onboarding/csv-preview/supplier";
        apiEndPoint = "suppliers/csv";
        csvTemplateUrl = this.config.domainIP + "api/download/csv/supplier.csv";
        break;
      case "Manufacturer":
        route = "/csa-onboarding/csv-preview/manufacturer";
        apiEndPoint = "manufacturer/csv";
        csvTemplateUrl =
          this.config.domainIP + "api/download/csv/manufacturer.csv";
        break;
      case "Assets":
        route = "/csa-onboarding/csv-preview/assets";
        apiEndPoint = "nocsv";
        csvTemplateUrl = this.config.domainIP + "api/download/csv/asset.csv";
        break;
      case "Products":
        route = "/csa-onboarding/csv-preview/product";
        apiEndPoint = "nocsv";
        csvTemplateUrl = this.config.domainIP + "api/download/csv/products.csv";
        break;
      case "Materials":
        route = "/csa-onboarding/csv-preview/material";
        apiEndPoint = "nocsv";
        csvTemplateUrl = this.config.domainIP + "api/download/csv/material.csv";
        break;
      case "Client":
        route = "/csa-onboarding/csv-preview/client";
        apiEndPoint = "clients/csv";
        csvTemplateUrl = this.config.domainIP + "api/download/csv/client.csv";
        break;
      case "Employee":
        route = "/csa-onboarding/csv-preview/employee";
        apiEndPoint = "employee/csv";
        csvTemplateUrl = this.config.domainIP + "api/download/csv/employee.csv";
        break;
      default:
        apiEndPoint = "nocsv";
        break;
    }
    this.dialog.open(OnboardingGuideDialogComponent, {
      data: {
        action: "csvUpload",
        route: route,
        apiEndPoint: apiEndPoint,
        csvTemplateUrl: csvTemplateUrl
      }
    });
  }
}

@Component({
  selector: "",
  templateUrl: "./onboarding-guide-dialog.component.html",
  styleUrls: ["./onboarding-guide.component.css"]
})
export class OnboardingGuideDialogComponent {
  public action: string;
  public errMsg: string = "";
  public successMsg: string = "";
  //public field: string = '';
  public isError: boolean = false;
  public submitted: boolean = false;
  public isSuccess: boolean = false;
  public removeFlage: boolean = false;
  public additionalFields: any[] = [];
  addFieldFm: FormGroup;

  public uploadResult: boolean = false;
  public isUploadBtn: boolean = true;
  pageData: any = {
    isEdit: false,
    isError: false,
    pageData: false,
    dragOver: false,
    newFileUpload: false,
    isThumbnailSet: false,
    businessCsvData: []
  };
  constructor(
    public dialogRef: MatDialogRef<OnboardingGuideDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public dataObj: any,
    public router: Router,
    private util: UtilService,
    private http: HttpService,
    private admin: AdminService,
    private fb: FormBuilder,
    public dialog: MatDialog,
    private file: FileService
  ) {
    this.action = dataObj.action;
  }

  ngOnInit() {
    let self = this;
    this.createForm();
    if (this.dataObj.fields) {
      if (this.dataObj.fields.length > 0) {
        for (let i = 0; i < this.dataObj.fields.length; i++) {
          this.addFields("1", this.dataObj.fields[i]);
        }
      } else {
        this.addFields("0");
      }
    }
  }

  addNewField(): void {
    this.addFields("0");
  }

  removeField(indx, lable) {
    if (this.dataObj.fields.length > indx) {
      //this.field = this.dataObj.fields[indx].label;
      this.dialog.open(OnboardingGuideDialogComponent, {
        data: {
          action: "remove",
          fields: this.dataObj.fields,
          field: lable,
          fieldType: this.dataObj.fieldType,
          msgHeader: this.dataObj.msgHeader,
          index: indx,
          formArr: this.fields
        }
      });
    } else {
      this.fields.removeAt(indx);
    }
  }

  createForm() {
    this.addFieldFm = this.fb.group({
      fields: this.fb.array([])
    });
  }

  addFields(option, valObj: any = {}) {
    this.fields.push(
      new FormGroup({
        label: new FormControl(option == "1" ? valObj.label : "", [
          Validators.required
        ]),
        dataType: new FormControl(option == "1" ? valObj.dataType : "", [
          Validators.required
        ]),
        optionalStatus: new FormControl(
          option == "1" ? valObj.optionalStatus : "True",
          [Validators.required]
        ),
        isEditable: new FormControl(option == "1" ? false : true),
        data: new FormControl("")
      })
    );
  }

  get fields(): FormArray {
    return (<FormArray>this.addFieldFm.get("fields")) as FormArray;
  }

  updateAdditionalFields(form: FormGroup): void {
    let self = this;
    self.errMsg = "";
    self.isError = false;
    self.submitted = true;
    if (form.valid) {
      let reqFieldsObj: any = JSON.parse(JSON.stringify(form.value.fields));
      for (let i = 0; i < reqFieldsObj.length; i++) {
        delete reqFieldsObj[i].isEditable;
      }
      self.util.addSpinner("update-field-btn", "Update");
      this.http.doPost(
        "extrafields",
        { field_type: self.dataObj.fieldType, fields: reqFieldsObj },
        function(error: boolean, response: any) {
          self.util.removeSpinner("update-field-btn", "Update");
          if (error) {
            console.log(response);
            self.errMsg = response.message;
            self.isError = true;
          } else {
            self.action = "createdSuccess";
            self.successMsg =
              self.dataObj.msgHeader +
              " Information Fields Successfully Updated.";
            self.admin.updateList(true);
          }
        }
      );
    }
  }

  removeFieldAPICall(indx): void {
    let self = this;
    self.errMsg = "";
    self.isError = false;
    let reqFieldsObj: any[] = JSON.parse(JSON.stringify(self.dataObj.fields));
    reqFieldsObj.splice(indx, 1);
    self.util.addSpinner("remove-field-btn", "Delete");
    this.http.doPost(
      "extrafields",
      { field_type: self.dataObj.fieldType, fields: reqFieldsObj },
      function(error: boolean, response: any) {
        self.util.removeSpinner("remove-field-btn", "Delete");
        if (error) {
          self.errMsg = response.message;
          self.isError = true;
        } else {
          self.successMsg =
            self.dataObj.msgHeader + " Information Field Successfully Removed.";
          self.isSuccess = true;
          self.dataObj.formArr.removeAt(indx);
          self.admin.updateList(true);
        }
      }
    );
  }

  addFromCSV() {
    console.log("Add From CSV");
  }
  fileChange(event) {
    // console.log(event);
    let self = this;

    self.util.addSpinner("csv-up-btn", "CSV Upload");
    let fileList: FileList = event.target.files;
    this.errMsg = "";
    this.isError = false;

    let file: File = fileList[0];
    let fileDetailsObj: any = {};
    let extension: string = fileList[0].name.split(".").pop();
    fileDetailsObj.fileName = fileList[0].name;

    if (extension == "csv") {
      if (fileList[0].size / 1048576 < 10) {
        let formData: FormData = new FormData();
        formData.append("file", fileList[0]);
        this.file.formDataAPICall(formData, self.dataObj.apiEndPoint, function(
          error: boolean,
          response: any
        ) {
          if (error) {
            self.util.removeSpinner("csv-up-btn", "CSV Upload");
            self.isError = true;
            self.errMsg = response.message;
          } else {
            console.log("self.dataObj", self.dataObj);
            let dataObj: any = { csvData: response.data };
            if (self.dataObj.redirectUrl) {
              dataObj.redirectUrl = self.dataObj.redirectUrl;
            }
            self.util.removeSpinner("csv-up-btn", "CSV Upload");
            sessionStorage.setItem("csvData", JSON.stringify(dataObj));
            self.dialogRef.close();
            self.router.navigate([self.dataObj.route]);
          }
        });
      } else {
        self.util.removeSpinner("csv-up-btn", "CSV Upload");
        self.pageData.dragOver = false;
        self.pageData.isError = true;
        self.pageData.errMsg = "File must be less than 10 MB.";
        // self.ref.tick();
      }
    } else {
      self.util.removeSpinner("csv-up-btn", "CSV Upload");
      self.pageData.dragOver = false;
      self.pageData.isError = true;
      self.pageData.errMsg = "Only csv file allowed.";
      // self.ref.tick();
    }
  }

  // addFromCSV(){
  //     console.log("Add From CSV");
  // }
  // fileChange(event){
  //     // console.log(event);
  //     let self = this;

  //     self.util.addSpinner('csv-up-btn', "CSV Upload");
  //     let fileList: FileList = event.target.files;
  //     this.errMsg = "";
  //     this.isError = false;

  //          let file: File = fileList[0];
  //           let fileDetailsObj: any = {};
  //           let extension: string = fileList[0].name.split('.').pop();
  //           fileDetailsObj.fileName =  fileList[0].name;

  //           if((extension == 'csv')){
  //               if((fileList[0].size/1048576) < 10 ){
  //                 let formData:FormData = new FormData();
  //                 formData.append('file', fileList[0]);
  //                 this.file.formDataAPICall(formData, self.dataObj.apiEndPoint, function(error: boolean, response: any){

  //                   if(error){
  //                       self.util.removeSpinner('csv-up-btn', "CSV Upload");
  //                       self.pageData.isError = true;
  //                       console.log(error);
  //                       self.pageData.errMsg = response.message;
  //                   }else{
  //                       self.util.removeSpinner('csv-up-btn', "CSV Upload");
  //                       sessionStorage.setItem('csvData',JSON.stringify(response.data));
  //                       self.dialogRef.close();
  //                       console.log(response.data);
  //                       self.router.navigate([self.dataObj.route]);

  //                   }
  //               });
  //               }else{
  //                   self.util.removeSpinner('csv-up-btn', "CSV Upload");
  //                   self.pageData.dragOver = false;
  //                   self.pageData.isError = true;
  //                   self.pageData.errMsg = "File must be less than 10 MB.";
  //                   // self.ref.tick();
  //               }
  //           }else{
  //               self.util.removeSpinner('csv-up-btn', "CSV Upload");
  //               self.pageData.dragOver = false;
  //               self.pageData.isError = true;
  //               self.pageData.errMsg = 'Only csv file allowed.';
  //               // self.ref.tick();
  //           }
  // }

  closeDialog(): void {
    this.dialogRef.close();
  }
}
