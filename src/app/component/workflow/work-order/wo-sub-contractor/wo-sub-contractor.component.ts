import { Component, OnInit, ApplicationRef } from "@angular/core";
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
import { Observable } from "rxjs";
import { map, startWith } from "rxjs/operators";
import { UtilService } from "../../../../shared/service/util.service";
import { HttpService } from "../../../../shared/service/http.service";
import { ConstantsService } from "../../../../shared/service/constants.service";
import { GlobalService } from "../../../../shared/service/global.service";

import { DialogComponent } from "../../../../shared/model/dialog/dialog.component";
import { ObservableInput } from "rxjs/Observable";
import { WorkOrderService } from "../work-order.service";

@Component({
  selector: "app-wo-sub-contractor",
  templateUrl: "./wo-sub-contractor.component.html",
  styleUrls: ["./wo-sub-contractor.component.scss"]
})
export class WoSubContractorComponent implements OnInit {
  public userInfo: any;
  public selectedQuotation: any = {};
  public woSubContractorForm: FormGroup;
  public supplierList: any[] = [];
  filteredContractors: Observable<string[]>;
  public servicesList: any[] = [];
  filteredservices: Observable<string[]>;
  public repeatList: any[] = [];
  filteredScheduleRepeat: Observable<string[]>;
  public submitted: boolean = false;
  public minDate = new Date();
  public totalPayErr: boolean = false;
  public errMsg: string = "";
  public isError: boolean = false;
  public isBack: boolean = false;
  public isEdit: boolean = false;
  public is_after: boolean = false;
  public newWO: boolean = false;
  public pageVariables: any = {
    costOfOrder: 0,
    subTotal: 0,
    taxes: 0,
    totalCost: 0,
    totalPaymentAmount: 0
  };
  public scheduleType: string = "once";
  public today: number = Date.now();
  public pageData: any;
  backupServicesList: any[] = [];

  public WOSubContractorObj: any = {};
  autoNumber: number;
  public settings: any;
  public default_tax_rate: any;
  constructor(
    public dialog: MatDialog,
    private fb: FormBuilder,
    public util: UtilService,
    public constant: ConstantsService,
    private global: GlobalService,
    private http: HttpService,
    private router: Router,
    private ref: ApplicationRef,
    public WOService: WorkOrderService,
    public route: ActivatedRoute
  ) {
    console.log("CREATE_WO", JSON.stringify(localStorage.getItem("CREATE_WO")));
    if (localStorage.getItem("USER")) {
      this.userInfo = JSON.parse(atob(localStorage.getItem("USER")));
      console.log("this.userInfo", this.userInfo);
    }
    if (localStorage.getItem("CREATE_WO")) {
      this.WOSubContractorObj = JSON.parse(localStorage.getItem("CREATE_WO"));
      if (this.WOSubContractorObj.WO_TYPE == "Internal Contractor") {
        this.selectedQuotation.client_name = "Internal Work";
        this.selectedQuotation.workLocation = this.WOSubContractorObj.repairInfo.defaultLocation;
        this.selectedQuotation.client_work_location_id = this.WOSubContractorObj.repairInfo.location_id;
        if (this.WOSubContractorObj.assetsDetails) {
          this.WOSubContractorObj.assetsDetails.manf_name = this.WOSubContractorObj.assetsDetails.manf_detail.manf_name;
          this.WOSubContractorObj.assetsDetails.short_name = this.WOSubContractorObj.assetsDetails.manf_part_detail.short_name;
          this.WOSubContractorObj.assetsDetails.full_name = this.WOSubContractorObj.assetsDetails.manf_part_detail.full_name;
          this.WOSubContractorObj.assetsDetails.asset_details = this
            .WOSubContractorObj.assetsDetails.mainetenance_req
            ? this.WOSubContractorObj.assetsDetails.mainetenance_req
                .maintenance_details
            : "";
        }
      } else if (this.WOSubContractorObj.WO_TYPE == "External Contractor") {
        this.selectedQuotation = JSON.parse(
          sessionStorage.getItem("woSetupData")
        );
        console.log("External Contractor", this.selectedQuotation);
        this.newWO = true;
        this.selectedQuotation.schedules.scheduling_id = this.selectedQuotation.schedules.pe_schedule_id;
        this.selectedQuotation.client_name = this.selectedQuotation
          .client_details.company_name
          ? this.selectedQuotation.client_details.company_name
          : this.selectedQuotation.client_details.first_name +
            " " +
            this.selectedQuotation.client_details.last_name;
        // if(this.selectedQuotation.client_work_location.latitude && this.selectedQuotation.client_work_location.latitude != '0' && this.selectedQuotation.client_work_location.longitude && this.selectedQuotation.client_work_location.longitude != '0' ){
        // 	this.selectedQuotation.workLocation =  this.selectedQuotation.client_work_location.address_line_1;
        // }else{
        // 	this.selectedQuotation.workLocation =  this.selectedQuotation.client_work_location.address_line_1 +", "+(this.selectedQuotation.client_work_location.address_line_2 ? this.selectedQuotation.client_work_location.address_line_2+',' : '')+" "+(this.selectedQuotation.client_work_location.city_details.city_name ? this.selectedQuotation.client_work_location.city_details.city_name : "")+", "+(this.selectedQuotation.client_work_location.province_details.province_name ? this.selectedQuotation.client_work_location.province_details.province_name : "")+", "+(this.selectedQuotation.client_work_location.country_details.country_name ? this.selectedQuotation.client_work_location.country_details.country_name : "")+", "+this.selectedQuotation.client_work_location.postal_code;
        // }
        this.selectedQuotation.workLocation = this.util.concatenateStrings(
          this.selectedQuotation.client_work_location.address_line_2,
          this.selectedQuotation.client_work_location.address_line_1
        );
      }
      console.log(JSON.parse(sessionStorage.getItem("woSetupData")));
    }
  }

  ngOnInit() {
    this.util.menuChange({ menu: 4, subMenu: 26 });
    this.util.setPageTitle(this.route);
    this.util.setWindowHeight();
    this.util.showProcessing("processing-spinner");
    this.getContractorList();
    this.getservicesList();
    this.getScheduleRepeatList();
    this.WOSubContractorForm("0");
    this.autoNumber = this.util.getUniqueString();
    this.setDefaultTaxRate();
  }

  // Set Tax Rate
  setDefaultTaxRate() {
    this.settings = JSON.parse(atob(localStorage.getItem("USER"))).settings;
    // console.log(JSON.parse(atob(localStorage.getItem("USER"))).settings);
    for (let index = 0; index < this.settings.length; index++) {
      if (this.settings[index].setting_key == "tax_rate") {
        this.default_tax_rate = this.settings[index].setting_value;
      }
    }
  }

