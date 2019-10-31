import {
  Component,
  OnInit,
  Pipe,
  PipeTransform,
  Inject,
  ViewChildren
} from "@angular/core";
//import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";
import { Router, ActivatedRoute } from "@angular/router";
import { BehaviorSubject } from "rxjs/BehaviorSubject";
import { Location } from "@angular/common";
import * as _ from "underscore";

import { UtilService } from "../../../../shared/service/util.service";
import { ConstantsService } from "../../../../shared/service/constants.service";
import { GlobalService } from "../../../../shared/service/global.service";
import { HttpService } from "../../../../shared/service/http.service";
import { DialogComponent } from "../../../../shared/model/dialog/dialog.component";
import { OnboardingGuideDialogComponent } from "../../../../component/onboarding/onboarding-guide/onboarding-guide.component";
import { AppConfig, APP_CONFIG } from "../../../../app-config.module";

@Component({
  selector: "app-business-nature",
  templateUrl: "./business-nature.component.html",
  styleUrls: ["./business-nature.component.css"]
})
export class BusinessNatureComponent implements OnInit {
  public selectedBusinessNature: any = null;
  public action: string = "view";
  public selectedIndex: number;
  public businessNatureList: any[] = [];
  public sortColumn: string = "businessTypeId";
  public sortColumnType: string = "N";
  public sortOrder = "DSC";
  public paginationKey: any;
  public listCount: number = 0;

  public searchList: string;
  public searchTxt: string;
  public viewList: any[] = [];
  public typeSearch;
  public nameSearch;
  public definitionSearch;
  public priceSearch;
  private routeObj: any;
  permissionsSet: any;

  public onBoarding:boolean = false; 

  private extUserSource: any = new BehaviorSubject("");
  deletedUser = this.extUserSource.asObservable();
  constructor(
    @Inject(APP_CONFIG)
    private config: AppConfig,
    public util: UtilService,
    public constant: ConstantsService,
    public dialog: MatDialog,
    private router: Router,
    private route: ActivatedRoute,
    private http: HttpService,
    private global: GlobalService,
    private location: Location
  ) {}

