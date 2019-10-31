import { Component, OnInit } from "@angular/core";
import { Chart } from "chart.js";

import { UtilService } from "../../../../shared/service/util.service";
import { DashboardService } from "../../dashboard.service";
import { HttpService } from "../../../../shared/service/http.service";
import { GlobalService } from "../../../../shared/service/global.service";
import { ConstantsService } from "../../../../shared/service/constants.service";
import { Router, ActivatedRoute } from "@angular/router";
declare var $: any;

@Component({
  selector: "app-summary",
  templateUrl: "./summary.component.html",
  styleUrls: ["./summary.component.css"]
})
export class SummaryComponent implements OnInit {
  public screenHeight: any;
  public chartData: any = {};
  public pageData: any = { dashboard: null };

  adminTimeLineData: any = {
    seven: false,
    fourteen: false,
    thirty: true,
    ninty: false,
    threesixtyfive: false,
    seventhirty: false
  };
  inventoryTimeLineData: any = {
    seven: false,
    fourteen: false,
    thirty: true,
    ninty: false,
    threesixtyfive: false,
    seventhirty: false
  };
  workflowTimeLineData: any = {
    seven: false,
    fourteen: false,
    thirty: true,
    ninty: false,
    threesixtyfive: false,
    seventhirty: false
  };
  crmTimeLineData: any = {
    seven: false,
    fourteen: false,
    thirty: true,
    ninty: false,
    threesixtyfive: false,
    seventhirty: false
  };
  hrTimeLineData: any = {
    seven: false,
    fourteen: false,
    thirty: true,
    ninty: false,
    threesixtyfive: false,
    seventhirty: false
  };
  financialsTimeLineData: any = {
    seven: false,
    fourteen: false,
    thirty: true,
    ninty: false,
    threesixtyfive: false,
    seventhirty: false
  };

  constructor(
    public util: UtilService,
    public constant: ConstantsService,
    public dashboard: DashboardService,
    // public dialog: MatDialog,
    private router: Router,
    // private fb: FormBuilder,
    private http: HttpService,
    private global: GlobalService,
    public route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.util.menuChange({ menu: 1000, subMenu: 9000 });
    this.util.setPageTitle(this.route);
    let headerHeight = $(".main-header").height();
    let footerHeight = $(".main-footer").height();
    this.screenHeight = window.innerHeight - headerHeight - headerHeight - 6;
    $(".content-wrapper").css("min-height", this.screenHeight + "px");
    this.getAdminData("all", "30");
    this.chartData.auData = {
      label: "Asset Utilization",
      data: [0, 100],
      backgroundColor: [
        "#01a89e", //fill color
        "#f6f6f6" //empty color
      ]
    };

    this.chartData.wosData = {
      label: "Total Work Orders Schedule",
      data: [1, 99],
      backgroundColor: [
        "#1e3346", //fill color
        "#f6f6f6" //empty color
      ]
    };

    this.chartData.wocData = {
      label: "Work Orders Completed",
      data: [2, 98],
      backgroundColor: [
        "#01a89e", //fill color
        "#f6f6f6" //empty color
      ]
    };

    // this.chartData.cgrData = {
    //     "labels":["2013","2014","2015","2016","2017"],
    // 	"datasets":[{
    // 		"label":"Company Growth Rate",
    // 		"data":[250000,800000,600000,1800000,1700000],
    // 		"fill":false,
    // 		"borderColor":"#01a89e",
    // 		"lineTension":0.4
    // 	}]
    // }
    //this.util.getRole() == 2 || this.util.checkModuleAccess(148)?this.dashboard.createLineChart('cgrChart',this.chartData.cgrData):'';
  }

  // Admin Summary service : Neha
  getAdminData(module, days) {
    let self = this;
    self.util.showProcessing("processing-spinner");
    try {
      let url = "dashboard-summary/" + module + "/" + days;
      this.http.doGet(url, function(error: boolean, response: any) {
        self.util.hideProcessing("processing-spinner");
        if (error) {
          console.log(response);
        } else {
          if (module == "all") {
            self.pageData.dashboard = response.data;
          } else if (module == "admin") {
            self.pageData.dashboard.admin = response.data.admin;
          } else if (module == "inventory") {
            self.pageData.dashboard.inventory = response.data.inventory;
          } else if (module == "workflow") {
            self.pageData.dashboard.workflow = response.data.workflow;
          } else if (module == "crm") {
            self.pageData.dashboard.crm = response.data.crm;
          } else if (module == "hr") {
            self.pageData.dashboard.hr = response.data.hr;
          } else if (module == "financials") {
            self.pageData.dashboard.financials = response.data.financials;
          }

          self.util.getRole() == 2 || self.util.checkModuleAccess(115)
            ? self.dashboard.createDoughnutChart(
                "wocChart",
                self.chartData.wocData
              )
            : "";
          self.util.getRole() == 2 || self.util.checkModuleAccess(76)
            ? self.dashboard.createDoughnutChart(
                "auChart",
                self.chartData.auData
              )
            : "";
          self.util.getRole() == 2 || self.util.checkModuleAccess(115)
            ? self.dashboard.createDoughnutChart(
                "wosChart",
                self.chartData.wosData
              )
            : "";
          //   self.util.getRole() == 2 || self.util.checkModuleAccess(148)
          //     ? self.dashboard.createLineChart("cgrChart", self.chartData.cgrData)
          //     : "";
        }
        // console.log("ADMINDATA =",self.pageData.dashboard );
      });
    } catch (err) {
      this.global.addException("admin data list", "getAdminData()", err);
    }
  }
  timeLineChangeSummary(event, id, module, timeLineData) {
    console.log(id, event);
    timeLineData.seven = id == "seven" ? true : false;
    timeLineData.fourteen = id == "fourteen" ? true : false;
    timeLineData.thirty = id == "thirty" ? true : false;
    timeLineData.ninty = id == "ninty" ? true : false;
    timeLineData.threesixtyfive = id == "threesixtyfive" ? true : false;
    timeLineData.seventhirty = id == "seventhirty" ? true : false;
    //console.log('Neha Data');
    //console.log(timeLineData);
    //console.log(event.target.value);
    this.getAdminData(module, event.target.value);
  }
}
