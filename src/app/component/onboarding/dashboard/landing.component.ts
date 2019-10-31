/* *
 *     	Company Super Admin Landing Component
 *  	cognitoService used to logout the current logged in user
 * */
//import 'rxjs/add/operator/filter';
//import 'rxjs/add/operator/pairwise';

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

export class CSAOnboardingComponent implements OnInit {
	public companyInfo: any;
	public onboardArrowIcon:boolean = false;
	public selL1Menu:string;
	public selL2Menu:string;
	public isPlatform:any;
	constructor(
		@Inject(DOCUMENT)
        private document: Document,
		private cognitoService: AwsCognitoService,
		public util: UtilService,
		private renderer: Renderer,
		private router: Router
	) {
		// if(sessionStorage.getItem('refreshStatus') && sessionStorage.getItem('refreshStatus') == '1'){
		// 	sessionStorage.removeItem('refreshStatus');
		// 	location.reload();
		// }

  // 		this.router.events.filter(e => e instanceof RoutesRecognized).pairwise().subscribe((event: any[]) => {
  //     		console.log(event[0].urlAfterRedirects);
  //     		if(event[0].urlAfterRedirects == '/login'){
  //     			setTimeout(() => {
  //     				location.reload();
		// 		}, 0)
  //     		}
		// });

	}

	ngOnInit(){
		let self = this;
		this.renderer.setElementClass(document.body, 'bg-img', false);
		this.getCompanyInfo();
		this.util.newMenuSelection.subscribe(menu => setTimeout(() => {

			if(menu){
			this.selL1Menu = menu.menu;
			this.selL2Menu = menu.subMenu;
			}
		}, 0));
		this.isPlatform = JSON.parse(atob(localStorage.getItem('USER'))).overall_flag;

		this.util.setLoggedInUserName( JSON.parse(atob(localStorage.getItem('USER'))).last_name ? JSON.parse(atob(localStorage.getItem('USER'))).first_name+" "+JSON.parse(atob(localStorage.getItem('USER'))).last_name : JSON.parse(atob(localStorage.getItem('USER'))).first_name );
		// $("#leftside-navigation > ul > li > a").click(function(event) {
		// 	$("#leftside-navigation ul ul").slideUp(function(event){
		// 		$("#leftside-navigation ul li").removeClass('menu-open');
		// 	}), $(this).next().is(":visible") || $(this).next().slideDown(function(event){
		// 		var self = $(this).closest('li');
		// 		$(self[0]).addClass('menu-open');
		// 	}),
		// 	event.stopPropagation()
		// });

    	this.toggleArrow();
    	this.util.setRole(JSON.parse(atob(localStorage.getItem('USER'))).role_id);
    	this.util.setRoleName(JSON.parse(atob(localStorage.getItem('USER'))).role_id == '2' ? 'Admin' : JSON.parse(atob(localStorage.getItem('USER'))).permission_role.role_name);
		this.util.updatePagination();
	}

	goToAdminDashboard(){
		sessionStorage.setItem('refreshStatus', '1');
		this.router.navigate(['/csa']);
	}


	toggleArrow():void{
		this.onboardArrowIcon = !this.onboardArrowIcon;
		this.renderer.setElementClass(document.body, 'sidebar-collapse', !this.onboardArrowIcon);
	}

	getCompanyInfo():void{
		var self = this;
		this.cognitoService.getCompanyInfo(function(err, res){
			if(!err){
				self.companyInfo = res.data[0];
				self.util.setCompanyId(res.data[0].company_id);
				self.util.setCompanyName(res.data[0].organization);
				self.util.setCurrency(res.data[0].currency);
				self.util.setCurrencySign(res.data[0].country_name.currency_sign);
				self.util.setCompanyLogo(res.data[0].logo);
				self.util.setCountryCode(JSON.parse(atob(localStorage.getItem('USER'))).country_code);
				console.log(JSON.parse(atob(localStorage.getItem('USER'))).country_code);
			}
		});
	}

	logout():void {
		this.cognitoService.logout();
	}
}