  ngOnInit() {
    let self = this;
    this.util.showProcessing("processing-spinner");
    this.util.setWindowHeight();
    this.util.setPageTitle(this.route);
    try {
      if (this.router.url.split("/")[2] == "csa-onboarding") {
        this.util.menuChange({ menu: "guide", subMenu: "" }); //for onboarding dashboard
        this.routeObj = {
          add: "/admin/csa-onboarding/add-business-nature/" + btoa("0"),
          edit: "/admin/csa-onboarding/add-business-nature/" + btoa("1")
        };
      } else {
        this.util.menuChange({ menu: 2, subMenu: 11 });
        this.routeObj = {
          add: "/admin/csa/add-business-nature/" + btoa("0"),
          edit: "/admin/csa/add-business-nature/" + btoa("1")
        };
      }
      this.paginationKey = {
        itemsPerPage: this.constant.ITEMS_PER_PAGE,
        currentPage: this.constant.CURRENT_PAGE
      };
      this.getBusinessNatureList();
      this.permissionsSet = this.util.getModulePermission(7);
      console.log("###########" + this.permissionsSet);
      this.util.changeDetection.subscribe(dataObj => {
        if (dataObj && dataObj.source == "BUSINESS_TYPE") {
          self.getBusinessNatureList();
          self.selectedBusinessNature = null;
        }
      });
    } catch (err) {
      this.global.addException("Business Nature", "ngOnInit()", err);
    }
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

  sortList(columnName: string) {
    //this.empList = JSON.parse(JSON.stringify(this.backupList));
    this.sortColumn = columnName;

    if (this.sortColumn === columnName) {
      if (this.sortOrder === "ASC") this.sortOrder = "DSC";
      else this.sortOrder = "ASC";
    } else {
      this.sortOrder = "ASC";
    }
  }

  newBusinessType() {
    try {
      sessionStorage.removeItem("businessNature");
      this.router.navigate([this.routeObj.add]);
    } catch (err) {
      this.global.addException("Business-nature", "newBusinessType()", err);
    }
  }

  //Get Business Nature List
  getBusinessNatureList() {
    var self = this;
    try {
      this.http.doGet("businessType", function(error: boolean, response: any) {
        self.util.hideProcessing("processing-spinner");
        if (error) {
          console.log("error", response);
        } else {
          if (response.data) {
            self.businessNatureList = [];
            for (let i = 0; i < response.data.length; i++) {
              for (let j = 0; j < response.data[i].services.length; j++) {
                for (
                  let k = 0;
                  k < response.data[i].services[j].serviceDefinition.length;
                  k++
                ) {
                  self.businessNatureList.push({
                    businessTypeId: response.data[i].businessTypeId,
                    businessType: response.data[i].businessType,
                    serviceType: response.data[i].services[j].serviceType,
                    serviceDefinition:
                      response.data[i].services[j].serviceDefinition[k].name,
                    servicePrice: parseFloat(
                      response.data[i].services[j].serviceDefinition[k].price
                    )
                    // servicePrice: parseFloat(
                    //   response.data[i].services[j].serviceDefinition[k].price
                    // ).toFixed(2)
                  });
                }
              }
            }
          }

          if(self.businessNatureList.length == 0) {
            self.onBoarding = true;
          }

          self.viewList = response.data;
          self.route.snapshot.paramMap.get("id") != "0"
            ? self.showBusinessNatureDetails()
            : "";
          console.log("parsed value==", self.businessNatureList);
        }
      });
    } catch (err) {
      this.global.addException(
        "Business Nature",
        "getBusinessNatureList()",
        err
      );
    }
  }

  showBusinessNatureDetails() {
    try {
      let sortedList: any[] = _.sortBy(
        this.businessNatureList,
        "businessTypeId"
      ).reverse();
      for (var i = 0; i < sortedList.length; ++i) {
        if (
          this.route.snapshot.paramMap.get("id") == sortedList[i].businessTypeId
        ) {
          this.getSelectedBusinessNature(sortedList[i], i);
          this.selectedIndex = i;
          break;
        }
      }
    } catch (err) {
      this.global.addException(
        "Business-nature",
        "showBusinessNatureDetails()",
        err
      );
    }
  }

  getSelectedBusinessNature(businessNatureObj: any, index: number) {
    try {
      let self = this;
      this.selectedIndex = index;
      for (let i = 0; i < this.viewList.length; i++) {
        if (
          this.viewList[i].businessTypeId == businessNatureObj.businessTypeId
        ) {
          this.selectedBusinessNature = this.viewList[i];
          self.location.go(
            self.location
              .path()
              .split("/")
              .splice(0, self.location.path().split("/").length - 1)
              .join("/") +
              "/" +
              businessNatureObj.businessTypeId
          );
          setTimeout(function() {
            self.util.scrollDown("businessNatureMark");
          }, 1000);
          break;
        }
      }
    } catch (err) {
      this.global.addException(
        "Business Nature",
        "getSelectedBusinessNature()",
        err
      );
    }
  }

  editBusinessNature() {
    try {
      sessionStorage.setItem(
        "businessNature",
        JSON.stringify(this.selectedBusinessNature)
      );
      this.router.navigate([this.routeObj.edit]);
    } catch (err) {
      this.global.addException("Business Nature", "editBusinessNature()", err);
    }
  }

  deleteBusinessNatureDailog() {
    try {
      let data: any = {
        API_URL: "businessType/delete",
        reqObj: {
          businessTypeId: this.selectedBusinessNature.businessTypeId,
          companyId: this.util.getCompanyId()
        },
        event: {
          source: "BUSINESS_TYPE",
          action: "DELETE"
        }
      };
      this.util.showDialog(
        DialogComponent,
        "Are you sure you want to delete " + //@ Shahebaz - Start
        this.selectedBusinessNature.businessType + //@ Shahebaz - End
          " ?",
        [],
        "Delete Confirmation ?",
        "CONFIRMATION",
        data
      );
    } catch (err) {
      this.global.addException(
        "Business Nature",
        "deleteBusinessNatureDailog()",
        err
      );
    }
  }
  addFromCSV() {
    let route: string,
      apiEndPoint: string,
      csvTemplateUrl: string,
      redirectUrl: string;
    route = "/csa-onboarding/csv-preview/business-type";
    apiEndPoint = "nature-of-business/csv";
    csvTemplateUrl =
      this.config.domainIP + "api/download/csv/business_type.csv";
    redirectUrl = "/admin/csa/business-nature/0";

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
}
