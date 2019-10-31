
import { Component, Inject } from '@angular/core';

import { HttpService } from '../../../shared/service/http.service';
import { UtilService } from '../../../shared/service/util.service';

@Component({
    selector: '',
    templateUrl: './dashboard.html',
})

export class CompanyUsersDashboardComponent  { 
	// userList = '';

	constructor( private http: HttpService, public util: UtilService ) {
	// 	var self = this;
	// 	this.http.doGet('getUserList', function(error: boolean, response: any){
 //            if( error ){
 //                alert(response.error.error);
 //            }else{
 //                self.userList = response.result;
 //            }
 //        });
	}
	ngOnInit(){	
		this.util.setWindowHeight();
	}
	toggleNav():void { 
		var sideWidth = document.getElementById("mySidenav").style.width;
		if( sideWidth == "0px" || sideWidth == ''){
			document.getElementById("mySidenav").style.width = "250px"; 
			document.getElementById("main").style.marginLeft = "250px";
		}else{
			document.getElementById("mySidenav").style.width = "0"; 
			document.getElementById("main").style.marginLeft = "0";
		}
	}
}
