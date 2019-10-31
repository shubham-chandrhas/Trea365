import { Component, OnInit } from "@angular/core";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";
import { Router, ActivatedRoute } from "@angular/router";
import { Location } from "@angular/common";
import * as _ from "underscore";

import { HttpService } from "../../../../shared/service/http.service";
import { UtilService } from "../../../../shared/service/util.service";
import { ConstantsService } from "../../../../shared/service/constants.service";
import { GlobalService } from "../../../../shared/service/global.service";
import { ScheduleDialogComponent } from "../schedule-dialog.component";
import { DialogComponent } from "../../../../shared/model/dialog/dialog.component";

@Component({
  selector: "app-schedule-list",
  templateUrl: "./schedule-list.component.html",
  styleUrls: ["./schedule-list.component.css"]
})
export class ScheduleListComponent implements OnInit {
  public sortColumn: string = "created_at";
  public sortOrder = "DSC";
  public columnType: string = "A";
  public scheduleFor = "Person";
  public selectedRes: any;
  public ScheduleList: any[] = [];
  public ScheduleListPerson: any[] = [];
  public ScheduleListAsset: any[] = [];
  public selectedPersonSchedule: any = "";
  public selectedAssetSchedule: any = "";
  public searchTxt: string;
  public paginationKey: any;
  public listCount: number = 0;
  public errMsg: string = "";
  public isError: boolean = false;
  public successMsg: string = "";
  public isSuccess: boolean = false;
  public selectedIndex;
  public personGeneratedSearch;
  public personNameSearch;
  public personEmployeeIdSearch;
  public personAvailableSearch;
  public assetGeneratedSearch;
  public manfNameSearch;
  public manfPartNameSearch;
  public serialNoSearch;
  public assetAvailableSearch;
  public searchList;
  public scheduleType: any;
  permissionsSet: any;

  constructor(
    public dialog: MatDialog,
    public constant: ConstantsService,
    private global: GlobalService,
    private http: HttpService,
    public util: UtilService,
    public router: Router,
    private route: ActivatedRoute,
    private location: Location
  ) {
    sessionStorage.removeItem("schedulingInfo");
    sessionStorage.removeItem("editSchedulingInfo");
  }

  ngOnInit() {
    let self = this;
    self.util.menuChange({ menu: 4, subMenu: 27 });
    self.paginationKey = {
      itemsPerPage: self.constant.ITEMS_PER_PAGE,
      currentPage: self.constant.CURRENT_PAGE
    };
    self.util.setWindowHeight();
    this.util.setPageTitle(this.route);
    window.scrollTo(0, 0);

    this.getScheduleList();
    this.permissionsSet = this.util.getModulePermission(118);

    this.util.changeDetection.subscribe(dataObj => {
      if (dataObj && dataObj.source == "DELETE_SCHEDULE") {
        this.getScheduleList();
        self.selectedAssetSchedule = self.selectedIndex = null;
        self.selectedPersonSchedule = self.selectedIndex = null;
        self.searchTxt = self.searchList = "";
        self.scheduleFor = "Person";
      }
    });
  }

