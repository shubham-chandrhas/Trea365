import { Component, OnInit } from "@angular/core";

import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";
import { Router, ActivatedRoute } from "@angular/router";

import { UtilService } from "../../../../shared/service/util.service";
import { HttpService } from "../../../../shared/service/http.service";
import { GlobalService } from "../../../../shared/service/global.service";
import { DialogComponent } from "../../../../shared/model/dialog/dialog.component";
import { PurchaseOrderDialog } from "../purchase-order-dialog.component";

declare var $: any;
@Component({
  selector: "app-purchase-order-review",
  templateUrl: "./purchase-order-review.component.html",
  styleUrls: ["./purchase-order-review.component.css"]
})
export class PurchaseOrderReviewComponent implements OnInit {
  public backupData: any = {};
  public pageData: any = {};
  public userInfo: any;
  today: number = Date.now();
  public editMode: boolean = false;
  public isExistingOrder: boolean = false;
  public orderStatus: any = "Saved";
  private routeObj: any;
  poId: any = "";
  public totalPayErr: boolean = false;
  isError: boolean = false;
  public errMsg: string = "";
  currentPath: string;
  permissionsSet: any;
  constructor(
    public dialog: MatDialog,
    public util: UtilService,
    public http: HttpService,
    public global: GlobalService,
    public router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    var self = this;
    this.orderStatus = null;
    this.isError = false;
    this.errMsg = "";
    this.util.menuChange({ menu: 3, subMenu: 22 });
    this.util.setWindowHeight();
    this.util.setPageTitle(this.route);
    this.currentPath = this.router.url.split("/")[
      this.router.url.split("/").length - 1
    ];
    window.scrollTo(0, 0);
    this.routeObj = {
      list: "/inventory/po/csa/purchase-order-list/",
      add: "/inventory/po/csa/new-purchase-order"
    };
    if (localStorage.getItem("USER")) {
      this.userInfo = JSON.parse(atob(localStorage.getItem("USER")));
      console.log(this.userInfo);
    }
    this.util.changeDetection.subscribe(dataObj => {
      if (dataObj && dataObj.source == "PURCHASE_ORDER") {
        console.log("Subscribe ::", dataObj);
        this.editMode = false;
        this.totalPayErr = false;
        this.errMsg = "";
        self.pageDataInit(dataObj.data);
        this.poId =
          dataObj.data.purchase_order_id && dataObj.data.purchase_order_id != ""
            ? dataObj.data.purchase_order_id
            : "";
        sessionStorage.getItem("POID")
          ? $("html,body").find("#poMark").length > 0
            ? ($("html,body").animate(
                { scrollTop: $("#poMark").offset().top },
                1500
              ),
              sessionStorage.removeItem("POID"))
            : ""
          : "";
      }
    });

    if (sessionStorage.getItem("PO_INFO")) {
      this.orderStatus = null;
      //this.isExistingOrder = false;
      this.poId =
        this.pageData &&
        this.pageData.purchase_order_id &&
        this.pageData.purchase_order_id != ""
          ? this.pageData.purchase_order_id
          : "";
      //this.isExistingOrder = this.util.poID == '0' ? false : this.currentPath == 'purchase-order-review' ? true : false;
      this.isExistingOrder =
        this.currentPath != "purchase-order-review"
          ? true
          : this.util.poID == "0"
          ? false
          : true;
      this.backupData = JSON.parse(sessionStorage.getItem("PO_INFO"));
      this.pageData = JSON.parse(sessionStorage.getItem("PO_INFO"));
      this.pageData.supplierName = this.pageData.purchaseOrder.supplier;
      console.log("sessionStorage.getItem('PO_INFO')", this.pageData);
      //for(let i = 0; i < this.pageData.purchaseOrder.date_items.length; i++){
      // this.pageData.purchaseOrder.date_items[i].paymentDate = this.pageData.purchaseOrder.date_items[i].paymentDate.split('T');
      // this.pageData.purchaseOrder.date_items[i].paymentDate = this.pageData.purchaseOrder.date_items[i].paymentDate[0].replace(/-/g,'/');
      //}
      //alert("Innnn....");
    }
    //alert(this.util.poAction);
    if (this.util.poAction == "back_to_edit") {
      this.editMode =
        this.currentPath != "purchase-order-review" ? true : false;
    }
  }

