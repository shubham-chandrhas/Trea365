import { Component, OnInit, Inject } from "@angular/core";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";
import { Router, ActivatedRoute } from "@angular/router";
import { FormControl } from "@angular/forms";
import { Location } from "@angular/common";

import { BehaviorSubject } from "rxjs/BehaviorSubject";

import { Observable } from "rxjs/Observable";
import { startWith } from "rxjs/operators/startWith";
import { map } from "rxjs/operators/map";

import { UtilService } from "../../../../shared/service/util.service";
import { HttpService } from "../../../../shared/service/http.service";
import { GlobalService } from "../../../../shared/service/global.service";
import { AppConfig, APP_CONFIG } from "../../../../app-config.module";
import { OnboardingGuideDialogComponent } from "../../../onboarding/onboarding-guide/onboarding-guide.component";
import { ClientDialog } from "../client-dialog.component";
import { ConstantsService } from "../../../../shared/service/constants.service";
import { AdminService } from "../../../admin/admin.service";
import { CrmService } from "../../crm-service";
import * as _ from "underscore";

export class Name {
  constructor(public name: string) {}
}

@Component({
  selector: "app-client-list",
  templateUrl: "./client-list.component.html",
  styleUrls: ["./client-list.component.css"]
})
export class ClientListComponent implements OnInit {
  public clientList: any = [];
  public contactList: any = [];
  public addressList: any[] = [];
  public clientListTab: string = "client";
  public clientDetails: string = "details";
  public selectedClient: any = null;
  public selectedContact: any = null;
  public selectedAddress: any = null;
  public isEdit: boolean = false;

  public sortColumnDoc: string = "invoice_no";
  public sortColumnTypeDoc: string = "N";
  public sortOrderDoc: string = "DSC";
  public searchTxtDoc;
  public searchListDoc;

  public sortColumn: string = "client_id";
  public sortColumnType: string = "N";
  public sortOrder: string = "DSC";
  public paginationKey: any;
  public listCount: number = 0;
  public selectedIndex;
  public searchTxt;
  public searchList;

  nameSearch;
  public fields: any = [];
  public referralTypeList: any = [];
  public sortColumnWo: string = "work_order_no";
  public sortColumnTypeWo: string = "N";
  public sortOrderWo: string = "DSC";
  permissionsSet: any;

  constructor(
    @Inject(APP_CONFIG)
    private config: AppConfig,
    public dialog: MatDialog,
    public util: UtilService,
    private admin: AdminService,
    public constant: ConstantsService,
    public crm: CrmService,
    private http: HttpService,
    public router: Router,
    private route: ActivatedRoute,
    private global: GlobalService,
    private location: Location
  ) {}

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
    this.getClientList();
    this.getClientAddressList();
    this.getClientContactList();
    this.getReferralTypeList();
    this.getClientFields();
    this.admin.newRecord.subscribe(client => {
      if (client) {
        self.getClientList("REFRESH");
        this.getClientFields();
      }
    });

    this.admin.deletedRecord.subscribe(recordId => {
      if (self.clientList && recordId) {
        self.getClientList();
        self.selectedClient = null;
        self.selectedIndex = null;
        self.searchTxt = self.searchList = "";
      }
    });

