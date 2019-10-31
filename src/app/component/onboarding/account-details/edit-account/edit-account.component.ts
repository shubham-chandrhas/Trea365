import {
  Component,
  OnInit,
  Inject,
  ViewChild,
  ElementRef,
  NgZone
} from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import {
  FormControl,
  FormGroup,
  FormBuilder,
  FormArray,
  Validators,
  NgForm,
  AbstractControl
} from "@angular/forms";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";
import { MapsAPILoader } from "@agm/core";

import { HttpService } from "../../../../shared/service/http.service";
import { UtilService } from "../../../../shared/service/util.service";
import { ConstantsService } from "../../../../shared/service/constants.service";
import { FileService } from "../../../../shared/service/file.service";
import { GlobalService } from "../../../../shared/service/global.service";
import { DialogComponent } from "../../../../shared/model/dialog/dialog.component";

declare var jquery: any;
declare var $: any;

@Component({
  selector: "app-edit-account",
  templateUrl: "./edit-account.component.html",
  styleUrls: ["./edit-account.component.css"]
})
export class EditAccountComponent implements OnInit {
  editAccDetailsFrm: FormGroup;

  public errMsg: string = "";
  public imgPath: string;
  public isError: boolean = false;
  public submitted: boolean = false;
  public accountDetails;
  public compLogo: File;
  public countries: any = [];
  public stateList: any = [];
  public cityList: any = [];
  public userCount: number = 0;
  public usernameAvailability: boolean = false;

  @ViewChild("search")
  public searchElementRef: ElementRef;
  emailChangeConfirm: boolean = false;

  constructor(
    public util: UtilService,
    private http: HttpService,
    private router: Router,
    private fb: FormBuilder,
    public constant: ConstantsService,
    private route: ActivatedRoute,
    private file: FileService,
    public dialog: MatDialog,
    private global: GlobalService,
    private mapsAPILoader: MapsAPILoader,
    private ngZone: NgZone
  ) {}

  ngOnInit() {
    window.scrollTo(0, 0);
    this.util.setWindowHeight();
    this.util.setPageTitle(this.route);
    this.util.menuChange({ menu: "accountDetails", subMenu: "" });
    this.accountDetails = JSON.parse(sessionStorage.getItem("accountDetails"));
    console.log(this.accountDetails);
    this.imgPath = this.accountDetails.logo;
    this.editAccDetailsForm();
    // console.log(this.util.getRole());
    if (this.util.getRole() == 2) {
      this.getCountries();
    }
    //this.getProviences(this.accountDetails.country_id);
    //this.getCities(this.accountDetails.province_id);
    this.onChanges();

    this.util.changeDetection.subscribe(dataObj => {
      if (dataObj && dataObj.source == "EMAIL_CHANGE" && dataObj.data.email == "email changed") {
        this.emailChangeConfirm = true;
        console.log("usersss", this.users);
      } else if(dataObj && dataObj.source == "EMAIL_CHANGE" && dataObj.data.email == "email not changed"){
        this.emailChangeConfirm = false;
          let i = dataObj.data.index;
      } else{
        this.emailChangeConfirm = false;
      }
    });
  }

  getCountries() {
    let self = this;
    this.global.getCountries(function(list) {
      self.countries = list;
      self.util.mapInit(
        self.mapsAPILoader,
        self.searchElementRef,
        self.ngZone,
        self.editAccDetailsFrm.get("address"),
        [
          self.editAccDetailsFrm.get("country"),
          self.editAccDetailsFrm.get("provinence"),
          self.editAccDetailsFrm.get("city"),
          self.editAccDetailsFrm.get("postalCode"),
          { countries: self.countries },
          self.editAccDetailsFrm.get("latitude"),
          self.editAccDetailsFrm.get("longitude")
        ]
      );
    });
  }
  // getProviences(countryId){
  //     let self = this;
  //     this.global.getProviences(countryId, function(list){ self.stateList = list; });
  // }
  // getCities(provienceId){
  //     var self = this;
  //     this.global.getCities(provienceId, function(list){ self.cityList = list; });
  // }

  onChanges(): void {
    this.editAccDetailsFrm.get("country").valueChanges.subscribe(selCountry => {
      if (selCountry != "") {
        //this.editAccDetailsFrm.get('provinence').setValue('');
        //this.editAccDetailsFrm.get('city').setValue('');
        //this.getProviences(selCountry);
        for (let i = 0; i < this.countries.length; i++) {
          if (this.countries[i].country_id == selCountry) {
            this.editAccDetailsFrm
              .get("currency")
              .setValue(this.countries[i].currency);
            //this.editAccDetailsFrm.get('country').setValue(this.countries[i].country_id);
            break;
          }
        }
      }
    });

    // this.editAccDetailsFrm.get('provinence').valueChanges.subscribe(selProvinence => {
    //     if(selProvinence != ''){
    //         this.editAccDetailsFrm.get('city').setValue('');
    //         //this.getCities(selProvinence);
    //     }
    // });
  }

