import {
  Component,
  Inject,
  OnInit,
  NgZone,
  ViewChild,
  ElementRef
} from "@angular/core";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";
import { Router, ActivatedRoute } from "@angular/router";
import {
  FormControl,
  FormGroupDirective,
  Validators,
  FormGroup,
  FormBuilder
} from "@angular/forms";
import {
  IMultiSelectOption,
  IMultiSelectSettings,
  IMultiSelectTexts
} from "angular-2-dropdown-multiselect";
import { MapsAPILoader } from "@agm/core";
import { Location } from "@angular/common";
import { Subscription } from "rxjs";
import * as _ from "underscore";

import { UtilService } from "../../../service/util.service";
import { HttpService } from "../../../service/http.service";
import { ConstantsService } from "../../../service/constants.service";
import { DialogComponent } from "../../../model/dialog/dialog.component";
import { GlobalService } from "../../../service/global.service";
import { OnboardingGuideDialogComponent } from "../../../../component/onboarding/onboarding-guide/onboarding-guide.component";
import { AppConfig, APP_CONFIG } from "../../../../app-config.module";
declare var $: any;

@Component({
  selector: "app-supplier-list",
  templateUrl: "./supplier-list.component.html",
  styleUrls: ["./supplier-list.component.css"]
})
export class SupplierListComponent implements OnInit {
  public errMsg: string;
  public isError: boolean = false;
  public supplierDetails: string = "details";
  public selectedSupplier: any;
  public isEdit: boolean = false;
  public sortColumn: string = "supplier_id";
  public sortColumnType: string = "N";
  public sortOrder = "DSC";
  public paginationKey: any;
  public listCount: number = 0;
  public selectedIndex;
  public searchTxt;
  public searchList;
  nameSearch;
  addressSearch;
  typeSearch;
  phoneSearch;
  emailSearch;
  mulSelSettings: IMultiSelectSettings = { displayAllSelectedText: true };
  supplierTypeList: IMultiSelectOption[] = [];
  selectText: IMultiSelectTexts = { defaultTitle: "" };

  public searchSupIdTxt;
  public searchSupIdList;
  public sortColumnSupId: string = "purchase_order_no";
  public sortColumnSupType: string = "A";
  public sortOrderSupId = "ASC";
  POnoSearch;
  dateSearch;
  generatedBySearch;
  permissionsSet: any;
  public onBoarding:boolean = false; 

  editSupplierFrm: FormGroup;
  subscription: Subscription;
  public supplierList: any = [];
  public supplierListById: any = [];
  public suppliertypeList: any[];
  public countries: any = [];
  public stateList: any = [];
  public cityList: any = [];
  public loggedInUser: any;

  @ViewChild("search")
  public searchElementRef: ElementRef;

  constructor(
    @Inject(APP_CONFIG)
    private config: AppConfig,
    public util: UtilService,
    public constant: ConstantsService,
    private http: HttpService,
    private fb: FormBuilder,
    public dialog: MatDialog,
    private router: Router,
    private route: ActivatedRoute,
    private mapsAPILoader: MapsAPILoader,
    private ngZone: NgZone,
    private location: Location,
    public global: GlobalService
  ) {
    this.util.changeEvent(null);
  }

