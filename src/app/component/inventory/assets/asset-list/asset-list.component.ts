import { Component, OnInit, ApplicationRef, Inject } from "@angular/core";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";
import { Router, ActivatedRoute } from "@angular/router";
import {
  FormControl,
  Validators,
  FormGroup,
  FormBuilder
} from "@angular/forms";
import { Location } from "@angular/common";
import { Observable } from "rxjs";
import { map, startWith } from "rxjs/operators";

import { ConstantsService } from "../../../../shared/service/constants.service";
import { UtilService } from "../../../../shared/service/util.service";
import { HttpService } from "../../../../shared/service/http.service";
import { GlobalService } from "../../../../shared/service/global.service";
import { AdminService } from "../../../admin/admin.service";
import { DialogComponent } from "../../../../shared/model/dialog/dialog.component";
import { InventoryDialog } from "../../inventory-dialog.component";
import { AppConfig, APP_CONFIG } from "../../../../app-config.module";
import { MaintenanceDialog } from "../../maintenance/maintenance-list/maintenance-list.component";
import { ExportService } from "../../../../shared/service/export.service";
import * as _ from "underscore";
import { OnboardingGuideDialogComponent } from "../../../onboarding/onboarding-guide/onboarding-guide.component";

declare var jQuery: any;
declare var $: any;
@Component({
  selector: "app-asset-list",
  templateUrl: "./asset-list.component.html",
  styleUrls: ["./asset-list.component.css"]
})
export class AssetListComponent implements OnInit {
  // <<<<<<< HEAD
  pageData: any = {
    addOption: "WithPO",
    manufacturerPartList: [],
    manufacturerList: [],
    supplierList: [],
    submitted: false,
    selectedVal: {},
    selectedMfgPart: null,
    locationList: [],
    addOpt: "WithPO",
    allSupplier: []
  };
  public locList: any[] = [];
  public age_of_equip: any = 0;
  public locTagsList: any[] = [];
  public assetList: any[] = [];
  public assetInfo: any = null;
  public manfPartsList: any = "";
  public searchList;
  public searchTxt;
  public empIdSearch: string;
  public nameSearch: string;
  public titleSearch: string;
  public roleSearch: string;
  public name: string;
  public appliedFilter: any = [];
  public selectedIndex: number;
  public activeSearch: string;
  public lockedSearch: string;
  public paginationKey: any;
  public listCount: number = 0;
  public sortColumn: string = "asset_id";
  public sortColumnType: string = "N";
  public sortOrder: string = "DSC";
  public assetSuppliers: any[] = [];
  public financeSuppliers: any[] = [];
  public errMsg: string = "";
  public isError: boolean = false;
  public onBoarding:boolean = false;
  // =======
  //     pageData: any = { 'addOption': 'WithPO', 'manufacturerPartList': [], 'manufacturerList': [], 'supplierList': [], 'submitted': false, 'selectedVal' : {}, 'selectedMfgPart': null, 'locationList': [], 'addOpt': 'WithPO' };
  //     public locList: any[] = [];
  //     public age_of_equip:any = 0;
  //     public locTagsList: any[] = [];
  //     public assetList: any[] = [];
  //     public assetInfo: any = null;
  //     public manfPartsList: any = '';
  //     public searchList;
  //     public searchTxt;
  //     public empIdSearch: string;
  //     public nameSearch: string;
  //     public titleSearch: string;
  //     public roleSearch: string;
  //     public name: string;
  //     public appliedFilter: any = [];
  //     public selectedIndex: number;
  //     public activeSearch: string;
  //     public lockedSearch: string;
  //     public paginationKey:any;
  //     public listCount:number = 0;
  //     public sortColumn: string = 'asset_id';
  //     public sortColumnType: string = 'N';
  //     public sortOrder: string = 'DSC';
  //     public assetSuppliers: any[] = [];
  //     public financeSuppliers: any[] = [];
  //     public errMsg:string = '';
  //     public isError:boolean = false;
  // >>>>>>> Shubham

  public isEditDetails: boolean = false;
  public isEditFinancial: boolean = false;

  public assetListTab: string = "Available";
  public assetDetails: string = "details";
  public selectedAsset: any = null;
  public action: string;

  public isOwned: boolean = false;
  public isLeased: boolean = false;
  public isFinanced: boolean = false;
  public submitted: boolean = false;
  public finSubmitted: boolean = false;
  itemForm: FormGroup;
  financialForm: FormGroup;
  public locationSearch;
  public serialSearch;
  public scanCodeSearch;
  public manfNameSearch;
  public itemNameSearch;
  public itemTypeSearch;
  filteredEmployee: Observable<string[]>;
  filteredSupplier: Observable<string[]>;
  filteredLeasedFrom: Observable<string[]>;
  filteredFinancedFrom: Observable<string[]>;
  filteredWarrantySupplier: Observable<string[]>;
  public filteredLocations: Observable<string[]>;
  public filteredTags: Observable<string[]>;
  private currentPath;
  empList: any[] = [];
  woList: any[] = [];
  permissionsSet: any;
  maxDate = new Date();

  constructor(
    @Inject(APP_CONFIG)
    private config: AppConfig,
    public dialog: MatDialog,
    public util: UtilService,
    public constant: ConstantsService,
    private ref: ApplicationRef,
    public http: HttpService,
    public global: GlobalService,
    private admin: AdminService,
    private file: ExportService,
    public router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private loc: Location
  ) {}

