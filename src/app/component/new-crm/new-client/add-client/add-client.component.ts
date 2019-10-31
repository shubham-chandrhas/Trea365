import {
  Component,
  OnInit,
  ElementRef,
  NgZone,
  ViewChild,
  ViewChildren,
  QueryList,
  ApplicationRef
} from "@angular/core";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";
import { Router, ActivatedRoute } from "@angular/router";
import { MapsAPILoader } from "@agm/core";
import { Observable } from "rxjs/Observable";
import { map, startWith } from 'rxjs/operators';
import { DialogComponent } from '../../../../shared/model/dialog/dialog.component';

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

import { UtilService } from "../../../../shared/service/util.service";
import { ConstantsService } from "../../../../shared/service/constants.service";
import { GlobalService } from "../../../../shared/service/global.service";
import { HttpService } from "../../../../shared/service/http.service";
import { NewClientDialog } from "../client-dialog.component";
import { NewCrmService } from "../../crm-service";
import { AdminService } from "../../../admin/admin.service";
//import { HrService } from '../../../hr/hr.service';

@Component({
  selector: "app-add-new-client",
  templateUrl: "./add-client.component.html",
  styleUrls: ["./add-client.component.css"]
})
export class NewAddClientComponent implements OnInit {
  public errMsg: string = "";
  public isError: boolean = false;
  public submitted: boolean = false;
  public countries: any = [];
  public referralTypeList: any[] = [];
  public filteredReferralTypeList: Observable<any[]>;
  public additionalFields: any = [];
  public editClientObj: any;
  currentGoogleAuto: number = 0;
  addClientFm: FormGroup;
  selReferralType = new FormControl();

  //@ViewChild("searchMain") public searchElementRef: ElementRef;
  @ViewChild("comment")
  comment: any;
  //@ViewChildren('search') addressList:QueryList<any>;
  @ViewChildren("search", { read: ElementRef }) addressList: QueryList<any>;
  @ViewChildren("searchBilling", { read: ElementRef }) billingList: QueryList<any>;
  @ViewChildren("searchWork", { read: ElementRef }) workList: QueryList<any>;
  constructor(
    public router: Router,
    private route: ActivatedRoute,
    public crm: NewCrmService,
    private ngZone: NgZone,
    private fb: FormBuilder,
    public util: UtilService,
    public dialog: MatDialog,
    private http: HttpService,
    private ref: ApplicationRef,
    private admin: AdminService,
    private global: GlobalService,
    public constant: ConstantsService,
    private mapsAPILoader: MapsAPILoader
  ) {}

  ngOnInit() {
    this.util.setWindowHeight();
    this.util.setPageTitle(this.route);
    this.router.url.split("/")[2] == "csa-onboarding"
      ? this.util.menuChange({ menu: "guide", subMenu: "" })
      : this.util.menuChange({ menu: 5, subMenu: 5 });

    this.getReferralTypeList("init");
    this.admin.newRecord.subscribe(status => {
      console.log("New Type");
      if (status) {
        if (status == "referralType") {
          this.getReferralTypeList("new");
        }
      }
    });

    if (sessionStorage.getItem("client")) {
      this.editClientObj = JSON.parse(sessionStorage.getItem("client"));
      this.createForm("edit", this.editClientObj);
      this.setClientFields("1", this.editClientObj.additional_fields);
    }
    else{
      this.createForm("add");
      this.getClientFields();

    }
  }


  getClientFields(): void {
    let self = this;
    try {
      this.util.showProcessing("processing-spinner");
      this.http.doGet("extrafields?type=client", function(
        error: boolean,
        response: any
      ) {
        self.util.hideProcessing("processing-spinner");
        if (error) {
        } else {
          self.additionalFields = response.data.additional_client_fields
            ? response.data.additional_client_fields
            : [];
          self.setClientFields("0", self.additionalFields);
        }
      });
    } catch (err) {
      this.global.addException("Add Client", "getClientFields()", err);
    }
  }

