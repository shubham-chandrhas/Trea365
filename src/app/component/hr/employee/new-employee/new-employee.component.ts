import {
  Component,
  OnInit,
  ApplicationRef,
  NgZone,
  ViewChild,
  ElementRef
} from "@angular/core";
import { Router, ActivatedRoute, RoutesRecognized } from "@angular/router";
import {
  FormControl,
  Validators,
  FormGroup,
  FormBuilder,
  FormArray,
  NgForm
} from "@angular/forms";
import {
  IMultiSelectOption,
  IMultiSelectSettings,
  IMultiSelectTexts
} from "angular-2-dropdown-multiselect";
import { UploadEvent, UploadFile } from "ngx-file-drop";
import { Observable } from "rxjs";
import { map, startWith } from "rxjs/operators";
import { MapsAPILoader } from "@agm/core";

import { HrService } from "../../hr.service";
import { UtilService } from "../../../../shared/service/util.service";
import { HttpService } from "../../../../shared/service/http.service";
import { ConstantsService } from "../../../../shared/service/constants.service";
import { GlobalService } from "../../../../shared/service/global.service";
import { Ng2ImgMaxService } from "ng2-img-max/dist/src/ng2-img-max.service";
import { DomSanitizer } from "@angular/platform-browser";

@Component({
  selector: "app-new-employee",
  templateUrl: "./new-employee.component.html",
  styleUrls: ["./new-employee.component.css"]
})
export class NewEmployeeComponent implements OnInit {
  pageData: any = {
    permissionList: [],
    errMsg: "",
    isError: false,
    submitted: false,
    newFileUpload: false,
    isThumbnailSet: false,
    dragOver: false,
    imgDocPriArr: [],
    action: "add",
    additionalFields: [],
    businessTypeList: [],
    emailAvailability: "",
    usernameAvailability: "",
    employeeIdAvailability: ""
  };
  mulSelSettings: IMultiSelectSettings = { displayAllSelectedText: true };
  serviceTypeList: IMultiSelectOption[] = [];
  selectText: IMultiSelectTexts = { defaultTitle: "" };

  public isCountry: boolean = false;
  public isEdit: boolean = false;
  public countries: any = [];

  addEmpFm: FormGroup;
  //public isError:boolean = false;
  isTSA: boolean = false; //if Trea Super Admin is logged in
  routStrArr;
  loggedInUser;
  autoNumber: number;
  filteredPermission: Observable<string[]>;
  filteredBusinessType: Observable<string[]>;

  businessTypeList: IMultiSelectOption[] = [];

  @ViewChild("search")
  public searchElementRef: ElementRef;
  uploadedImage: File;
  imagePreview: string | ArrayBuffer;

  constructor(
    public router: Router,
    private route: ActivatedRoute,
    private hr: HrService,
    private fb: FormBuilder,
    private http: HttpService,
    private ref: ApplicationRef,
    public util: UtilService,
    private mapsAPILoader: MapsAPILoader,
    public constant: ConstantsService,
    private ngZone: NgZone,
    private global: GlobalService,
    private ng2ImgMax: Ng2ImgMaxService,
    public sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    this.util.setWindowHeight();
    this.util.setPageTitle(this.route);
    this.autoNumber = this.util.getUniqueString();

    try {
      this.pageData.companyId = this.route.snapshot.paramMap.get("id");
      this.router.url.split("/")[2] == "csa-onboarding"
        ? this.util.menuChange({ menu: "guide", subMenu: "" })
        : this.util.menuChange({ menu: 6, subMenu: 28 });
      this.pageData.currentUrl = this.router.url.split("/")[2];
      this.routStrArr = this.router.url.split("/");
      this.loggedInUser = JSON.parse(atob(localStorage.getItem("USER")));
      console.log(this.routStrArr[this.routStrArr.length - 1]);
      this.createForm("0");
      this.loggedInUser.role_id == "1"
        ? (this.getServiceTypeList(this.pageData.companyId),
          this.getPermissionList(this.pageData.companyId))
        : (this.getServiceTypeList(), this.getPermissionList());
      // this.getServiceTypeList();
      //this.getCountries();
    } catch (err) {
      this.global.addException("new employee", "ngOnInit()", err);
    }
  }

