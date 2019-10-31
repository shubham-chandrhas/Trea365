import { Component, OnInit, ApplicationRef, Inject } from "@angular/core";
import { MatDialog } from "@angular/material";
import { Router, ActivatedRoute } from "@angular/router";
import { Location } from "@angular/common";
import * as _ from "underscore";

import { EmployeeDialog } from "../employee-dialog.component";
import { OnboardingGuideDialogComponent } from "../../../onboarding/onboarding-guide/onboarding-guide.component";
import { HrService } from "../../hr.service";
import { AdminService } from "../../../admin/admin.service";
import { UtilService } from "../../../../shared/service/util.service";
import { HttpService } from "../../../../shared/service/http.service";
import { ExportService } from "../../../../shared/service/export.service";
import { ConstantsService } from "../../../../shared/service/constants.service";
import { DialogComponent } from "../../../../shared/model/dialog/dialog.component";
import { GlobalService } from "../../../../shared/service/global.service";
import { AppConfig, APP_CONFIG } from "../../../../app-config.module";

import { ManufacturerPartDialog } from "../../../../shared/module/manufacturer-part/manufacturer-part/manufacturer-part.component";
@Component({
  selector: "app-employee-list",
  templateUrl: "./employee-list.component.html",
  styleUrls: ["./employee-list.component.css"]
})
export class EmployeeListComponent implements OnInit {
  pageData: any = {
    empList: [],
    fields: [],
    listCount: 0,
    sortColumn: "id",
    sortColumnType: "N",
    sortOrder: "DSC",
    isEdit: false,
    isError: false,
    additionalFieldSearchTxt: "",
    additionalFieldSearchKey: "",
    permissionAvailability: true,
    companyId: ""
  };
  searchTxt;
  searchList;
  isTSA: boolean = false; //if Trea Super Admin is logged in
  routStrArr;
  loggedInUser;
  permissionsSet: any;
  tableWidth: string = "auto";
  //defaultLocation : string = "";
  searchKeywords: string =
    "employee_id,name,title,role_name,email_id,work_phone,permission_role_name";
  assinedAssetList: any = [];
  assinedAssetListObj: any;
  public onBoarding:boolean = false; 
  constructor(
    @Inject(APP_CONFIG)
    private config: AppConfig,
    public router: Router,
    private route: ActivatedRoute,
    public util: UtilService,
    public dialog: MatDialog,
    private hr: HrService,
    private http: HttpService,
    private admin: AdminService,
    private exportDoc: ExportService,
    public constant: ConstantsService,
    private ref: ApplicationRef,
    private global: GlobalService,
    private location: Location
  ) {}

  ngOnInit() {
    let self = this;
    try {
      this.pageData.paginationKey = {
        itemsPerPage: this.constant.ITEMS_PER_PAGE,
        currentPage: this.constant.CURRENT_PAGE
      };
      this.pageData.companyId = this.route.snapshot.paramMap.get("compId");
      this.routStrArr = this.router.url.split("/");
      this.loggedInUser = JSON.parse(atob(localStorage.getItem("USER")));
      this.router.url.split("/")[2] == "csa-onboarding"
        ? this.util.menuChange({ menu: "guide", subMenu: "" })
        : this.util.menuChange({ menu: 6, subMenu: 28 });
      this.util.setWindowHeight();
      this.util.setPageTitle(this.route);
      //console.log(this.routStrArr[this.routStrArr.length - 1]);
      this.loggedInUser.role_id == "1"
        ? (this.getEmpList(this.pageData.companyId), (this.isTSA = true))
        : this.getEmpList();
      //this.getEmpFields();
      this.loggedInUser.role_id == "1"
        ? this.getEmpFields(this.pageData.companyId)
        : this.getEmpFields();
      this.permissionsSet = this.util.getModulePermission(126);

      this.admin.newRecord.subscribe(status => {
        if (status) {
          self.loggedInUser.role_id == "1"
            ? self.getEmpFields(this.pageData.companyId)
            : self.getEmpFields();
          self.loggedInUser.role_id == "1"
            ? (self.getEmpList(this.pageData.companyId), (self.isTSA = true))
            : self.getEmpList();
          self.pageData.selectedEmp = self.pageData.selectedIndex = null;
        }
      });

      this.util.changeDetection.subscribe(dataObj => {
        if (dataObj && dataObj.source == "EMPLOYEE") {
          this.loggedInUser.role_id == "1"
            ? (this.getEmpList(this.pageData.companyId), (this.isTSA = true))
            : this.getEmpList();
          self.pageData.selectedEmp = self.pageData.selectedIndex = null;
        }
      });

      this.loggedInUser.role_id == "1"
        ? this.checkPermissionAvailability()
        : "";
    } catch (err) {
      this.global.addException("employee list", "ngOnInit()", err);
    }
  }