  setClientFields(option, fields): void {
    if (fields) {
      for (let i = 0; i < fields.length; i++) {
        this.addFields(option, fields[i]);
      }
    }
  }
  checkBillingAsMain(input)
  {
    if(input.value)
    {
      this.billing_address.at(0).get("address_line_1").setValue(this.main_address.at(0).get("address_line_1").value);
      this.billing_address.at(0).get("address_line_2").setValue(this.main_address.at(0).get("address_line_2").value);
    }
    else{
      this.billing_address.at(0).get("address_line_1").setValue("");
      this.billing_address.at(0).get("address_line_2").setValue("");
    }
  }
  checkWorkAsMain(input)
  {
    if(input.value)
    {
      this.work_address.at(0).get("address_line_1").setValue(this.main_address.at(0).get("address_line_1").value);
      this.work_address.at(0).get("address_line_2").setValue(this.main_address.at(0).get("address_line_2").value);
    }
    else{
      this.work_address.at(0).get("address_line_1").setValue("");
      this.work_address.at(0).get("address_line_2").setValue("");
    }
  }

  getReferralTypeList(option) {
    var self = this;
    try {
      this.http.doGet("referaltype", function(error: boolean, response: any) {
        if (error) {
          console.log("error", response);
        } else {
          self.referralTypeList = response.data;
          self.filteredReferralTypeList = self.selReferralType.valueChanges.pipe(
            startWith(""),
            map(data =>
              data
                ? self.filterReferralType(data, self.referralTypeList)
                : self.referralTypeList.slice()
            )
          );
          console.log(self.filteredReferralTypeList);
          if (option == "new") {
            self.addClientFm
              .get("referral_type")
              .setValue(response.data[response.data.length - 1].referral_type);
            self.addClientFm
              .get("ref_type_id")
              .setValue(response.data[response.data.length - 1].ref_type_id);
            self.comment.nativeElement.focus();
          }
        }
      });
    } catch (err) {
      this.global.addException("Add Client", "getReferralTypeList()", err);
    }
  }
  getSelectedReferal(referal, event: any): void {
    event
      ? event.isUserInput
        ? this.ref_type_id.setValue(referal.ref_type_id)
        : ""
      : "";
  }
  public validateClient(event: any) {
    try {
      let client = event.target.value;
      let match = this.referralTypeList.filter(
        item => item.referral_type.toLowerCase() == client.toLowerCase()
      );
      if (client == "") {
        this.ref_type_id.setValue("");
        return;
      }
      if (match.length > 0) {
        this.ref_type_id.setValue(match[0].ref_type_id);
        this.referral_type.setValue(match[0].referral_type);
      } else {
        this.ref_type_id.setValue("");
      }
    } catch (err) {
      this.global.addException("Add Client", "validateClient()", err);
    }
  }
  filterReferralType(name, list: any[]) {
    console.log(name);
    return list.filter(
      item => item.referral_type.toLowerCase().indexOf(name.toLowerCase()) === 0
    );
  }

  addReferalType() {
    this.dialog.open(NewClientDialog, {
      data: { action: "addReferalType" },
      autoFocus: false
    });
  }

  public createForm(action, clientObj: any = {}) {
    try {
      this.addClientFm = this.fb.group({
        client_type: new FormControl(
          action == "edit" ? clientObj.client_type : "Company"
        ),
        client_id: new FormControl(
          action == "edit" ? clientObj.client_id : ""
        ),
        legal_name: new FormControl(
          action == "edit" ? clientObj.legal_name : ""
        ),
        client_name: new FormControl(
          action == "edit" ? clientObj.client_name : "",
          [Validators.required]
        ),
        payment_term: new FormControl(
          action == "edit" ? clientObj.payment_term : ""
        ),
        ref_type_id: new FormControl(
          action == "edit" ? clientObj.ref_type_id : ""
        ),
        referral_type: new FormControl(
          action == "edit" ? clientObj.referral_type : ""
        ),
        comments: new FormControl(action == "edit" ? clientObj.comments : "", [
          Validators.maxLength(this.constant.DEFAULT_COMMENT_MAXLENGTH)
        ]),
        billingLocationSameAsMain: new FormControl(
          action == "edit" ? clientObj.billingLocationSameAsMain : ""
        ),
        workLocationSameAsMain: new FormControl(
          action == "edit" ? clientObj.workLocationSameAsMain : ""
        ),
        additional_fields: this.fb.array([]),
        main_address: this.fb.array([]),
        billing_address: this.fb.array([]),
        work_address: this.fb.array([]),
      });

      if (action == "edit") {
        for (let i = 0; i < clientObj.main_address.length; i++) {
          this.addMainAddress(1,clientObj.main_address[i]);
        }
      }else {
        this.addMainAddress(0);

      }

      if (action == "edit") {
        for (let i = 0; i < clientObj.billing_address.length; i++) {
          this.addBillingAddress(1,clientObj.billing_address[i]);
        }
      }else {
        this.addBillingAddress(0);
      }

      if (action == "edit") {
        for (let i = 0; i < clientObj.work_address.length; i++) {
          this.addWorkAddress(1,clientObj.work_address[i]);
        }
      }else {
        this.addWorkAddress(0);
      }

    } catch (err) {
      this.global.addException("Add Client", "createForm()", err);
    }
  }

