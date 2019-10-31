/* *
 *     	Trea Super Admin Landing Component
 *  	cognitoService used to logout the current logged in user
 * */

import { Component, Inject, OnInit, AfterViewInit, HostListener, ViewChild, Renderer } from '@angular/core';
import { DOCUMENT } from '@angular/platform-browser';
import { Router, ActivatedRoute, RoutesRecognized } from '@angular/router';

import { AwsCognitoService } from '../../../auth/aws-cognito.service';
import { UtilService } from '../../../shared/service/util.service';

declare var $ :any;

@Component({
    selector: '',
    templateUrl: './landing.html',
})

export class TSALandingComponent implements OnInit{

	public userData:any;
	public companyInfo: any;
	public onboardArrowIcon:boolean = false;
	public selL1Menu:string;
	public selL2Menu:string;
	public userName:string;
	constructor(
		@Inject(DOCUMENT)
        private document: Document,
		private cognitoService: AwsCognitoService,
		private util: UtilService,
		private renderer: Renderer,
		private router: Router
		) {
		this.util.updatePagination();
		this.getCurrentUserInfo();
	}

	public getCurrentUserInfo(){
		console.log(JSON.parse(atob(localStorage.getItem('USER'))));
		this.userData = JSON.parse(atob(localStorage.getItem('USER')));
	};

	ngOnInit(){
		let self = this;
		this.renderer.setElementClass(document.body, 'bg-img', false);
		this.toggleArrow();
	    this.userName = JSON.parse(atob(localStorage.getItem('USER'))).first_name;
	    this.util.setRole(JSON.parse(atob(localStorage.getItem('USER'))).role_id);
	}


	toggleArrow():void{
		this.onboardArrowIcon = !this.onboardArrowIcon;
		this.renderer.setElementClass(document.body, 'sidebar-collapse', !this.onboardArrowIcon);
	}

	getCompanyInfo():void{
		var self = this;
		this.cognitoService.getCompanyInfo(function(err, res){
			if(!err){
				self.companyInfo = res.data;
				self.util.setCompanyName(res.data.company_display_name);
				self.util.setCurrency(res.data.currency);
				self.util.setCountryCode(JSON.parse(atob(localStorage.getItem('USER'))).country_code);
				console.log(JSON.parse(atob(localStorage.getItem('USER'))).country_code);
				console.log(JSON.parse(atob(localStorage.getItem('USER'))).company_status.is_active);
			}
		});
	}

	logout():void {
		this.cognitoService.logout();
	}
}
