/*
    TO DO :-
    1. Invoice List
        1. In Overview Quotation No. Work Order No. As Per Design
        2. "Record Payment" button as per comment
        3. Ouotation List Dialog Add Cancel Button
    2. New Invoice
        1. Quotation No. Work Order No. As Per Design
        2. Due Date Calender Icon missing
        3. More Unlisted Items input Missing
    3. Add Quotation Review and link with other invoice pages (invoice-quotation-review) wo-quotation-review copy all
*/

import { Component, OnInit, ApplicationRef, Inject } from "@angular/core";
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

import { ConstantsService } from "../../../../shared/service/constants.service";
import { UtilService } from "../../../../shared/service/util.service";
import { HttpService } from "../../../../shared/service/http.service";
import { GlobalService } from "../../../../shared/service/global.service";
import { AdminService } from "../../../admin/admin.service";
import { DialogComponent } from "../../../../shared/model/dialog/dialog.component";
import { Observable, Subscription } from "rxjs";
import { map, startWith } from "rxjs/operators";
import { AccountingDialog } from "../../accounting-dialog.component";

import { ExportService } from "../../../../shared/service/export.service";

import { AppConfig, APP_CONFIG } from "../../../../app-config.module";
import * as _ from "underscore";

declare var jQuery: any;
declare var $: any;
@Component({
  selector: "app-invoice-list",
  templateUrl: "./invoice-list.component.html",
  styleUrls: ["./invoice-list.component.css"]
})
export class InvoiceListComponent implements OnInit {
  public sortColumn: string = "due_date";
  public sortColumnType: string = "A";
  public sortOrder: string = "ASC";
  public selectedInvoice: any = null;
  public invoiceList: any[] = [];
  public printAllList: any[];
  public searchList: string;
  public searchTxt: string;
  public statusSearch;
  public dateSearch;
  public clientSearch;
  public invoiceNoSearch;
  public invoiceDate;
  public amountSearch;
  amountRSearch;
  public paginationKey: any;
  public listCount: number = 0;
  public selectedIndex: number;
  public minDate = new Date();
  public isRecord: boolean = false;
  public submittedPay: boolean = false;
  public errMsg: string = "";
  public isError: boolean = false;
  recordPayForm: FormGroup;
  public routeObj: any;
  totalAmount: any = 0;
  remainingAmount: any = 0;
  permissionsSet: any;
  createInvoicePermission: any;
  subscription: Subscription;
  public onBoarding:boolean = false; 

  constructor(
    public dialog: MatDialog,
    public util: UtilService,
    public constant: ConstantsService,
    private ref: ApplicationRef,
    public http: HttpService,
    public global: GlobalService,
    private admin: AdminService,
    private file: ExportService,
    public router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private location: Location,
    @Inject(APP_CONFIG)
    private config: AppConfig
  ) {}

