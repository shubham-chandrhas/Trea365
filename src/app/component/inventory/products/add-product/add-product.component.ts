import {
  Component,
  OnInit,
  Inject,
  ViewChild,
  ElementRef
} from "@angular/core";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";
import {
  FormControl,
  Validators,
  FormGroup,
  FormBuilder,
  FormArray
} from "@angular/forms";
import { Router, ActivatedRoute } from "@angular/router";
import { Observable, Subscription } from "rxjs";
import { map, startWith } from "rxjs/operators";

import { UtilService } from "../../../../shared/service/util.service";
import { HttpService } from "../../../../shared/service/http.service";
import { GlobalService } from "../../../../shared/service/global.service";
import { InventoryDialog } from "../../inventory-dialog.component";
import { ManufacturerDialog } from "../../../../shared/module/manufacturer/manufacturer/manufacturer.component";
import { ConstantsService } from "../../../../shared/service/constants.service";

@Component({
  selector: "app-add-product",
  templateUrl: "./add-product.component.html",
  styleUrls: ["./add-product.component.css"]
})
export class AddProductComponent implements OnInit {
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
    prodInfo: {},
    isError: false
  };
  addProductForm: FormGroup;
  @ViewChild("comment") commentElement: ElementRef;
  filteredSupplier: Observable<string[]>;
  filteredManufacturer: Observable<string[]>;
  filteredManufacturerPart: Observable<string[]>;
  currentPath: string;
  isMainLocationLoad: boolean = false;
  isSupplierLoad: boolean = false;

  subscription: Subscription;

  constructor(
    public dialog: MatDialog,
    public util: UtilService,
    public constant: ConstantsService,
    public router: Router,
    private http: HttpService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private global: GlobalService
  ) {}

  ngOnInit() {
    this.util.setWindowHeight();
    this.util.setPageTitle(this.route);
    this.isMainLocationLoad = true;
    this.isSupplierLoad = true;
    this.currentPath = this.router.url.split("/")[
      this.router.url.split("/").length - 1
    ];
    this.currentPath == "add-product"
      ? this.router.url.split("/")[2] == "csa-onboarding"
        ? this.util.menuChange({ menu: "guide", subMenu: "" })
        : this.util.menuChange({ menu: 3, subMenu: 19 })
      : "";
    this.pageData.addOption =
      this.router.url.split("/")[2] == "csa" &&
      this.router.url.split("/")[this.router.url.split("/").length - 1] ==
        "add-product"
        ? "WithPO"
        : "WithOutPO";
    this.productFormSetup();
    this.getLocationList();
    this.getSupplierList();
    this.getManufacturerList();

    this.subscription = this.util.changeDetection.subscribe(dataObj => {
      if (dataObj && this.currentPath == "add-product") {
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
    this.subscription.unsubscribe();
  }

  productFormSetup(): void {
    try {
      if (sessionStorage.getItem("productInfo")) {
        this.createProductForm(
          "1",
          JSON.parse(sessionStorage.getItem("productInfo")).requestData
        );
        this.getManufacturerPart(
          JSON.parse(sessionStorage.getItem("productInfo")).requestData.manf_id
        );
        this.pageData.prodInfo = JSON.parse(
          sessionStorage.getItem("productInfo")
        );
        console.log(this.pageData.prodInfo);
        this.pageData.addOption = "WithOutPO";
      } else {
        this.createProductForm("0");
      }
    } catch (err) {
      this.global.addException("Add product", "productFormSetup()", err);
    }
  }

  ngAfterViewInit() {
    //this.commentElement.nativeElement.focus();
  }

  next(): void {
    try {
      if (this.pageData.addOpt == "WithPO") {
        this.dialog.open(InventoryDialog, {
          data: {
            action: "purchaseOrderList",
            redirectPath: ["/inventory/rs/csa/add-receiving-slip"]
          }
        });
      } else {
        this.pageData.addOption = "WithOutPO";
      }
    } catch (err) {
      this.global.addException("Add product", "next()", err);
    }
  }

  // ===============   SUPPLIER  =================== //
  private getSupplierList(origin: string = "INIT"): void {
    try {
      var self = this;
      this.util.showProcessing("processing-spinner");
      this.http.doGet("suppliers", function(error: boolean, response: any) {
        self.isSupplierLoad = false;
        if (error) {
          console.log("error", response);
        } else {
          self.util.hideProcessing("processing-spinner");
          let materialSup =
            response.data.length > 0
              ? response.data.filter(item => item.supplier_type.type_id == 1)
              : [];
          self.pageData.supplierList =
            materialSup.length > 0
              ? response.data.filter(item => item.supplier_type.type_id == 1)[0]
                  .suppliers
              : [];
          self.filteredSupplier = self.supplier.valueChanges.pipe(
            startWith(""),
            map(value => self.supplierFilter(value))
          );
          origin == "REFRESH"
            ? (self.getSelectedSupplier(
                self.pageData.supplierList[
                  self.pageData.supplierList.length - 1
                ]
              ),
              self.supplier.setValue(
                self.pageData.supplierList[
                  self.pageData.supplierList.length - 1
                ].supplier_name
              ))
            : "";
        }
      });
    } catch (err) {
      this.global.addException("Add product", "getSupplierList()", err);
    }
  }
  getSelectedSupplier(supplier, event: any = false): void {
    event
      ? event.isUserInput
        ? this.supplier_id.setValue(supplier.supplier_id)
        : ""
      : this.supplier_id.setValue(supplier.supplier_id);
  }
  private supplierFilter(value: string): string[] {
    try {
      return this.pageData.supplierList.filter(option =>
        option.supplier_name
          .toLowerCase()
          .includes(value ? value.toLowerCase() : "")
      );
    } catch (err) {
      this.global.addException("Add product", "supplierFilter()", err);
    }
  }
  public validateSupplier(event: any) {
    try {
      let sup = event.target.value;
      let match = this.pageData.supplierList.filter(
        item => item.supplier_name.toLowerCase() == sup.toLowerCase()
      );
      if (match.length > 0) {
        this.supplier_id.setValue(match[0].supplier_id);
        this.supplier.setValue(match[0].supplier_name);
      } else {
        this.supplier_id.setValue("");
      }
    } catch (err) {
      this.global.addException("Add product", "validateSupplier()", err);
    }
  }
  showAddSupplierPopup(): boolean {
    sessionStorage.removeItem("supplierObject");
    this.util.changeEvent(null);
    this.dialog.open(InventoryDialog, { data: { action: "addNewSupplier" } });
    return false;
  }
  // ==============   END SUPPLIER  =============== //

  // ================   MANUFACTURER  ===================== //
  private getManufacturerList(origin: string = "INIT"): void {
    try {
      let self = this;
      this.http.doGet("manufacturer", function(error: boolean, response: any) {
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
                ]
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
      this.global.addException("Add product", "getManufacturerList()", err);
    }
  }
  getMfg(mfg, event: any = false): void {
    try {
      event
        ? event.isUserInput
          ? (this.manf_id.setValue(mfg.manf_id),
            this.getManufacturerPart(mfg.manf_id))
          : ""
        : (this.manf_id.setValue(mfg.manf_id),
          this.getManufacturerPart(mfg.manf_id));
      this.manf_part_id.setValue("");
      this.manufacturerPart.setValue("");
      this.pageData.selectedMfgPart = null;
    } catch (err) {
      this.global.addException("Add product", "getMfg()", err);
    }
  }
  private manufacturerFilter(value: string): string[] {
    try {
      return this.pageData.manufacturerList.filter(option =>
        option.manf_name
          .toLowerCase()
          .includes(value ? value.toLowerCase() : "")
      );
    } catch (err) {
      this.global.addException("Add product", "manufacturerFilter()", err);
    }
  }
  public validateManf(event: any) {
    try {
      let manf = event.target.value;
      if (manf == "") {
        this.manf_id.setValue("");
        this.manf_part_id.setValue("");
        this.manufacturerPart.setValue("");
        this.pageData.selectedMfgPart = null;
        return;
      }
      let match = this.pageData.manufacturerList.filter(
        item => item.manf_name.toLowerCase() == manf.toLowerCase()
      );
      if (match.length > 0) {
        this.manf_id.setValue(match[0].manf_id);
        this.manufacturer.setValue(match[0].manf_name);
        this.getManufacturerPart(match[0].manf_id);
        this.manf_part_id.setValue("");
        this.manufacturerPart.setValue("");
        this.pageData.selectedMfgPart = null;
      } else {
        this.manf_id.setValue("");
      }
    } catch (err) {
      this.global.addException("Add product", "validateManf()", err);
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
    try {
      let self = this;
      this.http.doGet("manufPartById/" + id, function(
        error: boolean,
        response: any
      ) {
        if (error) {
          console.log("error", response);
        } else {
          self.pageData.manufacturerPartList = response.data.filter(
            item => item.class_name.item_class_type == "Product"
          );
          sessionStorage.getItem("productInfo")
            ? self.getMfgPart(
                self.pageData.manufacturerPartList.filter(
                  item =>
                    item.manf_part_id ==
                    JSON.parse(sessionStorage.getItem("productInfo"))
                      .requestData.manf_part_id
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
      this.global.addException("Add product", "getManufacturerPart()", err);
    }
  }
  getMfgPart(part, event: any = false): void {
    try {
      event
        ? event.isUserInput
          ? (this.manf_part_id.setValue(part.manf_part_id),
            (this.pageData.selectedMfgPart = part))
          : ""
        : (this.manf_part_id.setValue(part.manf_part_id),
          (this.pageData.selectedMfgPart = part));
    } catch (err) {
      this.global.addException("Add product", "getMfgPart()", err);
    }
  }
  private manufacturerPartFilter(value: string): string[] {
    try {
      return this.pageData.manufacturerPartList.filter(option =>
        option.short_name
          .toLowerCase()
          .includes(value ? value.toLowerCase() : "")
      );
    } catch (err) {
      this.global.addException("Add product", "manufacturerPartFilter()", err);
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
        this.pageData.selectedMfgPart = match[0];
      } else {
        this.manf_part_id.setValue("");
        this.pageData.selectedMfgPart = null;
      }
    } catch (err) {
      this.global.addException("Add product", "validateManfPart()", err);
    }
  }
  showAddManufacturerPartPopup(index : number = 0): void {
    try {
      sessionStorage.removeItem("newPart");
      sessionStorage.setItem("class", JSON.stringify(["Product"]));
      this.util.changeEvent(null);
      this.dialog.open(InventoryDialog, {
        data: { action: "addNewManufacturerPart" }
      });
    } catch (err) {
      this.global.addException(
        "Add product",
        "showAddManufacturerPartPopup()",
        err
      );
    }
  }
  // ==============   END ITEM DEFINITION  =================== //

  // ================   LOCATION  ===================== //
  getLocationList(): void {
    try {
      var self = this;
      this.isMainLocationLoad = true;
      this.http.doGet("location/list", function(error: boolean, response: any) {
        self.isMainLocationLoad = false;
        if (error) {
          console.log("error", response);
        } else {
          self.pageData.locationList = response.data;
          self.products_location
            .at(0)
            .get("filteredLocation")
            .setValue(
              self.products_location
                .at(0)
                .get("location_name")
                .valueChanges.pipe(
                  startWith(""),
                  map(value => self.locationFilter(value))
                )
            );
        }
      });
    } catch (err) {
      this.global.addException("Add product", "getLocationList()", err);
    }
  }
  getLocation(location, event: any = false, index): void {
    try {
      event
        ? event.isUserInput
          ? (this.products_location
              .at(index)
              .get("location_id")
              .setValue(location.location_id),
            this.getLocationTagList(index, location.location_id))
          : ""
        : (this.products_location
            .at(index)
            .get("location_id")
            .setValue(location.location_id),
          this.getLocationTagList(index, location.location_id));
      this.products_location
        .at(index)
        .get("location_tag_id")
        .setValue("");
      this.products_location
        .at(index)
        .get("location_tag_name")
        .setValue("");
    } catch (err) {
      this.global.addException("Add product", "getLocation()", err);
    }
  }

  private locationFilter(value: string): string[] {
    try {
      return this.pageData.locationList.filter(option =>
        option.location_name
          .toLowerCase()
          .includes(value ? value.toLowerCase() : "")
      );
    } catch (err) {
      this.global.addException("Add product", "locationFilter()", err);
    }
  }
  public validateLocation(event: any, item: any, index) {
    try {
      let location = event.target.value;
      if (location == "") {
        item.get("location_id").setValue("");
        this.products_location
          .at(index)
          .get("location_tag_id")
          .setValue("");
        this.products_location
          .at(index)
          .get("location_tag_name")
          .setValue("");
        return;
      }
      let match = this.pageData.locationList.filter(
        item => item.location_name.toLowerCase() == location.toLowerCase()
      );
      if (match.length > 0) {
        item.get("location_id").setValue(match[0].location_id);
        item.get("location_name").setValue(match[0].location_name);
        this.getLocationTagList(index, match[0].location_id);
        this.products_location
          .at(index)
          .get("location_tag_id")
          .setValue("");
        this.products_location
          .at(index)
          .get("location_tag_name")
          .setValue("");
      } else {
        item.get("location_id").setValue("");
      }
    } catch (err) {
      this.global.addException("Add product", "validateLocation()", err);
    }
  }
  // ================   END LOCATION  ===================== //

  // ================   LOCATION TAG  ===================== //
  getLocationTagList(index, locId) {
    try {
      let self = this;
      if (locId == "") {
        return;
      }
      self.products_location
        .at(index)
        .get("isSubLocationLoad")
        .setValue(true);
      this.http.doGet("location/tag/" + locId, function(
        error: boolean,
        response: any
      ) {
        if (error) {
          console.log("error", response);
        } else {
          self.products_location
            .at(index)
            .get("isSubLocationLoad")
            .setValue(false);
          self.products_location
            .at(index)
            .get("locationTagList")
            .setValue(response.tags);
          self.products_location
            .at(index)
            .get("filteredLocationTag")
            .setValue(
              self.products_location
                .at(index)
                .get("location_tag_name")
                .valueChanges.pipe(
                  startWith(""),
                  map(value => self.locationTagFilter(value, index))
                )
            );
        }
      });
    } catch (err) {
      this.global.addException("Add product", "getLocationTagList()", err);
    }
  }

  getLocationTag(tag, event: any = false, index): void {
    event
      ? event.isUserInput
        ? this.getTagDetails(tag, index)
        : ""
      : this.getTagDetails(tag, index);
  }
  getTagDetails(tag, index): void {
    this.products_location
      .at(index)
      .get("location_tag_id")
      .setValue(tag.location_tag_id);
    this.products_location
      .at(index)
      .get("location_tag_name")
      .setValue(tag.location_tag);
  }

  private locationTagFilter(value: string, index): string[] {
    try {
      return this.products_location
        .at(index)
        .get("locationTagList")
        .value.filter(option =>
          option.location_tag
            .toLowerCase()
            .includes(value ? value.toLowerCase() : "")
        );
    } catch (err) {
      this.global.addException("Add product", "locationTagFilter()", err);
    }
  }
  public validateLocationTag(event: any, item: any, index) {
    try {
      let locTag = event.target.value;
      let match = this.products_location
        .at(index)
        .get("locationTagList")
        .value.filter(
          item => item.location_tag.toLowerCase() == locTag.toLowerCase()
        );
      if (match.length > 0) {
        item.get("location_tag_id").setValue(match[0].location_tag_id);
        item.get("location_tag_name").setValue(match[0].location_tag);
      } else {
        item.get("location_tag_id").setValue("");
      }
    } catch (err) {
      this.global.addException("Add product", "validateLocationTag()", err);
    }
  }
  // ================  END LOCATION TAG  ===================== //

  createProductForm(option, val: any = {}): void {
    this.addProductForm = this.fb.group({
      po_id: new FormControl(option == "0" ? "" : val.po_id), //only for API call with PO (hidden)
      po_item_id: new FormControl(option == "0" ? "" : val.po_item_id), //only for API call with PO (hidden)
      receiving_slip_id: new FormControl(
        option == "0" ? "" : val.receiving_slip_id
      ), //only for API call with PO (hidden)
      is_unlisted: new FormControl(option == "0" ? 0 : val.is_unlisted), //only for API call with PO (hidden)
      supplier_id: new FormControl(option == "0" ? "" : val.supplier_id, [
        Validators.required
      ]),
      manf_id: new FormControl(option == "0" ? "" : val.manf_id, [
        Validators.required
      ]),
      manf_part_id: new FormControl(option == "0" ? "" : val.manf_part_id, [
        Validators.required
      ]),
      comment: new FormControl(option == "0" ? "" : val.comment, [
        Validators.maxLength(this.constant.DEFAULT_COMMENT_MAXLENGTH)
      ]),
      supplier: new FormControl(option == "0" ? "" : val.supplier, [
        Validators.required
      ]), //only for review (hidden)
      manufacturer: new FormControl(option == "0" ? "" : val.manufacturer, [
        Validators.required
      ]), //only for review (hidden)
      manufacturerPart: new FormControl(
        option == "0" ? "" : val.manufacturerPart,
        [Validators.required]
      ), //only for review (hidden)
      sales_price: new FormControl(option == "0" ? "" : val.sales_price, [
        Validators.required,
        Validators.pattern(this.constant.AMOUNT_PATTERN)
      ]),
      purchase_price: new FormControl(option == "0" ? "" : val.purchase_price, [
        Validators.required,
        Validators.pattern(this.constant.AMOUNT_PATTERN)
      ]),
      products_location: this.fb.array([]),
      totalQuantity: new FormControl(option == "0" ? "" : val.totalQuantity, [
        Validators.required,
        Validators.pattern(this.constant.AMOUNT_PATTERN)
      ]),
      remainingQuantity: new FormControl(
        option == "0" ? 0 : val.remainingQuantity
      )
    });
    if (option == "1") {
      for (let i = 0; i < val.products_location.length; i++) {
        this.addLocation(option, val.products_location[i]);
        this.getLocationTagList(i, val.products_location[i].location_id);
        //val.products_location[i].location_id && val.products_location[i].location_id != '' ?  (this.getLocation(this.products_location.at(i), false, i), this.getLocationTag(this.products_location.at(i), false, i)) : '';
      }
    } else {
      this.addLocation("0");
    }
  }

  get supplier_id() {
    return this.addProductForm.get("supplier_id");
  }
  get manf_id() {
    return this.addProductForm.get("manf_id");
  }
  get manf_part_id() {
    return this.addProductForm.get("manf_part_id");
  }
  get comment() {
    return this.addProductForm.get("comment");
  }
  get supplier() {
    return this.addProductForm.get("supplier");
  }
  get manufacturer() {
    return this.addProductForm.get("manufacturer");
  }
  get manufacturerPart() {
    return this.addProductForm.get("manufacturerPart");
  }
  get sales_price() {
    return this.addProductForm.get("sales_price");
  }
  get purchase_price() {
    return this.addProductForm.get("purchase_price");
  }
  get products_location(): FormArray {
    return (<FormArray>(
      this.addProductForm.get("products_location")
    )) as FormArray;
  }
  get totalQuantity() {
    return this.addProductForm.get("totalQuantity");
  }
  get remainingQuantity() {
    return this.addProductForm.get("remainingQuantity");
  }

  calculateRemainingQuantity() {
    console.log("CalculateRemainingQuantity ::  ");
    try {
      this.util.removeCommas(this.totalQuantity);
      if (this.constant.AMOUNT_PATTERN.test(this.totalQuantity.value)) {
        this.remainingQuantity.setValue(
          parseFloat(this.totalQuantity.value).toFixed(2)
        );
        let total: number = 0;
        for (let i = 0; i < this.products_location.length; i++) {
          this.util.removeCommas(this.products_location.at(i).get("quantity"));
          if (
            this.constant.AMOUNT_PATTERN.test(
              this.products_location.at(i).get("quantity").value
            )
          ) {
            total += parseFloat(
              this.products_location.at(i).get("quantity").value
            );
          }
        }
        this.remainingQuantity.setValue(
          (parseFloat(this.totalQuantity.value) - total).toFixed(2)
        );
      }
    } catch (err) {
      this.global.addException(
        "Add Product",
        "calculateRemainingQuantity()",
        err
      );
    }
  }

  addLocation(option, val: any = {}): void {
    try {
      this.products_location.push(
        this.fb.group({
          location_name: new FormControl(
            option == "0" ? "" : val.location_name
          ), //Only for review
          location_id: new FormControl(option == "0" ? "" : val.location_id, [
            Validators.required
          ]),
          location_tag_id: new FormControl(
            option == "0" ? "" : val.location_tag_id,
            [Validators.required]
          ),
          location_tag_name: new FormControl(
            option == "0" ? "" : val.location_tag_name,
            [Validators.required]
          ),
          quantity: new FormControl(option == "0" ? "" : val.quantity, [
            Validators.required,
            Validators.pattern(this.constant.AMOUNT_PATTERN)
          ]),
          locationTagList: new FormControl([]),
          filteredLocation: new FormControl(new Observable<string[]>()),
          filteredLocationTag: new FormControl(new Observable<string[]>()),
          isSubLocationLoad: new FormControl(false)
        })
      );

      this.setObservable(this.products_location.length - 1);
    } catch (err) {
      this.global.addException("Add product", "addLocation()", err);
    }
  }

  setObservable(index): void {
    try {
      this.products_location
        .at(index)
        .get("filteredLocation")
        .setValue(
          this.products_location
            .at(index)
            .get("location_name")
            .valueChanges.pipe(
              startWith(""),
              map(value => this.locationFilter(value))
            )
        );
      this.products_location
        .at(index)
        .get("filteredLocationTag")
        .setValue(
          this.products_location
            .at(index)
            .get("location_tag_name")
            .valueChanges.pipe(
              startWith(""),
              map(value => this.locationTagFilter(value, index))
            )
        );
    } catch (err) {
      this.global.addException("Add product", "setObservable()", err);
    }
  }

  removeLocation(position, location): void {
    try {
      this.products_location.removeAt(position);
      this.util.removeCommas(this.totalQuantity);
      if (this.constant.AMOUNT_PATTERN.test(this.totalQuantity.value)) {
        this.remainingQuantity.setValue(
          parseFloat(this.totalQuantity.value).toFixed(2)
        );
        let total: number = 0;
        for (let i = 0; i < this.products_location.length; i++) {
          this.util.removeCommas(this.products_location.at(i).get("quantity"));
          if (
            this.constant.AMOUNT_PATTERN.test(
              this.products_location.at(i).get("quantity").value
            )
          ) {
            total += parseFloat(
              this.products_location.at(i).get("quantity").value
            );
          }
        }
        this.remainingQuantity.setValue(
          (parseFloat(this.totalQuantity.value) - total).toFixed(2)
        );
      }
    } catch (err) {
      this.global.addException("Add product", "removeLocation()", err);
    }
  }

  reviewProduct(form: FormGroup): void {
    this.pageData.submitted = true;
    this.pageData.isError = false;
    console.log(form.value);
    try {
      if (form.valid) {
        if (this.remainingQuantity.value != 0) {
          this.pageData.isError = true;
          this.pageData.errMsg =
            "Total product quantity(sum of all location quantity) should match with quantity.";
          return;
        }

        if (this.currentPath != "add-product") {
          let totalQ: number = 0;
          for (let i = 0; i < form.value.products_location.length; ++i) {
            totalQ =
              totalQ + parseFloat(form.value.products_location[i].quantity);
          }
          if (
            parseFloat(this.pageData.prodInfo.requestData.quantity_ordered) !=
            totalQ
          ) {
            this.pageData.isError = true;
            this.pageData.errMsg =
              "Total product quantity should match with received quantity.";
            return;
          }
          form.value.quantity_ordered = this.pageData.prodInfo.requestData.quantity_ordered;
        }
        for (let i = 0; i < form.value.products_location.length; ++i) {
          delete form.value.products_location[i].filteredLocation;
          delete form.value.products_location[i].filteredLocationTag;
        }
        console.log(this.pageData.selectedMfgPart);
        sessionStorage.setItem(
          "productInfo",
          JSON.stringify({
            requestData: form.value,
            displayData: this.pageData.selectedMfgPart
          })
        );
        this.currentPath == "add-product"
          ? this.router.url.split("/")[2] == "csa-onboarding"
            ? this.router.navigate(["/inventory/csa-onboarding/product-review"])
            : this.router.navigate(["/inventory/csa/product-review"])
          : this.onTheFlyEvent({ step: "S2" });
      }
    } catch (err) {
      this.global.addException("Add product", "reviewProduct()", err);
    }
  }
  cancelProduct(): void {
    try {
      sessionStorage.removeItem("productInfo");
      this.currentPath == "add-product"
        ? this.router.url.split("/")[2] == "csa-onboarding"
          ? this.router.navigate(["/csa-onboarding/guide"])
          : this.router.navigate(["/inventory/csa/product-list/0"])
        : this.onTheFlyEvent({ step: "S0" });
    } catch (err) {
      this.global.addException("Add product", "cancelProduct()", err);
    }
  }

  onTheFlyEvent(data): void {
    this.util.changeEvent({
      source: "ON_THE_FLY_PRODUCT",
      action: "ADD",
      data: data
    });
  }
}
