import { Component, Inject, OnInit } from "@angular/core";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";
import { Router, ActivatedRoute } from "@angular/router";
import {
  FormControl,
  FormGroupDirective,
  Validators,
  FormGroup,
  FormBuilder
} from "@angular/forms";
import { Location } from "@angular/common";
import * as _ from "underscore";

import { UtilService } from "../../../service/util.service";
import { HttpService } from "../../../service/http.service";
import { ConstantsService } from "../../../service/constants.service";
import { DialogComponent } from "../../../model/dialog/dialog.component";
import { GlobalService } from "../../../../shared/service/global.service";
import { AppConfig, APP_CONFIG } from "../../../../app-config.module";
import { OnboardingGuideDialogComponent } from "../../../../component/onboarding/onboarding-guide/onboarding-guide.component";
@Component({
  selector: "app-manufacturer",
  templateUrl: "./manufacturer.component.html",
  styleUrls: ["./manufacturer.component.css"]
})
export class ManufacturerComponent implements OnInit {
  public manufacturerList: any = [];
  public selectedIndex: number;
  public selectedManufacturer: any;
  public isEditManufacturer: boolean = false;
  public manufacturerBackup: any;
  public errMsg: string;
  public isError: boolean = false;
  public searchList;
  public searchTxt: string;
  public paginationKey: any;
  public listCount: number = 0;
  private currentPath: string;
  editManufacturFm: FormGroup;
  public sortColumn: string = "manf_id";
  public sortColumnType: string = "N";
  public sortOrder: string = "DSC";
  commentSearch;
  typeSearch;
  manfSearch;
  permissionsSet: any;
  public onBoarding:boolean = false; 

  constructor(
    @Inject(APP_CONFIG)
    private config: AppConfig,
    public util: UtilService,
    private router: Router,
    private route: ActivatedRoute,
    public constant: ConstantsService,
    public dialog: MatDialog,
    private http: HttpService,
    private fb: FormBuilder,
    private location: Location,
    private global: GlobalService
  ) {}

  ngOnInit() {
    let self = this;
    this.util.showProcessing("processing-spinner");
    this.currentPath = this.router.url.split("/")[
      this.router.url.split("/").length - 2
    ];
    this.currentPath == "manufacturer"
      ? this.router.url.split("/")[2] == "csa-onboarding"
        ? this.util.menuChange({ menu: "guide", subMenu: "" })
        : this.util.menuChange({ menu: 2, subMenu: 13 })
      : "";
    this.util.setWindowHeight();
    this.util.setPageTitle(this.route);
    this.getManufacturerList();
    this.createManufacturerForm();
    this.paginationKey = {
      itemsPerPage: this.constant.ITEMS_PER_PAGE,
      currentPage: this.constant.CURRENT_PAGE
    };
    this.permissionsSet = this.util.getModulePermission(23);

    this.util.changeDetection.subscribe(dataObj => {
      if (dataObj && dataObj.source == "MANUFACTURER") {
        self.getManufacturerList();
        self.selectedManufacturer = null;
        self.selectedIndex = null;
        self.searchTxt = self.searchList = "";
      }
    });
  }

  ngOnDestroy() {
    this.util.setPopupFlag(false);
  }

  public createManufacturerForm() {
    this.editManufacturFm = this.fb.group({
      manfName: new FormControl("", [Validators.required]),
      isAsset: new FormControl(0),
      isProduct: new FormControl(0),
      isMaterial: new FormControl(0),
      comment: new FormControl("", [
        Validators.maxLength(this.constant.DEFAULT_COMMENT_MAXLENGTH)
      ])
    });
  }

  get manfName() {
    return this.editManufacturFm.get("manfName");
  }
  get isAsset() {
    return this.editManufacturFm.get("isAsset");
  }
  get isProduct() {
    return this.editManufacturFm.get("isProduct");
  }
  get isMaterial() {
    return this.editManufacturFm.get("isMaterial");
  }
  get comment() {
    return this.editManufacturFm.get("comment");
  }

  getManufacturerList() {
    let self = this;
    try {
      this.http.doGet("manufacturer", function(error: boolean, response: any) {
        self.util.hideProcessing("processing-spinner");
        if (error) {
          console.log(response);
        } else {
          self.manufacturerList = response.data;

          for (let i = 0; i < self.manufacturerList.length; i++) {
            let typeArr: any[] = [];
            if (self.manufacturerList[i].is_asset_type) {
              typeArr.push("Asset");
            }
            if (self.manufacturerList[i].is_product_type) {
              typeArr.push("Product");
            }
            if (self.manufacturerList[i].is_material_type) {
              typeArr.push("Material");
            }
            self.manufacturerList[i].type = typeArr.join();
          }
          if(self.manufacturerList.length == 0) {
            self.onBoarding = true;
          }
          if (self.util.getPopupFlag()) {
            self.addManufacturer();
            self.util.setPopupFlag(false);
          }
          console.log(self.manufacturerList);
          self.route.snapshot.paramMap.get("id") != "0"
            ? self.showMfgDetails()
            : "";
        }
      });
    } catch (err) {
      this.global.addException("Manufacturer", "getManufacturerList()", err);
    }
  }