  getContractorEdit() {
    let self = this;
    if (sessionStorage.getItem("WO_EDIT")) {
      let editObj: any = JSON.parse(sessionStorage.getItem("WO_EDIT"));
      console.log("WO_EDIT", JSON.stringify(editObj));
      this.isEdit = true;
      if (editObj.order_type.type_id == 2) {
        self.selectedQuotation.client_id = editObj.client_id;
        self.selectedQuotation.client_name =
          editObj.client_name.client_type == "Company"
            ? editObj.client_name.company_name
            : editObj.client_name.first_name +
              " " +
              editObj.client_name.last_name;
      } else {
        self.selectedQuotation.client_name = "Internal Work";
        self.selectedQuotation.client_id = "";
        if (editObj.maintenance_asset_detail) {
          self.WOSubContractorObj.assetsDetails =
            editObj.maintenance_asset_detail;
          self.WOSubContractorObj.assetsDetails.mainetenance_req =
            editObj.maintenance_request;
          self.WOSubContractorObj.assetsDetails.manf_name =
            editObj.maintenance_asset_detail.manufacturer.manf_name;
          self.WOSubContractorObj.assetsDetails.short_name =
            editObj.maintenance_asset_detail.manf_part_detail.short_name;
          self.WOSubContractorObj.assetsDetails.full_name =
            editObj.maintenance_asset_detail.manf_part_detail.full_name;
          self.WOSubContractorObj.assetsDetails.asset_details = editObj.details;
        } else {
          self.WOSubContractorObj.assetsDetails = editObj.asset_detail;
          if (editObj.asset_detail) {
            self.WOSubContractorObj.assetsDetails.manf_name = editObj.asset_detail
              ? editObj.asset_detail.manufacturer.manf_name
              : "";
            self.WOSubContractorObj.assetsDetails.short_name = editObj.asset_detail
              ? editObj.asset_detail.manf_part_detail.short_name
              : "";
            self.WOSubContractorObj.assetsDetails.full_name = editObj.asset_detail
              ? editObj.asset_detail.manf_part_detail.full_name
              : "";
            self.WOSubContractorObj.assetsDetails.asset_details =
              editObj.details;
          }
        }
      }
      self.selectedQuotation.workLocation = editObj.work_location
        ? editObj.work_location.location_name
        : "N/A";

      self.selectedQuotation.supplier_id = editObj.suppliers.supplier_id;
      self.selectedQuotation.supplier_name = editObj.suppliers.supplier_name;

      self.selectedQuotation.work_order_id = editObj.work_order_id;
      self.selectedQuotation.project_estimate_id = editObj.project_estimate_id;
      self.selectedQuotation.work_order_type = editObj.work_order_type;
      self.selectedQuotation.work_order_date = editObj.work_order_date;
      self.selectedQuotation.work_order_no = editObj.work_order_no;
      self.selectedQuotation.supplier_id = editObj.supplier_id;
      self.selectedQuotation.client_work_location_id = editObj.work_location_id;
      self.selectedQuotation.assign_to = editObj.assign_to;
      self.selectedQuotation.cost_of_services = editObj.cost_of_services;
      //self.selectedQuotation.cost_of_services = 0;
      self.selectedQuotation.shipping_handling = editObj.shipping_and_handling;
      self.selectedQuotation.adjustment = editObj.adjustment;
      self.selectedQuotation.sub_total = editObj.subtotal;
      self.selectedQuotation.taxes = editObj.taxes;
      self.selectedQuotation.total_cost = editObj.total_cost;
      self.selectedQuotation.require_client_sign = editObj.require_client_sign;
      self.selectedQuotation.status = editObj.status;
      self.selectedQuotation.asset_details =
        editObj.order_type.type_id == 1 ? editObj.details : "";
      self.selectedQuotation.generated_by = editObj.wo_genrated_by;

      self.WOSubContractorObj.WO_TYPE =
        editObj.order_type.type_id == 2
          ? "External Contractor"
          : "Internal Contractor";
      self.WOSubContractorObj.client_work_location = editObj.work_location;
      editObj.work_location
        ? (self.WOSubContractorObj.client_work_location.address_line_1 = editObj.work_location
            ? editObj.work_location.address
            : "")
        : "";
      self.WOSubContractorObj.location_name = editObj.location_name;

      // for(let i = 0; i < editObj.wo_services.length; i++){
      // 	editObj.wo_services[i].service_defination = editObj.wo_services[i].wo_service_definition;
      // 	delete editObj.wo_services[i].wo_service_definition;
      // }
      //self.selectedQuotation.services = editObj.wo_services.filter(item => item.is_cr == '0');
      self.selectedQuotation.crServices = editObj.wo_services.filter(
        item => item.is_cr == "1"
      );
      self.selectedQuotation.services = editObj.wo_services;
      // self.selectedQuotation.services.map(item => {
      // 	self.selectedQuotation.cost_of_services += parseFloat(item.total_amount);
      // });
      //self.selectedQuotation.cost_of_services = editObj.cost_of_services;
      //self.selectedQuotation.crServices = editObj.wo_services;
      //self.selectedQuotation.services = editObj.wo_services;
      self.selectedQuotation.schedules = editObj.wo_schedule;
      self.selectedQuotation.payment_schedules = editObj.wo_payment_terms;

      console.log("selectedQuotation", self.selectedQuotation);
      this.WOSubContractorForm("1", self.selectedQuotation);
      //this.WOSubContractorForm('0');
    } else if (sessionStorage.getItem("WO_CONTRACTOR_DETAILS")) {
      this.selectedQuotation = JSON.parse(
        sessionStorage.getItem("WO_CONTRACTOR_DETAILS")
      );
      this.selectedQuotation.schedules = this.selectedQuotation.schedules[0];
      this.scheduleType =
        this.selectedQuotation.schedules.schedule_type == 1
          ? "once"
          : this.selectedQuotation.schedules.schedule_type == 2
          ? "recurring"
          : "indefinitely";
      this.WOSubContractorObj.WO_TYPE =
        this.selectedQuotation.work_order_type == 2
          ? "External Contractor"
          : "Internal Contractor";
      this.WOSubContractorObj.assetsDetails = this.selectedQuotation.assetsDetails;
      self.selectedQuotation.client_work_location_id = this.selectedQuotation.work_location_id;
      console.log("Page Data", this.selectedQuotation);
      this.isEdit = this.selectedQuotation.work_order_id ? true : false;
      this.isBack = this.selectedQuotation.work_order_id ? false : true;
      this.WOSubContractorForm("1", this.selectedQuotation);
    } else if (this.WOSubContractorObj.WO_TYPE == "External Contractor") {
      this.WOSubContractorForm("1", this.selectedQuotation);
    } else {
      this.WOSubContractorForm("0");
    }
    console.log("this.selectedQuotation", this.selectedQuotation);
  }

