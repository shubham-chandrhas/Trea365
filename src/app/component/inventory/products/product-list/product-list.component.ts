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
import { AppConfig, APP_CONFIG } from "../../../../app-config.module";
import { UtilService } from "../../../../shared/service/util.service";
import { ExportService } from "../../../../shared/service/export.service";
import { HttpService } from "../../../../shared/service/http.service";
import { ConstantsService } from "../../../../shared/service/constants.service";
import { DialogComponent } from "../../../../shared/model/dialog/dialog.component";
import { InventoryDialog } from "../../inventory-dialog.component";
import { GlobalService } from "../../../../shared/service/global.service";
import { OnboardingGuideDialogComponent } from "../../../onboarding/onboarding-guide/onboarding-guide.component";

@Component({
  selector: "app-product-list",
  templateUrl: "./product-list.component.html",
  styleUrls: ["./product-list.component.css"]
})
export class ProductListComponent implements OnInit {
  pageData: any = {
    productList: [],
    listCount: 0,
    imageCount: 0,
    sortColumn: "prod_id",
    sortOrder: "DSC",
    sortColumnType: "N",
    prodDetails: "details",
    action: "",
    isEdit: false,
    isError: false,
    submitted: false
  };
  searchList;
  searchTxt;
  editProductForm: FormGroup;
  permissionsSet: any;
  removedLocation: any = [];
  deletedLoc: string = "0";
  public onBoarding:boolean = false;
  constructor(
    @Inject(APP_CONFIG)
    private config: AppConfig,
    public dialog: MatDialog,
    public util: UtilService,
    public router: Router,
    private http: HttpService,
    private file: ExportService,
    private fb: FormBuilder,
    public constant: ConstantsService,
    private ref: ApplicationRef,
    private route: ActivatedRoute,
    private location: Location,
    private global: GlobalService
  ) {}

  ngOnInit() {
    let self = this;
    this.router.url.split("/")[2] == "csa-onboarding"
      ? this.util.menuChange({ menu: "guide", subMenu: "" })
      : this.util.menuChange({ menu: 3, subMenu: 19 });
    this.pageData.paginationKey = {
      itemsPerPage: this.constant.ITEMS_PER_PAGE,
      currentPage: this.constant.CURRENT_PAGE
    };
    this.util.setWindowHeight();
    this.util.setPageTitle(this.route);
    this.getProductList();
    this.getLocationList();
    this.permissionsSet = this.util.getModulePermission(51);
    this.util.changeDetection.subscribe(dataObj => {
      if (dataObj && dataObj.source == "PRODUCT") {
        self.getProductList();
        self.pageData.selectedProduct = null;
        self.pageData.selectedIndex = null;
        self.pageData.searchTxt = self.pageData.searchList = "";
      }
      if (dataObj && dataObj.source == "UPLOAD_PRODUCT_DOC") {
        self.pageData.selectedProduct = dataObj.data;
        self.getProductList();
        //console.log("Uploaded",self.pageData.selectedProduct);
      }
    });
  }

