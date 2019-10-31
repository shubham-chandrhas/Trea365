import { Component, OnInit } from "@angular/core";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";
import {
  FormControl,
  FormGroupDirective,
  NgForm,
  Validators,
  FormGroup,
  FormBuilder,
  FormArray
} from "@angular/forms";
import { Router, ActivatedRoute } from "@angular/router";
import { Location } from "@angular/common";
import { DialogComponent } from "../../../../shared/model/dialog/dialog.component";

import * as _ from "underscore";

import { UtilService } from "../../../../shared/service/util.service";
import { HttpService } from "../../../../shared/service/http.service";
import { ConstantsService } from "../../../../shared/service/constants.service";
import { GlobalService } from "../../../../shared/service/global.service";

declare var $: any;
@Component({
  selector: "app-audit-list",
  templateUrl: "./audit-list.component.html",
  styleUrls: ["./audit-list.component.css"]
})
export class AuditListComponent implements OnInit {
  public auditLocationList: any = [];
  public sortColumn: string = "audit_id";
  public sortColumnType: string = "N";
  public sortOrder: string = "DSC";
  public searchList: string;
  public searchTxt: string;
  public auditNoSearch;
  public statusSearch;
  public dateSearch;
  public auditorSearch;
  public paginationKey: any;
  public listCount: number = 0;

  public listPaginationKey: any;
  public itemListCount: number = 0;
  public ITEM_COUNT: number = 0;

  public assetSearchTxt: string;
  public assetSearchList: string;
  public assetSortColumn: string = "prod_loc_id";
  public assetSortColumnType: string = "N";
  public assetSortOrder: string = "DSC";
  public mfgSearch;
  public mfgPartSearch;
  public scanCodeSearch;
  public upcSearch;

  public selectedAudit: any = null;
  public selectedIndex;
  public auditListTab: string = "audit";

  public auditList: any = [];
  public auditReport: any = [];
  public auditReportLocationList: any = [];
  public selectedReportAudit: any = null;
  public submitted: boolean = false;
  permissionsSet: any;
  auditForm: FormGroup;
  public errMsg: string = "";
  public isError: boolean = false;

  public onBoarding:boolean = false; 

  constructor(
    private fb: FormBuilder,
    public dialog: MatDialog,
    public util: UtilService,
    public constant: ConstantsService,
    public http: HttpService,
    public router: Router,
    private route: ActivatedRoute,
    private location: Location,
    private global: GlobalService
  ) {}

  ngOnInit() {
    this.util.menuChange({ menu: 3, subMenu: 24 });
    this.util.setWindowHeight();
    this.util.setPageTitle(this.route);
    window.scrollTo(0, 0);
    this.paginationKey = {
      id: "AuditList",
      itemsPerPage: this.constant.ITEMS_PER_PAGE,
      currentPage: this.constant.CURRENT_PAGE
    };
    this.listPaginationKey = {
      id: "AuditItemList",
      itemsPerPage: this.constant.ITEMS_PER_PAGE,
      currentPage: this.constant.CURRENT_PAGE
    };
    this.getAuditList();
    
    this.createForm("0");

    this.permissionsSet = this.util.getModulePermission(100);
    let self = this;
    this.util.changeDetection.subscribe(dataObj => {
      if (dataObj && dataObj.source == "AUDIT_REPORT_CONFIRM") {
        self.getAuditList("confirm");
        self.getAuditReportsList("confirm");
        self.selectedReportAudit = null;
        self.selectedAudit = null;
        // this.router.navigate(["inventory/audit/csa/audit-list/0"]);
        self.router.navigate(["/inventory/audit/csa/audit-list/0"]);
      }
    });
  }
  updateCount(count) {
    this.constant.ITEM_COUNT = count;
    this.listCount = count;
  }
  getSearchTxt(filterValue: string) {
    if (filterValue == "") {
      this.searchTxt = "";
    }
  }
  getAssetSearchTxt(filterValue: string) {
    if (filterValue == "") {
      this.assetSearchTxt = "";
    }
  }
  changePage(event) {
    this.paginationKey.currentPage = event;
    window.scrollTo(0, 0);
  }
  changeItemPerPage() {
    window.scrollTo(0, 0);
  }

  //For Product List
  //itemListChangePage(event){this.listPaginationKey.currentPage = event;}
  itemListUpdateCount(count) {
    this.ITEM_COUNT = count;
    this.itemListCount = count;
  }