  ngOnInit() {
    var self = this;
    this.util.setWindowHeight();
    this.util.setPageTitle(this.route);
    this.currentPath = this.router.url.split("/")[
      this.router.url.split("/").length - 2
    ];
    this.util.setCurrentPath(this.currentPath);
    if (this.router.url.split("/")[2] == "csa-onboarding") {
      this.util.menuChange({ menu: "guide", subMenu: "" }); //for onboarding dashboard
    } else {
      this.util.menuChange({ menu: 3, subMenu: 20 });
    }
    this.util.showProcessing("processing-spinner");
    this.paginationKey = {
      itemsPerPage: this.constant.ITEMS_PER_PAGE,
      currentPage: this.constant.CURRENT_PAGE
    };
    this.createItemForm();
    this.createFinancialForm();
    this.getAssetList();
    
    this.permissionsSet = this.util.getModulePermission(61);

    this.util.changeDetection.subscribe(dataObj => {
      if (dataObj && this.util.getCurrentPath() == "asset-list") {
        if (
          dataObj.source == "ON_THE_FLY_SUPPLIER" &&
          dataObj.data.step == "DONE"
        ) {
          this.getSupplierList("REFRESH");
        }
        if (dataObj.source == "ASSET" || dataObj.source == "ASSET_LIST") {
          self.getAssetList();
          self.cancelEdit();
        }
        if (dataObj.source == "UPLOAD_ASSET_DOC") {
          self.assetInfo = dataObj.data;
          self.getAssetList();
        }
      }
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
  getSearchTxt(filterValue: string) {
    if (filterValue == "") {
      this.searchTxt = "";
    }
  }
  sortList(columnName: string, sortType) {
    this.sortColumn = columnName;
    this.sortColumnType = sortType;
    if (this.sortColumn === columnName) {
      if (this.sortOrder === "ASC") this.sortOrder = "DSC";
      else this.sortOrder = "ASC";
    } else {
      this.sortOrder = "ASC";
    }
  }
  getAssetList() {
    let self = this;
    try {
      this.http.doGet("assets", function(error: boolean, response: any) {
        if (error) {
          self.assetList = [];
        } else {
          console.log("Asset list");
          console.log(response.data);
          self.assetList = [];
          for (let i = 0; i < response.data.length; i++) {
            let obj: any = {};
            obj = response.data[i].data;
            obj.unavailables = response.data[i].data.unavailables;
            obj.attributes = response.data[i].attributes;
            obj.docs = response.data[i].docs;
            obj.images = response.data[i].images;
            obj.attachments = response.data[i].attachments;
            obj.thumbnail_images = response.data[i].thumbnail_images
              ? response.data[i].thumbnail_images.image_path
              : response.data[i].thumbnail_images;
            obj.serial_no = parseInt(obj.serial_no);
            obj.scan_code = obj.scan_code.toString();
            obj.selectedAssetId = 0;
            self.assetList.push(obj);
          }
          if (self.assetInfo) {
            self.assetInfo.attachments = self.assetList.filter(
              item => item.asset_id == self.assetInfo.asset_id
            )[0].attachments;
          }

          if(self.assetList.length == 0) {
            self.onBoarding = true;
          }

          self.getEmployeeList();
          self.getSupplierList();
          self.getSupplierList1();

          self.route.snapshot.paramMap.get("id") != "0"
            ? self.showAssetDetails()
            : "";
        }
        self.util.hideProcessing("processing-spinner");
      });
    } catch (err) {
      this.global.addException("Assets List", "getAssetList()", err);
    }
  }

  showAssetDetails() {
    try {
      let sortedList: any[] = _.sortBy(this.assetList, "asset_id").reverse();
      for (var i = 0; i < sortedList.length; ++i) {
        if (this.route.snapshot.paramMap.get("id") == sortedList[i].asset_id) {
          this.selectAsset(sortedList[i], i);
          this.selectedIndex = i;
          this.assetListTab = sortedList[i].asset_status;
          break;
        }
      }
    } catch (err) {
      this.global.addException("Invoice List", "showInvoiceDetails()", err);
    }
  }

  getEmployeeList(): void {
    let self = this;
    try {
      this.http.doGet("getEmployee", function(error: boolean, response: any) {
        self.util.hideProcessing("processing-spinner");
        if (error) {
          self.empList = [];
        } else {
          self.empList = [];
          //self.empList = response.data;
          for (let i = 0; i < response.data.length; i++) {
            response.data[i].employee_info.emp_name =
              response.data[i].employee_info.first_name +
              " " +
              response.data[i].employee_info.last_name;
            self.empList.push(response.data[i].employee_info);
          }
          console.log("empList", response.data, self.empList);
        }
        self.filteredEmployee = self.assign_name.valueChanges.pipe(
          startWith(""),
          map(value => self.empFilter(value))
        );
      });
    } catch (err) {
      this.global.addException("Employee List", "getEmployeeList()", err);
    }
  }

  getSelectedEmp(emp, event: any): void {
    if (event.isUserInput) {
      console.log(emp);
      this.assign_to.setValue(emp.id);
    }
  }
  clearSelEmp() {
    //this.personDetails = null;
  }
  private empFilter(value: string): string[] {
    return this.empList.filter(option =>
      option.emp_name.toLowerCase().includes(value ? value.toLowerCase() : "")
    );
  }
  public validateEmp(event: any) {
    let asset = event.target.value;
    let match = this.empList.filter(
      item => item.emp_name.toLowerCase() == asset.toLowerCase()
    );
    console.log(match);
    if (asset == "") {
      this.assign_to.setValue("");
      return;
    }
    if (match.length > 0) {
      this.assign_to.setValue(match[0].id);
      this.assign_name.setValue(match[0].emp_name);
    }
  }

  // ===============   SUPPLIER  =================== //
  private getSupplierList(origin: string = "INIT"): void {
    var self = this;
    try {
      this.util.showProcessing("processing-spinner");
      this.http.doGet("suppliers", function(error: boolean, response: any) {
        if (error) {
          console.log("error", response);
        } else {
          self.util.hideProcessing("processing-spinner");
          self.pageData.supplierList = [];
          let materialSup =
            response.data.length > 0
              ? response.data.filter(item => item.supplier_type.type_id == 2)
              : [];
          // self.pageData.supplierList = materialSup.length > 0 ? response.data.filter(item => item.supplier_type.supplier_type == 'Assets')[0].suppliers : [];
          for (let i = 0; i < response.data.length; i++) {
            self.pageData.allSupplier = self.pageData.allSupplier.concat(
              response.data[i].suppliers
            );
            if (
              response.data[i].supplier_type.type_id == 2 ||
              response.data[i].supplier_type.type_id == 3
            ) {
              self.pageData.supplierList = self.pageData.supplierList.concat(
                response.data[i].suppliers
              );
            }
          }
          self.filteredSupplier = self.supplier.valueChanges.pipe(
            startWith(""),
            map(value => self.assetSupplierFilter(value))
          );
          self.filteredLeasedFrom = self.leased_from.valueChanges.pipe(
            startWith(""),
            map(value => self.financeSupplierFilter(value))
          );
          self.filteredFinancedFrom = self.financed_from.valueChanges.pipe(
            startWith(""),
            map(value => self.financeSupplierFilter(value))
          );
          self.filteredWarrantySupplier = self.warranty_supplier.valueChanges.pipe(
            startWith(""),
            map(value => self.financeWarrantyFilter(value))
          );
          // origin == 'REFRESH' ? (self.getSelectedSupplier(self.pageData.supplierList[self.pageData.supplierList.length - 1]),self.supplier.setValue(self.pageData.supplierList[self.pageData.supplierList.length - 1].supplier_name)) : '';
          origin == "REFRESH" ? self.setSupplierOTF() : "";
        }
      });
    } catch (err) {
      this.global.addException("Assets List", "getSupplierList()", err);
    }
  }
  getSelectedSupplier(supplier): void {
    this.supplier_id.setValue(supplier.supplier_id);
  }
  private supplierFilter(value: string): string[] {
    try {
      return this.pageData.supplierList.filter(option =>
        option.supplier_name
          .toLowerCase()
          .includes(value ? value.toLowerCase() : "")
      );
    } catch (err) {
      this.global.addException("Assets List", "supplierFilter()", err);
    }
  }
  private assetSupplierFilter(value: string): string[] {
    try {
      return this.pageData.supplierList.filter(
        option =>
          option.supplier_type == "Assets" &&
          option.supplier_name
            .toLowerCase()
            .includes(value ? value.toLowerCase() : "")
      );
    } catch (err) {
      this.global.addException("Assets New", "assetSupplierFilter()", err);
    }
  }
  private financeWarrantyFilter(value: string): string[] {
    try {
      return this.pageData.supplierList.filter(
        option =>
          option.supplier_type == "Warranty" &&
          option.supplier_name
            .toLowerCase()
            .includes(value ? value.toLowerCase() : "")
      );
    } catch (err) {
      this.global.addException("Assets New", "financeSupplierFilter()", err);
    }
  }
  private financeSupplierFilter(value: string): string[] {
    try {
      return this.pageData.supplierList.filter(
        option =>
          option.supplier_type == "Finance" &&
          option.supplier_name
            .toLowerCase()
            .includes(value ? value.toLowerCase() : "")
      );
    } catch (err) {
      this.global.addException("Assets New", "financeSupplierFilter()", err);
    }
  }
  // showAddSupplierPopup(): void { sessionStorage.removeItem('supplierObject');this.util.changeEvent(null);this.dialog.open(InventoryDialog, { data: { 'action': 'addNewSupplier' } }); }
  showAddSupplierPopup(supType, otfSupType): void {
    this.pageData.supTypeOTF = supType;
    this.util.setOTFSupType(otfSupType);
    //sessionStorage.setItem("supOTF", supType);
    sessionStorage.removeItem("supplierObject");
    this.util.changeEvent(null);
    this.dialog.open(InventoryDialog, { data: { action: "addNewSupplier" } });
  }
  setSupplierOTF(): void {
    try {
      let supList: any[] = _.sortBy(this.pageData.supplierList, "supplier_id");
      switch (this.pageData.supTypeOTF) {
        case "ASSET":
          this.supplier_id.setValue(supList[supList.length - 1].supplier_id);
          this.supplier.setValue(supList[supList.length - 1].supplier_name);
          break;
        case "LEASED":
          this.leased_from_id.setValue(supList[supList.length - 1].supplier_id);
          this.leased_from.setValue(supList[supList.length - 1].supplier_name);
          break;
        case "FINANCED":
          this.financed_from_id.setValue(
            supList[supList.length - 1].supplier_id
          );
          this.financed_from.setValue(
            supList[supList.length - 1].supplier_name
          );
          break;
        case "WARRANTY":
          this.warranty_supplier_id.setValue(
            supList[supList.length - 1].supplier_id
          );
          this.warranty_supplier.setValue(
            supList[supList.length - 1].supplier_name
          );
          break;
        default:
          break;
      }
    } catch (err) {
      this.global.addException("Assets New", "setSupplierOTF()", err);
    }
  }
  // ==============   END SUPPLIER  =============== //
  getSupplierList1() {
    let self = this;
    try {
      this.http.doGet("suppliers", function(error: boolean, response: any) {
        if (error) {
        } else {
          console.log("supplier array :: ", response.data);
          self.assetSuppliers =
            response.data.filter(item => item.supplier_type.type_id == 2)
              .length > 0
              ? response.data.filter(item => item.supplier_type.type_id == 2)[0]
                  .suppliers
              : "";
          self.financeSuppliers =
            response.data.filter(item => item.supplier_type.type_id == 3)
              .length > 0
              ? response.data.filter(item => item.supplier_type.type_id == 3)[0]
                  .suppliers
              : "";
        }
      });
    } catch (err) {
      this.global.addException("Assets List", "getSupplierList1()", err);
    }
  }

  getSelectedFSupplier(supplier, event: any): void {
    try {
      if (event.isUserInput) {
        this.financed_from_id.setValue(supplier.supplier_id);
      }
    } catch (err) {
      this.global.addException("Assets New", "getSelectedFSupplier()", err);
    }
  }
  public validateFSupplier(event: any) {
    try {
      let supplier = event.target.value;
      let match = this.pageData.supplierList.filter(
        item =>
          item.supplier_type == "Finance" &&
          item.supplier_name.toLowerCase() == supplier.toLowerCase()
      );
      if (supplier == "") {
        this.financed_from_id.setValue("");
        return;
      }
      if (match.length > 0) {
        this.financed_from_id.setValue(match[0].supplier_id);
        this.financed_from.setValue(match[0].supplier_name);
      }
    } catch (err) {
      this.global.addException("Assets New", "validateFSupplier()", err);
    }
  }
  getSelectedLSupplier(supplier, event: any): void {
    try {
      if (event.isUserInput) {
        this.leased_from_id.setValue(supplier.supplier_id);
      }
    } catch (err) {
      this.global.addException("Assets New", "getSelectedLSupplier()", err);
    }
  }
  public validateLSupplier(event: any) {
    try {
      let supplier = event.target.value;
      let match = this.pageData.supplierList.filter(
        item =>
          item.supplier_type == "Finance" &&
          item.supplier_name.toLowerCase() == supplier.toLowerCase()
      );
      if (supplier == "") {
        this.leased_from_id.setValue("");
        return;
      }
      if (match.length > 0) {
        this.leased_from_id.setValue(match[0].supplier_id);
        this.leased_from.setValue(match[0].supplier_name);
      }
    } catch (err) {
      this.global.addException("Assets New", "validateLSupplier()", err);
    }
  }
  getSelectedWSupplier(supplier, event: any): void {
    try {
      if (event.isUserInput) {
        this.warranty_supplier_id.setValue(supplier.supplier_id);
        this.warranty_supplier.setValue(supplier.supplier_name);
      }
    } catch (err) {
      this.global.addException("Assets New", "getSelectedWSupplier()", err);
    }
  }
  public validateWSupplier(event: any) {
    try {
      let supplier = event.target.value;
      let match = this.pageData.supplierList.filter(
        item =>
          item.supplier_type == "Finance" &&
          item.supplier_name.toLowerCase() == supplier.toLowerCase()
      );
      if (supplier == "") {
        this.warranty_supplier_id.setValue("");
        return;
      }
      if (match.length > 0) {
        this.warranty_supplier_id.setValue(match[0].supplier_id);
        this.warranty_supplier.setValue(match[0].supplier_name);
      }
    } catch (err) {
      this.global.addException("Assets New", "validateWSupplier()", err);
    }
  }

  getManfPartsList(obj) {
    let self = this;
    try {
      this.http.doGet("manufPartById/" + obj.manf_id, function(
        error: boolean,
        response: any
      ) {
        self.util.hideProcessing("processing-spinner");
        if (error) {
          self.manfPartsList = [];
        } else {
          self.manfPartsList = response.data;
          for (let i = 0; i < self.manfPartsList.length; i++) {
            if (self.manfPartsList[i].manf_part_id == obj.manf_part_id) {
              self.assetInfo = obj;
              self.assetList.map(item => {
                item.selectedAssetId = 0;
              });
              self.assetInfo.selectedAssetId = obj.asset_id;
              self.getLocationTags(obj.location_id);
              self.assetInfo.manf = self.manfPartsList[i];
              for (let j = 0; j < self.pageData.allSupplier.length; j++) {
                if (
                  self.assetInfo.financed_from ==
                  self.pageData.allSupplier[j].supplier_id
                ) {
                  self.assetInfo.financedSupplier =
                    self.pageData.allSupplier[j];
                }
                if (
                  self.assetInfo.leased_from ==
                  self.pageData.allSupplier[j].supplier_id
                ) {
                  self.assetInfo.leasedSupplier = self.pageData.allSupplier[j];
                }
                if (
                  self.assetInfo.warranty_supplier_id ==
                  self.pageData.allSupplier[j].supplier_id
                ) {
                  self.assetInfo.warrantySupplier =
                    self.pageData.allSupplier[j];
                }
              }
              for (let j = 0; j < self.assetSuppliers.length; j++) {
                if (
                  self.assetInfo.supplier_id ==
                  self.assetSuppliers[j].supplier_id
                ) {
                  self.assetInfo.supplier = self.assetSuppliers[j];
                }
              }
              var ownType = self.assetInfo.ownership_type;
              self.assetInfo.isOwned = ownType == "Owned" ? true : false;
              self.assetInfo.isLeased = ownType == "Leased" ? true : false;
              self.assetInfo.isFinanced = ownType == "Financed" ? true : false;
            }
          }
          setTimeout(function() {
            self.util.scrollDown("assetMark");
          }, 1000);
        }
      });
    } catch (err) {
      this.global.addException("Assets List", "getManfPartsList()", err);
    }
  }

  addNewAsset() {
    // this.router.navigate(["/inventory/csa-onboarding/add-asset"]);
    sessionStorage.removeItem("ASSET_OLD");
    if (this.router.url.split("/")[2] == "csa-onboarding") {
      this.router.navigate(["/inventory/csa-onboarding/add-asset"]);
    } else {
      this.router.navigate(["/inventory/csa/add-asset"]);
    }
  }

  //@Shahebaz (Start)

  showProductListPopup() {
    this.dialog.open(InventoryDialog, {
      data: {
        action: "purchaseOrderList",
        redirectPath: ["/inventory/rs/csa/add-receiving-slip"]
      }
    });
  }

  //@Shahebaz (End)

  updateAsset(assetObj: any) {
    try {
      //this.util.showProcessing('processing-spinner');
      let self = this;
      self.errMsg = "";
      self.isError = false;
      self.submitted = true;
      let data: any = {};
      data.asset_id = assetObj.asset_id;
      data.po_id = "";
      data.scan_code = assetObj.scan_code;
      data.short_tag = assetObj.short_tag;
      data.location_id = this.location_id.value;
      data.location_tag_id = this.location_tag_id.value;
      data.assign_to = this.assign_to.value;
      data.comment = assetObj.asset_comment;

      if (this.itemForm.valid) {
        self.util.addSpinner("update-asset-btn", "Update");
        this.http.doPost("assets/edit", data, function(
          error: boolean,
          response: any
        ) {
          //self.util.hideProcessing('processing-spinner');
          self.util.removeSpinner("update-asset-btn", "Update");
          if (error) {
            self.errMsg = response.message;
            self.isError = true;
          } else {
            self.getAssetList();
            self.cancelEdit();
            self.util.showDialog(DialogComponent, response.message, []);
          }
        });
      }
    } catch (err) {
      this.global.addException("Assets List", "updateAsset()", err);
    }
    //<<<<<<< HEAD
  }
  //   updateFinancial(form: FormGroup, assetObj: any) {
  //     try {
  //       //this.util.showProcessing('processing-spinner');
  //       let self = this;
  //       self.errMsg = "";
  //       self.isError = false;
  //       self.finSubmitted = true;
  //       let financials = [];
  //       let subMenu = {
  //         ownership_type: assetObj.ownership_type,
  //         supplier_id: form.value.supplier_id,
  //         purchase_date: assetObj.purchase_date,
  //         purchase_price: assetObj.purchase_price,
  //         esti_useful_life: form.value.esti_useful_life,
  //         residual_value: form.value.residual_value,
  //         age_of_equipment: form.value.age_of_equipment,
  //         montly_depreciation: assetObj.montly_depreciation,
  //         present_value: assetObj.present_value,
  //         leased_from: assetObj.leased_from,
  //         financed_from: assetObj.financed_from,
  //         paid_capital: form.value.paid_capital,
  //         start_date: form.value.start_date,
  //         end_date: form.value.end_date,
  //         term: assetObj.term,
  //         monthly_payment: assetObj.monthly_payment,
  //         warranty_supplier_id: assetObj.warranty_supplier_id,
  //         warranty_end_date: form.value.warranty_end_date,
  //         acc_ref_no: form.value.acc_ref_no
  //       };
  //       financials.push(subMenu);
  //       let data: any = {};
  //       data.asset_id = assetObj.asset_id;
  //       data.financials = financials;
  //       data.financials[0].purchase_date = this.util.getYYYYMMDDDate(
  //         data.financials[0].purchase_date
  //       );
  //       data.financials[0].start_date = this.util.getYYYYMMDDDate(
  //         data.financials[0].start_date
  //       );
  //       data.financials[0].end_date = this.util.getYYYYMMDDDate(
  //         data.financials[0].end_date
  //       );
  //       data.financials[0].warranty_end_date = this.util.getYYYYMMDDDate(
  //         data.financials[0].warranty_end_date
  //       );
  // =======
  updateFinancial(form: FormGroup, assetObj: any) {
    try {
      //this.util.showProcessing('processing-spinner');
      console.log(form.value);
      let self = this;
      self.errMsg = "";
      self.isError = false;
      self.finSubmitted = true;
      let financials = [];
      let subMenu = {
        ownership_type: assetObj.ownership_type,
        supplier_id: form.value.supplier_id,
        purchase_date: form.value.purchase_date,
        purchase_price: form.value.purchase_price,
        esti_useful_life: form.value.esti_useful_life,
        residual_value: form.value.residual_value,
        age_of_equipment: form.value.age_of_equipment,
        montly_depreciation: assetObj.montly_depreciation,
        present_value: assetObj.present_value,
        leased_from: assetObj.leased_from,
        financed_from: assetObj.financed_from,
        paid_capital: form.value.paid_capital,
        start_date: form.value.start_date,
        end_date: form.value.end_date,
        term: assetObj.term,
        monthly_payment: assetObj.monthly_payment,
        warranty_supplier_id: assetObj.warranty_supplier_id,
        warranty_end_date: form.value.warranty_end_date,
        acc_ref_no: form.value.acc_ref_no
      };
      financials.push(subMenu);
      let data: any = {};
      data.asset_id = assetObj.asset_id;
      data.financials = financials;
      data.financials[0].purchase_date = this.util.getYYYYMMDDDate(
        data.financials[0].purchase_date
      );
      data.financials[0].start_date = this.util.getYYYYMMDDDate(
        data.financials[0].start_date
      );
      data.financials[0].end_date = this.util.getYYYYMMDDDate(
        data.financials[0].end_date
      );
      data.financials[0].warranty_end_date = this.util.getYYYYMMDDDate(
        data.financials[0].warranty_end_date
      );
      //>>>>>>> Shubham

      if (assetObj.isOwned) {
        data.financials[0].present_value = assetObj.present_value;
        data.financials[0].montly_depreciation = assetObj.montly_depreciation;
      } else if (assetObj.isLeased) {
        data.financials[0].present_value = "";
        data.financials[0].montly_depreciation = "";
      } else if (assetObj.isFinanced) {
        data.financials[0].present_value = "";
        data.financials[0].montly_depreciation = "";
      }
      if (form.valid) {
        self.util.addSpinner("fin-update-btn", "Update");
        this.http.doPost("assetsfinancial/edit", data, function(
          error: boolean,
          response: any
        ) {
          console.log(response);
          self.util.removeSpinner("fin-update-btn", "Update");
          if (error) {
            self.errMsg = response.message;
            self.isError = true;
          } else {
            self.getAssetList();
            self.cancelEdit();
            self.util.showDialog(DialogComponent, response.message, []);
          }
        });
      }
    } catch (err) {
      this.global.addException("Assets List", "updateFinancial()", err);
    }
  }
  cancelEdit() {
    this.isEditDetails = false;
    this.isEditFinancial = false;
    this.assetInfo = null;
    this.action = "";
    this.selectedIndex = null;
  }
  private validateMDInput(callback) {
    try {
      if (
        !this.constant.AMOUNT_PATTERN.test(this.esti_useful_life.value) ||
        !this.constant.AMOUNT_PATTERN.test(this.residual_value.value)
      ) {
        return callback(false);
      }
      return callback(true);
    } catch (err) {
      this.global.addException("Assets New", "validateMDInput()", err);
    }
  }
  calcMonthlyDepriciation(event: any, field: any) {
    let self = this;
    try {
      this.validateMDInput(function(response) {
        if (!response) {
          return;
        }
        if (field == "RV") {
          if (
            self.assetInfo.purchase_price != "" &&
            self.esti_useful_life.value != "" &&
            event.target.value != ""
          ) {
            self.assetInfo.montly_depreciation = (
              (self.assetInfo.purchase_price - event.target.value) /
              self.esti_useful_life.value
            ).toFixed(2);
          } else {
            self.assetInfo.montly_depreciation = "";
          }
        } else if (field == "PP") {
          if (
            self.residual_value.value != "" &&
            self.esti_useful_life.value != "" &&
            event.target.value != ""
          ) {
            self.assetInfo.montly_depreciation = (
              (event.target.value - self.residual_value.value) /
              self.esti_useful_life.value
            ).toFixed(2);
          } else {
            self.assetInfo.montly_depreciation = "";
          }
        } else if (field == "EUL") {
          if (
            self.residual_value.value != "" &&
            self.assetInfo.purchase_price != "" &&
            event.target.value != ""
          ) {
            self.assetInfo.montly_depreciation = (
              (self.assetInfo.purchase_price - self.residual_value.value) /
              event.target.value
            ).toFixed(2);
          } else {
            self.assetInfo.montly_depreciation = "";
          }
        }
      });
      // if(field == 'RV'){
      //     if(this.assetInfo.purchase_price != '' && this.assetInfo.esti_useful_life != '' && event.target.value != ''){
      //         this.assetInfo.montly_depreciation = ( (this.assetInfo.purchase_price - event.target.value) / this.assetInfo.esti_useful_life ).toFixed(2);
      //     }else{
      //         this.assetInfo.montly_depreciation = 'XXXXXXXX';
      //     }
      // }else if(field == 'EUL'){
      //     if(this.assetInfo.purchase_price != '' && this.assetInfo.residual_value != '' && event.target.value != ''){
      //         this.assetInfo.montly_depreciation = ( (this.assetInfo.purchase_price - this.assetInfo.residual_value) / event.target.value ).toFixed(2);
      //     }else{
      //         this.assetInfo.montly_depreciation = 'XXXXXXXX';
      //     }
      // }
    } catch (err) {
      this.global.addException("Assets List", "calcMonthlyDepriciation()", err);
    }
  }
  searchEmployee(filterValue: string, filterType: string) {
    try {
      if (filterValue == "") {
        //this.removeTag(filterType);
      } else {
        if (this.appliedFilter.length > 0) {
          for (var i = 0; i < this.appliedFilter.length; i++) {
            if (filterType == this.appliedFilter[i].tagName) {
              this.appliedFilter[i].tagValue = filterValue;
              return;
            }
          }
        } else {
        }
      }
    } catch (err) {
      this.global.addException("Assets List", "searchEmployee()", err);
    }
  }

  changeAssetList(assetType) {
    this.assetListTab = assetType;
    this.assetInfo = this.selectedIndex = null;
  }
  changeLocation(obj: any) {
    this.getLocationTags(obj.location_id);
  }
  getLocationList() {
    let self = this;
    try {
      this.http.doGet("location/list", function(error: boolean, response: any) {
        if (error) {
          self.locList = [];
        } else {
          self.locList = response.data;
          self.filteredLocations = self.location.valueChanges.pipe(
            startWith(""),
            map(value => self.locationFilter(value))
          );
        }
      });
    } catch (err) {
      this.global.addException("Assets List", "getLocationList()", err);
    }
  }
  private locationFilter(value: string): string[] {
    try {
      return this.locList.filter(option =>
        option.location_name
          .toLowerCase()
          .includes(value ? value.toLowerCase() : "")
      );
    } catch (err) {
      this.global.addException("Assets List", "locationFilter()", err);
    }
  }
  public validateLoc(event: any) {
    try {
      let loc = event.target.value;
      if (loc == "") {
        this.location_id.setValue("");
        this.location.setValue("");
        return;
      }
      let match = this.locList.filter(
        item => item.location_name.toLowerCase() == loc.toLowerCase()
      );
      if (match.length > 0) {
        this.location.setValue(match[0].location_name);
        this.location_id.setValue(match[0].location_id);
        this.getLocationTags(match[0].location_id);
      }
    } catch (err) {
      this.global.addException("Assets List", "validateLoc()", err);
    }
  }
  getSelectedLocation(event: any, selectedLoc: any) {
    try {
      if (event.isUserInput) {
        this.location_id.setValue(selectedLoc.location_id);
        this.getLocationTags(selectedLoc.location_id);
      }
    } catch (err) {
      this.global.addException("Assets List", "getSelectedLocation()", err);
    }
  }
  getSelectedTag(event: any, selectedTag: any) {
    try {
      if (event.isUserInput) {
        this.location_tag_id.setValue(selectedTag.location_tag_id);
      }
    } catch (err) {
      this.global.addException("Assets List", "getSelectedTag()", err);
    }
  }
  getLocationTags(id) {
    var self = this;
    try {
      this.http.doGet("location/tag/" + id, function(
        error: boolean,
        response: any
      ) {
        if (error) {
          console.log("error", response);
        } else {
          self.locTagsList = response.tags ? response.tags : [];
          if (self.assetInfo) {
            let tag = self.locTagsList.filter(
              item => item.location_tag_id == self.location_tag_id.value
            );
            if (tag.length > 0) {
              self.location_tag.setValue(tag[0].location_tag);
              self.assetInfo.location_tag = tag[0].location_tag;
            }
          }
          self.filteredTags = self.location_tag.valueChanges.pipe(
            startWith(""),
            map(value => self.locationTagsFilter(value))
          );
        }
      });
    } catch (err) {
      this.global.addException("Assets List", "getLocationTags()", err);
    }
  }
  private locationTagsFilter(value: string): string[] {
    try {
      return this.locTagsList.filter(option =>
        option.location_tag
          .toLowerCase()
          .includes(value ? value.toLowerCase() : "")
      );
    } catch (err) {
      this.global.addException("Assets List", "locationTagsFilter()", err);
    }
  }
  public validateLocTags(event: any) {
    try {
      let loc = event.target.value;
      let match = this.locTagsList.filter(
        item => item.location_tag.toLowerCase() == loc.toLowerCase()
      );
      if (match.length > 0) {
        this.location_tag.setValue(match[0].location_tag);
        this.location_tag_id.setValue(match[0].location_tag_id);
      }
    } catch (err) {
      this.global.addException("Assets List", "validateLocTags()", err);
    }
  }
  selectAsset(assetObj: any = {}, index) {
    try {
      console.log(assetObj);
      let self = this;
      self.loc.go("/inventory/csa/asset-list/" + assetObj.asset_id);
      this.assetDetails = "details";
      this.selectedIndex = index;
      this.util.showProcessing("processing-spinner");
      this.assetInfo = null;
      //this.assetInfo = assetObj;
      this.getManfPartsList(assetObj);
      this.getLocationList();
      this.createItemForm();
      this.createFinancialForm();
      this.getSupplierList();
      this.location_id.setValue(assetObj.location_id);
      this.location.setValue(assetObj.location_name);
      this.location_tag_id.setValue(assetObj.location_tag_id);
      this.assign_to.setValue(assetObj.assign_to);
      this.assign_name.setValue(
        assetObj.wo_assign_to
          ? assetObj.wo_assign_to.first_name +
              " " +
              assetObj.wo_assign_to.last_name
          : ""
      );

      let supName: any;
      for (let i = 0; i < this.assetSuppliers.length; i++) {
        if (this.assetSuppliers[i].supplier_id == assetObj.supplier_id) {
          supName = this.assetSuppliers[i].supplier_name;
        }
      }
      if (assetObj.ownership_type == "Owned") {
        this.util.addBulkValidators(
          this.financialForm,
          ["esti_useful_life", "residual_value"],
          [
            Validators.required,
            Validators.pattern(this.constant.AMOUNT_PATTERN)
          ]
        );
        // this.util.addBulkValidators(this.financialForm, ['esti_useful_life', 'residual_value', 'age_of_equipment'], [ Validators.required ]);

        this.financialForm.controls["supplier"].setValue(supName);
        this.financialForm.controls["supplier_id"].setValue(
          assetObj.supplier_id
        );
        this.financialForm.controls["esti_useful_life"].setValue(
          assetObj.esti_useful_life
        );
        this.financialForm.controls["residual_value"].setValue(
          assetObj.residual_value
        );
        this.financialForm.controls["age_of_equipment"].setValue(
          assetObj.age_of_equipment
        );
      } else if (
        assetObj.ownership_type == "Financed" ||
        assetObj.ownership_type == "Leased"
      ) {
        this.util.addBulkValidators(
          this.financialForm,
          ["term"],
          [Validators.required]
        );

        // <<<<<<< HEAD
        //         this.financialForm.controls["start_date"].setValue(assetObj.start_date);
        //         this.financialForm.controls["end_date"].setValue(assetObj.end_date);
        //         this.financialForm.controls["term"].setValue(assetObj.term);
        //         this.financialForm.controls["paid_capital"].setValue(
        //           assetObj.paid_capital
        //         );
        //       }
        //       if (assetObj.ownership_type == "Leased") {
        //         this.util.addBulkValidators(
        //           this.financialForm,
        //           ["leased_from"],
        //           [Validators.required]
        //         );
        //         console.log(this.financeSuppliers);
        //         this.financialForm.controls["leased_from"].setValue(
        //           this.financeSuppliers.filter(
        //             option => option.supplier_id == assetObj.leased_from
        //           )[0].supplier_name
        //         );
        //         this.financialForm.controls["leased_from_id"].setValue(
        //           assetObj.leased_from
        //         );
        //       } else if (assetObj.ownership_type == "Financed") {
        //         this.util.addBulkValidators(
        //           this.financialForm,
        //           ["financed_from"],
        //           [Validators.required]
        //         );
        //         this.financialForm.controls["financed_from"].setValue(
        //           this.financeSuppliers.filter(
        //             option => option.supplier_id == assetObj.financed_from
        //           )[0].supplier_name
        //         );
        //         this.financialForm.controls["financed_from_id"].setValue(
        //           assetObj.financed_from
        //         );
        //       }
        //       assetObj.warranty_supplier = assetObj.warranty_supplier_id;
        //       this.financialForm.controls["warranty_supplier"].setValue(
        //         assetObj.warranty_supplier_id
        //           ? this.financeSuppliers.filter(
        //               option => option.supplier_id == assetObj.warranty_supplier
        //             )[0].supplier_name
        //           : ""
        //       );
        //       this.financialForm.controls["warranty_supplier_id"].setValue(
        //         assetObj.warranty_supplier
        //       );
        //       this.financialForm.controls["acc_ref_no"].setValue(assetObj.acc_ref_no);
        //       this.financialForm.controls["warranty_end_date"].setValue(
        //         assetObj.warranty_end_date
        //       );
        // =======
        this.financialForm.controls["start_date"].setValue(assetObj.start_date);
        this.financialForm.controls["end_date"].setValue(assetObj.end_date);
        this.financialForm.controls["term"].setValue(assetObj.term);
        this.financialForm.controls["paid_capital"].setValue(
          assetObj.paid_capital
        );
      }
      if (assetObj.ownership_type == "Leased") {
        let financeSupplier = this.pageData.supplierList.filter(
          option => option.supplier_id == assetObj.leased_from
        );
        this.util.addBulkValidators(
          this.financialForm,
          ["leased_from"],
          [Validators.required]
        );
        console.log(this.financeSuppliers);
        this.financialForm.controls["leased_from"].setValue(
          financeSupplier.length > 0 ? financeSupplier[0].supplier_name : ""
        );
        this.financialForm.controls["leased_from_id"].setValue(
          assetObj.leased_from
        );
      } else if (assetObj.ownership_type == "Financed") {
        let financeSupplier = this.pageData.supplierList.filter(
          option => option.supplier_id == assetObj.financed_from
        );
        this.util.addBulkValidators(
          this.financialForm,
          ["financed_from"],
          [Validators.required]
        );
        this.financialForm.controls["financed_from"].setValue(
          financeSupplier.length > 0 ? financeSupplier[0].supplier_name : ""
        );
        this.financialForm.controls["financed_from_id"].setValue(
          assetObj.financed_from
        );
      }
      assetObj.warranty_supplier = assetObj.warranty_supplier_id;
      let warrantySupplier = this.pageData.allSupplier.filter(
        option => option.supplier_id == assetObj.warranty_supplier
      );
      this.financialForm.controls["warranty_supplier"].setValue(
        assetObj.warranty_supplier_id && warrantySupplier.length > 0
          ? warrantySupplier[0].supplier_name
          : ""
      );
      this.financialForm.controls["warranty_supplier_id"].setValue(
        assetObj.warranty_supplier
      );
      this.financialForm.controls["acc_ref_no"].setValue(assetObj.acc_ref_no);
      this.financialForm.controls["warranty_end_date"].setValue(
        assetObj.warranty_end_date
      );
      this.financialForm.controls["purchase_date"].setValue(
        assetObj.purchase_date ? assetObj.purchase_date : ""
      );
      this.financialForm.controls["purchase_price"].setValue(
        assetObj.purchase_price ? assetObj.purchase_price : ""
      );
      //>>>>>>> Shubham

      this.checkAssignedWO(assetObj.asset_id);
    } catch (err) {
      this.global.addException("Assets List", "selectAsset()", err);
    }
  }

  // <<<<<<< HEAD
  //   checkAssignedWO(assetId): void {
  //     let self = this;
  //     self.util.addSpinner("delete-btn", "Delete");
  //     this.http.doGet("getAllWorkOrders/asset/" + assetId, function(
  //       error: boolean,
  //       response: any
  //     ) {
  //       self.util.removeSpinner("delete-btn", "Delete");
  //       if (error) {
  //         console.log(response);
  //       } else {
  //         self.woList = response.data.work_orders;
  //       }
  //     });
  //   }
  // =======

  checkAssignedWO(assetId): void {
    let self = this;
    self.util.addSpinner("delete-btn", "Delete");
    this.http.doGet("getAllWorkOrders/asset/" + assetId, function(
      error: boolean,
      response: any
    ) {
      self.util.removeSpinner("delete-btn", "Delete");
      if (error) {
        console.log(response);
      } else {
        self.woList = response.data.work_orders;
      }
    });
  }
  //>>>>>>> Shubham

  showDetails(option) {
    try {
      this.assetDetails = option;
      this.errMsg = "";
      this.isError = false;
      this.isEditDetails = false;
      this.isEditFinancial = false;
    } catch (err) {
      this.global.addException("Assets List", "showDetails()", err);
    }
  }
  changeAction(action) {
    var self = this;
    try {
      self.action = action;
      if (action == "editDetails") {
        self.isEditDetails = true;
      } else if (action == "editFinancial") {
        self.isEditFinancial = true;
      }
    } catch (err) {
      this.global.addException("Assets List", "changeAction()", err);
    }
  }
  deleteAction(assetId) {
    try {
      let data: any = {
        API_URL: "assets/delete",
        reqObj: {
          asset_id: assetId
        },
        event: {
          source: "ASSET",
          action: "DELETE"
        },
        assignedWO: this.woList
      };

      this.woList.length == 0
        ? this.util.showDialog(
            DialogComponent,
            "Are you sure you want to delete " +
              this.assetInfo.short_tag +
              " ?",
            [],
            "Delete Confirmation ?",
            "CONFIRMATION",
            data
          )
        : this.util.showDialog(
            DialogComponent,
            this.assetInfo.short_tag +
              " is assigned to the following work orders:",
            [],
            "Delete " + this.assetInfo.short_tag + " ?",
            "CONFIRMATION_WITH_WARNING",
            data
          );

      //this.util.showDialog(DialogComponent, "Are you sure you want to delete Asset?", [], "Delete Confirmation", "CONFIRMATION", data);
    } catch (err) {
      this.global.addException("Assets List", "deleteAction()", err);
    }
  }

  addFromCSV() {
    let route: string,
      apiEndPoint: string,
      csvTemplateUrl: string,
      redirectUrl: string;
    route = "/csa-onboarding/csv-preview/assets";
    apiEndPoint = "assets/csv";
    csvTemplateUrl = this.config.domainIP + "api/download/csv/asset.csv";
    redirectUrl = "/inventory/csa/asset-list/0";

    //<<<<<<< HEAD
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

  // addNewDoc() {
  //   try {
  //     this.assetInfo.inventoryId = this.assetInfo.asset_id;
  //     this.assetInfo.inventoryType = "asset";
  //     this.dialog.open(InventoryDialog, {
  //       data: { action: "UPLOAD_ASSET_DOC", assetInfo: this.assetInfo }
  //     });
  //   } catch (err) {
  //     this.global.addException("Assets List", "addNewDoc()", err);
  //   }
  // }
  // // public clearAutoComplete(name,id){
  // //     let self = this;
  // //     let backspaceEvent = $.Event("keyup", { keyCode: 20 });
  // //     $("#"+id).trigger( backspaceEvent );
  // //     setTimeout(function(){
  // //         self.itemForm.get(id).setValue('');
  // //         self.itemForm.get(name).setValue('');
  // //     },1);
  // // }
  // // public clearAutoCompleteF(name,id){
  // //     let self = this;
  // //     let backspaceEvent = $.Event("keyup", { keyCode: 20 });
  // //     $("#"+id).trigger( backspaceEvent );
  // //     setTimeout(function(){
  // //         self.financialForm.get(id).setValue('');
  // //         self.financialForm.get(name).setValue('');
  // //     },1);
  // // }
  // public createItemForm() {
  //   this.itemForm = this.fb.group({
  //     location: new FormControl("", []),
  //     location_id: new FormControl("", [Validators.required]),
  //     location_tag: new FormControl("", []),
  //     location_tag_id: new FormControl("", [Validators.required]),
  //     assign_to: new FormControl("", []),
  //     assign_name: new FormControl("", [])
  //   });
  // }
  // get location() {
  //   return this.itemForm.get("location");
  // }
  // get location_id() {
  //   return this.itemForm.get("location_id");
  // }
  // get location_tag() {
  //   return this.itemForm.get("location_tag");
  // }
  // get location_tag_id() {
  //   return this.itemForm.get("location_tag_id");
  // }
  // get assign_to() {
  //   return this.itemForm.get("assign_to");
  // }
  // get assign_name() {
  //   return this.itemForm.get("assign_name");
  // }
  // public createFinancialForm() {
  //   this.financialForm = this.fb.group({
  //     supplier: new FormControl("", []),
  //     supplier_id: new FormControl("", []),
  //     leased_from: new FormControl("", []),
  //     leased_from_id: new FormControl("", []),
  //     financed_from: new FormControl("", []),
  //     financed_from_id: new FormControl("", []),
  //     warranty_supplier: new FormControl("", []),
  //     warranty_supplier_id: new FormControl("", []),
  //     esti_useful_life: new FormControl("", []),
  //     residual_value: new FormControl("", []),
  //     age_of_equipment: new FormControl("", []),
  //     term: new FormControl("", []),
  //     acc_ref_no: new FormControl("", []),
  //     start_date: new FormControl("", []),
  //     end_date: new FormControl("", []),
  //     warranty_end_date: new FormControl("", []),
  //     paid_capital: new FormControl("", [])
  //   });
  // }
  // get supplier() {
  //   return this.financialForm.get("supplier");
  // }
  // get supplier_id() {
  //   return this.financialForm.get("supplier_id");
  // }
  // get leased_from() {
  //   return this.financialForm.get("leased_from");
  // }
  // get leased_from_id() {
  //   return this.financialForm.get("leased_from_id");
  // }
  // get financed_from() {
  //   return this.financialForm.get("financed_from");
  // }
  // get financed_from_id() {
  //   return this.financialForm.get("financed_from_id");
  // }
  // get warranty_supplier() {
  //   return this.financialForm.get("warranty_supplier");
  // }
  // get warranty_supplier_id() {
  //   return this.financialForm.get("warranty_supplier_id");
  // }
  // get esti_useful_life() {
  //   return this.financialForm.get("esti_useful_life");
  // }
  // get residual_value() {
  //   return this.financialForm.get("residual_value");
  // }
  // get age_of_equipment() {
  //   return this.financialForm.get("age_of_equipment");
  // }
  // get term() {
  //   return this.financialForm.get("term");
  // }
  // get acc_ref_no() {
  //   return this.financialForm.get("acc_ref_no");
  // }
  // get start_date() {
  //   return this.financialForm.get("start_date");
  // }
  // get end_date() {
  //   return this.financialForm.get("end_date");
  // }
  // get warranty_end_date() {
  //   return this.financialForm.get("warranty_end_date");
  // }
  // get paid_capital() {
  //   return this.financialForm.get("paid_capital");
  // }

  addNewDoc() {
    try {
      this.assetInfo.inventoryId = this.assetInfo.asset_id;
      this.assetInfo.inventoryType = "asset";
      this.dialog.open(InventoryDialog, {
        data: { action: "UPLOAD_ASSET_DOC", assetInfo: this.assetInfo }
      });
    } catch (err) {
      this.global.addException("Assets List", "addNewDoc()", err);
    }
  }
  // public clearAutoComplete(name,id){
  //     let self = this;
  //     let backspaceEvent = $.Event("keyup", { keyCode: 20 });
  //     $("#"+id).trigger( backspaceEvent );
  //     setTimeout(function(){
  //         self.itemForm.get(id).setValue('');
  //         self.itemForm.get(name).setValue('');
  //     },1);
  // }
  // public clearAutoCompleteF(name,id){
  //     let self = this;
  //     let backspaceEvent = $.Event("keyup", { keyCode: 20 });
  //     $("#"+id).trigger( backspaceEvent );
  //     setTimeout(function(){
  //         self.financialForm.get(id).setValue('');
  //         self.financialForm.get(name).setValue('');
  //     },1);
  // }
  public createItemForm() {
    this.itemForm = this.fb.group({
      location: new FormControl("", []),
      location_id: new FormControl("", [Validators.required]),
      location_tag: new FormControl("", []),
      location_tag_id: new FormControl("", [Validators.required]),
      assign_to: new FormControl("", []),
      assign_name: new FormControl("", [])
    });
  }
  get location() {
    return this.itemForm.get("location");
  }
  get location_id() {
    return this.itemForm.get("location_id");
  }
  get location_tag() {
    return this.itemForm.get("location_tag");
  }
  get location_tag_id() {
    return this.itemForm.get("location_tag_id");
  }
  get assign_to() {
    return this.itemForm.get("assign_to");
  }
  get assign_name() {
    return this.itemForm.get("assign_name");
  }
  public createFinancialForm() {
    this.financialForm = this.fb.group({
      supplier: new FormControl("", []),
      supplier_id: new FormControl("", []),
      leased_from: new FormControl("", []),
      purchase_date: new FormControl("", []),
      purchase_price: new FormControl("", []),
      leased_from_id: new FormControl("", []),
      financed_from: new FormControl("", []),
      financed_from_id: new FormControl("", []),
      warranty_supplier: new FormControl("", []),
      warranty_supplier_id: new FormControl("", []),
      esti_useful_life: new FormControl("", []),
      residual_value: new FormControl("", []),
      age_of_equipment: new FormControl("", []),
      term: new FormControl("", []),
      acc_ref_no: new FormControl("", []),
      start_date: new FormControl("", []),
      end_date: new FormControl("", []),
      warranty_end_date: new FormControl("", []),
      paid_capital: new FormControl("", [])
    });
  }
  get supplier() {
    return this.financialForm.get("supplier");
  }
  get supplier_id() {
    return this.financialForm.get("supplier_id");
  }
  get purchase_date() {
    return this.financialForm.get("purchase_date");
  }
  get purchase_price() {
    return this.financialForm.get("purchase_price");
  }
  get leased_from() {
    return this.financialForm.get("leased_from");
  }
  get leased_from_id() {
    return this.financialForm.get("leased_from_id");
  }
  get financed_from() {
    return this.financialForm.get("financed_from");
  }
  get financed_from_id() {
    return this.financialForm.get("financed_from_id");
  }
  get warranty_supplier() {
    return this.financialForm.get("warranty_supplier");
  }
  get warranty_supplier_id() {
    return this.financialForm.get("warranty_supplier_id");
  }
  get esti_useful_life() {
    return this.financialForm.get("esti_useful_life");
  }
  get residual_value() {
    return this.financialForm.get("residual_value");
  }
  get age_of_equipment() {
    return this.financialForm.get("age_of_equipment");
  }
  get term() {
    return this.financialForm.get("term");
  }
  get acc_ref_no() {
    return this.financialForm.get("acc_ref_no");
  }
  get start_date() {
    return this.financialForm.get("start_date");
  }
  get end_date() {
    return this.financialForm.get("end_date");
  }
  get warranty_end_date() {
    return this.financialForm.get("warranty_end_date");
  }
  get paid_capital() {
    return this.financialForm.get("paid_capital");
  }
  //>>>>>>> Shubham

  generatepdf() {
    this.file.generatePortraitpdf("asset-tbl", "Asset List", "asset_list");
  }
  generatecsv() {
    this.file.generatecsv("asset-tbl", "asset_list");
  }

  needMaintenanceRequest() {
    try {
      this.dialog.open(MaintenanceDialog, {
        data: {
          action: "addNewMaintenance",
          source: "ASSET_LIST",
          reqObj: {
            asset_id: this.assetInfo.asset_id,
            short_tag: this.assetInfo.short_tag
          }
        }
      });
    } catch (err) {
      this.global.addException("Assets List", "needMaintenanceRequest()", err);
    }
  }
  showImage(url) {
    try {
      this.dialog.open(DialogComponent, {
        data: { action: "image", url: url }
      });
      this.ref.tick();
    } catch (err) {
      this.global.addException("Assets List", "showImage()", err);
    }
  }
  startDateChange(event) {
    this.financialForm.get("end_date").setValue("");
    console.log("hii");
  }

  changeStatusToAvailable(asset_id) {
    var self = this;
    console.log(asset_id);
    self.util.showProcessing("processing-spinner");
    try {
      this.http.doGet("assets/available/" + asset_id, function(
        error: boolean,
        response: any
      ) {
        if (error) {
          console.log("error", response);
        } else {
          console.log(response);
          self.assetInfo = null;
          self.action = "";
          self.selectedIndex = null;
          self.getAssetList();

          self.util.hideProcessing("processing-spinner");
        }
      });
    } catch (err) {
      this.global.addException("Assets List", "getLocationTags()", err);
    }
    //<<<<<<< HEAD
  }
  //=======

  public purchaseDateChange(event: any) {
    let self = this;
    try {
      let today = new Date();
      let pDate = event;
      let difference = this.dateDiffInDays(today, pDate);
      if (difference < 0) {
        difference = Math.abs(difference);
        difference = difference / 30;
      } else {
        difference = 0;
      }
      this.age_of_equip = difference.toFixed(2);
      self.assetInfo.age_of_equipment = this.age_of_equip;
      self.financialForm.controls["age_of_equipment"].setValue(
        this.age_of_equip
      );
      self.assetInfo.present_value =
        self.financialForm.get("purchase_price").value -
        parseFloat(self.assetInfo.montly_depreciation) *
          parseFloat(self.age_of_equip);
    } catch (err) {
      this.global.addException("Assets New", "purchaseDateChange()", err);
    }
  }

  public dateDiffInDays(a, b) {
    var _MS_PER_DAY = 1000 * 60 * 60 * 24;
    // Discard the time and time-zone information.
    var utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
    var utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());

    return Math.floor((utc2 - utc1) / _MS_PER_DAY);
  }
  //>>>>>>> Shubham
}