  //Get Contractors From Suppliers List
  getContractorList() {
    var self = this;
    try {
      this.http.doGet("suppliers", function(error: boolean, response: any) {
        self.util.hideProcessing("processing-spinner");
        if (error) {
          console.log("error", response);
        } else {
          if (response.data) {
            self.supplierList = [];
            for (let i = 0; i < response.data.length; i++) {
              self.supplierList = self.supplierList.concat(
                response.data[i].suppliers
              );
            }
            self.supplierList = self.supplierList.filter(
              item =>
                item.supplier_type.toLowerCase() == "Contractors".toLowerCase()
            );
          }
          console.log("supplierList", self.supplierList);
          self.filteredContractors = self.woSubContractorForm
            .get("supplier_name")
            .valueChanges.pipe(
              startWith(""),
              map(value => self.contractorFilter(value))
            );
        }
      });
    } catch (err) {
      this.global.addException("wo-sub-contractor", "getContractorList()", err);
    }
  }
  private contractorFilter(value: string): string[] {
    return this.supplierList.filter(option =>
      option.supplier_name
        .toLowerCase()
        .includes(value ? value.toLowerCase() : "")
    );
  }
  getSelectedContractor(contractor, event: any = false): void {
    if (event.isUserInput) {
      this.woSubContractorForm
        .get("supplier_id")
        .setValue(contractor.supplier_id);
    }
  }
  public validateContractor(event: any) {
    try {
      let contractor = event.target.value;
      if (contractor == "") {
        this.woSubContractorForm.get("supplier_id").setValue("");
        return;
      }
      let match = this.supplierList.filter(
        item => item.supplier_name.toLowerCase() == contractor.toLowerCase()
      );
      if (match.length > 0) {
        this.woSubContractorForm
          .get("supplier_id")
          .setValue(match[0].supplier_id);
        this.woSubContractorForm
          .get("supplier_name")
          .setValue(match[0].supplier_name);
      } else {
        this.woSubContractorForm.get("supplier_id").setValue("");
      }
    } catch (err) {
      this.global.addException(
        "wo-sub-contractor",
        "validateContractor()",
        err
      );
    }
  }

  //Get Service Definition List
  getservicesList() {
    var self = this;
    try {
      this.http.doGet("businessType", function(error: boolean, response: any) {
        self.util.hideProcessing("processing-spinner");
        if (error) {
          console.log("error", response);
        } else {
          console.log("response.data", response.data);
          if (response.data) {
            self.servicesList = [];
            for (let i = 0; i < response.data.length; i++) {
              for (let j = 0; j < response.data[i].services.length; j++) {
                for (
                  let k = 0;
                  k < response.data[i].services[j].serviceDefinition.length;
                  k++
                ) {
                  self.servicesList.push({
                    businessTypeId: response.data[i].businessTypeId,
                    businessType: response.data[i].businessType,
                    serviceType: response.data[i].services[j].serviceType,
                    service_definition_id:
                      response.data[i].services[j].serviceDefinition[k]
                        .service_definition_id,
                    serviceDefinition:
                      response.data[i].services[j].serviceType +
                      " (" +
                      response.data[i].services[j].serviceDefinition[k].name +
                      ")",
                    servicePrice: parseFloat(
                      response.data[i].services[j].serviceDefinition[k].price
                    )
                  });
                }
              }
            }
            console.log("self.servicesList", self.servicesList);
            self.backupServicesList = JSON.parse(
              JSON.stringify(self.servicesList)
            );
            //self.filteredservices = self.services.get('service_definition').valueChanges.pipe(startWith(''),map(value => self.serviceFilter(value)));
            self.services.at(0)
              ? self.services
                  .at(0)
                  .get("filteredService")
                  .setValue(
                    self.services
                      .at(0)
                      .get("service_definition")
                      .valueChanges.pipe(
                        startWith(""),
                        map(value => self.serviceFilter(value))
                      )
                  )
              : "";
            self.getContractorEdit();
          }
        }
      });
    } catch (err) {
      this.global.addException("wo-sub-contractor", "getservicesList()", err);
    }
  }
  private serviceFilter(value: string): string[] {
    return this.servicesList.filter(option =>
      option.serviceDefinition
        .toLowerCase()
        .includes(value ? value.toLowerCase() : "")
    );
  }

  getSelectedService(service, event: any = false, index): void {
    try {
      if (event.isUserInput) {
        this.services
          .at(index)
          .get("service_definition_id")
          .setValue(service.service_definition_id);
        // this.services.at(index).get('cost').setValue(service.servicePrice);
        let totalAmt =
          this.services.at(index).get("cost").value *
          this.services.at(index).get("quantity").value;
        this.services
          .at(index)
          .get("total_amount")
          .setValue(totalAmt);
        //this.calculateTotalServicesAmount();
        this.addValidation(this.services, index);
        this.removeServiceFormList(
          service.service_definition_id,
          "service_definition_id",
          this.servicesList
        );
      }
    } catch (err) {
      this.global.addException(
        "wo-sub-contractor",
        "getSelectedService()",
        err
      );
    }
  }
  public validateService(event: any, item: any, index) {
    let service = event.target.value;

    try {
      if (service == "") {
        let checkOccurance = this.servicesList.filter(
          listItem =>
            listItem.service_definition_id ==
            item.get("service_definition_id").value
        );
        item.get("service_definition_id").value != "" &&
        checkOccurance.length == 0
          ? this.backupServicesList.filter(
              listItem =>
                listItem.service_definition_id ==
                item.get("service_definition_id").value
            )[0]
            ? this.servicesList.push(
                this.backupServicesList.filter(
                  listItem =>
                    listItem.service_definition_id ==
                    item.get("service_definition_id").value
                )[0]
              )
            : ""
          : "";
        console.log(this.servicesList);
        item.get("service_definition_id").setValue("");
        for (let i = 0; i < this.services.length; i++) {
          this.services.at(i).get("service_definition_id").value == ""
            ? this.setObservable(i)
            : "";
        }
        return;
      }
      this.addValidation(this.services, index);
      let match = this.servicesList.filter(
        item => item.serviceDefinition.toLowerCase() == service.toLowerCase()
      );
      if (match.length > 0) {
        item
          .get("service_definition_id")
          .setValue(match[0].service_definition_id);
        item.get("service_definition").setValue(match[0].serviceDefinition);
        //item.get('cost').setValue(match[0].servicePrice);
        this.removeServiceFormList(
          item.get("service_definition_id").value,
          "service_definition_id",
          this.servicesList
        );
      } else {
        if (item.get("service_definition_id").value != "") {
          let serviceName = this.backupServicesList.filter(
            listItem =>
              listItem.service_definition_id ==
              item.get("service_definition_id").value
          )[0].serviceDefinition;
          if (serviceName.toLowerCase() != service.toLowerCase()) {
            let checkOccurance = this.servicesList.filter(
              listItem =>
                listItem.service_definition_id ==
                item.get("service_definition_id").value
            );
            checkOccurance.length == 0
              ? this.servicesList.push(
                  this.backupServicesList.filter(
                    listItem =>
                      listItem.service_definition_id ==
                      item.get("service_definition_id").value
                  )[0]
                )
              : "";
            item.get("service_definition_id").setValue("");
          }
        }
      }
    } catch (err) {
      this.global.addException("wo-sub-contractor", "validateService()", err);
    }
  }