  checkPermissionAvailability(): void {
    let self = this;
    this.http.doGet(
      "check-company-permissions/" + this.pageData.companyId,
      function(error: boolean, response: any) {
        if (!error) {
          self.pageData.permissionAvailability =
            response.data.available == 1 ? true : false;
        }
      }
    );
  }

  getEmpFields(id: any = "") {
    let self = this;
    this.util.showProcessing("processing-spinner");
    try {
      this.http.doGet(
        id ? "extrafields/" + id + "?type=emp" : "extrafields?type=emp",
        function(error: boolean, response: any) {
          self.util.hideProcessing("processing-spinner");
          if (error) {
          } else {
            self.pageData.fields = response.data.additional_emp_fields
              ? response.data.additional_emp_fields
              : [];
            self.tableWidth =
              self.pageData.fields.length > 0
                ? 1650 + 180 * self.pageData.fields.length + "px"
                : "auto";
          }
        }
      );
    } catch (err) {
      this.global.addException("employee list", "getEmpFields()", err);
    }
  }

  getEmpList(id: any = "") {
    let self = this;
    this.util.showProcessing("processing-spinner");
    try {
      this.http.doGet(
        id ? "getCompanyUsersList/" + id : "getEmployee",
        function(error: boolean, response: any) {
          self.util.hideProcessing("processing-spinner");
          if (error) {
            console.log(response);
          } else {
            self.pageData.empList = [];
            for (let i = 0; i < response.data.length; i++) {
              let empObj: any = response.data[i].employee_info;
              empObj.employee_id = response.data[i].employee_info.employee_id
                ? response.data[i].employee_info.employee_id
                : "-";
              empObj.permission_role_name = response.data[i].employee_info
                .permission_role_name
                ? response.data[i].employee_info.permission_role_name
                : "-";
              //role_name
              empObj.role_name = response.data[i].employee_info.role_name
                ? response.data[i].employee_info.role_name
                : "-";
              empObj.name =
                response.data[i].employee_info.first_name +
                " " +
                (response.data[i].employee_info.last_name
                  ? response.data[i].employee_info.last_name
                  : "");
              empObj.title = response.data[i].employee_info.title
                ? response.data[i].employee_info.title
                : "-";
              empObj.docs = [
                ...response.data[i].images.filter(
                  item => ((item.isDelete = 0), (item.docType = "img"))
                ),
                ...response.data[i].docs.filter(
                  item => ((item.isDelete = 0), (item.docType = "doc"))
                )
              ];
              empObj.docShow = self.create2DList([
                ...response.data[i].docs.filter(
                  item => ((item.isDelete = 0), (item.docType = "doc"))
                ),
                ...response.data[i].images.filter(
                  item => ((item.isDelete = 0), (item.docType = "img"))
                )
              ]);
              empObj.user_services = response.data[i].user_services;
              empObj.user_business_types = response.data[i].user_business_types;
              empObj.additional_fields = response.data[i].additional_fields
                ? response.data[i].additional_fields
                : [];
              empObj.days_off = response.data[i].employee_info.days_off
                ? JSON.parse(response.data[i].employee_info.days_off)
                : [];
              let fieldCount: number = 1;
              empObj.additional_fields.map(function(field) {
                empObj["label" + fieldCount] = field.data
                  ? self.getAdditionalFieldData(field.dataType, field.data)
                  : "";
                self.searchKeywords += ",label" + fieldCount;
                fieldCount++;
              });
              self.pageData.empList.push(empObj);
            }
            self.route.snapshot.paramMap.get("id") != "0"
              ? self.showEmpDetails()
              : "";
            console.log("EMP =", self.pageData.empList);
            console.log("assigned_assets =", self.pageData.empList);
          }

          if(self.pageData.empList.length == 0) {
            self.onBoarding = true;
          }
        }
      );
    } catch (err) {
      this.global.addException("employee list", "getEmpList()", err);
    }
  }

  getAdditionalFieldData(dataType, data): any {
    switch (dataType) {
      case "Number":
        return parseInt(data);
      case "Decimal":
        return parseFloat(data);
      default:
        return data;
    }
  }

  showEmpDetails() {
    let sortedList: any[] = _.sortBy(this.pageData.empList, "id").reverse();
    for (var i = 0; i < sortedList.length; ++i) {
      if (this.route.snapshot.paramMap.get("id") == sortedList[i].id) {
        this.getSelectedEmp(sortedList[i], i);
        this.pageData.selectedIndex = i;
        break;
      }
    }
  }

