import { Component, OnInit } from '@angular/core';

import { UtilService } from '../../../../../shared/service/util.service';
import { DashboardService } from '../../../dashboard.service';
import { ActivatedRoute } from '@angular/router';

@Component({
	selector: 'app-hr',
	templateUrl: './hr.component.html',
	styleUrls: ['./hr.component.css']
})
export class HrComponent implements OnInit {

	public chartData:any ={};
	constructor(
		public util: UtilService, 
		public dashboard: DashboardService,
		public route: ActivatedRoute
	) { }
	ngOnInit() {
		this.util.setBgYellow('hr');
        this.util.setPageTitle(this.route); 
		this.chartData.tnowData = {
            "labels":["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
			"datasets":[
    			{
    				"label":"Total Number Of Workers",
    				"data":[52,54,54,51,50,50,50,54,54,54,56,56,0],
    				"fill":false,
    				"backgroundColor":["#bfe9e7", "#bfe9e7", "#bfe9e7", "#bfe9e7", "#bfe9e7", "#bfe9e7", "#bfe9e7", "#bfe9e7", "#bfe9e7", "#bfe9e7", "#bfe9e7", "#bfe9e7", ],
    				"borderWidth":0
    			}
			]
        }
        this.dashboard.createBarChart('tnowChart',this.chartData.tnowData);

        this.chartData.tsData = {
            "labels":["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
			"datasets":[
    			{
    				"label":"Total Salary",
    				"data":[50000,50000,50000,48000,48000,48000,52000,52000,52000,55000,55000,50000,0],
    				"fill":false,
    				"backgroundColor":["#bfe9e7", "#bfe9e7", "#bfe9e7", "#bfe9e7", "#bfe9e7", "#bfe9e7", "#bfe9e7", "#bfe9e7", "#bfe9e7", "#bfe9e7", "#bfe9e7", "#bfe9e7", ],
    				"borderWidth":0
    			}
			]
        }
        this.dashboard.createBarChart('tsChart',this.chartData.tsData);

        this.chartData.hvlData = {
            "labels":["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
			"datasets":[
    			{
    				"label":"Workers Hired",
    				"data":[0,0,1,0,3,1,2,1,0,0,0,1,0],
    				"fill":false,
    				"backgroundColor":["#bfe9e7", "#bfe9e7", "#bfe9e7", "#bfe9e7", "#bfe9e7", "#bfe9e7", "#bfe9e7", "#bfe9e7", "#bfe9e7", "#bfe9e7", "#bfe9e7", "#bfe9e7", ],
    				"borderWidth":0
    			},
    			{
    				"label":"Workers Left",
    				"data":[-2,-1,-1,-2,0,0,0,-1,-2,0,-3,0,0],
    				"fill":false,
    				"backgroundColor":["#e6808d", "#e6808d", "#e6808d", "#e6808d", "#e6808d", "#e6808d", "#e6808d", "#e6808d", "#e6808d", "#e6808d", "#e6808d", "#e6808d", ],
    				"borderWidth":0
    			}
			]
        }
        this.chartData.hvlChartOptions = {
		    	legend: { display: false },
		        hover: {mode: null},
			    scales: {
			        xAxes: [{
			            gridLines: {
			                offsetGridLines: true
			            }
			        }]
			    }
			}
        this.dashboard.createBarChart('hvlChart',this.chartData.hvlData,this.chartData.hvlChartOptions);

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
