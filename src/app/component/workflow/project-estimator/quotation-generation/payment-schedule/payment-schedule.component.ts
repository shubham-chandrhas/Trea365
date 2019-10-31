import { Component, OnInit } from "@angular/core";
import {
  FormControl,
  FormGroup,
  FormBuilder,
  FormArray,
  Validators
} from "@angular/forms";

import { Observable, Subscription } from "rxjs";
import { map, startWith } from "rxjs/operators";
import { UtilService } from "../../../../../shared/service/util.service";
import { HttpService } from "../../../../../shared/service/http.service";
import { ConstantsService } from "../../../../../shared/service/constants.service";
import { ProjectEstimatorService } from "../../project-estimator.service";
import { GlobalService } from "../../../../../shared/service/global.service";

@Component({
  selector: "app-payment-schedule",
  templateUrl: "./payment-schedule.component.html",
  styleUrls: [
    "../quotation-generation.component.css",
    "./payment-schedule.component.scss"
  ]
})
export class PaymentScheduleComponent implements OnInit {
  public payScheduleForm: FormGroup;
  scheduleType: string = 'due';
  public submitted: boolean = false;
  public minDate: any = new Date();
  public totalPayErr: boolean = false;
  public errMsg: string = "";
  public isError: boolean = false;
  public editMode: boolean = false;
  public pageVariables: any = {
    costOfOrder: "",
    subTotal: "",
    taxes: "",
    totalCost: "",
    totalPaymentAmount: "",
    paymentTerm: 0
  };
  subscription: Subscription;
  public settings: any;
  public default_tax_rate: any;

  constructor(
    public util: UtilService,
    private constant: ConstantsService,
    private fb: FormBuilder,
    private http: HttpService,
    private PEService: ProjectEstimatorService,
    private global: GlobalService
  ) {}