  get client_id() {
    return this.addClientFm.get("client_id");
  }
  get client_type() {
    return this.addClientFm.get("client_type");
  }
  get legal_name() {
    return this.addClientFm.get("legal_name");
  }
  get client_name() {
    return this.addClientFm.get("client_name");
  }
  get payment_term() {
    return this.addClientFm.get("payment_term");
  }
  get ref_type_id() {
    return this.addClientFm.get("ref_type_id");
  }
  get referral_type() {
    return this.addClientFm.get("referral_type");
  }
  get billingLocationSameAsMain() {
    return this.addClientFm.get("billingLocationSameAsMain");
  }
  get workLocationSameAsMain() {
    return this.addClientFm.get("workLocationSameAsMain");
  }
  get comments() {
    return this.addClientFm.get("comments");
  }
  get address(): FormArray {
    return (<FormArray>this.addClientFm.get("address")) as FormArray;
  }
  get contacts(): FormArray {
    return (<FormArray>this.addClientFm.get("contacts")) as FormArray;
  }
  get additional_fields(): FormArray {
    return (<FormArray>this.addClientFm.get("additional_fields")) as FormArray;
  }
  get main_address(): FormArray {
    return (<FormArray>this.addClientFm.get("main_address")) as FormArray;
  }
  get billing_address(): FormArray {
    return (<FormArray>this.addClientFm.get("billing_address")) as FormArray;
  }
  get work_address(): FormArray {
    return (<FormArray>this.addClientFm.get("work_address")) as FormArray;
  }

