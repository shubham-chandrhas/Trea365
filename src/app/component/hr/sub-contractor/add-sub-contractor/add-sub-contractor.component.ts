import {
  Component,
  OnInit,
  ApplicationRef,
  NgZone,
  ViewChild,
  ElementRef
} from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
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

import { UtilService } from "../../../../shared/service/util.service";
import { ConstantsService } from "../../../../shared/service/constants.service";
import { HttpService } from "../../../../shared/service/http.service";
import { HrService } from "../../hr.service";
import { GlobalService } from "../../../../shared/service/global.service";

@Component({
  selector: "app-add-sub-contractor",
  templateUrl: "./add-sub-contractor.component.html",
  styleUrls: ["./add-sub-contractor.component.css"]
})
export class AddSubContractorComponent implements OnInit {
  //public errMsg:string = '';
  //public isError:boolean = false;
  //public submitted:boolean = false;
  addSubContFrm: FormGroup;
  pageData: any = {
    errMsg: "",
    isError: false,
    submitted: false,
    newFileUpload: false,
    isThumbnailSet: false,
    dragOver: false,
    imgDocPriArr: [],
    action: "add",
    businessTypeList: []
  };
  mulSelSettings: IMultiSelectSettings = { displayAllSelectedText: true };
  serviceTypeList: IMultiSelectOption[] = [];

  public selectText: IMultiSelectTexts = {
    defaultTitle: ""
  };
  addSubConFm: FormGroup;
  //businessTypeList: any[] = [];
  businessTypeList: IMultiSelectOption[] = [];
  filteredBusinessType: Observable<string[]>;
  public isCountry: boolean = false;
  public isEdit: boolean = false;
  public countries: any = [];

  @ViewChild("search")
  public searchElementRef: ElementRef;

  constructor(
    public util: UtilService,
    public router: Router,
    private route: ActivatedRoute,
    private hr: HrService,
    private fb: FormBuilder,
    private http: HttpService,
    public constant: ConstantsService,
    private ref: ApplicationRef,
    private ngZone: NgZone,
    private mapsAPILoader: MapsAPILoader,
    private global: GlobalService
  ) {}

  ngOnInit() {
    this.util.setWindowHeight();
    this.util.setPageTitle(this.route);

    try {
      this.router.url.split("/")[2] == "csa-onboarding"
        ? this.util.menuChange({ menu: "guide", subMenu: "" })
        : this.util.menuChange({ menu: 6, subMenu: 29 });
      this.pageData.currentUrl = this.router.url.split("/")[2];
      this.createForm("0");
      this.getServiceTypeList();
      this.getBusinessTypeList();
      //this.setSubContractorData();
      // this.addSubConFm.get('emergency_contact').valueChanges.subscribe(contact=>{
      //     if(contact!=''){
      //         this.addSubConFm.get('emergency_number').setValidators([Validators.required]);
      //         this.addSubConFm.get('emergency_number').updateValueAndValidity();
      //     }else{
      //         this.addSubConFm.get('emergency_number').setValidators([]);
      //         this.addSubConFm.get('emergency_number').updateValueAndValidity();
      //     }
      // });
      //this.getCountries();
    } catch (err) {
      this.global.addException("add sub contractor", "ngOnInit()", err);
    }
  }