  ngOnInit() {
    //alert("hii");
    this.settings = JSON.parse(atob(localStorage.getItem("USER"))).settings;
    // console.log(JSON.parse(atob(localStorage.getItem("USER"))).settings);
    for (let index = 0; index < this.settings.length; index++) {
      if (this.settings[index].setting_key == "tax_rate") {
        this.default_tax_rate = this.settings[index].setting_value;
      }
    }

    console.log(this.PEService.projectEstimatorData.payment_term);
    // console.log(this.default_tax_rate);
    //    console.log(this.PEService.projectEstimatorData.paymentScheduleDetails);
    // && this.PEService.projectEstimatorData.paymentScheduleDetails.date_items.length>0
    if (this.PEService.projectEstimatorData.paymentScheduleDetails) {
      // if(this.PEService.projectEstimatorData.project_estimate_id && this.PEService.projectEstimatorData.schedules){
      //     this.minDate = new Date(this.PEService.projectEstimatorData.schedules.start_date);
      //     this.PEService.projectEstimatorData.paymentScheduleDetails.date_items.map(item => {
      //         this.minDate = new Date().getTime() > new Date(this.util.getDateObjet(item.payment_date)).getTime() ? new Date(this.util.getDateObjet(item.payment_date)) : new Date() ;
      //     });
      // }
      this.paymentScheduleForm(
        "1",
        this.PEService.projectEstimatorData.paymentScheduleDetails
      );
    } else {
      this.paymentScheduleForm("0");
    }

    if(this.PEService.projectEstimatorData.payment_term)
    {
        this.pageVariables.paymentTerm = this.PEService.projectEstimatorData.payment_term;
    }

    this.subscription = this.util.changeDetection.subscribe(dataObj => {
      if (
        dataObj &&
        dataObj.source == "QUOTATION_GENERATION" &&
        dataObj.action == "ADD_PAYMENT_SCHEDULE"
      ) {
        this.reviewPaySchedule();
      }
    });
    //console.log("amount",this.PEService.projectEstimatorData.servicesDetails.services_amount,this.PEService.projectEstimatorData.materialsDetails.materials_amount);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  paymentScheduleForm(option, val: any = {}) {
    try {
      let subTotal: number = 0;
      subTotal =
        subTotal +
        parseFloat(
          this.PEService.projectEstimatorData.servicesDetails &&
            this.PEService.projectEstimatorData.servicesDetails.services_amount
            ? this.PEService.projectEstimatorData.servicesDetails
                .services_amount
            : 0
        ) +
        parseFloat(
          this.PEService.projectEstimatorData.materialsDetails &&
            this.PEService.projectEstimatorData.materialsDetails
              .materials_amount
            ? this.PEService.projectEstimatorData.materialsDetails
                .materials_amount
            : 0
        );
      this.pageVariables.totalCost = this.pageVariables.subTotal = subTotal;
      this.payScheduleForm = this.fb.group({
        cost_of_service: new FormControl(
          this.PEService.projectEstimatorData.servicesDetails &&
          this.PEService.projectEstimatorData.servicesDetails.services_amount
            ? this.PEService.projectEstimatorData.servicesDetails
                .services_amount
            : 0
        ),
        cost_of_material: new FormControl(
          this.PEService.projectEstimatorData.materialsDetails &&
          this.PEService.projectEstimatorData.materialsDetails.materials_amount
            ? this.PEService.projectEstimatorData.materialsDetails
                .materials_amount
            : 0
        ),
        sub_total: new FormControl(subTotal),
        total_cost: new FormControl(subTotal),
        tax_amount: new FormControl(option == "1" ? val.tax_amount : ""),
        shipping_handling: new FormControl(
          option == "1" ? val.shipping_handling : "",
          [Validators.pattern(this.constant.AMOUNT_PATTERN)]
        ),
        adjustment: new FormControl(option == "1" ? val.adjustment : "", [
          Validators.pattern(this.constant.AMOUNT_NEG_PATTERN)
        ]),
        taxes: new FormControl(
          option == "1" ? val.taxes : this.default_tax_rate,
          [
            Validators.min(0),
            Validators.max(100),
            Validators.pattern(this.constant.AMOUNT_PATTERN)
          ]
        ),
        date_items: this.fb.array([])
      });
      if (option == "1") {
        let paymentAmt: number = 0;
        for (var i = 0; i < val.date_items.length; i++) {
          paymentAmt = paymentAmt + parseFloat(val.date_items[i].amount_due);
          this.addpayment(option, val.date_items[i]);
        }
        this.pageVariables.totalPaymentAmount = paymentAmt;
      }
      // else {
      //     if(this.payScheduleForm.get('cost_of_service').value != 0 || this.payScheduleForm.get('cost_of_material').value != 0){
      //         this.addpayment(option);
      //     }
      // }
      this.calculateSubTotal();
    } catch (err) {
      this.global.addException(
        "Payment Schedule",
        "paymentScheduleForm()",
        err,
        {
          "": "",
          other: {
            ProjectEstimatorData: this.PEService.projectEstimatorData
              .servicesDetails,
            "": "",
            FormData: this.payScheduleForm.value
          }
        }
      );
    }
  }
  get shipping_handling() {
    return this.payScheduleForm.get("shipping_handling");
  }
  get adjustment() {
    return this.payScheduleForm.get("adjustment");
  }
  get taxes() {
    return this.payScheduleForm.get("taxes");
  }
  get date_items(): FormArray {
    return (<FormArray>this.payScheduleForm.get("date_items")) as FormArray;
  }

  addpayment(option, val: any = {}) {
    try {
      this.date_items.push(
        this.fb.group({
          //Validators.required
          payment_date: new FormControl(
            option == "1" ? this.util.getTimeZoneDate(val.payment_date) : "",
            []
          ),
          amount_due: new FormControl(option == "1" ? val.amount_due : "", [
            Validators.pattern(this.constant.AMOUNT_PATTERN)
          ])
          //Validators.required,
        })
      );
      //console.log("Add Payment DONE :::::");
      //console.log(val);
    } catch (err) {
      this.global.addException(
        "Payment Schedule - Add Payment",
        "addpayment()",
        err,
        { functionParameter: val }
      );
    }
  }

  public changeSchedule(type){
    this.scheduleType = type;
  }