  updateCount(count) {
    this.constant.ITEM_COUNT = count;
    this.listCount = count;
  }
  getSearchTxt(filterValue: string) {
    if (filterValue == "") {
      this.searchTxt = "";
    }
  }

  showMfgDetails() {
    let sortedList: any[] = _.sortBy(
      this.manufacturerList,
      "manf_id"
    ).reverse();
    for (var i = 0; i < sortedList.length; ++i) {
      if (this.route.snapshot.paramMap.get("id") == sortedList[i].manf_id) {
        this.getSelectedManufacturer(sortedList[i], i);
        this.selectedIndex = i;
        break;
      }
    }
  }
  addFromCSV() {
    let route: string,
      apiEndPoint: string,
      csvTemplateUrl: string,
      redirectUrl: string;
    route = "/csa-onboarding/csv-preview/manufacturer";
    apiEndPoint = "manufacturer/csv";
    csvTemplateUrl = this.config.domainIP + "api/download/csv/manufacturer.csv";
    redirectUrl = "/admin/csa/manufacturer/0";

    this.dialog.open(OnboardingGuideDialogComponent, {
      data: {
        action: "csvUpload",
        route: route,
        apiEndPoint: apiEndPoint,
        csvTemplateUrl: csvTemplateUrl,
        redirectUrl: redirectUrl
      }
    });
  }

  getSelectedManufacturer(manufacturerObj: any, index: number) {
    try {
      let self = this;
      this.isError = false;
      this.isEditManufacturer = false;
      this.errMsg = "";
      this.selectedIndex = index;
      this.selectedManufacturer = manufacturerObj;
      this.manufacturerBackup = JSON.parse(JSON.stringify(manufacturerObj));
      this.editManufacturFm.get("manfName").setValue(manufacturerObj.manf_name);
      this.editManufacturFm
        .get("isProduct")
        .setValue(manufacturerObj.is_product_type);
      this.editManufacturFm
        .get("isAsset")
        .setValue(manufacturerObj.is_asset_type);
      this.editManufacturFm
        .get("isMaterial")
        .setValue(manufacturerObj.is_material_type);
      this.editManufacturFm.get("comment").setValue(manufacturerObj.comment);
      self.location.go(
        self.location
          .path()
          .split("/")
          .splice(0, self.location.path().split("/").length - 1)
          .join("/") +
          "/" +
          manufacturerObj.manf_id
      );
      setTimeout(function() {
        self.util.scrollDown("mfgMark");
      }, 1000);
    } catch (err) {
      this.global.addException(
        "Manufacturer",
        "getSelectedManufacturer()",
        err
      );
    }
  }

  editManufacturerFlageChange() {
    try {
      this.isEditManufacturer = true;
      this.editManufacturFm
        .get("manfName")
        .setValue(this.selectedManufacturer.manf_name);
      this.editManufacturFm
        .get("comment")
        .setValue(this.selectedManufacturer.comment);
    } catch (err) {
      this.global.addException(
        "Manufacturer",
        "editManufacturerFlageChange()",
        err
      );
    }
  }

  updateManufacturer(form: FormGroup) {
    let self = this;
    self.isError = false;
    self.errMsg = "";
    try {
      if (form.valid) {
        if (
          form.value.isAsset == 0 &&
          form.value.isProduct == 0 &&
          form.value.isMaterial == 0
        ) {
          self.isError = true;
          self.errMsg = "Please select Manufacturer Type.";
          return;
        }

        let reqObj = {
          manfId: self.selectedManufacturer.manf_id,
          manfName: form.value.manfName,
          isAsset: form.value.isAsset ? 1 : 0,
          isProduct: form.value.isProduct ? 1 : 0,
          isMaterial: form.value.isMaterial ? 1 : 0,
          comment: form.value.comment
        };

        console.log(reqObj);

        self.util.addSpinner("update-manufacturer-btn", "Update");
        this.http.doPost("manufacturer/edit", reqObj, function(
          error: boolean,
          response: any
        ) {
          self.util.removeSpinner("update-manufacturer-btn", "Update");
          if (error) {
            self.isError = true;
            self.errMsg = response.message;
          } else {
            self.isEditManufacturer = false;
            self.util.showProcessing("processing-spinner");
            // self.selectedManufacturer.manf_name = form.value.manfName;
            // self.selectedManufacturer.manfName = form.value.manfName;
            // self.selectedManufacturer.is_product_type = form.value.isProduct;
            // self.selectedManufacturer.is_asset_type = form.value.isAsset;
            // self.selectedManufacturer.is_material_type = form.value.isMaterial;
            // self.selectedManufacturer.comment = form.value.comment;
            // self.selectedManufacturer.manufacturer_list = [];
            // console.log("self.selectedManufacturer",self.selectedManufacturer);
            // self.manufacturerBackup = JSON.parse(
            //   JSON.stringify(self.selectedManufacturer)
            // );
            self.getManufacturerList();
          }
        });
      }
    } catch (err) {
      this.global.addException("Manufacturer", "updateManufacturer()", err);
    }
  }

