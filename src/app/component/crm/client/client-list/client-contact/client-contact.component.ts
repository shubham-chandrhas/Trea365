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
import { DialogComponent } from "../../../../../shared/model/dialog/dialog.component";
import { CrmService } from "../../../crm-service";

@Component({
  selector: "app-client-contact",
  templateUrl: "./client-contact.component.html",
  styleUrls: ["../client-list.component.css", "./client-contact.component.scss"]
})
export class ClientContactComponent implements OnInit {
  isEdit: boolean = false;
  clientDetails: string = "details";
  contactAddrList: IMultiSelectOption[] = [];
  mulSelSettings: IMultiSelectSettings = { displayAllSelectedText: true };

  public selectText: IMultiSelectTexts = {
    defaultTitle: ""
  };

  updateClientFm: FormGroup;
  errMsg: string;
  isError: boolean;

  public sortColumn: string = "work_order_no";
  public sortColumnType: string = "N";
  public sortOrder: string = "DSC";
  public paginationKey: any;
  public listCount: number = 0;
  permissionsSet: any;
  woNumberSearch;
  quoteNoSearch;
  dateSearch;
  statusSearch;

  @Input() contactDetails: any;
  @Output() messageEvent = new EventEmitter<string>();

  constructor(
    public dialog: MatDialog,
    public util: UtilService,
    public constant: ConstantsService,
    public crm: CrmService,
    private http: HttpService,
    public router: Router,
    private fb: FormBuilder,
    private global: GlobalService
  ) {}

  ngOnInit() {
    window.scrollTo(0, 0);
    this.paginationKey = {
      itemsPerPage: this.constant.ITEMS_PER_PAGE,
      currentPage: this.constant.CURRENT_PAGE
    };
    this.permissionsSet = this.util.getModulePermission(122);
  }

