import { Component, Inject, ViewChild, OnInit } from "@angular/core";
import {
  FormControl,
  FormGroup,
  FormBuilder,
  FormArray,
  Validators,
  NgForm,
  AbstractControl
} from "@angular/forms";
import { MatDialog } from "@angular/material";
import { Location } from "@angular/common";
import * as _ from "underscore";
import { Subscription } from "rxjs";

import { HttpService } from "../../../shared/service/http.service";
import { UtilService } from "../../../shared/service/util.service";
import { ConstantsService } from "../../../shared/service/constants.service";
import { FileService } from "../../../shared/service/file.service";
import { DialogComponent } from "../../../shared/model/dialog/dialog.component";
import { TSADialogComponent } from "../tsa.dialog";
import { EmployeeDialog } from "../../hr/employee/employee-dialog.component";
import { ActivatedRoute } from "@angular/router";
import { GlobalService } from "../../../shared/service/global.service";
@Component({
  selector: "",
  templateUrl: "./dashboard.html",
  styleUrls: [
    "./landing.css",
    "../../admin/item-classes/item-classes.component.css"
  ]
})
export class TSADashboardComponent implements OnInit {
  companyList: any = "";
  searchTxt: string;
  paginationKey: any;
  listCount: number = 0;

  editAccDetailsFrm: FormGroup;
  editTab;
  selCompany: any;
  selectedIndex;
  isEdit: boolean = false;
  pageData: any = {
    sortColumn: "company_id",
    sortColumnType: "N",
    sortOrder: "DSC"
  };
  isError: boolean = false;
  errMsg: string = "";
  userCount: number = 0;
  submitted: boolean = false;
  subscription: Subscription;

  constructor(
    private http: HttpService,
    public util: UtilService,
    public constant: ConstantsService,
    private fb: FormBuilder,
    private file: FileService,
    public dialog: MatDialog,
    public route: ActivatedRoute,
    private location: Location,
    private global: GlobalService
  ) {
    this.paginationKey = {
      itemsPerPage: this.constant.ITEMS_PER_PAGE,
      currentPage: this.constant.CURRENT_PAGE
    };
  }