  setEmployeeData(): void {
    let empInfo: any = {};
    if (sessionStorage.getItem("emp")) {
      empInfo = JSON.parse(sessionStorage.getItem("emp"));
      this.pageData.action = JSON.parse(sessionStorage.getItem("emp")).id
        ? "edit"
        : "add";
      if (this.pageData.action == "edit") {
        if (empInfo.user_address) {
          empInfo.address1 = empInfo.user_address.address_line_1
            ? empInfo.user_address.address_line_1
            : "";
          empInfo.address2 = empInfo.user_address.address_line_2
            ? empInfo.user_address.address_line_2
            : "";
          empInfo.countryName = empInfo.user_address.country_details
            ? empInfo.user_address.country_details.country_name
            : "";
          empInfo.provinceName = empInfo.user_address.province_details
            ? empInfo.user_address.province_details.province_name
            : "";
          empInfo.countryId = empInfo.user_address.country_details
            ? empInfo.user_address.country_details.country_id
            : "";
          empInfo.provinceId = empInfo.user_address.province_details
            ? empInfo.user_address.province_details.province_name
            : "";
          empInfo.cityId = empInfo.user_address.city_details
            ? empInfo.user_address.city_details.city_name
            : "";
          empInfo.postalCode = empInfo.user_address.postal_code
            ? empInfo.user_address.postal_code
            : "";
          empInfo.latitude = empInfo.user_address.latitude
            ? empInfo.user_address.latitude
            : "";
          empInfo.longitude = empInfo.user_address.longitude
            ? empInfo.user_address.longitude
            : "";
        }
      }
      if (
        JSON.parse(sessionStorage.getItem("emp")).id &&
        sessionStorage.getItem("previousPage") == "list"
      ) {
        let userServices: any[] = [];
        let businessServices: any[] = [];
        console.log(empInfo);
        for (let i = 0; i < empInfo.user_services.length; i++) {
          userServices.push(empInfo.user_services[i].service_type_id);
          //empInfo.business_type = empInfo.user_services[i].business_type_id;
        }

        for (let i = 0; i < empInfo.user_business_types.length; i++) {
          if (
            empInfo.user_business_types[i] &&
            empInfo.user_business_types[i].business_type_id
          ) {
            businessServices.push(
              empInfo.user_business_types[i].business_type_id
            );
          }
        }

        if (empInfo.docs) {
          this.pageData.isThumbnailSet =
            empInfo.docs.filter(item => item.docType == "img").length > 0
              ? true
              : false;
          for (let i = 0; i < empInfo.docs.length; i++) {
            let fileName: string[] =
              empInfo.docs[i].docType == "img"
                ? empInfo.docs[i].image_name.split(".")
                : empInfo.docs[i].doc_name.split(".");
            fileName.pop();
            this.pageData.imgDocPriArr.push({
              fileId:
                empInfo.docs[i].docType == "img"
                  ? empInfo.docs[i].image_id
                  : empInfo.docs[i].doc_id,
              extension:
                empInfo.docs[i].docType == "img"
                  ? empInfo.docs[i].image_name.split(".").pop()
                  : empInfo.docs[i].doc_name.split(".").pop(),
              imgPath:
                empInfo.docs[i].docType == "img"
                  ? empInfo.docs[i].image_path
                  : empInfo.docs[i].doc_path,
              fileName: fileName.join("."),
              thumbnail:
                empInfo.docs[i].docType == "img"
                  ? empInfo.docs[i].set_as_thumbnail
                  : -1,
              description:
                empInfo.docs[i].docType == "img"
                  ? empInfo.docs[i].image_desc
                    ? empInfo.docs[i].image_desc
                    : ""
                  : empInfo.docs[i].doc_desc
                  ? empInfo.docs[i].doc_desc
                  : "",
              isDelete: 0
            });
          }
        }
        empInfo.user_services = userServices;
        empInfo.business_type = businessServices;
      } else {
        this.pageData.imgDocPriArr = this.util.getDocumentObj();
      }

      for (let i = 0; i < this.pageData.businessTypeList.length; i++) {
        if (
          this.pageData.businessTypeList[i].businessTypeId ==
          empInfo.business_type_id
        ) {
          this.serviceTypeList = this.pageData.businessTypeList[
            i
          ].services.filter(
            item => (
              (item.id = item.serviceTypeId), (item.name = item.serviceType)
            )
          );
          break;
        }
      }

      for (let i = 0; i < empInfo.additional_fields.length; i++) {
        if (empInfo.additional_fields[i].dataType == "Date") {
          empInfo.additional_fields[i].data = this.util.stringToDate(
            empInfo.additional_fields[i].data
          );
        }
      }
      console.log(empInfo);
      this.createForm("1", empInfo);
      this.setEmpFields("1", empInfo.additional_fields);
    } else {
      this.createForm("0");
      this.loggedInUser.role_id == "1"
        ? this.getEmpFields(this.pageData.companyId)
        : this.getEmpFields();
    }
    this.getCountries();
  }

