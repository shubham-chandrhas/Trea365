import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { UtilService } from '../../../shared/service/util.service';
import { HttpService } from '../../../shared/service/http.service';
import { GlobalService } from '../../../shared/service/global.service';
import { EmployeeDialog } from '../../hr/employee/employee-dialog.component';
import { MatDialog } from '@angular/material';

declare var $:any;
@Component({
  selector: 'app-account-details',
  templateUrl: './account-details.component.html',
  styleUrls: ['./account-details.component.css']
})
export class AccountDetailsComponent implements OnInit {

  public screenHeight: any;
  public accountDetails: any;
  isPlatform: any;

  constructor(
    private router: Router,
    public util: UtilService,
    private http: HttpService,
    private global: GlobalService,
    public route: ActivatedRoute,
    public dialog: MatDialog,
  ) { }

  ngOnInit() {
    this.util.setWindowHeight();
    this.util.setPageTitle(this.route);
    this.util.showProcessing('processing-spinner');
    this.util.menuChange({'menu':'accountDetails','subMenu':''});
		this.isPlatform = JSON.parse(atob(localStorage.getItem('USER'))).overall_flag;

		let headerHeight = $(".main-header").height();
		let footerHeight = $(".main-footer").height();
		this.screenHeight = window.innerHeight - headerHeight - headerHeight - 6;
		$(".content-wrapper").css("min-height", this.screenHeight+"px");
		this.getAccountDetails();
  }

  public getAccountDetails(){
    let self = this;
    try{
      this.http.doGet('getCompanyDetails', function(error: boolean, response: any){
          if( error ){
              alert(response.error.error);
          }else{
              self.accountDetails = response.data[0];
              self.util.hideProcessing('processing-spinner');
              //console.log(self.companyList);
          }
      });
    }catch(err){
      this.global.addException('Account Details','getAccountDetails()',err);
   }
  }

    public editAccountDetails() {
        try {
            sessionStorage.setItem('accountDetails', JSON.stringify(this.accountDetails));
            this.router.navigate(['/csa-onboarding/edit-account']);
        } catch (err) {
            this.global.addException('Account details', 'editAccountDetails()', err, { 'routeURL': '/csa-onboarding/edit-account' + this.accountDetails });
        }


    }

goToAdminDashboard() {
  try {
      sessionStorage.setItem('refreshStatus', '1');
      this.router.navigate(['/csa']);
  } catch (err) {
      this.global.addException('Account details', 'goToAdminDashboard()', err);
  }
}

  resetPassword(userName=''){
    // console.log(JSON.parse(atob(localStorage.getItem('USER'))).username);
      if (userName != '') {
        this.dialog.open(EmployeeDialog, {
          data: {
            action: "resetPassword",
            empUsername: userName,
            reset_message: "Do you want to change your password?",
            reset_heading: "Change Password",
            sucess_msg:
              "Instructions to change password has been sent to your email, Follow the instructions to change your password."
          },
          autoFocus: false
        });
      } else {
        this.dialog.open(EmployeeDialog, { data: { 'action': 'resetPassword', 'empUsername': JSON.parse(atob(localStorage.getItem('USER'))).username,'reset_message':'Do you want to change your password?','reset_heading':'Change Password','sucess_msg':'Instructions to change password has been sent to your email, Follow the instructions to change your password.'}, autoFocus: false });
      }
      //this.ref.tick();
  }
}
