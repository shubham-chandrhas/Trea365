import { Component, OnInit } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { Location } from "@angular/common";
import * as _ from "underscore";

import { UtilService } from "../../../shared/service/util.service";
import { AdminService } from "../../admin/admin.service";
import { ExportService } from "../../../shared/service/export.service";
import { HttpService } from "../../../shared/service/http.service";
import { ConstantsService } from "../../../shared/service/constants.service";
import { GlobalService } from "../../../shared/service/global.service";

@Component({
  selector: "app-tracker",
  templateUrl: "./tracker.component.html",
  styleUrls: ["./tracker.component.scss"]
})
export class TrackerComponent implements OnInit {
  pageData: any = {
    productMaterialList: [],
    listCount: 0,
    action: "",
    isEdit: false,
    isError: false
  };
  public sortColumn: string = "company_id";
  public sortColumnType: string = "N";
  public sortOrder: string = "ASC";
  public searchList: string;
  public searchTxt: string;
  public paginationKey: any;
  public listCount: number = 0;
  public selectedIndex: number;
  public errMsg: string = "";
  public isError: boolean = false;
  public submitted: boolean = false;
  public isEdit: boolean = false;
  public selectedProMat: any = null;
  permissionsSet: any;

  public onBoarding:boolean = false; 

  // public invSearch;
  // public minStockSearch;
  // public dateSearch;
  // public currentStockSearch;

  constructor(
    public util: UtilService,
    public constant: ConstantsService,
    private admin: AdminService,
    private http: HttpService,
    private file: ExportService,
    public router: Router,
    private route: ActivatedRoute,
    private location: Location,
    private global: GlobalService
  ) {}

  ngOnInit() {
    this.paginationKey = {
      itemsPerPage: this.constant.ITEMS_PER_PAGE,
      currentPage: this.constant.CURRENT_PAGE
    };
    this.util.setWindowHeight();
    this.util.setPageTitle(this.route);
    this.productMaterialList();
    this.util.setWindowHeight();
    this.util.menuChange({ menu: 3, subMenu: 35 });
    this.permissionsSet = this.util.getModulePermission(71);
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
  changePage(event) {
    this.paginationKey.currentPage = event;
    window.scrollTo(0, 0);
  }
  changeItemPerPage() {
    window.scrollTo(0, 0);
  }

  productMaterialList() {
    try {
      let self = this;
      this.util.showProcessing("processing-spinner");
      this.http.doGet("invtracker", function(error: boolean, response: any) {
        self.util.hideProcessing("processing-spinner");
        if (error) {
          console.log(response.message);
        } else {
          self.pageData.productMaterialList = response.data;
          console.log(
            "tracker dataaaaa 1st====",
            self.pageData.productMaterialList
          );

          for (let i = 0; i < self.pageData.productMaterialList.length; i++) {
            self.pageData.productMaterialList[i].minimumStock =
              self.pageData.productMaterialList[i].minimum_stock +
              " " +
              self.pageData.productMaterialList[i].uom_name;
            self.pageData.productMaterialList[i].currentStock =
              self.pageData.productMaterialList[i].current_stock +
              " " +
              self.pageData.productMaterialList[i].uom_name;
            self.pageData.productMaterialList[i].minStockDate = self.pageData
              .productMaterialList[i].min_stock_date
              ? self.pageData.productMaterialList[i].min_stock_date
              : "";

            self.pageData.productMaterialList[i].isHighlight =
              parseFloat(self.pageData.productMaterialList[i].minimum_stock) >=
                parseFloat(
                  self.pageData.productMaterialList[i].current_stock
                ) ||
              parseFloat(self.pageData.productMaterialList[i].current_stock) ==
                0 ||
              (self.pageData.productMaterialList[i].min_stock_date &&
                self.pageData.productMaterialList[i].min_stock_date != "")
                ? 1
                : 2;
            self.pageData.productMaterialList[i].minimum_stock = parseFloat(
              self.pageData.productMaterialList[i].minimum_stock
            );
            self.pageData.productMaterialList[i].current_stock = parseFloat(
              self.pageData.productMaterialList[i].current_stock
            );
            if (self.pageData.productMaterialList[i].min_stock_date) {
              self.pageData.productMaterialList[i].order = 3;
            } else if (
              parseFloat(self.pageData.productMaterialList[i].current_stock) ==
              0
            ) {
              self.pageData.productMaterialList[i].order = 1;
            } else if (
              parseFloat(self.pageData.productMaterialList[i].minimum_stock) >=
              parseFloat(self.pageData.productMaterialList[i].current_stock)
            ) {
              self.pageData.productMaterialList[i].order = 2;
            } else {
              self.pageData.productMaterialList[i].order = 4;
            }
          }

          if(self.pageData.productMaterialList.length == 0) {
            self.onBoarding = true;
          }

          self.route.snapshot.paramMap.get("id") != "0"
            ? self.showDetails()
            : "";
        }
        console.log("tracker dataaaaa====", self.pageData.productMaterialList);
      });
    } catch (err) {
      this.global.addException("Tracker", "productMaterialList()", err);
    }
  }

  showDetails() {
    try {
      let sortedList: any[] = _.sortBy(
        _.sortBy(this.pageData.productMaterialList, "manf_part_id").reverse(),
        "isHighlight"
      );
      for (var i = 0; i < sortedList.length; ++i) {
        if (
          this.route.snapshot.paramMap.get("id") == sortedList[i].manf_part_id
        ) {
          this.getSelectedProductMaterial(sortedList[i], i);
          this.selectedIndex = i;
          break;
        }
      }
    } catch (err) {
      this.global.addException("Tracker", "productMaterialList()", err);
    }
  }

  // sortList(columnName: string){
  //     this.sortColumn = columnName;
  //     if(this.sortColumn === columnName){
  //         if(this.sortOrder === 'ASC')
  //             this.sortOrder = 'DSC';
  //         else
  //             this.sortOrder = 'ASC';
  //     }else{
  //         this.sortOrder = 'ASC';
  //     }
  // }

  getSelectedProductMaterial(selProMatObj: any, index: number) {
    try {
      let self = this;
      this.selectedProMat = selProMatObj;
      this.isEdit = false;
      this.selectedIndex = index;
      self.location.go(
        self.location
          .path()
          .split("/")
          .splice(0, self.location.path().split("/").length - 1)
          .join("/") +
          "/" +
          selProMatObj.manf_part_id
      );
      setTimeout(function() {
        self.util.scrollDown("trackMark");
      }, 1000);
      console.log("selected product::::" + JSON.stringify(this.selectedProMat));
    } catch (err) {
      this.global.addException("Tracker", "getSelectedProductMaterial()", err);
    }
  }

  viewInventory(selProMatObj: any): void {
    try {
      this.router.navigate([
        selProMatObj.item_class_type == "Product"
          ? "/inventory/csa/product-list/"
          : "/inventory/csa/material-list/",
        selProMatObj.manf_part_id
      ]);
    } catch (err) {
      this.global.addException("Tracker", "viewInventory()", err);
    }
  }

  newPO(selProMatObj): void {
    try {
      let prodMatObj: any = {
        mfgId: selProMatObj.manf_id,
        mfgPartId: selProMatObj.manf_part_id,
        classId: selProMatObj.class_id
      };
      sessionStorage.setItem("MFG_PART_FOR_NEW_PO", JSON.stringify(prodMatObj));
      this.router.navigate(["/inventory/po/csa/new-purchase-order"]);
    } catch (err) {
      this.global.addException("Tracker", "newPO()", err);
    }
  }
}
