import { Component, OnInit, Inject } from "@angular/core";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";
import { Router, ActivatedRoute } from "@angular/router";
import { Location } from "@angular/common";
import * as _ from "underscore";

import { HttpService } from "../../../../shared/service/http.service";
import { UtilService } from "../../../../shared/service/util.service";
import { ConstantsService } from "../../../../shared/service/constants.service";
import { GlobalService } from "../../../../shared/service/global.service";

import { WorkOrderDialog } from "../work-order-dialog.component";
import { DialogComponent } from "../../../../shared/model/dialog/dialog.component";
import { WorkOrderService } from "../work-order.service";
import { AppConfig, APP_CONFIG } from "../../../../app-config.module";

@Component({
  selector: "app-work-order-list",
  templateUrl: "./work-order-list.component.html",
  styleUrls: ["./work-order-list.component.css"]
})
export class WorkOrderListComponent implements OnInit {
  public sortColumn: string = "work_order_date";
  public sortOrder: string = "DSC";
  public WorkOrderList: any = "";
  public completeWOList: any[] = [];
  public WorkOrderListBackup: any = "";
  public selectedWorkOrder: any = "";
  public searchTxt: string;
  public searchList;
  public paginationKey: any;
  public listCount: number = 0;
  public errMsg: string = "";
  public isError: boolean = false;
  public successMsg: string = "";
  public isSuccess: boolean = false;
  public selectedIndex;
  public woListTab: string = "All";
  public currentDate: any;

  public statusSearch: string;
  public dateSearch: string;
  public clientSearch: string;
  public quoteNoSearch: string;
  public woNoSearch: string;
  public woTypeSearch: string;
  public assignToSearch: string;
  public appliedFilter: any = [];
  permissionsSet: any;
  columnType;
  public company_id: any;

  public onBoarding:boolean = false;

  constructor(
    public dialog: MatDialog,
    private http: HttpService,
    public util: UtilService,
    public router: Router,
    private route: ActivatedRoute,
    public constant: ConstantsService,
    private global: GlobalService,
    private location: Location,
    private woService: WorkOrderService,
    @Inject(APP_CONFIG)
    private config: AppConfig
  ) {
    sessionStorage.removeItem("WO_From_Maintenance");
    sessionStorage.removeItem("WO_EDIT");
    sessionStorage.removeItem("WO_DETAILS");
    sessionStorage.removeItem("WO_CONTRACTOR_DETAILS");
    sessionStorage.removeItem("woSetupData");
    sessionStorage.removeItem("woDetails");
    localStorage.removeItem("CREATE_WO");
  }