  setSubContractorData(): void {
    let subContrInfo: any = {};
    if (sessionStorage.getItem("subContractor")) {
      subContrInfo = JSON.parse(sessionStorage.getItem("subContractor"));
      this.pageData.action = JSON.parse(sessionStorage.getItem("subContractor"))
        .id
        ? "edit"
        : "add";
      if (this.pageData.action == "edit") {
        if (subContrInfo.user_address) {
          subContrInfo.address1 = subContrInfo.user_address.address_line_1
            ? subContrInfo.user_address.address_line_1
            : "";
          subContrInfo.address2 = subContrInfo.user_address.address_line_2
            ? subContrInfo.user_address.address_line_2
            : "";
          subContrInfo.countryName = subContrInfo.user_address.country_details
            ? subContrInfo.user_address.country_details.country_name
            : "";
          subContrInfo.provinceName = subContrInfo.user_address.province_details
            ? subContrInfo.user_address.province_details.province_name
            : "";
          subContrInfo.countryId = subContrInfo.user_address.country_details
            ? subContrInfo.user_address.country_details.country_id
            : "";
          subContrInfo.provinceId = subContrInfo.user_address.province_details
            ? subContrInfo.user_address.province_details.province_name
            : "";
          subContrInfo.cityId = subContrInfo.user_address.city_details
            ? subContrInfo.user_address.city_details.city_name
            : "";
          subContrInfo.postalCode = subContrInfo.user_address.postal_code
            ? subContrInfo.user_address.postal_code
            : "";
          subContrInfo.latitude = subContrInfo.user_address.latitude
            ? subContrInfo.user_address.latitude
            : "";
          subContrInfo.longitude = subContrInfo.user_address.longitude
            ? subContrInfo.user_address.longitude
            : "";
        }
      }
      if (
        JSON.parse(sessionStorage.getItem("subContractor")).id &&
        sessionStorage.getItem("previousPage") == "list"
      ) {
        let userServices: any[] = [];
        for (let i = 0; i < subContrInfo.user_services.length; i++) {
          userServices.push(subContrInfo.user_services[i].service_type_id);
          //subContrInfo.business_type_id = subContrInfo.user_services[i].business_type_id;
        }
        let businessServices: any[] = [];
        for (let i = 0; i < subContrInfo.user_business_types.length; i++) {
          businessServices.push(
            subContrInfo.user_business_types[i].business_type_id
          );
        }
        console.log("User Services ....");
        console.log(userServices);
        if (subContrInfo.docs) {
          this.pageData.isThumbnailSet =
            subContrInfo.docs.filter(item => item.docType == "img").length > 0
              ? true
              : false;
          for (let i = 0; i < subContrInfo.docs.length; i++) {
            let fileName: string[] =
              subContrInfo.docs[i].docType == "img"
                ? subContrInfo.docs[i].image_name.split(".")
                : subContrInfo.docs[i].doc_name.split(".");
            fileName.pop();
            this.pageData.imgDocPriArr.push({
              fileId:
                subContrInfo.docs[i].docType == "img"
                  ? subContrInfo.docs[i].image_id
                  : subContrInfo.docs[i].doc_id,
              extension:
                subContrInfo.docs[i].docType == "img"
                  ? subContrInfo.docs[i].image_name.split(".").pop()
                  : subContrInfo.docs[i].doc_name.split(".").pop(),
              imgPath:
                subContrInfo.docs[i].docType == "img"
                  ? subContrInfo.docs[i].image_path
                  : subContrInfo.docs[i].doc_path,
              fileName: fileName,
              thumbnail:
                subContrInfo.docs[i].docType == "img"
                  ? subContrInfo.docs[i].set_as_thumbnail
                  : -1,
              description:
                subContrInfo.docs[i].docType == "img"
                  ? subContrInfo.docs[i].image_desc
                  : subContrInfo.docs[i].doc_desc,
              isDelete: 0
            });
          }
        }
        subContrInfo.user_services = userServices;
        subContrInfo.business_type = businessServices;
      } else {
        this.pageData.imgDocPriArr = this.util.getDocumentObj();
      }

      for (let i = 0; i < this.pageData.businessTypeList.length; i++) {
        if (
          this.pageData.businessTypeList[i].businessTypeId ==
          subContrInfo.business_type_id
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

      for (let i = 0; i < subContrInfo.additional_fields.length; i++) {
        if (subContrInfo.additional_fields[i].dataType == "Date") {
          subContrInfo.additional_fields[i].data = this.util.stringToDate(
            subContrInfo.additional_fields[i].data
          );
        }
      }
      console.log(subContrInfo);
      this.createForm("1", subContrInfo);
      this.setEmpFields("1", subContrInfo.additional_fields);
    } else {
      this.createForm("0");
    }
    this.getCountries();
  }

  getSubConFields(): void {
    let self = this;
    try {
      this.http.doGet("extrafields?type=subcont", function(
        error: boolean,
        response: any
      ) {
        if (error) {
        } else {
          self.pageData.additionalFields = response.data
            .additional_subcont_fields
            ? response.data.additional_subcont_fields
            : [];
          self.setEmpFields("0", self.pageData.additionalFields);
        }
      });
    } catch (err) {
      this.global.addException("add sub contractor", "getSubConFields()", err);
    }
  }

  setEmpFields(option, fields): void {
    if (fields) {
      for (let i = 0; i < fields.length; i++) {
        this.addFields(option, fields[i]);
      }
    }
  }

  getServiceTypeList() {
    let self = this;
    this.util.showProcessing("processing-spinner");
    try {
      // this.http.doGet('service-type', function(error: boolean, response: any){
      //     self.util.hideProcessing('processing-spinner');
      //     if(error){ console.log(response) }else{
      //         self.serviceTypeList = response.data.filter(item => (item.id = item.service_type_id, item.name = item.service_type));
      //         if(sessionStorage.getItem('subContractor')){}else{
      //            // self.createForm('0');
      //             self.getSubConFields();
      //         }
      //     }
      // });

      this.http.doGet("businessType", function(error: boolean, response: any) {
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
          //self.filteredBusinessType = self.business_type.valueChanges.pipe(startWith(''),map(value => self.businessTypeFilter(value)));
          self.businessTypeList = response.data.filter(
            item => (
              (item.id = item.businessTypeId), (item.name = item.businessType)
            )
          );
          self.setSubContractorData();
        }
      });
    } catch (err) {
      this.global.addException(
        "add sub contractor",
        "getServiceTypeList()",
        err
      );
    }
  }

  getSelectedBusinessType(event: any): void {
    // if(event.isUserInput){
    //     console.log(businessType);
    //     this.business_type_id.setValue(businessType.businessTypeId);
    //     this.serviceTypeList = businessType.services.filter(item => (item.id = item.serviceTypeId, item.name = item.serviceType));

    // }
    console.log(event);
    this.serviceTypeList = [];
    if (this.pageData.action == "add") this.user_services.setValue([]);
    let data = [];
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
      this.global.addException("new employee", "validatePermission()", err);
    }
  }

