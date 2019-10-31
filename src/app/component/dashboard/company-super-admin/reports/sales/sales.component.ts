import { Component, OnInit } from '@angular/core';

import { UtilService } from '../../../../../shared/service/util.service';
import { DashboardService } from '../../../dashboard.service';
import { ActivatedRoute } from '@angular/router';

@Component({
	selector: 'app-sales',
	templateUrl: './sales.component.html',
	styleUrls: ['./sales.component.css']
})
export class SalesComponent implements OnInit {
	public chartData:any ={};
	constructor(
		public util: UtilService, 
        public dashboard: DashboardService,
        public route: ActivatedRoute
		) { }

	ngOnInit() {
		this.util.setBgYellow('salesCRM');
        this.util.setPageTitle(this.route);
		this.chartData.clo1Data = {
            "label":"Closures/Leads",
            "data":[75,25],
            "backgroundColor":[
                "#01a89e", //fill color
                "#f6f6f6" //empty color
            ]
        }
        this.chartData.clo1ChartOptions = {
            cutoutPercentage: 65,
            tooltips: {enabled: false},
            hover: {mode: null},
        }
        this.dashboard.createDoughnutChart('clo1Chart',this.chartData.clo1Data,this.chartData.clo1ChartOptions);

        this.chartData.clo2Data = {
            "label":"Closures/Leads",
            "data":[50,50],
            "backgroundColor":[
                "#1e3346", //fill color
                "#f6f6f6" //empty color
            ]
        }
        this.dashboard.createDoughnutChart('clo2Chart',this.chartData.clo2Data);

        this.chartData.clo3Data = {
            "label":"Closures/Leads",
            "data":[50,50],
            "backgroundColor":[
                "#1e3346", //fill color
                "#f6f6f6" //empty color
            ]
        }
        this.dashboard.createDoughnutChart('clo3Chart',this.chartData.clo3Data);

        this.chartData.disData = {
            "label":"Disputes",
            "data":[25,75],
            "backgroundColor":[
                "#d0011b", //fill color
                "#f6f6f6" //empty color
            ]
        }
        this.dashboard.createDoughnutChart('disChart',this.chartData.disData);
	}

}