  addValidation(control, index) {
    control
      .at(index)
      .get("cost")
      .setValidators([
        Validators.required,
        Validators.pattern(this.constant.AMOUNT_PATTERN)
      ]);
    control
      .at(index)
      .get("quantity")
      .setValidators([
        Validators.required,
        Validators.pattern(this.constant.AMOUNT_PATTERN)
      ]);
    control
      .at(index)
      .get("cost")
      .updateValueAndValidity();
    control
      .at(index)
      .get("quantity")
      .updateValueAndValidity();
  }

  removeServiceFormList = (id, key, list) => {
    this.servicesList = list.filter(item => item[key] != id);
    for (let i = 0; i < this.services.length; i++) {
      this.services.at(i).get("service_definition_id").value == ""
        ? this.setObservable(i)
        : "";
    }
  };

  addServiceToList = (id, key, list, backupList) => {
    list.push(backupList.filter(item => item[key] == id)[0]);
    for (let i = 0; i < this.services.length; i++) {
      this.services.at(i).get("service_definition_id").value == ""
        ? this.setObservable(i)
        : "";
    }
  };

  calculateTotal(event: any, item: any, index) {
    let service = event.target.value;
    try {
      //console.log(service);
      if (service == "") {
        item.get("total_amount").setValue(0);
      } else {
        // @mohini changes start
        // if (item.get("cost").value != "" && item.get("quantity").value != "") {
          if (item.get("cost").value != "") {
            // @mohini changes start
          let totalAmt =
            parseFloat(item.get("cost").value) *
            parseFloat(item.get("quantity").value);
          item.get("total_amount").setValue(totalAmt);
        }
      }
      this.util.removeCommas(item.get("cost"));
      this.calculateTotalServicesAmount();
    } catch (err) {
      this.global.addException("wo-sub-contractor", "calculateTotal()", err);
    }
  }
  // clearService(amount) {
  //     try {
  //         this.woSubContractorForm.get('services_amount').setValue(this.woSubContractorForm.get('services_amount').value > amount ? this.woSubContractorForm.get('services_amount').value - amount : 0);
  //     } catch (err) {
  //         this.global.addException('wo-sub-contractor', 'clearService()', err);
  //     }
  // }

  clearService(service, amount) {
    try {
      this.woSubContractorForm
        .get("services_amount")
        .setValue(
          this.woSubContractorForm.get("services_amount").value > amount
            ? this.woSubContractorForm.get("services_amount").value - amount
            : 0
        );
      service.get("service_definition_id").value != ""
        ? this.addServiceToList(
            service.get("service_definition_id").value,
            "service_definition_id",
            this.servicesList,
            this.backupServicesList
          )
        : "";
    } catch (err) {
      this.global.addException("Clear Service", "clearService()", err);
    }
  }

  calculateTotalServicesAmount() {
    try {
      //let totalServiceAmt: number = this.isEdit ? parseFloat(this.selectedQuotation.cost_of_services) : 0;
      let totalServiceAmt: number = 0;
      for (let i = 0; i < this.services.length; i++) {
        totalServiceAmt =
          totalServiceAmt +
          parseFloat(this.services.at(i).get("total_amount").value);
      }
      this.woSubContractorForm.get("services_amount").setValue(totalServiceAmt);
      this.costs
        .at(0)
        .get("cost_of_services")
        .setValue(totalServiceAmt);
      this.calculateSubTotal();
    } catch (err) {
      this.global.addException(
        "wo-sub-contractor",
        "calculateTotalServicesAmount()",
        err
      );
    }
  }
  public changeSchedule(type) {
    console.log(type);
    this.scheduleType = type;
    if (type == "once") {
      this.schedules
        .at(0)
        .get("schedule_type")
        .setValue(1);
    } else if (type == "recurring") {
      this.schedules
        .at(0)
        .get("schedule_type")
        .setValue(2);
    } else {
      this.schedules
        .at(0)
        .get("schedule_type")
        .setValue(3);
    }
  }
  startDateChange(event, index) {
    this.schedules
      .at(index)
      .get("end_date")
      .setValue("");
  }

  getScheduleRepeatList() {
    let self = this;
    try {
      this.http.doGet("getCommonStatus/SCHEDULE_REPEAT", function(
        error: boolean,
        response: any
      ) {
        self.util.hideProcessing("processing-spinner");
        if (error) {
          self.repeatList = [];
        } else {
          self.repeatList = [];
          self.repeatList = response.data.statusList;
          console.log("getScheduleRepeatList", response.data, self.repeatList);
        }
        self.filteredScheduleRepeat = self.schedules
          .at(0)
          .get("schedule_repeat_name")
          .valueChanges.pipe(
            startWith(""),
            map(value => self.repeatFilter(value))
          );
      });
    } catch (err) {
      this.global.addException(
        "Schedule Repeat List",
        "getScheduleRepeatList()",
        err
      );
    }
  }
  getSelectedRepeat(repeat, event: any): void {
    if (event.isUserInput) {
      console.log(repeat);
      this.schedules
        .at(0)
        .get("schedule_repeat")
        .setValue(repeat.type_id);
    }
  }
  private repeatFilter(value: string): string[] {
    return this.repeatList.filter(option =>
      option.status.toLowerCase().includes(value ? value.toLowerCase() : "")
    );
  }

