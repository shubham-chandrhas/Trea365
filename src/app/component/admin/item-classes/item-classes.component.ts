import { Component, Inject, OnInit } from "@angular/core";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";
import {
  FormControl,
  FormGroupDirective,
  NgForm,
  Validators,
  FormGroup,
  FormBuilder,
  FormArray
} from "@angular/forms";
import { Router, ActivatedRoute } from "@angular/router";
import { Location } from "@angular/common";
import * as _ from "underscore";

import { UtilService } from "../../../shared/service/util.service";
import { AdminService } from "../admin.service";
import { HttpService } from "../../../shared/service/http.service";
import { ConstantsService } from "../../../shared/service/constants.service";
import { DialogComponent } from "../../../shared/model/dialog/dialog.component";
import { GlobalService } from "../../../shared/service/global.service";

@Component({
  selector: "app-item-classes",
  templateUrl: "./item-classes.component.html",
  styleUrls: ["./item-classes.component.css"]
})
export class ItemClassesComponent implements OnInit {
  public sortColumn: string = "item_class_id";
  public sortColumnType: string = "N";
  public sortOrder: string = "DSC";
  public typeSearch;
  public categorySearch;

  public errMsg: string;
  public isError: boolean = false;
  public selItemClass: any;
  public isEdit: boolean = false;
  public itemClassList: any[] = [];
  editItemClassFrm: FormGroup;
  public paginationKey: any;
  public listCount: number = 0;
  public selectedIndex;
  public searchTxt;
  public searchList;
  permissionsSet: any;

  public onBoarding:boolean = false;

  constructor(
    public util: UtilService,
    public constant: ConstantsService,
    private admin: AdminService,
    private route: ActivatedRoute,
    public dialog: MatDialog,
    private router: Router,
    private fb: FormBuilder,
    private http: HttpService,
    private global: GlobalService,
    private location: Location
  ) {}

  ngOnInit() {
    let self = this;
    this.util.showProcessing("processing-spinner");
    this.util.setWindowHeight();
    this.util.setPageTitle(this.route);
    this.permissionsSet = this.util.getModulePermission(18);
    try {
      if (this.router.url.split("/")[2] == "csa-onboarding") {
        this.util.menuChange({ menu: "guide", subMenu: "" }); //for onboarding dashboard
      } else {
        this.util.menuChange({ menu: 2, subMenu: 15 });
      }
      this.paginationKey = {
        itemsPerPage: this.constant.ITEMS_PER_PAGE,
        currentPage: this.constant.CURRENT_PAGE
      };
      this.getItemClassList();
      this.createItemClassForm();

      this.admin.newRecord.subscribe(itemClasss => {
        if (itemClasss) {
          self.getItemClassList();
          self.selItemClass = null;
          self.selectedIndex = null;
          self.searchTxt = self.searchList = "";
        }
      });

      this.util.changeDetection.subscribe(dataObj => {
        if (dataObj && dataObj.source == "ITEM_CLASS") {
          self.getItemClassList();
          self.selItemClass = self.selectedIndex = null;
          self.searchTxt = self.searchList = "";
        }
      });
    } catch (err) {
      this.global.addException("Item Classes", "ngOnInit()", err);
    }
  }

