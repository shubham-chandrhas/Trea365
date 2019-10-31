import { Component, OnInit } from "@angular/core";
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
  NativeDateAdapter
} from "@angular/material";
import { Router, ActivatedRoute } from "@angular/router";
import {
  FormControl,
  Validators,
  FormGroup,
  FormBuilder
} from "@angular/forms";
import * as _ from "underscore";

import { AdminService } from "../../../admin/admin.service";
import { UtilService } from "../../../../shared/service/util.service";
import { HttpService } from "../../../../shared/service/http.service";
import { GlobalService } from "../../../../shared/service/global.service";
import { Observable } from "rxjs";
import { map, startWith } from "rxjs/operators";
import { InventoryDialog } from "../../inventory-dialog.component";
import { ManufacturerDialog } from "../../../../shared/module/manufacturer/manufacturer/manufacturer.component";
import { ConstantsService } from "../../../../shared/service/constants.service";

declare var jQuery: any;
declare var $: any;

@Component({
  selector: "app-add-asset",
  templateUrl: "./add-asset.component.html",
  styleUrls: ["./add-asset.component.css"]
})
export class AddAssetComponent implements OnInit {
  pageData: any = {
    isError: false,
    addOption: "WithPO",
    manufacturerPartList: [],
    manufacturerList: [],
    supplierList: [],
    submitted: false,
    selectedVal: {},
    selectedMfgPart: null,
    locationList: [],
    addOpt: "WithPO",
    assetSupplier: [],
    financeSupplier: [],
    serialNoAvailability: "0",
    assetNameAvailability: "0"
  };
  public age_of_equip: any = 0;
  public barCode: any;
  public assetObj: any;
  public assetFinal: any;

  public manufacturerList: any = [];
  public manfPartsList: any = [];
  public manfPartsDetails: any = [];
  public isPO: boolean = false;
  public isAddNew: boolean = false;
  public isFinancial: boolean = false;
  public isOwned: boolean = false;
  public isLeased: boolean = false;
  public isFinanced: boolean = false;
  public submitted: boolean = false;
  public finSubmitted: boolean = false;
  public filteredLocations: Observable<string[]>;
  public filteredTags: Observable<string[]>;
  public locList: any[] = [];
  public locTagsList: any[] = [];
  isMainLocationLoad: boolean = false;
  isSubLocationLoad: boolean = false;
  autoNumber: number;
  selLocation = new FormControl();
  selTags = new FormControl();
  minDate = new Date();
  minEndDate = new Date();
  maxDate = new Date();

  private routeObj: any;
  empList: any[] = [];
  addOpt = "WithPO";
  currentPath: string;
  addNewAForm: FormGroup;
  addFinanceForm: FormGroup;
  filteredManufacturer: Observable<string[]>;
  filteredManufacturerPart: Observable<string[]>;

  filteredEmployee: Observable<string[]>;
  filteredSupplier: Observable<string[]>;
  filteredLeasedFrom: Observable<string[]>;
  filteredFinancedFrom: Observable<string[]>;
  filteredWarrantySupplier: Observable<string[]>;
  constructor(
    public dialog: MatDialog,
    public util: UtilService,
    public constant: ConstantsService,
    public http: HttpService,
    public global: GlobalService,
    public router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private admin: AdminService
  ) {
    this.createMFGForm();
    this.createFinanceForm();
    this.getLocationList();
  }

  ngOnInit() {
    this.util.setWindowHeight();
    this.util.setPageTitle(this.route);
    this.currentPath = this.router.url.split("/")[
      this.router.url.split("/").length - 1
    ];
    this.util.setCurrentPath(this.currentPath);
    this.util.setOTFSupType("");
    this.autoNumber = this.util.getUniqueString();
    this.isMainLocationLoad = true;
    if (
      this.router.url.split("/")[2] == "csa" &&
      this.router.url.split("/")[this.router.url.split("/").length - 1] ==
        "add-asset"
    ) {
      //this.isPO = true;
      this.isAddNew = true;
     // this.pageData.addOption = "WithPO";
      this.routeObj = {
        list: "/inventory/csa/asset-list/0",
        review: "/inventory/csa/asset-review"
      };
    } else {
      //this.isPO = false;
      this.isAddNew = true;
      //this.pageData.addOption = "WithOutPO";
      this.routeObj = {
        list: "/csa-onboarding/guide",
        review: "/inventory/csa-onboarding/asset-review"
      };
    }

    this.router.url.split("/")[this.router.url.split("/").length - 1] ==
    "add-asset"
      ? this.router.url.split("/")[2] == "csa"
        ? this.util.menuChange({ menu: 3, subMenu: 20 })
        : this.util.menuChange({ menu: "guide", subMenu: "" })
      : "";

    if (sessionStorage.getItem("ASSET_OLD")) {
      this.isPO = false;
      this.isAddNew = true;
      this.assetObj = JSON.parse(sessionStorage.getItem("ASSET_OLD"));
      this.assetFinal = JSON.parse(sessionStorage.getItem("ASSET_OLD"));
      this.setEditValues(this.assetFinal);
      this.getManufacturerPart(this.assetFinal.manf_id);
    }
    this.getSupplierList();
    this.getManufacturerList();
    this.getEmployeeList();
    this.util.changeDetection.subscribe(dataObj => {
      if (dataObj && this.currentPath == "add-asset") {
        if (
          dataObj.source == "ON_THE_FLY_SUPPLIER" &&
          dataObj.data.step == "DONE"
        ) {
          this.getSupplierList("REFRESH");
        } else if (
          dataObj.source == "ON_THE_FLY_MANUFACTURER_PART" &&
          dataObj.data.step == "DONE"
        ) {
          this.getManufacturerPart(dataObj.data.id, "REFRESH");
        } else if (dataObj.source == "MANUFACTURER") {
          this.getManufacturerList("REFRESH");
        }
        this.util.changeEvent(null);
      }
    });
  }

