import { Component, OnInit } from '@angular/core';

import { UtilService } from '../../../../../shared/service/util.service';
import { DashboardService } from '../../../dashboard.service';
import { ActivatedRoute } from '@angular/router';

@Component({
	selector: 'app-workflow',
	templateUrl: './workflow.component.html',
	styleUrls: ['./workflow.component.css']
})
export class WorkflowComponent implements OnInit {
	public chartData:any ={};
	constructor(
		public util: UtilService, 
		public dashboard: DashboardService,
		public route: ActivatedRoute
	) { }

	ngOnInit() {
		this.util.setBgYellow('workflow');
		this.util.setPageTitle(this.route);
		this.chartData.srData = {
            "label":"Scheduling Rate",
            "data":[80,20],
            "backgroundColor":[
                "#01a89e", //fill color
                "#f6f6f6" //empty color
            ]
        }
        this.dashboard.createDoughnutChart('srChart',this.chartData.srData);
        this.chartData.crData = {
            "label":"Completion Rate",
            "data":[100,0],
            "backgroundColor":[
                "#1e3346", //fill color
                "#f6f6f6" //empty color
            ]
        }
        this.dashboard.createDoughnutChart('crChart',this.chartData.crData);

        this.chartData.woprData = {
            "labels":["100","500","1,000","2,500","5,000","10,000","+"],
			"datasets":[
    			{
    				"label":"Work Order Price Range",
    				"data":[2,4,5,8,7,9,12,0],
    				"fill":false,
    				"backgroundColor":[
        				"#d9f1f1",
        				"#b2e4e1",
        				"#8cd9d3",
        				"#66cbc5",
        				"#40bfb6",
        				"#21b4aa",
        				"#00a99e"
        			],
    				"borderWidth":0
    			}
			]
        }
        this.dashboard.createBarChart('woprChart',this.chartData.woprData);

        
	}

}