  getSelectedEmp(emp, indx) {
    try {
      let self = this;
      this.pageData.selectedEmp = JSON.parse(JSON.stringify(emp));
      console.log("selected emp details 111= ", this.pageData.selectedEmp);
      this.pageData.selectedEmp.additional_fields = this.pageData.selectedEmp
        .additional_fields
        ? this.pageData.selectedEmp.additional_fields
        : [];
      // if(this.pageData.selectedEmp.user_address && (this.pageData.selectedEmp.user_address.latitude=='' || this.pageData.selectedEmp.user_address.latitude ==null) && (this.pageData.selectedEmp.user_address.longitude=='' || this.pageData.selectedEmp.user_address.longitude==null))
      // {
      //     this.defaultLocation = this.pageData.selectedEmp.user_address ? this.pageData.selectedEmp.user_address.address_line_1+', '+this.pageData.selectedEmp.user_address.city_details.city_name+', '+this.pageData.selectedEmp.user_address.province_details.province_name+', '+this.pageData.selectedEmp.user_address.country_details.country_name : '';
      // }
      // else
      // {
      //     this.defaultLocation = this.pageData.selectedEmp.user_address ? this.pageData.selectedEmp.user_address.address_line_1 : '';
      // }
      this.pageData.selectedEmp.addressLine1 = this.pageData.selectedEmp
        .user_address
        ? this.pageData.selectedEmp.user_address.address_line_1
          ? this.pageData.selectedEmp.user_address.address_line_1
          : ""
        : "";
      this.pageData.selectedEmp.addressLine2 = this.pageData.selectedEmp
        .user_address
        ? this.pageData.selectedEmp.user_address.address_line_2
          ? this.pageData.selectedEmp.user_address.address_line_2
          : ""
        : "";
      this.pageData.empDetails = "details";
      this.pageData.empBackup = JSON.parse(
        JSON.stringify(this.pageData.selectedEmp)
      );
      console.log("selected emp details 222= ", this.pageData.selectedEmp);
      self.location.go(
        self.location
          .path()
          .split("/")
          .splice(0, self.location.path().split("/").length - 1)
          .join("/") +
          "/" +
          emp.id
      );
      setTimeout(function() {
        self.util.scrollDown("empMark");
      }, 1000);
      this.checkAssignedWO();
      this.getAssignedAssets(emp, indx);
    } catch (err) {
      this.global.addException("employee list", "getSelectedEmp()", err);
    }
  }
  getAssignedAssets(emp, indx) {
    var self = this;
    // console.log('assigned === ', emp.assigned_assets);
    this.assinedAssetListObj = emp.assigned_assets;
    console.log("this.assinedAssetListObj === ", JSON.stringify(this.assinedAssetListObj));

    // this.assinedAssetListObj.assetId = emp.assigned_assets.asset_id;
    // this.assinedAssetListObj.assetName = emp.assigned_assets.short_tag;
    // this.assinedAssetListObj.assetSrNo = emp.assigned_assets.serial_no;
    // this.assinedAssetListObj.assetStatus = emp.assigned_assets.status;
    // this.assinedAssetListObj.assetStatus = emp.assigned_assets.status;
    // this.assinedAssetListObj.assetAssignedDate = emp.assigned_assets.created_at;
    // this.assinedAssetListObj.assetLocation = emp.assigned_assets.location_details.location_name;
  }

  checkAssignedWO(): void {
    let self = this;
    self.util.addSpinner("delete-btn", "Delete");
    this.http.doGet(
      "getAllWorkOrders/person/" + this.pageData.selectedEmp.id,
      function(error: boolean, response: any) {
        self.util.removeSpinner("delete-btn", "Delete");
        if (error) {
          console.log(response);
        } else {
          self.pageData.selectedEmp.assignedWO = response.data.work_orders;
          self.pageData.empBackup = JSON.parse(
            JSON.stringify(self.pageData.selectedEmp)
          );
        }
      }
    );
  }

  create2DList(list) {
    let listCont = 0,
      imgArr = [],
      inArr = [];
    try {
      while (listCont < list.length) {
        let count = 0;
        inArr = [];
        while (count < 3 && listCont < list.length) {
          inArr.push(list[listCont]);
          count++;
          listCont++;
        }
        imgArr.push({ inArray: inArr });
      }
      return imgArr;
    } catch (err) {
      this.global.addException("employee list", "create2DList()", err);
    }
  }