  ngOnDestroy() {
    this.util.setOTFSupType("");
  }

  startDateChange(event) {
    this.minEndDate = new Date(this.addFinanceForm.get("start_date").value);
    this.addFinanceForm.get("end_date").setValue("");
  }

  endDateChange(event) {
    let timeDiff = Math.abs(
      new Date(event).getTime() -
        new Date(this.addFinanceForm.get("start_date").value).getTime()
    );
    let diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
    this.addFinanceForm.get("term").setValue(Math.floor(diffDays / 30));
    console.log("Diff Days ::", diffDays);
    console.log("Months ::", Math.floor(diffDays / 30));
  }

  next(): void {
    if (this.addOpt == "WithPO") {
      this.dialog.open(InventoryDialog, {
        data: {
          action: "purchaseOrderList",
          redirectPath: ["/inventory/rs/csa/add-receiving-slip"]
        }
      });
    } else {
      this.isPO = false;
      this.isAddNew = true;
    }
  }

  getEmployeeList() {
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

  public validateManf(event: any) {
    try {
      let manf = event.target.value;
      if (manf == "") {
        this.manf_id.setValue("");
        this.manufacturerPart.setValue("");
        this.manf_part_id.setValue("");
        this.manfPartsDetails = [];
        return;
      }
      let match = this.pageData.manufacturerList.filter(
        item => item.manf_name.toLowerCase() == manf.toLowerCase()
      );
      if (match.length > 0) {
        this.manf_id.setValue(match[0].manf_id);
        this.manufacturer.setValue(match[0].manf_name);
        this.getManufacturerPart(match[0].manf_id, "INIT");
        this.manufacturerPart.setValue("");
        this.manf_part_id.setValue("");
      } else {
        this.manf_id.setValue("");
        this.manfPartsDetails = [];
      }
    } catch (err) {
      this.global.addException("Assets New", "validateManf()", err);
    }
  }
  public validateManfPart(event: any) {
    try {
      let manfPart = event.target.value;
      let match = this.pageData.manufacturerPartList.filter(
        item => item.short_name.toLowerCase() == manfPart.toLowerCase()
      );
      if (match.length > 0) {
        this.manf_part_id.setValue(match[0].manf_part_id);
        this.manufacturerPart.setValue(match[0].short_name);
        this.changeManfParts();
      } else {
        this.manf_part_id.setValue("");
      }
    } catch (err) {
      this.global.addException("Assets New", "validateManfPart()", err);
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

          for (let i = 0; i < response.data.length; i++) {
            if (
              response.data[i].supplier_type.type_id == 2 ||
              response.data[i].supplier_type.type_id == 3 ||
              response.data[i].supplier_type.type_id == 6
            ) {
              self.pageData.supplierList = self.pageData.supplierList.concat(
                response.data[i].suppliers
              );
              //self.pageData.supplierList = self.pageData.supplierList.reduce((x, y) => x.findIndex(e=>e.supplier_id == y.supplier_id)<0 ? [...x, y]: x, []);
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
            map(value => self.warrantySupplierFilter(value))
          );
          origin == "REFRESH" ? self.setSupplierOTF() : "";
        }
      });
    } catch (err) {
      this.global.addException("Assets New", "getSupplierList()", err);
    }
  }
  getSelectedSupplier(supplier, event: any = false): void {
    if (event.isUserInput) {
      this.supplier_id.setValue(supplier.supplier_id);
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
  private warrantySupplierFilter(value: string): string[] {
    try {
      return this.pageData.supplierList.filter(
        option =>
          option.supplier_type == "Warranty" &&
          option.supplier_name
            .toLowerCase()
            .includes(value ? value.toLowerCase() : "")
      );
    } catch (err) {
      this.global.addException("Assets New", "warrantySupplierFilter()", err);
    }
  }
  showAddSupplierPopup(supType, otfSupType): void {
    this.pageData.supTypeOTF = supType;
    this.util.setOTFSupType(otfSupType);
    //sessionStorage.setItem('supOTF', supType);
    sessionStorage.removeItem("supplierObject");
    this.util.changeEvent(null);
    this.dialog.open(InventoryDialog, { data: { action: "addNewSupplier" } });
  }
  public validateSupplier(event: any) {
    try {
      let supplier = event.target.value;
      let match = this.pageData.supplierList.filter(
        item =>
          item.supplier_type == "Assets" &&
          item.supplier_name.toLowerCase() == supplier.toLowerCase()
      );
      if (supplier == "") {
        this.supplier_id.setValue("");
        return;
      }
      if (match.length > 0) {
        this.supplier_id.setValue(match[0].supplier_id);
        this.supplier.setValue(match[0].supplier_name);
      }
    } catch (err) {
      this.global.addException("Assets New", "validateSupplier()", err);
    }
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

  // ================   MANUFACTURER  ===================== //
  private getManufacturerList(origin: string = "INIT"): void {
    let self = this;
    try {
      this.admin.getManufacturerList(function(error: boolean, response: any) {
        if (error) {
          console.log(response);
        } else {
          self.pageData.manufacturerList = response.data.filter(
            item => item.is_material_default != "1"
          );
          self.filteredManufacturer = self.manufacturer.valueChanges.pipe(
            startWith(""),
            map(value => self.manufacturerFilter(value))
          );
          origin == "REFRESH"
            ? (self.getMfg(
                self.pageData.manufacturerList[
                  self.pageData.manufacturerList.length - 1
                ],
                {}
              ),
              self.manufacturer.setValue(
                self.pageData.manufacturerList[
                  self.pageData.manufacturerList.length - 1
                ].manf_name
              ))
            : "";
        }
      });
    } catch (err) {
      this.global.addException("Assets New", "getManufacturerList()", err);
    }
  }
  getMfg(mfg, event: any = false): void {
    event
      ? event.isUserInput
        ? (this.manf_id.setValue(mfg.manf_id),
          this.manufacturerPart.setValue(""),
          this.getManufacturerPart(mfg.manf_id))
        : ""
      : "";
  }
  private manufacturerFilter(value: string): string[] {
    try {
      return this.pageData.manufacturerList.filter(option =>
        option.manf_name
          .toLowerCase()
          .includes(value ? value.toLowerCase() : "")
      );
    } catch (err) {
      this.global.addException("Assets New", "manufacturerFilter()", err);
    }
  }
  showAddManufacturerPopup(): void {
    this.util.changeEvent(null);
    this.dialog.open(ManufacturerDialog, {
      data: { action: "addManufacturer" }
    });
  }
  // ===============   END MANUFACTURER  =================== //

  // ================   ITEM DEFINITION  ===================== //
  private getManufacturerPart(id, origin: string = "INIT"): void {
    let self = this;
    try {
      this.http.doGet("manufPartById/" + id, function(
        error: boolean,
        response: any
      ) {
        if (error) {
          console.log("error", response);
        } else {
          self.pageData.manufacturerPartList = response.data.filter(
            item => item.class_name.item_class_type == "Asset"
          );
          sessionStorage.getItem("ASSET_OLD")
            ? self.getMfgPart(
                self.pageData.manufacturerPartList.filter(
                  item =>
                    item.manf_part_id ==
                    JSON.parse(sessionStorage.getItem("ASSET_OLD")).manf_part
                      .manf_part_id
                )[0]
              )
            : "";
          self.filteredManufacturerPart = self.manufacturerPart.valueChanges.pipe(
            startWith(""),
            map(value => self.manufacturerPartFilter(value))
          );
          origin == "REFRESH"
            ? (self.manf_id.setValue(id),
              self.manufacturer.setValue(
                self.pageData.manufacturerList.filter(
                  item => item.manf_id == id
                )[0].manf_name
              ),
              self.getMfgPart(
                self.pageData.manufacturerPartList[
                  self.pageData.manufacturerPartList.length - 1
                ]
              ),
              self.manufacturerPart.setValue(
                self.pageData.manufacturerPartList[
                  self.pageData.manufacturerPartList.length - 1
                ].short_name
              ))
            : "";
        }
      });
    } catch (err) {
      this.global.addException("Assets New", "getManufacturerPart()", err);
    }
  }
  getMfgPart(part, event: any = false): void {
    this.manf_part_id.setValue(part.manf_part_id);
    this.pageData.selectedMfgPart = part;
    this.changeManfParts();
  }
  private manufacturerPartFilter(value: string): string[] {
    try {
      return this.pageData.manufacturerPartList.filter(option =>
        option.short_name
          .toLowerCase()
          .includes(value ? value.toLowerCase() : "")
      );
    } catch (err) {
      this.global.addException("Assets New", "manufacturerPartFilter()", err);
    }
  }
  showAddManufacturerPartPopup(): void {
    sessionStorage.removeItem("newPart");
    sessionStorage.setItem("class", JSON.stringify(["Asset"]));
    this.util.changeEvent(null);
    this.dialog.open(InventoryDialog, {
      data: { action: "addNewManufacturerPart" }
    });
  }
  // ==============   END ITEM DEFINITION  =================== //

  setEditValues(obj: any) {
    console.log("setEditValues", obj);
    var self = this;
    try {
      if (self.isAddNew) {
        this.addNewAForm.get("location_id").setValue(obj.location_id),
          this.addNewAForm.get("location_tag_id").setValue(obj.location_tag_id),
          this.addNewAForm.get("po_id").setValue(obj.po_id),
          this.addNewAForm
            .get("receiving_slip_id")
            .setValue(obj.receiving_slip_id),
          this.addNewAForm.get("po_item_id").setValue(obj.po_item_id),
          this.addNewAForm.get("is_unlisted").setValue(obj.is_unlisted),
          this.addNewAForm.get("quantity_status").setValue(obj.quantity_status),
          this.manufacturer.setValue(obj.manufacturer);
        this.manufacturerPart.setValue(obj.manufacturerPart);
        this.manf_id.setValue(obj.manf_id);
        self.getManfPartsList(obj.manf_id);
        this.manf_part_id.setValue(obj.manf_part.manf_part_id);
        this.serial_no.setValue(obj.serial_no);
        this.short_tag.setValue(obj.short_tag);
        this.comment.setValue(obj.comment);
        this.assign_to.setValue(obj.assign_to);
        this.assign_name.setValue(obj.assign_name);
        this.location.setValue(obj.location);
        this.location_tag.setValue(obj.location_tag);
        self.manfPartsDetails = obj.manf_part;
        if (obj.scan_code != "System Generated") {
          self.barCode = "barcode";
          this.scan_code.setValue(obj.scan_code);
        }
      }
      if (self.isFinancial) {
        obj.financials
          ? self.addFinanceForm.controls["ownership_type"].setValue(
              obj.financials[0].ownership_type
            )
          : "";
        self.changeOwnerShip();
        if (self.addFinanceForm.get("ownership_type").value == "Owned") {
          this.assetObj.montly_depreciation =
            obj.financials[0].montly_depreciation;
          this.assetObj.present_value = obj.financials[0].present_value;
          this.age_of_equip = obj.financials[0].age_of_equipment;
          self.addFinanceForm.controls["supplier"].setValue(
            obj.financials[0].supplier
          );
          self.addFinanceForm.controls["supplier_id"].setValue(
            obj.financials[0].supplier_id
          );

          self.addFinanceForm.controls["purchase_date"].setValue(
            this.util.stringToDate(obj.financials[0].purchase_date)
          );
          self.addFinanceForm.controls["purchase_price"].setValue(
            obj.financials[0].purchase_price
          );
          self.addFinanceForm.controls["esti_useful_life"].setValue(
            obj.financials[0].esti_useful_life
          );
          self.addFinanceForm.controls["residual_value"].setValue(
            obj.financials[0].residual_value
          );
          self.addFinanceForm.controls["age_of_equipment"].setValue(
            obj.financials[0].age_of_equipment
          );
        } else if (
          self.addFinanceForm.get("ownership_type").value == "Leased"
        ) {
          self.addFinanceForm.controls["leased_from"].setValue(
            obj.financials[0].leased_from
          );
          self.addFinanceForm.controls["leased_from_id"].setValue(
            obj.financials[0].leased_from_id
          );
          self.addFinanceForm.controls["start_date"].setValue(
            this.util.stringToDate(obj.financials[0].start_date)
          );
          self.addFinanceForm.controls["end_date"].setValue(
            this.util.stringToDate(obj.financials[0].end_date)
          );
          self.addFinanceForm.controls["term"].setValue(obj.financials[0].term);
        } else if (
          self.addFinanceForm.get("ownership_type").value == "Financed"
        ) {
          self.addFinanceForm.controls["financed_from"].setValue(
            obj.financials[0].financed_from
          );
          self.addFinanceForm.controls["financed_from_id"].setValue(
            obj.financials[0].financed_from_id
          );
          self.addFinanceForm.controls["start_date"].setValue(
            this.util.stringToDate(obj.financials[0].start_date)
          );
          self.addFinanceForm.controls["end_date"].setValue(
            this.util.stringToDate(obj.financials[0].end_date)
          );
          self.addFinanceForm.controls["term"].setValue(obj.financials[0].term);

          self.addFinanceForm.controls["purchase_date"].setValue(
            this.util.stringToDate(obj.financials[0].purchase_date)
          );
          self.addFinanceForm.controls["purchase_price"].setValue(
            obj.financials[0].purchase_price
          );
          self.addFinanceForm.controls["esti_useful_life"].setValue(
            obj.financials[0].esti_useful_life
          );
          self.addFinanceForm.controls["residual_value"].setValue(
            obj.financials[0].residual_value
          );
          self.addFinanceForm.controls["age_of_equipment"].setValue(
            obj.financials[0].age_of_equipment
          );
        }
        if (obj.financials) {
          self.addFinanceForm.controls["paid_capital"].setValue(
            obj.financials[0].paid_capital
          );
          self.addFinanceForm.controls["monthly_payment"].setValue(
            obj.financials[0].monthly_payment
          );
          self.addFinanceForm.controls["warranty_supplier"].setValue(
            obj.financials[0].warranty_supplier
          );
          self.addFinanceForm.controls["warranty_supplier_id"].setValue(
            obj.financials[0].warranty_supplier_id
          );
          self.addFinanceForm.controls["warranty_end_date"].setValue(
            this.util.stringToDate(obj.financials[0].warranty_end_date)
          );
          self.addFinanceForm.controls["acc_ref_no"].setValue(
            obj.financials[0].acc_ref_no
          );
          self.age_of_equip = obj.financials[0].age_of_equipment;
        }
      }
    } catch (err) {
      this.global.addException("Assets New", "setEditValues()", err);
    }
  }
  filterNames(name: string, list: any[]) {
    try {
      return list.filter(
        data =>
          data.location_name.toLowerCase().indexOf(name.toLowerCase()) === 0
      );
    } catch (err) {
      this.global.addException("Assets New", "filterNames()", err);
    }
  }
  filterTags(name: string, list: any[]) {
    try {
      return list.filter(
        data =>
          data.location_tag.toLowerCase().indexOf(name.toLowerCase()) === 0
      );
    } catch (err) {
      this.global.addException("Assets New", "filterTags()", err);
    }
  }
  changeManf() {
    let self = this;
    try {
      self.manfPartsList = [];
      self.manfPartsDetails = [];
      this.getManfPartsList(this.addNewAForm.get("manf_id").value);
    } catch (err) {
      this.global.addException("Assets New", "changeManf()", err);
    }
  }
  changeManfParts() {
    let self = this;
    try {
      self.manfPartsDetails = [];
      let ind = this.manf_part_id.value;
      for (let i = 0; i < self.pageData.manufacturerPartList.length; i++) {
        if (ind == self.pageData.manufacturerPartList[i].manf_part_id) {
          self.manfPartsDetails = self.pageData.manufacturerPartList[i];
        }
      }
    } catch (err) {
      this.global.addException("Assets New", "changeManfParts()", err);
    }
  }
  getManfPartsList(id) {
    let self = this;
    try {
      this.http.doGet("manufPartById/" + id, function(
        error: boolean,
        response: any
      ) {
        if (error) {
          self.manfPartsList = [];
        } else {
          self.manfPartsList = response.data;
        }
      });
    } catch (err) {
      this.global.addException("Assets New", "getManfPartsList()", err);
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
  public dateDiffInDays(a, b) {
    var _MS_PER_DAY = 1000 * 60 * 60 * 24;
    // Discard the time and time-zone information.
    var utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
    var utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());

    return Math.floor((utc2 - utc1) / _MS_PER_DAY);
  }

  assetReview(form: FormGroup) {
    var self = this;
    try {
      self.finSubmitted = true;
      console.log(form);
      if (form.valid) {
        let financials: any[] = [];
        financials.push(form.value);
        self.assetObj.financials = financials;

        self.assetObj.financials[0].purchase_date = this.util.getDDMMYYYYDate(
          self.assetObj.financials[0].purchase_date
        );
        self.assetObj.financials[0].start_date = this.util.getDDMMYYYYDate(
          self.assetObj.financials[0].start_date
        );
        self.assetObj.financials[0].end_date = this.util.getDDMMYYYYDate(
          self.assetObj.financials[0].end_date
        );
        self.assetObj.financials[0].warranty_end_date = this.util.getDDMMYYYYDate(
          self.assetObj.financials[0].warranty_end_date
        );

        for (let i = 0; i < self.pageData.supplierList.length; i++) {
          if (
            self.addFinanceForm.get("supplier_id").value ==
            self.pageData.supplierList[i].supplier_id
          ) {
            self.assetObj.supplierDetails = self.pageData.supplierList[i];
          }
        }
        for (let i = 0; i < self.pageData.supplierList.length; i++) {
          if (
            self.addFinanceForm.get("financed_from").value ==
            self.pageData.supplierList[i].supplier_id
          ) {
            self.assetObj.financedSupplier = self.pageData.supplierList[i];
          }
          if (
            self.addFinanceForm.get("leased_from").value ==
            self.pageData.supplierList[i].supplier_id
          ) {
            self.assetObj.leasedSupplier = self.pageData.supplierList[i];
          }
          if (
            self.addFinanceForm.get("warranty_supplier_id").value ==
            self.pageData.supplierList[i].supplier_id
          ) {
            self.assetObj.warrantySupplier = self.pageData.supplierList[i];
          }
        }
        var ownType = self.addFinanceForm.get("ownership_type").value;
        if (ownType == "Owned") {
          self.assetObj.isOwned = true;
          self.assetObj.isLeased = false;
          self.assetObj.isFinanced = false;
          self.assetObj.financials[0].montly_depreciation =
            self.assetObj.montly_depreciation;
          self.assetObj.financials[0].present_value =
            self.assetObj.present_value;
        } else if (ownType == "Leased") {
          self.assetObj.isOwned = false;
          self.assetObj.isLeased = true;
          self.assetObj.isFinanced = false;
          self.assetObj.financials[0].montly_depreciation = "";
          self.assetObj.financials[0].present_value = "";
        } else if (ownType == "Financed") {
          self.assetObj.isOwned = false;
          self.assetObj.isLeased = false;
          self.assetObj.isFinanced = true;
          self.assetObj.financials[0].montly_depreciation =
            self.assetObj.montly_depreciation;
          self.assetObj.financials[0].present_value =
            self.assetObj.present_value;
        }

        sessionStorage.removeItem("ASSET_OLD");
        sessionStorage.setItem("ASSET_NEW", JSON.stringify(self.assetObj));

        this.currentPath == "add-asset"
          ? this.router.navigate([this.routeObj.review])
          : this.onTheFlyEvent({ step: "S2" });
      }
    } catch (err) {
      this.global.addException("Assets New", "assetReview()", err);
    }
  }
  assetCancel() {
    sessionStorage.removeItem("ASSET_OLD");
    this.currentPath == "add-asset"
      ? this.router.navigate([this.routeObj.list])
      : this.onTheFlyEvent({ step: "S0" });
  }
  assetPrevious() {
    var self = this;
    try {
      self.isFinancial = false;
      self.isAddNew = true;
      if (sessionStorage.getItem("ASSET_OLD")) {
      } else {
        self.getManfPartsList(self.assetObj.manf_id);
        self.addNewAForm.controls["serial_no"].setValue(
          self.assetObj.serial_no
        );
        self.addNewAForm.controls["short_tag"].setValue(
          self.assetObj.short_tag
        );
        self.addNewAForm.controls["assign_to"].setValue(
          self.assetObj.assign_to
        );
        self.addNewAForm.controls["assign_name"].setValue(
          self.assetObj.assign_name
        );
        self.addNewAForm.controls["comment"].setValue(self.assetObj.comment);
        self.addNewAForm.controls["location"].setValue(self.assetObj.location);
        self.manfPartsDetails = self.assetObj.manf_part;
        if (self.assetObj.scan_code != "") {
          self.barCode = true;
          self.addNewAForm.controls["scan_code"].setValue(
            self.assetObj.scan_code
          );
        }
      }
    } catch (err) {
      this.global.addException("Assets New", "assetPrevious()", err);
    }
  }

  scanCodeClick(): void {
    this.util.updateValidators(this.addNewAForm, "scan_code", [
      Validators.required
    ]);
  }
  sysGeneratedCodeClick(): void {
    this.util.updateValidators(this.addNewAForm, "scan_code", []);
  }

  changeOwnerShip() {
    try {
      let ownType = this.addFinanceForm.get("ownership_type").value;
      if (ownType == "Owned") {
        this.addFinanceForm.get("supplier").setValue("");
        this.isOwned = true;
        this.isLeased = false;
        this.isFinanced = false;
        this.util.addBulkValidators(
          this.addFinanceForm,
          ["supplier_id", "purchase_date", "age_of_equipment"],
          [Validators.required]
        );
        this.util.addBulkValidators(
          this.addFinanceForm,
          ["esti_useful_life"],
          [
            Validators.required,
            Validators.pattern(this.constant.AMOUNT_PATTERN)
          ]
        );
        this.util.addBulkValidators(
          this.addFinanceForm,
          ["purchase_price", "residual_value"],
          [
            Validators.required,
            Validators.pattern(this.constant.AMOUNT_PATTERN)
          ]
        );
        this.util.addBulkValidators(
          this.addFinanceForm,
          ["financed_from", "leased_from", "start_date", "end_date", "term"],
          []
        );

        if (this.assetFinal && this.assetFinal.supplier) {
          this.addFinanceForm
            .get("supplier")
            .setValue(this.assetFinal.supplier);
          this.addFinanceForm
            .get("supplier_id")
            .setValue(this.assetFinal.supplier_id);
          this.addFinanceForm
            .get("purchase_date")
            .setValue(this.util.getDateObjet(this.assetFinal.purchase_date));
          this.addFinanceForm
            .get("purchase_price")
            .setValue(this.assetFinal.purchase_price);
          this.purchaseDateChange(
            this.util.getDateObjet(this.assetFinal.purchase_date)
          );
        }
      } else if (ownType == "Leased") {
        this.addFinanceForm.get("leased_from").setValue("");
        this.isOwned = false;
        this.isLeased = true;
        this.isFinanced = false;
        this.util.addBulkValidators(
          this.addFinanceForm,
          ["leased_from", "start_date", "end_date", "term", "monthly_payment"],
          [Validators.required]
        );
        this.util.addBulkValidators(
          this.addFinanceForm,
          [
            "financed_from",
            "supplier_id",
            "purchase_date",
            "purchase_price",
            "esti_useful_life",
            "residual_value",
            "age_of_equipment"
          ],
          []
        );
      } else if (ownType == "Financed") {
        this.addFinanceForm.get("financed_from").setValue("");
        this.isOwned = false;
        this.isLeased = false;
        this.isFinanced = true;
        this.util.addBulkValidators(
          this.addFinanceForm,
          [
            "financed_from",
            "start_date",
            "end_date",
            "term",
            "purchase_date",
            "age_of_equipment"
          ],
          [Validators.required]
        );
        this.util.addBulkValidators(
          this.addFinanceForm,
          ["monthly_payment"],
          [Validators.pattern(this.constant.AMOUNT_PATTERN)]
        );
        this.util.addBulkValidators(
          this.addFinanceForm,
          ["esti_useful_life"],
          [
            Validators.required,
            Validators.pattern(this.constant.AMOUNT_PATTERN)
          ]
        );
        this.util.addBulkValidators(
          this.addFinanceForm,
          ["purchase_price", "residual_value"],
          [
            Validators.required,
            Validators.pattern(this.constant.AMOUNT_PATTERN)
          ]
        );
        this.util.addBulkValidators(this.addFinanceForm, ["leased_from"], []);
      }
    } catch (err) {
      this.global.addException("Assets New", "changeOwnerShip()", err);
    }
  }

  public createMFGForm() {
    this.addNewAForm = this.fb.group({
      po_id: new FormControl(""), //Hidden field
      receiving_slip_id: new FormControl(""), //Hidden field
      po_item_id: new FormControl(""), //Hidden field
      is_unlisted: new FormControl(""), //only for API call with PO (hidden)
      manufacturer: new FormControl("", [Validators.required]),
      manufacturerPart: new FormControl("", [Validators.required]),
      manf_id: new FormControl("", [Validators.required]),
      manf_part_id: new FormControl("", [Validators.required]),
      serial_no: new FormControl("", [
        Validators.required,
        // Validators.pattern(this.constant.ONLY_NUMBER),
        Validators.maxLength(30)
      ]),
      short_tag: new FormControl("", [
        Validators.required,
        Validators.maxLength(this.constant.DEFAULT_TEXT_MAXLENGTH)
      ]),
      scan_code: new FormControl("", []),
      assign_to: new FormControl(""),
      assign_name: new FormControl(""),
      comment: new FormControl("", [
        Validators.maxLength(this.constant.DEFAULT_COMMENT_MAXLENGTH)
      ]),
      location: new FormControl("", [Validators.required]),
      location_id: new FormControl("", [Validators.required]),
      location_tag: new FormControl("", [Validators.required]),
      location_tag_id: new FormControl("", [Validators.required]),
      quantity_status: new FormControl("") //Hidden field
    });

    this.sysGeneratedCodeClick();
  }

  get manufacturer() {
    return this.addNewAForm.get("manufacturer");
  }
  get manufacturerPart() {
    return this.addNewAForm.get("manufacturerPart");
  }
  get manf_id() {
    return this.addNewAForm.get("manf_id");
  }
  get manf_part_id() {
    return this.addNewAForm.get("manf_part_id");
  }
  get serial_no() {
    return this.addNewAForm.get("serial_no");
  }
  get short_tag() {
    return this.addNewAForm.get("short_tag");
  }
  get scan_code() {
    return this.addNewAForm.get("scan_code");
  }
  get assign_to() {
    return this.addNewAForm.get("assign_to");
  }
  get assign_name() {
    return this.addNewAForm.get("assign_name");
  }
  get comment() {
    return this.addNewAForm.get("comment");
  }
  get location() {
    return this.addNewAForm.get("location");
  }
  get location_id() {
    return this.addNewAForm.get("location_id");
  }
  get location_tag() {
    return this.addNewAForm.get("location_tag");
  }
  get location_tag_id() {
    return this.addNewAForm.get("location_tag_id");
  }

  public createFinanceForm() {
    this.addFinanceForm = this.fb.group({
      ownership_type: new FormControl("", [Validators.required]),

      supplier: new FormControl("", []),
      supplier_id: new FormControl("", []),
      purchase_date: new FormControl("", []),
      purchase_price: new FormControl("", []),
      esti_useful_life: new FormControl("", []),
      residual_value: new FormControl("", []),
      age_of_equipment: new FormControl("", []),

      leased_from_id: new FormControl("", []),
      leased_from: new FormControl("", []),

      financed_from_id: new FormControl("", []),
      financed_from: new FormControl("", []),

      paid_capital: new FormControl("", [
        Validators.pattern(this.constant.AMOUNT_PATTERN)
      ]),

      start_date: new FormControl("", []),
      end_date: new FormControl("", []),
      term: new FormControl("", []),

      monthly_payment: new FormControl("", [
        Validators.pattern(this.constant.AMOUNT_PATTERN)
      ]),
      warranty_supplier_id: new FormControl("", []),
      warranty_supplier: new FormControl("", []),
      warranty_end_date: new FormControl("", []),
      acc_ref_no: new FormControl("", [])
    });
  }
  get supplier() {
    return this.addFinanceForm.get("supplier");
  }
  get ownership_type() {
    return this.addFinanceForm.get("ownership_type");
  }
  get supplier_id() {
    return this.addFinanceForm.get("supplier_id");
  }
  get purchase_date() {
    return this.addFinanceForm.get("purchase_date");
  }
  get purchase_price() {
    return this.addFinanceForm.get("purchase_price");
  }
  get esti_useful_life() {
    return this.addFinanceForm.get("esti_useful_life");
  }
  get residual_value() {
    return this.addFinanceForm.get("residual_value");
  }
  get age_of_equipment() {
    return this.addFinanceForm.get("age_of_equipment");
  }
  get leased_from_id() {
    return this.addFinanceForm.get("leased_from_id");
  }
  get leased_from() {
    return this.addFinanceForm.get("leased_from");
  }
  get financed_from_id() {
    return this.addFinanceForm.get("financed_from_id");
  }
  get financed_from() {
    return this.addFinanceForm.get("financed_from");
  }
  get paid_capital() {
    return this.addFinanceForm.get("paid_capital");
  }
  get start_date() {
    return this.addFinanceForm.get("start_date");
  }
  get end_date() {
    return this.addFinanceForm.get("end_date");
  }
  get term() {
    return this.addFinanceForm.get("term");
  }
  get monthly_payment() {
    return this.addFinanceForm.get("monthly_payment");
  }
  get warranty_supplier_id() {
    return this.addFinanceForm.get("warranty_supplier_id");
  }
  get warranty_supplier() {
    return this.addFinanceForm.get("warranty_supplier");
  }
  get warranty_end_date() {
    return this.addFinanceForm.get("warranty_end_date");
  }
  get acc_ref_no() {
    return this.addFinanceForm.get("acc_ref_no");
  }

  addManufacturer(form: FormGroup) {
    var self = this;
    console.log(form);
    try {
      self.submitted = true;
      console.log(form);

      if (
        form.valid &&
        this.pageData.serialNoAvailability == "0" &&
        this.pageData.assetNameAvailability == "0"
      ) {
        self.isFinancial = true;
        self.isAddNew = false;
        self.assetObj = form.value;
        for (let i = 0; i < self.pageData.manufacturerPartList.length; i++) {
          if (
            self.addNewAForm.get("manf_part_id").value ==
            self.pageData.manufacturerPartList[i].manf_part_id
          ) {
            self.assetObj.manf_part = self.pageData.manufacturerPartList[i];
          }
        }
        self.getSupplierList();
        if (sessionStorage.getItem("ASSET_OLD")) {
          self.setEditValues(self.assetFinal);
        }
      }
    } catch (err) {
      this.global.addException("Assets New", "addManufacturer()", err);
    }
  }
  getLocationList() {
    let self = this;
    try {
      this.http.doGet("location/list", function(error: boolean, response: any) {
        self.isMainLocationLoad = false;
        if (error) {
        } else {
          self.locList = response.data;

          self.filteredLocations = self.location.valueChanges.pipe(
            startWith(""),
            map(value => self.locationFilter(value))
          );
        }
      });
    } catch (err) {
      this.global.addException("Assets New", "getLocationList()", err);
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
      this.global.addException("Assets New", "locationFilter()", err);
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
      this.global.addException("Assets New", "validateLoc()", err);
    }
  }
  getSelectedLocation(event: any, selectedLoc: any) {
    try {
      if (event.isUserInput) {
        this.location_id.setValue(selectedLoc.location_id);
        this.getLocationTags(selectedLoc.location_id);
      }
    } catch (err) {
      this.global.addException("Assets New", "getSelectedLocation()", err);
    }
  }
  getSelectedTag(event: any, selectedTag: any) {
    try {
      if (event.isUserInput) {
        this.location_tag_id.setValue(selectedTag.location_tag_id);
      }
    } catch (err) {
      this.global.addException("Assets New", "getSelectedTag()", err);
    }
  }
  getLocationTags(id) {
    var self = this;
    try {
      this.isSubLocationLoad = true;
      this.http.doGet("location/tag/" + id, function(
        error: boolean,
        response: any
      ) {
        self.isSubLocationLoad = false;
        console.log(response);
        if (error) {
          console.log("error", response);
        } else {
          self.locTagsList = response.tags;
          self.filteredTags = self.location_tag.valueChanges.pipe(
            startWith(""),
            map(value => self.locationTagsFilter(value))
          );
        }
      });
    } catch (err) {
      this.global.addException("Assets New", "getLocationTags()", err);
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
      this.global.addException("Assets New", "locationTagsFilter()", err);
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
      this.global.addException("Assets New", "validateLocTags()", err);
    }
  }
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
      this.age_of_equipment.setValue(this.age_of_equip);
      self.assetObj.present_value =
        self.addFinanceForm.get("purchase_price").value -
        parseFloat(self.assetObj.montly_depreciation) *
          parseFloat(self.age_of_equip);
    } catch (err) {
      this.global.addException("Assets New", "purchaseDateChange()", err);
    }
  }
  private validateMDInput(callback) {
    try {
      if (
        !this.constant.AMOUNT_PATTERN.test(this.esti_useful_life.value) ||
        !this.constant.AMOUNT_PATTERN.test(this.purchase_price.value) ||
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
            self.addFinanceForm.get("purchase_price").value != "" &&
            self.addFinanceForm.get("esti_useful_life").value != "" &&
            event.target.value != ""
          ) {
            self.assetObj.montly_depreciation = (
              (self.addFinanceForm.get("purchase_price").value -
                event.target.value) /
              self.addFinanceForm.get("esti_useful_life").value
            ).toFixed(2);
          } else {
            self.assetObj.montly_depreciation = "";
          }
        } else if (field == "PP") {
          if (
            self.addFinanceForm.get("residual_value").value != "" &&
            self.addFinanceForm.get("esti_useful_life").value != "" &&
            event.target.value != ""
          ) {
            self.assetObj.montly_depreciation = (
              (event.target.value -
                self.addFinanceForm.get("residual_value").value) /
              self.addFinanceForm.get("esti_useful_life").value
            ).toFixed(2);
          } else {
            self.assetObj.montly_depreciation = "";
          }
        } else if (field == "EUL") {
          if (
            self.addFinanceForm.get("residual_value").value != "" &&
            self.addFinanceForm.get("purchase_price").value != "" &&
            event.target.value != ""
          ) {
            self.assetObj.montly_depreciation = (
              (self.addFinanceForm.get("purchase_price").value -
                self.addFinanceForm.get("residual_value").value) /
              event.target.value
            ).toFixed(2);
          } else {
            self.assetObj.montly_depreciation = "";
          }
        }
        self.assetObj.present_value =
          self.addFinanceForm.get("purchase_price").value -
          parseFloat(self.assetObj.montly_depreciation) *
            parseFloat(self.age_of_equip);
      });
    } catch (err) {
      this.global.addException("Assets New", "calcMonthlyDepriciation()", err);
    }
  }

  onTheFlyEvent(data): void {
    this.util.changeEvent({
      source: "ON_THE_FLY_ASSET",
      action: "ADD",
      data: data
    });
  }

  validateSerialNo(event: any) {
    let self = this;
    self.pageData.isError = false;
    if (!self.serial_no.valid && !self.serial_no.dirty) {
      return;
    }
    try {
      this.http.doGet(
        "assets/is-unique-serial-no/" + this.serial_no.value,
        function(error: boolean, response: any) {
          //console.log(response);
          if (error) {
            console.log(response.message);
          } else {
            self.pageData.isError = true;
            self.pageData.serialNoAvailability = response.data.is_available;
            console.log(self.pageData.serialNoAvailability);
          }
        }
      );
    } catch (err) {
      this.global.addException(
        "validate Serial Number",
        "validateSerialNo()",
        err
      );
    }
  }

  //   validateAssetName(event: any) {
  //     let self = this;
  //     self.pageData.isError = false;
  //     if (!self.short_tag.valid && !self.short_tag.dirty) {
  //       return;
  //     }
  //     try {
  //       if (self.short_tag.value != "") {
  //         var reqObj = {
  //           asset_name: this.short_tag.value
  //         };
  //         this.http.doPost("assets/is-unique-asset-name", reqObj, function(
  //           error: boolean,
  //           response: any
  //         ) {
  //           console.log(response);

  //           if (error) {
  //             console.log(response.message);
  //           } else {
  //             self.pageData.isError = true;
  //             self.pageData.assetNameAvailability = response.data.is_available;
  //             console.log(self.pageData.assetNameAvailability);
  //           }
  //         });
  //       }
  //     } catch (err) {
  //       this.global.addException(
  //         "validate Asset Name",
  //         "validateAssetName()",
  //         err
  //       );
  //     }
  //   }

  validateAssetName(event: any) {
    let self = this;
    self.pageData.isError = false;
    if (!self.short_tag.valid && !self.short_tag.dirty) {
      return;
    }
    try {
      if (self.short_tag.value != "") {
        var reqObj = {
          asset_name: this.short_tag.value
        };
        this.http.doPost("assets/is-unique-asset-name", reqObj, function(
          error: boolean,
          response: any
        ) {
          console.log(response);

          if (error) {
            console.log(response.message);
          } else {
            self.pageData.isError = true;
            self.pageData.assetNameAvailability = response.data.is_available;
            console.log(self.pageData.assetNameAvailability);
          }
        });
      }
    } catch (err) {
      this.global.addException(
        "validate Asset Name",
        "validateAssetName()",
        err
      );
    }
  }
}