  ngOnDestroy() {
    this.util.setPopupFlag(false);
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
  getSearchTxt(filterValue: string) {
    if (filterValue == "") {
      this.searchTxt = "";
    }
  }
  public createItemClassForm() {
    this.editItemClassFrm = this.fb.group({
      comment: new FormControl("", [
        Validators.maxLength(this.constant.DEFAULT_COMMENT_MAXLENGTH)
      ])
    });
  }
  get comment() {
    return this.editItemClassFrm.get("comment");
  }

  getItemClassList() {
    var self = this;
    try {
      this.admin.getItemClassList(function(error: boolean, response: any) {
        self.util.hideProcessing("processing-spinner");
        if (error) {
          console.log("error", response);
        } else {
          self.itemClassList = response.data;
          if (self.util.getPopupFlag()) {
            self.showAddClassPopup();
            self.util.setPopupFlag(false);
          }
          if(self.itemClassList.length == 0) {
            self.onBoarding = true;
          }
          self.route.snapshot.paramMap.get("id") != "0"
            ? self.showClassDetails()
            : "";
        }
      });
    } catch (err) {
      this.global.addException("Item Classes", "getItemClassList()", err);
    }
  }

  showClassDetails() {
    let sortedList: any[] = _.sortBy(
      this.itemClassList,
      "item_class_id"
    ).reverse();
    for (var i = 0; i < sortedList.length; ++i) {
      if (
        this.route.snapshot.paramMap.get("id") == sortedList[i].item_class_id
      ) {
        this.getSelectedItemClass(sortedList[i], i);
        this.selectedIndex = i;
        break;
      }
    }
  }

  getSelectedItemClass(selItemClassObj: any, index: number) {
    let self = this;
    this.selItemClass = selItemClassObj;
    this.isEdit = false;
    this.selectedIndex = index;
    self.location.go(
      self.location
        .path()
        .split("/")
        .splice(0, self.location.path().split("/").length - 1)
        .join("/") +
        "/" +
        selItemClassObj.item_class_id
    );
    setTimeout(function() {
      self.util.scrollDown("classMark");
    }, 1000);
  }

  showAddClassPopup() {
    this.dialog.open(ItemClassesDialog, {
      data: { action: "addNewItemClass" },
      autoFocus: false
    });
  }

  showDeleteClassPopup() {
    let data: any = {
      API_URL: "itemclass/delete",
      reqObj: {
        itemClassId: this.selItemClass.item_class_id
      },
      event: {
        source: "ITEM_CLASS",
        action: "DELETE"
      }
    };
    this.util.showDialog(
      DialogComponent,
      "Are you sure you want to delete " +
        this.selItemClass.item_class_name +
        "?",
      [],
      "Delete Confirmation ?",
      "CONFIRMATION",
      data
    );
  }

  cancelDisplayInfo() {
    this.isEdit = false;
  }

  editItemClass() {
    this.isEdit = true;
    this.editItemClassFrm.get("comment").setValue(this.selItemClass.comment);
  }
  updateItmeClass(form: FormGroup) {
    let self = this;
    self.isError = false;
    self.errMsg = "";
    try {
      if (form.valid) {
        let reqObj: any = {};
        reqObj.itemClassName = self.selItemClass.item_class_name;
        reqObj.itemClassType = self.selItemClass.item_class_type;
        reqObj.availForMobile = self.selItemClass.avail_for_mobile;
        reqObj.comment = self.editItemClassFrm.get("comment").value;
        reqObj.companyId = self.selItemClass.company_id;
        reqObj.itemClassId = self.selItemClass.item_class_id;

        self.util.addSpinner("updateItemClass", "Update");
        this.http.doPost("itemclass/edit", reqObj, function(
          error: boolean,
          response: any
        ) {
          self.util.removeSpinner("updateItemClass", "Update");
          if (error) {
            self.isError = true;
            self.errMsg = response.message;
          } else {
            self.isEdit = false;
            self.selItemClass.comment = form.value.comment;
            if (self.router.url.split("/")[2] == "csa-onboarding") {
              self.util.showDialog(DialogComponent, response.message, [
                "/admin/csa-onboarding/item-classes/0"
              ]);
            } else {
              self.util.showDialog(DialogComponent, response.message, [
                "/admin/csa/item-classes/0"
              ]);
            }
          }
        });
      }
    } catch (err) {
      this.global.addException("Item Classes", "updateItemClass()", err);
    }
  }
}

@Component({
  selector: "",
  templateUrl: "./item-classes-dialog.html",
  styleUrls: ["./item-classes.component.css"]
})
export class ItemClassesDialog {
  public errMsg: string = "";
  public isError: boolean = false;
  public isSuccess: boolean = false;
  public submitted: boolean = false;
  public successMsg: string = "";
  public action: string;
  private currentPath: string;