  getProductList(origin: string = "INIT") {
    try {
      let self = this;
      this.util.showProcessing("processing-spinner");
      this.http.doGet("invproductslist", function(
        error: boolean,
        response: any
      ) {
        self.util.hideProcessing("processing-spinner");
        if (error) {
          console.log(response.data);
        } else {
          self.pageData.productList = [];
          for (let i = 0; i < response.data.length; i++) {
            //for (let j = 0; j < response.data[i].location.length; j++) {
            let locationArr: any[] = [];
            let poDetailsArray = []
            response.data[i].inv_products.map(function(loc) {


                poDetailsArray.push({
                  "created_at":loc.created_at,
                  "purchase_order_no": loc.po_order !== '' ? loc.po_order.purchase_order_no : 'N/A',
                  "purchase_order_id": loc.po_order !== '' ? loc.po_order.purchase_order_id : 'N/A',
                  "supplier_name": loc.supplier_name.supplier_name,
                  "purchase_price": loc.purchase_price,
                  "sales_price": loc.sales_price,
                  "product_updated_quantity":loc.product_updated_quantity
                })



              loc.location.map(function(locTag) {
                locTag.purchase_price = loc.purchase_price;
                locTag.sales_price = loc.sales_price;
                locationArr.push(locTag);
              });
            });
            console.log('po-number = ',poDetailsArray);
            self.getLocationCount(locationArr);
            if (response.data[i].inv_products.length > 0) {
              console.log("priceeee==", response.data[i]);
              self.pageData.productList.push({
                prod_id: response.data[i].inv_products[0].prod_id,
                manf_part_id: response.data[i].manf_part_id,
                supplier_name:
                  response.data[i].inv_products[0].supplier_name.supplier_name,
                manufacturer_name: response.data[i].manufacturer_name.manf_name,
                manufacturer_part_name: response.data[i].full_name,
                comment: response.data[i].inv_products[0].comment,
                location_tag_name:
                  response.data[i].inv_products[0].location[0].location_tag_name
                    .location_name.location_name +
                  (locationArr.length > 1
                    ? " (+" + (self.getLocationCount(locationArr) - 1) + ")"
                    : ""),
                scan_code: response.data[i].upc,
                short_name: response.data[i].short_name,
                class_name: response.data[i].class_name.item_class_name,
                upc: response.data[i].upc,
                manuf_part_image: response.data[i].manuf_parts_thumbnail_images
                  ? response.data[i].manuf_parts_thumbnail_images.image_path
                  : "",
                quantity: response.data[i].updated_quantity,
                remainingQuantity: response.data[i].updated_quantity,
                uom: response.data[i].uom_name.uom_name,
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
                  response.data[i].inv_products[0].product_attachments,
                  manufacturer_id : response.data[i].manf_id,
                  class_id: response.data[i].class_id,
                  poDetails: poDetailsArray

              });
            }
            //}
          }

          if(self.pageData.productList.length == 0) {
            self.onBoarding = true;
          }

          if (origin == "REFRESH" || self.pageData.selectedProduct) {
            self.selectProduct(
              self.pageData.productList.filter(
                item => item.prod_id == self.pageData.selectedProduct.prod_id
              )[0]
            );
          }

          self.route.snapshot.paramMap.get("id") != "0"
            ? self.showProductDetails()
            : "";
          console.log("productsssssssssss=", self.pageData.productList);
        }
        //console.log(self.pageData.productList);
      });
    } catch (err) {
      this.global.addException("Add product", "getProductList()", err);
    }
  }