  pageDataInit(obj: any) {
    try {
      this.isExistingOrder =
        this.currentPath != "purchase-order-review"
          ? true
          : this.util.poID == "0"
          ? false
          : true;
      this.pageData = obj;
      console.log("obj", obj);
      this.orderStatus = this.pageData.status;
      let purchaseOrder: any = [];
      let purchase_item: any[] = [];
      let date_items: any[] = [];
      purchase_item = obj.order_items;
      //purchase_item = purchase_item.filter(item=>( item.item_class_name == null ? (item.itemClassName = '') : (item.itemClassName = item.item_class_name.item_class_name, item.class_id = item.item_class_name.item_class_id) ));
      purchase_item.forEach((element, key) => {
        element.itemClassName = element.item_manuf_parts_name
          .manuf_part_class_name
          ? element.item_manuf_parts_name.manuf_part_class_name.item_class_name
          : "";
        element.class_id = element.item_manuf_parts_name.manuf_part_class_name
          ? element.item_manuf_parts_name.manuf_part_class_name.item_class_id
          : "";
      });

      date_items = obj.payment_schedules;
      purchaseOrder.purchase_items = purchase_item;
      purchaseOrder.date_items = date_items;
      this.pageData.purchaseOrder = purchaseOrder;
      this.pageData.supplierName = this.pageData.supplier_name;
      this.pageData.purchaseOrder.comment = this.pageData.comment;
      this.pageData.costOfOrder = this.pageData.cost_of_order;
      this.pageData.subTotal = this.pageData.subtotal;
      this.pageData.totalCost = this.pageData.total_cost;

      if (
        this.pageData.subtotal != null &&
        this.pageData.total_cost != null &&
        this.pageData.tax != null
      ) {
        this.pageData.taxes = (
          (parseFloat(this.pageData.tax) / 100) *
          parseFloat(this.pageData.subtotal)
        ).toFixed(2);
      }

      this.pageData.purchaseOrder.tax = this.pageData.tax;
      this.pageData.purchaseOrder.shipAndHandling = this.pageData.shipping_and_handling;
      this.pageData.purchaseOrder.adjustment = this.pageData.adjustment;
      this.pageData.purchaseOrder.purchase_items.filter(
        item => (
          (item.manf_name = item.item_manuf_name.manf_name),
          (item.manf_part_name = item.item_manuf_parts_name.short_name),
          (item.quantity = item.quantity_ordered),
          (item.unitPrice = item.price_per_unit)
        )
      );
      let totalPaymentAmount: number = 0;
      let remainingPaymentAmount: number = 0;
      this.pageData.purchaseOrder.date_items.filter(
        item => (
          (item.paymentDate = this.util.getDDMMYYYYDate(
            this.util.getDateObjet(item.payment_date)
          )),
          (item.paymentAmount = item.amount_due),
          (totalPaymentAmount =
            totalPaymentAmount + parseFloat(item.amount_due))
        )
      );
      this.pageData.totalPaymentAmount = totalPaymentAmount.toFixed(2);

      remainingPaymentAmount = this.pageData.totalCost - totalPaymentAmount;
      this.pageData.remainingPaymentAmount = remainingPaymentAmount.toFixed(2);
      console.log(this.pageData);

      this.permissionsSet = this.util.getModulePermission(92);
    } catch (err) {
      this.global.addException("Purchase Order Review", "pageDataInit()", err);
    }
  }