  ngOnInit() {
    this.util.setWindowHeight();
    this.util.setPageTitle(this.route);
    this.getCompanyList("INIT");
    this.getStatusList();

    this.subscription = this.util.changeDetection.subscribe(dataObj => {
      if (dataObj && dataObj.source == "UPDATE_STATUS") {
        this.getCompanyList("REFRESH");
        // self.selItemClass = self.selectedIndex = null;
        // self.searchTxt = self.searchList = '';
      }
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  getStatusList(): void {
    try {
      let self = this;
      this.http.doGet("getCommonStatus/COMP_ACC_STATUS", function(
        error: boolean,
        response: any
      ) {
        self.pageData.accountStatusList = [];
        if (error) {
          console.log(error);
        } else {
          self.pageData.accountStatusList = response.data.statusList;
        }
      });

      this.http.doGet("getCommonStatus/COMP_PAY_STATUS", function(
        error: boolean,
        response: any
      ) {
        self.pageData.paymentStatusList = [];
        if (error) {
          console.log(error);
        } else {
          self.pageData.paymentStatusList = response.data.statusList;
        }
      });
    } catch (err) {
      this.global.addException("Dashboard", "getStatusList()", err);
    }
  }

  getCompanyList(option): void {
    try {
      var self = this;
      self.companyList = [];
      this.util.showProcessing("processing-spinner");
      this.http.doGet("getCompanyList", function(
        error: boolean,
        response: any
      ) {
        if (error) {
          alert(response.error.error);
        } else {
          self.companyList = response.data;
          //item.province = item.provinence_name ? item.provinence_name.province_name : ''
          self.companyList.filter(
            item => (
              (item.country = item.country_name
                ? item.country_name.country_name
                : ""),
              (item.accountStatus = item.account_status_details
                ? item.account_status_details.status
                : ""),
              (item.paymentStatus = item.payment_status_details
                ? item.payment_status_details.status
                : "")
            )
          );
          self.constant.ITEM_COUNT = response.data.length;
          self.util.hideProcessing("processing-spinner");
          console.log(self.companyList);
          self.route.snapshot.paramMap.get("id") != "0"
            ? self.showCompanyDetails()
            : "";
          option == "REFRESH"
            ? self.getSelectedCompany(self.selCompany, self.selectedIndex)
            : "";
        }
      });
    } catch (err) {
      this.global.addException("Dashboard", "getCompanyList()", err);
    }
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
      this.pageData.searchTxt = "";
    }
  }

  showCompanyDetails() {
    try {
      let sortedList: any[] = _.sortBy(
        this.companyList,
        "company_id"
      ).reverse();
      for (var i = 0; i < sortedList.length; ++i) {
        if (
          this.route.snapshot.paramMap.get("id") == sortedList[i].company_id
        ) {
          this.getSelectedCompany(sortedList[i], i);
          this.selectedIndex = i;
          break;
        }
      }
    } catch (err) {
      this.global.addException("Dashboard", "showCompanyDetails()", err);
    }
  }

  getSelectedCompany(comp, indx): void {
    let self = this;
    this.isEdit = false;
    this.selectedIndex = indx;
    this.selCompany = comp;
    if (comp) {
      this.editCompanyDetailsForm();
      this.getUsersList();
      this.userCount = 0;
      self.location.go(
        self.location
          .path()
          .split("/")
          .splice(0, self.location.path().split("/").length - 1)
          .join("/") +
          "/" +
          comp.company_id
      );
      setTimeout(function() {
        self.util.scrollDown("compMark");
      }, 1000);
    }
  }

  editCompany(): void {
    this.isEdit = true;
  }

  cancelEdit(): void {
    this.isEdit = false;
  }

  public editCompanyDetailsForm() {
    this.editAccDetailsFrm = this.fb.group({
      companyId: new FormControl(
        this.selCompany && this.selCompany.company_id
          ? this.selCompany.company_id
          : ""
      ),
      organization: new FormControl(
        this.selCompany && this.selCompany.organization,
        [Validators.required, Validators.minLength(2), Validators.maxLength(30)]
      ),
      addressLine1: new FormControl(
        this.selCompany && this.selCompany.address_line1,
        [Validators.required]
      ),
      country: new FormControl(this.selCompany && this.selCompany.country_id, [
        Validators.required
      ]),
      provinence: new FormControl(
        this.selCompany && this.selCompany.province_id
          ? this.selCompany.province_id
          : ""
      ),
      city: new FormControl(
        this.selCompany && this.selCompany.city_id
          ? this.selCompany.city_id
          : ""
      ),
      postalCode: new FormControl(
        this.selCompany && this.selCompany.postal_code
          ? this.selCompany.postal_code
          : ""
      ),
      price_per_user: new FormControl(
        this.selCompany && this.selCompany.price_per_user,
        [
          // Validators.required,
          Validators.minLength(2),
          Validators.maxLength(30)
        ]
      ),
      currency: new FormControl(this.selCompany && this.selCompany.currency, [
        Validators.required
      ]),
      businessStructure: new FormControl(
        this.selCompany && this.selCompany.business_structure,
        [Validators.required]
      ),
      mainPhone: new FormControl(
        this.selCompany && this.selCompany.main_phone,
        [Validators.required, Validators.pattern(this.constant.PHONE_PATTERN)]
      ),
      account_status: new FormControl(
        this.selCompany && this.selCompany.account_status_details.type_id,
        [Validators.required]
      ),
      payment_status: new FormControl(
        this.selCompany && this.selCompany.payment_status_details.type_id,
        [Validators.required]
      ),
      companyLogo: new FormControl(""),
      isLogoDelete: new FormControl(0),
      users: this.fb.array([])
    });
  }

  get users(): FormArray {
    return (<FormArray>this.editAccDetailsFrm.get("users")) as FormArray;
  }

  updateCompanyDetails(form): void {
    let self = this;
    self.submitted = true;
    self.isError = false;
    try {
      if (form.valid) {
        console.log(form.value);

        for (let i = 0; i < form.value.users.length; i++) {
          form.value.users[i].phoneNumber = self.util.unMaskPhoneNumber(
            form.value.users[i].phoneNumber
          );
          if (
            form.value.users[i].isValidEmail == true ||
            form.value.users[i].isValidUserName == true
          ) {
            return;
          }
        }
        form.value.mainPhone = self.util.unMaskPhoneNumber(
          form.value.mainPhone
        );
        let formData: FormData = new FormData();
        formData.append("companyId", form.value.companyId);
        formData.append("organization", form.value.organization);
        formData.append("addressLine1", form.value.addressLine1);
        formData.append("country", form.value.country);
        formData.append("provinence", form.value.provinence);
        formData.append("city", form.value.city);
        formData.append("postalCode", form.value.postalCode);
        formData.append("price_per_user", form.value.price_per_user);
        formData.append("currency", form.value.currency);
        formData.append("businessStructure", form.value.businessStructure);
        formData.append("companyUsers", JSON.stringify(form.value.users));
        formData.append("mainPhone", form.value.mainPhone);
        formData.append("isLogoDelete", form.value.isLogoDelete);
        formData.append("companyLogo", form.value.companyLogo);
        formData.append("account_status", form.value.account_status);
        formData.append("payment_status", form.value.payment_status);
        //self.compLogo ? formData.append('companyLogo', self.compLogo) : "";

        if (form.value.account_status == "4") {
          let data: any = {
            API_URL: "companyCRMEdit",
            reqObj: formData,
            event: {
              source: "DELETE_COMPANY",
              action: "DELETE"
            }
          };
          this.util.showDialog(
            TSADialogComponent,
            "Are you sure you want to delete " +
            this.selCompany.organization + //@Shahebaz ( +this.selCompany.organization + )
              " ?",
            [],
            "Delete Confirmation ?",
            "DELETE_CONFIRMATION",
            data
          );
          return;
        }

        self.util.addSpinner("updateComp", "Update");
        this.file.formDataAPICall(formData, "companyCRMEdit", function(
          error: boolean,
          response: any
        ) {
          self.util.removeSpinner("updateComp", "Update");
          if (error) {
            self.isError = true;
            self.errMsg = response.message;
          } else {
            self.isEdit = false;
            self.selCompany = response.data;
            // "/su/tsa/dashboard/"+form.value.companyId
            self.util.showDialog(DialogComponent, response.message, []);
            self.util.changeEvent({
              source: "UPDATE_STATUS",
              action: "update",
              data: {}
            });
            //self.dialog.open(EditAccountDialog, { data: { 'action': 'updateSuccess' } });
          }
        });
      }
    } catch (err) {
      this.global.addException("Dashboard", "updateCompanyDetails()", err);
    }
  }

  getUsersList(): void {
    try {
      let self = this;
      this.http.doGet(
        "getCompanyUsersList/" + this.selCompany.company_id,
        function(error: boolean, response: any) {
          if (error) {
            alert(response.error.error);
          } else {
            self.selCompany.users = response.data.filter(
              item => item.employee_info.role_id == 2
            );
            console.log(response.data);
            //self.constant.ITEM_COUNT = response.data.length;
            //self.util.hideProcessing('processing-spinner');
            //console.log(self.companyList);

            for (let i = 0; i < self.selCompany.users.length; i++) {
              self.addUser("1", self.selCompany.users[i].employee_info);
            }
          }
        }
      );
    } catch (err) {
      this.global.addException("Dashboard", "getUsersList()", err);
    }
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
          userName: new FormControl(option == "1" ? userData.username : "", [
            Validators.required,
            Validators.minLength(8),
            Validators.maxLength(30)
          ]),
          designation: new FormControl(
            option == "1" ? userData.designation : "",
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
      this.global.addException("Dashboard", "addUser()", err);
    }
  }

  resetPassword(userName): void {
    this.dialog.open(EmployeeDialog, {
      data: { action: "resetPassword", empUsername: userName },
      autoFocus: false
    });
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
        }
      );
    }
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