  getEmpFields(id: any = ""): void {
    let self = this;
    this.util.showProcessing("processing-spinner");
    try {
      this.http.doGet(
        id ? "extrafields?type=emp/" + id : "extrafields?type=emp",
        function(error: boolean, response: any) {
          self.util.hideProcessing("processing-spinner");
          if (error) {
          } else {
            self.pageData.additionalFields = response.data.additional_emp_fields
              ? response.data.additional_emp_fields
              : [];
            self.setEmpFields("0", self.pageData.additionalFields);
          }
        }
      );
    } catch (err) {
      this.global.addException("new employee", "getEmpFields()", err);
    }
  }

  setEmpFields(option, fields): void {
    if (fields) {
      for (let i = 0; i < fields.length; i++) {
        this.addFields(option, fields[i]);
      }
    }
  }

  keyDownFunction(event: any, form: FormGroup) {
    if (event.keyCode == 13) {
      event.preventDefault();
      return false;
    } else {
      this.createForm(form);
    }
  }

  getServiceTypeList(id: any = ""): void {
    let self = this;
    try {
      // let url;
      // if(id){
      //     url = 'service-type/'+id;
      // }else{
      //     url = 'service-type';
      // }
      // this.http.doGet(url, function(error: boolean, response: any){
      //     if(error){ console.log(response) }else{ self.serviceTypeList = response.data.filter(item => (item.id = item.service_type_id, item.name = item.service_type)); }
      // });

      this.http.doGet(id ? "businessType/" + id : "businessType", function(
        error: boolean,
        response: any
      ) {
        if (error) {
          console.log(response);
        } else {
          console.log(response);
          self.serviceTypeList = response.data.filter(
            item => (
              (item.id = item.service_type_id), (item.name = item.service_type)
            )
          );
          self.pageData.businessTypeList = response.data;
          // self.filteredBusinessType = self.business_type.valueChanges.pipe(startWith(''),map(value => self.businessTypeFilter(value)));
          self.businessTypeList = response.data.filter(
            item => (
              (item.id = item.businessTypeId), (item.name = item.businessType)
            )
          );
          self.setEmployeeData();
        }
      });
    } catch (err) {
      this.global.addException("new employee", "getServiceTypeList()", err);
    }
  }

  getSelectedBusinessType(event: any): void {
    console.log(event);
    this.serviceTypeList = [];
    if (this.pageData.action == "add") this.user_services.setValue([]);
    if (this.business_type.value.length > 0) {
      //this.business_type_id.setValue(this.business_type.value);
      let serviceTypeList = [];
      for (let i = 0; i < this.pageData.businessTypeList.length; i++) {
        if (
          this.business_type.value.indexOf(
            this.pageData.businessTypeList[i].businessTypeId
          ) > -1
        ) {
          serviceTypeList = serviceTypeList.concat(
            this.pageData.businessTypeList[i].services
          );
        }
      }
      this.serviceTypeList = serviceTypeList.filter(
        item => ((item.id = item.serviceTypeId), (item.name = item.serviceType))
      );
    }
  }
  private businessTypeFilter(value: string): string[] {
    try {
      return this.pageData.businessTypeList.filter(option =>
        option.businessType
          .toLowerCase()
          .includes(value ? value.toLowerCase() : "")
      );
    } catch (err) {
      this.global.addException("New Employee", "businessTypeFilter()", err);
    }
  }
  public validateBusinessType(event: any) {
    try {
      let businessType = event.target.value;
      let match = this.pageData.permissionList.filter(
        item => item.businessType.toLowerCase() == businessType.toLowerCase()
      );
      console.log(match);
      if (businessType == "") {
        this.business_type_id.setValue("");
        this.business_type.setValue("");
        return;
      }
      if (match.length > 0) {
        this.business_type_id.setValue(match[0].businessTypeId);
        this.business_type.setValue(match[0].businessType);
      }
    } catch (err) {
      this.global.addException("new employee", "validateBusinessType()", err);
    }
  }

  // ===============   PERMISSION  =================== //
  getPermissionList(id: any = ""): void {
    let self = this;
    try {
      let url;
      if (id) {
        url = "roles/" + id;
      } else {
        url = "roles";
      }
      this.http.doGet(url, function(error: boolean, response: any) {
        if (error) {
          console.log(response);
        } else {
          self.pageData.permissionList = response.data;
          console.log(self.pageData.permissionList);
          self.filteredPermission = self.role_name.valueChanges.pipe(
            startWith(""),
            map(value => self.permissionFilter(value))
          );
        }
      });
    } catch (err) {
      this.global.addException("new employee", "getPermissionList()", err);
    }
  }