  addMainAddress(option, addressData: any = {}) {
    let self = this;
    this.submitted = false;
    this.main_address.push(
      this.fb.group({
        is_deleted: new FormControl(
          option == 1
            ? addressData.is_deleted
              ? addressData.is_deleted
              : 0
            : 0
        ),
        client_address_id: new FormControl(
          option == 1 ? addressData.client_address_id : ""
        ),
        address_line_1: new FormControl(
          option == 1 ? addressData.address_line_1 : "",
          [
             Validators.required
          ]
        ),
        address_line_2: new FormControl(
          option == 1 ? addressData.address_line_2 : ""
        ),
        postal_code: new FormControl(
          option == 1 ? addressData.postal_code : ""
        ),
        latitude: new FormControl(option == 1 ? addressData.latitude : 0),
        longitude: new FormControl(option == 1 ? addressData.longitude : 0),
        name: new FormControl(
          option == 1 ? addressData.name : "",
          [
             Validators.required
          ]
        ),
        contact_type: new FormControl(
          option == 1 ? addressData.contact_type : ""
        ),
        phone_no: new FormControl(
          option == 1 ? addressData.phone_no : "",[
            Validators.pattern(this.constant.PHONE_PATTERN)
          ]
        ),
        email_id: new FormControl(
          option == 1 ? addressData.email_id : "",[
            Validators.pattern(this.constant.EMAIL_PATTERN)
          ]
        ),
      })
    );
    setTimeout(function() {
      self.mapInit(self.main_address.length - 1);
    }, 500);
  }
  addBillingAddress(option, addressData: any = {}) {
    let self = this;
    this.submitted = false;
    this.billing_address.push(
      this.fb.group({
        is_deleted: new FormControl(
          option == 1
            ? addressData.is_deleted
              ? addressData.is_deleted
              : 0
            : 0
        ),
        client_address_id: new FormControl(
          option == 1 ? addressData.client_address_id : ""
        ),
        address_line_1: new FormControl(
          option == 1 ? addressData.address_line_1 : "",
          [
             Validators.required
          ]
        ),
        address_line_2: new FormControl(
          option == 1 ? addressData.address_line_2 : ""
        ),
        postal_code: new FormControl(
          option == 1 ? addressData.postal_code : ""
        ),
        latitude: new FormControl(option == 1 ? addressData.latitude : 0),
        longitude: new FormControl(option == 1 ? addressData.longitude : 0),
        name: new FormControl(
          option == 1 ? addressData.name : "",
          [
             Validators.required
          ]
        ),
        contact_type: new FormControl(
          option == 1 ? addressData.contact_type : ""
        ),
        phone_no: new FormControl(
          option == 1 ? addressData.phone_no : "",[
            Validators.pattern(this.constant.PHONE_PATTERN)
          ]
        ),
        email_id: new FormControl(
          option == 1 ? addressData.email_id : "",[
            Validators.pattern(this.constant.EMAIL_PATTERN)
          ]
        ),
      })
    );
    setTimeout(function() {
      self.mapBillingInit(self.billing_address.length - 1);
    }, 500);
  }
  addWorkAddress(option, addressData: any = {}) {
    let self = this;
    this.submitted = false;
    this.work_address.push(
      this.fb.group({
        is_deleted: new FormControl(
          option == 1
            ? addressData.is_deleted
              ? addressData.is_deleted
              : 0
            : 0
        ),
        client_address_id: new FormControl(
          option == 1 ? addressData.client_address_id : ""
        ),
        address_line_1: new FormControl(
          option == 1 ? addressData.address_line_1 : "",
          [
             Validators.required
          ]
        ),
        address_line_2: new FormControl(
          option == 1 ? addressData.address_line_2 : ""
        ),
        postal_code: new FormControl(
          option == 1 ? addressData.postal_code : ""
        ),
        latitude: new FormControl(option == 1 ? addressData.latitude : 0),
        longitude: new FormControl(option == 1 ? addressData.longitude : 0),
        name: new FormControl(
          option == 1 ? addressData.name : "",
          [
             Validators.required
          ]
        ),
        contact_type: new FormControl(
          option == 1 ? addressData.contact_type : ""
        ),
        phone_no: new FormControl(
          option == 1 ? addressData.phone_no : "",[
            Validators.pattern(this.constant.PHONE_PATTERN)
          ]
        ),
        email_id: new FormControl(
          option == 1 ? addressData.email_id : "",[
            Validators.pattern(this.constant.EMAIL_PATTERN)
          ]
        ),
      })
    );
    setTimeout(function() {
      self.mapWorkInit(self.work_address.length - 1);
    }, 500);
  }

  addFields(option, valObj: any = {}): void {
    let validatorsArr: any =
      valObj.optionalStatus == "False" ? [Validators.required] : [];
    this.additional_fields.push(
      new FormGroup({
        label: new FormControl(valObj.label),
        dataType: new FormControl(valObj.dataType),
        optionalStatus: new FormControl(valObj.optionalStatus),
        data: new FormControl(option == "1" ? valObj.data ?  valObj.dataType == 'Date' ? this.util.getTimeZoneDate(valObj.data) : valObj.data : "" : "", [
          ...validatorsArr,
          ...this.util.getValidator(valObj.dataType)
        ])
      })
    );
  }

  goToReview(form: FormGroup) {
    var self = this;
    this.errMsg = "";
    this.isError = false;
    this.submitted = true;
    try {
      console.log(form);
      if (form.valid) {
        for (let i = 0; i < form.value.additional_fields.length; i++) {
          if (form.value.additional_fields[i].dataType == "Date") {
            form.value.additional_fields[i].data = this.util.getDDMMYYYYDate(
              form.value.additional_fields[i].data
            );
          }
        }
        console.log(form.value);
        sessionStorage.setItem("client", JSON.stringify(form.value));
        this.router.url.split("/")[2] == "csa-onboarding"
          ? this.router.navigate(["/new-crm/csa-onboarding/client-review"])
          : this.router.navigate(["/new-crm/csa/client-review"]);
      }
    } catch (err) {
      this.global.addException("Add Client", "goToReview()", err);
    }
  }