  public editAccDetailsForm() {
    this.editAccDetailsFrm = this.fb.group({
      companyId: new FormControl(this.accountDetails.company_id),
      organization: new FormControl(this.accountDetails.organization, [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(60)
      ]),
      address: new FormControl(this.accountDetails.address_line1, [
        Validators.required
      ]),
      addressLine2: new FormControl(this.accountDetails.address_line2),
      country: new FormControl(this.accountDetails.country_id, [
        Validators.required
      ]),
      // provinence:new FormControl(this.accountDetails.provinence_name.province_name, [
      //     Validators.required
      // ]),
      // city:new FormControl(this.accountDetails.city_name.city_name, [
      //     Validators.required
      // ]),
      // postalCode:new FormControl(this.accountDetails.postal_code, [
      //     Validators.required,
      //     Validators.minLength(3),
      //     Validators.maxLength(10),
      //     Validators.pattern(this.constant.POSTAL_CODE_PATTERN)
      // ]),
      provinence: new FormControl(
        this.accountDetails.provinence_name
          ? this.accountDetails.provinence_name.province_name
          : ""
      ),
      city: new FormControl(
        this.accountDetails.city_name
          ? this.accountDetails.city_name.city_name
          : ""
      ),
      postalCode: new FormControl(
        this.accountDetails.postal_code ? this.accountDetails.postal_code : ""
      ),
      currency: new FormControl(this.accountDetails.currency, [
        Validators.required
      ]),
      busiStructure: new FormControl(this.accountDetails.business_structure, [
        Validators.required
      ]),
      mainPhone: new FormControl(this.accountDetails.main_phone, [
        Validators.required,
        Validators.pattern(this.constant.PHONE_PATTERN)
      ]),
      latitude: new FormControl(""),
      longitude: new FormControl(""),
      users: this.fb.array([])
    });

    for (let i = 0; i < this.accountDetails.user_list.length; i++) {
      this.addUser("1", this.accountDetails.user_list[i]);
    }
  }

  get organization() {
    return this.editAccDetailsFrm.get("organization");
  }
  get address() {
    return this.editAccDetailsFrm.get("address");
  }
  get addressLine2() {
    return this.editAccDetailsFrm.get("addressLine2");
  }
  get country() {
    return this.editAccDetailsFrm.get("country");
  }
  get provinence() {
    return this.editAccDetailsFrm.get("provinence");
  }
  get city() {
    return this.editAccDetailsFrm.get("city");
  }
  get postalCode() {
    return this.editAccDetailsFrm.get("postalCode");
  }
  get currency() {
    return this.editAccDetailsFrm.get("currency");
  }
  get busiStructure() {
    return this.editAccDetailsFrm.get("busiStructure");
  }
  get mainPhone() {
    return this.editAccDetailsFrm.get("mainPhone");
  }
  get users(): FormArray {
    return (<FormArray>this.editAccDetailsFrm.get("users")) as FormArray;
  }

  onFileChange(event) {
    let self = this;
    let reader = new FileReader();
    try {
      if (event.target.files && event.target.files.length > 0) {
        var typeOfFile = event.target.files[0].type.split("/");
        if (
          typeOfFile[0] == "image" &&
          (typeOfFile[1] == "png" ||
            typeOfFile[1] == "jpg" ||
            typeOfFile[1] == "jpeg" ||
            typeOfFile[1] == "gif")
        ) {
          if (event.target.files[0].size / 1048576 < 10) {
            let file = event.target.files[0];
            self.compLogo = file;
            reader.readAsDataURL(file);
            reader.onload = (fileLoadedEvent: any) => {
              this.imgPath = fileLoadedEvent.target.result;
            };
          } else {
            self.errMsg = "File must be less than 10 MB.";
            self.isError = true;
          }
        } else {
          self.errMsg = "Allowed file types png, jpg and gif.";
          self.isError = true;
        }
      }
    } catch (err) {
      this.global.addException("Edit Account", "onFileChange()", err);
    }
  }

  removeLogo() {
    this.imgPath = null;
    this.compLogo = null;
  }

  removeUser(position, user) {
    this.userCount--;
    user.get("userId").value == ""
      ? this.users.removeAt(position)
      : user.get("isUserDelete").setValue("1");
  }

  addUser(option, userData) {
    this.submitted = false;

    try {
      this.users.push(
        this.fb.group({
          userId: new FormControl(option == "1" ? userData.id : ""),
          name: new FormControl(option == "1" ? userData.first_name : "", [
            Validators.required,
            Validators.maxLength(30)
          ]),
          last_name: new FormControl(
            option == "1"
              ? this.util.getRole() == 3
                ? userData.last_name
                : ""
              : "",
            [Validators.maxLength(30)]
          ),
          userName: new FormControl(option == "1" ? userData.username : "", [
            Validators.required,
            Validators.minLength(8),
            Validators.maxLength(30)
          ]),
          designation: new FormControl(
            option == "1"
              ? this.util.getRole() == 2
                ? userData.designation
                : userData.title
              : "",
            [
              Validators.required,
              Validators.minLength(2),
              Validators.maxLength(30)
            ]
          ),
          email: new FormControl(option == "1" ? userData.email_id : "", [
            Validators.required,
            Validators.pattern(this.constant.EMAIL_PATTERN)
          ]),
          phoneNumber: new FormControl(
            option == "1" ? userData.mobile_no : "",
            [
              Validators.required,
              Validators.pattern(this.constant.PHONE_PATTERN)
            ]
          ),
          isValidEmail: new FormControl(option == "1" ? false : false),
          isValidUserName: new FormControl(option == "1" ? false : false),
          isUserDelete: new FormControl("0")
        })
      );
      this.userCount++;
    } catch (err) {
      this.global.addException("Edit account", "addUser()", err);
    }
  }

