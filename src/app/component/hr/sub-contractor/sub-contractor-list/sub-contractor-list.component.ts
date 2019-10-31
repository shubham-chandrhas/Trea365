import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ApplicationRef
} from "@angular/core";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";
import { Router, ActivatedRoute } from "@angular/router";
import { Location } from "@angular/common";
import * as _ from "underscore";

import { MatFormFieldModule } from "@angular/material/form-field";
import { OnboardingGuideDialogComponent } from "../../../onboarding/onboarding-guide/onboarding-guide.component";
import { HrService } from "../../hr.service";
import { AdminService } from "../../../admin/admin.service";
import { UtilService } from "../../../../shared/service/util.service";
import { HttpService } from "../../../../shared/service/http.service";
import { ExportService } from "../../../../shared/service/export.service";
import { ConstantsService } from "../../../../shared/service/constants.service";
import { DialogComponent } from "../../../../shared/model/dialog/dialog.component";
import { GlobalService } from "../../../../shared/service/global.service";
import { EmployeeDialog } from "../../employee/employee-dialog.component";

@Component({
  selector: "app-sub-contractor-list",
  templateUrl: "./sub-contractor-list.component.html",
  styleUrls: ["./sub-contractor-list.component.css"]
})
export class SubContractorListComponent implements OnInit {
  pageData: any = {
    subContractorList: [],
    listCount: 0,
    sortColumn: "id",
    sortColumnType: "N",
    sortOrder: "DSC",
    isError: false,
    additionalFieldSearchTxt: "",
    additionalFieldSearchKey: ""
  };
  public contractorDetails: string = "details";
  public searchList;
  public searchTxt;
  permissionsSet: any;
  tableWidth: string = "auto";
  defaultLocation: string = "";
  searchKeywords: string =
    "userServices,name,title,wage_amount,email_id,work_phone";
    public onBoarding:boolean = false; 

  constructor(
    private http: HttpService,
    public router: Router,
    private route: ActivatedRoute,
    public dialog: MatDialog,
    public util: UtilService,
    private hr: HrService,
    private admin: AdminService,
    private exportDoc: ExportService,
    public constant: ConstantsService,
    private ref: ApplicationRef,
    private global: GlobalService,
    private location: Location
  ) {}

  ngOnInit() {
    let self = this;
    this.util.showProcessing("processing-spinner");
    this.util.setWindowHeight();
    this.util.setPageTitle(this.route);
    this.router.url.split("/")[2] == "csa-onboarding"
      ? this.util.menuChange({ menu: "guide", subMenu: "" })
      : this.util.menuChange({ menu: 6, subMenu: 29 });
    this.getContractorList();
    this.getSubContFields();
    this.permissionsSet = this.util.getModulePermission(135);
    this.pageData.paginationKey = {
      itemsPerPage: this.constant.ITEMS_PER_PAGE,
      currentPage: this.constant.CURRENT_PAGE
    };
    this.admin.newRecord.subscribe(status => {
      if (status) {
        self.getSubContFields();
        self.getContractorList();
        self.pageData.selectedContractor = self.pageData.selectedIndex = null;
      }
    });

    this.util.changeDetection.subscribe(dataObj => {
      if (dataObj && dataObj.source == "SUB_CONTRACTOR") {
        self.getContractorList();
        self.pageData.selectedContractor = self.pageData.selectedIndex = null;
      }
    });
  }

  getSubContFields() {
    let self = this;
    try {
      this.http.doGet("extrafields?type=subcont", function(
        error: boolean,
        response: any
      ) {
        if (error) {
        } else {
          self.pageData.fields = response.data.additional_subcont_fields
            ? response.data.additional_subcont_fields
            : [];
          self.tableWidth =
            self.pageData.fields.length > 0
              ? 1650 + 180 * self.pageData.fields.length + "px"
              : "auto";
        }
      });
    } catch (err) {
      this.global.addException(
        "sub contractor list",
        "getSubContFields()",
        err
      );
    }
  }

  editSubCon(): void {
    sessionStorage.setItem(
      "subContractor",
      JSON.stringify(this.pageData.selectedContractor)
    );
    sessionStorage.setItem("previousPage", "list");
    this.router.url.split("/")[2] == "csa-onboarding"
      ? this.router.navigate(["/hr/csa-onboarding/add-subcontractor"])
      : this.router.navigate(["/hr/csa/add-subcontractor"]);
  }

  getSearchTxt(filterValue: string) {
    if (filterValue == "") {
      this.pageData.searchTxt = "";
    }
  }
  updateCount(count) {
    this.constant.ITEM_COUNT = this.pageData.listCount = count;
  }