  removePaySchedule(position, item) {
    try {
      this.date_items.removeAt(position);
      this.calculatePaymentAmount();
    } catch (err) {
      this.global.addException(
        "Payment Schedule - Remove",
        "removePaySchedule()",
        err
      );
    }
  }

  private validateSTInput(callback) {
    try {
      this.util.removeCommas(this.shipping_handling);
      this.util.removeCommas(this.adjustment);
      if (
        (this.shipping_handling.value != "" &&
          this.shipping_handling.value != undefined &&
          !this.constant.AMOUNT_PATTERN.test(this.shipping_handling.value)) ||
        (this.adjustment.value != "" &&
          this.adjustment.value != undefined &&
          !this.constant.AMOUNT_NEG_PATTERN.test(this.adjustment.value))
      ) {
        return callback(false);
      }
      return callback(true);
    } catch (err) {
      this.global.addException(
        "Payment Schedule - Validate Input",
        "validateSTInput()",
        err
      );
    }
  }
  calculateSubTotal() {
    try {
      let self = this;
      //let total = 0;
      this.validateSTInput(function(response) {
        if (!response) {
          return;
        }
        //if(!isNaN(self.shipping_handling.value) && !isNaN(self.adjustment.value)){
        self.pageVariables.costOfOrder =
          parseFloat(self.payScheduleForm.get("cost_of_service").value) +
          parseFloat(self.payScheduleForm.get("cost_of_material").value);
        if (self.pageVariables.costOfOrder > 0) {
          // var itemShip = self.shipping_handling.value == null ? 0 : self.shipping_handling.value == '' ? 0 : self.shipping_handling.value;
          // var itemAdjustment = self.adjustment.value == null ? 0 : self.adjustment.value == '' ? 0 : self.adjustment.value;
          // self.pageVariables.subTotal = (total + (parseFloat(itemShip) + parseFloat(itemAdjustment) + parseFloat(self.pageVariables.costOfOrder)));
          self.payScheduleForm
            .get("sub_total")
            .setValue(self.pageVariables.costOfOrder);
          // self.pageVariables.subTotal = parseFloat(self.pageVariables.costOfOrder) + parseFloat(self.pageVariables.subTotal).toFixed(2);
        }
        //if(self.taxes.value != '' && self.taxes.value != null && self.pageVariables.subTotal > 0){
        self.calculateTaxes();
        //}
        //}
      });
    } catch (err) {
      this.global.addException(
        "Payment Schedule - calculate",
        "calculateSubTotal()",
        err
      );
    }
  }

  reviewPaySchedule() {
    console.log(this.payScheduleForm.valid);
    this.submitted = true;

    //if(this.totalPayErr){ return; }

    // if(this.payScheduleForm.get('cost_of_service').value == 0 && this.payScheduleForm.get('cost_of_material').value == 0){
    //     this.date_items.at(0).get('payment_date').setValidators([ ]);
    //     this.date_items.at(0).get('amount_due').setValidators([ Validators.pattern(this.constant.AMOUNT_PATTERN) ]);
    //     this.date_items.at(0).get('payment_date').updateValueAndValidity();
    //     this.date_items.at(0).get('amount_due').updateValueAndValidity();
    // }

    if (this.payScheduleForm.valid) {
      //console.log("Valid Payment Schedule",this.payScheduleForm.value.date_items);

      this.PEService.projectEstimatorData.paymentScheduleDetails = this.payScheduleForm.value;
      this.PEService.projectEstimatorData.paymentScheduleDetails.totalPaymentAmount = this.pageVariables.totalPaymentAmount;
      this.PEService.projectEstimatorData.paymentScheduleDetails.paymentTerm = this.pageVariables.paymentTerm;
      this.PEService.projectEstimatorData.paymentScheduleDetails.scheduleType = this.scheduleType;
      this.PEService.updateFormStatus("paymentScheduleFm", true);
    } else {
      this.PEService.updateFormStatus("paymentScheduleFm", false);
    }
  }
  private validatePaymentInput(callback) {
    for (let i = 0; i < this.date_items.value.length; i++) {
      this.util.removeCommas(this.date_items.at(i).get("amount_due"));
      if (
        this.date_items.value[i].amount_due != "" &&
        this.date_items.value[i].amount_due != undefined &&
        !this.constant.AMOUNT_PATTERN.test(this.date_items.value[i].amount_due)
      ) {
        return callback(false);
      }
    }
    return callback(true);
  }