  ngOnInit() {
    let self = this;
    this.util.setWindowHeight();
    this.util.setPageTitle(this.route);

    this.routeObj = {
      list: "/account/csa/invoice-list/0",
      add: "/account/csa/create-invoice"
    };
    try {
      this.paginationKey = {
        itemsPerPage: this.constant.ITEMS_PER_PAGE,
        currentPage: this.constant.CURRENT_PAGE
      };
      this.util.menuChange({ menu: 7, subMenu: 33 });
      this.util.setWindowHeight();
      this.getInvoiceList();
      this.permissionsSet = this.util.getModulePermission(155);
      this.createInvoicePermission = this.util.getModulePermission(159);

      this.subscription =  this.util.changeDetection.subscribe(dataObj => {
        if (dataObj && dataObj.source == "InvoiceForPayment") {
          self.getInvoiceListForPayment(dataObj.data.client_id);
        }
      });

    } catch (err) {
      this.global.addException("location list", "ngOnInit()", err);
    }
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

  getInvoiceList() {
    let self = this;
    this.util.showProcessing("processing-spinner");
    try {
      this.http.doGet("getInvoiceList", function(
        error: boolean,
        response: any
      ) {
        self.util.hideProcessing("processing-spinner");
        if (error) {
        } else {
          self.invoiceList = response.data ? response.data : [];
          self.totalAmount = 0;
          self.remainingAmount = 0;
          for (let i = 0; i < self.invoiceList.length; i++) {
            self.invoiceList[i].status = self.invoiceList[i].status_detail
              ? self.invoiceList[i].status_detail.status
              : "N/A";
            self.invoiceList[i].client_name = self.invoiceList[i].client
              ? self.invoiceList[i].client.company_name
                ? self.invoiceList[i].client.company_name
                : self.invoiceList[i].client.first_name +
                  " " +
                  self.invoiceList[i].client.last_name
              : "N/A";
            self.invoiceList[i].total_payment_amount = parseFloat(
              self.invoiceList[i].total_payment_amount
            );
            self.totalAmount =
              parseFloat(self.totalAmount) +
              parseFloat(self.invoiceList[i].total_payment_amount);
            self.remainingAmount =
              parseFloat(self.remainingAmount) +
              parseFloat(self.invoiceList[i].remaining_amount);
            self.invoiceList[i].due_date = self.util.getFormatedDate(
              self.invoiceList[i].due_date);
              self.invoiceList[i].invoice_date = self.util.getFormatedDate(
                self.invoiceList[i].invoice_date);
                self.invoiceList[i].remaining_amount = parseFloat(self.invoiceList[i].remaining_amount);
          }
          self.constant.ITEM_COUNT = self.invoiceList.length;
          self.util.hideProcessing("processing-spinner");
          self.route.snapshot.paramMap.get("id") != "0"
            ? self.showInvoiceDetails()
            : "";
            console.log('invoiceList = ',self.invoiceList)
        }

        if(self.invoiceList.length == 0) {
            self.onBoarding = true;
          }
      });
    } catch (err) {
      this.global.addException("Invoice List", "getInvoiceList()", err);
    }
  }

  getInvoiceListForPayment(clientId) {
    let self = this;
    this.util.showProcessing("processing-spinner");
    try {
      this.http.doGet("getInvoiceList/"+clientId, function(
        error: boolean,
        response: any
      ) {
        self.util.hideProcessing("processing-spinner");
        if (error) {
        } else {
          self.invoiceList = response.data ? response.data : [];
          self.totalAmount = 0;
          self.remainingAmount = 0;
          for (let i = 0; i < self.invoiceList.length; i++) {
            self.invoiceList[i].status = self.invoiceList[i].status_detail
              ? self.invoiceList[i].status_detail.status
              : "N/A";
            self.invoiceList[i].client_name = self.invoiceList[i].client
              ? self.invoiceList[i].client.company_name
                ? self.invoiceList[i].client.company_name
                : self.invoiceList[i].client.first_name +
                  " " +
                  self.invoiceList[i].client.last_name
              : "N/A";
            self.invoiceList[i].total_payment_amount = parseFloat(
              self.invoiceList[i].total_payment_amount
            );
            self.totalAmount =
              parseFloat(self.totalAmount) +
              parseFloat(self.invoiceList[i].total_payment_amount);
            self.remainingAmount =
              parseFloat(self.remainingAmount) +
              parseFloat(self.invoiceList[i].remaining_amount);
            self.invoiceList[i].due_date = self.util.getFormatedDate(
              self.invoiceList[i].due_date);
              self.invoiceList[i].invoice_date = self.util.getFormatedDate(
                self.invoiceList[i].invoice_date);
                self.invoiceList[i].remaining_amount = parseFloat(self.invoiceList[i].remaining_amount);
          }
          self.constant.ITEM_COUNT = self.invoiceList.length;
          self.util.hideProcessing("processing-spinner");
          self.route.snapshot.paramMap.get("id") != "0"
            ? self.showInvoiceDetails()
            : "";
            console.log('invoiceList = ',self.invoiceList)
        }
      });
    } catch (err) {
      this.global.addException("Invoice List", "getInvoiceList()", err);
    }
  }

  showInvoiceDetails() {
    try {
      let sortedList: any[] = _.sortBy(this.invoiceList, "invoice_date");
      for (var i = 0; i < sortedList.length; ++i) {
        this.route.snapshot.paramMap.get("id") == sortedList[i].invoice_id
          ? (this.getSelectedInvoice(sortedList[i], i),
            (this.selectedIndex = i))
          : "";
      }
    } catch (err) {
      this.global.addException("Invoice List", "showInvoiceDetails()", err);
    }
  }

  getSelectedInvoice(invoice, index) {
    var self = this;
    self.selectedInvoice = "";
    this.util.showProcessing("processing-spinner");
    try {
      this.http.doGet("getInvoiceById/" + invoice.invoice_id, function(
        error: boolean,
        response: any
      ) {
        self.util.hideProcessing("processing-spinner");
        if (error) {
        } else {
          self.selectedInvoice = response.data;
          self.selectedIndex = index;
          self.selectedInvoice.pdfLink =
              self.config.pdfEndpoint +
              "invoice/" +
              self.selectedInvoice.invoice_random_number;
            self.selectedInvoice.preview =
              self.config.pdfEndpoint +
              "invoice/" +
              self.selectedInvoice.invoice_random_number;
          self.util.hideProcessing("processing-spinner");
          // self.selectedInvoice.remaining_amount = invoice.remaining_amount;
          self.selectedInvoice.services.forEach(v => {
            v.amount = parseFloat(v.cost) * parseFloat(v.quantity);
          });
          self.selectedInvoice.product_materials.forEach(v => {
            v.amount = parseFloat(v.cost) * parseFloat(v.quantity);
          });
          console.log(self.selectedInvoice);
          self.location.go("/account/csa/invoice-list/" + invoice.invoice_id);
          setTimeout(function() {
            self.util.scrollDown("invoiceMark");
          }, 1000);
        }
      });
    } catch (err) {
      this.global.addException("Invoice List", "getInvoiceList()", err);
    }
  }

  public newInvoice() {
    this.dialog.open(AccountingDialog, { data: { action: "quotationList" } });
  }

  public recordPay() {
    this.isRecord = !this.isRecord;
    if (this.isRecord) {
      this.createRecordPayForm("0");
    }
  }

  public saveRecordPay(form: FormGroup) {
    let self = this;
    this.submittedPay = true;
    try {
      if (form.valid) {
        let reqObj: any = {};
        reqObj.invoice_id = this.selectedInvoice.invoice_id;
        reqObj.payments = form.value.items;
        reqObj.payments.filter(
          item =>
            (item.payment_date = this.util.getYYYYMMDDDate(item.payment_date))
        );
        console.log(reqObj);
        self.isError = false;
        self.errMsg = "";
        self.util.addSpinner("savePay", "Save");
        this.http.doPost("recordInvoicePayment", reqObj, function(
          error: boolean,
          response: any
        ) {
          // self.util.hideProcessing('processing-spinner');
          self.util.removeSpinner("savePay", "Save");
          self.submittedPay = false;
          if (error) {
            console.log("error", response);
            self.isError = true;
            self.errMsg = response.message;
          } else {
            self.util.showDialog(DialogComponent, response.message, [
              self.routeObj.list
            ]);
            self.recordPay();
            self.getInvoiceList();
            self.selectedInvoice = null;
            self.selectedIndex = null;
          }
        });
      }
    } catch (err) {
      this.global.addException("Invoice List", "saveRecordPay()", err);
    }
  }

  removeItem(position) {
    this.items.removeAt(position);
  }

  createRecordPayForm(option, val: any = {}) {
    try {
      this.recordPayForm = this.fb.group({
        items: this.fb.array([])
      });
      if (option == "1") {
        for (let i = 0; i < val.prodsNservices.length; i++) {
          this.addItem("1", val.prodsNservices[i]);
        }
        this.util.hideProcessing("processing-spinner");
      } else {
        this.selectedInvoice.remaining_amount > 0 ? this.addItem("0") : "";
      }
    } catch (err) {
      this.global.addException("Invoice List", "createRecordPayForm()", err);
    }
  }

  get items(): FormArray {
    return (<FormArray>this.recordPayForm.get("items")) as FormArray;
  }
  addItem(option, val: any = {}) {
    this.items.push(
      this.fb.group({
        payment_date: new FormControl(option == "0" ? "" : val.payment_date, [
          Validators.required
        ]), //Only for edit
        payment_amount: new FormControl(
          option == "0" ? "" : val.payment_amount,
          [
            Validators.required,
            Validators.pattern(this.constant.AMOUNT_PATTERN)
          ]
        ), //Only for edit
        payment_method: new FormControl(
          option == "0" ? "" : val.payment_method,
          []
        ), //Only for review
        payment_reference: new FormControl(
          option == "0" ? "" : val.payment_reference,
          []
        ) //Only for review
      })
    );
  }

  public sendInvoice() {
    let self = this;
    let reqObj: any = {};
    self.isError = false;
    self.errMsg = "";
    try {
      reqObj.invoice_id = this.selectedInvoice.invoice_id;
      self.util.addSpinner("sendInv", "Send Invoice");
      this.http.doGet("sendInvoiceToClient/" + reqObj.invoice_id, function(
        error: boolean,
        response: any
      ) {
        // self.util.hideProcessing('processing-spinner');
        self.util.removeSpinner("sendInv", "Send Invoice");
        if (error) {
          console.log("error", response);
          self.isError = true;
          self.errMsg = response.message;
        } else {
          self.util.showDialog(DialogComponent, response.message, [
            self.routeObj.list
          ]);
          self.selectedInvoice = null;
        }
      });
    } catch (err) {
      this.global.addException("Invoice List", "sendInvoice()", err);
    }
  }

  downloadPDF(dataDownload) {
    window.open(dataDownload);
  }
  preview(dataPreview) {
    window.open(dataPreview);
  }
}