  getBusinessTypeList() {
    let self = this;
    this.util.showProcessing("processing-spinner");
    try {
      this.http.doGet("business-type", function(error: boolean, response: any) {
        self.util.hideProcessing("processing-spinner");
        if (error) {
          console.log(response);
        } else {
          self.businessTypeList = response.data.filter(
            item => (
              (item.id = item.business_type_id),
              (item.name = item.business_type)
            )
          );
          if (sessionStorage.getItem("subContractor")) {
          } else {
            // self.createForm('0');
            self.getSubConFields();
          }
        }
      });
    } catch (err) {
      this.global.addException(
        "add sub contractor",
        "getBusinessTypeList()",
        err
      );
    }
  }

  createForm(option, subConObj: any = {}) {
    this.addSubConFm = this.fb.group({
      first_name: new FormControl(option == "1" ? subConObj.first_name : "", [
        Validators.required,
        Validators.maxLength(this.constant.DEFAULT_TEXT_MAXLENGTH)
      ]),
      last_name: new FormControl(option == "1" ? subConObj.last_name : "", [
        Validators.required,
        Validators.maxLength(this.constant.DEFAULT_TEXT_MAXLENGTH)
      ]),
      username: new FormControl(option == "1" ? subConObj.username : "", [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(this.constant.DEFAULT_TEXT_MAXLENGTH),
        Validators.pattern(this.constant.NO_SPACE_PATTERN)
      ]),
      title: new FormControl(
        option == "1" ? (subConObj.title == "-" ? "" : subConObj.title) : "",
        [Validators.maxLength(30)]
      ),
      email_id: new FormControl(option == "1" ? subConObj.email_id : "", [
        Validators.required,
        Validators.pattern(this.constant.EMAIL_PATTERN)
      ]),
      work_phone: new FormControl(
        option == "1"
          ? subConObj.work_phone == "-"
            ? ""
            : subConObj.work_phone
          : "",
        [Validators.required, Validators.pattern(this.constant.PHONE_PATTERN)]
      ),
      mobile_no: new FormControl(option == "1" ? subConObj.mobile_no : "", [
        Validators.pattern(this.constant.PHONE_PATTERN)
      ]),
      wage_amount: new FormControl(
        option == "1"
          ? subConObj.wage_amount == "-"
            ? ""
            : subConObj.wage_amount
          : "",
        [Validators.pattern(this.constant.AMOUNT_PATTERN)]
      ),
      emergency_contact: new FormControl(
        option == "1" ? subConObj.emergency_contact : "",
        [Validators.maxLength(30)]
      ),
      emergency_number: new FormControl(
        option == "1" ? subConObj.emergency_number : "",
        [Validators.pattern(this.constant.PHONE_PATTERN)]
      ),
      relationship: new FormControl(
        option == "1" ? subConObj.relationship : "",
        [Validators.maxLength(30)]
      ),
      user_services: new FormControl(
        option == "1" ? subConObj.user_services : [],
        []
      ),
      business_type: new FormControl(
        option == "1" ? subConObj.business_type : [],
        []
      ),
      business_type_id: new FormControl(
        option == "1" ? subConObj.business_type_id : ""
      ),
      additional_fields: this.fb.array([]),
      days_off: this.fb.array([]),
      address1: new FormControl(option == "1" ? subConObj.address1 : "", [
        Validators.required,
        Validators.maxLength(this.constant.DEFAULT_TEXT_MAXLENGTH)
      ]),
      address2: new FormControl(option == "1" ? subConObj.address2 : "", [
        Validators.maxLength(this.constant.DEFAULT_TEXT_MAXLENGTH)
      ]),
      // countryName:new FormControl(option == '1' ? subConObj.countryName : ''),
      // provinceName:new FormControl(option == '1' ? subConObj.provinceName : ''),
      // countryId:new FormControl(option == '1' ? subConObj.countryId : '', [
      //     Validators.required
      // ]),
      // provinceId:new FormControl(option == '1' ? subConObj.provinceId : '', [
      //     Validators.required
      // ]),
      // cityId:new FormControl(option == '1' ? subConObj.cityId : '', [
      //     Validators.required,
      // ]),
      // postalCode:new FormControl(option == '1' ? subConObj.postalCode : '', [
      //     Validators.required,
      //     Validators.minLength(3),
      //     Validators.maxLength(10),
      //     Validators.pattern(this.constant.POSTAL_CODE_PATTERN)
      // ]),
      countryName: new FormControl(option == "1" ? subConObj.countryName : ""),
      provinceName: new FormControl(
        option == "1" ? subConObj.provinceName : ""
      ),
      countryId: new FormControl(option == "1" ? subConObj.countryId : ""),
      provinceId: new FormControl(option == "1" ? subConObj.provinceId : ""),
      cityId: new FormControl(option == "1" ? subConObj.cityId : ""),
      postalCode: new FormControl(option == "1" ? subConObj.postalCode : ""),
      latitude: new FormControl(option == "1" ? subConObj.latitude : ""),
      longitude: new FormControl(option == "1" ? subConObj.longitude : "")
    });
    if (option != 1) {
      this.addDaysOff(0);
    } else {
      this.addDaysOff(option, subConObj.days_off[0]);
    }
  }