  cancelEditManufacturer() {
    try {
      this.isEditManufacturer = false;
      this.selectedManufacturer = JSON.parse(
        JSON.stringify(this.manufacturerBackup)
      );
    } catch (err) {
      this.global.addException("Manufacturer", "cancelEditManufacturer()", err);
    }
  }

  showDeleteConfirmation() {
    try {
      let data: any = {
        API_URL: "manufacturer/delete",
        reqObj: {
          manfId: this.selectedManufacturer.manf_id
        },
        event: {
          source: "MANUFACTURER",
          action: "DELETE"
        }
      };
      this.util.showDialog(
        DialogComponent,
        "Are you sure you want to delete " + //@ Shahebaz - Start
        this.selectedManufacturer.manf_name + //@ Shahebaz - End
          " ?",
        [],
        "Delete Confirmation ?",
        "CONFIRMATION",
        data
      );
    } catch (err) {
      this.global.addException("Manufacturer", "showDeleteConfirmation()", err);
    }
  }

  addManufacturer() {
    try {
      let self = this;
      this.dialog.open(ManufacturerDialog, {
        data: { action: "addManufacturer" },
        autoFocus: false
      });
    } catch (err) {
      this.global.addException("Manufacturer", "addManufacturer()", err);
    }
  }
}

@Component({
  selector: "",
  templateUrl: "./manufacturer-dialog.component.html",
  styleUrls: ["./manufacturer.component.css"]
})
export class ManufacturerDialog {
  public errMsg: string = "";
  public isError: boolean = false;
  public isSuccess: boolean = false;
  public submitted: boolean = false;
  public successMsg: string = "";
  public action: string;
  private currentPath: string;

  addManufacturFm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<ManufacturerDialog>,
    @Inject(MAT_DIALOG_DATA) public dataObj: any,
    private util: UtilService,
    public constant: ConstantsService,
    private router: Router,
    private fb: FormBuilder,
    private http: HttpService,
    private global: GlobalService
  ) {
    this.action = dataObj.action;
  }

  ngOnInit() {
    console.log("Hiii....");
    this.currentPath = this.router.url.split("/")[3];
    this.createManufacturerForm();
  }

  ngOnDestroy() {
    this.router.url.split("/")[2] == "csa-onboarding" &&
    this.router.url.split("/")[3] == "manufacturer"
      ? this.router.navigate(["/csa-onboarding/guide"])
      : "";
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  public createManufacturerForm() {
    this.addManufacturFm = this.fb.group({
      manfName: new FormControl("", [Validators.required]),
      isAsset: new FormControl(0),
      isProduct: new FormControl(0),
      isMaterial: new FormControl(0),
      comment: new FormControl("", [
        Validators.minLength(2),
        Validators.maxLength(this.constant.DEFAULT_COMMENT_MAXLENGTH)
      ])
    });
  }

  get manfName() {
    return this.addManufacturFm.get("manfName");
  }
  get isAsset() {
    return this.addManufacturFm.get("isAsset");
  }
  get isProduct() {
    return this.addManufacturFm.get("isProduct");
  }
  get isMaterial() {
    return this.addManufacturFm.get("isMaterial");
  }
  get comment() {
    return this.addManufacturFm.get("comment");
  }

  addManufacturer(form: FormGroup) {
    try {
      let self = this;
      self.errMsg = "";
      self.submitted = true;
      self.isError = false;
      if (form.valid) {
        if (
          form.value.isAsset == 0 &&
          form.value.isProduct == 0 &&
          form.value.isMaterial == 0
        ) {
          self.isError = true;
          self.errMsg = "Please select Manufacturer Type.";
          return;
        }

        form.value.isAsset = form.value.isAsset ? 1 : 0;
        form.value.isProduct = form.value.isProduct ? 1 : 0;
        form.value.isMaterial = form.value.isMaterial ? 1 : 0;

        self.util.addSpinner("add-manufacturer-btn", "Submit");
        this.http.doPost("manufacturer", form.value, function(
          error: boolean,
          response: any
        ) {
          self.util.removeSpinner("add-manufacturer-btn", "Submit");
          if (error) {
            self.errMsg = response.message;
            self.isError = true;
          } else {
            self.util.setPopupFlag(false);
            self.util.changeEvent({ source: "MANUFACTURER", action: "ADD" });
            self.currentPath == "manufacturer"
              ? ((self.isSuccess = true), (self.successMsg = response.message))
              : self.closeDialog();
          }
        });
      }
    } catch (err) {
      this.global.addException("Manufacturer", "addManufacturer()", err);
    }
  }

  continueCreating(): void {
    this.errMsg = "";
    this.isError = false;
    this.submitted = false;
    this.createManufacturerForm();
    this.isSuccess = false;
  }
}
