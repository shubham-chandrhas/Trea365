import { Component, OnInit, Inject } from "@angular/core";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";
import { Router, ActivatedRoute } from "@angular/router";
import { FormControl } from "@angular/forms";
import { Location } from "@angular/common";

import { BehaviorSubject } from "rxjs/BehaviorSubject";

import { Observable, Subscription } from 'rxjs';
import { startWith } from "rxjs/operators/startWith";
import { map } from "rxjs/operators/map";


import { UtilService } from "../../../../shared/service/util.service";
import { HttpService } from "../../../../shared/service/http.service";
import { GlobalService } from "../../../../shared/service/global.service";
import { AppConfig, APP_CONFIG } from "../../../../app-config.module";
import { OnboardingGuideDialogComponent } from "../../../onboarding/onboarding-guide/onboarding-guide.component";
import { NewClientDialog } from "../client-dialog.component";
import { ConstantsService } from "../../../../shared/service/constants.service";
import * as _ from "underscore";
import { AdminService } from "../../../admin/admin.service";
import { NewCrmService } from "../../crm-service";


@Component({
  selector: "app-client-list",
  templateUrl: "./client-list.component.html",
  styleUrls: ["./client-list.component.css"]
})
export class NewClientListComponent implements OnInit {
  pageData: any = {
    clientList: [],
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

  public clientDetails: string = "details";
  public selectedClient: any = null;
  public isEdit: boolean = false;

  public sortColumn: string = "client_id";
  public sortColumnType: string = "N";
  public sortOrder: string = "DSC";
  public paginationKey: any;
  public listCount: number = 0;
  public selectedIndex;
  public searchTxt;
  public searchList;
  typeSearch;
  addressSerach;
  emailIdSearch;
  phoneSearch;
  extraSearch;
  public clientID: number = 0;
  subscription: Subscription;

  public onBoarding:boolean = false;

  public fields: any = [];
  public referralTypeList: any = [];
  permissionsSet: any;
  dataClientDetails: any = [];
  extraFields: any = [];
  constructor(
    @Inject(APP_CONFIG)
    private config: AppConfig,
    public dialog: MatDialog,
    public util: UtilService,
    private admin: AdminService,
    public constant: ConstantsService,
    public crm: NewCrmService,
    private http: HttpService,
    public router: Router,
    private route: ActivatedRoute,
    private global: GlobalService,
    private location: Location
  ) {
  }

  ngOnInit() {
    let self = this;
    this.permissionsSet = this.util.getModulePermission(122);
    console.log(this.permissionsSet);
    this.util.showProcessing("processing-spinner");
    this.util.setWindowHeight();
    this.util.setPageTitle(this.route);
    if (this.router.url.split("/")[2] == "csa-onboarding") {
      this.util.menuChange({ menu: "guide", subMenu: "" }); //for onboarding dashboard
    } else {
      this.util.menuChange({ menu: 5, subMenu: 5 });
    }
    this.paginationKey = {
      itemsPerPage: this.constant.ITEMS_PER_PAGE,
      currentPage: this.constant.CURRENT_PAGE
    };
    this.getClientFields();
    this.getClientList();

    // this.admin.newRecord.subscribe(client => {
    //   if (client) {
    //     self.getClientList("REFRESH");
    //     this.getClientFields();
    //   }
    // });

    // this.admin.deletedRecord.subscribe(recordId => {
    //   if (self.pageData.clientList && recordId) {
    //     self.getClientList();
    //     self.selectedClient = null;
    //     self.selectedIndex = null;
    //     self.searchTxt = self.searchList = "";
    //   }
    // });

    this.subscription =  this.util.changeDetection.subscribe(dataObj => {
      console.log(dataObj);
      if (dataObj && dataObj.source == "DELETE_CLIENT") {
        self.pageData.clientList = [];
        self.getClientList();
        self.selectedClient = null;
        self.isEdit = false;
        self.crm.isEditFromList = false;
        self.selectedIndex = null;
      }
      else if(dataObj && dataObj.source == "UPDATE_CLIENT")
      {
        self.pageData.clientList = [];
        self.getClientList("REFRESH");
      }
      else if(dataObj && dataObj.source == "ADD_FIELDS")
      {
        self.getClientFields();
        self.getClientList();
      }
    });

  }
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
  addFromCSV() {
    let route: string,
      apiEndPoint: string,
      csvTemplateUrl: string,
      redirectUrl: string;
    route = "/csa-onboarding/csv-preview/client";
    apiEndPoint = "clients/csv";
    csvTemplateUrl = this.config.domainIP + "api/download/csv/client.csv";
    redirectUrl = "/crm/csa/client-list/0";
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


  /** for sorting **/
  sortList(columnName: string, sortType) {
    this.sortColumn = columnName;
    this.sortColumnType = sortType;
    if (this.sortColumn === columnName) {
      if (this.sortOrder === "ASC") this.sortOrder = "DSC";
      else this.sortOrder = "ASC";
    } else {
      this.sortOrder = "ASC";
    }
  }
  /** end for sorting **/

  getClientFields() {
    try {
      let self = this;
      this.http.doGet("extrafields?type=client", function(
        error: boolean,
        response: any
      ) {
        //self.util.hideProcessing("processing-spinner");
        if (error) {
        } else {
          self.fields = response.data.additional_client_fields
            ? response.data.additional_client_fields
            : [];
        }
      });
    } catch (err) {
      this.global.addException("Client List", "getClientFields()", err);
    }
  }

  addFields() {
    this.dialog.open(OnboardingGuideDialogComponent, {
      data: {
        action: "addFields",
        fields: JSON.parse(JSON.stringify(this.fields)),
        fieldType: "client",
        msgHeader: "New Client"
      },
      autoFocus: false
    });
  }

  getSearchTxt(filterValue: string) {
    if (filterValue == "") {
      this.searchTxt = "";
    }
  }

  getClientList(option: any = "INIT") {
    var self = this;
    try {
      this.util.showProcessing("processing-spinner");
      this.http.doGet("client", function(error: boolean, response: any) {
        self.util.hideProcessing("processing-spinner");
        if (error) {
          console.log("error", response);
        } else {
          // self.dataClientDetails;
          for (let i = 0; i < response.data.length; i++) {
            let empObj: any = response.data[i];
            empObj.client_id = response.data[i].client_id
              ? response.data[i].client_id
              : "-";
            empObj.client_name = response.data[i].client_name
              ? response.data[i].client_name
              : "-";
            empObj.address = response.data[i].address
              ? response.data[i].address
              : "-";
            empObj.email_id = response.data[i].email_id
              ? response.data[i].email_id
              : "-";
            empObj.phone_no = response.data[i].phone_no
              ? response.data[i].phone_no
              : "-";
            empObj.extra_fields = response.data[i].extra_fields
              ? response.data[i].extra_fields
              : [];
            let fieldCount: number = 1;
            empObj.extra_fields.map(function(field) {
              empObj["label" + fieldCount] = field.data
                ? self.getAdditionalFieldData(field.dataType, field.data)
                : "";
              // self.searchKeywords += ",label" + fieldCount;
              fieldCount++;
            });
            // self.dataClientDetails.push(empObj);
            self.pageData.clientList.push(empObj);

          }
          console.log('dataaaa==',  self.dataClientDetails);
          self.route.snapshot.paramMap.get("id") != "0" || option == 'REFRESH'
            ? self.showClientDetails()
            : "";
        }
        if(self.pageData.clientList.length == 0) {
            self.onBoarding = true;
          }
      });
    } catch (err) {
      this.global.addException("Client List", "getClientList()", err);
    }
  }

  showClientDetails() {
    try {
      let sortedList: any[] = _.sortBy(this.pageData.clientList, "client_id").reverse();
      for (var i = 0; i < sortedList.length; ++i) {
        if (this.route.snapshot.paramMap.get("id") == sortedList[i].client_id) {
          this.getSelectedClient(sortedList[i], i);
          this.selectedIndex = i;
          this.isEdit = false;
          this.crm.isEditFromList = false;
          break;
        }
      }
    } catch (err) {
      this.global.addException("Invoice List", "showInvoiceDetails()", err);
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
  getSelectedClient(selClientObj: any, index: number) {
    this.selectedClient  = null;
    this.clientDetails =  'details';
    let self = this;
    console.log(selClientObj);
    //this.selectedClient = selClientObj;
    self.isEdit = false;
    self.crm.isEditFromList = false;
    self.selectedIndex = index;
    self.clientID = selClientObj.client_id;
    try {
      self.util.showProcessing("processing-spinner");
      this.http.doGet(
        "client/" + selClientObj.client_id + "/details",
        function(error: boolean, response: any) {
          self.util.hideProcessing("processing-spinner");
          if (error) {
            console.log("error", response);
          } else {
            self.selectedClient = response.data;
            self.location.go("/new-crm/csa/client-list/" + selClientObj.client_id);
              setTimeout(function() {
                self.util.scrollDown("clientMark");
              }, 1000);
          }
        });
      } catch (err) {
        this.global.addException(
          "Client details List",
          "getSelectedClient()",
          err
        );
      }
  }

  showDetails(detailOption) {
    let self = this;
    try {
      self.util.showProcessing("processing-spinner");
      self.selectedClient  = null;
      self.clientDetails = detailOption;
      this.http.doGet(
        "client/" + self.clientID + "/" + detailOption,
        function(error: boolean, response: any) {
          self.util.hideProcessing("processing-spinner");
          if (error) {
            console.log("error", response);
          } else {
            self.selectedClient = response.data;
            self.location.go("/new-crm/csa/client-list/" + self.clientID);
              setTimeout(function() {
                self.util.scrollDown("clientMark");
              }, 1000);
          }
        });
      } catch (err) {
        this.global.addException(
          "Client tabs details List",
          "showDetails()",
          err
        );
      }
  }

  showQuotationListPopup(selClientObj: any) {
    this.dialog.open(NewClientDialog, { data: { action: "quotationList", client_id : selClientObj.client_id } });
  }

  showQuotationListForInvoice(selClientObj: any) {
    this.util.changeEvent({
      source: "QuotationListForInvoice",
      action: "LIST_INVOICE",
      data: {
        client_id: selClientObj.client_id
      }
    });
    this.router.navigate(["/account/csa/new-invoice"]);
  }

  showInvoiceForPayment(selClientObj: any) {
    this.util.changeEvent({
      source: "InvoiceForPayment",
      action: "INVOICE_PAYMENT",
      data: {
        client_id: selClientObj.client_id
      }
    });
    this.router.navigate(["/account/csa/invoice-list/0"]);
  }

  deleteDailog() {
    this.dialog.open(NewClientDialog, {
      data: {
        action: "deleteRecord",
        clientId: this.selectedClient.client_id,
        successMsg: this.selectedClient.client_name
      },
      autoFocus: false
    });
  }

  addNew() {
    this.isEdit = false;
    this.crm.isEditFromList = false;
    sessionStorage.removeItem("client");
    if (this.router.url.split("/")[2] == "csa-onboarding") {
      this.router.navigate(["/new-crm/csa-onboarding/add-client"]);
    } else {
      this.router.navigate(["/new-crm/csa/add-client"]);
    }
  }

  editClient() {
    this.isEdit = true;
    this.crm.isEditFromList = true;
    try {
      this.selectedClient.additional_fields = this.selectedClient.extra_fields;
      sessionStorage.setItem("client", JSON.stringify(this.selectedClient));
      let self = this;
      setTimeout(function() {
        self.util.scrollDown("clientMark");
      }, 1000);
    } catch (err) {
      this.global.addException("Client List", "editClient()", err);
    }
  }
}