  createPurchaseOrder(type) {
    let self = this;
    self.isError = false;
    self.errMsg = "";
    let url = "";
    try {
      let reqObj: any = {};
      // reqObj = this.pageData.purchaseOrder;
      reqObj = JSON.parse(JSON.stringify(this.pageData.purchaseOrder));
      if (this.util.poID && this.util.poID != "0") {
        url = "purchaseOrder/edit";
        reqObj.purchaseOrderId = this.util.poID;
      } else {
        url = "purchaseorder/create";
      }

      if (type == 0) {
        self.util.addSpinner("addData", "Save");
        reqObj.saveAndSend = 0;
      } else {
        reqObj.saveAndSend = 1;
      }

      console.log(this.pageData);
      reqObj.items = JSON.parse(
        JSON.stringify(this.pageData.purchaseOrder.purchase_items)
      );
      reqObj.poPaySchedule =
        parseFloat(JSON.parse(JSON.stringify(this.pageData.totalCost))) == 0
          ? []
          : JSON.parse(JSON.stringify(this.pageData.purchaseOrder.date_items));
      reqObj.costOfOrder = JSON.parse(
        JSON.stringify(this.pageData.costOfOrder)
      );
      reqObj.subTotal = JSON.parse(JSON.stringify(this.pageData.subTotal));
      reqObj.totalCost = JSON.parse(JSON.stringify(this.pageData.totalCost));
      reqObj.saveAndApprove = 0;
      delete reqObj.items.purchase_items;
      delete reqObj.items.date_items;
      console.log(reqObj);
      for (let i = 0; i < reqObj.poPaySchedule.length; i++) {
        reqObj.poPaySchedule[i].paymentDate = this.util.getYYYYMMDDDate(
          this.util.stringToDate(reqObj.poPaySchedule[i].paymentDate)
        );
      }
      // reqObj.tax = this.pageData.taxes;
      console.log(reqObj);
      this.http.doPost(url, reqObj, function(error: boolean, response: any) {
        self.util.removeSpinner("addData", "Save");
        self.util.removeSpinner(
          "sendOrderToSupplier" + type,
          "Send Order to Supplier"
        );
        console.log(error);
        console.log(response);
        if (error) {
          // console.log('error');
          self.isError = true;
          self.errMsg = response.message;
        } else {
          self.util.poID = "0";
          sessionStorage.removeItem("PO_INFO");
          self.util.showDialog(
            DialogComponent,
            response.message,
            self.util.poID && self.util.poID != "0"
              ? [self.routeObj.list + "0"]
              : [self.routeObj.list + "0", self.routeObj.add]
          );
        }
      });
    } catch (err) {
      this.global.addException(
        "Purchase Order Review",
        "createPurchaseOrder()",
        err
      );
    }
  }
  editPurchaseOrder(obj: any, type) {
    try {
      if (this.util.poID && this.util.poID != "0") {
        this.util.poAction = "back_to_edit";
        //this.router.navigate([this.routeObj.list + '/' + this.util.poID]);
        //return;
      } else {
        this.util.poAction = "";
        this.util.poID = obj.purchase_order_id;
      }
      if (type == "backup") {
        // this.backupData.purchaseOrder.purchase_items.filter(item=>(item.purchaseOrder.purchase_items))
        console.log(this.backupData);
        this.editMode = false;
        for (
          let i = 0;
          i < this.backupData.purchaseOrder.date_items.length;
          i++
        ) {
          this.backupData.purchaseOrder.date_items[
            i
          ].paymentDate = this.util.getDateObjet(
            this.backupData.purchaseOrder.date_items[i].paymentDate
          );
        }
        sessionStorage.setItem("PO_INFO", JSON.stringify(this.backupData));
        if (this.util.poID && this.util.poID != "0") {
          this.router.navigate([this.routeObj.list + "/" + this.util.poID]);
        } else {
          this.router.navigate([this.routeObj.add]);
        }
      } else {
        this.editMode = true;
        sessionStorage.setItem("PO_INFO", JSON.stringify(obj));
      }
    } catch (err) {
      this.global.addException(
        "Purchase Order Review",
        "editPurchaseOrder()",
        err
      );
    }
  }
  cancel() {
    sessionStorage.removeItem("PO_INFO");
    this.router.navigate([this.routeObj.list + "0"]);
  }
  continueReceiving(obj: any) {
    console.log(obj);
  }
  receiveItems(obj: any) {
    console.log(obj);
    sessionStorage.setItem("po", JSON.stringify(obj));
    this.router.navigate(["/inventory/rs/csa/add-receiving-slip"]);
  }
  sendOrderToSupplier(obj: any, type) {
    let self = this;
    self.isError = false;
    self.errMsg = "";
    try {
      console.log(obj);
      if (obj.totalPaymentAmount != obj.totalCost) {
        this.totalPayErr = true;
        this.errMsg =
          "Total payment amount should match exactly to Total Cost. Please edit purchase order.";
      } else {
        this.totalPayErr = true;
        this.errMsg = "";
        self.util.addSpinner(
          "sendOrderToSupplier" + type,
          "Send Order to Supplier"
        );
        if (type == 1) {
          this.createPurchaseOrder(1);
        } else {
          this.http.doGet(
            "sendOrderToSupplier/" +
              obj.purchase_order_id +
              "/" +
              obj.supplier_id,
            function(error: boolean, response: any) {
              console.log(response);
              self.util.removeSpinner(
                "sendOrderToSupplier" + type,
                "Send Order to Supplier"
              );
              if (error) {
                // console.log('error');
                self.isError = true;
                self.errMsg = response.message;
              } else {
                self.util.showDialog(
                  DialogComponent,
                  response.message,
                  type == "2"
                    ? [self.routeObj.list + obj.purchase_order_id]
                    : [
                        self.routeObj.list + obj.purchase_order_id,
                        self.routeObj.add
                      ]
                );
                self.util.changeEvent({
                  source: "PO_SENT",
                  action: "VIEW",
                  data: obj
                });
                // console.log('no error');
              }
            }
          );
        }
      }
    } catch (err) {
      this.global.addException(
        "Purchase Order Review",
        "sendOrderToSupplier()",
        err
      );
    }
  }
  cancelOrder(obj: any) {
    let self = this;
    try {
      console.log(obj);
      let reqObj: any = {};
      reqObj.purchase_order_id = obj.purchase_order_id;
      let data: any = {
        API_URL: "purchaseOrder/cancel",
        reqObj: {
          purchase_order_id: obj.purchase_order_id
        },
        event: {
          source: "CANCEL_PO",
          action: "DELETE"
        }
      };
      this.util.showDialog(
        DialogComponent,
        "Are you sure you want to cancel this order?",
        [],
        "Cancel Confirmation",
        "CONFIRMATION",
        data
      );
      // this.http.doPost('purchaseOrder/cancel', reqObj, function(error: boolean, response: any){
      //     self.util.removeSpinner('cancelOrder', "Cancel This Order");
      //     console.log(response);
      //     if( error ){
      //         // console.log('error');
      //     }else{
      //         self.util.changeEvent({
      //             'source': 'PO_CANCEL',
      //             'action': 'CANCEL',
      //             'data': obj
      //         });
      //         // console.log('no error');
      //     }
      // });
    } catch (err) {
      this.global.addException("Purchase Order Review", "cancelOrder()", err);
    }
  }

