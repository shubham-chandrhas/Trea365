/* * 	
 *     	Company Super Admin Landing Component 
 *  	cognitoService used to logout the current logged in user
 * */ 

import { Component, Inject, OnInit, HostListener, ViewChild } from '@angular/core';
import { AwsCognitoService } from '../../../auth/aws-cognito.service';
import { UtilService } from '../../../shared/service/util.service';

declare var $ :any;

@Component({
    selector: '',
    templateUrl: './landing.html',
})

export class CompanyUsersLandingComponent  { 
	public companyInfo: any;
	public screenWidth:any;
	public screenHeight:any;
	public contentWidth:any;
	public contentMinHeight:any;
	public contentHeight:any;
	public userData:any;
	constructor( private cognitoService: AwsCognitoService, public util: UtilService ) {
		this.userData = JSON.parse(atob(localStorage.getItem('USER')));
		// this.screenWidth = window.innerWidth;
		 
	}
	
	ngOnInit(){	

		//this.util.setWindowWidth();
		this.util.setWindowHeight();
		// $(document).on('click', '#leftside-navigation>ul>li > a', function(event) {
		// 	$("#leftside-navigation ul ul").slideUp(), $(this).next().is(":visible") || $(this).next().slideDown(),
		// 	event.stopPropagation()
	
		// 	$(".sidebar #leftside-navigation ul li").removeClass('active');
		// 	$(this).closest('li').addClass('active');
			
		// 	this.screenWidth = $("body").prop("clientWidth");
		// 	this.contentWidth = this.screenWidth - 185;
		// 	document.getElementById("Sidenav").style.width = "170px"; 
		// 	document.getElementById("main").style.width = this.contentWidth +'px';
			
		// });
		
		this.getCompanyInfo();
		
	}

	
	// @HostListener('window:resize') onResize() {	
	// 	this.util.setWindowWidth();
	// }
	
	
  toggleNav():void { 
		this.util.toggleNavFromUtil();
	}
	

	getCompanyInfo(): void {
        var self = this;
        this.cognitoService.getCompanyInfo(function(err, res) {
            if (!err) {
                self.companyInfo = res.data[0];
                self.util.setCompanyId(res.data[0].company_id);
                self.util.setCompanyName(res.data[0].organization);
                self.util.setCurrency(res.data[0].currency);
                self.util.setCurrencySign(res.data[0].country_name.currency_sign);
                self.util.setCountryCode(JSON.parse(atob(localStorage.getItem('USER'))).country_code);
                self.util.setRole(JSON.parse(atob(localStorage.getItem('USER'))).role_id);
                self.util.setCompanyLogo(res.data[0].logo);
                
                //self.userRole = JSON.parse(atob(localStorage.getItem('USER'))).role.role_name;
                //self.user.id = JSON.parse(atob(localStorage.getItem('USER'))).id;
                console.log(JSON.parse(atob(localStorage.getItem('USER'))));

                //self.util.generatePermissionData();
            }
        });
    }

	logout():void {
		this.cognitoService.logout();
	}
}