  public validateRepeat(event: any) {
    try {
      let repeat = event.target.value;
      let match = this.repeatList.filter(
        item => item.status.toLowerCase() == repeat.toLowerCase()
      );
      console.log(match);
      if (repeat == "") {
        this.schedules
          .at(0)
          .get("schedule_type")
          .setValue("");
        return;
      }
      if (match.length > 0) {
        this.schedules
          .at(0)
          .get("schedule_type")
          .setValue(match[0].type_id);
        this.schedules
          .at(0)
          .get("schedule_repeat_name")
          .setValue(match[0].status);
      }
    } catch (err) {
      this.global.addException("wo-sub-contractor", "validateRepeat()", err);
    }
  }
  changeOccrence(type) {
    this.is_after = false;
    if (type == "after") {
      this.is_after = true;
      //this.end_date.setValidators([]);
    }
    //else{
    //this.end_date.setValidators([Validators.required]);
    //}

    this.schedules
      .at(0)
      .get("end_after_occurences")
      .setValue("");
    this.schedules
      .at(0)
      .get("end_date")
      .setValue("");
  }

  WOSubContractorForm(option, data: any = {}) {
    console.log("form", option, data);
    this.woSubContractorForm = this.fb.group({
      work_order_id: new FormControl(
        option == "0" ? "" : data.work_order_id ? data.work_order_id : ""
      ),
      supplier_id: new FormControl(
        option == "0" ? "" : data.supplier_id ? data.supplier_id : "",
        [Validators.required]
      ),
      supplier_name: new FormControl(
        option == "0" ? "" : data.supplier_name ? data.supplier_name : "",
        [Validators.required]
      ),
      services_amount: new FormControl(
        option == "1" ? data.services_amount : 0,
        []
      ),
      schedules: this.fb.array([]),
      services: this.fb.array([]),
      costs: this.fb.array([]),
      payment_schedules: this.fb.array([]),
      asset_details: new FormControl(option == "0" ? "" : data.asset_details)
    });
    if (option == "1") {
      // for (var i = 0; i < data.services.length; i++) {
      //              this.addServices(option, data.services[i]);
      //              this.removeServiceFormList(data.services[i].service_definition_id, 'service_definition_id', this.servicesList);
      // }

      if (!this.isEdit) {
        // if(parseFloat(data.materialsDetails[i].quantity) > 0){
        for (var i = 0; i < data.services.length; i++) {
          if (parseFloat(data.services[i].quantity) > 0) {
            this.addServices(option, data.services[i]);
            this.removeServiceFormList(
              data.services[i].service_definition_id,
              "service_definition_id",
              this.servicesList
            );
          }
        }
      } else {
        for (var i = 0; i < data.services.length; i++) {
          this.addServices(option, data.services[i]);
          this.removeServiceFormList(
            data.services[i].service_definition_id,
            "service_definition_id",
            this.servicesList
          );
        }
        // for (var i = 0; i < data.crServices.length; i++) {
        // 				this.addServices(option, data.services[i]);
        // 			    this.removeServiceFormList(data.services[i].service_definition_id, 'service_definition_id', this.servicesList);
        // }
      }
      //if(this.isEdit || this.WOSubContractorObj.WO_TYPE == 'Internal Contractor'){
      if (!this.newWO || (this.newWO && this.isBack)) {
        for (var j = 0; j < data.payment_schedules.length; j++) {
          this.addPaymentSchedule(option, data.payment_schedules[j]);
        }
      } else {
        this.addPaymentSchedule(0);
      }
      data.schedules.schedule_type = 1; //This is for schedule onces/future remove this while implement recurring
      this.addScheduleItem(option, data.schedules);
      this.addCosts(option, data);
    } else {
      this.addScheduleItem(option);
      this.isEdit ? "" : this.addServices(option);
      this.addCosts(option);
      this.addPaymentSchedule(option);
      if (
        this.WOSubContractorObj.WO_TYPE == "Internal Contractor" &&
        this.WOSubContractorObj.assetsDetails
      ) {
        this.asset_details.setValue(
          this.WOSubContractorObj.assetsDetails.asset_details
        );
      }
    }
  }
  get supplier_id() {
    return this.woSubContractorForm.get("supplier_id");
  }
  get supplier_name() {
    return this.woSubContractorForm.get("supplier_name");
  }
  get asset_details() {
    return this.woSubContractorForm.get("asset_details");
  }

  get schedules(): FormArray {
    return (<FormArray>this.woSubContractorForm.get("schedules")) as FormArray;
  }
  get services(): FormArray {
    return (<FormArray>this.woSubContractorForm.get("services")) as FormArray;
  }
  get costs(): FormArray {
    return (<FormArray>this.woSubContractorForm.get("costs")) as FormArray;
  }
  get payment_schedules(): FormArray {
    return (<FormArray>(
      this.woSubContractorForm.get("payment_schedules")
    )) as FormArray;
  }

  getDaysOff(index): FormArray {
    return <FormArray>this.schedules.at(index).get("days_off");
  }

  addScheduleItem(option, formVal: any = {}) {
    console.log("schedules", formVal);
    this.minDate =
      option == "0"
        ? new Date()
        : formVal && formVal.start_date
        ? this.checkPastDate(formVal.start_date)
        : new Date();
    this.schedules.push(
      this.fb.group({
        scheduling_id: new FormControl(
          option == "1"
            ? formVal && formVal.scheduling_id
              ? formVal.scheduling_id
              : ""
            : ""
        ),
        //schedule_type_name: new FormControl(option == '0' ? '' : formVal.schedule_type_details.status, [ Validators.required ]), //Only for edit
        schedule_type: new FormControl(
          option == "0" ? 1 : formVal ? formVal.schedule_type : 1,
          [Validators.required]
        ), //Only for edit
        schedule_repeat: new FormControl(
          option == "0" ? "" : formVal ? formVal.schedule_repeat : "",
          []
        ),
        schedule_repeat_name: new FormControl(
          option == "0" ? "" : formVal ? formVal.schedule_repeat_name : "",
          []
        ),
        start_date: new FormControl(
          option == "0"
            ? ""
            : formVal
            ? formVal.start_date ? this.util.getTimeZoneDate(formVal.start_date) : ''
            : "",
          [Validators.required]
        ), //Only for review
        end_date: new FormControl(
          option == "0"
            ? ""
            : formVal
            ? formVal.end_date ? this.util.getTimeZoneDate(formVal.end_date) : ''
            : "",
          [Validators.required]
        ),
        start_time: new FormControl(
          option == "0"
            ? ""
            : formVal && formVal.start_time
            ? formVal.start_time.substring(0, 5)
            : "",
          [Validators.required, Validators.pattern(this.constant.TIME_PATTERN)]
        ), //Only for review
        start_time_format: new FormControl(
          option == "0" ? "am" : formVal ? formVal.start_time_format : "am",
          [Validators.required]
        ),
        end_time: new FormControl(
          option == "0"
            ? ""
            : formVal && formVal.end_time
            ? formVal.end_time.substring(0, 5)
            : "",
          [Validators.required, Validators.pattern(this.constant.TIME_PATTERN)]
        ),
        end_time_format: new FormControl(
          option == "0" ? "am" : formVal ? formVal.end_time_format : "am",
          [Validators.required]
        ),
        schedule_days: new FormControl(
          option == "0" ? [] : formVal ? formVal.schedule_days : "",
          []
        ),
        days_off: this.fb.array([]),
        end_after_occurences: new FormControl(
          option == "0" ? "" : formVal ? formVal.end_after_occurences : "",
          []
        )
      })
    );
    option == "1"
      ? this.addDaysOff(
          "1",
          formVal && formVal.days_off ? formVal.days_off[0] : {}
        )
      : this.addDaysOff("0");
  }