  getScheduleList() {
    this.selectedIndex = null;
    var self = this;
    self.ScheduleList = [];
    self.ScheduleListPerson = [];
    self.ScheduleListAsset = [];
    this.util.showProcessing("processing-spinner");
    try {
      this.http.doGet("getScheduling", function(error: boolean, response: any) {
        if (error) {
          self.errMsg = response.message;
          self.isError = true;
        } else {
          self.ScheduleList = response.data;
          console.log(response.data);
          for (let i = 0; i < response.data.length; i++) {
            if (response.data[i].scheduling_type == 1) {
              response.data[i].serial_no = response.data[i].asset_detail
                ? response.data[i].asset_detail.serial_no
                : "-";
              response.data[i].status =
                response.data[i].is_available == 0
                  ? "Available"
                  : "Unavailable";
              response.data[i].manf_name = response.data[i].asset_detail
                ? response.data[i].asset_detail.manufacturer
                  ? response.data[i].asset_detail.manufacturer.manf_name
                  : "-"
                : "-";
              response.data[i].manf_part_name = response.data[i].asset_detail
                ? response.data[i].asset_detail.manf_part_detail
                  ? response.data[i].asset_detail.manf_part_detail.short_name
                  : "-"
                : "-";
              self.ScheduleListAsset.push(response.data[i]);
            } else if (response.data[i].scheduling_type == 2) {
              response.data[i].status =
                response.data[i].is_available == 0
                  ? "Available"
                  : "Unavailable";

              // Check For Null in Last Name
              if (response.data[i].wo_team_member) {
                response.data[i].wo_team_member.last_name =
                  response.data[i].wo_team_member.last_name !== null
                    ? response.data[i].wo_team_member.last_name
                    : "";
              }
              response.data[i].first_name = response.data[i].wo_team_member
                ? response.data[i].wo_team_member.first_name +
                  " " +
                  response.data[i].wo_team_member.last_name
                : "-";
              response.data[i].employee_id = response.data[i].wo_team_member
                ? response.data[i].wo_team_member.employee_id
                  ? response.data[i].wo_team_member.employee_id
                  : "-"
                : "-";
              self.ScheduleListPerson.push(response.data[i]);
            }
            // response.data[i].formatedDate = self.util.getFormatedDate(
            //   response.data[i].created_at
            // );
            // @Mohini changes start
            response.data[i].formatedDate =
              response.data[i].generated_at !== null
                ? self.util.getFormatedDate(response.data[i].generated_at)
                : self.util.getFormatedDate(response.data[i].created_at);
            // @Mohini changes end
          }
          self.constant.ITEM_COUNT = response.data.length;
          self.util.hideProcessing("processing-spinner");

          self.route.snapshot.paramMap.get("id") != "0"
            ? self.showScheduleDetails()
            : "";
          console.log(
            "lst of schedules=",
            JSON.stringify(self.ScheduleListPerson)
          );
          console.log(self.ScheduleListAsset);
        }
      });
    } catch (err) {
      this.global.addException("Error Log", "constructor()", err);
    }
  }

