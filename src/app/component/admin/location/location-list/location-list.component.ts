import { Component, OnInit } from "@angular/core";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";
import { Router, ActivatedRoute } from "@angular/router";
import { Location } from "@angular/common";
import * as _ from "underscore";

import { LocationService } from "./../location.service";
import { UtilService } from "../../../../shared/service/util.service";
import { HttpService } from "../../../../shared/service/http.service";
import { ConstantsService } from "../../../../shared/service/constants.service";
import { LocationDialog } from "../location.component";
import { AdminService } from "../../admin.service";
import { DialogComponent } from "../../../../shared/model/dialog/dialog.component";
import { GlobalService } from "../../../../shared/service/global.service";
import { ExportService } from "../../../../shared/service/export.service";

@Component({
  selector: "app-location-list",
  templateUrl: "./location-list.component.html",
  styleUrls: ["./location-list.component.css"]
})
export class LocationListComponent implements OnInit {
  public sortColumn: string = "location_id";
  public sortColumnType: string = "N";
  public sortOrder: string = "DSC";
  public selectedLoc: any = null;
  public locationList: any[] = [];
  public printAllList: any[];
  public searchList: string;
  public searchTxt: string;
  public typeSearch;
  public nameSearch;
  public shortFormSearch;
  public addressSearch;
  public assetSearch;
  public paginationKey: any;
  public listCount: number = 0;
  public selectedIndex: number;
  permissionsSet: any;

  public onBoarding:boolean = false; 

  constructor(
    private router: Router,
    public util: UtilService,
    public dialog: MatDialog,
    private location: LocationService,
    private admin: AdminService,
    private http: HttpService,
    public constant: ConstantsService,
    private global: GlobalService,
    private exportDoc: ExportService,
    private route: ActivatedRoute,
    private loc: Location
  ) {}