  approvePOFromReview(data: any, type) {
    //this.util.showDialog(DialogComponent, "Are you sure you want to cancel this order?", [], "Cancel Confirmation", "CONFIRMATION", data);
    this.dialog.open(PurchaseOrderDialog, {
      data: {
        action: "approveConfirmation",
        dataObj: { allData: data, type: type }
      },
      autoFocus: false
    });
  }

  approvePurchaseOrder(obj: any) {
    let self = this;
    try {
      this.errMsg = "";
      if (obj.totalPaymentAmount != obj.totalCost) {
        this.totalPayErr = true;
        this.errMsg =
          "Total payment amount should match exactly to Total Cost. Please edit purchase order.";
      } else {
        self.util.addSpinner("approvePurchaseOrder", "Approve");
        this.http.doGet(
          "approvePurchaseOrder/" + obj.purchase_order_id,
          function(error: boolean, response: any) {
            console.log(response);
            self.util.removeSpinner("approvePurchaseOrder", "Approve");
            if (error) {
              // console.log('error');
              this.errMsg = response.message;
            } else {
              self.util.showDialog(DialogComponent, response.message, [
                self.routeObj.list + obj.purchase_order_id
              ]);
              self.util.changeEvent({
                source: "PO_SENT",
                action: "VIEW",
                data: { obj: obj, id: obj.purchase_order_id }
              });
              // console.log('no error');
            }
          }
        );
      }
    } catch (err) {
      this.global.addException(
        "Purchase Order Review",
        "approvePurchaseOrder()",
        err
      );
    }
  }

  resendMail(emailLog: any, id) {
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
          self.util.showDialog(DialogComponent, response.message, [
            self.routeObj.list + id
          ]);
          self.util.changeEvent({
            source: "PO_SENT",
            action: "VIEW",
            data: { emailLog: emailLog, id: id }
          });
          // console.log('no error');
        }
      });
    } catch (err) {
      this.global.addException("Purchase Order Review", "resendMail()", err);
    }
  }

  //    Delete Purchase Order
  deletePurchaseOrder(obj: any) {
    console.log(obj.purchase_order_id);
    let self = this;
    try {
      let reqObj: any = {};
      reqObj.purchase_order_id = obj.purchase_order_id;
      let data: any = {
        API_URL: "purchaseOrder/delete",
        reqObj: {
          purchase_order_id: obj.purchase_order_id
        },
        event: {
          source: "CANCEL_PO",
          action: "DELETE"
        }
      };
      this.util.showDialog(
        DialogComponent,
        "Are you sure you want to delete P/O No: " +
          this.pageData.purchase_order_no +
          " ?", //@shahebaz (+ this.pageData.purchase_order_no +)
        [],
        "Delete Confirmation ?",
        "CONFIRMATION",
        data
      );
    } catch (err) {
      this.global.addException("Purchase Order Review", "resendMail()", err);
    }
  }
}