  addFields(option, valObj: any = {}): void {
    try {
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
    } catch (err) {
      this.global.addException("add sub contractor", "addFields()", err);
    }
  }

  get first_name() {
    return this.addSubConFm.get("first_name");
  }
  get last_name() {
    return this.addSubConFm.get("last_name");
  }
  get username() {
    return this.addSubConFm.get("username");
  }
  get title() {
    return this.addSubConFm.get("title");
  }
  get email_id() {
    return this.addSubConFm.get("email_id");
  }
  get work_phone() {
    return this.addSubConFm.get("work_phone");
  }
  get mobile_no() {
    return this.addSubConFm.get("mobile_no");
  }
  get wage_amount() {
    return this.addSubConFm.get("wage_amount");
  }
  get emergency_contact() {
    return this.addSubConFm.get("emergency_contact");
  }
  get emergency_number() {
    return this.addSubConFm.get("emergency_number");
  }
  get relationship() {
    return this.addSubConFm.get("relationship");
  }
  get user_services() {
    return this.addSubConFm.get("user_services");
  }
  get business_type() {
    return this.addSubConFm.get("business_type");
  }
  get business_type_id() {
    return this.addSubConFm.get("business_type_id");
  }
  get additional_fields(): FormArray {
    return (<FormArray>this.addSubConFm.get("additional_fields")) as FormArray;
  }
  get days_off(): FormArray {
    return (<FormArray>this.addSubConFm.get("days_off")) as FormArray;
  }
  get address1() {
    return this.addSubConFm.get("address1");
  }
  get address2() {
    return this.addSubConFm.get("address2");
  }
  get countryName() {
    return this.addSubConFm.get("countryName");
  }
  get countryId() {
    return this.addSubConFm.get("countryId");
  }
  get provinceName() {
    return this.addSubConFm.get("provinceName");
  }
  get provinceId() {
    return this.addSubConFm.get("provinceId");
  }
  get cityName() {
    return this.addSubConFm.get("cityName");
  }
  get cityId() {
    return this.addSubConFm.get("cityId");
  }
  get postalCode() {
    return this.addSubConFm.get("postalCode");
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
      this.global.addException("add sub contractor", "addDaysOff()", err);
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

  next(form: FormGroup) {
    this.util.addBulkValidators(
      this.addSubConFm,
      ["user_services"],
      [Validators.required]
    );
    this.pageData.submitted = true;
    try {
      if (
        this.pageData.emailAvailability == "0" ||
        this.pageData.usernameAvailability == "0"
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
      console.log("------ image data ----");
      console.log(this.pageData.imgDocPriArr);

      if (form.valid) {
        form.value.selUserServices = [];
        for (let i = 0; i < form.value.user_services.length; i++) {
          form.value.selUserServices.push(
            this.serviceTypeList.filter(
              item => item.id == form.value.user_services[i]
            )[0].name
          );
        }
        this.util.setDocumentObj(this.pageData.imgDocPriArr);
        form.value.id =
          this.pageData.action == "edit"
            ? JSON.parse(sessionStorage.getItem("subContractor")).id
            : 0;
        sessionStorage.setItem("subContractor", JSON.stringify(form.value));
        this.router.url.split("/")[2] == "csa-onboarding"
          ? this.router.navigate(["/hr/csa-onboarding/subcontractor-review"])
          : this.router.navigate(["/hr/csa/subcontractor-review"]);
      }
    } catch (err) {
      this.global.addException("add sub contractor", "next()", err);
    }
  }

  onFileChange(event) {
    console.log(event);
    let self = this;
    let extension: string = "";
    let fileDetailsObj: any = {};
    self.pageData.errMsg = "";
    self.pageData.isError = false;
    let fileList: FileList = event.target.files;
    if (fileList.length > 0) {
      let imgCount = 0;
      self.addImg(imgCount, fileList, fileDetailsObj, extension);
    }
  }

  addImg(imgCount: number, fileList, fileDetailsObj, extension) {
    let self = this;
    console.log("imgCount: ", imgCount);
    console.log("fileList: ", fileList);
    console.log("fileDetailsObj: ", fileDetailsObj);
    console.log("extension: ", this.pageData.imgDocPriArr);
    try {
      let file: File = fileList[imgCount],
        fileName: string[] = [];
      fileDetailsObj = { fileId: 0, isDelete: 0 };
      fileDetailsObj.thumbnail = 0;
      fileDetailsObj.fileName =
        fileList[imgCount] && fileList[imgCount].name
          ? fileList[imgCount].name
          : "";
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
      this.global.addException("add sub contractor", "addImg()", err);
    }
  }

  convertToBase64(file, callback) {
    let reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (fileLoadedEvent: any) => {
      return callback(fileLoadedEvent.target.result);
    };
  }

  onSelectionChange(index) {
    for (var i = 0; i < this.pageData.imgDocPriArr.length; i++) {
      this.pageData.imgDocPriArr[i].thumbnail = 0;
    }
    this.pageData.imgDocPriArr[index].thumbnail = 1;
  }

  changeUploadFileFlage() {
    this.pageData.newFileUpload = true;
    this.ref.tick();
  }

  removeImgDoc(id, index, option) {
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
      console.log(this.pageData.imgDocPriArr);
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
      this.global.addException("add sub contractor", "removeImgDoc()", err);
    }
    // try{
    //     let isThumbnail = this.pageData.imgDocPriArr[index].thumbnail == 1 ? true : false;
    //     this.pageData.imgDocPriArr[index].isDelete = 1;
    //     //this.pageData.imgDocPriArr.splice(index, 1);
    //     this.ref.tick();
    //     if(this.pageData.imgDocPriArr.length == 0){
    //         this.pageData.isThumbnailSet = false;
    //         this.pageData.newFileUpload = true;
    //         this.ref.tick();
    //     }else{
    //         if(isThumbnail){
    //             let checkImg = this.pageData.imgDocPriArr.filter(item=>item.extension != 'pdf');
    //             if(checkImg.length > 0){
    //                 checkImg[0].thumbnail = 1;
    //                 this.ref.tick();
    //             }else{
    //                 this.pageData.isThumbnailSet = false;
    //                 this.ref.tick();
    //             }
    //         }
    //     }
    // }catch(err){
    //     this.global.addException('add sub contractor','removeImgDoc()',err);
    // }
  }

  dropped(event: UploadEvent, option) {
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

  fileOver(event) {
    this.pageData.dragOver = true;
    this.ref.tick();
  }
  fileLeave(event) {
    this.pageData.dragOver = false;
    this.ref.tick();
  }

  cancelSubContrator() {
    this.router.url.split("/")[2] == "csa-onboarding"
      ? this.router.navigate(["/csa-onboarding/guide"])
      : this.router.navigate(["/hr/csa/sub-contractor-list/0"]);
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
          : JSON.parse(sessionStorage.getItem("subContractor")).id
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
          : JSON.parse(sessionStorage.getItem("subContractor")).id
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
            self.addSubConFm.get("address1"),
            [
              self.addSubConFm.get("countryId"),
              self.addSubConFm.get("provinceId"),
              self.addSubConFm.get("cityId"),
              self.addSubConFm.get("postalCode"),
              { countries: self.countries },
              self.addSubConFm.get("latitude"),
              self.addSubConFm.get("longitude")
            ]
          );
        }
      });
    } catch (err) {
      this.global.addException("Add Subcontractor", "getCountries()", err);
    }
  }
}
