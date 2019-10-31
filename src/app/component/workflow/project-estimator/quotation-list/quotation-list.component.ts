import { Component, OnInit, Inject } from "@angular/core";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";
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
import { Location } from "@angular/common";

import { HttpService } from "../../../../shared/service/http.service";
import { UtilService } from "../../../../shared/service/util.service";
import { ConstantsService } from "../../../../shared/service/constants.service";
import { GlobalService } from "../../../../shared/service/global.service";
import { DialogComponent } from "../../../../shared/model/dialog/dialog.component";
import * as _ from "underscore";

import { ProjectEstimatorService } from "../../project-estimator/project-estimator.service";
import { ProjectEstimatorDialog } from "../project-estimator-dialog.component";
import { AppConfig, APP_CONFIG } from "../../../../app-config.module";

import { Observable, Subscription } from 'rxjs';

@Component({
  selector: "app-quotation-list",
  templateUrl: "./quotation-list.component.html",
  styleUrls: ["./quotation-list.component.css"]
})
export class QuotationListComponent implements OnInit {
  pageData: any = {
    QuotationList: [],
    listCount: 0,
    sortColumn: "project_estimate_id",
    sortOrder: "DSC",
    sortColumnType: "N",
    prodDetails: "details",
    action: "",
    isEdit: false,
    isError: false,
    submitted: false
  };
  searchList;
  public sortColumn: string = "project_estimate_id";
  public sortOrder: string = "DSC";
  columnType: string = "N";
  public QuotationList: any = "";
  public selectedQuotation: any = "";
  public versions: any = "";
  public latest: string;
  public clientDetails: any = "";
  public searchTxt: string;
  public paginationKey: any;
  public listCount: number = 0;
  public errMsg: string = "";
  public isError: boolean = false;
  public successMsg: string = "";
  public isSuccess: boolean = false;
  public selectedIndex;
  public versionlist: any;
  public versionData: any = "";
  public statusSearch;
  public dateSearch;
  public clientSearch;
  public followedBySearch;
  public quoteNoSearch;
  inspectionSearch;
  permissionsSet: any;
  remarkDiv: string = "hide";
  peRemark: string;
  loggedInUser: any;
  submittedPay: boolean;
  remarksArr: any = [];
  public onBoarding:boolean = false;
  subscription: Subscription;

  constructor(
    public dialog: MatDialog,
    private http: HttpService,
    public util: UtilService,
    public router: Router,
    private route: ActivatedRoute,
    public constant: ConstantsService,
    private global: GlobalService,
    private PEService: ProjectEstimatorService,
    private location: Location,
    @Inject(APP_CONFIG)
    private config: AppConfig
  ) {}