  ngOnInit() {
    let self = this;
    this.util.showProcessing("processing-spinner");
    this.util.setWindowHeight();
    this.util.setPageTitle(this.route);
    this.permissionsSet = this.util.getModulePermission(38);
    if (this.router.url.split("/")[2] == "csa-onboarding") {
      this.util.menuChange({ menu: "guide", subMenu: "" }); //for onboarding dashboard
    } else {
      this.util.menuChange({ menu: 2, subMenu: 16 });
    }
    this.paginationKey = {
      itemsPerPage: this.constant.ITEMS_PER_PAGE,
      currentPage: this.constant.CURRENT_PAGE
    };
    this.getSupplierTypes();
    this.getSupplierList();

    this.loggedInUser = JSON.parse(
      JSON.stringify(localStorage.getItem("USER"))
    );
    console.log("loggedInUser", this.loggedInUser);
    this.subscription = this.util.changeDetection.subscribe(dataObj => {
      if (dataObj && dataObj.source == "SUPPLIER") {
        self.getSupplierList("REFRESH");
        self.selectedSupplier = null;
        self.selectedIndex = null;
        self.searchTxt = self.searchList = "";
      }
      if (dataObj && dataObj.source == "SUPPLIER_EDIT") {
        self.getSupplierList("REFRESH");
        self.searchTxt = self.searchList = "";
        //self.getSelectedSupplier(dataObj.data, self.selectedIndex);
        self.selectedSupplier = dataObj.data;
        self.selectedSupplier.typeArray = self.selectedSupplier.supplier_types.map(
          type => type.supplier_type_id
        );
      }
    });
    this.editSupplierForm();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
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
  sortList(columnName: string) {
    this.sortColumn = columnName;
    if (this.sortColumn === columnName) {
      if (this.sortOrder === "ASC") this.sortOrder = "DSC";
      else this.sortOrder = "ASC";
    } else {
      this.sortOrder = "ASC";
    }
  }

  countryChange(selCountry) {
    try {
      this.editSupplierFrm.get("provinceId").setValue("");
      this.editSupplierFrm.get("cityId").setValue("");
      //this.getProviences(selCountry);
    } catch (err) {
      this.global.addException("Supplier list", "countryChange()", err);
    }
  }

  getSupplierTypes() {
    try {
      var self = this;
      this.http.doGet("getCommonStatus/SUPPLIER_TYPE", function(
        error: boolean,
        response: any
      ) {
        if (error) {
          console.log(error);
        } else {
          self.suppliertypeList = [];
          self.suppliertypeList = response.data.statusList;
          self.supplierTypeList = self.suppliertypeList.filter(
            item => ((item.id = item.type_id), (item.name = item.status))
          );
          console.log("suppliertypeList", self.suppliertypeList);
          // self.setSupplierTypeList();
        }
      });
    } catch (err) {
      this.global.addException("Supplier list", "getSupplierTypes()", err);
    }
  }

  getSupplierList(option: string = "INIT") {
    try {
      var self = this;
      this.http.doGet("suppliers", function(error: boolean, response: any) {
        self.util.hideProcessing("processing-spinner");
        if (error) {
          console.log("error", response);
        } else {
          if (response.data) {
            self.supplierList = [];
            for (let i = 0; i < response.data.length; i++) {
              self.supplierList = self.supplierList.concat(
                response.data[i].suppliers
              );
            }
            self.supplierList.map(supplier => {
              supplier.supplier_type =
                supplier.supplier_type +
                (supplier.supplier_types.length > 1
                  ? " (+" + (supplier.supplier_types.length - 1) + ")"
                  : "");
              supplier.typeArray = supplier.supplier_types.map(
                type => type.supplier_type_id
              );
            });
            self.supplierList = self.supplierList.reduce(
              (x, y) =>
                x.findIndex(e => e.supplier_id == y.supplier_id) < 0
                  ? [...x, y]
                  : x,
              []
            );
            if(self.supplierList.length == 0) {
                self.onBoarding = true;
              }
            self.route.snapshot.paramMap.get("id") != "0" && option == "INIT"
              ? self.showSupplierDetails()
              : "";
          }
        }
      });
    } catch (err) {
      this.global.addException("Supplier list", "getSupplierList()", err);
    }
  }

  showSupplierDetails() {
    try {
      let sortedList: any[] = _.sortBy(
        this.supplierList,
        "supplier_id"
      ).reverse();
      for (var i = 0; i < sortedList.length; ++i) {
        if (
          this.route.snapshot.paramMap.get("id") == sortedList[i].supplier_id
        ) {
          this.getSelectedSupplier(sortedList[i], i);
          this.selectedIndex = i;
          break;
        }
      }
    } catch (err) {
      this.global.addException("Supplier list", "showSupplierDetails()", err);
    }
  }

  getSelectedSupplier(selSuppObj: any, index: number) {
    try {
      let self = this;
      this.selectedSupplier = selSuppObj;
      this.isEdit = false;
      this.selectedIndex = index;
      console.log(this.selectedSupplier);
      this.getDocListBySupId(this.selectedSupplier.supplier_id);
      this.supplierDetails = "details";
      self.location.go(
        self.location
          .path()
          .split("/")
          .splice(0, self.location.path().split("/").length - 1)
          .join("/") +
          "/" +
          selSuppObj.supplier_id
      );
      setTimeout(function() {
        self.util.scrollDown("supplierMark");
      }, 1000);
    } catch (err) {
      this.global.addException("Supplier list", "getSelectedSupplier()", err);
    }
  }

  newSupplier() {
    try {
      sessionStorage.removeItem("supplierObject");
      if (this.router.url.split("/")[2] == "csa-onboarding") {
        this.router.navigate(["/admin/csa-onboarding/add-supplier"]);
      } else {
        this.router.navigate(["/admin/csa/add-supplier"]);
      }
    } catch (err) {
      this.global.addException("Supplier list", "newSupplier()", err);
    }
  }

  public editSupplierForm(supplierObj: any = {}) {
    this.editSupplierFrm = this.fb.group({
      supplierId: new FormControl(supplierObj.supplier_id),
      supplierType: new FormControl(supplierObj.typeArray, [
        Validators.required
      ]),
      supplierName: new FormControl(supplierObj.supplier_name, [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(this.constant.DEFAULT_TEXT_MAXLENGTH)
      ]),
      address1: new FormControl(supplierObj.address1, [
        // Validators.required,
        Validators.minLength(2)
      ]),
      address2: new FormControl(supplierObj.address2, [
        Validators.minLength(2)
      ]),
      // countryId:new FormControl(supplierObj.country_id, [
      //   Validators.required
      // ]),
      // provinceId:new FormControl(supplierObj.province_name, [
      //   Validators.required
      // ]),
      // cityId:new FormControl(supplierObj.city_name, [
      //   Validators.required,
      // ]),
      // postalCode:new FormControl(supplierObj.postal_code, [
      //   Validators.required,
      //   Validators.minLength(3),
      //   Validators.maxLength(10),
      //   Validators.pattern(this.constant.POSTAL_CODE_PATTERN)
      // ]),
      countryId: new FormControl(
        supplierObj.country_id ? supplierObj.country_id : ""
      ),
      provinceId: new FormControl(
        supplierObj.province_name ? supplierObj.province_name : ""
      ),
      cityId: new FormControl(
        supplierObj.city_name ? supplierObj.city_name : ""
      ),
      postalCode: new FormControl(
        supplierObj.postal_code ? supplierObj.postal_code : ""
      ),
      emailId: new FormControl(supplierObj.email_id),
      phoneNumber: new FormControl(supplierObj.phone_no),
      latitude: new FormControl(""),
      longitude: new FormControl(""),
      comment: new FormControl(supplierObj.comment, [
        Validators.maxLength(this.constant.DEFAULT_COMMENT_MAXLENGTH)
      ])
    });
  }
  get supplierType() {
    return this.editSupplierFrm.get("supplierType");
  }
  get supplierName() {
    return this.editSupplierFrm.get("supplierName");
  }
  get address1() {
    return this.editSupplierFrm.get("address1");
  }
  get address2() {
    return this.editSupplierFrm.get("address2");
  }
  get countryId() {
    return this.editSupplierFrm.get("countryId");
  }
  get provinceId() {
    return this.editSupplierFrm.get("provinceId");
  }
  get cityId() {
    return this.editSupplierFrm.get("cityId");
  }
  get postalCode() {
    return this.editSupplierFrm.get("postalCode");
  }
  get emailId() {
    return this.editSupplierFrm.get("emailId");
  }
  get phoneNumber() {
    return this.editSupplierFrm.get("phoneNumber");
  }
  get comment() {
    return this.editSupplierFrm.get("comment");
  }

  showDetails(option) {
    this.supplierDetails = option;
  }

  getDocListBySupId(id: any) {
    var self = this;
    try {
      this.http.doGet("suppliers/" + id, function(
        error: boolean,
        response: any
      ) {
        if (error) {
          console.log("error", response);
        } else {
          if (response.data) {
            self.supplierListById = [];
            //console.log("Success",response.data);
            self.supplierListById = response.data;
            for (let i = 0; i < self.supplierListById.length; i++) {
              self.supplierListById[i].purchase_order_no =
                self.supplierListById[i].purchase_order_no;
              self.supplierListById[i].genratedBy =
                self.supplierListById[i].first_name +
                " " +
                (self.supplierListById[i].last_name
                  ? self.supplierListById[i].last_name
                  : "");
              self.supplierListById[i].po_date = new Date(
                self.supplierListById[i].purchase_order_date
              ).getTime();
            }
            console.log("Success", self.supplierListById);
          }
        }
      });
    } catch (err) {
      this.global.addException("Supplier list", "getDocListBySupId()", err);
    }
  }
  editSupplier() {
    try {
      this.isEdit = true;
      this.getCountries();
      this.editSupplierForm(this.selectedSupplier);
    } catch (err) {
      this.global.addException("Supplier list", "editSupplier()", err);
    }
  }

  updateSupplier(form: FormGroup) {
    let self = this;
    self.isError = false;
    self.errMsg = "";
    try {
      if (form.valid) {
        self.util.addSpinner("updateSupplier", "Update");
        this.http.doPost("suppliers/edit", form.value, function(
          error: boolean,
          response: any
        ) {
          self.util.removeSpinner("updateSupplier", "Update");
          if (error) {
            self.isError = true;
            self.errMsg = response.message;
          } else {
            self.isEdit = false;
            let dataObj: any = {};
            dataObj.source = "SUPPLIER_EDIT";
            dataObj.data = response.data[0];
            self.util.changeEvent(dataObj);
            //self.selectedSupplier = response.data;
          }
        });
      }
    } catch (err) {
      this.global.addException("Supplier list", "updateSupplier()", err);
    }
  }
  cancelEditInfo() {
    this.isEdit = false;
  }

  deleteSupplierDailog() {
    try {
      let data: any = {
        API_URL: "suppliers/delete",
        reqObj: {
          supplierId: this.selectedSupplier.supplier_id
        },
        event: {
          source: "SUPPLIER",
          action: "DELETE"
        }
      };
      this.util.showDialog(
        DialogComponent,
        "Are you sure you want to delete " + //@ Shahebaz - Start
        this.selectedSupplier.supplier_name + //@ Shahebaz - End
          " ?",
        [],
        "Delete Confirmation ?",
        "CONFIRMATION",
        data
      );
    } catch (err) {
      this.global.addException("Supplier list", "deleteSupplierDailog()", err);
    }
  }
  getCountries() {
    var self = this;
    try {
      this.http.doGet("country", function(error: boolean, response: any) {
        if (error) {
          console.log(response.message);
          self.countries = [];
        } else {
          self.countries = response.data;
          self.util.mapInit(
            self.mapsAPILoader,
            self.searchElementRef,
            self.ngZone,
            self.editSupplierFrm.get("address1"),
            [
              self.editSupplierFrm.get("countryId"),
              self.editSupplierFrm.get("provinceId"),
              self.editSupplierFrm.get("cityId"),
              self.editSupplierFrm.get("postalCode"),
              { countries: self.countries },
              self.editSupplierFrm.get("latitude"),
              self.editSupplierFrm.get("longitude")
            ]
          );
        }
      });
    } catch (err) {
      this.global.addException("Supplier list", "getCountries()", err);
    }
  }
  addFromCSV() {
    let route: string,
      apiEndPoint: string,
      csvTemplateUrl: string,
      redirectUrl: string;
    route = "/csa-onboarding/csv-preview/supplier";
    apiEndPoint = "suppliers/csv";
    csvTemplateUrl = this.config.domainIP + "api/download/csv/supplier.csv";
    redirectUrl = "/admin/csa/supplier-list/0";

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