  showDetails(option) {
    this.pageData.empDetails = option;
    this.pageData.selectedEmp = JSON.parse(
      JSON.stringify(this.pageData.empBackup)
    );
  }
  showSchedule(option) {
    this.pageData.empDetails = option;
    this.pageData.selectedEmp = JSON.parse(
      JSON.stringify(this.pageData.empBackup)
    );
  }
  showAssets(option) {
    this.pageData.empDetails = option;
    this.pageData.selectedEmp = JSON.parse(
      JSON.stringify(this.pageData.empBackup)
    );
  }

  editEmp() {
    try {
      sessionStorage.setItem("emp", JSON.stringify(this.pageData.selectedEmp));
      sessionStorage.setItem("previousPage", "list");
      if (this.loggedInUser.role_id == "1") {
        this.router.navigate(["/su/tsa/add-user/" + this.pageData.companyId]);
      } else {
        this.router.url.split("/")[2] == "csa-onboarding"
          ? this.router.navigate(["/hr/csa-onboarding/new-employee"])
          : this.router.navigate(["/hr/csa/new-employee"]);
      }
    } catch (err) {
      this.global.addException("employee list", "editEmp()", err);
    }
  }

  getSearchTxt(filterValue: string) {
    if (filterValue == "") {
      this.pageData.searchTxt = "";
    }
  }
  updateCount(count) {
    this.constant.ITEM_COUNT = this.pageData.listCount = count;
  }
  addEmp() {
    try {
      sessionStorage.removeItem("emp");
      sessionStorage.setItem("previousPage", "list");
      this.util.setDocumentObj([]);
      if (this.loggedInUser.role_id == "1") {
        this.router.navigate(["/su/tsa/add-user/" + this.pageData.companyId]);
      } else {
        this.router.url.split("/")[2] == "csa-onboarding"
          ? this.router.navigate(["/hr/csa-onboarding/new-employee"])
          : this.router.navigate(["/hr/csa/new-employee"]);
      }
    } catch (err) {
      this.global.addException("employee list", "addEmp()", err);
    }
  }
  addFromCSV() {
    let route: string,
      apiEndPoint: string,
      csvTemplateUrl: string,
      redirectUrl: string;
    route = "/csa-onboarding/csv-preview/employee";
    apiEndPoint = "employee/csv";
    csvTemplateUrl = this.config.domainIP + "api/download/csv/employee.csv";
    redirectUrl = "/csa/employee-list/0";
    redirectUrl = "/hr/csa/employee-list/0";
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
  exportEmpAsPdf() {
    this.exportDoc.generateLandscapepdf(
      "empTbl",
      "Employee List",
      "employee_details"
    );
  }
  exportEmpAsCSV() {
    this.exportDoc.generatecsv("empTbl", "employee_details");
  }
  resetPassword() {
    this.dialog.open(EmployeeDialog, {
      data: {
        action: "resetPassword",
        empUsername: this.pageData.selectedEmp.username
      },
      autoFocus: false
    });
    //this.ref.tick();
  }
  addFields() {
    console.log(this.pageData);
    this.dialog.open(OnboardingGuideDialogComponent, {
      data: {
        action: "addFields",
        fields: JSON.parse(JSON.stringify(this.pageData.fields)),
        fieldType: "emp",
        msgHeader: "Employee"
      },
      autoFocus: false,
      panelClass: "custom-width"
    });
  }
  deleteEmployee() {
    // console.log('Delete');
    //   console.log(this.pageData.selectedEmp);
    let url;
    this.loggedInUser.role_id == "1"
      ? (url = "user/delete/" + this.pageData.companyId)
      : (url = "user/delete");
    let data: any = {
      API_URL: url,
      reqObj: {
        user_id: this.pageData.selectedEmp.id,
        userType: "EMPLOYEE"
      },
      event: {
        source: "EMPLOYEE",
        action: "DELETE"
      },
      assignedWO: this.pageData.selectedEmp.assignedWO
    };

    this.pageData.selectedEmp.assignedWO.length == 0
      ? this.util.showDialog(
          DialogComponent,
          "Are you sure you want to delete " +
          this.pageData.selectedEmp.name + //@Shahebaz (+this.pageData.selectedEmp.name +)
            " ?",
          [],
          "Delete Confirmation ?",
          "CONFIRMATION",
          data
        )
      : this.util.showDialog(
          DialogComponent,
          this.pageData.selectedEmp.name +
            " is assigned to the following work orders:",
          [],
          "Delete " + this.pageData.selectedEmp.name + " ?",
          "CONFIRMATION_WITH_WARNING",
          data
        );
  }

  showImage(url) {
    this.dialog.open(DialogComponent, { data: { action: "image", url: url } });
    this.ref.tick();
  }
}
