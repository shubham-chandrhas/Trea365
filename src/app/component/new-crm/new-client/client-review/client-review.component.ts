import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';

import { UtilService } from '../../../../shared/service/util.service';
import { HttpService } from '../../../../shared/service/http.service';
import { DialogComponent } from '../../../../shared/model/dialog/dialog.component';
declare var $ :any;

@Component({
    selector: 'app-new-client-review',
    templateUrl: './client-review.component.html',
    styleUrls: ['./client-review.component.css']
})
export class NewClientReviewComponent implements OnInit {
    public errMsg:string = '';
    public isError:boolean = false;
    public submitted:boolean = false;

    public clientObj:any;
    constructor(
        public dialog: MatDialog,
        public util:UtilService,
        private http: HttpService,
        public router: Router,
        private route: ActivatedRoute,
    ) {
        this.clientObj=JSON.parse(sessionStorage.getItem('client'));
        console.log(this.clientObj);
    }

    ngOnInit() {
        if(this.router.url.split('/')[2]=='csa-onboarding'){
            this.util.menuChange({'menu':'guide','subMenu':''}); //for onboarding dashboard
        }else{
            this.util.menuChange({'menu':5,'subMenu':5});
        }
        this.util.setWindowHeight();
        this.util.setPageTitle(this.route);
    }

    addCleint(){
        console.log(this.clientObj);
        console.log(JSON.stringify(this.clientObj));
        let self = this;
        this.errMsg = '';
        this.isError = false;
        this.submitted = true;
        let reqObject:any = JSON.parse(JSON.stringify(this.clientObj)) ;
        // reqObj = this.supInfo.reqObj;

        console.log("reqObject= ",reqObject);
        console.log(JSON.stringify(reqObject));
        self.util.addSpinner('addCleint', "Submit");
        this.http.doPost('client/add',reqObject,function(error: boolean, response: any){
        self.util.removeSpinner('addCleint', "Submit");
            if( error ){
                self.errMsg = response.message;
                self.isError = true;
                console.log(response.message);
            }else{
                console.log(response.message);
                sessionStorage.removeItem('client');
                self.util.showDialog(DialogComponent, response.message, self.router.url.split('/')[2]=='csa-onboarding' ? ['/csa-onboarding/guide'] : ['/new-crm/csa/client-list/0']);
                //self.router.url.split('/')[2]=='csa-onboarding' ? self.router.navigate(['/csa-onboarding/guide']) : self.router.navigate(['/new-crm/csa/client-list/0']);
            }
        });
    }

    goToEditDetails(){
        if(this.router.url.split('/')[2]=='csa-onboarding'){
            this.router.navigate(['/new-crm/csa-onboarding/add-client']);
        }else{
            this.router.navigate(['/new-crm/csa/add-client']);
        }
    }

    cancelReviewClient(){
        sessionStorage.removeItem('client');
        if(this.router.url.split('/')[2]=='csa-onboarding'){
            this.router.navigate(['/csa-onboarding/guide']);
        }else{
            this.router.navigate(['/new-crm/csa/client-list/0']);
        }
    }

}
