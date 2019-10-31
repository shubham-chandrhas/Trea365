import {
  Component,
  OnInit,
  ElementRef,
  NgZone,
  ViewChild,
  ViewChildren,
  QueryList,
  ApplicationRef,
  Input,
  Output,
  EventEmitter
} from "@angular/core";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";
import { Router } from "@angular/router";
import { MapsAPILoader } from "@agm/core";
import { Observable } from "rxjs/Observable";
import { startWith } from "rxjs/operators/startWith";
import { map } from "rxjs/operators/map";

import {
  FormControl,
  FormGroup,
  FormBuilder,
  FormArray,
  Validators,
  NgForm,
  AbstractControl
} from "@angular/forms";
import {
  IMultiSelectOption,
  IMultiSelectSettings,
  IMultiSelectTexts
} from "angular-2-dropdown-multiselect";

import { UtilService } from "../../../../../shared/service/util.service";
import { ConstantsService } from "../../../../../shared/service/constants.service";
import { GlobalService } from "../../../../../shared/service/global.service";
import { HttpService } from "../../../../../shared/service/http.service";
import { ClientDialog } from "../../client-dialog.component";
import { CrmService } from "../../../crm-service";
import { stringify } from "@angular/core/src/util";

import { DialogComponent } from "../../../../../shared/model/dialog/dialog.component";

@Component({
  selector: "app-client-address",
  templateUrl: "./client-address.component.html",
  styleUrls: ["../client-list.component.css", "./client-address.component.scss"]
})
export class ClientAddressComponent implements OnInit {
  public isEdit: boolean = false;
  public errMsg: string = "";
  public isError: boolean = false;
  public submitted: boolean = false;
  public clientDetails: string = "details";
  public countries: any = [];

  public sortColumn: string = "work_order_no";
  public sortColumnType: string = "N";
  public sortOrder: string = "DSC";
  public paginationKey: any;
  public listCount: number = 0;
  public searchTxt;
  public editAddressForm: FormGroup;
  permissionsSet: any;
  woNumberSearch;
  quoteNoSearch;
  dateSearch;
  statusSearch;

  mulSelSettings: IMultiSelectSettings = { displayAllSelectedText: true };

  public addressTypeList: IMultiSelectOption[] = [
    { id: 1, name: "Main Address" },
    { id: 2, name: "Billing Address" },
    { id: 3, name: "Work Location Address" }
  ];

  public selectText: IMultiSelectTexts = {
    defaultTitle: ""
  };

  @Input() addressDetails: any;
  @Output() messageEvent = new EventEmitter<string>();
  @ViewChild("search")
  public searchElementRef: ElementRef;

  constructor(
    private fb: FormBuilder,
    public dialog: MatDialog,
    public util: UtilService,
    public constant: ConstantsService,
    private global: GlobalService,
    public crm: CrmService,
    private http: HttpService,
    public router: Router,
    private mapsAPILoader: MapsAPILoader,
    private ngZone: NgZone
  ) {}

  ngOnInit() {
    window.scrollTo(0, 0);
    this.paginationKey = {
      itemsPerPage: this.constant.ITEMS_PER_PAGE,
      currentPage: this.constant.CURRENT_PAGE
    };
    this.getCountries();
    this.createForm("0");
    this.permissionsSet = this.util.getModulePermission(122);
  }

  changePage(event) {
    this.paginationKey.currentPage = event;
  }
  changeItemPerPage() {}
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

  showDetails(detailOption) {
    this.clientDetails = detailOption;
  }
  getCountries() {
    let self = this;
    this.global.getCountries(function(list) {
      self.countries = list;
    });
  }
  countryChange(countryId) {
    this.province_id.setValue("");
    this.city_id.setValue("");
  }

  public createForm(option, addressObj: any = {}) {
    this.editAddressForm = this.fb.group({
      client_address_id: new FormControl(
        option == "1" ? addressObj.client_address_id : ""
      ),
      address_type: new FormControl(
        option == "1" ? addressObj.address_type : [],
        [Validators.required]
      ),
      address_line_1: new FormControl(
        option == "1" ? addressObj.address_line_1 : "",
        [Validators.required]
      ),
      address_line_2: new FormControl(
        option == "1" ? addressObj.address_line_2 : ""
      ),
      country_id: new FormControl(option == "1" ? addressObj.country_id ? addressObj.country_id : '' : ""),
      province_id: new FormControl(
        option == "1" ? addressObj.province_details ? addressObj.province_details.province_name : '' : ""
      ),
      city_id: new FormControl(
        option == "1" ? addressObj.city_details ? addressObj.city_details.city_name : '' : ""
      ),
      postal_code: new FormControl(option == "1" ? addressObj.postal_code ? addressObj.postal_code : '' : ""),
      latitude: new FormControl(option == "1" ? addressObj.latitude ? addressObj.latitude : '' : ""),
      longitude: new FormControl(option == "1" ? addressObj.longitude ? addressObj.longitude : '' : "")
    });
  }
  get client_address_id() {
    return this.editAddressForm.get("client_address_id");
  }
  get address_type() {
    return this.editAddressForm.get("address_type");
  }
  get address_line_1() {
    return this.editAddressForm.get("address_line_1");
  }
  get address_line_2() {
    return this.editAddressForm.get("address_line_2");
  }
  get country_id() {
    return this.editAddressForm.get("country_id");
  }
  get province_id() {
    return this.editAddressForm.get("province_id");
  }
  get city_id() {
    return this.editAddressForm.get("city_id");
  }
  get postal_code() {
    return this.editAddressForm.get("postal_code");
  }
  get latitude() {
    return this.editAddressForm.get("latitude");
  }
  get longitude() {
    return this.editAddressForm.get("longitude");
  }

