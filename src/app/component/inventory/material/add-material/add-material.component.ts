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
import { Observable } from "rxjs";
import { map, startWith } from "rxjs/operators";

import { UtilService } from "../../../../shared/service/util.service";
import { HttpService } from "../../../../shared/service/http.service";
import { InventoryDialog } from "../../inventory-dialog.component";
import { ManufacturerDialog } from "../../../../shared/module/manufacturer/manufacturer/manufacturer.component";
import { ConstantsService } from "../../../../shared/service/constants.service";
import { GlobalService } from "../../../../shared/service/global.service";
import { ItemClassesDialog } from "../../../admin/item-classes/item-classes.component";
declare var $: any;
declare var jQuery: any;

@Component({
  selector: "app-add-material",
  templateUrl: "./add-material.component.html",
  styleUrls: ["./add-material.component.css"]
})
export class AddMaterialComponent implements OnInit {
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
    materialInfo: {},
    isError: false
  };
  addMaterialForm: FormGroup;
  @ViewChild("comment") commentElement: ElementRef;
  filteredSupplier: Observable<string[]>;
  filteredManufacturer: Observable<string[]>;
  filteredManufacturerPart: Observable<string[]>;
  currentPath: string;

  itemClass: any[] = [];
  filteredClass: Observable<string[]>;
  isMainLocationLoad: boolean = false;
  isSupplierLoad: boolean = false;

  constructor(
    public dialog: MatDialog,
    public util: UtilService,
    public constant: ConstantsService,
    public router: Router,
    private route: ActivatedRoute,
    private http: HttpService,
    private fb: FormBuilder,
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
    this.currentPath == "add-material"
      ? this.router.url.split("/")[2] == "csa-onboarding"
        ? this.util.menuChange({ menu: "guide", subMenu: "" })
        : this.util.menuChange({ menu: 3, subMenu: 34 })
      : "";
    this.pageData.addOption =
      this.router.url.split("/")[2] == "csa" &&
      this.router.url.split("/")[this.router.url.split("/").length - 1] ==
        "add-material"
        ? "WithPO"
        : "WithOutPO";

    this.util.changeDetection.subscribe(dataObj => {
      if (dataObj && this.currentPath == "add-material") {
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
          // this.getManufacturerList('REFRESH');
        } else if (dataObj.source == "ON_THE_FLY_ITEM_CATEGORY") {
          this.getItemClass("REFRESH");
        }
        this.util.changeEvent(null);
      }
    });

    this.materialFormSetup();
    this.getLocationList();
    this.getSupplierList();
    this.getManufacturerPart(0);
    this.getItemClass();
    this.getUnits();
  }

  materialFormSetup(): void {
    try {
      if (sessionStorage.getItem("materialInfo")) {
        this.createMaterialForm(
          "1",
          JSON.parse(sessionStorage.getItem("materialInfo")).requestData
        );
        //this.getManufacturerPart(JSON.parse(sessionStorage.getItem('materialInfo')).requestData.manf_id);
        this.pageData.materialInfo = JSON.parse(
          sessionStorage.getItem("materialInfo")
        );
        console.log(this.pageData.materialInfo);
        this.pageData.addOption = "WithOutPO";
      } else {
        this.createMaterialForm("0");
      }
    } catch (err) {
      this.global.addException("Add Material", "materialFormSetup()", err);
    }
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
      this.global.addException("Add Material", "next()", err);
    }
  }

  public clearAutoComplete(id, name) {
    try {
      let self = this;
      let backspaceEvent = jQuery.Event("keyup", { keyCode: 20 });
      $("#" + id).trigger(backspaceEvent);
      setTimeout(function() {
        self.addMaterialForm.get(id).setValue("");
        self.addMaterialForm.get(name).setValue("");
      }, 1);
    } catch (err) {
      this.global.addException("Add Material", "clearAutoComplete()", err);
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
          //'Products and Materials' Suppliers Type => 1
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
          console.log("self.pageData.supplierList", self.pageData.supplierList);
        }
      });
    } catch (err) {
      this.global.addException("Add Material", "getSupplierList()", err);
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
      this.global.addException("Add Material", "supplierFilter()", err);
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
      this.global.addException("Add Material", "validateSupplier()", err);
    }
  }
  showAddSupplierPopup(): void {
    sessionStorage.removeItem("supplierObject");
    this.util.changeEvent(null);
    this.dialog.open(InventoryDialog, { data: { action: "addNewSupplier" } });
  }
  showAddItemCategoryPopup(): void {
    this.util.changeEvent(null);
    this.dialog.open(ItemClassesDialog, {
      data: { action: "addNewItemClass" }
    });
  }
  // ==============   END SUPPLIER  =============== //

  // ==============   Item Category  =============== //
  getItemClass(origin: string = "INIT") {
    try {
      let self = this;
      this.util.showProcessing("processing-spinner");
      this.http.doGet("itemclass", function(error: boolean, response: any) {
        self.util.hideProcessing("processing-spinner");
        if (error) {
        } else {
          self.itemClass = response.data.filter(
            item => item.item_class_type == "Material"
          );
          self.filteredClass = self.class_name.valueChanges.pipe(
            startWith(""),
            map(value => self.classFilter(value))
          );

          // -- auto selected item class  -- //
          origin == "REFRESH"
            ? (self.getCategory(self.itemClass[self.itemClass.length - 1], {}),
              self.class_name.setValue(
                self.itemClass[self.itemClass.length - 1].item_class_name
              ),
              self.item_class_id.setValue(
                self.itemClass[self.itemClass.length - 1].item_class_id
              ))
            : "";
          // -- auto selected item class  -- //
        }
      });
    } catch (err) {
      this.global.addException("Add Material", "getItemClass()", err);
    }
  }
  getCategory(mfg, event: any = false): void {
    event
      ? event.isUserInput
        ? this.item_class_id.setValue(mfg.item_class_id)
        : ""
      : "";
  }

  getSelectedClass(obj, event: any): void {
    try {
      if (event.isUserInput) {
        this.item_class_id.setValue(obj.item_class_id);
        this.filteredManufacturerPart = this.material_name.valueChanges.pipe(
          startWith(""),
          map(value => this.manufacturerPartFilter(value))
        );
      }
    } catch (err) {
      this.global.addException("Add Material", "getSelectedClass()", err);
    }
  }
  private classFilter(value: string): string[] {
    try {
      return this.itemClass.filter(option =>
        option.item_class_name
          .toLowerCase()
          .includes(value ? value.toLowerCase() : "")
      );
    } catch (err) {
      this.global.addException("Add Material", "classFilter()", err);
    }
  }

  public validateClass(event: any) {
    try {
      let classVal = event.target.value;
      let match = this.itemClass.filter(
        item => item.item_class_name.toLowerCase() == classVal.toLowerCase()
      );
      console.log(match);
      if (classVal == "") {
        this.item_class_id.setValue("");
        return;
      }
      if (match.length > 0) {
        this.item_class_id.setValue(match[0].item_class_id);
        this.class_name.setValue(match[0].item_class_name);
      }
    } catch (err) {
      this.global.addException("Add Material", "validateClass()", err);
    }
  }

  // ==============   END Item Category  =============== //

  // ================   ITEM DEFINITION  ===================== //
  private getManufacturerPart(id, origin: string = "INIT"): void {
    try {
      let self = this;
      this.http.doGet("manufPart", function(error: boolean, response: any) {
        if (error) {
          console.log("error", response);
        } else {
          self.util.hideProcessing("processing-spinner");
          if (error) {
            console.log(response);
          } else {
            self.pageData.manufacturerPartList = response.data.filter(
              item => item.is_material_default != "1"
            );
            sessionStorage.getItem("materialInfo")
              ? self.getMfgPart(
                  self.pageData.manufacturerPartList.filter(
                    item =>
                      item.manf_part_id ==
                      JSON.parse(sessionStorage.getItem("materialInfo"))
                        .requestData.manf_part_id
                  )[0]
                )
              : "";
            // self.filteredManufacturerPart = self.material_name.valueChanges.pipe(startWith(''),map(value => self.manufacturerPartFilter(value)));
            origin == "REFRESH" ? self.setNewlyAddedMaterial() : "";
            //origin == 'REFRESH' ? (self.getMfgPart(self.pageData.manufacturerList[self.pageData.manufacturerList.length - 1])) : '';
            console.log(
              "manufacturerPartList",
              self.pageData.manufacturerPartList
            );
          }
        }
      });
    } catch (err) {
      this.global.addException("Add Material", "getManufacturerPart()", err);
    }
  }
  setNewlyAddedMaterial(): void {
    try {
      let newAdded: any[] = this.pageData.manufacturerPartList.filter(
        item => item.class_name && item.class_name.item_class_type == "Material"
      );
      this.getMfgPart(newAdded[newAdded.length - 1]);
      this.material_name.setValue(newAdded[newAdded.length - 1].short_name);
      this.item_class_id.setValue(
        newAdded[newAdded.length - 1].class_name.item_class_id
      );
      this.class_name.setValue(
        newAdded[newAdded.length - 1].class_name.item_class_name
      );
      this.pageData.selectedMfgPart = newAdded[newAdded.length - 1];

      this.uom_id.setValue(newAdded[newAdded.length - 1].uom_name.uom_id);
      this.uom.setValue(newAdded[newAdded.length - 1].uom_name.uom_name);
    } catch (err) {
      this.global.addException("Add Material", "setNewlyAddedMaterial()", err);
    }
  }
  getMfgPart(part, event: any = false): void {
    try {
      event
        ? event.isUserInput
          ? (this.manf_part_id.setValue(part.manf_part_id),
            this.manf_id.setValue(part.manf_id),
            (this.pageData.selectedMfgPart = part),
            this.uom_id.setValue(part.uom_name.uom_id),
            this.uom.setValue(part.uom_name.uom_name))
          : ""
        : (this.manf_part_id.setValue(part.manf_part_id),
          this.manf_id.setValue(part.manf_id),
          (this.pageData.selectedMfgPart = part),
          this.uom_id.setValue(part.uom_name.uom_id),
          this.uom.setValue(part.uom_name.uom_name));
    } catch (err) {
      this.global.addException("Add Material", "getMfgPart()", err);
    }
  }
  private manufacturerPartFilter(value: string): string[] {
    try {
      return this.pageData.manufacturerPartList.filter(
        option =>
          option.class_name &&
          this.addMaterialForm.get("item_class_id").value ==
            option.class_name.item_class_id &&
          option.short_name
            .toLowerCase()
            .includes(value ? value.toLowerCase() : "")
      );
    } catch (err) {
      this.global.addException("Add Material", "manufacturerPartFilter()", err);
    }
  }
  public validateManfPart(event: any) {
    try {
      let manfPart = event.target.value;
      let match = this.pageData.manufacturerPartList.filter(
        item => item.short_name.toLowerCase() == manfPart.toLowerCase()
      );
      console.log(match);
      if (match.length > 0) {
        this.manf_part_id.setValue(match[0].manf_part_id);
        this.manf_id.setValue(match[0].manf_id);
        this.material_name.setValue(match[0].short_name);
        this.pageData.selectedMfgPart = match[0];
        this.uom_id.setValue(match[0].uom_name.uom_id);
        this.uom.setValue(match[0].uom_name.uom_name);
      } else {
        this.manf_part_id.setValue("");
        this.manf_id.setValue("");
        this.pageData.selectedMfgPart = null;
      }
    } catch (err) {
      this.global.addException("Add Material", "validateManfPart()", err);
    }
  }

  showAddManufacturerPartPopup(index : number = 0): void {
    try {
      sessionStorage.removeItem("newPart");
      sessionStorage.setItem("class", JSON.stringify(["Material"]));
      this.util.changeEvent(null);
      this.dialog.open(InventoryDialog, {
        data: { action: "addNewManufacturerPart" }
      });
    } catch (err) {
      this.global.addException(
        "Add Material",
        "showAddManufacturerPartPopup()",
        err
      );
    }
  }
  // ==============   END ITEM DEFINITION  =================== //

  // ==============   Units  =================== //

  getUnits() {
    try {
      let self = this;
      this.http.doGet("manufPart/uomList", function(
        error: boolean,
        response: any
      ) {
        if (error) {
          console.log(response);
        } else {
          self.pageData.uomList = response.data;
          console.log(self.pageData);
          // self.filteredClass = self.class_name.valueChanges.pipe(startWith(''),map(value => self.classFilter(value)));
        }
      });
    } catch (err) {
      this.global.addException("Add Material", "getUnits()", err);
    }
  }
  // ==============   END Units  =================== //

  // ================   LOCATION  ===================== //
  getLocationList(): void {
    try {
      var self = this;
      this.http.doGet("location/list", function(error: boolean, response: any) {
        self.isMainLocationLoad = false;
        if (error) {
          console.log("error", response);
        } else {
          self.pageData.locationList = response.data;
          self.material_location
            .at(0)
            .get("filteredLocation")
            .setValue(
              self.material_location
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
      this.global.addException("Add Material", "getLocationList()", err);
    }
  }
  getLocation(location, event: any = false, index): void {
    try {
      event
        ? event.isUserInput
          ? (this.material_location
              .at(index)
              .get("location_id")
              .setValue(location.location_id),
            this.getLocationTagList(index, location.location_id))
          : ""
        : (this.material_location
            .at(index)
            .get("location_id")
            .setValue(location.location_id),
          this.getLocationTagList(index, location.location_id));
      this.material_location
        .at(index)
        .get("location_tag_id")
        .setValue("");
      this.material_location
        .at(index)
        .get("location_tag_name")
        .setValue("");
    } catch (err) {
      this.global.addException("Add Material", "getLocation()", err);
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
      this.global.addException("Add Material", "locationFilter()", err);
    }
  }
  public validateLocation(event: any, item: any, index) {
    try {
      let location = event.target.value;
      if (location == "") {
        item.get("location_id").setValue("");
        this.material_location
          .at(index)
          .get("location_tag_id")
          .setValue("");
        this.material_location
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
        this.material_location
          .at(index)
          .get("location_tag_id")
          .setValue("");
        this.material_location
          .at(index)
          .get("location_tag_name")
          .setValue("");
      } else {
        item.get("location_id").setValue("");
      }
    } catch (err) {
      this.global.addException("Add Material", "validateLocation()", err);
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
      self.material_location
        .at(index)
        .get("isSubLocationLoad")
        .setValue(true);
      this.http.doGet("location/tag/" + locId, function(
        error: boolean,
        response: any
      ) {
        self.material_location
          .at(index)
          .get("isSubLocationLoad")
          .setValue(false);
        if (error) {
          console.log("error", response);
        } else {
          self.material_location
            .at(index)
            .get("locationTagList")
            .setValue(response.tags);
          self.material_location
            .at(index)
            .get("filteredLocationTag")
            .setValue(
              self.material_location
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
      this.global.addException("Add Material", "getLocationTagList()", err);
    }
  }

  getLocationTag(tag, event: any = false, index): void {
    try {
      console.log(tag);
      event
        ? event.isUserInput
          ? this.getTagDetails(tag, index)
          : ""
        : this.getTagDetails(tag, index);
    } catch (err) {
      this.global.addException("Add Material", "getLocationTag()", err);
    }
  }
  getTagDetails(tag, index): void {
    try {
      this.material_location
        .at(index)
        .get("location_tag_id")
        .setValue(tag.location_tag_id);
      this.material_location
        .at(index)
        .get("location_tag_name")
        .setValue(tag.location_tag);
    } catch (err) {
      this.global.addException("Add Material", "getTagDetails()", err);
    }
  }

  // getLocationTag(tag, event: any = false, index): void {
  //      event ? event.isUserInput ? this.getTagDetails(tag, index) : '' : this.getTagDetails(tag, index);
  // }
  // getTagDetails(tag, index): void {
  //     this.material_location.at(index).get('location_tag_id').setValue('');
  //     this.material_location.at(index).get('location_tag_id').setValue(tag.location_tag_id);
  //     this.material_location.at(index).get('location_tag_name').setValue('');
  //     this.material_location.at(index).get('location_tag_name').setValue(tag.location_tag);
  // }

  private locationTagFilter(value: string, index): string[] {
    try {
      return this.material_location
        .at(index)
        .get("locationTagList")
        .value.filter(option =>
          option.location_tag
            .toLowerCase()
            .includes(value ? value.toLowerCase() : "")
        );
    } catch (err) {
      this.global.addException("Add Material", "locationTagFilter()", err);
    }
  }
  public validateLocationTag(event: any, item: any, index) {
    try {
      let locTag = event.target.value;
      let match = this.material_location
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
      this.global.addException("Add Material", "validateLocationTag()", err);
    }
  }
  // ================  END LOCATION TAG  ===================== //

  createMaterialForm(option, val: any = {}): void {
    this.addMaterialForm = this.fb.group({
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
      item_class_id: new FormControl(option == "0" ? "" : val.item_class_id, [
        Validators.required
      ]),
      class_name: new FormControl(option == "0" ? "" : val.class_name, [
        Validators.required
      ]),
      material_name: new FormControl(option == "0" ? "" : val.material_name, [
        Validators.required
      ]), //only for review (hidden)
      uom_id: new FormControl(option == "0" ? "" : val.uom_id, [
        Validators.required
      ]),
      uom: new FormControl(option == "0" ? "" : val.uom, [Validators.required]),
      purchase_price: new FormControl(option == "0" ? "" : val.purchase_price, [
        Validators.required,
        Validators.pattern(this.constant.AMOUNT_PATTERN)
      ]),
      sales_price: new FormControl(option == "0" ? "" : val.sales_price, [
        Validators.required,
        Validators.pattern(this.constant.AMOUNT_PATTERN)
      ]),
      material_location: this.fb.array([]),
      totalQuantity: new FormControl(option == "0" ? "" : val.totalQuantity, [
        Validators.required,
        Validators.pattern(this.constant.AMOUNT_PATTERN)
      ]),
      remainingQuantity: new FormControl(
        option == "0" ? 0 : val.remainingQuantity
      )
    });
    if (option == "1") {
      for (let i = 0; i < val.material_location.length; i++) {
        this.addLocation(option, val.material_location[i]);
        this.getLocationTagList(i, val.material_location[i].location_id);
        //val.material_location[i].location_id && val.material_location[i].location_id != '' ?  (this.getLocation(this.material_location.at(i), false, i), this.getLocationTag(this.material_location.at(i), false, i)) : '';
      }
    } else {
      this.addLocation("0");
    }
  }

  get supplier_id() {
    return this.addMaterialForm.get("supplier_id");
  }
  get manf_id() {
    return this.addMaterialForm.get("manf_id");
  }
  get manf_part_id() {
    return this.addMaterialForm.get("manf_part_id");
  }
  get comment() {
    return this.addMaterialForm.get("comment");
  }
  get supplier() {
    return this.addMaterialForm.get("supplier");
  }
  get item_class_id() {
    return this.addMaterialForm.get("item_class_id");
  }
  get class_name() {
    return this.addMaterialForm.get("class_name");
  }
  get material_name() {
    return this.addMaterialForm.get("material_name");
  }
  get uom_id() {
    return this.addMaterialForm.get("uom_id");
  }
  get uom() {
    return this.addMaterialForm.get("uom");
  }
  get purchase_price() {
    return this.addMaterialForm.get("purchase_price");
  }
  get sales_price() {
    return this.addMaterialForm.get("sales_price");
  }
  get material_location(): FormArray {
    return (<FormArray>(
      this.addMaterialForm.get("material_location")
    )) as FormArray;
  }
  get totalQuantity() {
    return this.addMaterialForm.get("totalQuantity");
  }
  get remainingQuantity() {
    return this.addMaterialForm.get("remainingQuantity");
  }

  calculateRemainingQuantity() {
    console.log("CalculateRemainingQuantity ::");
    try {
      this.util.removeCommas(this.totalQuantity);
      if (this.constant.AMOUNT_PATTERN.test(this.totalQuantity.value)) {
        this.remainingQuantity.setValue(
          parseFloat(this.totalQuantity.value).toFixed(2)
        );
        let total: number = 0;
        for (let i = 0; i < this.material_location.length; i++) {
          this.util.removeCommas(this.material_location.at(i).get("quantity"));
          if (
            this.constant.AMOUNT_PATTERN.test(
              this.material_location.at(i).get("quantity").value
            )
          ) {
            total += parseFloat(
              this.material_location.at(i).get("quantity").value
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
      this.material_location.push(
        this.fb.group({
          location_name: new FormControl(
            option == "0" ? "" : val.location_name ? val.location_name : ""
          ), //Only for review
          location_id: new FormControl(option == "0" ? "" : val.location_id, [
            Validators.required
          ]),
          location_tag_id: new FormControl(
            option == "0" ? "" : val.location_tag_id,
            [Validators.required]
          ),
          location_tag_name: new FormControl(
            option == "0"
              ? ""
              : val.location_tag_name
              ? val.location_tag_name
              : "",
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
      console.log(this.material_location);
      this.setObservable(this.material_location.length - 1);
    } catch (err) {
      this.global.addException("Add Material", "addLocation()", err);
    }
  }

  setObservable(index): void {
    try {
      this.material_location
        .at(index)
        .get("filteredLocation")
        .setValue(
          this.material_location
            .at(index)
            .get("location_name")
            .valueChanges.pipe(
              startWith(""),
              map(value => this.locationFilter(value))
            )
        );
      this.material_location
        .at(index)
        .get("filteredLocationTag")
        .setValue(
          this.material_location
            .at(index)
            .get("location_tag_name")
            .valueChanges.pipe(
              startWith(""),
              map(value => this.locationTagFilter(value, index))
            )
        );
    } catch (err) {
      this.global.addException("Add Material", "setObservable()", err);
    }
  }

  // removeLocation(position, location): void {
  //     try {
  //         this.material_location.removeAt(position);
  //     } catch (err) {
  //         this.global.addException('Add Material', 'removeLocation()', err);
  //     }
  // }
  removeLocation(position, location): void {
    try {
      this.material_location.removeAt(position);
      this.util.removeCommas(this.totalQuantity);
      if (this.constant.AMOUNT_PATTERN.test(this.totalQuantity.value)) {
        this.remainingQuantity.setValue(
          parseFloat(this.totalQuantity.value).toFixed(2)
        );
        let total: number = 0;
        for (let i = 0; i < this.material_location.length; i++) {
          this.util.removeCommas(this.material_location.at(i).get("quantity"));
          if (
            this.constant.AMOUNT_PATTERN.test(
              this.material_location.at(i).get("quantity").value
            )
          ) {
            total += parseFloat(
              this.material_location.at(i).get("quantity").value
            );
          }
        }
        this.remainingQuantity.setValue(
          (parseFloat(this.totalQuantity.value) - total).toFixed(2)
        );
      }
    } catch (err) {
      this.global.addException("Add Material", "removeLocation()", err);
    }
  }

  reviewMaterial(form: FormGroup): void {
    this.pageData.submitted = true;
    this.pageData.isError = false;
    console.log(form.value);
    try {
      if (form.valid) {
        if (this.remainingQuantity.value != 0) {
          this.pageData.isError = true;
          this.pageData.errMsg =
            "Total material quantity(sum of all location quantity) should match with quantity.";
          return;
        }
        if (this.currentPath != "add-material") {
          let totalQ: number = 0;
          for (let i = 0; i < form.value.material_location.length; ++i) {
            totalQ =
              totalQ + parseInt(form.value.material_location[i].quantity);
          }
          if (
            parseInt(this.pageData.materialInfo.requestData.quantity_ordered) !=
            totalQ
          ) {
            this.pageData.isError = true;
            this.pageData.errMsg =
              "Total material quantity should match with received quantity.";
            return;
          }
          form.value.quantity_ordered = this.pageData.materialInfo.requestData.quantity_ordered;
        }
        for (let i = 0; i < form.value.material_location.length; ++i) {
          delete form.value.material_location[i].filteredLocation;
          delete form.value.material_location[i].filteredLocationTag;
        }
        let reqObj: any = {};
        reqObj = form.value;
        //reqObj.UOMName =  form.value.uom_id && form.value.uom_id != '' ? this.pageData.uomList.filter(item => item.uom_id == form.value.uom_id)[0].uom_name : '';
        sessionStorage.setItem(
          "materialInfo",
          JSON.stringify({
            requestData: reqObj,
            displayData: this.pageData.selectedMfgPart
          })
        );
        this.currentPath == "add-material"
          ? this.router.url.split("/")[2] == "csa-onboarding"
            ? this.router.navigate([
                "/inventory/csa-onboarding/material-review"
              ])
            : this.router.navigate(["/inventory/csa/material-review"])
          : this.onTheFlyEvent({ step: "S2" });
        console.log("UOMName = ", reqObj);
        console.log(this.pageData.selectedMfgPart);
      }
    } catch (err) {
      this.global.addException("Add Material", "reviewMaterial()", err);
    }
  }
  cancelMaterial(): void {
    try {
      sessionStorage.removeItem("materialInfo");
      this.currentPath == "add-material"
        ? this.router.url.split("/")[2] == "csa-onboarding"
          ? this.router.navigate(["/csa-onboarding/guide"])
          : this.router.navigate(["/inventory/csa/material-list/0"])
        : this.onTheFlyEvent({ step: "S0" });
    } catch (err) {
      this.global.addException("Add Material", "cancelMaterial()", err);
    }
  }

  onTheFlyEvent(data): void {
    this.util.changeEvent({
      source: "ON_THE_FLY_MATERIAL",
      action: "ADD",
      data: data
    });
  }
}