  getSelectedPermission(permission, event: any): void {
    if (event.isUserInput) {
      console.log(permission);
      this.permission_role_id.setValue(permission.role_id);
    }
  }
  private permissionFilter(value: string): string[] {
    try {
      return this.pageData.permissionList.filter(option =>
        option.role_name
          .toLowerCase()
          .includes(value ? value.toLowerCase() : "")
      );
    } catch (err) {
      this.global.addException("new employee", "permissionFilter()", err);
    }
  }
  public validatePermission(event: any) {
    try {
      let permission = event.target.value;
      let match = this.pageData.permissionList.filter(
        item => item.role_name.toLowerCase() == permission.toLowerCase()
      );
      console.log(match);
      if (permission == "") {
        this.permission_role_id.setValue("");
        return;
      }
      if (match.length > 0) {
        this.permission_role_id.setValue(match[0].role_id);
        this.role_name.setValue(match[0].role_name);
      }
    } catch (err) {
      this.global.addException("new employee", "validatePermission()", err);
    }
  }
  // ==============   END PERMISSION  =============== //

  createForm(option, empObj: any = {}): void {
    this.addEmpFm = this.fb.group({
      first_name: new FormControl(option == "1" ? empObj.first_name : "", [
        Validators.required,
        Validators.maxLength(this.constant.DEFAULT_TEXT_MAXLENGTH)
      ]),
      last_name: new FormControl(option == "1" ? empObj.last_name : "", [
        Validators.maxLength(this.constant.DEFAULT_TEXT_MAXLENGTH)
      ]),
      employee_id: new FormControl(
        option == "1"
          ? empObj.employee_id == "-"
            ? ""
            : empObj.employee_id
          : "",
        [Validators.maxLength(30)]
      ),
      username: new FormControl(
        option == "1" ? empObj.username : "",
        option != "1"
          ? [
              Validators.required,
              Validators.minLength(8),
              Validators.maxLength(this.constant.DEFAULT_TEXT_MAXLENGTH),
              Validators.pattern(this.constant.NO_SPACE_PATTERN)
            ]
          : []
      ),
      // username:new FormControl(option == '1' ? empObj.username : '', [ Validators.required,Validators.minLength(8),
      //         Validators.maxLength(this.constant.DEFAULT_TEXT_MAXLENGTH), Validators.pattern(this.constant.NO_SPACE_PATTERN) ]),
      title: new FormControl(
        option == "1" ? (empObj.title == "-" ? "" : empObj.title) : "",
        [Validators.maxLength(30)]
      ),
      mobile_no: new FormControl(option == "1" ? empObj.mobile_no : "", [
        Validators.pattern(this.constant.PHONE_PATTERN)
      ]),
      email_id: new FormControl(option == "1" ? empObj.email_id : "", [
        Validators.required,
        Validators.pattern(this.constant.EMAIL_PATTERN)
      ]),
      work_phone: new FormControl(option == "1" ? empObj.work_phone : "", [
        Validators.pattern(this.constant.PHONE_PATTERN)
      ]),
      //permission_role:new FormControl(option == '1' ? empObj.role_name : '', [Validators.required]),
      role_name: new FormControl(
        option == "1" ? (empObj.role_name == "-" ? "" : empObj.role_name) : "",
        [Validators.required]
      ),
      permission_role_id: new FormControl(
        option == "1" ? empObj.permission_role_id : "",
        option == "1" && empObj.role_id == 2 ? [] : [Validators.required]
      ),
      wage_frequency: new FormControl(
        option == "1" ? empObj.wage_frequency : ""
      ),
      wage_amount: new FormControl(option == "1" ? empObj.wage_amount : "", [
        Validators.min(0),
        Validators.pattern(this.constant.AMOUNT_PATTERN)
      ]),
      emergency_contact: new FormControl(
        option == "1" ? empObj.emergency_contact : "",
        [Validators.maxLength(30)]
      ),
      emergency_number: new FormControl(
        option == "1" ? empObj.emergency_number : "",
        [Validators.pattern(this.constant.PHONE_PATTERN)]
      ),
      relationship: new FormControl(option == "1" ? empObj.relationship : "", [
        Validators.maxLength(30)
      ]),
      user_services: new FormControl(option == "1" ? empObj.user_services : []),
      business_type: new FormControl(option == "1" ? empObj.business_type : []),
      business_type_id: new FormControl(
        option == "1" ? empObj.business_type_id : []
      ),
      additional_fields: this.fb.array([]),
      days_off: this.fb.array([]),
      address1: new FormControl(option == "1" ? empObj.address1 : "", [
        Validators.maxLength(this.constant.DEFAULT_TEXT_MAXLENGTH)
      ]),
      address2: new FormControl(option == "1" ? empObj.address2 : "", [
        Validators.maxLength(this.constant.DEFAULT_TEXT_MAXLENGTH)
      ]),
      countryName: new FormControl(option == "1" ? empObj.countryName : ""),
      provinceName: new FormControl(option == "1" ? empObj.provinceName : ""),
      // countryId:new FormControl(option == '1' ? empObj.countryId : '', [
      //     Validators.required
      // ]),
      // provinceId:new FormControl(option == '1' ? empObj.provinceId : '', [
      //     Validators.required
      // ]),
      // cityId:new FormControl(option == '1' ? empObj.cityId : '', [
      //     Validators.required,
      // ]),
      // postalCode:new FormControl(option == '1' ? empObj.postalCode : '', [
      //     Validators.required,
      //     Validators.minLength(3),
      //     Validators.maxLength(10),
      //     Validators.pattern(this.constant.POSTAL_CODE_PATTERN)
      // ]),
      role_id: new FormControl(option == "1" ? empObj.role_id : ""),
      countryId: new FormControl(option == "1" ? empObj.countryId : ""),
      provinceId: new FormControl(option == "1" ? empObj.provinceId : ""),
      cityId: new FormControl(option == "1" ? empObj.cityId : ""),
      postalCode: new FormControl(option == "1" ? empObj.postalCode : ""),
      latitude: new FormControl(option == "1" ? empObj.latitude : ""),
      longitude: new FormControl(option == "1" ? empObj.longitude : "")
    });
    if (option != 1) {
      this.addDaysOff(0);
    } else {
      this.addDaysOff(option, empObj.days_off[0]);
    }
  }

