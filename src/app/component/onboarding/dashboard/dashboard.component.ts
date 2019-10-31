
import { Component, Inject, OnInit } from '@angular/core';

import { UtilService } from '../../../shared/service/util.service';
import { HttpService } from '../../../shared/service/http.service';
import { ActivatedRoute } from '@angular/router';

declare var $ :any;

@Component({
    selector: '',
    templateUrl: './dashboard.html',
    styleUrls: ['./dashboard.css']
})

export class CSAOnboardingDashboardComponent{ 
	public userList = '';
	public searchTxt: string;
	public screenHeight:any;

	constructor( private util: UtilService, private http: HttpService, public route: ActivatedRoute ) {
		var self = this;
		this.http.doGet('getUserList', function(error: boolean, response: any){
            if( error ){
                alert(response.error.error);
            }else{
                self.userList = response.result;
            }
        });
	}
	
	ngOnInit() {
		
		this.util.menuChange({'menu':'accountDetails','subMenu':''});
		this.util.setPageTitle(this.route);
		let headerHeight = $(".main-header").height();
		let footerHeight = $(".main-footer").height();
		this.screenHeight = window.innerHeight - headerHeight - headerHeight - 6;
		$(".content-wrapper").css("min-height", this.screenHeight+"px");
		
	}

  	
}

	

	


