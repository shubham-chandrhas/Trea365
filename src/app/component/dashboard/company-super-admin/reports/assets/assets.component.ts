import { Component, OnInit } from '@angular/core';

import { UtilService } from '../../../../../shared/service/util.service';
import { DashboardService } from '../../../dashboard.service';
import { ActivatedRoute } from '@angular/router';

@Component({
	selector: 'app-assets',
	templateUrl: './assets.component.html',
	styleUrls: ['./assets.component.css']
})
export class AssetsComponent implements OnInit {
	public chartData:any ={};
	constructor(
		public util: UtilService, 
		public dashboard: DashboardService,
		public route:ActivatedRoute
	) { }

	ngOnInit() {
		this.util.setBgYellow('assetProd');
        this.util.setPageTitle(this.route);
		this.chartData.utilData = {
            "label":"Utilization",
            "data":[75,25],
            "backgroundColor":[
                "#01a89e", //fill color
                "#f6f6f6" //empty color
            ]
        }
        this.dashboard.createDoughnutChart('utilChart',this.chartData.utilData);
	}

}