  changeScheduleFor(schedule) {
    this.scheduleFor = schedule;

    this.searchTxt = "";
    this.selectedPersonSchedule = "";
    this.selectedAssetSchedule = "";
    this.selectedIndex = null;
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

  sortList(columnName: string) {
    this.sortColumn = columnName;

    if (this.sortColumn === columnName) {
      if (this.sortOrder === "ASC") this.sortOrder = "DSC";
      else this.sortOrder = "ASC";
    } else {
      this.sortOrder = "ASC";
    }
  }
  getSearchTxt(filterValue: string) {
    if (filterValue == "") {
      this.searchTxt = "";
    }
  }
  getSelectedSchedulePerson(person, index) {
    var self = this;
    console.log("person :: ", person);
    self.selectedPersonSchedule = person;
    self.selectedAssetSchedule = "";
    self.selectedIndex = index;
    self.scheduleType = self.selectedPersonSchedule.schedule_type;
    self.location.go(
      self.location
        .path()
        .split("/")
        .splice(0, self.location.path().split("/").length - 1)
        .join("/") +
        "/" +
        person.scheduling_id
    );
    setTimeout(function() {
      self.util.scrollDown("scheduleMark");
    }, 1000);
  }

  showScheduleDetails(): void {
    let sortedList: any[] = _.sortBy(this.ScheduleList, "created_at");
    for (var i = 0; i < sortedList.length; ++i) {
      if (
        this.route.snapshot.paramMap.get("id") == sortedList[i].scheduling_id
      ) {
        if (sortedList[i].scheduling_type == "1") {
          this.scheduleFor = "Asset";
          let sortedAssetList: any[] = _.sortBy(
            this.ScheduleListAsset,
            "created_at"
          );
          for (var j = 0; j < sortedAssetList.length; j++) {
            if (
              sortedList[i].scheduling_id == sortedAssetList[j].scheduling_id
            ) {
              this.getSelectedScheduleAsset(sortedAssetList[j], j);
              break;
            }
          }
        } else {
          this.scheduleFor = "Person";
          let sortedPersonList: any[] = _.sortBy(
            this.ScheduleListPerson,
            "created_at"
          );
          for (var j = 0; j < sortedPersonList.length; j++) {
            if (
              sortedList[i].scheduling_id == sortedPersonList[j].scheduling_id
            ) {
              this.getSelectedSchedulePerson(sortedPersonList[j], j);
              break;
            }
          }
        }
        //sortedList[i].schedule_type == '1' ? (this.scheduleFor = 'Asset',this.getSelectedScheduleAsset(sortedList[i], i)) : (this.scheduleFor = 'Person',this.getSelectedSchedulePerson(sortedList[i], i));
        break;
      }
    }
  }

  getSelectedScheduleAsset(asset, index) {
    var self = this;
    self.selectedPersonSchedule = "";
    self.selectedAssetSchedule = asset;
    self.selectedIndex = index;
    self.scheduleType = self.selectedAssetSchedule.schedule_type;
    self.location.go(
      self.location
        .path()
        .split("/")
        .splice(0, self.location.path().split("/").length - 1)
        .join("/") +
        "/" +
        asset.scheduling_id
    );
    setTimeout(function() {
      self.util.scrollDown("scheduleMark");
    }, 1000);
  }

  searchSchedule(filterValue: string, filterType: string) {}

  addSchedule(option): void {
    try {
      this.router.navigate([
        "/workflow/schedule/csa/add-schedule/" + btoa(option)
      ]);
    } catch (err) {
      this.global.addException("Schedule list", "addSchedule()", err, {
        routeURL: "/workflow/schedule/csa/add-schedule/" + btoa(option)
      });
    }
  }
  Edit() {
    try {
      if (this.selectedAssetSchedule) {
        console.log("Asset", this.selectedAssetSchedule);
        sessionStorage.setItem(
          "editSchedulingInfo",
          JSON.stringify(this.selectedAssetSchedule)
        );
        this.router.navigate([
          "/workflow/schedule/csa/add-schedule/" + btoa("Asset")
        ]);
      } else {
        console.log("Person", this.selectedPersonSchedule);
        sessionStorage.setItem(
          "editSchedulingInfo",
          JSON.stringify(this.selectedPersonSchedule)
        );
        this.router.navigate([
          "/workflow/schedule/csa/add-schedule/" + btoa("Person")
        ]);
      }
    } catch (err) {
      this.global.addException("Schedule list - edit", "Edit()", err, {
        routeURL: "/workflow/schedule/csa/add-schedule/" + btoa("Asset")
      });
    }
  }
  checkAssignedAssets(): void {
    console.log("------111", this.selectedAssetSchedule);
    console.log("------222", this.selectedPersonSchedule);
    try {
      let reqObj;
      let self = this;
      var personORasset;
      // alert(self.scheduleFor);
      if (self.scheduleFor === "Asset") {
        reqObj = { scheduling_id: this.selectedAssetSchedule.scheduling_id };

        sessionStorage.setItem(
          "deleteSchedulingInfo",
          JSON.stringify(this.selectedAssetSchedule)
        );
        personORasset= this.selectedAssetSchedule.asset_detail.short_tag?this.selectedAssetSchedule.asset_detail.short_tag:'';
        // //--@ Shahebaz (Start)--
        // let data: any = {
        //   API_URL: "schedule/delete",
        //   reqObj: {
        //     scheduling_id: reqObj.scheduling_id,
        //     delete_both: 0
        //   },
        //   event: {
        //     source: "DELETE_SCHEDULE",
        //     action: "DELETE"
        //   }
        // };
        // self.util.showDialog(
        //   DialogComponent,
        //   "Are you sure you want to delete for " +
        //     this.selectedAssetSchedule.asset_detail.short_tag +
        //     " ?",
        //   [],
        //   "Delete Confirmation ?",
        //   "CONFIRMATION",
        //   data
        // );
        // //--@ Shahebaz (End)--
      } else {
        reqObj = { scheduling_id: this.selectedPersonSchedule.scheduling_id };
        sessionStorage.setItem(
          "deleteSchedulingInfo",
          JSON.stringify(this.selectedPersonSchedule)
        );
        personORasset= this.selectedPersonSchedule.first_name?this.selectedPersonSchedule.first_name:'';
        // //--@ Shahebaz (Start)--
        // let data: any = {
        //   API_URL: "schedule/delete",
        //   reqObj: {
        //     scheduling_id: reqObj.scheduling_id,
        //     delete_both: 0
        //   },
        //   event: {
        //     source: "DELETE_SCHEDULE",
        //     action: "DELETE"
        //   }
        // };
        // self.util.showDialog(
        //   DialogComponent,
        //   "Are you sure you want to delete for " +
        //     this.selectedPersonSchedule.first_name +
        //     " ?",
        //   [],
        //   "Delete Confirmation ?",
        //   "CONFIRMATION",
        //   data
        // );
        // //--@ Shahebaz (End)--
      }

      this.http.doPost("schedule/delete-check", reqObj, function(
        error: boolean,
        response: any
      ) {
        self.util.removeSpinner("next-btn", "Next");
        if (error) {
          console.log(error);
        } else {
          console.log("getSchedule === ", response.data);
          if (
            (self.scheduleFor == "Asset" &&
              response.data.persons.length == 0) ||
            (self.scheduleFor == "Person" && response.data.assets.length == 0)
          ) {
            let data: any = {
              API_URL: "schedule/delete",
              reqObj: {
                scheduling_id: reqObj.scheduling_id,
                delete_both: 0
              },
              event: {
                source: "DELETE_SCHEDULE",
                action: "DELETE"
              }
            };
            self.util.showDialog(
              DialogComponent,
              "Are you sure you want to delete schedule for "+personORasset+" ?",
              [],
              "Delete Confirmation",
              "CONFIRMATION",
              data
            );
            // self.router.navigate(['/workflow/schedule/csa/schedule-review/' + btoa(action)]);
          } else {
            let resourceName =
              self.scheduleFor == "Asset"
                ? self.selectedAssetSchedule.manf_part_name
                : self.selectedPersonSchedule.first_name;
            // let msgStr = response.data.work_orders.length > 0 ? 'work orders' : '';
            let msgStr = "";
            msgStr =
              self.scheduleFor == "Asset" && response.data.persons.length > 0
                ? msgStr + "persons"
                : msgStr;
            msgStr =
              self.scheduleFor == "Person" && response.data.assets.length > 0
                ? msgStr + "assets"
                : msgStr;
            // msgStr = self.scheduleFor == 'Person' && response.data.assets.length > 0 ? response.data.work_orders.length > 0 ? msgStr + '/assets' : msgStr + 'assets' : msgStr;
            console.log("msgStr = ", msgStr);
            self.util.showDialog(
              ScheduleDialogComponent,
              resourceName + " is assigned to the following " + msgStr + ":",
              [
                "/workflow/schedule/csa/schedule-list/" + btoa(self.scheduleFor)
              ],
              "Delete Confirmation",
              "CONFIRMATION_WITH_WARNING_2",
              { type: self.scheduleFor, details: response.data }
            );
          }
        }
      });
    } catch (err) {
      // this.global.addException('Assign Work order', 'checkAssignedWO()', err, { 'API': 'check-work-orders|POST', 'APIRequest': this.scheduleForAssetForm.value });
    }
  }
}
