import { Component, OnInit, ApplicationRef, Inject } from "@angular/core";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";
import { Router, ActivatedRoute } from "@angular/router";
import {
  FormControl,
  Validators,
  FormGroup,
  FormBuilder,
  FormArray
} from "@angular/forms";
import { Observable } from "rxjs";
import { map, startWith } from "rxjs/operators";
import { Location } from "@angular/common";
import * as _ from "underscore";

import { UtilService } from "../../../../shared/service/util.service";
import { ExportService } from "../../../../shared/service/export.service";
import { HttpService } from "../../../../shared/service/http.service";
import { ConstantsService } from "../../../../shared/service/constants.service";
import { DialogComponent } from "../../../../shared/model/dialog/dialog.component";
import { InventoryDialog } from "../../inventory-dialog.component";
import { GlobalService } from "../../../../shared/service/global.service";
import { OnboardingGuideDialogComponent } from "../../../onboarding/onboarding-guide/onboarding-guide.component";
import { AppConfig, APP_CONFIG } from "../../../../app-config.module";
@Component({
  selector: "app-material-list",
  templateUrl: "./material-list.component.html",
  styleUrls: ["./material-list.component.css"]
})
export class MaterialListComponent implements OnInit {
  pageData: any = {
    materialList: [],
    listCount: 0,
    imageCount: 0,
    sortColumn: "material_id",
    sortOrder: "DSC",
    sortColumnType: "N",
    materialDetails: "details",
    action: "",
    isEdit: false,
    isError: false,
    submitted: false
  };
  searchList;
  searchTxt;
  permissionsSet: any;
  editMaterialForm: FormGroup;
  removedLocation: any = [];

  public onBoarding:boolean = false; 

  constructor(
    @Inject(APP_CONFIG)
    private config: AppConfig,
    public dialog: MatDialog,
    public util: UtilService,
    public router: Router,
    private route: ActivatedRoute,
    private http: HttpService,
    private file: ExportService,
    private fb: FormBuilder,
    public constant: ConstantsService,
    private ref: ApplicationRef,
    private location: Location,
    private global: GlobalService
  ) {}

  ngOnInit() {
    let self = this;
    this.router.url.split("/")[2] == "csa-onboarding"
      ? this.util.menuChange({ menu: "guide", subMenu: "" })
      : this.util.menuChange({ menu: 3, subMenu: 34 });
    this.pageData.paginationKey = {
      itemsPerPage: this.constant.ITEMS_PER_PAGE,
      currentPage: this.constant.CURRENT_PAGE
    };
    this.util.setWindowHeight();
    this.util.setPageTitle(this.route);
    this.getMaterialList();
    
    this.permissionsSet = this.util.getModulePermission(75);

    this.util.changeDetection.subscribe(dataObj => {
      if (dataObj && dataObj.source == "MATERIAL") {
        self.getMaterialList();
        self.pageData.selectedMaterial = null;
        self.pageData.selectedIndex = null;
        self.pageData.searchTxt = self.pageData.searchList = "";
      }
      if (dataObj && dataObj.source == "UPLOAD_MATERIAL_DOC") {
        self.pageData.selectedMaterial = dataObj.data;
        self.getMaterialList();
        //console.log("Uploaded",self.pageData.selectedMaterial);
      }
    });
  }