  ngOnInit() {
    let self = this;
    this.util.setWindowHeight();
    this.util.setPageTitle(this.route);
    this.permissionsSet = this.util.getModulePermission(12);
    try {
      this.paginationKey = {
        itemsPerPage: this.constant.ITEMS_PER_PAGE,
        currentPage: this.constant.CURRENT_PAGE
      };
      this.router.url.split("/")[2] == "csa-onboarding"
        ? this.util.menuChange({ menu: "guide", subMenu: "" })
        : this.util.menuChange({ menu: 2, subMenu: 12 });
      this.getLocationList();

      this.util.changeDetection.subscribe(dataObj => {
        if (dataObj && dataObj.source == "LOCATION") {
          self.getLocationList();
          self.selectedLoc = self.selectedIndex = null;
        }
      });

      this.admin.newRecord.subscribe(status => {
        if (status) {
          self.getLocationList();
          self.selectedLoc = self.selectedIndex = null;
        }
      });
    } catch (err) {
      this.global.addException("location list", "ngOnInit()", err);
    }
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

  getLocationList() {
    let self = this;
    this.util.showProcessing("processing-spinner");
    try {
      this.location.getLocation(function(error: boolean, response: any) {
        self.util.hideProcessing("processing-spinner");
        if (error) {
        } else {
          self.locationList = response.data.filter(
            item => (
              item.location_type == "Fixed"
                ? (item.asset = "-")
                : (item.address = "-"),
              (item.asset =
                item.location_type == "Fixed"
                  ? "-"
                  : item.location_from_asset[0].short_tag)
            )
          );
          if(self.locationList.length == 0) {
            self.onBoarding = true;
          }
          self.route.snapshot.paramMap.get("id") != "0"
            ? self.showLocationDetails()
            : "";
        }
      });
    } catch (err) {
      this.global.addException("location list", "getLocationList()", err);
    }
  }

  showLocationDetails() {
    let sortedList: any[] = _.sortBy(
      this.locationList,
      "location_id"
    ).reverse();
    for (var i = 0; i < sortedList.length; ++i) {
      if (this.route.snapshot.paramMap.get("id") == sortedList[i].location_id) {
        this.getSelectedLoc(sortedList[i], i);
        this.selectedIndex = i;
        break;
      }
    }
  }

  newLocation() {
    try {
      sessionStorage.removeItem("locationDetails");
      this.router.url.split("/")[2] == "csa-onboarding"
        ? this.router.navigate(["/admin/csa-onboarding/add-location"])
        : this.router.navigate(["/admin/csa/add-location"]);
    } catch (err) {
      this.global.addException("location list", "newLocation()", err);
    }
  }

  printAll() {
    this.admin.printPreview("print-all-section");
  }

  // updatePrintTable(list){
  //   let count: number = 0, j: number = 0, labelList: any = [];
  //   this.printAllList = [];
  //   try{
  //     while(count < list.length){
  //       this.printAllList.push({'locRow': []})
  //       for (let i = 0; i < 3; i++,count++) {
  //         if(count < list.length)
  //           this.printAllList[j].locRow.push(list[count]);
  //         else
  //           return;
  //       }
  //       j++;
  //     }
  //   }catch(err){
  //     this.global.addException('location list','updatePrintTable()',err);
  //   }
  // }

  getSelectedLoc(location, index) {
    let self = this;
    this.selectedIndex = index;
    let reviewDiv: any = [];
    try {
      for (var i = 0; i < location.divisions.length; i++) {
        let divRow = [];
        for (var j = 0; j < 2; j++) {
          if (i < location.divisions.length) {
            location.divisions[i].id = i + 1;
            location.divisions[i].valArr =
              location.divisions[i].division_type == "Named"
                ? location.divisions[i].division_value.split(",")
                : [];
            divRow.push(location.divisions[i]);
          } else {
            break;
          }
          if (j == 0) {
            i++;
          }
        }
        reviewDiv.push({ row: divRow });
      }
      location.divListReview = reviewDiv;
      location.tagSample = this.createTagSample(location);
      this.selectedLoc = location;
      this.getLocationTags(location.location_id);
      self.loc.go(
        self.loc
          .path()
          .split("/")
          .splice(0, self.loc.path().split("/").length - 1)
          .join("/") +
          "/" +
          location.location_id
      );
      setTimeout(function() {
        self.util.scrollDown("locationMark");
      }, 1000);
      console.log(this.selectedLoc);
    } catch (err) {
      this.global.addException("location list", "getSelectedLoc()", err);
    }
  }

  getLocationTags(locId) {
    let self = this;
    self.util.addSpinner("showTagsBtn", "View");
    try {
      this.http.doGet("location/tag/" + locId, function(
        error: boolean,
        response: any
      ) {
        if (error) {
          console.log(response);
        } else {
          //self.updatePrintTable(response.tags);
          self.selectedLoc.tagsList = response.tags;
        }
        self.util.removeSpinner("showTagsBtn", "View");
      });
    } catch (err) {
      this.global.addException("location list", "getLocationTags()", err);
    }
  }

  createTagSample(location) {
    try {
      let nameArr = location.location_name.split(" "),
        tag: string = location.short_form;
      for (var i = 0; i < location.divisions.length; i++) {
        if (location.divisions[i].division_type == "Named") {
          tag =
            tag +
            "-" +
            location.divisions[i].division_value.split(",")[0].toUpperCase();
        } else {
          tag = tag + "-" + ("00" + location.divisions[i].min).substr(-2, 2);
        }
      }
      return tag.toUpperCase();
    } catch (err) {
      this.global.addException("location list", "createTagSample()", err);
    }
  }
  showTagsDialog() {
    this.dialog.open(LocationDialog, {
      data: {
        action: "updateTag",
        tagsList: this.selectedLoc.tagsList,
        locName: this.selectedLoc.location_name
      }
    });
  }

  showPrintDialog() {
    this.dialog.open(LocationDialog, {
      data: {
        action: "printLocation",
        tagsList: this.selectedLoc.tagsList,
        locName: this.selectedLoc.location_name
      }
    });
  }

  showDeleteDialog(locId) {
    let data: any = {
      API_URL: "location/delete",
      reqObj: {
        id: this.selectedLoc.location_id
      },
      event: {
        source: "LOCATION",
        action: "DELETE"
      }
    };
    this.util.showDialog(
      DialogComponent,
      "Are you sure you want to delete " + //@ Shahebaz - Start
      this.selectedLoc.location_name + //@ Shahebaz - End
        " ?",
      [],
      "Delete Confirmation ?",
      "CONFIRMATION",
      data
    );
  }

  exportLocAsPdf() {
    this.exportDoc.generateLandscapepdf("locTbl", "Location List", "locations");
  }
  exportLocAsCSV() {
    this.exportDoc.generatecsv("locTbl", "locations");
  }
}
