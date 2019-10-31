import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Http ,HttpModule} from '@angular/http'
import {Chart} from 'chart.js';

import { ConstantsService } from '../../shared/service/constants.service';
import { ExportService } from '../../shared/service/export.service';
import { HttpService } from '../../shared/service/http.service';
import { FileService } from '../../shared/service/file.service';
import * as _ from 'underscore';
declare var $ :any;

@Injectable()
export class DashboardService {

    constructor(
  		private constant: ConstantsService,
		private http: HttpService,
        private exportDoc: ExportService,
        private file: FileService
  	) { }


    createDoughnutChart(canvasId, chartData, chartOptions:any = {}){
	  	let auChartData = {
	        // "labels":["Red","Blue"],
	        "datasets":[]
	    }
	    auChartData.datasets = [];
	    auChartData.datasets.push(chartData)
	    let auChartOptions:any;
	    if(_.isEmpty(chartOptions)){
	    console.log('jjjjjjjjjjjjjjjj...',chartOptions);
		    auChartOptions = {
		        cutoutPercentage: 75,
		        tooltips: {enabled: false},
		        hover: {mode: null},
		    }
	    }else{
	    	auChartOptions = chartOptions;
	    }
	    
        let ctx:any = document.getElementById(canvasId);
        let auDoughnutChart = new Chart(ctx, {
            type: 'doughnut',
            data: auChartData,
            options: auChartOptions
        });
    }
    createBarChart(canvasId, chartData, chartOptions:any = {}){
	  	let auChartData:any = {}
	    auChartData = chartData;
	    let auChartOptions:any;
	    if(_.isEmpty(chartOptions)){
		    auChartOptions = {
		    	legend: { display: false },
		    	tooltips: {enabled: false},
		        hover: {mode: null},
			    scales: {
			        xAxes: [{
			            gridLines: {
			                offsetGridLines: true
			            }
			        }]
			    }
			}
	    }else{
	    	auChartOptions = chartOptions;
	    }
	    
        let ctx:any = document.getElementById(canvasId);
        let auDoughnutChart = new Chart(ctx, {
            type: 'bar',
            data: auChartData,
            options: auChartOptions
        });
    }
    createLineChart(canvasId, chartData, chartOptions:any = {}){
	  	let auChartData:any = {}
	    auChartData = chartData;
	    let auChartOptions:any;
	    if(_.isEmpty(chartOptions)){
		    auChartOptions = {
		    	legend: { display: false },
		    	tooltips: {enabled: false},
		        hover: {mode: null},
			    scales: {
			        xAxes: [{
			            gridLines: {
			                offsetGridLines: true
			            }
			        }]
			    }
			}
	    }else{
	    	auChartOptions = chartOptions;
	    }
	    
        let ctx:any = document.getElementById(canvasId);
        let auDoughnutChart = new Chart(ctx, {
            type: 'line',
            data: auChartData,
            options: auChartOptions
        });
    }

}