  changePage(event) {
    this.paginationKey.currentPage = event;
    //window.scrollTo(0, 0);
  }
  changeItemPerPage() {
    // window.scrollTo(0, 0);
  }
  updateCount(count) {
    this.constant.ITEM_COUNT = count;
    this.listCount = count;
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

  showDetails(detailOption): void {
    this.clientDetails = detailOption;
    console.log(detailOption);
  }

  editClientContact(): void {
    this.isEdit = true;
    //this.crm.isEditFromList = true;
    this.contactAddrList = [];
    this.createForm(this.contactDetails);
  }

  createForm(contactData): void {
    try {
      this.updateClientFm = this.fb.group({
        client_id: new FormControl(contactData.client_id),
        client_contact_id: new FormControl(contactData.client_contact_id),
        address: new FormControl([]),
        contact_type: new FormControl(contactData.contact_type),
        name: new FormControl(contactData.name, [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(200)
        ]),
        email_id: new FormControl(contactData.email_id, [
          Validators.required,
          Validators.pattern(this.constant.EMAIL_PATTERN)
        ]),
        phone_no: new FormControl(contactData.phone_no, [
          Validators.required,
          Validators.pattern(this.constant.PHONE_PATTERN)
        ])
      });

      let conAddIds: any[] = [];
      for (let i = 0; i < contactData.client_contact_address.length; i++) {
        let addressObj: any = {
          id: contactData.client_contact_address[i].client_address_id,
          name: contactData.address[i]
        };
        this.contactAddrList.push(addressObj);
        conAddIds.push(contactData.client_contact_address[i].client_address_id);
      }
      this.address.setValue(conAddIds);
    } catch (err) {
      this.global.addException("Client List - Contact", "createForm()", err);
    }
  }

  get address() {
    return this.updateClientFm.get("address");
  }
  get contact_type() {
    return this.updateClientFm.get("contact_type");
  }
  get name() {
    return this.updateClientFm.get("name");
  }
  get email_id() {
    return this.updateClientFm.get("email_id");
  }
  get phone_no() {
    return this.updateClientFm.get("phone_no");
  }

  cancelUpdateContact(): void {
    this.isEdit = false;
  }

  updateContact(): void {
    let self = this;
    try {
      let reqObj = JSON.parse(JSON.stringify(this.updateClientFm.value));
      let contactArray = JSON.parse(
        JSON.stringify(this.contactDetails.client_contact_address)
      );
      reqObj.address = [];
      reqObj.addresses = [];
      for (let i = 0; i < this.updateClientFm.value.address.length; i++) {
        for (let j = 0; j < this.contactAddrList.length; j++) {
          if (
            this.updateClientFm.value.address[i] ==
              this.contactAddrList[j].id &&
            this.contactAddrList[j].name
          ) {
            reqObj.address.push(this.contactAddrList[j].name);
            break;
          }
        }
        for (
          let k = 0;
          k < this.contactDetails.client_contact_address.length;
          k++
        ) {
          if (
            this.updateClientFm.value.address[i] ==
              this.contactDetails.client_contact_address[k].client_address_id &&
            this.contactDetails.client_contact_address[k].contact_address
          ) {
            reqObj.addresses.push(
              this.createArddressObj(
                this.contactDetails.client_contact_address[k],
                0
              )
            );
            contactArray.splice(k, 1);
          }
        }
      }

      for (let k = 0; k < contactArray.length; k++) {
        if (contactArray[k].contact_address) {
          reqObj.addresses.push(this.createArddressObj(contactArray[k], 1));
        }
      }

      console.log(JSON.stringify(reqObj));

      self.util.addSpinner("updateClient", "Update");
      this.http.doPost("updateClientContact", reqObj, function(
        error: boolean,
        response: any
      ) {
        self.util.removeSpinner("updateClient", "Update");
        if (error) {
          self.errMsg = response.message;
          self.isError = true;
          console.log(response.message);
        } else {
          self.cancelUpdateContact();
          self.messageEvent.emit("UPDATE_CONTACT");
          self.util.showDialog(DialogComponent, response.message, []);
          response.data.address = JSON.parse(response.data.address);
          for (
            let i = 0;
            i < response.data.client_contact_address.length;
            i++
          ) {
            if (response.data.client_contact_address[i].contact_address) {
              response.data.client_contact_address[
                i
              ].contact_address.address_type = JSON.parse(
                response.data.client_contact_address[i].contact_address
                  .address_type
              );
            }
          }
          self.contactDetails = response.data;
        }
      });
    } catch (err) {
      this.global.addException("Client List - Contact", "updateContact()", err);
    }
  }

  createArddressObj(conObj, deleteStatus): any {
    try {
      return {
        client_address_id: conObj.client_address_id,
        client_contact_id: conObj.client_contact_id,
        is_deleted: deleteStatus,
        address_type: conObj.contact_address.address_type,
        address_line_1: conObj.contact_address.address_line_1,
        address_line_2: conObj.contact_address.address_line_2,
        country_id: conObj.contact_address.country_id
          ? conObj.contact_address.country_id
          : "",
        province_id: conObj.contact_address.province_id
          ? conObj.contact_address.province_id
          : "",
        city_id: conObj.contact_address.city_id
          ? conObj.contact_address.city_id
          : "",
        postal_code: conObj.contact_address.postal_code
          ? conObj.contact_address.postal_code
          : "",
        latitude: conObj.contact_address.latitude
          ? conObj.contact_address.latitude
          : "",
        longitude: conObj.contact_address.longitude
          ? conObj.contact_address.longitude
          : ""
      };
    } catch (err) {
      this.global.addException(
        "Client List - Contact",
        "createArddressObj()",
        err
      );
    }
  }

  showDeleteDialog() {
    let data: any = {
      API_URL: "deleteClientContact",
      reqObj: {
        client_id: this.contactDetails.client_id,
        client_contact_id: this.contactDetails.client_contact_id
      },
      event: {
        source: "CLIENT_CONTACT",
        action: "DELETE"
      }
    };
    this.util.showDialog(
      DialogComponent,
      "Are you sure you want to delete " +
      this.contactDetails.name + //@shahebaz (+this.addressDetails.client_name +)
        " ?",
      [],
      "Delete Confirmation ?",
      "CONFIRMATION",
      data
    );
  }
}