  ngOnInit() {
    let self = this;
    self.util.menuChange({
      menu: 4,
      subMenu: 25
    });
    self.paginationKey = {
      itemsPerPage: self.constant.ITEMS_PER_PAGE,
      currentPage: self.constant.CURRENT_PAGE
    };
    self.util.setWindowHeight();
    this.util.setPageTitle(this.route);
    this.getQuotationList("INIT");
    this.permissionsSet = this.util.getModulePermission(106);
    this.subscription =  this.util.changeDetection.subscribe(dataObj => {

      if (dataObj && dataObj.source == "QUOTATION") {
        self.getQuotationList("INIT");
        self.selectedQuotation = null;
      } else if (
        dataObj &&
        (dataObj.source == "SAVE_FOR_FOLLOW_UP" ||
          dataObj.source == "SITE_INSPECTION")
      ) {
        self.getQuotationList("REFRESH", dataObj.data.project_estimate_id);
      } else if (dataObj && (dataObj.source == "APPROVE_PE" || dataObj.source == "REMARK_CREATE" )) {
        self.getQuotationList("APPROVE", dataObj.data.project_estimate_id);
      }
    });
    console.log("Quotation List.....");
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  changePage(event) {
    this.paginationKey.currentPage = event;
    window.scrollTo(0, 0);
  }
  changeItemPerPage() {
    window.scrollTo(0, 0);
  }

  updateCount(count) {
    this.constant.ITEM_COUNT = count;
    this.listCount = count;
  }

  addNewQuotation() {
    sessionStorage.removeItem("quotationDetails");
    this.PEService.projectEstimatorData = {};
    sessionStorage.removeItem("quotationFormFlag");
    this.router.navigate(["/workflow/quote/csa/quotation/services"]);
  }

  getQuotationList(option: string = "REFRESH", id: number = 0) {
    this.selectedIndex = null;
    var self = this;
    self.QuotationList = [];
    this.util.showProcessing("processing-spinner");
    try {
      this.http.doGet("getProjectEstimateList", function(
        error: boolean,
        response: any
      ) {
        if (error) {
          self.errMsg = response.message;
          self.isError = true;
        } else {
          self.QuotationList = response.data;
          for (let i = 0; i < response.data.length; i++) {
            // response.data[i].peStatus = response.data[i].status_details
            //   ? response.data[i].status == 1
            //     ? response.data[i].status_details.status +
            //       " (" +
            //       response.data[i].sub_status +
            //       ")"
            //     : response.data[i].status == 3
            //     ? response.data[i].status_details.status +
            //       " (" +
            //       response.data[i].cr_status +
            //       ")"
            //     : response.data[i].status_details.status
            //   : "N/A";
            response.data[i].peStatus = response.data[i].status_details
              ? response.data[i].status == 1
                ? response.data[i].status_details.status 
                : response.data[i].status == 3
                ? response.data[i].status_details.status 
                : response.data[i].status_details.status
              : "N/A";
            response.data[i].client_details.company_name = response.data[i]
              .client_details.company_name
              ? response.data[i].client_details.company_name
              : response.data[i].client_details.first_name +
                " " +
                response.data[i].client_details.last_name;
            response.data[i].company_name = response.data[i].client_details
              .company_name
              ? response.data[i].client_details.company_name
              : response.data[i].client_details.first_name +
                " " +
                response.data[i].client_details.last_name;
            response.data[i].follower = {
              first_name: response.data[i].follower
                ? response.data[i].follower.first_name +
                  " " +
                  response.data[i].follower.last_name
                : "N/A"
            };
            response.data[i].first_name = response.data[i].follower
              ? response.data[i].follower.first_name +
                " " +
                response.data[i].follower.last_name
              : "N/A";
            response.data[i].inspection =
              response.data[i].site_inspection &&
              response.data[i].site_inspection.site_inspection_status_details
                ? "Booked"
                : "N/A";
            // response.data[i].status_details.status =
            //   response.data[i].status == 1
            //     ? response.data[i].status_details.status +
            //       " (" +
            //       response.data[i].sub_status +
            //       ")"
            //     : response.data[i].status == 3
            //     ? response.data[i].status_details.status +
            //       " (" +
            //       response.data[i].cr_status +
            //       ")"
            //     : response.data[i].status_details.status;
            response.data[i].status_details.status =
              response.data[i].status == 1
                ? response.data[i].status_details.status 
                : response.data[i].status == 3
                ? response.data[i].status_details.status 
                : response.data[i].status_details.status;
            response.data[i].formatDate = self.util.getFormatedDate(
              response.data[i].project_estimate_date
            );
          }
          self.constant.ITEM_COUNT = response.data.length;
          self.util.hideProcessing("processing-spinner");
          self.route.snapshot.paramMap.get("id") != "0" || option == "APPROVE"
            ? self.showQuotationDetails(option, id)
            : "";
        }

        if(self.QuotationList.length == 0) {
            self.onBoarding = true;
          }
      });
    } catch (err) {
      this.global.addException("Error Log", "constructor()", err);
    }
  }

  showQuotationDetails(option, id): void {
    let sortedList: any[] = _.sortBy(
      this.QuotationList,
      "project_estimate_id"
    ).reverse();
    if (option == "INIT") {
      for (var i = 0; i < sortedList.length; ++i) {
        if (
          this.route.snapshot.paramMap.get("id") ==
          sortedList[i].project_estimate_id
        ) {
          this.getSelectedQuotation(sortedList[i], i);
          this.selectedIndex = i;
          break;
        }
      }
    } else if ((option == "REFRESH" || option == "APPROVE") && id != 0) {
      for (var i = 0; i < sortedList.length; ++i) {
        if (id == sortedList[i].project_estimate_id) {
          this.getSelectedQuotation(sortedList[i], i);
          this.selectedIndex = i;
          break;
        }
      }
    } else {
      this.getSelectedQuotation(sortedList[0], 0);
      this.selectedIndex = 0;
    }
  }

  getSearchTxt(filterValue: string) {
    if (filterValue == "") {
      this.searchTxt = "";
    }
  }

  clearCR() {
    sessionStorage.removeItem("CrDetails");
  }

  getSelectedQuotation(quotation, index) {
    var self = this;
    self.selectedQuotation = "";
    self.errMsg = "";
    self.successMsg = "";
    self.latest = "";
    this.util.showProcessing("processing-spinner");
    try {
      this.http.doGet(
        "getProjectEstimateById/" + quotation.project_estimate_id,
        function(error: boolean, response: any) {
          if (error) {
            console.log(response.error.error);
          } else {
            // response.data.services.filter(
            //   item =>
            //     (item.updateStatus =
            //       item.is_cr == 1 && item.is_approved == 0 ? true : false)
            // );
            // response.data.product_materials.filter(
            //   item =>
            //     (item.updateStatus =
            //       item.is_cr == 1 && item.is_approved == 0 ? true : false)
            // );
            self.selectedQuotation = response.data;
            self.selectedQuotation.pdfLink =
              self.config.pdfEndpoint +
              "quotation/" +
              self.selectedQuotation.pe_random_number +
              "/pdf";
            self.selectedQuotation.preview =
              self.config.pdfEndpoint +
              "quotation/" +
              self.selectedQuotation.pe_random_number;
            self.selectedQuotation.paySchTotalCost = 0;
            self.selectedQuotation.reviewVersion = [];
            self.versions = [];
            if (self.selectedQuotation.versions.length > 0) {
              self.versions.push(self.selectedQuotation);
              self.selectedQuotation.versions.forEach((element, i) => {
                if (element != null) self.versions.push(element);
              });
              self.versionlist = "0";
            } else {
              self.versions = "";
              self.versionlist = "0";
            }
            if (self.selectedQuotation.costs.length == 0) {
              self.calculateCost();
            }
            if (self.selectedQuotation.payment_schedules.length > 0) {
              for (
                let index = 0;
                index < self.selectedQuotation.payment_schedules.length;
                index++
              ) {
                self.selectedQuotation.paySchTotalCost =
                  parseFloat(self.selectedQuotation.paySchTotalCost) +
                  parseFloat(
                    self.selectedQuotation.payment_schedules[index].amount_due
                  );
              }
            }

            if (self.selectedQuotation.status == "3") {
              self.selectedQuotation.services.map(item => {
                item.newCR =
                  item.is_cr == "1" && item.is_approved == "0" ? true : false;
                item.updateStatus =
                  item.is_cr == 1 && item.is_approved == 0 ? true : false;
              });
              self.selectedQuotation.product_materials.map(item => {
                item.newCR =
                  item.is_cr == "1" && item.is_approved == "0" ? true : false;
                item.updateStatus =
                  item.is_cr == 1 && item.is_approved == 0 ? true : false;
              });
            }
            console.log(self.selectedQuotation.paySchTotalCost);
            self.selectedIndex = index;
            self.util.hideProcessing("processing-spinner");
            self.location.go(
              "/workflow/quote/csa/quotation-list/" +
                quotation.project_estimate_id
            );
            setTimeout(function() {
              self.util.scrollDown("qutationMark");
            }, 1000);
          }
        }
      );
    } catch (err) {
      this.global.addException("Error Log", "constructor()", err);
    }
  }

  calculateCost() {
    var cost: any = {
      //"pe_cost_id":966,
      //"project_estimate_id":1269,
      cost_of_services: "0.0",
      cost_of_materials: "0.0",
      shipping_and_handling: "0.0",
      adjustment: "0.0",
      subtotal: "0.0",
      taxes: "0.0",
      tax_amount: "0.0",
      total_cost: "0.0"
      //"is_approved":1,
      //"company_id":34
    };
    console.log(this.selectedQuotation.services);
    console.log(this.selectedQuotation.product_materials);
    if (this.selectedQuotation.services) {
      for (let i = 0; i < this.selectedQuotation.services.length; i++) {
        cost.cost_of_services =
          parseFloat(cost.cost_of_services) +
          parseFloat(this.selectedQuotation.services[i].cost);
      }
    }
    if (this.selectedQuotation.product_materials) {
      for (
        let i = 0;
        i < this.selectedQuotation.product_materials.length;
        i++
      ) {
        cost.cost_of_materials =
          parseFloat(cost.cost_of_materials) +
          parseFloat(this.selectedQuotation.product_materials[i].cost);
      }
    }
    cost.subtotal = cost.total_cost =
      parseFloat(cost.cost_of_services) + parseFloat(cost.cost_of_materials);
    this.selectedQuotation.costs = [cost];
  }

  setVersion(index) {
    //this.selectedQuotation = this.versions[index];
    var pe_id = this.versions[index].project_estimate_id;
    var self = this;
    self.selectedQuotation = "";
    this.util.showProcessing("processing-spinner");
    try {
      this.http.doGet("getProjectEstimateById/" + pe_id, function(
        error: boolean,
        response: any
      ) {
        if (error) {
          console.log(response.error.error);
        } else {
          response.data.services.filter(
            item =>
              (item.updateStatus =
                item.is_cr == 1 && item.is_approved == 0 ? true : false)
          );
          response.data.product_materials.filter(
            item =>
              (item.updateStatus =
                item.is_cr == 1 && item.is_approved == 0 ? true : false)
          );
          self.selectedQuotation = response.data;
          if (self.selectedQuotation.costs.length == 0) {
            self.calculateCost();
          }
          self.util.hideProcessing("processing-spinner");
          self.location.go("/workflow/quote/csa/quotation-list/" + pe_id);
          setTimeout(function() {
            self.util.scrollDown("qutationMark");
          }, 1000);
        }
      });
    } catch (err) {
      this.global.addException("Error Log", "constructor()", err);
    }
  }

  editQuotation(pe_id) {
    var self = this;
    self.selectedQuotation.reviewVersion = [];
    sessionStorage.removeItem("quotationDetails");
    self.PEService.projectEstimatorData = "";
    sessionStorage.removeItem("quotationFormFlag");
    try {
      if (self.versions.length > 0) {
        for (var i = 0; i < self.versions.length; i++) {
          self.selectedQuotation.reviewVersion.push(
            self.PEService.setResponseForPE(self.versions[i])
          );
          self.selectedQuotation.reviewVersion[i] = JSON.parse(
            self.selectedQuotation.reviewVersion[i]
          );
        }
      }
      self.selectedQuotation.randomKey = JSON.stringify(Math.random());

      sessionStorage.setItem(
        "quotationDetails",
        self.PEService.setResponseForPE(self.selectedQuotation)
      );
      sessionStorage.setItem(
        "quotationFormFlag",
        JSON.stringify(self.PEService.getFormValidationStatus())
      );
      // sessionStorage.setItem("randomKeyPe",JSON.stringify(randomKey));
    } catch (err) {
      this.global.addException("Quatation list", "editQuotation()", err);
    }
    self.router.navigate(["/workflow/quote/csa/quotation/services"]);
  }

  deleteQuotation(pe_id) {
    let data: any = {
      API_URL: "deleteWorkflowPE",
      reqObj: {
        project_estimate_id: pe_id
      },
      event: {
        source: "QUOTATION",
        action: "DELETE"
      }
    };
    this.util.showDialog(
      DialogComponent,
      "Are you sure you want to delete Quote No: " +
        this.selectedQuotation.project_estimate_no +
        " ?", //@shahebaz (+ this.selectedQuotation.project_estimate_no +)
      [],
      "Delete Confirmation ?",
      "CONFIRMATION",
      data
    );
  }

  sendQuote(peId) {
    var self = this;
    // if(this.selectedQuotation.status == 1 && this.selectedQuotation.sub_status == 'Incomplete'){
    //   this.isError = true;
    //   this.errMsg = "Quotation status is Incomplete, Please add remaining incomplete information.";
    //   return;
    // }
    this.util.showProcessing("processing-spinner");
    try {
      this.http.doGet("sendpequote/" + peId, function(
        error: boolean,
        response: any
      ) {
        self.util.hideProcessing("processing-spinner");
        if (error) {
          self.errMsg = response.message;
          self.isError = true;
        } else {
          if (response.status) {
            self.isSuccess = true;
            self.util.showDialog(DialogComponent, response.message);
            self.getQuotationList("REFRESH", peId);
          } else {
            self.errMsg = response.message;
            self.isError = true;
          }
        }
      });
    } catch (err) {
      this.global.addException("Error Log", "constructor()", err);
    }
  }

  approvePE(pe_id) {
    //this.util.showProcessing('processing-spinner');
    // if(this.selectedQuotation.status == 1 && this.selectedQuotation.sub_status == 'Incomplete'){
    //   this.isError = true;
    //   this.errMsg = "Quotation status is Incomplete, Please add remaining incomplete information.";
    //   return;
    // }
    var self = this;
    let reqObj: any = {
      project_estimate_id: pe_id,
      status_id: 5
    };

    self.util.addSpinner("approveBtn", "Approve");
    self.selectedQuotation.reviewVersion = [];
    sessionStorage.removeItem("quotationDetails");
    self.PEService.projectEstimatorData = "";
    sessionStorage.removeItem("quotationFormFlag");
    if (self.versions.length > 0) {
      for (var i = 0; i < self.versions.length; i++) {
        self.selectedQuotation.reviewVersion.push(
          self.PEService.setResponseForPE(self.versions[i])
        );
        self.selectedQuotation.reviewVersion[i] = JSON.parse(
          self.selectedQuotation.reviewVersion[i]
        );
      }
    }
    sessionStorage.setItem(
      "quotationDetails",
      self.PEService.setResponseForPE(self.selectedQuotation)
    );
    sessionStorage.setItem(
      "quotationFormFlag",
      JSON.stringify(self.PEService.getFormValidationStatus())
    );
    // this.PEService.saveProjectEstimator("edit", "APPROVE", function(error: boolean, response: any) {
    //     self.util.removeSpinner('approveBtn', "Approve");
    //     if (error) {
    //         self.errMsg = response.message;
    //         self.isError = true;
    //     } else {
    //         self.util.showDialog(DialogComponent, response.message, ['/workflow/quote/csa/quotation-list/'+response.data.project_estimate_id]);
    //         self.getQuotationList('APPROVE', response.data.project_estimate_id);
    //     }
    // });
    self.util.removeSpinner("approveBtn", "Approve");
    this.dialog.open(ProjectEstimatorDialog, {
      data: {
        action: "approveConfirmation",
        dataObj: "APPROVE_PE",
        apiAction: pe_id ? "edit" : "add"
      },
      autoFocus: false
    });
  }
  showSaveForFollowUpPopup() {
    this.setUpQuotationDetails();
    this.dialog.open(ProjectEstimatorDialog, {
      data: { action: "saveForFollowUp" }
    });
  }

  showSiteInspectionPopup() {
    this.setUpQuotationDetails();
    this.dialog.open(ProjectEstimatorDialog, {
      data: { action: "siteInspection" }
    });
  }

  setUpQuotationDetails() {
    var self = this;
    try {
      self.selectedQuotation.reviewVersion = [];
      sessionStorage.removeItem("quotationDetails");
      self.PEService.projectEstimatorData = "";
      sessionStorage.removeItem("quotationFormFlag");
      sessionStorage.setItem(
        "quotationDetails",
        self.PEService.setResponseForPE(self.selectedQuotation)
      );
      sessionStorage.setItem(
        "quotationFormFlag",
        JSON.stringify(self.PEService.getFormValidationStatus())
      );
    } catch (err) {
      this.global.addException(
        "Quatation list",
        "showSaveForFollowUpPopup()",
        err
      );
    }
  }

  resendMail(emailLog: any) {
    console.log(emailLog);
    let self = this;
    try {
      this.errMsg = "";
      self.util.addSpinner("resendEmail", "Resend");
      this.http.doGet("resend-email/" + emailLog.email_logs_id, function(
        error: boolean,
        response: any
      ) {
        console.log(response);
        self.util.removeSpinner("resendEmail", "Resend");
        if (error) {
          // console.log('error');
          this.errMsg = response.message;
        } else {
          self.util.showDialog(DialogComponent, response.message);
          self.getQuotationList("REFRESH");
          // console.log('no error');
        }
      });
    } catch (err) {
      this.global.addException("Quotation List Component", "resendMail()", err);
    }
  }

  //   Create Work Order From PE
  goToWoSetup(project_estimate_id) {
    try {
      if (project_estimate_id !== null && project_estimate_id !== "") {
        let create_WO_Obj: any = {};
        create_WO_Obj.project_estimate_id = project_estimate_id;
        create_WO_Obj.WO_TYPE = "External Contractor";
        localStorage.setItem("CREATE_WO", JSON.stringify(create_WO_Obj));
        this.router.navigate(["/workflow/wo/csa/wo-setup"]);
      } else {
        this.isError = true;
        this.errMsg = "Please select Valid quotation from the list to proceed.";
      }
    } catch (err) {
      this.global.addException("PE", "goToWoSetup()", err);
    }
  }
  downloadPDF(dataDownload) {
    window.open(dataDownload);
  }
  preview(dataPreview) {
    window.open(dataPreview);
  }
  addRemark() {
    this.remarkDiv = "show";
  }
  saveRemark(formRremark) {
    let self = this;
    // alert(formRremark);
    this.loggedInUser = JSON.parse(atob(localStorage.getItem("USER")));
    console.log(this.loggedInUser);
    let userName = this.loggedInUser.first_name;

    let formattedDate = this.getFormattedDate();
    // alert(formattedDate);
    let remarkString = `${formRremark} - by ${userName} on ${formattedDate}`;

    console.log("remark string = ", remarkString);
    try {
      let reqObj: any = {};
      if (self.selectedQuotation.remarks && self.selectedQuotation.remarks.length > 0) {
        for (let item of self.selectedQuotation.remarks) {
          this.remarksArr.push({ remarks: item.remarks });
        }
      } else{
        console.log('self.selectedQuotation.remarks  does not have any value');
      }
      this.remarksArr.push({ remarks: remarkString });

      reqObj.remarks = this.remarksArr;
      reqObj.project_estimate_id = this.selectedQuotation.project_estimate_id;
      self.isError = false;
      self.errMsg = "";
      self.util.addSpinner("save_remark_btn", "Save");
      console.log("reqObj", reqObj);
      this.util.showProcessing('processing-spinner');

      this.http.doPost("project-estimate/remark", reqObj, function(
        error: boolean,
        response: any
      ) {
        self.util.hideProcessing('processing-spinner');
        self.util.removeSpinner("save_remark_btn", "Save");
        self.submittedPay = false;
        if (error) {
          console.log("error", response);
          self.isError = true;
          self.errMsg = response.message;
        } else {
          console.log("response = ", response.message);

          // self.util.showDialog(DialogComponent, response.message, ['/workflow/quote/csa/quotation-list/'+self.selectedQuotation.project_estimate_id]);
          self.util.showDialog(DialogComponent, response.message, ['/workflow/quote/csa/quotation-list/0']);
            self.util.changeEvent({
              source: "REMARK_CREATE",
              action: "ADD_REMARK",
              data: {
                project_estimate_id: self.selectedQuotation.project_estimate_id
              }
            });
            self.peRemark = "";
            self.remarksArr = [];
          self.remarkDiv = "hide";
        }
      });
    } catch (error) {
      console.log(error);
    }
  }
  getFormattedDate() {
    let currentDate = new Date();
    let date = currentDate.getDate();
    let month = currentDate.getMonth();
    let year = currentDate.getFullYear();
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December"
    ];
    let formattedDate = [date, monthNames[month], year].join(" ");
    return formattedDate;
  }
  cancelRemark() {
    this.remarkDiv = 'hide';
    this.peRemark = "";
  }
}