  checkPastDate(scheduleDate): Date {
    let today = new Date().getTime();
    let sDate = new Date(scheduleDate).getTime();
    if (today <= sDate) {
      return new Date();
    } else {
      return new Date(scheduleDate);
    }
  }

  addDaysOff(option, valObj: any = {}) {
    try {
      this.getDaysOff(0).push(
        new FormGroup({
          monday: new FormControl(option == "1" ? valObj.monday : false),
          tuesday: new FormControl(option == "1" ? valObj.tuesday : false),
          wednesday: new FormControl(option == "1" ? valObj.wednesday : false),
          thursday: new FormControl(option == "1" ? valObj.thursday : false),
          friday: new FormControl(option == "1" ? valObj.friday : false),
          saturday: new FormControl(option == "1" ? valObj.saturday : false),
          sunday: new FormControl(option == "1" ? valObj.sunday : false)
        })
      );
    } catch (err) {
      this.global.addException("add Scheduling", "addDaysOff()", err);
    }
  }

  addServices(option, data: any = {}) {
    try {
      this.services.push(
        this.fb.group({
          wo_service_id: new FormControl(
            option == "1" ? (data.wo_service_id ? data.wo_service_id : "") : ""
          ),
          service_definition: new FormControl(
            option == "1" ? data.service_defination.service_definition : "",
            [Validators.required]
          ),
          service_definition_id: new FormControl(
            option == "1" ? data.service_defination.service_definition_id : ""
          ),
          ad_hoc_service: new FormControl(
            option == "1" ? data.ad_hoc_service : ""
          ),
          cost: new FormControl(
            option == "1" ? (this.isBack || this.isEdit ? data.cost : "") : "",
            [
              Validators.required,
              Validators.pattern(this.constant.AMOUNT_PATTERN)
            ]
          ),
          // cost: new FormControl(option == '1' ? data.cost : '', [Validators.required, Validators.pattern(this.constant.AMOUNT_PATTERN)]),
          quantity: new FormControl(option == "1" ? data.quantity : "", [
            Validators.required,
            Validators.pattern(this.constant.AMOUNT_PATTERN)
          ]),
          total_amount: new FormControl(
            option == "1"
              ? this.isBack || this.isEdit
                ? data.total_amount
                : 0
              : 0
          ),
          details: new FormControl(option == "1" ? data.details : ""),
          filteredService: new FormControl(new Observable<string[]>())
        })
      );
      this.setObservable(this.services.length - 1);
    } catch (err) {
      this.global.addException("WO Subcontractor", "addServices()", err);
    }
  }
  setObservable(index): void {
    this.services
      .at(index)
      .get("filteredService")
      .setValue(
        this.services
          .at(index)
          .get("service_definition")
          .valueChanges.pipe(
            startWith(""),
            map(value => this.serviceFilter(value))
          )
      );
  }

  removeService(position, service): void {
    service.get("service_definition_id").value != ""
      ? this.addServiceToList(
          service.get("service_definition_id").value,
          "service_definition_id",
          this.servicesList,
          this.backupServicesList
        )
      : "";

    this.services.removeAt(position);
    service.get("wo_service_id").value != ""
      ? this.WOService.deletedService.push(service.get("wo_service_id").value)
      : "";
    this.calculateTotalServicesAmount();
  }
  addCosts(option, data: any = {}) {
    try {
      this.costs.push(
        this.fb.group({
          cost_of_services: new FormControl(
            option == "1" ? data.cost_of_services : 0
          ),
          sub_total: new FormControl(option == "1" ? data.sub_total : 0),
          total_cost: new FormControl(option == "1" ? data.total_cost : 0),
          tax_amount: new FormControl(option == "1" ? data.tax_amount : 0),
          shipping_handling: new FormControl(
            option == "1"
              ? this.newWO && !this.isBack
                ? ""
                : data.shipping_handling
              : "",
            [Validators.pattern(this.constant.AMOUNT_PATTERN)]
          ),
          adjustment: new FormControl(
            option == "1"
              ? this.newWO && !this.isBack
                ? ""
                : data.adjustment
              : "",
            [Validators.pattern(this.constant.AMOUNT_NEG_PATTERN)]
          ),
          taxes: new FormControl(
            option == "1"
              ? this.newWO && !this.isBack
                ? this.default_tax_rate
                : data.taxes
              : this.default_tax_rate,
            [
              Validators.min(0),
              Validators.max(100),
              Validators.pattern(this.constant.AMOUNT_PATTERN)
            ]
          )
          //date_items: this.fb.array([])
        })
      );
      if (option == "1") {
        this.calculateTotalServicesAmount();
      }
      this.calculateSubTotal();
    } catch (err) {
      this.global.addException("WO Subcontractor", "addCosts()", err);
    }
  }
  addPaymentSchedule(option, data: any = {}) {
    try {
      this.payment_schedules.push(
        this.fb.group({
          wo_payment_schedule_id: new FormControl(
            option == "1"
              ? data.wo_payment_schedule_id
                ? data.wo_payment_schedule_id
                : ""
              : ""
          ),
          pe_payment_schedule_id: new FormControl(""),
          date: new FormControl(
            option == "1" ? this.util.getTimeZoneDate(data.date) : "",
            [Validators.required]
          ),
          amount_due: new FormControl(option == "1" ? data.amount_due : "", [
            Validators.required,
            Validators.pattern(this.constant.AMOUNT_PATTERN)
          ])
        })
      );
    } catch (err) {
      this.global.addException("WO Subcontractor", "addPaymentSchedule()", err);
    }
  }
  removePaySchedule(position, item) {
    try {
      //deletedPaySchedule
      item.get("wo_payment_schedule_id").value != ""
        ? this.WOService.deletedPaySchedule.push(
            item.get("wo_payment_schedule_id").value
          )
        : "";
      this.payment_schedules.removeAt(position);
      this.calculatePaymentAmount();
    } catch (err) {
      this.global.addException("WO Subcontractor", "removePaySchedule()", err);
    }
  }