  ngOnInit() {
    let self = this;
    //console.log("USR ::",JSON.parse(atob(localStorage.getItem("USER"))).company_id);
    self.company_id = JSON.parse(atob(localStorage.getItem("USER"))).company_id;

    self.util.menuChange({ menu: 4, subMenu: 26 });
    self.paginationKey = {
      itemsPerPage: self.constant.ITEMS_PER_PAGE,
      currentPage: self.constant.CURRENT_PAGE
    };
    self.util.setWindowHeight();
    this.util.setPageTitle(this.route);
    this.getWorkOrderList();
    this.permissionsSet = this.util.getModulePermission(114);
    self.currentDate = self.util.getFormatedDate(new Date());
    this.woService.deletedService = [];
    this.woService.deletedProductMaterial = [];
    this.woService.deletedTeamMember = [];
    this.woService.deletedAsset = [];
    this.woService.deletedPaySchedule = [];
    this.woService.associatedAsset = [];
    this.util.changeDetection.subscribe(dataObj => {
      if (
        dataObj &&
        dataObj.source == "WORKORDER" &&
        dataObj.action == "DELETE"
      ) {
        self.getWorkOrderList(dataObj.source);
        self.selectedWorkOrder = "";
      } else if (
        dataObj &&
        dataObj.source == "WORKORDER" &&
        dataObj.action == "CANCEL"
      ) {
        self.getWorkOrderList();
        self.selectedWorkOrder = "";
      }else if (
        dataObj &&
        dataObj.source == "APPROVAL_WO" &&
        dataObj.action == "COMPLETE"
      ) {
          self.getWorkOrderList();
          self.selectedWorkOrder = "";
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

  applyFilter(filterValue: string) {}

  getWorkOrderList(option: any = "") {
    var self = this;
    self.WorkOrderList = [];
    this.util.showProcessing("processing-spinner");
    try {
      this.http.doGet("getWorkOrderList", function(
        error: boolean,
        response: any
      ) {
        self.util.hideProcessing("processing-spinner");
        if (error) {
          self.errMsg = response.message;
          self.isError = true;
        } else {
          //self.WorkOrderList = response.data.filter(wo => wo.status != 4);
          self.WorkOrderList = response.data;
          //self.completeWOList = response.data.filter(wo => wo.status == 4);
          for (let i = 0; i < response.data.length; i++) {
            // response.data[i].assignedTo = response.data[i].assign
            //   ? response.data[i].assign.status
            //   : "N/A";
            if(response.data[i].assign_to == 1)
            {
                response.data[i].assignedTo = response.data[i].wo_teams
              ? response.data[i].wo_teams.filter(team => team.is_team_leader == 1)[0] ? response.data[i].wo_teams.filter(team => team.is_team_leader == 1)[0].wo_team_member.first_name
              : "N/A" : "N/A";
            }
            else if(response.data[i].assign_to == 2)
            {
                response.data[i].assignedTo = response.data[i].suppliers
              ? response.data[i].suppliers.supplier_name
              : "N/A";
            }
            
            response.data[i].status = response.data[i].wo_status
              ? response.data[i].wo_status.status
              : "N/A";
            response.data[i].woType = response.data[i].assign
              ? response.data[i].assign.status
              : "N/A";
            response.data[i].wo_type = response.data[i].order_type
              ? response.data[i].order_type.status
              : "N/A";
            response.data[i].project_estimate_no = response.data[i].quote_number
              ? response.data[i].quote_number.project_estimate_no
              : 0;
            // response.data[i].client_name.company_name = response.data[i].client_name ? response.data[i].client_name.company_name ? response.data[i].client_name.company_name: response.data[i].client_name.first_name + ' ' +response.data[i].client_name.last_name : 'N/A';
            // Check For Last_name Null
            if (response.data[i].client_name) {
              response.data[i].client_name.last_name = response.data[i]
                .client_name
                ? response.data[i].client_name.last_name !== null
                  ? response.data[i].client_name.last_name
                  : ""
                : "";
            }

            response.data[i].company_name = response.data[i].client_name
              ? response.data[i].client_name.company_name
                ? response.data[i].client_name.company_name
                : response.data[i].client_name.first_name +
                  " " +
                  response.data[i].client_name.last_name
              : "N/A";
            response.data[i].formatedDate = self.util.getFormatedDate(
              response.data[i].work_order_date
            );
          }
          self.constant.ITEM_COUNT = response.data.length;
          self.WorkOrderListBackup = self.WorkOrderList;
          self.route.snapshot.paramMap.get("id") != "0" && option == ""
            ? self.showWODetails()
            : "";
        }

        if(self.WorkOrderList.length == 0) {
            self.onBoarding = true;
          }
      });
    } catch (err) {
      this.global.addException("Error Log", "constructor()", err);
    }
  }

  showWODetails(): void {
    let sortedList: any[] = _.sortBy(
      this.WorkOrderList,
      "work_order_date"
    ).reverse();
    for (var i = 0; i < sortedList.length; ++i) {
      this.route.snapshot.paramMap.get("id") == sortedList[i].work_order_id
        ? (this.getSelectedWorkOrder(sortedList[i], i),
          (this.selectedIndex = i))
        : "";
    }
  }

  getSelectedWorkOrder(wo, index): void {
    var self = this;
    self.selectedWorkOrder = "";
    self.errMsg = "";
    self.successMsg = "";
    this.util.showProcessing("processing-spinner");
    try {
      this.http.doGet("getWorkOrderById/" + wo.work_order_id, function(
        error: boolean,
        response: any
      ) {
        if (error) {
          console.log(response.error.error);
        } else {
          self.selectedWorkOrder = response.data;
          let changesServicesCost: any = 0;

          if(response.data.assign_to == 1)
            {
                self.selectedWorkOrder.assignedTo = self.selectedWorkOrder.wo_teams
              ? self.selectedWorkOrder.wo_teams.filter(team => team.is_team_leader == 1)[0] ? self.selectedWorkOrder.wo_teams.filter(team => team.is_team_leader == 1)[0].wo_team_member.first_name
              : "" : "";
            }
            else if(self.selectedWorkOrder.assign_to == 2)
            {
                self.selectedWorkOrder.assignedTo = self.selectedWorkOrder.suppliers
              ? self.selectedWorkOrder.suppliers.supplier_name
              : "";
            }

          self.selectedWorkOrder.pdfLink =
              self.config.pdfEndpoint +
              "work-order/" +
              self.selectedWorkOrder.wo_random_number+
              "/pdf";
            self.selectedWorkOrder.preview =
              self.config.pdfEndpoint +
              "work-order/" +
              self.selectedWorkOrder.wo_random_number;
          for (var i = 0; i < self.selectedWorkOrder.wo_services.length; i++) {
            if (
              self.selectedWorkOrder.wo_services[i].is_cr == 0 ||
              (self.selectedWorkOrder.wo_services[i].is_cr == 1 &&
                self.selectedWorkOrder.wo_services[i].is_approved == 1)
            ) {
              changesServicesCost =
                parseFloat(changesServicesCost) +
                parseFloat(self.selectedWorkOrder.wo_services[i].total_amount);
            }
          }
          self.selectedWorkOrder.cost_of_services = changesServicesCost;
          let changesProdsMatsCost: any = 0;
          for (
            var i = 0;
            i < self.selectedWorkOrder.wo_material_products.length;
            i++
          ) {
            if (
              self.selectedWorkOrder.wo_material_products[i].is_cr == 0 ||
              (self.selectedWorkOrder.wo_material_products[i].is_cr == 1 &&
                self.selectedWorkOrder.wo_material_products[i].is_approved == 1)
            ) {
              changesProdsMatsCost =
                parseFloat(changesProdsMatsCost) +
                parseFloat(
                  self.selectedWorkOrder.wo_material_products[i].total_amount
                );
            }
          }
          self.selectedWorkOrder.cost_of_product_material = changesProdsMatsCost;
          self.selectedIndex = index;
          if (self.selectedWorkOrder.wo_schedule.schedule_type == 2) {
            let arr = self.selectedWorkOrder.wo_schedule.schedule_days.split(
              ","
            );
            let days = [];
            for (let i = 0; i < arr.length; i++) {
              if (arr[i] == 1) {
                days.push(
                  i == 0
                    ? "Mon"
                    : i == 1
                    ? "Tue"
                    : i == 2
                    ? "Wed"
                    : i == 3
                    ? "Thu"
                    : i == 4
                    ? "Fri"
                    : i == 5
                    ? "Sat"
                    : "Sun"
                );
              }
            }
            self.selectedWorkOrder.wo_schedule.schedule_days = days;
          }

          for (
            let j = 0;
            j < self.selectedWorkOrder.unavailable_resources.length;
            j++
          ) {
            // Check For Last_name Null
            self.selectedWorkOrder.unavailable_resources[
              j
            ].wo_team_member.last_name =
              self.selectedWorkOrder.unavailable_resources[j].wo_team_member
                .last_name !== null
                ? self.selectedWorkOrder.unavailable_resources[j].wo_team_member
                    .last_name
                : "";

            self.selectedWorkOrder.unavailable_resources[j].resource_name =
              self.selectedWorkOrder.unavailable_resources[j].scheduling_type ==
              2
                ? self.selectedWorkOrder.unavailable_resources[j].wo_team_member
                    .first_name +
                  " " +
                  self.selectedWorkOrder.unavailable_resources[j].wo_team_member
                    .last_name
                : self.selectedWorkOrder.unavailable_resources[j].asset_detail
                    .short_tag;

            self.selectedWorkOrder.unavailable_resources[j].resource_type =
              self.selectedWorkOrder.unavailable_resources[j].scheduling_type ==
              2
                ? "Person"
                : "Asset";
          }
          self.location.go(
            "/workflow/wo/csa/work-order-list/" + wo.work_order_id
          );
          setTimeout(function() {
            self.util.scrollDown("woMark");
          }, 1000);
        }
        self.util.hideProcessing("processing-spinner");
        console.log('sch date = ', self.selectedWorkOrder);
      });
    } catch (err) {
      this.global.addException("Error Log", "constructor()", err);
    }
  }
  editWO(obj) {
    console.log('on edit data = ', obj);
    try {
      sessionStorage.removeItem("WO_DETAILS");
      sessionStorage.removeItem("WO_EDIT");
      sessionStorage.removeItem("CREATE_WO");
      localStorage.removeItem("CREATE_WO");
      // let localObj:any = obj;
      let localObj: any = obj;
      localObj.scheduleInfo = {};
      localObj.work_order_id = obj.work_order_id;
      localObj.scheduleInfo.supplier_id = obj.suppliers
        ? obj.suppliers.supplier_id
        : "";
      localObj.scheduleInfo.supplier_name = obj.suppliers
        ? obj.suppliers.supplier_name
        : "";
      localObj.scheduleInfo.schedule_items = [];
      localObj.scheduleInfo.schedule_items.push(obj.wo_schedule);

      localObj.wo_services = localObj.wo_services.filter(
        item => item.is_cr == 0 || (item.is_cr == 1 && item.is_approved != 2)
      );
      localObj.wo_material_products = localObj.wo_material_products.filter(
        item => item.is_cr == 0 || (item.is_cr == 1 && item.is_approved != 2)
      );
      localObj.assetsDetails = obj.wo_assets.filter(
        item => (
          (item.asset = item.asset_detail.short_tag),
          (item.asset_id = item.asset_detail.asset_id)
        )
      );
      localObj.assetsDetails.map(item => {
        item.is_deleted = 0;
      });
      localObj.materialsDetails = [];
      localObj.wo_material_products.map(item => {
        item.material_id = item.manf_part.manf_part_id;
        item.material_name = item.manf_part.short_name;
        item.locationType = item.location_type;
      });

      // localObj.wo_material_products = obj.wo_material_products.filter(
      //   item => (
      //     (item.material_id = item.manf_part.manf_part_id),
      //     (item.material_name = item.manf_part.short_name),
      //     (item.locationType = item.location_type)
      //   )
      // );

      localObj.wo_material_products.map(product => {
        product.wo_material_id =
          product.is_cr == 1
            ? product.pe_product_material_id
            : product.wo_material_id;
        product.prodMatLocation1 = [];
        product.isEdit = false;
        product.isLocationSet = false;
        product.is_deleted = 0;
        product.locations.map(location => {
          product.prodMatLocation1.push({
            wo_material_id:
              product.is_cr == 1
                ? product.pe_product_material_id
                : product.wo_material_id,
            pickupQuantity: location.quantity,
            //isEdit: true,
            isEdit: false,
            isLocationSet: true,
            locationType: 3, //Validators.required
            supplier_id: "",
            supplierName: "",
            mainLocation: location.pm_location.location_name,
            subLocation: location.pm_location_tag.location_tag,
            locationDetails: {},
            location_id: location.location_id,
            location_tag_id: location.location_tag_id
          });
        });
      });

      localObj.servicesDetails = [];
      localObj.wo_services.map(item => {
        item.service_defination =
          item.is_cr == 1
            ? item.service_defination
            : item.wo_service_definition;
        item.wo_service_id =
          item.is_cr == 1 ? item.pe_service_id : item.wo_service_id;
      });
      localObj.teamDetails = obj.wo_teams.filter(
        item => (
          //   console.log("Last Name::" + item.wo_team_member.last_name != ),
          (item.wo_team_member.last_name =
            item.wo_team_member.last_name !== null
              ? item.wo_team_member.last_name
              : ""),
          (item.staff =
            item.wo_team_member.first_name +
            " " +
            item.wo_team_member.last_name),
          (item.staff_id = item.wo_team_member.id)
        )
      );
      localObj.teamDetails.map(item => {
        item.is_deleted = 0;
      });
      localObj.assign = obj.assign;
      localObj.work_location = obj.work_location;

      if (obj.assign_to == 1 && !obj.client_id) {
        localObj.servicesDetails = {
          services: obj.wo_services.filter(
            item =>
              (item.service_definition =
                item.wo_service_definition.service_definition)
          )
        };
        localObj.wo_services = [];
        localObj.materialsDetails = JSON.parse(
          JSON.stringify(localObj.wo_material_products)
        );
        localObj.wo_material_products = [];
        sessionStorage.setItem("WO_EDIT", JSON.stringify(localObj));
        this.router.navigate(["/workflow/wo/csa/work-order/services"]);
      } else if (obj.assign_to == 1 && obj.client_id) {
        //localObj.servicesDetails = { services: [] };
        localObj.wo_services = obj.wo_services.filter(
          item =>
            (item.service_definition =
              item.service_defination.service_definition)
        );
        localObj.materialsDetails = JSON.parse(
          JSON.stringify(localObj.wo_material_products)
        );
        //localObj.wo_material_products = [];
        localObj.servicesDetails = {
          services: JSON.parse(JSON.stringify(localObj.wo_services))
        };
        localObj.quote_number = obj.quote_number;
        localObj.require_client_sign = obj.require_client_sign;
        sessionStorage.setItem("WO_EDIT", JSON.stringify(localObj));
        this.router.navigate(["/workflow/wo/csa/wo-external/services"]);
      } else {
        sessionStorage.setItem("WO_EDIT", JSON.stringify(localObj));

        let create_WO_Obj: any = {};
        create_WO_Obj.WO_TYPE = "Edit Contractor";
        localStorage.setItem("CREATE_WO", JSON.stringify(create_WO_Obj));
        this.router.navigate(["/workflow/wo/csa/wo-sub-contractor"]);
      }
    } catch (err) {
      this.global.addException("WO", "editWO()", err);
    }
  }
  showQuotationListPopup() {
    this.dialog.open(WorkOrderDialog, { data: { action: "quotationList" } });
  }
  getSearchTxt(filterValue: string) {
    if (filterValue == "") {
      this.searchTxt = "";
    }
  }
  changeWoList(woType) {
    this.WorkOrderList = "";
    this.woListTab = woType;
    if (this.woListTab == "All") {
      this.WorkOrderList = this.WorkOrderListBackup;
    } else if (this.woListTab == "Internal") {
      this.WorkOrderList = this.WorkOrderListBackup.filter(
        wo => wo.woType == "Staff"
      );
    } else if (this.woListTab == "Contractor") {
      this.WorkOrderList = this.WorkOrderListBackup.filter(
        wo => wo.woType == "Contractor"
      );
    } else if (this.woListTab == "Complete") {
      this.WorkOrderList = this.completeWOList;
    }
  }
  //Start WO
  startWO(obj) {
    var self = this;
    this.util.showProcessing("processing-spinner");
    try {
      this.http.doGet("work-order-start/" + obj.work_order_id + "/" + self.company_id, function(
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

            self.selectedWorkOrder = "";
            self.getWorkOrderList();
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

  //Complete WO
  completeWO(obj) {
    var self = this;
    //this.util.showProcessing("processing-spinner");
    try {
    //   this.http.doGet("work-order-complete/" + obj.work_order_id, function(
    //     error: boolean,
    //     response: any
    //   ) {
    //     self.util.hideProcessing("processing-spinner");
    //     if (error) {
    //       self.errMsg = response.message;
    //       self.isError = true;
    //     } else {
    //       if (response.status) {
    //         self.isSuccess = true;
    //         self.util.showDialog(DialogComponent, response.message);

    //         self.selectedWorkOrder = "";
    //         self.getWorkOrderList();
    //       } else {
    //         self.errMsg = response.message;
    //         self.isError = true;
    //       }
    //     }
    //   });
      this.dialog.open(WorkOrderDialog, { data: { action: "approvalConfirmation", work_order_id:  obj.work_order_id  } }); 
    } catch (err) {
      this.global.addException("Complete Work Order", "completeWO()", err);
    }
  }

  // Cancel Work Order
  cancelWO(obj) {
    try {
      let data: any = {
        API_URL: "work-order/cancel",
        reqObj: {
          work_order_id: obj.work_order_id
        },
        event: {
          source: "WORKORDER",
          action: "CANCEL"
        }
      };
      this.util.showDialog(
        DialogComponent,
        "Are you sure to Cancel Work Order?",
        [],
        "Cancel Confirmation",
        "CONFIRMATION",
        data
      );
    } catch (err) {
      this.global.addException("Error Log", "constructor()", err);
    }
  }

  //  Delete WOrk Order
  deleteWO(obj) {
    try {
      let data: any = {
        API_URL: "deleteWorkOrder",
        reqObj: {
          work_order_id: obj.work_order_id
        },
        event: {
          source: "WORKORDER",
          action: "DELETE"
        }
      };
      this.util.showDialog(
        DialogComponent,
        "Are you sure to delete Work Order No : " + obj.work_order_no + " ?", //@shahebaz (+ obj.work_order_no +)
        [],
        "Delete Confirmation",
        "CONFIRMATION",
        data
      );
    } catch (err) {
      this.global.addException("Error Log", "constructor()", err);
    }
  }

  preview(dataPreview) {
    window.open(dataPreview);
  }
  downloadPDF(dataDownload) {
    window.open(dataDownload);
  }
}