  get first_name() {
    return this.addEmpFm.get("first_name");
  }
  get last_name() {
    return this.addEmpFm.get("last_name");
  }
  get employee_id() {
    return this.addEmpFm.get("employee_id");
  }
  get username() {
    return this.addEmpFm.get("username");
  }
  get title() {
    return this.addEmpFm.get("title");
  }
  get country_code() {
    return this.addEmpFm.get("country_code");
  }
  get mobile_no() {
    return this.addEmpFm.get("mobile_no");
  }
  get email_id() {
    return this.addEmpFm.get("email_id");
  }
  get work_phone() {
    return this.addEmpFm.get("work_phone");
  }
  //get permission_role() { return this.addEmpFm.get('permission_role'); }
  get role_name() {
    return this.addEmpFm.get("role_name");
  }
  get permission_role_id() {
    return this.addEmpFm.get("permission_role_id");
  }
  get wage_frequency() {
    return this.addEmpFm.get("wage_frequency");
  }
  get wage_amount() {
    return this.addEmpFm.get("wage_amount");
  }
  get emergency_contact() {
    return this.addEmpFm.get("emergency_contact");
  }
  get emergency_number() {
    return this.addEmpFm.get("emergency_number");
  }
  get relationship() {
    return this.addEmpFm.get("relationship");
  }
  get company_id() {
    return this.addEmpFm.get("company_id");
  }
  get role_id() {
    return this.addEmpFm.get("role_id");
  }
  get user_services() {
    return this.addEmpFm.get("user_services");
  }
  get business_type() {
    return this.addEmpFm.get("business_type");
  }
  get business_type_id() {
    return this.addEmpFm.get("business_type_id");
  }
  get additional_fields(): FormArray {
    return (<FormArray>this.addEmpFm.get("additional_fields")) as FormArray;
  }
  get days_off(): FormArray {
    return (<FormArray>this.addEmpFm.get("days_off")) as FormArray;
  }
  get address1() {
    return this.addEmpFm.get("address1");
  }
  get address2() {
    return this.addEmpFm.get("address2");
  }
  get countryName() {
    return this.addEmpFm.get("countryName");
  }
  get countryId() {
    return this.addEmpFm.get("countryId");
  }
  get provinceName() {
    return this.addEmpFm.get("provinceName");
  }
  get provinceId() {
    return this.addEmpFm.get("provinceId");
  }
  get cityName() {
    return this.addEmpFm.get("cityName");
  }
  get cityId() {
    return this.addEmpFm.get("cityId");
  }
  get postalCode() {
    return this.addEmpFm.get("postalCode");
  }