  calculatePaymentAmount() {
    let self = this;

    this.validatePaymentInput(function(response) {
      if (!response) {
        return;
      }

      let total = 0.0;
      for (let i = 0; i < self.date_items.value.length; i++) {
        if (self.date_items.value[i].amount_due != "") {
          var payAmt =
            self.date_items.value[i].amount_due == null || ""
              ? 0
              : self.date_items.value[i].amount_due;
          total =
            self.editMode == true
              ? total + parseFloat(payAmt)
              : total + parseFloat(payAmt);
          //@@ Commented code by Yogesh for remove validation
          // if(self.pageVariables.totalCost < total){
          //     self.totalPayErr = true;
          //     self.errMsg = 'Total payment amount should not exceed Total cost.'
          // }else{
          //     self.totalPayErr = false;
          //     self.errMsg = ''
          // }
        }
      }
      self.pageVariables.totalPaymentAmount = total.toFixed(2);
      self.pageVariables.remainingPaymentAmount = (self.pageVariables
        .totalCost == "XXXX"
        ? 0
        : self.pageVariables.totalCost - total
      ).toFixed(2);
    });
  }
  private validateTaxInput(callback) {
    if (
      this.taxes.value != "" &&
      this.taxes.value != undefined &&
      !this.constant.AMOUNT_PATTERN.test(this.taxes.value)
    ) {
      return callback(false);
    }
    return callback(true);
  }
  calculateTaxes() {
    let self = this;
    this.validateTaxInput(function(response) {
      self.totalPayErr = false;
      self.errMsg = "";
      if (!response) {
        return;
      }
      let addSubtotal: any = 0;
      let itemShip =
        self.shipping_handling.value == null
          ? 0
          : self.shipping_handling.value == ""
          ? 0
          : self.shipping_handling.value;
      let itemAdjustment =
        self.adjustment.value == null
          ? 0
          : self.adjustment.value == ""
          ? 0
          : self.adjustment.value;
      addSubtotal =
        parseFloat(itemShip) +
        parseFloat(itemAdjustment) +
        parseFloat(self.pageVariables.subTotal);

      var itemTax =
        self.taxes.value == null || self.taxes.value == ""
          ? 0
          : self.taxes.value;
      self.pageVariables.taxes = (
        (parseFloat(itemTax) / 100) *
        parseFloat(addSubtotal)
      ).toFixed(2);

      if (self.taxes.value != "" && self.pageVariables.subTotal >= 0) {
        self.payScheduleForm
          .get("tax_amount")
          .setValue(self.pageVariables.taxes);
        self.pageVariables.totalCost =
          parseFloat(self.pageVariables.taxes) + parseFloat(addSubtotal);
        self.pageVariables.totalCost = self.pageVariables.totalCost.toFixed(2);
        self.payScheduleForm
          .get("total_cost")
          .setValue(self.pageVariables.totalCost);
        self.pageVariables.taxPercent = self.taxes.value;
      } else {
        //self.pageVariables.taxes = 0;
        self.payScheduleForm
          .get("tax_amount")
          .setValue(self.pageVariables.taxes);
        self.pageVariables.totalCost =
          parseFloat(self.pageVariables.taxes) + parseFloat(addSubtotal);
        self.payScheduleForm
          .get("total_cost")
          .setValue(self.pageVariables.totalCost);
      }
      //if(self.pageVariables.totalPaymentAmount > 0){
      self.calculatePaymentAmount();
      //}else{
      //    self.pageVariables.remainingPaymentAmount = self.pageVariables.totalCost;
      //}

      if (
        itemAdjustment < 0 &&
        parseFloat(itemShip) + parseFloat(self.pageVariables.subTotal) <
          itemAdjustment * -1
      ) {
        self.totalPayErr = true;
        self.errMsg =
          "Adjustment(-) amount should not exceed (Subtotal + Shipping & Handling).";
      }
    });
  }
}