  //Payment Schedule Calculations Start
  private validateSTInput(callback) {
    this.util.removeCommas(this.costs.at(0).get("shipping_handling"));
    this.util.removeCommas(this.costs.at(0).get("adjustment"));
    if (
      (this.costs.at(0).get("shipping_handling").value != "" &&
        this.costs.at(0).get("shipping_handling").value != undefined &&
        !this.constant.AMOUNT_PATTERN.test(
          this.costs.at(0).get("shipping_handling").value
        )) ||
      (this.costs.at(0).get("adjustment").value != "" &&
        this.costs.at(0).get("adjustment").value != undefined &&
        !this.constant.AMOUNT_NEG_PATTERN.test(
          this.costs.at(0).get("adjustment").value
        ))
    ) {
      return callback(false);
    }
    return callback(true);
  }
  calculateSubTotal() {
    let self = this;
    let total = 0;
    try {
      this.validateSTInput(function(response) {
        if (!response) {
          return;
        }
        //alert(self.costs.at(0).get('cost_of_services').value);
        self.pageVariables.costOfOrder = parseFloat(
          self.costs.at(0).get("cost_of_services").value
        );
        if (self.pageVariables.costOfOrder > 0) {
          var itemShip =
            self.costs.at(0).get("shipping_handling").value == null
              ? 0
              : self.costs.at(0).get("shipping_handling").value == ""
              ? 0
              : self.costs.at(0).get("shipping_handling").value;
          var itemAdjustment =
            self.costs.at(0).get("adjustment").value == null
              ? 0
              : self.costs.at(0).get("adjustment").value == ""
              ? 0
              : self.costs.at(0).get("adjustment").value;
          self.pageVariables.subTotal =
            total +
            (parseFloat(itemShip) +
              parseFloat(itemAdjustment) +
              parseFloat(self.pageVariables.costOfOrder));
          self.costs
            .at(0)
            .get("sub_total")
            .setValue(self.pageVariables.subTotal);
        } else {
          self.costs
            .at(0)
            .get("sub_total")
            .setValue(0);
          self.pageVariables.subTotal = 0;
        }
        self.calculateTaxes();
      });
    } catch (err) {
      this.global.addException("Review Quotation", "calculateSubTotal()", err);
    }
  }
  private validateTaxInput(callback) {
    try {
      if (
        this.costs.at(0).get("taxes").value != "" &&
        this.costs.at(0).get("taxes").value != undefined &&
        !this.constant.AMOUNT_PATTERN.test(this.costs.at(0).get("taxes").value)
      ) {
        return callback(false);
      }
      return callback(true);
    } catch (err) {
      this.global.addException("WO Subcontractor", "validateTaxInput()", err);
    }
  }
  calculateTaxes() {
    let self = this;
    console.log(self.pageVariables);
    try {
      this.validateTaxInput(function(response) {
        if (!response) {
          return;
        }

        if (
          self.costs.at(0).get("taxes").value != "" &&
          self.costs.at(0).get("sub_total").value > 0
        ) {
          var itemTax =
            self.costs.at(0).get("taxes").value == null
              ? 0
              : self.costs.at(0).get("taxes").value;
          self.pageVariables.taxes = (
            (parseFloat(itemTax) / 100) *
            parseFloat(self.pageVariables.subTotal)
          ).toFixed(2);
          self.costs
            .at(0)
            .get("tax_amount")
            .setValue(self.pageVariables.taxes);
          self.pageVariables.totalCost =
            parseFloat(self.pageVariables.taxes) +
            parseFloat(self.pageVariables.subTotal);
          self.pageVariables.totalCost = self.pageVariables.totalCost.toFixed(
            2
          );
          self.costs
            .at(0)
            .get("total_cost")
            .setValue(
              self.pageVariables.totalCost ? self.pageVariables.totalCost : 0
            );
          self.pageVariables.taxPercent = self.costs.at(0).get("taxes").value;
        } else {
          self.pageVariables.taxes = 0;
          self.costs
            .at(0)
            .get("tax_amount")
            .setValue(0);
          self.pageVariables.totalCost =
            parseFloat(self.pageVariables.taxes) +
            parseFloat(self.pageVariables.subTotal);
          self.costs
            .at(0)
            .get("total_cost")
            .setValue(
              self.pageVariables.totalCost ? self.pageVariables.totalCost : 0
            );
        }
        self.pageVariables.remainingPaymentAmount =
          self.pageVariables.totalCost;
        self.calculatePaymentAmount();
      });
    } catch (err) {
      this.global.addException("WO SubContractor", "calculateTaxes()", err);
    }
  }
  private validatePaymentInput(callback) {
    try {
      for (let i = 0; i < this.payment_schedules.value.length; i++) {
        this.util.removeCommas(this.payment_schedules.at(i).get("amount_due"));
        if (
          !this.constant.AMOUNT_PATTERN.test(
            this.payment_schedules.value[i].amount_due
              ? this.payment_schedules.value[i].amount_due
              : 0
          )
        ) {
          return callback(false);
        }
      }
      return callback(true);
    } catch (err) {
      this.global.addException(
        "WO Subcontractor",
        "validatePaymentInput()",
        err
      );
    }
  }
  calculatePaymentAmount() {
    let self = this;
    try {
      this.validatePaymentInput(function(response) {
        if (!response) {
          return;
        }
        let total: any = 0.0;
        for (let i = 0; i < self.payment_schedules.value.length; i++) {
          var payAmt: any =
            self.payment_schedules.value[i].amount_due == null ||
            self.payment_schedules.value[i].amount_due == ""
              ? 0
              : parseFloat(self.payment_schedules.value[i].amount_due);
          total = parseFloat(total) + parseFloat(payAmt);
          console.log("total ::::::", total);
          console.log("total toFixed ::::::", total.toFixed(2));
          if (
            parseFloat(self.pageVariables.totalCost) > total.toFixed(2) &&
            total.toFixed(2) > 0
          ) {
            self.totalPayErr = true;
            self.errMsg = "Total payment amount is less than Total cost.";
            //self.errMsg = 'Total payment amount should not exceed Total cost.'
          } else {
            self.totalPayErr = false;
            self.errMsg = "";
          }
        }
        self.pageVariables.totalPaymentAmount = total.toFixed(2);
        self.pageVariables.remainingPaymentAmount = (self.pageVariables
          .totalCost == "XXXX"
          ? 0
          : parseFloat(self.pageVariables.totalCost) - total
        ).toFixed(2);
      });
    } catch (err) {
      this.global.addException(
        "WO Subcontractor",
        "calculatePaymentAmount()",
        err
      );
    }
  }
  //Payment Schedule Calculations End