  newSubCotrator() {
    sessionStorage.removeItem("subContractor");
    this.util.setDocumentObj([]);
    sessionStorage.setItem("previousPage", "list");
    this.router.url.split("/")[2] == "csa-onboarding"
      ? this.router.navigate(["/hr/csa-onboarding/add-subcontractor"])
      : this.router.navigate(["/hr/csa/add-subcontractor"]);
  }
  addFields() {
    this.dialog.open(OnboardingGuideDialogComponent, {
      data: {
        action: "addFields",
        fields: JSON.parse(JSON.stringify(this.pageData.fields)),
        fieldType: "subcont",
        msgHeader: "Sub-contractor"
      },
      autoFocus: false
    });
  }
  csvUpload() {
    //this.dialog.open(SubContractorDialog, { data: { 'action': 'csvUpload' } });
  }
  deleteContrator() {
    let data: any = {
      API_URL: "user/delete",
      reqObj: {
        user_id: this.pageData.selectedContractor.id,
        userType: "SUB-CONTRACTOR"
      },
      event: {
        source: "SUB_CONTRACTOR",
        action: "DELETE"
      },
      assignedWO: this.pageData.selectedContractor.assignedWO
    };
    //this.util.showDialog(DialogComponent, "Are you sure you want to delete Sub Contractor?", [], "Delete Confirmation", "CONFIRMATION", data);

    this.pageData.selectedContractor.assignedWO.length == 0
      ? this.util.showDialog(
          DialogComponent,
          "Are you sure you want to delete " +
          this.pageData.selectedContractor.name + //@Shahebaz (+this.pageData.selectedContractor.name +)
            " ?",
          [],
          "Delete Confirmation ?",
          "CONFIRMATION",
          data
        )
      : this.util.showDialog(
          DialogComponent,
          this.pageData.selectedContractor.name +
            " is assigned to the following work orders:",
          [],
          "Delete " + this.pageData.selectedContractor.name + " ?",
          "CONFIRMATION_WITH_WARNING",
          data
        );

    //this.dialog.open(SubContractorDialog, { data: { 'action': 'deleteRecord', userId: this.pageData.selectedContractor.id } });
  }
  showDetails(detailOption) {
    this.contractorDetails = detailOption;
    //console.log(detailOption);
  }
  showSchedule(Option) {
    this.contractorDetails = Option;
    //console.log(detailOption);
  }
  getSelectedContractor(selContractorObj: any, index: number) {
    try {
      let self = this;
      this.pageData.selectedContractor = JSON.parse(
        JSON.stringify(selContractorObj)
      );
      //this.pageData.selectedContractor.additional_fields = this.pageData.selectedContractor.additional_fields ?  JSON.parse(this.pageData.selectedContractor.additional_fields) : [];
      this.pageData.empDetails = "details";
      // if(this.pageData.selectedContractor.user_address && (this.pageData.selectedContractor.user_address.latitude=='' || this.pageData.selectedContractor.user_address.latitude ==null) && (this.pageData.selectedContractor.user_address.longitude=='' || this.pageData.selectedContractor.user_address.longitude==null))
      // {
      //     this.defaultLocation = this.pageData.selectedContractor.user_address ? this.pageData.selectedContractor.user_address.address_line_1+', '+this.pageData.selectedContractor.user_address.city_details.city_name+', '+this.pageData.selectedContractor.user_address.province_details.province_name+', '+this.pageData.selectedContractor.user_address.country_details.country_name : '';
      // }
      // else
      // {
      //     this.defaultLocation = this.pageData.selectedContractor.user_address ? this.pageData.selectedContractor.user_address.address_line_1 : '';
      // }
      this.pageData.selectedContractor.addressLine1 = this.pageData
        .selectedContractor.user_address
        ? this.pageData.selectedContractor.user_address.address_line_1
          ? this.pageData.selectedContractor.user_address.address_line_1
          : ""
        : "";
      this.pageData.selectedContractor.addressLine2 = this.pageData
        .selectedContractor.user_address
        ? this.pageData.selectedContractor.user_address.address_line_2
          ? this.pageData.selectedContractor.user_address.address_line_2
          : ""
        : "";
      this.pageData.empBackup = JSON.parse(JSON.stringify(selContractorObj));
      console.log(this.pageData.selectedContractor);
      self.location.go(
        self.location
          .path()
          .split("/")
          .splice(0, self.location.path().split("/").length - 1)
          .join("/") +
          "/" +
          selContractorObj.id
      );
      setTimeout(function() {
        self.util.scrollDown("subConMark");
      }, 1000);
      this.checkAssignedWO();
    } catch (err) {
      this.global.addException(
        "sub contractor list",
        "getSelectedContractor()",
        err
      );
    }
  }

  checkAssignedWO(): void {
    let self = this;
    self.util.addSpinner("delete-btn", "Delete");
    this.http.doGet(
      "getAllWorkOrders/person/" + this.pageData.selectedContractor.id,
      function(error: boolean, response: any) {
        self.util.removeSpinner("delete-btn", "Delete");
        if (error) {
          console.log(response);
        } else {
          self.pageData.selectedContractor.assignedWO =
            response.data.work_orders;
        }
      }
    );
  }

