import {
  Component,
  Inject,
  ViewChild,
  ElementRef,
  NgZone
} from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { MapsAPILoader } from "@agm/core";

import { OnInit } from "@angular/core";
import { MatFormFieldModule } from "@angular/material/form-field";
import {
  FormControl,
  FormGroupDirective,
  NgForm,
  Validators,
  FormGroup,
  FormBuilder
} from "@angular/forms";
import { UtilService } from "../../../shared/service/util.service";
import { HttpService } from "../../../shared/service/http.service";
import { ConstantsService } from "../../../shared/service/constants.service";
import { FileService } from "../../../shared/service/file.service";
import { GlobalService } from "../../../shared/service/global.service";

@Component({
  selector: "",
  templateUrl: "./company-registration.html",
  styleUrls: ["./company-registration.css"]
})
export class CompanyRegistrationComponent implements OnInit {
  public errMsg: string = "";
  public isError: boolean = false;
  public submitted: boolean = false;
  public compSection = "add";
  public regCompName = "";
  public userCountryCode: string;
  public imgPath: string;
  public countries: any = [];
  public stateList: any = [];
  public cityList: any = [];
  public compLogo: File;
  compRegFm: FormGroup;
  isValidEmail = false;
  isValidUserName = false;

  @ViewChild("search")
  public searchElementRef: ElementRef;

  constructor(
    private util: UtilService,
    private http: HttpService,
    private constant: ConstantsService,
    private router: Router,
    private fb: FormBuilder,
    private file: FileService,
    private global: GlobalService,
    private mapsAPILoader: MapsAPILoader,
    private ngZone: NgZone,
    public route: ActivatedRoute
  ) {}

  @ViewChild("fileInput") fileInput: ElementRef;