  getLocationCount(locationList) {
    try {
      let list = locationList.reduce(
        (x, y) =>
          x.findIndex(
            e =>
              e.location_tag_name.location_tag_id ==
              y.location_tag_name.location_tag_id
          ) < 0
            ? [...x, y]
            : x,
        []
      );
      return list.length;
    } catch (err) {
      this.global.addException("Product list", "getLocationCount()", err);
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

  addNewProduct() {
    // this.router.navigate(["/inventory/csa/add-product"]);
    try {
      sessionStorage.removeItem("productInfo");
      this.router.url.split("/")[2] == "csa"
        ? this.router.navigate(["/inventory/csa/add-product"])
        : this.router.navigate(["/inventory/csa-onboarding/add-product"]);
    } catch (err) {
      this.global.addException("Product list", "addNewProduct()", err);
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
      this.global.addException("Product list", "create2DList()", err);
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
          comLoc.prod_loc_id != loc.prod_loc_id
        ) {
          comLoc.updated_quantity =
            parseFloat(comLoc.updated_quantity) +
            parseFloat(loc.updated_quantity);
        }
      });
    });

    return combinedLocations;
  }

  showProductDetails(): void {
    try {
      let sortedList: any[] = _.sortBy(
        this.pageData.productList,
        "prod_id"
      ).reverse();
      for (var i = 0; i < sortedList.length; ++i) {
        if (
          this.route.snapshot.paramMap.get("id") == sortedList[i].manf_part_id
        ) {
          this.selectProduct(sortedList[i]);
          this.pageData.selectedIndex = i;
          break;
        }
      }
    } catch (err) {
      this.global.addException("Product list", "showProductDetails()", err);
    }
  }

  selectProduct(product) {
    console.log("product = ", product);
    try {
      var self = this;
      this.pageData.prodDetails = "details";
      this.pageData.selectedProduct = product;
      this.createLocationForm(this.pageData.selectedProduct.location);

      this.pageData.selectedProduct.totalQuantity = 0;
      this.pageData.selectedProduct.remainingQuantity = 0;
      for (let i = 0; i < product.location.length; i++) {
        this.pageData.selectedProduct.totalQuantity =
          parseFloat(this.pageData.selectedProduct.totalQuantity) +
          parseFloat(product.location[i].updated_quantity);
        this.pageData.selectedProduct.remainingQuantity = parseFloat(
          this.pageData.selectedProduct.remainingQuantity
        );
      }
      this.pageData.backup = JSON.parse(
        JSON.stringify(this.pageData.selectedProduct)
      );
      //console.log(JSON.stringify(this.pageData.selectedProduct));
      this.location.go("/inventory/csa/product-list/" + product.manf_part_id);
      setTimeout(function() {
        self.util.scrollDown("prodMark");
      }, 1000);
    } catch (err) {
      this.global.addException("Product list", "selectProduct()", err);
    }
  }
  get totalQuantity() {
    return this.locations.get("quantity");
  }

  removeLocation(position, location): void {
console.log('location in remove == ', location.value);

    try {
      console.log(
        "this.totalQuantity = ",
        this.pageData.selectedProduct.totalQuantity
      );
      let locRemoved = this.locations.value.splice(position, 1);
      if (locRemoved.length > 0) {
        this.locations.removeAt(position);
      }
      if(location.value.location_tag_name !== ""  && location.value.prod_loc_id !== null) {
        console.log('in if');
        this.removedLocation.push(locRemoved[0]);
      } else{
        console.log('in else');

      }
        // this.util.removeCommas(this.totalQuantity);
        if (
          this.constant.AMOUNT_PATTERN.test(
            this.pageData.selectedProduct.totalQuantity
          )
        ) {
          this.pageData.selectedProduct.remainingQuantity = parseFloat(
            this.pageData.selectedProduct.totalQuantity
          ).toFixed(2);
          // alert('in if');
          // this.pageData.selectedProduct.remainingQuantity.setValue(
          //   parseFloat(this.pageData.selectedProduct.totalQuantity.value).toFixed(2)
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
          this.pageData.selectedProduct.remainingQuantity = (
            parseFloat(this.pageData.selectedProduct.totalQuantity) - total
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
  calculateRemainingQuantity(position, location): void {
    try {
      // this.util.removeCommas(this.totalQuantity);
      if (
        this.constant.AMOUNT_PATTERN.test(
          this.pageData.selectedProduct.totalQuantity
        )
      ) {
        this.pageData.selectedProduct.remainingQuantity = parseFloat(
          this.pageData.selectedProduct.totalQuantity
        ).toFixed(2);
        // alert('in if');
        // this.pageData.selectedProduct.remainingQuantity.setValue(
        //   parseFloat(this.pageData.selectedProduct.totalQuantity.value).toFixed(2)
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
        this.pageData.selectedProduct.remainingQuantity = (
          parseFloat(this.pageData.selectedProduct.totalQuantity) - total
        ).toFixed(2);
        // this.remainingQuantity.setValue(
        //   (parseFloat(this.totalQuantity.value) - total).toFixed(2)
        // );
      }
    } catch (err) {
      this.global.addException("Add Material", "removeLocation()", err);
    }
  }

  updateProductDetails() {
    try {
      let self = this;
      self.util.addSpinner("prod-update-btn", "Update");
      this.http.doPost(
        "product/updateDetail",
        {
          prod_id: self.pageData.selectedProduct.prod_id,
          comment: self.pageData.selectedProduct.comment
        },
        function(error: boolean, response: any) {
          self.util.removeSpinner("prod-update-btn", "Update");
          if (error) {
            self.pageData.isError = true;
            self.pageData.errMsg = response.message;
          } else {
            self.pageData.backup.comment =
              self.pageData.selectedProduct.comment;
            self.getProductList();
            self.cancelEdit();
          }
        }
      );
    } catch (err) {
      this.global.addException("Product list", "updateProductDetails()", err);
    }
  }

  createLocationForm(locDetails): void {
    try {
      this.editProductForm = this.fb.group({
        locations: this.fb.array([])
      });
      for (var i = 0; i < locDetails.length; ++i) {
        this.addLocation("1", locDetails[i]);
        this.getLocationTagList(i, locDetails[i].location_tag_name.location_id);
      }
    } catch (err) {
      this.global.addException("Product list", "createLocationForm()", err);
    }
  }

  get locations(): FormArray {
    return (<FormArray>this.editProductForm.get("locations")) as FormArray;
  }

  addLocation(option, val: any = {}): void {
    console.log("val =", val);
    try {
      this.locations.push(
        this.fb.group({
          prod_loc_id: new FormControl(val.prod_loc_id),
          location_name: new FormControl(
            option == "0"
              ? ""
              : val.location_tag_name.location_name.location_name
          ),
          location_id: new FormControl(
            option == "0" ? "" : val.location_tag_name.location_id,
            [Validators.required]
          ),
          location_tag_id: new FormControl(
            option == "0" ? "" : val.location_tag_name.location_tag_id,
            [Validators.required]
          ),
          location_tag_name: new FormControl(
            option == "0" ? "" : val.location_tag_name.location_tag,
            [Validators.required]
          ),
          quantity: new FormControl(option == "0" ? "" : val.updated_quantity, [
            Validators.required,
            Validators.pattern(this.constant.AMOUNT_PATTERN)
          ]),
          purchase_price: new FormControl(
            option == "0" ? "" : val.purchase_price,
            [

            ]
          ),
          sales_price: new FormControl(option == "0" ? "" : val.sales_price, [

          ]),
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
    } catch (err) {
      this.global.addException("Product list", "addLocation()", err);
    }
  }

  setObservable(index): void {
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
      this.global.addException("Product list", "getLocationList()", err);
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
      this.global.addException("Product list", "locationFilter()", err);
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
      this.global.addException("Product list", "validateLocation()", err);
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
      this.global.addException("Product list", "getLocationTagList()", err);
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
      this.global.addException("Product list", "getLocationTag()", err);
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
      this.global.addException("Product list", "getTagDetails()", err);
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
      this.global.addException("Product list", "locationTagFilter()", err);
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
      this.global.addException("Product list", "validateLocationTag()", err);
    }
  }
  // ================  END LOCATION TAG  ===================== //

  updateLocationDetails(form: FormGroup) {
    var flag="";
    try {
      let self = this;
      let reqObj = {
        updated_quantity : self.pageData.selectedProduct.totalQuantity,
        prod_id: self.pageData.selectedProduct.prod_id,
        locations: []
      };
      let totalQuantity: any = 0;
      self.pageData.submitted = true;
      self.pageData.isError = false;
      if (form.valid) {
        if (this.pageData.selectedProduct.remainingQuantity != 0) {
          this.pageData.isError = true;
          this.pageData.errMsg =
            "Total product quantity(sum of all location quantity) should match with quantity.";
          return;
        }
        console.log(this.removedLocation.length);
        if (this.removedLocation && this.removedLocation.length > 0) {
          for (let i = 0; i < this.removedLocation.length; i++) {
            console.log("removed = ", this.removedLocation[i]);
            // form.value.locations.push(this.removedLocation[i]);

          let rmObj =   {
              prod_loc_id: this.removedLocation[i].prod_loc_id,
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
            parseFloat(totalQuantity) +
            parseFloat(form.value.locations[i].quantity);
          reqObj.locations.push({
            prod_loc_id: form.value.locations[i].prod_loc_id,
            location_tag_id: form.value.locations[i].location_tag_id,
            // location_name: form.value.locations[i].location_name,
            quantity: form.value.locations[i].quantity,
            isDelete: 0
          });
        }
        console.log('reqObj.locations = ', JSON.stringify(reqObj));

        self.util.addSpinner("update-loc-btn", "Update");
        this.http.doPost("product/update/location", reqObj, function(
          error: boolean,
          response: any
        ) {
          self.util.removeSpinner("update-loc-btn", "Update");
          if (error) {
            self.pageData.isError = true;
            self.pageData.errMsg = response.message;
          } else {
            self.pageData.backup = JSON.parse(
              JSON.stringify(self.pageData.selectedProduct)
            );
            self.pageData.backup.totalQuantity = self.pageData.selectedProduct.totalQuantity = totalQuantity;
            self.getProductList("REFRESH");
            self.cancelEdit();
            self.removedLocation = [];
          }
        });
      } else{
        console.log('error');
      }
    } catch (err) {
      this.global.addException("Product list", "updateLocationDetails()", err);
    }
  }

  showDetails(option) {
    this.pageData.prodDetails = option;
  }
  changeAction(action) {
    this.pageData.action = action;
  }
  cancelEdit() {
    try {
    this.removedLocation=[];

      this.pageData.selectedProduct = JSON.parse(
        JSON.stringify(this.pageData.backup)
      );
      this.createLocationForm(this.pageData.selectedProduct.location);
      this.pageData.action = "";
    } catch (err) {
      this.global.addException("Product list", "cancelEdit()", err);
    }
  }
  showDeleteDialog() {
    let data: any = {
      API_URL: "product/delete",
      reqObj: {
        prod_id: this.pageData.selectedProduct.prod_id
      },
      event: {
        source: "PRODUCT",
        action: "DELETE"
      }
    };
    this.util.showDialog(
      DialogComponent,
      "Are you sure you want to delete " + //@ Shahebaz - Start
      this.pageData.selectedProduct.short_name + //@ Shahebaz - End
        " ?",
      [],
      "Delete Confirmation ?",
      "CONFIRMATION",
      data
    );
  }
  generatepdf() {
    this.file.generatePortraitpdf(
      "product-tbl",
      "Product List",
      "product_list"
    );
  }
  generatecsv() {
    this.file.generatecsv("product-tbl", "product_list");
  }

  addNewDoc() {
    try {
      this.pageData.selectedProduct.inventoryId = this.pageData.selectedProduct.prod_id;
      this.pageData.selectedProduct.inventoryType = "product";
      this.dialog.open(InventoryDialog, {
        data: {
          action: "UPLOAD_PRODUCT_DOC",
          assetInfo: this.pageData.selectedProduct
        }
      });
      //this.ref.tick();
    } catch (err) {
      this.global.addException("Product list", "addNewDoc()", err);
    }
  }

  showImage(url) {
    try {
      this.dialog.open(DialogComponent, {
        data: { action: "image", url: url }
      });
      this.ref.tick();
    } catch (err) {
      this.global.addException("Product list", "showImage()", err);
    }
  }

  addFromCSV() {
    let route: string,
      apiEndPoint: string,
      csvTemplateUrl: string,
      redirectUrl: string;
    route = "/csa-onboarding/csv-preview/product";
    apiEndPoint = "product/csv";
    csvTemplateUrl = this.config.domainIP + "api/download/csv/products.csv";
    redirectUrl = "/inventory/csa/product-list/0";

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
}