  getMaterialList(origin: string = "INIT") {
    try {
      let self = this;
      this.util.showProcessing("processing-spinner");
      this.http.doGet("invmateriallist", function(
        error: boolean,
        response: any
      ) {
        self.util.hideProcessing("processing-spinner");
        if (error) {
          console.log(response.data);
        } else {
          console.log(
            "invmateriallist api data =",
            JSON.stringify(response.data)
          );
          self.pageData.materialList = [];
          for (let i = 0; i < response.data.length; i++) {
            let locationArr: any[] = [];
let poDetailsArray = [];

            response.data[i].inv_materials.map(function(loc) {
// console.log('----',loc);
              poDetailsArray.push({
                "created_at":loc.created_at,
                "purchase_order_no": loc.po_order !== '' ? loc.po_order.purchase_order_no : 'N/A',
                "purchase_order_id": loc.po_order !== '' ? loc.po_order.purchase_order_id : 'N/A',
                "supplier_name": loc.supplier_name.supplier_name,
                "purchase_price": loc.purchase_price,
                "sales_price": loc.sales_price,
                "material_updated_quantity":loc.material_updated_quantity
              })

              loc.material_location.map(function(locTag) {
                locTag.purchase_price = loc.purchase_price;
                locTag.sales_price = loc.sales_price;
                locationArr.push(locTag);
              });
            });

            if (response.data[i].inv_materials.length > 0) {
              //console.log(response.data[i].inv_materials[0].material_location);
              self.pageData.materialList.push({
                material_id: response.data[i].inv_materials[0].material_id,
                manf_part_id: response.data[i].manf_part_id,
                supplier_name:
                  response.data[i].inv_materials[0].supplier_name.supplier_name,
                manufacturer_name: response.data[i].manufacturer_name.manf_name,
                manufacturer_part_name: response.data[i].full_name,
                comment: response.data[i].inv_materials[0].comment,
                location_tag_name:
                  response.data[i].inv_materials[0].material_location[0]
                    .location_details.location_name +
                  (locationArr.length > 1
                    ? " (+" + (self.getLocationCount(locationArr) - 1) + ")"
                    : ""),
                scan_code: response.data[i].inv_materials[0]
                  .material_location[0]
                  ? response.data[i].inv_materials[0].material_location[0]
                      .location_tags[0].scan_code
                  : "",
                short_name: response.data[i].short_name,
                class_name: response.data[i].class_name.item_class_name,
                upc: "",
                uom: response.data[i].uom_name.uom_name,
                manuf_part_image: response.data[i].manuf_parts_thumbnail_images
                  ? response.data[i].manuf_parts_thumbnail_images.image_path
                  : "",
                quantity: response.data[i].updated_quantity,
                remainingQuantity: response.data[i].updated_quantity,
                quantityWithUOM:
                  response.data[i].updated_quantity +
                  " " +
                  response.data[i].uom_name.uom_name,
                purchase_price: response.data[i].purchase_price,
                sales_price: response.data[i].sales_price,
                location: locationArr,
                displayLocations: self.getClubbingLocations(locationArr),
                manuf_part_document: response.data[i].manuf_parts_files
                  ? self.create2DList(response.data[i].manuf_parts_files)
                  : [],
                attachments:
                  response.data[i].inv_materials[0].material_attachments,
                  manufacturer_id : response.data[i].manf_id,
                  class_id: response.data[i].class_name.item_class_id,
                  poDetails: poDetailsArray
              });
            }
          }

          if(self.pageData.materialList.length == 0) {
            self.onBoarding = true;
          }
          self.getLocationList();
          if (origin == "REFRESH" || self.pageData.selectedMaterial) {
            self.selectMaterial(
              self.pageData.materialList.filter(
                item =>
                  item.material_id == self.pageData.selectedMaterial.material_id
              )[0]
            );
          }

          self.route.snapshot.paramMap.get("id") != "0"
            ? self.showMaterialDetails()
            : "";
        }
        //console.log(self.pageData.materialList);
      });
    } catch (err) {
      this.global.addException("Material list", "getMaterialList()", err);
    }
  }
  addFromCSV() {
    let route: string,
      apiEndPoint: string,
      csvTemplateUrl: string,
      redirectUrl: string;
    route = "/csa-onboarding/csv-preview/material";
    apiEndPoint = "material/csv";
    csvTemplateUrl = this.config.domainIP + "api/download/csv/material.csv";
    redirectUrl = "/inventory/csa/material-list/0";
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
  getLocationCount(locationList) {
    try {
      let list = locationList.reduce(
        (x, y) =>
          x.findIndex(e => e.location_tag_id == y.location_tag_id) < 0
            ? [...x, y]
            : x,
        []
      );
      return list.length;
    } catch (err) {
      this.global.addException("Material list", "getLocationCount()", err);
    }
  }

  updateCount(count) {
    this.constant.ITEM_COUNT = this.pageData.listCount = count;
  }

  getSearchTxt(filterValue: string) {
    if (filterValue == "") {
      this.pageData.searchTxt = "";
    }
  }

  addNewMaterial() {
    //this.router.navigate(["/inventory/csa-onboarding/add-material"]);
    try {
      sessionStorage.removeItem("materialInfo");
      this.router.url.split("/")[2] == "csa-onboarding"
        ? this.router.navigate(["/inventory/csa-onboarding/add-material"])
        : this.router.navigate(["/inventory/csa/add-material"]);
    } catch (err) {
      this.global.addException("Material list", "addNewMaterial()", err);
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

  create2DList(list) {
    try {
      let listCont = 0,
        imgArr = [],
        inArr = [];
      while (listCont < list.length) {
        let count = 0;
        inArr = [];
        while (count < 3 && listCont < list.length) {
          inArr.push(list[listCont]);
          count++;
          listCont++;
        }
        imgArr.push({ inArray: inArr });
      }
      return imgArr;
    } catch (err) {
      this.global.addException("Material list", "create2DList()", err);
    }
  }

  getClubbingLocations(locations): any[] {
    let combinedLocations: any[] = JSON.parse(
      JSON.stringify(
        locations.reduce(
          (x, y) =>
            x.findIndex(e => e.location_tag_id == y.location_tag_id) < 0
              ? [...x, y]
              : x,
          []
        )
      )
    );
    combinedLocations.map(comLoc => {
      locations.map(loc => {
        if (
          comLoc.location_tag_id == loc.location_tag_id &&
          comLoc.material_location_id != loc.material_location_id
        ) {
          comLoc.updated_quantity =
            parseFloat(comLoc.updated_quantity) +
            parseFloat(loc.updated_quantity);
        }
      });
    });

    return combinedLocations;
  }

  showMaterialDetails(): void {
    try {
      let sortedList: any[] = _.sortBy(
        this.pageData.materialList,
        "material_id"
      ).reverse();
      for (var i = 0; i < sortedList.length; ++i) {
        if (
          this.route.snapshot.paramMap.get("id") == sortedList[i].manf_part_id
        ) {
          this.selectMaterial(sortedList[i]);
          this.pageData.selectedIndex = i;
          break;
        }
      }
    } catch (err) {
      this.global.addException("Material list", "showMaterialDetails()", err);
    }
  }

  selectMaterial(material) {
    try {
      var self = this;
      this.pageData.materialDetails = "details";
      this.pageData.selectedMaterial = material;
      this.createLocationForm(this.pageData.selectedMaterial.location);
      this.pageData.selectedMaterial.totalQuantity = parseFloat(
        this.pageData.selectedMaterial.quantity
      );
      this.pageData.selectedMaterial.remainingQuantity = 0;
      this.pageData.backup = JSON.parse(
        JSON.stringify(this.pageData.selectedMaterial)
      );
      console.log(JSON.stringify(this.pageData.selectedMaterial));
      self.location.go("/inventory/csa/material-list/" + material.manf_part_id);
      setTimeout(function() {
        self.util.scrollDown("materialMark");
      }, 1000);
    } catch (err) {
      this.global.addException("Material list", "selectMaterial()", err);
    }
  }

  updateMaterialDetails() {
    try {
      let self = this;
      self.util.addSpinner("material-update-btn", "Update");
      this.http.doPost(
        "invmaterial/updateDetail",
        {
          material_id: self.pageData.selectedMaterial.material_id,
          comment: self.pageData.selectedMaterial.comment
        },
        function(error: boolean, response: any) {
          self.util.removeSpinner("material-update-btn", "Update");
          if (error) {
            self.pageData.isError = true;
            self.pageData.errMsg = response.message;
          } else {
            self.pageData.backup.comment =
              self.pageData.selectedMaterial.comment;
            self.getMaterialList();
            self.cancelEdit();
          }
        }
      );
    } catch (err) {
      this.global.addException("Material list", "updateMaterialDetails()", err);
    }
  }

  createLocationForm(locDetails): void {
    this.editMaterialForm = this.fb.group({
      locations: this.fb.array([])
    });
    for (var i = 0; i < locDetails.length; ++i) {
      this.addLocation("1", locDetails[i]);
      //this.getLocationTagList(i, locDetails[i].location_tag_name.location_id);
      this.getLocationTagList(i, locDetails[i].location_id);
    }
  }

  get locations(): FormArray {
    return (<FormArray>this.editMaterialForm.get("locations")) as FormArray;
  }

  addLocation(option, val: any = {}): void {
    this.locations.push(
      this.fb.group({
        material_location_id: new FormControl(val.material_location_id),
        location_name: new FormControl(
          option == "0" ? "" : val.location_details.location_name
        ),
        location_id: new FormControl(option == "0" ? "" : val.location_id, [
          Validators.required
        ]),
        location_tag_id: new FormControl(
          option == "0" ? "" : val.location_tag_id,
          [Validators.required]
        ),
        location_tag_name: new FormControl(
          option == "0" ? "" : val.location_tags[0].location_tag,
          [Validators.required]
        ),
        quantity: new FormControl(option == "0" ? "" : val.updated_quantity, [
          Validators.required,
          Validators.pattern(this.constant.AMOUNT_PATTERN)
        ]),
        // purchase_price: new FormControl(
        //   option == "0" ? "" : val.purchase_price,
        //   [
        //     Validators.required,
        //     Validators.pattern(this.constant.AMOUNT_PATTERN)
        //   ]
        // ),
        // sales_price: new FormControl(option == "0" ? "" : val.sales_price, [
        //   Validators.required,
        //   Validators.pattern(this.constant.AMOUNT_PATTERN)
        // ]),
        locationTagList: new FormControl([]),
        filteredLocation: new FormControl(new Observable<string[]>()),
        filteredLocationTag: new FormControl(new Observable<string[]>()),
        created_at: new FormControl(
          this.util.unixTimestampToLocalDate(val.created_at_unix).localDate,
          []
        )
      })
    );

    this.setObservable(this.locations.length - 1);
  }
  removeLocation(position, location): void {
    try {
      console.log(
        "this.totalQuantity = ",
        this.pageData.selectedMaterial.totalQuantity
      );
      let locRemoved = this.locations.value.splice(position, 1);
      if (locRemoved.length > 0) {
        this.locations.removeAt(position);
      }
      if(location.value.location_tag_name !== ""  && location.value.prod_loc_id !== null) {

      this.removedLocation.push(locRemoved[0]);
      // this.util.removeCommas(this.totalQuantity);
    }else{
      console.log('in else = ', "removeLoc array not updated");

    }
      if (
        this.constant.AMOUNT_PATTERN.test(
          this.pageData.selectedMaterial.totalQuantity
        )
      ) {
        this.pageData.selectedMaterial.remainingQuantity = parseFloat(
          this.pageData.selectedMaterial.totalQuantity
        ).toFixed(2);
        // alert('in if');
        // this.pageData.selectedMaterial.remainingQuantity.setValue(
        //   parseFloat(this.pageData.selectedMaterial.totalQuantity.value).toFixed(2)
        // );
        let total: number = 0;
        for (let i = 0; i < this.locations.length; i++) {
          this.util.removeCommas(this.locations.at(i).get("quantity"));
          if (
            this.constant.AMOUNT_PATTERN.test(
              this.locations.at(i).get("quantity").value
            )
          ) {
            total += parseFloat(this.locations.at(i).get("quantity").value);
          }
        }
        this.pageData.selectedMaterial.remainingQuantity = (
          parseFloat(this.pageData.selectedMaterial.totalQuantity) - total
        ).toFixed(2);
        // this.remainingQuantity.setValue(
        //   (parseFloat(this.totalQuantity.value) - total).toFixed(2)
        // );
        console.log("this.locations = ", this.locations);
        console.log("removed locations = ");

      }

    } catch (err) {
      this.global.addException("Add Material", "removeLocation()", err);
    }
  }
  calculateRemainingQuantity(): void {
    try {
      // this.util.removeCommas(this.totalQuantity);
      if (
        this.constant.AMOUNT_PATTERN.test(
          this.pageData.selectedMaterial.totalQuantity
        )
      ) {
        this.pageData.selectedMaterial.remainingQuantity = parseFloat(
          this.pageData.selectedMaterial.totalQuantity
        ).toFixed(2);
        // alert('in if');
        // this.pageData.selectedMaterial.remainingQuantity.setValue(
        //   parseFloat(this.pageData.selectedMaterial.totalQuantity.value).toFixed(2)
        // );
        let total: number = 0;
        for (let i = 0; i < this.locations.length; i++) {
          this.util.removeCommas(this.locations.at(i).get("quantity"));
          if (
            this.constant.AMOUNT_PATTERN.test(
              this.locations.at(i).get("quantity").value
            )
          ) {
            total += parseFloat(this.locations.at(i).get("quantity").value);
          }
        }
        this.pageData.selectedMaterial.remainingQuantity = (
          parseFloat(this.pageData.selectedMaterial.totalQuantity) - total
        ).toFixed(2);
        // this.remainingQuantity.setValue(
        //   (parseFloat(this.totalQuantity.value) - total).toFixed(2)
        // );
      }
    } catch (err) {
      this.global.addException("Add Material", "removeLocation()", err);
    }
  }
  setObservable(index): void {
    try {
      this.locations
        .at(index)
        .get("filteredLocation")
        .setValue(
          this.locations
            .at(index)
            .get("location_name")
            .valueChanges.pipe(
              startWith(""),
              map(value => this.locationFilter(value))
            )
        );
      this.locations
        .at(index)
        .get("filteredLocationTag")
        .setValue(
          this.locations
            .at(index)
            .get("location_tag_name")
            .valueChanges.pipe(
              startWith(""),
              map(value => this.locationTagFilter(value, index))
            )
        );
    } catch (err) {
      this.global.addException("Material list", "setObservable()", err);
    }
  }

  // ================   LOCATION  ===================== //
  getLocationList(): void {
    try {
      var self = this;
      this.http.doGet("location/list", function(error: boolean, response: any) {
        if (error) {
          console.log("error", response);
        } else {
          self.pageData.locationList = response.data;
        }
      });
    } catch (err) {
      this.global.addException("Material list", "getLocationList()", err);
    }
  }
  getLocation(location, event: any = false, index): void {
    try {
      event
        ? event.isUserInput
          ? (this.locations
              .at(index)
              .get("location_id")
              .setValue(location.location_id),
            this.getLocationTagList(index, location.location_id))
          : ""
        : (this.locations
            .at(index)
            .get("location_id")
            .setValue(location.location_id),
          this.getLocationTagList(index, location.location_id));
      this.locations
        .at(index)
        .get("location_tag_id")
        .setValue("");
      this.locations
        .at(index)
        .get("location_tag_name")
        .setValue("");
    } catch (err) {
      this.global.addException("Material list", "getLocation()", err);
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
      this.global.addException("Material list", "locationFilter()", err);
    }
  }
  public validateLocation(event: any, item: any, index) {
    try {
      let location = event.target.value;
      if (location == "") {
        item.get("location_id").setValue("");
        this.locations
          .at(index)
          .get("location_tag_id")
          .setValue("");
        this.locations
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
        this.locations
          .at(index)
          .get("location_tag_id")
          .setValue("");
        this.locations
          .at(index)
          .get("location_tag_name")
          .setValue("");
      } else {
        item.get("location_id").setValue("");
      }
    } catch (err) {
      this.global.addException("Material list", "validateLocation()", err);
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
      this.http.doGet("location/tag/" + locId, function(
        error: boolean,
        response: any
      ) {
        if (error) {
          console.log("error", response);
        } else {
          self.locations
            .at(index)
            .get("locationTagList")
            .setValue(response.tags ? response.tags : []);
          self.locations
            .at(index)
            .get("filteredLocationTag")
            .setValue(
              self.locations
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
      this.global.addException("Material list", "getLocationTagList()", err);
    }
  }

  getLocationTag(tag, event: any = false, index): void {
    try {
      event
        ? event.isUserInput
          ? this.getTagDetails(tag, index)
          : ""
        : this.getTagDetails(tag, index);
    } catch (err) {
      this.global.addException("Material list", "getLocationTag()", err);
    }
  }
  getTagDetails(tag, index): void {
    try {
      this.locations
        .at(index)
        .get("location_tag_id")
        .setValue(tag.location_tag_id);
      this.locations
        .at(index)
        .get("location_tag_name")
        .setValue(tag.location_tag);
    } catch (err) {
      this.global.addException("Material list", "getTagDetails()", err);
    }
  }

  private locationTagFilter(value: string, index): string[] {
    try {
      return this.locations
        .at(index)
        .get("locationTagList")
        .value.filter(option =>
          option.location_tag
            .toLowerCase()
            .includes(value ? value.toLowerCase() : "")
        );
    } catch (err) {
      this.global.addException("Material list", "locationTagFilter()", err);
    }
  }
  public validateLocationTag(event: any, item: any, index) {
    try {
      let locTag = event.target.value;
      let match = this.locations
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
      this.global.addException("Material list", "validateLocationTag()", err);
    }
  }
  // ================  END LOCATION TAG  ===================== //

  updateLocationDetails(form: FormGroup) {
    try {
      let self = this;
      let reqObj = {
        material_id: self.pageData.selectedMaterial.material_id,
        updated_quantity : self.pageData.selectedMaterial.totalQuantity,
        locations: []
      };
      let totalQuantity: number = 0;
      self.pageData.submitted = true;
      self.pageData.isError = false;
      console.log("form.value", form.value);
      if (form.valid) {
        if (this.pageData.selectedMaterial.remainingQuantity != 0) {
          this.pageData.isError = true;
          this.pageData.errMsg =
            "Total material quantity(sum of all location quantity) should match with quantity.";
          return;
        }
        // alert(this.removedLocation.length);
        if (this.removedLocation && this.removedLocation.length > 0) {
          for (let i = 0; i < this.removedLocation.length; i++) {
            console.log("removed = ", this.removedLocation[i]);
            // form.value.locations.push(this.removedLocation[i]);

          let rmObj =   {
            material_location_id: this.removedLocation[i].material_location_id,
              location_tag_id: this.removedLocation[i].location_tag_id,
              // location_name: this.removedLocation[i].location_name,
              quantity: this.removedLocation[i].quantity,
              isDelete: 1
            }
            reqObj.locations.push(rmObj);
          }
        }
        console.log("locationsss=", form.value.locations);
        for (let i = 0; i < form.value.locations.length; i++) {
          totalQuantity =
            totalQuantity + parseFloat(form.value.locations[i].quantity);
          reqObj.locations.push({
            material_location_id: form.value.locations[i].material_location_id,
            location_tag_id: form.value.locations[i].location_tag_id,
              // location_name: this.removedLocation[i].location_name,

            quantity: form.value.locations[i].quantity,
            isDelete: 0
          });
        }
        console.log('reqObj.locations = ', JSON.stringify(reqObj));

        self.util.addSpinner("update-loc-btn", "Update");
        this.http.doPost("material/update/location", reqObj, function(
          error: boolean,
          response: any
        ) {
          self.util.removeSpinner("update-loc-btn", "Update");
          if (error) {
            self.pageData.isError = true;
            self.pageData.errMsg = response.message;
          } else {
            self.pageData.backup = JSON.parse(
              JSON.stringify(self.pageData.selectedMaterial)
            );
            self.pageData.backup.totalQuantity = self.pageData.selectedMaterial.totalQuantity = totalQuantity;
            self.getMaterialList("REFRESH");
            self.cancelEdit();
            self.removedLocation = [];

          }
        });
      }
    } catch (err) {
      this.global.addException("Material list", "updateLocationDetails()", err);
    }
  }

  showDetails(option) {
    this.pageData.materialDetails = option;
  }
  changeAction(action) {
    this.pageData.action = action;
  }
  cancelEdit() {
    try {
    this.removedLocation=[];

      this.pageData.selectedMaterial = JSON.parse(
        JSON.stringify(this.pageData.backup)
      );
      this.createLocationForm(this.pageData.selectedMaterial.location);
      this.pageData.action = "";
    } catch (err) {
      this.global.addException("Material list", "cancelEdit()", err);
    }
  }
  showDeleteDialog() {
    let data: any = {
      API_URL: "invmaterial/delete",
      reqObj: {
        material_id: this.pageData.selectedMaterial.material_id
      },
      event: {
        source: "MATERIAL",
        action: "DELETE"
      }
    };
    this.util.showDialog(
      DialogComponent,
      "Are you sure you want to delete " + //@ Shahebaz - Start
      this.pageData.selectedMaterial.short_name + //@ Shahebaz - End
        " ?",
      [],
      "Delete Confirmation ?",
      "CONFIRMATION",
      data
    );
  }
  generatepdf() {
    this.file.generatePortraitpdf(
      "material-tbl",
      "Material List",
      "material_list"
    );
  }
  generatecsv() {
    this.file.generatecsv("material-tbl", "material_list");
  }

  addNewDoc() {
    try {
      this.pageData.selectedMaterial.inventoryId = this.pageData.selectedMaterial.material_id;
      this.pageData.selectedMaterial.inventoryType = "material";
      this.dialog.open(InventoryDialog, {
        data: {
          action: "UPLOAD_MATERIAL_DOC",
          assetInfo: this.pageData.selectedMaterial
        }
      });
    } catch (err) {
      this.global.addException("Material list", "addNewDoc()", err);
    }
  }

  showImage(url) {
    try {
      this.dialog.open(DialogComponent, {
        data: { action: "image", url: url }
      });
      this.ref.tick();
    } catch (err) {
      this.global.addException("Material list", "showImage()", err);
    }
  }
}