  addItemClassFrm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<ItemClassesDialog>,
    @Inject(MAT_DIALOG_DATA) public dataObj: any,
    public util: UtilService,
    public constant: ConstantsService,
    private admin: AdminService,
    private fb: FormBuilder,
    private router: Router,
    private http: HttpService,
    public dialog: MatDialog,
    private global: GlobalService
  ) {
    this.action = dataObj.action;
  }

  ngOnDestroy() {
    this.router.url.split("/")[2] == "csa-onboarding" &&
    this.router.url.split("/")[3] == "item-classes"
      ? this.router.navigate(["/csa-onboarding/guide"])
      : "";
  }

  ngOnInit() {
    this.currentPath = this.router.url.split("/")[3];
    console.log("current path", this.currentPath);
    this.createClassForm();
  }

  public createClassForm() {
    this.addItemClassFrm = this.fb.group({
      companyId: new FormControl(this.util.getCompanyId()),
      itemClassName: new FormControl("", [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(30)
      ]),
      itemClassType: new FormControl("Asset", [Validators.required]),
      availForMobile: new FormControl("", []),
      comment: new FormControl("", [
        Validators.maxLength(this.constant.DEFAULT_COMMENT_MAXLENGTH)
      ])
    });
  }

  get itemClassName() {
    return this.addItemClassFrm.get("itemClassName");
  }
  get itemClassType() {
    return this.addItemClassFrm.get("itemClassType");
  }
  get availForMobile() {
    return this.addItemClassFrm.get("availForMobile");
  }
  get comment() {
    return this.addItemClassFrm.get("comment");
  }

  addItemClass(form: FormGroup) {
    var self = this;
    this.errMsg = "";
    this.isError = false;
    this.submitted = true;
    try {
      if (form.valid) {
        let itemClassObj = form.value;
        itemClassObj.availForMobile =
          itemClassObj.itemClassType == "Asset" &&
          itemClassObj.availForMobile == true
            ? 1
            : 0;
        console.log("form valuessss", form.value);
        if (
          self.currentPath == "add-material" &&
          form.value.itemClassType !== "Material"
        ) {
          self.errMsg = "Please Select Material Item Type.";
          self.isError = true;
          return;
        } else if (
          self.currentPath == "add-asset" &&
          form.value.itemClassType !== "Asset"
        ) {
          self.errMsg = "Please Select Asset Item Type.";
          self.isError = true;
          return;
        } else if (
          self.currentPath == "add-product" &&
          form.value.itemClassType !== "Product"
        ) {
          self.errMsg = "Please Select Product Item Type.";
          self.isError = true;
          return;
        } else {
          self.util.addSpinner("addItemClass", "Submit");

          this.http.doPost("itemclass", itemClassObj, function(
            error: boolean,
            response: any
          ) {
            self.util.removeSpinner("addItemClass", "Submit");
            if (error) {
              self.isError = true;
              self.errMsg = response.message;
            } else {
              self.isSuccess = true;
              self.util.setPopupFlag(false);
              self.admin.updateList(response.status);
              self.util.changeEvent({
                source: "ON_THE_FLY_ITEM_CATEGORY",
                action: "ADD"
              });
              self.currentPath == "item-classes"
                ? ((self.isSuccess = true),
                  (self.successMsg = response.message))
                : self.closeDialog();
            }
          });
        }
      }
    } catch (err) {
      this.global.addException("Item Classes", "addItemClass()", err);
    }
  }

  continueCreating(): void {
    this.errMsg = "";
    this.isError = false;
    this.submitted = false;
    this.createClassForm();
    this.isSuccess = false;
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}
