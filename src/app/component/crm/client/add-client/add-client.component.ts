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
  
  import { UtilService } from "../../../../shared/service/util.service";
  import { ConstantsService } from "../../../../shared/service/constants.service";
  import { GlobalService } from "../../../../shared/service/global.service";
  import { HttpService } from "../../../../shared/service/http.service";
  import { ClientDialog } from "../client-dialog.component";
  import { CrmService } from "../../crm-service";
  import { AdminService } from "../../../admin/admin.service";
  //import { HrService } from '../../../hr/hr.service';
  
  @Component({
    selector: "app-add-client",
    templateUrl: "./add-client.component.html",
    styleUrls: ["./add-client.component.css"]
  })
  export class AddClientComponent implements OnInit {
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
    mulSelSettings: IMultiSelectSettings = { displayAllSelectedText: true };
  
    public addressTypeList: IMultiSelectOption[] = [
      { id: 1, name: "Main Address" },
      { id: 2, name: "Billing Address" },
      { id: 3, name: "Work Location Address" }
    ];
    public contactAddrList: IMultiSelectOption[] = [];
    public selectText: IMultiSelectTexts = {
      defaultTitle: ""
    };
  
    //@ViewChild("search")
    //public searchElementRef: ElementRef;
    @ViewChild("comment")
    comment: any;
    //@ViewChildren('search') addressList:QueryList<any>;
    @ViewChildren("search", { read: ElementRef }) addressList: QueryList<any>;
  
    constructor(
      public router: Router,
      private route: ActivatedRoute,
      public crm: CrmService,
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
      this.getCountries();
      this.getReferralTypeList("init");
      this.createForm("add");
      this.admin.newRecord.subscribe(status => {
        console.log("New Type");
        if (status) {
          if (status == "referralType") {
            this.getReferralTypeList("new");
          }
        }
      });
    }
  
    onChanges(): void {
      this.addClientFm.get("first_name").valueChanges.subscribe(fn => {
        this.updateContactName();
      });
      this.addClientFm.get("last_name").valueChanges.subscribe(ln => {
        this.updateContactName();
      });
    }
  
    mapClientData() {
      let self = this;
      try {
        if (sessionStorage.getItem("client")) {
          this.editClientObj = JSON.parse(sessionStorage.getItem("client"));
          for (let i = 0; i < this.editClientObj.additional_fields.length; i++) {
            if (this.editClientObj.additional_fields[i].dataType == "Date") {
              this.editClientObj.additional_fields[
                i
              ].data = this.util.stringToDate(
                this.editClientObj.additional_fields[i].data
              );
            }
          }
          console.log(this.editClientObj);
          if (this.editClientObj.client_id) {
            this.crm.isEditFromList = true;
            this.editClientObj.referral_type = this.editClientObj.referral_type
              ? this.editClientObj.referral_type
              : "";
            if (this.editClientObj.referral_type) {
              this.editClientObj.ref_type_name = this.editClientObj.referral_type;
            }
            for (let i = 0; i < this.editClientObj.address.length; i++) {
              for (
                let j = 0;
                j < this.editClientObj.address[i].address_type.length;
                j++
              ) {
                this.editClientObj.address[i].address_type[
                  j
                ] = this.addressTypeList.filter(
                  item =>
                    item.name == this.editClientObj.address[i].address_type[j]
                )[0].id;
              }
  
              this.editClientObj.address[i].selVal = {};
              this.editClientObj.address[
                i
              ].selVal.selectedCountry = this.editClientObj.address[
                i
              ].country_name;
              this.editClientObj.address[
                i
              ].selVal.selectedState = this.editClientObj.address[
                i
              ].province_name ? this.editClientObj.address[
                  i
                ].province_name : '';
              this.editClientObj.address[
                i
              ].selVal.selectedCity = this.editClientObj.address[i].city_name;
              
              
              //this.getProviences(i, this.editClientObj.address[i].country_id);
              this.getCities(i, this.editClientObj.address[i].province_id);
            }
            console.log("edit", JSON.stringify(this.editClientObj));
            this.createForm("edit", this.editClientObj);
            this.setClientFields("1", this.editClientObj.additional_fields);
  
            for (let i = 0; i < this.editClientObj.contacts.length; i++) {
              let cArrList: any[] = JSON.parse(
                JSON.stringify(self.contactAddrList)
              );
              for (
                let j = 0;
                j < this.editClientObj.contacts[i].address.length;
                j++
              ) {
                for (let k = cArrList.length - 1; k >= 0; k--) {
                  if (
                    self.util.matchWithIgnoringSpaces(
                      cArrList[k].name.substring(11, cArrList[k].name.length),
                      self.editClientObj.contacts[i].address[j]
                        .toString()
                        .substring(
                          11,
                          self.editClientObj.contacts[i].address[j].length
                        )
                    )
                  ) {
                    self.editClientObj.contacts[i].address[j] = cArrList[k].id;
                    cArrList.splice(k, 1);
                    break;
                  }
                }
              }
              this.contactAddressChange(i, this.contacts.at(i));
            }
          } else {
            this.createForm("edit", this.editClientObj);
            this.setClientFields("1", this.editClientObj.additional_fields);
          }
          if (this.editClientObj.client_type == "Company") {
            this.addClientFm
              .get("company_name")
              .setValidators([
                Validators.required,
                Validators.minLength(2),
                Validators.maxLength(100)
              ]);
            this.addClientFm.get("first_name").setValidators([]);
            this.addClientFm.get("last_name").setValidators([]);
          } else {
            this.addClientFm.get("company_name").setValidators([]);
            this.addClientFm
              .get("first_name")
              .setValidators([
                Validators.required,
                Validators.minLength(2),
                Validators.maxLength(100)
              ]);
            this.addClientFm
              .get("last_name")
              .setValidators([
                Validators.required,
                Validators.minLength(2),
                Validators.maxLength(100)
              ]);
          }
  
          this.addClientFm.get("company_name").updateValueAndValidity();
          this.addClientFm.get("first_name").updateValueAndValidity();
          this.addClientFm.get("last_name").updateValueAndValidity();
        } else {
          this.createForm("add");
          this.getClientFields();
        }
  
        this.addClientFm.get("client_type").valueChanges.subscribe(type => {
          if (type == "Company") {
            this.addClientFm
              .get("company_name")
              .setValidators([
                Validators.required,
                Validators.minLength(2),
                Validators.maxLength(100)
              ]);
            this.addClientFm.get("first_name").setValidators([]);
            this.addClientFm.get("last_name").setValidators([]);
          } else {
            this.addClientFm.get("company_name").setValidators([]);
            this.addClientFm
              .get("first_name")
              .setValidators([
                Validators.required,
                Validators.minLength(2),
                Validators.maxLength(100)
              ]);
            this.addClientFm
              .get("last_name")
              .setValidators([
                Validators.required,
                Validators.minLength(2),
                Validators.maxLength(100)
              ]);
          }
          this.addClientFm.get("company_name").setValue("");
          this.addClientFm.get("first_name").setValue("");
          this.addClientFm.get("last_name").setValue("");
  
          this.addClientFm.get("company_name").updateValueAndValidity();
          this.addClientFm.get("first_name").updateValueAndValidity();
          this.addClientFm.get("last_name").updateValueAndValidity();
        });
  
        this.onChanges();
      } catch (err) {
        console.log("-:: Exception ::-");
        console.log(err);
        this.global.addException("Add Client", "mapClientData()", err);
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
    addressTypeChange(indx, address) {
      let addTyp: any[] = [];
      console.log(address.get("address_type").value);
      for (let i = 0; i < address.get("address_type").value.length; i++) {
        addTyp.push(
          this.addressTypeList.filter(
            item => item.id == address.get("address_type").value[i]
          )[0].name
        );
      }
      this.updateAddress(address, "selectedAddressType", addTyp);
    }
  
    contactAddressChange(indx, contact) {
      let conAdd: any[] = [];
      for (let i = 0; i < contact.get("address").value.length; i++) {
        let cAddressList: any[] = this.contactAddrList.filter(
          item => item.id == contact.get("address").value[i]
        );
        cAddressList.length > 0 ? conAdd.push(cAddressList[0].name) : "";
      }
      contact.get("selAdd").setValue(conAdd);
    }
  
    countryChange(indx, countryId, address) {
      try {
        address.get("selVal").city = address.get("selVal").state = [];
        let selCountry = this.countries.filter(
          item => item.country_id == countryId
        );
        selCountry.length > 0
          ? this.updateAddress(
              address,
              "selectedCountry",
              selCountry[0].country_name
            )
          : "";
        //this.getProviences(indx, countryId);
        this.updateContactAddress(indx, address);
      } catch (err) {
        this.global.addException("Create Account", "countryChange()", err);
      }
    }
  
    stateChange(indx, address) {
      this.updateAddress(
        address,
        "selectedState",
        address.get("province_id").value
      );
      // this.getCities(indx, stateId);
      this.updateContactAddress(indx, address);
    }
  
    cityChange(indx, address) {
      this.updateAddress(address, "selectedCity", address.get("city_id").value);
      this.updateContactAddress(indx, address);
    }
  
    getCountries() {
      let self = this;
      this.global.getCountries(function(list) {
        self.countries = list;
        self.mapClientData();
      });
    }
  
    // getProviences(indx, countryId){
    //     let self = this;
    //     this.global.getProviences(countryId, function(list){
    //         self.addClientFm.get('address').value[indx].selVal.state = list;
    //     });
    // }
  
    getCities(indx, provinceId) {
      var self = this;
      this.global.getCities(provinceId, function(list) {
        self.addClientFm.get("address").value[indx].selVal.city = list;
      });
    }
  
    updateAddress(address, newField, newVal) {
      let selValObj = address.get("selVal").value;
      selValObj[newField] = newVal;
      address.get("selVal").setValue(selValObj);
    }
  
    updateContactAddress(indx, address) {
      this.contactAddrList[indx].name = this.getAddressForContact(indx, address);
    }
  
    getAddressForContact(indx, address) {
      try {
        // return "Address "+(indx+1)+": "+( (address.get('address_line_1').value).trim() ? (address.get('address_line_1').value).trim() : '')+", "+(address.get('address_line_2').value ? address.get('address_line_2').value+", " : '')+(address.get('city_id').value ? address.get('city_id').value : '')+", "+(address.get('province_id').value ? address.get('province_id').value : '')+", "+(address.get('selVal').value.selectedCountry ? address.get('selVal').value.selectedCountry : '')+", "+(address.get('postal_code').value ? address.get('postal_code').value : '') ;
        return (
          "Address " +
          (indx + 1) +
          ": " +
          (address.get("address_line_2").value
            ? address.get("address_line_2").value + " ,"
            : "") +
          "" +
          (address.get("address_line_1").value
            ? address.get("address_line_1").value
            : "")
        );
      } catch (err) {
        this.global.addException("Add Client", "getAddressForContact()", err);
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
      this.dialog.open(ClientDialog, {
        data: { action: "addReferalType" },
        autoFocus: false
      });
    }
  
    updateContactName() {
      if (this.contacts.length) {
        this.contacts
          .at(0)
          .get("name")
          .setValue(
            this.addClientFm.get("first_name").value +
              " " +
              this.addClientFm.get("last_name").value
          );
      }
    }
  
    public createForm(action, clientObj: any = {}) {
      try {
        this.addClientFm = this.fb.group({
          client_type: new FormControl(
            action == "edit" ? clientObj.client_type : "Company"
          ),
          company_name: new FormControl(
            action == "edit" ? clientObj.company_name : "",
            [Validators.required]
          ),
          legal_name: new FormControl(
            action == "edit" ? clientObj.legal_name : ""
          ),
          first_name: new FormControl(
            action == "edit" ? clientObj.first_name : ""
          ),
          last_name: new FormControl(action == "edit" ? clientObj.last_name : ""),
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
          address: this.fb.array([]),
          contacts: this.fb.array([]),
          additional_fields: this.fb.array([])
        });
        if (action == "edit") {
          for (let i = 0; i < clientObj.address.length; i++) {
            this.addAddress(i, 1, clientObj.address[i]);
            this.updateContactAddress(i, this.address.at(i));
            this.addressTypeChange(i, this.address.at(i));
          }
          for (let j = 0; j < clientObj.contacts.length; j++) {
            this.addContact(j, 1, clientObj.contacts[j]);
  
            if (!this.editClientObj.client_id) {
              this.contactAddressChange(j, this.contacts.at(j));
            }
          }
        }
      } catch (err) {
        this.global.addException("Add Client", "createForm()", err);
      }
    }
  
    get client_type() {
      return this.addClientFm.get("client_type");
    }
    get company_name() {
      return this.addClientFm.get("company_name");
    }
    get legal_name() {
      return this.addClientFm.get("legal_name");
    }
    get first_name() {
      return this.addClientFm.get("first_name");
    }
    get last_name() {
      return this.addClientFm.get("last_name");
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
  
    getAddressAt(index) {
      return this.address.at(index);
    }
    getcontactsAt(index) {
      return this.contacts.at(index);
    }
  
    addAddress(addressIndx, option, addressData: any = {}) {
      let self = this;
      this.submitted = false;
      this.address.push(
        this.fb.group({
          client_address_id: new FormControl(
            option == 1 ? addressData.client_address_id : ""
          ),
          is_deleted: new FormControl(
            option == 1
              ? addressData.is_deleted
                ? addressData.is_deleted
                : 0
              : 0
          ),
          address_type: new FormControl(
            option == 1 ? addressData.address_type : [],
            [Validators.required]
          ),
          address_line_1: new FormControl(
            option == 1 ? addressData.address_line_1 : "",
            [
              // Validators.required
            ]
          ),
          address_line_2: new FormControl(
            option == 1 ? addressData.address_line_2 : ""
          ),
          // country_id: new FormControl(option == 1 ? addressData.country_id : '', [
          //     Validators.required
          // ]),
          // province_id: new FormControl(option == 1 ? addressData.province_name : '', [
          //     Validators.required
          // ]),
          // city_id: new FormControl(option == 1 ? addressData.city_name : '', [
          //     Validators.required
          // ]),
          country_id: new FormControl(option == 1 ? addressData.country_id : ""),
          province_id: new FormControl(
            option == 1 ? addressData.province_name : ""
          ),
          city_id: new FormControl(option == 1 ? addressData.city_name : ""),
          selVal: new FormControl(
            option == 1 ? addressData.selVal : { state: [], city: [], selectedAddressType : [] }
          ),
          // postal_code: new FormControl(option == 1 ? addressData.postal_code : '', [
          //     Validators.required,
          //     Validators.minLength(3),
          //     Validators.maxLength(10),
          //     Validators.pattern(this.constant.POSTAL_CODE_PATTERN)
          // ]),
          postal_code: new FormControl(
            option == 1 ? addressData.postal_code : ""
          ),
          latitude: new FormControl(option == 1 ? addressData.latitude : 0),
          longitude: new FormControl(option == 1 ? addressData.longitude : 0)
        })
      );
      console.log(this.address);
      this.contactAddrList.push({
        id:
          this.contactAddrList.length == 0
            ? 1
            : this.contactAddrList[this.contactAddrList.length - 1].id + 1,
        name: ""
      });
      setTimeout(function() {
        self.mapInit(self.address.length - 1);
      }, 500);
    }
  
    mapInit(addressIndx) {
      try {
        this.addressList.forEach(addressInstance => {
          console.log(addressInstance);
          let self = this;
          self.util.mapInit(
            self.mapsAPILoader,
            addressInstance,
            self.ngZone,
            this.getAddressAt(addressIndx).get("address_line_1"),
            [
              this.getAddressAt(addressIndx).get("country_id"),
              this.getAddressAt(addressIndx).get("province_id"),
              this.getAddressAt(addressIndx).get("city_id"),
              this.getAddressAt(addressIndx).get("postal_code"),
              { countries: self.countries },
              this.getAddressAt(addressIndx).get("latitude"),
              this.getAddressAt(addressIndx).get("longitude")
            ]
          );
          // self.util.mapInit(self.mapsAPILoader, addressInstance, self.ngZone, this.getAddressAt(this.currentGoogleAuto).get('address_line_1'), [ this.getAddressAt(this.currentGoogleAuto).get('country_id'), this.getAddressAt(this.currentGoogleAuto).get('province_id'), this.getAddressAt(this.currentGoogleAuto).get('city_id'), this.getAddressAt(this.currentGoogleAuto).get('postal_code'), { 'countries': self.countries }, this.getAddressAt(this.currentGoogleAuto).get('latitude'), this.getAddressAt(this.currentGoogleAuto).get('longitude') ]);
        });
      } catch (err) {
        this.global.addException("Add Client", "mapInit()", err);
      }
    }
  
    addContact(contactIndx, option, contactData: any = {}) {
      this.submitted = false;
      this.contacts.push(
        this.fb.group({
          client_contact_id: new FormControl(
            option == 1 ? contactData.client_contact_id : ""
          ),
          is_deleted: new FormControl(
            option == 1
              ? contactData.is_deleted
                ? contactData.is_deleted
                : 0
              : 0
          ),
          address: new FormControl(option == 1 ? contactData.address : []),
          address_index_id: new FormControl([]),
          contact_type: new FormControl(
            option == 1 ? contactData.contact_type : ""
          ),
          name: new FormControl(option == 1 ? contactData.name : "", [
            // Validators.required,
            Validators.minLength(2),
            Validators.maxLength(200)
          ]),
          email_id: new FormControl(option == 1 ? contactData.email_id : "", [
            // Validators.required,
            Validators.pattern(this.constant.EMAIL_PATTERN)
          ]),
          phone_no: new FormControl(option == 1 ? contactData.phone_no : "", [
            // Validators.required,
            Validators.pattern(this.constant.PHONE_PATTERN)
          ]),
          selAdd: new FormControl(option == 1 ? contactData.selAdd : [])
        })
      );
      if (
        option != 1 &&
        this.addClientFm.get("client_type").value == "Individual"
      ) {
        this.updateContactName();
      }
    }
  
    removeAddress(addrIndx) {
      try {
        this.errMsg = "";
        this.isError = false;
        if (
          this.addClientFm
            .get("address")
            .value.filter(item => item.is_deleted == 0).length == 1 &&
          this.addClientFm
            .get("contacts")
            .value.filter(item => item.is_deleted == 0).length > 0
        ) {
          this.errMsg = "To remove all address first remove all contact.";
          this.isError = true;
          return;
        }
  
        let oldArr = JSON.parse(JSON.stringify(this.contactAddrList));
        for (let i = 0; i < this.contacts.length; i++) {
          for (
            let j = 0;
            j < this.getcontactsAt(i).get("address").value.length;
            j++
          ) {
            let conAdd = this.contactAddrList.filter(
              item => item.id == this.getcontactsAt(i).get("address").value[j]
            );
            if (conAdd.length > 0) {
              if (
                this.getAddressForContact(
                  addrIndx,
                  this.address.at(addrIndx)
                ).split(":")[1] == conAdd[0].name.split(":")[1]
              ) {
                let oldIndxArr = JSON.parse(
                  JSON.stringify(this.getcontactsAt(i).get("address").value)
                );
                oldIndxArr.splice(j, 1);
                this.getcontactsAt(i)
                  .get("address")
                  .setValue(oldIndxArr);
              }
            }
          }
        }
  
        this.getAddressAt(addrIndx).get("client_address_id").value == ""
          ? this.address.removeAt(addrIndx)
          : this.getAddressAt(addrIndx)
              .get("is_deleted")
              .setValue(1);
        oldArr.splice(addrIndx, 1);
        this.contactAddrList = oldArr;
        this.ref.tick();
      } catch (err) {
        this.global.addException("Add Client", "removeAddress()", err);
      }
    }
    removeContact(conIndx) {
      //this.contacts.removeAt(conIndx);
      this.getcontactsAt(conIndx).get("client_contact_id").value == ""
        ? this.contacts.removeAt(conIndx)
        : this.getcontactsAt(conIndx)
            .get("is_deleted")
            .setValue(1);
    }
  
    addFields(option, valObj: any = {}): void {
      let validatorsArr: any =
        valObj.optionalStatus == "False" ? [Validators.required] : [];
      this.additional_fields.push(
        new FormGroup({
          label: new FormControl(valObj.label),
          dataType: new FormControl(valObj.dataType),
          optionalStatus: new FormControl(valObj.optionalStatus),
          data: new FormControl(option == "1" ? valObj.data : "", [
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
        if (form.valid) {
          for (let i = 0; i < form.value.additional_fields.length; i++) {
            if (form.value.additional_fields[i].dataType == "Date") {
              form.value.additional_fields[i].data = this.util.getDDMMYYYYDate(
                form.value.additional_fields[i].data
              );
            }
          }
          for (let i = 0; i < form.value.address.length; i++) {
            form.value.address[i].selVal.selectedAddressType = [];
            for (let j = 0; j < form.value.address[i].address_type.length; j++) {
              form.value.address[i].selVal.selectedAddressType[
                j
              ] = this.addressTypeList.filter(
                item => item.id == form.value.address[i].address_type[j]
              )[0].name;
            }
          }
          console.log(form.value);
          sessionStorage.setItem("client", JSON.stringify(form.value));
          this.router.url.split("/")[2] == "csa-onboarding"
            ? this.router.navigate(["/crm/csa-onboarding/client-review"])
            : this.router.navigate(["/crm/csa/client-review"]);
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
          for (let i = 0; i < form.value.additional_fields.length; i++) {
            if (form.value.additional_fields[i].dataType == "Date") {
              form.value.additional_fields[i].data = this.util.getDDMMYYYYDate(
                form.value.additional_fields[i].data
              );
            }
          }
          for (let i = 0; i < form.value.address.length; i++) {
            form.value.address[i].selVal.selectedAddressType = [];
            for (let j = 0; j < form.value.address[i].address_type.length; j++) {
  
              form.value.address[i].selVal.selectedAddressType[
                j
              ] = this.addressTypeList.filter(
                item => item.id == form.value.address[i].address_type[j]
              )[0] ? this.addressTypeList.filter(
                  item => item.id == form.value.address[i].address_type[j]
                )[0].name : form.value.address[i].address_type[j];
            }
          }
          let reqObject: any = form.value;
          reqObject.client_id = this.editClientObj.client_id;
          for (let i = 0; i < reqObject.contacts.length; i++) {
            reqObject.contacts[i].phone_no = self.util.unMaskPhoneNumber(
              reqObject.contacts[i].phone_no
            );
            for (let j = 0; j < reqObject.contacts[i].address.length; j++) {
              reqObject.contacts[i].address_index_id[j] =
                reqObject.contacts[i].address[j] - 1;
            }
            reqObject.contacts[i].address = JSON.parse(
              JSON.stringify(reqObject.contacts[i].selAdd)
            );
            //delete reqObject.contacts[i].selAdd;
          }
          for (let i = 0; i < reqObject.address.length; i++) {
            reqObject.address[i].address_type = JSON.parse(
              JSON.stringify(reqObject.address[i].selVal.selectedAddressType)
            );
            //delete reqObject.address[i].selVal;
          }
          self.util.addSpinner("updateClient", "Update");
          this.http.doPost("clients/edit", reqObject, function(
            error: boolean,
            response: any
          ) {
            self.util.removeSpinner("updateClient", "Update");
            if (error) {
              self.errMsg = response.message;
              self.isError = true;
              console.log(response.message);
            } else {
              self.router.url.split("/")[2] == "csa-onboarding"
                ? self.router.navigate(["/crm/csa-onboarding/client-list/0"])
                : self.router.navigate(["/crm/csa/client-list/0"]);
              self.crm.isEditFromList = false;
              self.admin.updateList(response.status);
              self.crm.updateClientId = reqObject.client_id;
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
        : this.router.navigate(["/crm/csa/client-list/0"]);
      this.crm.isEditFromList = false;
    }
  }