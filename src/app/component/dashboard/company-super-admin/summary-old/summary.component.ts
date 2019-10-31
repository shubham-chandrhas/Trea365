import { Component, OnInit } from '@angular/core';
import {Chart} from 'chart.js';

import { UtilService } from '../../../../shared/service/util.service';
import { DashboardService } from '../../dashboard.service';

declare var $ :any;

@Component({
    selector: 'app-summary1',
    templateUrl: './summary.component.html',
    styleUrls: ['./summary.component.css']
})
export class OldSummaryComponent implements OnInit {

    public screenHeight:any;
    public chartData:any ={};

    constructor(
        public util: UtilService,
        // public constant: ConstantsService,
        public dashboard: DashboardService,
        // public dialog: MatDialog,
        // private router: Router,
        // private fb: FormBuilder,
        // private http: HttpService,
        // private global: GlobalService
    ) { }

    ngOnInit() {
        this.util.menuChange({'menu':1,'subMenu':9});
        let headerHeight = $(".main-header").height();
		let footerHeight = $(".main-footer").height();
		this.screenHeight = window.innerHeight - headerHeight - headerHeight - 6;
		$(".content-wrapper").css("min-height", this.screenHeight+"px");
        
        this.chartData.auData = {
            "label":"Asset Utilization",
            "data":[75,25],
            "backgroundColor":[
                "#01a89e", //fill color
                "#f6f6f6" //empty color
            ]
        }
        this.dashboard.createDoughnutChart('auChart',this.chartData.auData);

        this.chartData.wosData = {
            "label":"Work Orders Schedule",
            "data":[80,20],
            "backgroundColor":[
                "#1e3346", //fill color
                "#f6f6f6" //empty color
            ]
        }
        this.dashboard.createDoughnutChart('wosChart',this.chartData.wosData);

        this.chartData.wocData = {
            "label":"Work Orders Completed",
            "data":[100,0],
            "backgroundColor":[
                "#01a89e", //fill color
                "#f6f6f6" //empty color
            ]
        }
        this.dashboard.createDoughnutChart('wocChart',this.chartData.wocData);

        this.chartData.lcData = {
            "label":"Leads/Closures",
            "data":[75,25],
            "backgroundColor":[
                "#01a89e", //fill color
                "#f6f6f6" //empty color
            ]
        }
        this.dashboard.createDoughnutChart('lcChart',this.chartData.lcData);

        this.chartData.dfcData = {
            "label":"Disputes From Closures",
            "data":[25,75],
            "backgroundColor":[
                "#d0011b", //fill color
                "#f6f6f6" //empty color
            ]
        }
        this.dashboard.createDoughnutChart('dfcChart',this.chartData.dfcData);

        this.chartData.conData = {
            "label":"Construction",
            "data":[50,50],
            "backgroundColor":[
                "#1e3346", //fill color
                "#f6f6f6" //empty color
            ]
        }
        this.dashboard.createDoughnutChart('conChart',this.chartData.conData);

        this.chartData.mainData = {
            "label":"Maintenance",
            "data":[50,50],
            "backgroundColor":[
                "#1e3346", //fill color
                "#f6f6f6" //empty color
            ]
        }
        this.dashboard.createDoughnutChart('mainChart',this.chartData.mainData);

        this.chartData.servData = {
            "label":"Servicing",
            "data":[50,50],
            "backgroundColor":[
                "#1e3346", //fill color
                "#f6f6f6" //empty color
            ]
        }
        this.dashboard.createDoughnutChart('servChart',this.chartData.servData);

        this.chartData.ectData = {
            "label":"Employment Contact Type",
            "data":[75,25],
            "backgroundColor":[
                "#1e3346", //fill color
                "#01a89e" //empty color
            ]
        }
        this.chartData.ectChartOptions = {
            cutoutPercentage: 70,
            tooltips: {enabled: false},
            hover: {mode: null},
        }
        this.dashboard.createDoughnutChart('ectChart',this.chartData.ectData,this.chartData.ectChartOptions);

    }

}