    this.util.changeDetection.subscribe(dataObj => {
      if (dataObj && dataObj.source == "CLIENT_CONTACT") {
        this.getClientContactList();
        this.selectedContact = null;
        this.isEdit = false;
        this.crm.isEditFromList = false;
        this.selectedIndex = null;
      }
      if (dataObj && dataObj.source == "CLIENT_ADDRESS") {
        this.getClientAddressList();
        this.selectedAddress = null;
        this.isEdit = false;
        this.crm.isEditFromList = false;
        this.selectedIndex = null;
      }
    });
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
  receiveMessage($event) {
    if ($event == "UPDATE_CONTACT") this.getClientContactList();

    if ($event == "UPDATE_ADDRESS") this.getClientAddressList();
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
  getSearchTxt(filterValue: string) {
    if (filterValue == "") {
      this.searchTxt = "";
    }
  }
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
  getSearchTxtDoc(filterValue: string) {
    if (filterValue == "") {
      this.searchTxtDoc = "";
    }
  }
  sortListDoc(columnName: string, sortType) {
    this.sortColumnDoc = columnName;
    this.sortColumnTypeDoc = sortType;
    if (this.sortColumnDoc === columnName) {
      if (this.sortOrderDoc === "ASC") this.sortOrderDoc = "DSC";
      else this.sortOrderDoc = "ASC";
    } else {
      this.sortOrderDoc = "ASC";
    }
  }

  sortListWo(columnName: string, sortType) {
    this.sortColumnWo = columnName;
    this.sortColumnTypeWo = sortType;
    if (this.sortColumnWo === columnName) {
      if (this.sortOrderWo === "ASC") this.sortOrderWo = "DSC";
      else this.sortOrderWo = "ASC";
    } else {
      this.sortOrderWo = "ASC";
    }
  }
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

  getClientList(origin: string = "INIT") {
    var self = this;
    try {
      this.util.showProcessing("processing-spinner");
      //this.http.doGet("clients", function(error: boolean, response: any) {
      this.http.doGet("getClientsList", function(
        error: boolean,
        response: any
      ) {
        self.util.hideProcessing("processing-spinner");
        if (error) {
          console.log("error", response);
        } else {
          self.clientList = [];
          for (let i = 0; i < response.data.length; i++) {
            let clientObj: any = {};
            clientObj = response.data[i];
            // clientObj.work_orders = response.data[i].work_orders;
            // for (let index = 0; index < clientObj.work_orders.length; index++) {
            //   clientObj.work_orders[index].wo_status =
            //     clientObj.work_orders[index].wo_status.status;
            // }
            // clientObj.invoices = response.data[i].invoices.concat(
            //   response.data[i].quotations
            // );
            // for (let index = 0; index < clientObj.invoices.length; index++) {
            //   clientObj.invoices[index].doc_type =
            //     clientObj.invoices[index].invoice_id != undefined
            //       ? "Invoice"
            //       : "Quote";
            // }
            // clientObj.additional_fields = response.data[i].additional_fields;
            // clientObj.address = response.data[i].address;
            // clientObj.contacts = response.data[i].contacts;

            // clientObj.client_address =
            //   clientObj.address.length > 0
            //     ? clientObj.address[0].address_line_1 +
            //       ", " +
            //       (clientObj.address[0].address_line_2
            //         ? clientObj.address[0].address_line_2 + ", "
            //         : "") +
            //       clientObj.address[0].city_name +
            //       ", " +
            //       clientObj.address[0].province_name +
            //       ", " +
            //       clientObj.address[0].country_name
            //     : "";
            if (!clientObj.company_name) {
              clientObj.client_name =
                clientObj.first_name + " " + clientObj.last_name;
              clientObj.company_name = "";
              clientObj.name = clientObj.first_name + " " + clientObj.last_name;
            } else {
              clientObj.client_name = clientObj.company_name;
              clientObj.name = clientObj.company_name;
            }
            clientObj.legal_name = clientObj.legal_name
              ? clientObj.legal_name
              : "";
            // for (let i = 0; i < clientObj.address.length; i++) {
            //   clientObj.address[i].address_type = JSON.parse(
            //     clientObj.address[i].address_type
            //   );
            // }
            // for (let i = 0; i < clientObj.contacts.length; i++) {
            //   clientObj.contacts[i].address = JSON.parse(
            //     clientObj.contacts[i].address
            //   );
            //   clientObj.contacts[i].contact_address =
            //     clientObj.contacts[i].address;
            //   clientObj.contacts[i].client_name = clientObj.client_name;
            //   clientObj.contacts[i].phone_no = self.util.maskPhoneNumber(
            //     clientObj.contacts[i].phone_no
            //   );
            // }
            self.clientList.push(clientObj);
            //console.log("self.clientList", self.clientList);
          }
          self.route.snapshot.paramMap.get("id") != "0" || origin == "REFRESH"
            ? self.showClientDetails(origin)
            : "";
        }
      });
    } catch (err) {
      this.global.addException("Client List", "getClientList()", err);
    }
  }

  showClientDetails(origin): void {
    let sortedList: any[] = _.sortBy(this.clientList, "client_id").reverse();
    for (var i = 0; i < sortedList.length; ++i) {
      let clientId =
        origin == "REFRESH"
          ? this.crm.updateClientId
          : this.route.snapshot.paramMap.get("id");
      clientId == sortedList[i].client_id
        ? (this.getSelectedClient(sortedList[i], i), (this.selectedIndex = i))
        : "";
    }
  }

  getClientAddressList() {
    var self = this;
    try {
      this.http.doGet("getClientAddress", function(
        error: boolean,
        response: any
      ) {
        if (error) {
          console.log("error", response);
        } else {
          self.addressList = response.data ? response.data : [];
          for (let i = 0; i < self.addressList.length; i++) {
            self.addressList[i].client_address =
              self.addressList[i].address_line_1 +
              " " +
              (self.addressList[i].address_line_2
                ? self.addressList[i].address_line_2
                : "");
            self.addressList[i].address_line_2 = self.addressList[i]
              .address_line_2
              ? self.addressList[i].address_line_2
              : "";
            self.addressList[i].address_type =
              typeof JSON.parse(self.addressList[i].address_type) == "string"
                ? JSON.parse(JSON.parse(self.addressList[i].address_type))
                : JSON.parse(self.addressList[i].address_type);
            console.log("type", typeof self.addressList[i].address_type);
            self.addressList[i].client_name = self.addressList[i].client_detail
              ? self.addressList[i].client_detail.client_type == "Company"
                ? self.addressList[i].client_detail.company_name
                : self.addressList[i].client_detail.first_name +
                  " " +
                  self.addressList[i].client_detail.last_name
              : "";
            self.addressList[i].city_name = self.addressList[i].city_details
              ? self.addressList[i].city_details.city_name
              : "";
            for (
              let j = 0;
              j < self.addressList[i].client_contact_address.length;
              j++
            ) {
              self.addressList[i].client_contact_address[j].address_contact
                ? (self.addressList[i].client_contact_address[
                    j
                  ].address_contact.address = self.addressList[i]
                    .client_contact_address[j].address_contact.address
                    ? JSON.parse(
                        self.addressList[i].client_contact_address[j]
                          .address_contact.address
                      )
                    : "")
                : "";
            }
          }
          console.log("getClientAddressList", self.addressList);
        }
      });
    } catch (err) {
      this.global.addException("Client List", "getClientAddressList()", err);
    }
  }
  getClientContactList() {
    var self = this;
    try {
      this.http.doGet("getClientContacts", function(
        error: boolean,
        response: any
      ) {
        if (error) {
          console.log("error", response);
        } else {
          self.contactList = response.data ? response.data : [];
          for (let i = 0; i < self.contactList.length; i++) {
            self.contactList[i].contact_type = self.contactList[i].contact_type
              ? self.contactList[i].contact_type
              : "";
            self.contactList[i].client_name = self.contactList[i].client_detail
              ? self.contactList[i].client_detail.client_type == "Company"
                ? self.contactList[i].client_detail.company_name
                : self.contactList[i].client_detail.first_name +
                  " " +
                  self.contactList[i].client_detail.last_name
              : "";
            self.contactList[i].address = JSON.parse(
              self.contactList[i].address
            );
            for (
              let j = 0;
              j < self.contactList[i].client_contact_address.length;
              j++
            ) {
              self.contactList[i].client_contact_address[j].contact_address
                ? (self.contactList[i].client_contact_address[
                    j
                  ].contact_address.address_type = JSON.parse(
                    self.contactList[i].client_contact_address[j]
                      .contact_address.address_type
                  ))
                : "";
            }
          }
          console.log("getClientContactList", self.contactList);
        }
      });
    } catch (err) {
      this.global.addException("Client List", "getClientContactList()", err);
    }
  }

  getReferralTypeList() {
    var self = this;
    try {
      this.http.doGet("referaltype", function(error: boolean, response: any) {
        if (error) {
          console.log("error", response);
        } else {
          self.referralTypeList = response.data;
        }
      });
    } catch (err) {
      this.global.addException("Client List", "getReferralTypeList()", err);
    }
  }
  addReferalType() {
    this.dialog.open(ClientDialog, {
      data: { action: "addReferalType" },
      autoFocus: false
    });
  }
  addNew() {
    this.isEdit = false;
    this.crm.isEditFromList = false;
    sessionStorage.removeItem("client");
    if (this.router.url.split("/")[2] == "csa-onboarding") {
      this.router.navigate(["/crm/csa-onboarding/add-client"]);
    } else {
      this.router.navigate(["/crm/csa/add-client"]);
    }
  }
  changeClientList(listName) {
    this.clientListTab = listName;
    if (listName == "contact") {
      this.sortColumn = "client_contact_id";
    } else if (listName == "address") {
      this.sortColumn = "client_id";
    } else if (listName == "client") {
      this.sortColumn = "client_id";
    }

    this.sortColumnType = "N";
    this.sortOrder = "DSC";
    //this.sortOrder = 'ASC';

    this.constant.ITEMS_PER_PAGE = 15;
    this.constant.CURRENT_PAGE = 1;
    this.constant.ITEM_COUNT = this.clientList.length;
    this.listCount = this.clientList.length;
    this.paginationKey = {
      itemsPerPage: this.constant.ITEMS_PER_PAGE,
      currentPage: this.constant.CURRENT_PAGE
    };

    this.selectedClient = null;
    this.isEdit = false;
    this.selectedIndex = null;
  }

  getSelectedClient(selClientObj: any, index: number) {
    let self = this;
    // this.selectedClient = selClientObj;
    // this.isEdit = false;
    // this.crm.isEditFromList = false;
    // this.selectedIndex = index;
    // this.location.go("/crm/csa/client-list/" + selClientObj.client_id);
    // setTimeout(function() {
    //   self.util.scrollDown("clientMark");
    // }, 1000);
    // console.log(JSON.stringify(this.selectedClient));
    this.isEdit = false;
    this.crm.isEditFromList = false;
    this.selectedIndex = index;
    try {
      let clientObj: any = {};
      this.util.showProcessing("processing-spinner");
      this.http.doGet("clients/" + selClientObj.client_id, function(
        error: boolean,
        response: any
      ) {
        self.util.hideProcessing("processing-spinner");
        if (error) {
          console.log("error", response);
        } else {
          clientObj = response.data.client;

          clientObj.work_orders = response.data.work_orders;
          for (let index = 0; index < clientObj.work_orders.length; index++) {
            clientObj.work_orders[index].wo_status =
              clientObj.work_orders[index].wo_status.status;
          }

          clientObj.invoices = response.data.invoices.concat(
            response.data.quotations
          );
          for (let index = 0; index < clientObj.invoices.length; index++) {
            clientObj.invoices[index].doc_type =
              clientObj.invoices[index].invoice_id != undefined
                ? "Invoice"
                : "Quote";
          }
          clientObj.additional_fields = response.data.additional_fields;
          clientObj.address = response.data.address;
          clientObj.contacts = response.data.contacts;

        //   clientObj.client_address =
        //     clientObj.address.length > 0
        //       ? clientObj.address[0].address_line_1 +
        //         ", " +
        //         (clientObj.address[0].address_line_2
        //           ? clientObj.address[0].address_line_2 + ", "
        //           : "") +
        //         clientObj.address[0].city_name +
        //         ", " +
        //         clientObj.address[0].province_name +
        //         ", " +
        //         clientObj.address[0].country_name
        //       : "";

              clientObj.client_address =
            clientObj.address.length > 0
              ? clientObj.address[0].address_line_1 +
                ", " +
                (clientObj.address[0].address_line_2
                  ? clientObj.address[0].address_line_2 + ", "
                  : "") : "";
          if (!clientObj.company_name) {
            clientObj.client_name =
              clientObj.first_name + " " + clientObj.last_name;
            clientObj.company_name = "";
            clientObj.name = clientObj.first_name + " " + clientObj.last_name;
          } else {
            clientObj.client_name = clientObj.company_name;
            clientObj.name = clientObj.company_name;
          }
          clientObj.legal_name = clientObj.legal_name
            ? clientObj.legal_name
            : "";
          for (let i = 0; i < clientObj.address.length; i++) {
            clientObj.address[i].address_type = JSON.parse(
              clientObj.address[i].address_type
            );
          }
          for (let i = 0; i < clientObj.contacts.length; i++) {
            clientObj.contacts[i].address = JSON.parse(
              clientObj.contacts[i].address
            );
            clientObj.contacts[i].contact_address =
              clientObj.contacts[i].address;
            clientObj.contacts[i].client_name = clientObj.client_name;
            clientObj.contacts[i].phone_no = self.util.maskPhoneNumber(
              clientObj.contacts[i].phone_no
            );
          }
          self.selectedClient = clientObj;
          console.log("self.selectedClient", self.selectedClient);

          self.location.go("/crm/csa/client-list/" + selClientObj.client_id);
          setTimeout(function() {
            self.util.scrollDown("clientMark");
          }, 1000);
        }
      });
    } catch (err) {
      this.global.addException(
        "Client details List",
        "getClientDetailsList()",
        err
      );
    }
  }
  getSelectedAddress(address: any, index: number) {
    this.selectedAddress = address;

    this.isEdit = false;
    this.crm.isEditFromList = false;
    this.selectedIndex = index;
    let self = this;
    console.log(JSON.stringify(this.selectedAddress));

    self.location.go("/crm/csa/client-list/" + this.selectedAddress.client_address_id);
          setTimeout(function() {
            self.util.scrollDown("clientAddressMark");
          }, 1000);
  }
  getSelectedContact(contact, index: number) {
    this.selectedContact = contact;
    this.isEdit = false;
    this.crm.isEditFromList = false;
    this.selectedIndex = index;
    let self = this;
    //sessionStorage.setItem('selectedContact',JSON.stringify(this.selectedContact));
    console.log(JSON.stringify(this.selectedContact));

    self.location.go("/crm/csa/client-list/" + this.selectedContact.client_contact_id);
          setTimeout(function() {
            self.util.scrollDown("clientContactMark");
          }, 1000);
  }
  showDetails(detailOption) {
    this.clientDetails = detailOption;
    console.log(detailOption);
  }
  deleteDailog() {
    this.dialog.open(ClientDialog, {
      data: {
        action: "deleteRecord",
        clientId: this.selectedClient.client_id,
        successMsg: this.selectedClient.client_name  //@shahebaz (successMsg)
      },
      autoFocus: false
    });
  }

  editClient() {
    this.isEdit = true;
    this.crm.isEditFromList = true;
    try {
      for (let i = 0; i < this.selectedClient.additional_fields.length; i++) {
        if (this.selectedClient.additional_fields[i].dataType == "Date") {
          this.selectedClient.additional_fields[
            i
          ].data = this.util.getDDMMYYYYDate(
            this.selectedClient.additional_fields[i].data
          );
        }
      }
      sessionStorage.setItem("client", JSON.stringify(this.selectedClient));
    } catch (err) {
      this.global.addException("Client List", "editClient()", err);
    }
  }
}