  resetPassword() {
    this.dialog.open(EmployeeDialog, {
      data: {
        action: "resetPassword",
        reset_message: "Reset the subcontractor's password?",
        empUsername: this.pageData.selectedContractor.username
      },
      autoFocus: false
    });
    //this.ref.tick();
  }

  getContractorList() {
    let self = this;
    try {
      this.http.doGet("getSubContractor", function(
        error: boolean,
        response: any
      ) {
        self.util.hideProcessing("processing-spinner");
        if (error) {
          console.log(response);
        } else {
          console.log("cotractor List =", response.data);
          self.pageData.subContractorList = [];
          for (let i = 0; i < response.data.length; i++) {
            let conObj: any = response.data[i].subcontractor_info;
            conObj.title = response.data[i].subcontractor_info.title
              ? response.data[i].subcontractor_info.title
              : "-";
            conObj.name =
              response.data[i].subcontractor_info.first_name +
              " " +
              response.data[i].subcontractor_info.last_name;
            conObj.docs = [
              ...response.data[i].images.filter(
                item => ((item.isDelete = 0), (item.docType = "img"))
              ),
              ...response.data[i].docs.filter(
                item => ((item.isDelete = 0), (item.docType = "doc"))
              )
            ];
            conObj.docShow = self.create2DList([
              ...response.data[i].docs.filter(
                item => ((item.isDelete = 0), (item.docType = "doc"))
              ),
              ...response.data[i].images.filter(
                item => ((item.isDelete = 0), (item.docType = "img"))
              )
            ]);
            conObj.user_services = response.data[i].user_services;
            conObj.user_business_types = response.data[i].user_business_types;
            conObj.hourly_wage_amount = parseFloat(
              conObj.wage_amount ? conObj.wage_amount : 0
            );
            conObj.wage_amount = conObj.wage_amount ? conObj.wage_amount : "-";
            conObj.work_phone = conObj.work_phone ? conObj.work_phone : "-";
            conObj.additional_fields = response.data[i].additional_fields
              ? response.data[i].additional_fields
              : [];
            //conObj.days_off = response.data[i].subcontractor_info.days_off;
            conObj.days_off = response.data[i].subcontractor_info.days_off
              ? JSON.parse(response.data[i].subcontractor_info.days_off)
              : [];

            let fieldCount: number = 1;
            conObj.additional_fields.map(function(field) {
              conObj["label" + fieldCount] = field.data
                ? self.getAdditionalFieldData(field.dataType, field.data)
                : "";
              self.searchKeywords += ",label" + fieldCount;
              fieldCount++;
            });

            if (response.data[i].user_services.length > 0) {
              if (response.data[i].user_services.length > 1) {
                conObj.userServices =
                  response.data[i].user_services[0].service_type +
                  "  (+" +
                  (response.data[i].user_services.length - 1) +
                  ")";
                //response.data[i].user_services[j].service_type
              } else {
                conObj.userServices =
                  response.data[i].user_services[0].service_type;
              }

              // for (let j = 0; j < response.data[i].user_services.length; j++) {
              //     conObj.user_service = response.data[i].user_services[j].service_type ? response.data[i].user_services[j].service_type : '-';
              //     //self.pageData.subContractorList.push(JSON.parse(JSON.stringify(conObj)));
              // }
              self.pageData.subContractorList.push(
                JSON.parse(JSON.stringify(conObj))
              );
            } else {
              conObj.userServices = "-";
              self.pageData.subContractorList.push(conObj);
            }

            //self.pageData.subContractorList.push(conObj);
          }
          self.route.snapshot.paramMap.get("id") != "0"
            ? self.showSubConDetails()
            : "";
          console.log("cotractor List =", self.pageData.subContractorList);
        }
        if(self.pageData.subContractorList.length == 0) {
            self.onBoarding = true;
          }
      });
    } catch (err) {
      this.global.addException(
        "sub contractor list",
        "getContractorList()",
        err
      );
    }
  }

  showSubConDetails() {
    let sortedList: any[] = _.sortBy(
      this.pageData.subContractorList,
      "id"
    ).reverse();
    for (var i = 0; i < sortedList.length; ++i) {
      if (this.route.snapshot.paramMap.get("id") == sortedList[i].id) {
        this.getSelectedContractor(sortedList[i], i);
        this.pageData.selectedIndex = i;
        break;
      }
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

  create2DList(list) {
    try {
      let listCont = 0,
        imgArr = [],
        inArr = [];
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
      this.global.addException("Timesheet", "create2DList()", err);
    }
  }

  exportSubcontractorAsCSV(): void {
    this.exportDoc.generatecsv("subConTbl", "sub_contractor_details");
  }

  exportSubcontractorAsPdf(): void {
    this.exportDoc.generateLandscapepdf(
      "subConTbl",
      "Sub-Contractor List",
      "sub_contractor_details"
    );
  }
  showImage(url) {
    try {
      this.dialog.open(DialogComponent, {
        data: { action: "image", url: url }
      });
      this.ref.tick();
    } catch (err) {
      this.global.addException("Timesheet", "showImage()", err);
    }
  }
}