  ngOnInit() {
    this.util.setWindowHeight();
    this.util.setPageTitle(this.route);
    this.getCountries();
    this.createForm();
    this.onChanges();
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
            self.compRegFm.get("addressLine1"),
            [
              self.compRegFm.get("country"),
              self.compRegFm.get("provinence"),
              self.compRegFm.get("city"),
              self.compRegFm.get("postalCode"),
              { countries: self.countries },
              self.compRegFm.get("latitude"),
              self.compRegFm.get("longitude")
            ]
          );
        }
      });
    } catch (err) {
      this.global.addException("Company Registration", "getCountries()", err);
    }
  }
  // getProviences(countryId){
  //     var self = this;
  //     try{
  //         this.http.doGet('provinces/'+countryId, function(error: boolean, response: any){
  //             console.log(error);
  //             console.log(response);
  //             if( error ){
  //                 console.log(response.message);
  //                 self.stateList = [];
  //             }else{
  //                 self.stateList = response.data;
  //             }
  //         });
  //     }catch(err){
  //         this.global.addException('Company Registration','getProviences()',err);
  //     }
  // }
  // getCities(provienceId){
  //     var self = this;
  //     try{
  //         this.http.doGet('city/'+provienceId, function(error: boolean, response: any){
  //             if( error ){
  //                 console.log(response.message);
  //                 self.cityList = [];
  //             }else{
  //                 self.cityList = response.data;
  //             }
  //         });
  //     }catch(err){
  //         this.global.addException('Company Registration','getCities()',err);
  //     }
  // }

  onChanges(): void {
    this.compRegFm.get("country").valueChanges.subscribe(selCountry => {
      //this.compRegFm.get('provinence').setValue('');
      //this.compRegFm.get('city').setValue('');
      //this.getProviences(selCountry);
      //console.log(this.countries);
      if (selCountry) {
        for (let i = 0; i < this.countries.length; i++) {
          if (this.countries[i].country_id == selCountry) {
            this.compRegFm.get("currency").setValue(this.countries[i].currency);
            break;
          }
        }
      }
    });

    // this.compRegFm.get('provinence').valueChanges.subscribe(selProvinence => {
    //     this.compRegFm.get('city').setValue('');
    //     console.log(selProvinence);
    //     if(selProvinence != ''){
    //         this.getCities(selProvinence);
    //     }
    // });
  }

  onFileChange(event) {
    let self = this;
    let reader = new FileReader();
    try {
      if (event.target.files && event.target.files.length > 0) {
        var typeOfFile = event.target.files[0].type.split("/");
        console.log(typeOfFile);
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
              this.compRegFm
                .get("companyLogo")
                .setValue(fileLoadedEvent.target.result); //2
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
      this.global.addException("Company Registration", "onFileChange()", err);
    }
  }

  public createForm() {
    this.compRegFm = this.fb.group({
      organization: new FormControl("", [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(60)
      ]),
      addressLine1: new FormControl("", [Validators.required]),
      addressLine2: new FormControl("", []),
      country: new FormControl("", [Validators.required]),
      // provinence: new FormControl('', [ Validators.required ]),
      // city: new FormControl('', [ Validators.required ]),
      // postalCode:new FormControl('', [
      //     Validators.required,
      //     Validators.minLength(3),
      //     Validators.maxLength(10),
      //     Validators.pattern(this.constant.POSTAL_CODE_PATTERN) ]),
      provinence: new FormControl(""),
      city: new FormControl(""),
      postalCode: new FormControl(""),
      currency: new FormControl("", [Validators.required]),
      price_per_user: new FormControl("", [
        Validators.required
        // Edited by Shubham : Date - 27/04/2019
        //Validators.minLength(2),
        //Validators.maxLength(30)
      ]),
      businessStructure: new FormControl("Enterprise", [Validators.required]),
      name: new FormControl("", [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(30)
      ]),

      userEmail: new FormControl("", [
        Validators.required,
        Validators.pattern(this.constant.EMAIL_PATTERN)
      ]),
      designation: new FormControl("", [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(30)
      ]),
      userName: new FormControl("", [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(30)
      ]),
      phoneNumber: new FormControl("", [
        Validators.required,
        Validators.pattern(this.constant.PHONE_PATTERN)
      ]),
      mainPhone: new FormControl("", [
        Validators.required,
        Validators.pattern(this.constant.PHONE_PATTERN)
      ]),
      latitude: new FormControl(""),
      longitude: new FormControl(""),
      companyLogo: new FormControl(null, [])
    });
  }

  get organization() {
    return this.compRegFm.get("organization");
  }
  get addressLine1() {
    return this.compRegFm.get("addressLine1");
  }
  get addressLine2() {
    return this.compRegFm.get("addressLine2");
  }
  get country() {
    return this.compRegFm.get("country");
  }
  get provinence() {
    return this.compRegFm.get("provinence");
  }
  get city() {
    return this.compRegFm.get("city");
  }
  get postalCode() {
    return this.compRegFm.get("postalCode");
  }
  get price_per_user() {
    return this.compRegFm.get("price_per_user");
  }
  get currency() {
    return this.compRegFm.get("currency");
  }
  get businessStructure() {
    return this.compRegFm.get("businessStructure");
  }
  get name() {
    return this.compRegFm.get("name");
  }
  get userEmail() {
    return this.compRegFm.get("userEmail");
  }
  get designation() {
    return this.compRegFm.get("designation");
  }
  get userName() {
    return this.compRegFm.get("userName");
  }
  get phoneNumber() {
    return this.compRegFm.get("phoneNumber");
  }
  get companyLogo() {
    return this.compRegFm.get("companyLogo");
  }
  get mainPhone() {
    return this.compRegFm.get("mainPhone");
  }

  addCompany(form: NgForm): void {
    var self = this;
    this.errMsg = "";
    this.isError = false;
    this.submitted = true;
    try {
      if (form.valid) {
        form.value.phoneNumber = self.util.unMaskPhoneNumber(
          form.value.phoneNumber
        );
        form.value.mainPhone = self.util.unMaskPhoneNumber(
          form.value.mainPhone
        );
        if (this.isValidEmail == true || this.isValidUserName == true) {
          return;
        }
        self.util.addSpinner("create-btn", "Add");
        let formData: FormData = new FormData();
        formData.append("organization", form.value.organization);
        formData.append("addressLine1", form.value.addressLine1);
        formData.append("addressLine2", form.value.addressLine2);
        formData.append("country", form.value.country);
        formData.append("provinence", form.value.provinence);
        formData.append("city", form.value.city);
        formData.append("postalCode", form.value.postalCode);
        formData.append("price_per_user", form.value.price_per_user);
        formData.append("currency", form.value.currency);
        formData.append("businessStructure", form.value.businessStructure);
        formData.append("name", form.value.name);
        formData.append("email", form.value.userEmail);
        formData.append("designation", form.value.designation);
        formData.append("phoneNumber", form.value.phoneNumber);
        formData.append("mainPhone", form.value.mainPhone);
        formData.append("latitude", form.value.latitude);
        formData.append("longitude", form.value.longitude);
        formData.append("userName", form.value.userName);
        formData.append("companyLogo", self.compLogo);
        this.file.formDataAPICall(formData, "companyReg", function(
          error: boolean,
          response: any
        ) {
          self.util.removeSpinner("create-btn", "Add");
          if (error) {
            self.errMsg = response.message;
            self.isError = true;
          } else {
            self.compSection = "success";
            self.regCompName = form.value.companyDisplayName;
          }
        });
      } else {
        console.log("form validation issue");
      }
    } catch (err) {
      this.global.addException("Dashboard", "addCompany()", err);
    }
  }

  public addAnotherAdmin() {
    try {
      this.submitted = false;
      this.compSection = "add";
      this.compRegFm.reset();
      this.compRegFm.get("country").setValue("Canada");
      this.compRegFm.get("currency").setValue("CAD");
      this.imgPath = undefined;
    } catch (err) {
      this.global.addException("Dashboard", "addAnotherAdmin()", err);
    }
  }

  keyDownFunction(event: any, form: NgForm) {
    if (event.keyCode == 13) {
      event.preventDefault();
      return false;
    } else {
      this.addCompany(form);
    }
  }

  validateEmail(event: any) {
    let self = this;
    var reqObj = {
      email: this.userEmail.value,
      user_id: ""
    };
    if (this.userEmail.value != "") {
      this.global.checkUnique(
        this.userEmail,
        "check-availability",
        reqObj,
        function(response) {
          self.isValidEmail = response;
          console.log(response);
        }
      );
    }
  }

  validateUsername(event: any) {
    let self = this;
    var reqObj = {
      username: this.userName.value,
      user_id: ""
    };

    if (this.userName.value != "") {
      console.log(reqObj);
      this.global.checkUnique(
        this.userName,
        "check-availability",
        reqObj,
        function(response) {
          self.isValidUserName = response;
          console.log(response);
        }
      );
    }
  }
}