  createExtWorkOrder(form: FormGroup) {
    console.log(this.scheduleType);
    console.log(form.valid, form.value);
    this.submitted = true;
    this.totalPayErr = false;
    let self = this;
    try {
      if (
        parseFloat(this.pageVariables.totalPaymentAmount).toFixed(2) <
        parseFloat(this.pageVariables.totalCost).toFixed(2)
      ) {
        this.totalPayErr = true;
        this.errMsg = "Total payment amount is less than Total cost.";
        //this.errMsg = 'Total payment amount should match exactly to Total Cost.'
      } else {
        if (self.costs.at(0).get("total_cost").value <= 0) {
          for (var i = 0; i < this.payment_schedules.length; i++) {
            this.payment_schedules.removeAt(i);
          }
        }
        this.totalPayErr = false;
        this.errMsg = "";
        if (form.valid) {
          let reqObj: any = {};
          reqObj = form.value.costs[0];
          reqObj.assetsDetails = this.WOSubContractorObj.assetsDetails;
          reqObj.repairInfo = this.WOSubContractorObj.repairInfo;
          reqObj.work_order_id = form.value.work_order_id;
          reqObj.supplier_id = form.value.supplier_id;
          reqObj.supplier_name = form.value.supplier_name;
          reqObj.asset_details = form.value.asset_details;
          reqObj.schedules = form.value.schedules;
          reqObj.payment_schedules = form.value.payment_schedules;
          //reqObj.services = form.value.services.length ? form.value.services : this.selectedQuotation.services;
          reqObj.services = form.value.services;
          reqObj.project_estimate_id =
            self.selectedQuotation.project_estimate_id;
          reqObj.work_location_id =
            self.selectedQuotation.client_work_location_id;
          reqObj.client_id = self.selectedQuotation.client_id;
          reqObj.assign_to = 2;
          //reqObj.maintenance_request_id = this.WOSubContractorObj.assetsDetails.mainetenance_req ? this.WOSubContractorObj.assetsDetails.mainetenance_req.maintenance_request_id : '';
          reqObj.maintenance_request_id =
            this.WOSubContractorObj.WO_TYPE == "Internal Contractor" &&
            this.WOSubContractorObj.assetsDetails
              ? this.WOSubContractorObj.assetsDetails.mainetenance_req
                ? this.WOSubContractorObj.assetsDetails.mainetenance_req
                    .maintenance_request_id
                : ""
              : "";
          reqObj.asset_id =
            this.WOSubContractorObj.WO_TYPE == "Internal Contractor" &&
            this.WOSubContractorObj.assetsDetails
              ? this.WOSubContractorObj.assetsDetails.asset_id
              : "";
          //reqObj.details = "";
          //reqObj.is_repairing_asset = this.WOSubContractorObj.WO_TYPE == 'Internal Contractor' ? 1 : 0;
          reqObj.is_repairing_asset =
            reqObj.maintenance_request_id ||
            this.WOSubContractorObj.isRepairingAsset
              ? 1
              : 0;
          reqObj.work_order_type =
            this.WOSubContractorObj.WO_TYPE == "Internal Contractor" ? 1 : 2;
          reqObj.status = 1;
          reqObj.require_client_sign = 0;

          for (let i = 0; i < reqObj.services.length; i++) {
            delete reqObj.services[i].filteredService;
            if (reqObj.services[i].service_definition_id == "") {
              reqObj.services[i].ad_hoc_service =
                reqObj.services[i].service_definition;
            }
          }
          for (let i = 0; i < reqObj.payment_schedules.length; i++) {
            reqObj.payment_schedules[i].date = this.util.getYYYYMMDDDate(
              reqObj.payment_schedules[i].date
            );
          }
          for (let i = 0; i < reqObj.schedules.length; i++) {
            reqObj.schedules[i].start_date = this.util.getYYYYMMDDDate(
              reqObj.schedules[i].start_date
            );
            reqObj.schedules[i].end_date = this.util.getYYYYMMDDDate(
              reqObj.schedules[i].end_date
            );
          }

          //this.selectedQuotation.schedules = this.selectedQuotation.schedules[0];
          for (let i = 0; i < reqObj.services.length; i++) {
            reqObj.services[i].service_defination = {};
            reqObj.services[i].service_defination.service_definition_id =
              reqObj.services[i].service_definition_id;
            reqObj.services[i].service_defination.service_definition =
              reqObj.services[i].service_definition;
          }
          this.WOService.deletedService.map(item => {
            reqObj.services.push({
              wo_service_id: item,
              is_deleted: 1
            });
          });

          this.WOService.deletedPaySchedule.map(item => {
            reqObj.payment_schedules.push({
              wo_payment_schedule_id: item,
              is_deleted: 1
            });
          });

          reqObj.client_name = self.selectedQuotation.client_name;
          reqObj.workLocation = self.selectedQuotation.workLocation;

          // reqObj = JSON.parse(JSON.stringify(reqObj));
          // reqObj.services = JSON.stringify(reqObj.services);
          // reqObj.paymentSchedules = JSON.stringify(reqObj.paymentSchedules);
          // reqObj.schedule = JSON.stringify(reqObj.schedules);
          console.log("Request Ext WO", reqObj);
          if (this.isEdit) {
            reqObj.paymentSchedules = reqObj.payment_schedules;
            delete reqObj.payment_schedules;
            reqObj.shipping_and_handling = reqObj.shipping_handling;
            delete reqObj.shipping_handling;
            reqObj.subtotal = reqObj.sub_total;
            reqObj.schedule = reqObj.schedules;

            self.util.addSpinner("updateWO", "Update");
            this.http.doPost("WorkOrder/edit", reqObj, function(
              error: boolean,
              response: any
            ) {
              self.util.removeSpinner("updateWO", "Update");
              if (error) {
                self.totalPayErr = true;
                self.errMsg = response.message;
              } else {
                console.log("Ext Work Order Edited", response);
                localStorage.removeItem("CREATE_WO");
                sessionStorage.removeItem("WO_CONTRACTOR_DETAILS");
                self.util.showDialog(DialogComponent, response.message, [
                  "/workflow/wo/csa/work-order-list/0"
                ]);
              }
            });
          } else {
            sessionStorage.removeItem("WO_EDIT");
            sessionStorage.setItem(
              "WO_CONTRACTOR_DETAILS",
              JSON.stringify(reqObj)
            );
            this.router.navigate(["/workflow/wo/csa/wo-contractor-review"]);
          }
        }
      }
    } catch (err) {
      this.global.addException(
        "External Work Order",
        "createExtWorkOrder()",
        err
      );
    }
  }
}
