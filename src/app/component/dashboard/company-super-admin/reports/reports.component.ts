
import { Component, Inject, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatTableDataSource, MatSort } from '@angular/material';

import { UtilService } from '../../../../shared/service/util.service';
import { HttpService } from '../../../../shared/service/http.service';
import {Route, ActivatedRoute } from '@angular/router';

declare var $ :any;

@Component({
    selector: '',
	templateUrl: './reports.html',
	styleUrls: ['./reports.css']
})

export class CSAReportsComponent implements AfterViewInit { 
	public userList = '';
	public searchTxt: string;
	public screenHeight:any;

	constructor( private util: UtilService, private http: HttpService, public route:ActivatedRoute ) {
		var self = this;
		// this.http.doGet('getUserList', function(error: boolean, response: any){
        //     if( error ){
        //         alert(response.error.error);
        //     }else{
        //         self.userList = response.result;
        //     }
        // });
	}
	
	ngOnInit() {
		
		this.util.menuChange({'menu':1000,'subMenu':10000});
		this.util.setPageTitle(this.route);
		//window.location.reload();
		let headerHeight = $(".main-header").height();
		let footerHeight = $(".main-footer").height();
		this.screenHeight = window.innerHeight - headerHeight - headerHeight - 6;
		$(".content-wrapper").css("min-height", this.screenHeight+"px");

		
	}

	displayedColumns = ['company', 'address', 'city', 'provinceState', 'contactName', 'role', 'email'];
  	dataSource = new MatTableDataSource(ELEMENT_DATA);

  	applyFilter(filterValue: string) {
	    filterValue = filterValue.trim(); // Remove whitespace
	    filterValue = filterValue.toLowerCase(); // MatTableDataSource defaults to lowercase matches
	    this.dataSource.filter = filterValue;
	}

  	@ViewChild(MatSort) sort: MatSort;

  /**
   * Set the sort after the view init since this component will
   * be able to query its view for the initialized sort.
   */
	  ngAfterViewInit() {
		this.dataSource.sort = this.sort;
	  }
	}

	export interface Element {
	  company: string;
	  address: string;
	  city: string;
	  provinceState: string;
	  contactName: number;
	  role: string;
	  email: string;
	}

	const ELEMENT_DATA: Element[] = [
		{
			company: "ABC Pvt. Ltd.",
		  	address: "Vimannagar",
		  	city: "Pune",
		  	provinceState: "ON",
		  	contactName: 8793392836,
		  	role: "Owner",
		  	email: "ymane@torinit.com",
		},
		{
			company: "GBC Pvt. Ltd.",
		  	address: "Chinchwad",
		  	city: "Pune",
		  	provinceState: "ON",
		  	contactName: 2793392836,
		  	role: "Owner",
		  	email: "abc@torinit.com",
		},
		{
			company: "WBC Pvt. Ltd.",
		  	address: "Pune Station",
		  	city: "Pune",
		  	provinceState: "ON",
		  	contactName: 9793392836,
		  	role: "Owner",
		  	email: "xyz@torinit.com",
		},
		{
			company: "YBC Pvt. Ltd.",
		  	address: "Kharadi",
		  	city: "Mumbai",
		  	provinceState: "ON",
		  	contactName: 7793392836,
		  	role: "Owner",
		  	email: "mnp@torinit.com",
		},
		{
			company: "ABC Pvt. Ltd.",
		  	address: "Vimannagar",
		  	city: "Pune",
		  	provinceState: "ON",
		  	contactName: 8793392836,
		  	role: "Owner",
		  	email: "pqr@torinit.com",
		},
		{
			company: "TBC Pvt. Ltd.",
		  	address: "Nigadi",
		  	city: "Pune",
		  	provinceState: "ON",
		  	contactName: 4793392836,
		  	role: "Owner",
		  	email: "stv@torinit.com",
		},
		{
			company: "CBC Pvt. Ltd.",
		  	address: "Vimannagar",
		  	city: "Mumbai",
		  	provinceState: "ON",
		  	contactName: 5793392836,
		  	role: "Owner",
		  	email: "efg@torinit.com",
		}	
	];