  addFields(option, valObj: any = {}): void {
    try {
      let validatorsArr: any =
        valObj.optionalStatus == "False" ? [Validators.required] : [];
      this.routStrArr = this.router.url.split("/");
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
    } catch (err) {
      this.global.addException("new employee", "addFields()", err);
    }
  }

  addDaysOff(option, valObj: any = {}) {
    try {
      this.days_off.push(
        new FormGroup({
          monday: new FormControl(option == "1" ? valObj.monday : false),
          tuesday: new FormControl(option == "1" ? valObj.tuesday : false),
          wednesday: new FormControl(option == "1" ? valObj.wednesday : false),
          thursday: new FormControl(option == "1" ? valObj.thursday : false),
          friday: new FormControl(option == "1" ? valObj.friday : false),
          saturday: new FormControl(option == "1" ? valObj.saturday : false),
          sunday: new FormControl(option == "1" ? valObj.sunday : false)
        })
      );
    } catch (err) {
      this.global.addException("new employee", "addDaysOff()", err);
    }
  }
  next(form: FormGroup): void {
    this.pageData.submitted = true;
    try {
      if (
        this.pageData.emailAvailability == "0" ||
        this.pageData.usernameAvailability == "0" ||
        this.pageData.employeeIdAvailability
      ) {
        return;
      }
      for (let i = 0; i < this.pageData.imgDocPriArr.length; i++) {
        if (
          this.pageData.imgDocPriArr[i].fileName == "" &&
          this.pageData.imgDocPriArr[i].isDelete != 1
        ) {
          this.pageData.errMsg = "File name is required.";
          this.pageData.isError = true;
          return;
        }
      }

      for (let i = 0; i < form.value.additional_fields.length; i++) {
        if (form.value.additional_fields[i].dataType == "Date") {
          form.value.additional_fields[i].data = this.util.getDDMMYYYYDate(
            form.value.additional_fields[i].data
          );
        }
      }
      console.log(form);
      if (form.valid) {
        if (form.value.role_id == 2) {
          form.value.selPermission = form.value.role_name;
        } else {
          form.value.selPermission = this.pageData.permissionList.filter(
            item => item.role_id == form.value.permission_role_id
          )[0].role_name;
        }
        form.value.selUserServices = [];
        for (let i = 0; i < form.value.user_services.length; i++) {
          if (this.serviceTypeList.length > 0) {
            form.value.selUserServices.push(
              this.serviceTypeList.filter(
                item => item.id == form.value.user_services[i]
              )[0].name
            );
          }
        }
        this.util.setDocumentObj(this.pageData.imgDocPriArr);
        form.value.id =
          this.pageData.action == "edit"
            ? JSON.parse(sessionStorage.getItem("emp")).id
            : 0;
        sessionStorage.setItem("emp", JSON.stringify(form.value));
        if (this.loggedInUser.role_id == "1") {
          this.router.navigate([
            "/su/tsa/user-review/" + this.pageData.companyId
          ]);
        } else {
          this.router.url.split("/")[2] == "csa-onboarding"
            ? this.router.navigate(["/hr/csa-onboarding/employee-review"])
            : this.router.navigate(["/hr/csa/employee-review"]);
        }
      }
    } catch (err) {
      this.global.addException("new employee", "next()", err);
    }
  }

  cancel(): void {
    // console.log(this.router.url.split('/')[1]);
    this.router.url.split("/")[1] == "su"
      ? this.router.navigate([
          "/su/tsa/users-list/" + this.pageData.companyId + "/0"
        ])
      : this.router.url.split("/")[2] == "csa-onboarding"
      ? this.router.navigate(["/csa-onboarding/guide"])
      : this.router.navigate(["/hr/csa/employee-list/0"]);
  }

  onFileChange(event): void {
    let self = this;
    let extension: string = "";
    let fileDetailsObj: any = {};
    self.pageData.errMsg = "";
    self.pageData.isError = false;
    let fileList: FileList = event.target.files;
    if (fileList.length > 0) {
      // console.log(event);
      let image = event.target.files[0];
      self.ng2ImgMax.resizeImage(image, 1500, 750).subscribe(
        result => {
          self.uploadedImage = new File([result], result.name);
          self.getImagePreview(self.uploadedImage);
          console.log("Upload image");
          console.log(self.uploadedImage);
        },
        error => {
          console.log("😢Oh no!", error);
        }
      );
      let imgCount = 0;
      self.addImg(imgCount, fileList, fileDetailsObj, extension);
    }
  }

