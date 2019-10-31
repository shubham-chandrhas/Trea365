import { Component, OnInit } from '@angular/core';

import { UtilService } from '../../../../../shared/service/util.service';
import { DashboardService } from '../../../dashboard.service';
import { ActivatedRoute } from '@angular/router';

@Component({
	selector: 'app-financials',
	templateUrl: './financials.component.html',
	styleUrls: ['./financials.component.css']
})
export class FinancialsComponent implements OnInit {

	public chartData:any ={};
	constructor(
		public util: UtilService, 
		public dashboard: DashboardService,
		public route: ActivatedRoute
	) { }

	ngOnInit() {
		this.util.setBgYellow('financial');
        this.util.setPageTitle(this.route);
		this.chartData.aptrData = {
            "labels":["2013","2014","2015","2016","2017"],
			"datasets":[
    			{
    				"label":"Work Order Price Range",
    				"data":[1,2,2.5,4,5,0],
    				"fill":false,
    				"backgroundColor":[
        				"#d9f1f1",
        				"#b2e4e1",
        				"#8cd9d3",
        				"#66cbc5",
        				"#40bfb6",
        			],
    				"borderWidth":0
    			}
			]
        }
        this.dashboard.createBarChart('aptrChart',this.chartData.aptrData);

        this.chartData.artrData = {
            "labels":["2013","2014","2015","2016","2017"],
			"datasets":[
    			{
    				"label":"Work Order Price Range",
    				"data":[1,2,2.5,4,3.75,0],
    				"fill":false,
    				"backgroundColor":[
        				"#d9f1f1",
        				"#b2e4e1",
        				"#8cd9d3",
        				"#66cbc5",
        				"#40bfb6",
        			],
    				"borderWidth":0
    			}
			]
        }
        this.dashboard.createBarChart('artrChart',this.chartData.artrData);

        this.chartData.crData = {
            "labels":["2013","2014","2015","2016","2017"],
			"datasets":[
    			{
    				"label":"Work Order Price Range",
    				"data":[1.25,1.5,1.5,1.5,1.6,0],
    				"fill":false,
    				"backgroundColor":[
        				"#d9f1f1",
        				"#b2e4e1",
        				"#8cd9d3",
        				"#66cbc5",
        				"#40bfb6",
        			],
    				"borderWidth":0
    			}
			]
        }
        this.dashboard.createBarChart('crChart',this.chartData.crData);

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
        this.chartData.cgrData = {
            "labels":["2013","2014","2015","2016","2017","2018"],
			"datasets":[{
				"label":"Company Growth Rate",
				"data":[250000,800000,600000,1800000,1700000],
				"fill":false,
				"borderColor":"#01a89e",
				"lineTension":0.4
			}]
        }
        this.dashboard.createLineChart('cgrChart',this.chartData.cgrData);
	}

}