  getAuditList(confirm_data: any = "") {
    try {
      let self = this;
      this.util.showProcessing("processing-spinner");
      this.http.doGet("getAudits", function(error: boolean, response: any) {
        self.util.hideProcessing("processing-spinner");
        if (error) {
        } else {
          if (response.data) {
            self.auditList = response.data;
            for (let i = 0; i < response.data.length; i++) {
              self.auditList[i].audit_no = response.data[i].audit_no;
              self.auditList[i].status = response.data[i].status_info.status;

              // Check For Null Value
              response.data[i].auditors[0].auditor_details[0].last_name =
                response.data[i].auditors[0].auditor_details[0].last_name !==
                null
                  ? response.data[i].auditors[0].auditor_details[0].last_name
                  : "";

              self.auditList[i].auditor = response.data[i].auditors[0]
                .auditor_details[0]
                ? response.data[i].auditors[0].auditor_details[0].first_name
                  ? response.data[i].auditors[0].auditor_details[0].first_name +
                    " " +
                    response.data[i].auditors[0].auditor_details[0].last_name
                  : ""
                : "";
              (self.auditList[i].audit_date = new Date(
                response.data[i].created_at
              ).getTime()),
                (self.auditList[i].created_at = self.util.getFormatedDate(
                  response.data[i].created_at
                ));
            }
            self.route.snapshot.paramMap.get("id") != "0" && confirm_data == ""
              ? self.showAuditDetails()
              : "";
            console.log("Audit List", self.auditList);
          }
        }

        self.getAuditReportsList();
      });
    } catch (err) {
      this.global.addException("Audit list", "getAuditList()", err);
    }
  }

  getAuditReportsList(confirm_data: any = "") {
    try {
      let self = this;
      this.util.showProcessing("processing-spinner");
      this.http.doGet("getAuditReports", function(
        error: boolean,
        response: any
      ) {
        self.util.hideProcessing("processing-spinner");
        if (error) {
        } else {
          if (response.data) {
            self.auditReport = response.data;
            for (let i = 0; i < self.auditReport.length; i++) {
              self.auditReport[i].closed_date = self.auditReport[i].closed_date
                ? self.util.getFormatedDate(self.auditReport[i].closed_date)
                : "";
              self.auditReport[i].audit_no = self.auditReport[i].audit_no;
              self.auditReport[i].auditor =
                self.auditReport[i].auditors[0].auditor_details[0].first_name +
                " " +
                self.auditReport[i].auditors[0].auditor_details[0].last_name;
              self.auditReport[i].location =
                self.auditReport[i].audit_location_tag_detail.location_tag;
            }

            self.route.snapshot.paramMap.get("id") != "0" && confirm_data == ""
              ? self.showAuditReportDetails()
              : "";
            console.log("Audit Report", self.auditReport);
          }
        }

        if(self.auditList.length == 0 && self.auditReport.length == 0) {
            self.onBoarding = true;
          }
      });
    } catch (err) {
      this.global.addException("Audit list", "getAuditReportsList()", err);
    }
  }

  changeAuditList(auditList) {
    try {
      this.auditListTab = auditList;
    } catch (err) {
      this.global.addException("Audit list", "changeAuditList()", err);
    }
  }

  showAuditDetails() {
    try {
      let sortedList: any[] = _.sortBy(this.auditList, "audit_id").reverse();
      for (var i = 0; i < sortedList.length; ++i) {
        if (this.route.snapshot.paramMap.get("id") == sortedList[i].audit_id) {
          this.selectAudit(sortedList[i], i);
          this.selectedIndex = i;
          break;
        }
      }
    } catch (err) {
      this.global.addException("Audit list", "showAuditDetails()", err);
    }
  }

  showAuditReportDetails() {
    try {
      let sortedList: any[] = _.sortBy(this.auditList, "audit_id").reverse();
      for (var i = 0; i < sortedList.length; ++i) {
        if (this.route.snapshot.paramMap.get("id") == sortedList[i].audit_id) {
          this.selectAuditReport(sortedList[i], i);
          this.selectedIndex = i;
          break;
        }
      }
    } catch (err) {
      this.global.addException("Audit list", "showAuditDetails()", err);
    }
  }

  selectAudit(selItem: any, index: number) {
    try {
      this.selectedAudit = selItem;
      this.selectedIndex = index;
      console.log("selectedAudit = ", this.selectedAudit);
      let self = this;
      this.util.showProcessing("processing-spinner");
      this.http.doGet(
        "getAuditedDetails/" + this.selectedAudit.audit_id,
        function(error: boolean, response: any) {
          self.util.hideProcessing("processing-spinner");
          if (error) {
          } else {
            //console.log("MFG List",response.data);
            self.auditLocationList = [];
            if (response.data) {
              self.auditLocationList = [
                ...response.data.assets,
                ...response.data.products,
                ...response.data.materials
              ];
            }
            for (let i = 0; i < self.auditLocationList.length; i++) {
              self.auditLocationList[i].scan_code = self.auditLocationList[i]
                .scan_code
                ? self.auditLocationList[i].scan_code.toString()
                : "";
              self.auditLocationList[i].upc = self.auditLocationList[i].upc
                ? self.auditLocationList[i].upc.toString()
                : "";
            }
            console.log("MFG List", self.auditLocationList);
            self.location.go(
              self.location
                .path()
                .split("/")
                .splice(0, self.location.path().split("/").length - 1)
                .join("/") +
                "/" +
                self.selectedAudit.audit_id
            );
            setTimeout(function() {
              self.util.scrollDown("auditMark");
            }, 1000);
          }
        }
      );
      this.listPaginationKey = {
        id: "AuditItemList",
        itemsPerPage: this.constant.ITEMS_PER_PAGE,
        currentPage: this.constant.CURRENT_PAGE
      };
    } catch (err) {
      this.global.addException("Audit list", "selectAudit()", err);
    }
  }