  getImagePreview(file: File) {
    let self = this;
    const reader: FileReader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      self.imagePreview = reader.result;
    };
  }

  addImg(imgCount: number, fileList, fileDetailsObj, extension): void {
    let self = this;
    try {
      console.log("Resize image");
      console.log(fileList);
      let file: File = fileList[imgCount],
        fileName: string[] = [];
      fileDetailsObj = { fileId: 0, isDelete: 0 };
      fileDetailsObj.thumbnail = 0;
      fileDetailsObj.fileName =
        fileList && fileList[imgCount].name ? fileList[imgCount].name : "";
      extension = fileList[imgCount].name.split(".").pop();
      fileName = fileList[imgCount].name.split(".");
      fileName.pop();
      if (
        extension == "jpg" ||
        extension == "png" ||
        extension == "pdf" ||
        extension == "jpeg"
      ) {
        if (fileList[imgCount].size / 1048576 < 10) {
          self.convertToBase64(file, function(base64) {
            fileDetailsObj.imgPath = JSON.parse(JSON.stringify(base64));
            fileDetailsObj.description = "";
            fileDetailsObj.fileName = fileName.join(".");
            fileDetailsObj.extension = extension;
            fileDetailsObj.file = file;
            self.pageData.imgDocPriArr.push(fileDetailsObj);
            self.ref.tick();

            if (!self.pageData.isThumbnailSet) {
              if (
                extension == "jpg" ||
                extension == "png" ||
                extension == "jpeg"
              ) {
                fileDetailsObj.thumbnail = 1;
                self.pageData.isThumbnailSet = true;
                self.ref.tick();
              }
            }

            if (self.pageData.imgDocPriArr.length > 0) {
              self.pageData.newFileUpload = false;
              self.ref.tick();
            }

            if (imgCount < fileList.length - 1)
              return self.addImg(
                ++imgCount,
                fileList,
                fileDetailsObj,
                extension
              );
          });
        } else {
          self.pageData.errMsg = "File must be less than 10 MB.";
          self.pageData.isError = true;
          self.ref.tick();
        }
      } else {
        self.pageData.isError = true;
        self.pageData.errMsg = "Only jpg, jpeg, png or pdf file allowed.";
        self.ref.tick();
      }
    } catch (err) {
      this.global.addException("new employee", "addImg()", err);
    }
  }

  convertToBase64(file, callback): void {
    let reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (fileLoadedEvent: any) => {
      return callback(fileLoadedEvent.target.result);
    };
  }

  onSelectionChange(index): void {
    for (var i = 0; i < this.pageData.imgDocPriArr.length; i++) {
      this.pageData.imgDocPriArr[i].thumbnail = 0;
    }
    this.pageData.imgDocPriArr[index].thumbnail = 1;
  }

  changeUploadFileFlage(): void {
    this.pageData.newFileUpload = true;
    this.ref.tick();
  }

  // removeImgDoc(index): void{
  removeImgDoc(id, index, option) {
    console.log(id);
    try {
      let isThumbnail =
        this.pageData.imgDocPriArr[index].thumbnail == 1 ? true : false;
      let newList = this.pageData.imgDocPriArr.filter(
        item => item.isDelete == 0 && item.extension != "pdf"
      );
      let self = this;
      self.pageData.isError = false;
      self.pageData.errMsg = "";
      // let reqObj = { "manufPartFileId" : id }
      self.ref.tick();
      if (this.pageData.imgDocPriArr[index].fileId == 0) {
        if (isThumbnail && newList.length > 1) {
          self.pageData.isError = true;
          self.pageData.errMsg =
            "You can not remove thumbnail image. If you want to remove thumbnail image please set other image as thumbnail.";
          self.ref.tick();
          return;
        }
        if (
          this.pageData.imgDocPriArr[index].extension != "pdf" &&
          this.pageData.imgDocPriArr[index].thumbnail == 1
        ) {
          this.pageData.isThumbnailSet = false;
        }
        this.pageData.imgDocPriArr.splice(index, 1);
        this.pageData.imgDocPriArr.length == 0
          ? (this.pageData.newFileUpload = true)
          : "";
        return;
      }
      if (option == "img") {
        if (isThumbnail && newList.length > 1) {
          self.pageData.isError = true;
          self.pageData.errMsg =
            "You can not remove thumbnail image. If you want to remove thumbnail image please set other image as thumbnail.";
          self.ref.tick();
        } else {
          this.pageData.imgDocPriArr[index].isDelete = 1;
          this.pageData.imgDocPriArr[index].thumbnail == 1
            ? (this.pageData.isThumbnailSet = false)
            : "";
          newList.length == 0 ? (this.pageData.newFileUpload = true) : "";
          self.ref.tick();
        }
      } else {
        self.ref.tick();
      }
    } catch (err) {
      this.global.addException("new employee", "removeImgDoc()", err);
    }
  }

  dropped(event: UploadEvent, option): void {
    let self = this;
    let extension: string = "";
    let fileDetailsObj: any = {};
    self.pageData.errMsg = "";
    self.pageData.isError = false;
    for (let file of event.files) {
      file.fileEntry.file(info => {
        if (info) {
          self.addImg(0, [info], fileDetailsObj, extension);
          self.pageData.dragOver = false;
          this.ref.tick();
        }
      });
    }
  }

  fileOver(event): void {
    this.pageData.dragOver = true;
    this.ref.tick();
  }
  fileLeave(event): void {
    this.pageData.dragOver = false;
    this.ref.tick();
  }

  validateUsername(event: any) {
    let self = this;
    if (!self.username.valid && !self.username.dirty) {
      return;
    }

    var reqObj = {
      username: this.username.value,
      user_id:
        this.pageData.action == "add"
          ? ""
          : JSON.parse(sessionStorage.getItem("emp")).id
    };

    try {
      // alert(reqObj.user_id);
      this.http.doPost("check-availability", reqObj, function(
        error: boolean,
        response: any
      ) {
        if (error) {
          console.log(response.message);
        } else {
          self.pageData.usernameAvailability = response.data.is_available;
          console.log(self.pageData.usernameAvailability);
        }
      });
    } catch (err) {
      this.global.addException("User list", "validateUser()", err);
    }
  }

  validateEmail(event: any) {
    let self = this;
    if (!self.email_id.valid && !self.email_id.dirty) {
      return;
    }
    var reqObj = {
      email: this.email_id.value,
      user_id:
        this.pageData.action == "add"
          ? ""
          : JSON.parse(sessionStorage.getItem("emp")).id
    };
    try {
      this.http.doPost("check-availability", reqObj, function(
        error: boolean,
        response: any
      ) {
        if (error) {
          console.log(response.message);
        } else {
          self.pageData.emailAvailability = response.data.is_available;
          console.log(self.pageData.emailAvailability);
        }
      });
    } catch (err) {
      this.global.addException("email list", "validateEmail()", err);
    }
  }

  event(event: any): any {
    throw new Error("Method not implemented.");
  }

  validateEmployeeID(event: any) {
    let self = this;
    if (!self.employee_id.valid && !self.employee_id.dirty) {
      return;
    }
    var reqObj = {
      employee_id: this.employee_id.value,
      user_id:
        this.pageData.action == "add"
          ? ""
          : JSON.parse(sessionStorage.getItem("emp")).id
    };
    try {
      if (this.employee_id.value != "") {
        this.http.doPost("employee/is-unique-employee-id", reqObj, function(
          error: boolean,
          response: any
        ) {
          if (error) {
            console.log(response.message);
          } else {
            self.pageData.employeeIdAvailability = response.data.is_available;
            console.log(self.pageData.employeeIdAvailability);
          }
        });
      }
    } catch (err) {
      this.global.addException(
        "check employee id",
        "validateEmployeeId()",
        err
      );
    }
    // this.global.checkUniqueNess(this.employee_id,'employee/is-unique-employee-id/', function(response){
    //     self.pageData.employeeIdAvailability = response;
    // });
  }

  getCountries() {
    try {
      var self = this;
      // this.isCountry = true;
      this.isCountry = this.isEdit ? false : true;
      this.http.doGet("country", function(error: boolean, response: any) {
        if (error) {
          self.countries = [];
        } else {
          self.countries = response.data;
          //self.filteredCountry = self.countryName.valueChanges.pipe(startWith(''),map(value => self.countryFilter(value)));
          self.isCountry = false;

          self.util.mapInit(
            self.mapsAPILoader,
            self.searchElementRef,
            self.ngZone,
            self.addEmpFm.get("address1"),
            [
              self.addEmpFm.get("countryId"),
              self.addEmpFm.get("provinceId"),
              self.addEmpFm.get("cityId"),
              self.addEmpFm.get("postalCode"),
              { countries: self.countries },
              self.addEmpFm.get("latitude"),
              self.addEmpFm.get("longitude")
            ]
          );
        }
      });
    } catch (err) {
      this.global.addException("Add Employee", "getCountries()", err);
    }
  }
}