  updateClient(form: FormGroup) {
    var self = this;
    this.errMsg = "";
    this.isError = false;
    this.submitted = true;
    try {
      if (form.valid) {
        let reqObject:any = JSON.parse(JSON.stringify(form.value));
        self.util.addSpinner("updateClient", "Update");
        this.http.doPost("client/update", reqObject, function(
          error: boolean,
          response: any
        ) {
          self.util.removeSpinner("updateClient", "Update");
          if (error) {
            self.errMsg = response.message;
            self.isError = true;
            console.log(response.message);
          } else {
            // self.router.url.split("/")[2] == "csa-onboarding"
            //   ? self.router.navigate(["/new-crm/csa-onboarding/client-list/"+form.value.client_id])
            //   : self.router.navigate(["/new-crm/csa/client-list/"+form.value.client_id]);
            self.crm.isEditFromList = false;
            self.util.showDialog(DialogComponent, response.message, self.router.url.split('/')[2]=='csa-onboarding' ? ["/new-crm/csa-onboarding/client-list/"+form.value.client_id] : ["/new-crm/csa/client-list/"+form.value.client_id]);
            self.util.changeEvent({
              source: "UPDATE_CLIENT",
              action: "UPDATE_CLIENT"
            });
          }
        });
      }
    } catch (err) {
      this.global.addException("Add Client", "updateClient()", err);
    }
  }

  cancelAddClient() {
    this.router.url.split("/")[2] == "csa-onboarding"
      ? this.router.navigate(["/csa-onboarding/guide"])
      : this.router.navigate(["/new-crm/csa/client-list/0"]);
    this.crm.isEditFromList = false;
  }
  getAddressAt(index) {
    return this.main_address.at(index);
  }
  mapInit(addressIndx) {
    try {
      console.log(this.addressList);
      this.addressList.forEach(addressInstance => {
        console.log(addressInstance);
        let self = this;
        self.util.mapInit(
          self.mapsAPILoader,
          addressInstance,
          self.ngZone,
          this.getAddressAt(addressIndx).get("address_line_1"),
          [
            null,
            null,
            null,
            this.getAddressAt(addressIndx).get("postal_code"),
            null,
            this.getAddressAt(addressIndx).get("latitude"),
            this.getAddressAt(addressIndx).get("longitude")
          ]
        );
      });
    } catch (err) {
      this.global.addException("Add Client", "mapInit()", err);
    }
  }

  getBillingAt(index) {
    return this.billing_address.at(index);
  }
  mapBillingInit(addressIndx) {
    try {
      console.log(this.billingList);
      this.billingList.forEach(addressInstance => {
        console.log(addressInstance);
        let self = this;
        self.util.mapInit(
          self.mapsAPILoader,
          addressInstance,
          self.ngZone,
          this.getBillingAt(addressIndx).get("address_line_1"),
          [
            null,
            null,
            null,
            this.getBillingAt(addressIndx).get("postal_code"),
            null,
            this.getBillingAt(addressIndx).get("latitude"),
            this.getBillingAt(addressIndx).get("longitude")
          ]
        );
      });
    } catch (err) {
      this.global.addException("Add Client", "mapInit()", err);
    }
  }

  getWorkAt(index) {
    return this.work_address.at(index);
  }
  mapWorkInit(addressIndx) {
    try {
      console.log(this.workList);
      this.workList.forEach(addressInstance => {
        console.log(addressInstance);
        let self = this;
        self.util.mapInit(
          self.mapsAPILoader,
          addressInstance,
          self.ngZone,
          this.getWorkAt(addressIndx).get("address_line_1"),
          [
            null,
            null,
            null,
            this.getWorkAt(addressIndx).get("postal_code"),
            null,
            this.getWorkAt(addressIndx).get("latitude"),
            this.getWorkAt(addressIndx).get("longitude")
          ]
        );
      });
    } catch (err) {
      this.global.addException("Add Client", "mapInit()", err);
    }
  }
  removeAddress(addrIndx) {
    this.getWorkAt(addrIndx).get("client_address_id").value == "" || this.getWorkAt(addrIndx).get("client_address_id").value == null
          ? this.work_address.removeAt(addrIndx)
          : this.getWorkAt(addrIndx)
              .get("is_deleted")
              .setValue(1);
  }

}