  updateAccDetails(form: FormGroup) {
    console.log('email change semail=', this.emailChangeConfirm);
    var self = this;
    this.errMsg = "";
    this.isError = false;
    this.submitted = true;
    try {
      if (form.valid) {
        for (let i = 0; i < form.value.users.length; i++) {
          console.log('email change before=', self.accountDetails.user_list[i].email_id);
          console.log('email change after=', this.users.value[i].email);
          form.value.users[i].phoneNumber = self.util.unMaskPhoneNumber(
            form.value.users[i].phoneNumber
          );
          if (
            form.value.users[i].isValidEmail == true ||
            form.value.users[i].isValidUserName == true
          ) {
            return;
          }
          if(this.emailChangeConfirm === true) {
            this.users.value[i].email = this.users.value[i].email;
          } else{
            this.users.value[i].email = self.accountDetails.user_list[i].email_id;

          }
        }
        form.value.mainPhone = self.util.unMaskPhoneNumber(
          form.value.mainPhone
        );
        let formData: FormData = new FormData();
        formData.append("companyId", form.value.companyId);
        formData.append("organization", form.value.organization);
        formData.append("addressLine1", form.value.address);
        formData.append("addressLine2", form.value.addressLine2);
        formData.append("country", form.value.country);
        formData.append("provinence", form.value.provinence);
        formData.append("city", form.value.city);
        formData.append("postalCode", form.value.postalCode);
        formData.append("currency", form.value.currency);
        formData.append("businessStructure", form.value.busiStructure);
        formData.append("companyUsers", JSON.stringify(form.value.users));
        formData.append("mainPhone", form.value.mainPhone);
        formData.append("latitude", form.value.latitude);
        formData.append("longitude", form.value.longitude);
        formData.append(
          "isLogoDelete",
          self.compLogo == null && self.imgPath == null ? "1" : "0"
        );
        self.compLogo ? formData.append("companyLogo", self.compLogo) : "";

        self.util.addSpinner("edit-acc-btn", "Update");
        this.file.formDataAPICall(formData, "companyEdit", function(
          error: boolean,
          response: any
        ) {
          self.util.removeSpinner("edit-acc-btn", "Update");
          if (error) {
            self.isError = true;
            self.errMsg = response.message;
          } else {
            self.dialog.open(EditAccountDialog, {
              data: { action: "updateSuccess" }
            });
            self.util.setCompanyLogo(response.data.logo);
          }
        });
      }
    } catch (err) {
      this.global.addException("Edit Account", "updateAccDetails()", err);
    }
  }

  getIndex(index) {
    let count = 1;
    for (let i = 0; i < index; i++) {
      if (this.users.at(i).get("isUserDelete").value == "0") {
        count++;
      }
    }
    return count;
  }

  validateEmail(user) {
    let self = this;
    var reqObj = {
      email: user.get("email").value,
      user_id: user.get("userId").value
    };
    if (user.get("email").value != "") {
      this.global.checkUnique(
        user.get("email"),
        "check-availability",
        reqObj,
        function(response) {
          user.get("isValidEmail").setValue(response);
          // alert( user.get('email').value);

          // self.openDialogConfirm();
        }
      );
    }
  }
  openDialogConfirm(index) {
    let self = this;
    let data: any = {
      // API_URL: "schedule/delete",

      event: {
        source: "CONFIRM_CHANGE_EMAIL",
        action: "EMAIL",
        data: index
      }
    };
    self.util.showDialog(
      DialogComponent,
      `Are you sure you want to change your email address?
      This will remove your current email ID and register you as a new user with your new email ID`,
      [],
      "Email Change ",
      "CONFIRMATION_EMAIL",
      data
    );
  }
  validateUsername(user) {
    let self = this;
    var reqObj = {
      username: user.get("userName").value,
      user_id: user.get("userId").value
    };
    if (user.get("userName").value != "") {
      this.global.checkUnique(
        user.get("userName"),
        "check-availability",
        reqObj,
        function(response) {
          user.get("isValidUserName").setValue(response);
        }
      );
    }
  }
}

@Component({
  selector: "",
  templateUrl: "./edit-account-dialog.html",
  styleUrls: ["./edit-account.component.css"]
})
export class EditAccountDialog {
  public action: string;
  constructor(
    public dialogRef: MatDialogRef<EditAccountDialog>,
    @Inject(MAT_DIALOG_DATA) public dataObj: any,
    private router: Router
  ) {
    this.action = dataObj.action;
  }

  closeDialog(): void {
    this.dialogRef.close();
    this.router.navigate(["/csa-onboarding/account-details"]);
  }
}