  createForm(option, val: any = {}) {
    try {
      this.auditForm = this.fb.group({
        comment: new FormControl(""),
        audit_id: new FormControl(option == "0" ? "" : val.audit_id),
        location_id: new FormControl(option == "0" ? "" : val.location_id),
        audited_items: this.fb.array([])
      });
    } catch (err) {
      this.global.addException("Create Account", "createForm()", err);
    }
  }

  get comment() {
    return this.auditForm.get("comment");
  }
  get audited_items(): FormArray {
    return (<FormArray>this.auditForm.get("audited_items")) as FormArray;
  }

  addItem(option, val: any = {}) {
    try {
      this.audited_items.push(
        this.fb.group({
          location_tag: new FormControl(
            option == "0"
              ? ""
              : val.location_tag.location_tag
              ? val.location_tag.location_tag
              : ""
          ),
          manf_name: new FormControl(option == "0" ? "" : val.manf_name),
          manf_part_name: new FormControl(
            option == "0" ? "" : val.manf_part_name
          ),
          audit_item_id: new FormControl(
            option == "0" ? "" : val.audit_item_id
          ),
          location_tag_id: new FormControl(
            option == "0" ? "" : val.location_tag_id
          ),
          item_id: new FormControl(option == "0" ? "" : val.item_id),
          item_type: new FormControl(option == "0" ? "" : val.item_type),
          is_unlisted: new FormControl(option == "0" ? "" : val.is_unlisted),
          audited_quantity: new FormControl(
            option == "0" ? "" : val.audited_quantity
          ),
          listed_quantity: new FormControl(
            option == "0" ? "" : val.listed_quantity
          ),
          discrepancies: new FormControl(
            option == "0" ? "" : val.discrepancies
          ),
          accept_quantity: new FormControl(
            option == "0" ? "" : val.audited_quantity,
            [Validators.min(0)]
          )
        })
      );
    } catch (err) {
      this.global.addException("Accept Discrepancies", "addItem()", err);
    }
  }

  selectAuditReport(selItem: any, index: number) {
    try {
      this.selectedReportAudit = selItem;
      this.selectedIndex = index;
      console.log("selectedReportAudit = ", this.selectedReportAudit);
      let self = this;
      this.util.showProcessing("processing-spinner");
      this.http.doGet(
        "getAuditReportById/" + this.selectedReportAudit.audit_id,
        function(error: boolean, response: any) {
          self.util.hideProcessing("processing-spinner");
          if (error) {
          } else {
            //console.log("MFG List",response.data);
            self.auditReportLocationList = response.data;
            console.log(response.data);
            self.createForm("1", self.auditReportLocationList);
            for (
              let i = 0;
              i < self.auditReportLocationList.audit_items.length;
              i++
            ) {
              self.addItem("1", self.auditReportLocationList.audit_items[i]);
            }
            self.location.go(
              "/inventory/audit/csa/audit-list/" +
                self.selectedReportAudit.audit_id
            );
            setTimeout(function() {
              self.util.scrollDown("auditMark");
              //self.pageData.prodDetails = 'location';
            }, 1000);
          }
        }
      );
    } catch (err) {
      this.global.addException("Audit Report list", "selectAuditReport()", err);
    }
  }

  accept(form: FormGroup) {
    try {
      this.submitted = true;
      var self = this;
      if (form.valid) {
        let data: any = {
          API_URL: "acceptAuditDiscrepancies",
          reqObj: form.value,
          event: {
            source: "AUDIT_REPORT_CONFIRM",
            action: "CONFIRM"
          }
        };
        this.util.showDialog(
          DialogComponent,
          "Are you sure you want to update these quantities in your inventory? This action cannot be reversed. ",
          [],
          "Accept Discrepancies ?",
          "AUDIT-CONFIRMATION",
          data
        );
        // self.util.addSpinner("accept-audit-btn", "Accept Discrepancies");
        // this.http.doPost("acceptAuditDiscrepancies", form.value, function(
        //   error: boolean,
        //   response: any
        // ) {
        //   self.util.removeSpinner("accept-audit-btn", "Accept Discrepancies");
        //   if (error) {
        //     self.errMsg = response.message;
        //     self.isError = true;
        //   } else {
        //     self.getAuditReportsList();
        //     self.selectedReportAudit = null;
        //     self.util.showDialog(DialogComponent, response.message, []);
        //   }
        // });
      }
    } catch (err) {
      this.global.addException("Accept Discrepancies", "accept()", err);
    }
  }
}