  editClientAddress() {
    try {
      let self = this;
      this.isEdit = true;
      let editObj: any = JSON.parse(JSON.stringify(this.addressDetails));
      for (let j = 0; j < editObj.address_type.length; j++) {
        editObj.address_type[j] = this.addressTypeList.filter(
          item => item.name == editObj.address_type[j]
        )[0].id;
      }
      this.createForm("1", editObj);
      setTimeout(function() {
        self.util.mapInit(
          self.mapsAPILoader,
          self.searchElementRef,
          self.ngZone,
          self.editAddressForm.get("address_line_1"),
          [
            self.editAddressForm.get("country_id"),
            self.editAddressForm.get("province_id"),
            self.editAddressForm.get("city_id"),
            self.editAddressForm.get("postal_code"),
            { countries: self.countries },
            self.editAddressForm.get("latitude"),
            self.editAddressForm.get("longitude")
          ]
        );
      }, 500);
    } catch (err) {
      this.global.addException("Client List", "editClientAddress()", err);
    }
  }
  cancelUpdate() {
    this.isEdit = false;
  }
  updateAddress(form: FormGroup) {
    console.log("updateAddress", form.valid, form.value);
    let self = this;
    this.submitted = true;
    try {
      if (form.valid) {
        console.log("form.value", form.valid, form.value);
        let reqObj: any = {};
        reqObj = JSON.parse(JSON.stringify(form.value));
        for (let j = 0; j < reqObj.address_type.length; j++) {
          reqObj.address_type[j] = this.addressTypeList.filter(
            item => item.id == reqObj.address_type[j]
          )[0].name;
        }
        //reqObj.address_type = JSON.stringify(reqObj.address_type);
        reqObj.client_id = this.addressDetails.client_id;
        reqObj.contacts = [];
        for (
          let j = 0;
          j < this.addressDetails.client_contact_address.length;
          j++
        ) {
          let tempObj: any = {};
          tempObj = JSON.parse(
            JSON.stringify(
              this.addressDetails.client_contact_address[j].address_contact
            )
          );
          // tempObj.address = JSON.stringify(tempObj.address);
          tempObj.is_deleted = 0;
          reqObj.contacts.push(tempObj);
        }
        console.log("reqObj", form.valid, reqObj);
        self.util.addSpinner("updateAddr", "Update");
        this.http.doPost("updateClientAddress", reqObj, function(
          error: boolean,
          response: any
        ) {
          self.util.removeSpinner("updateAddr", "Update");
          if (error) {
            self.isError = true;
            self.errMsg = response.message;
          } else {
            self.isEdit = false;
            self.messageEvent.emit("UPDATE_ADDRESS");
            self.util.showDialog(DialogComponent, response.message, []);
            self.addressDetails = response.data;
            self.addressDetails.address_type = JSON.parse(
              self.addressDetails.address_type
            );
            for (
              let j = 0;
              j < self.addressDetails.client_contact_address.length;
              j++
            ) {
              self.addressDetails.client_contact_address[j].address_contact
                ? (self.addressDetails.client_contact_address[
                    j
                  ].address_contact.address = JSON.parse(
                    self.addressDetails.client_contact_address[j]
                      .address_contact.address
                  ))
                : "";
            }
          }
        });
      }
    } catch (err) {
      this.global.addException("Client List", "updateAddress()", err);
    }
  }

  showDeleteDialog() {
    let data: any = {
      API_URL: "deleteClientAddress",
      reqObj: {
        client_id: this.addressDetails.client_id,
        client_address_id: this.addressDetails.client_address_id
      },
      event: {
        source: "CLIENT_ADDRESS",
        action: "DELETE"
      }
    };
    this.util.showDialog(
      DialogComponent,
      "Are you sure you want to delete " +
      this.addressDetails.client_name + //@shahebaz (+this.addressDetails.client_name +)
        " ?",
      [],
      "Delete Confirmation ?",
      "CONFIRMATION",
      data
    );
  }
}
