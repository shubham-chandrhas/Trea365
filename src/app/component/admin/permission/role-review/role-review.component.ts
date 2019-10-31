import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';

import { UtilService } from '../../../../shared/service/util.service';
import { HttpService } from '../../../../shared/service/http.service';
import { AdminService } from '../../admin.service';
import { DialogComponent } from '../../../../shared/model/dialog/dialog.component';
import { GlobalService } from '../../../../shared/service/global.service';

    
@Component({
    selector: 'app-role-review',
    templateUrl: './role-review.component.html',
    styleUrls: ['./role-review.component.css']
})
export class RoleReviewComponent implements OnInit {
    public roleObj: any;
    public menuList: any;
    public errMsg: string = '';
    public isError: boolean = false;
    private routeObj: any;
    //mobileAccess: any;
    constructor(
        private router: Router,
        private util: UtilService, 
        private http: HttpService, 
        public dialog: MatDialog, 
        private admin: AdminService,
        private global: GlobalService,
        private route: ActivatedRoute,
        ) { }

    ngOnInit() {
        this.util.setWindowHeight();
        this.util.setPageTitle(this.route);
        try{
            if(this.router.url.split('/')[2]=='csa-onboarding'){
                this.util.menuChange({'menu':'guide','subMenu':''});
                this.routeObj = { 'list': '/csa-onboarding/guide', 'add': '/admin/csa-onboarding/add-role' }
            }else{
                this.util.menuChange({'menu':2,'subMenu':17});
                this.routeObj = { 'list': '/admin/csa/role-list/0', 'add': '/admin/csa/add-role' }
            }
            this.roleObj = JSON.parse(sessionStorage.getItem('roleDetails'));
            this.menuList = JSON.parse(sessionStorage.getItem('roleDetails'));
            sessionStorage.removeItem('roleEdit');
            console.log(JSON.stringify(this.menuList));
            //this.mobileAccess = JSON.parse(sessionStorage.getItem('mobileAccess'));
        }catch(err){
            this.global.addException('role review','ngOnInit()',err);
        }  
    }

    editRole(){
        sessionStorage.setItem('roleEdit', JSON.stringify(this.roleObj));
        this.router.navigate([this.routeObj.add]);
    }

    cancelRole(){
        this.router.navigate([this.routeObj.list]);
    }
    submitRole(){
        this.errMsg = '';
        this.isError = false;
        console.log(this.menuList);
        var self = this;
        let menus = [];
        try{
            for (let i = 0; i < this.roleObj.menus.length; i++) {
                for (let j = 0; j < this.roleObj.menus[i].second_level.length; j++) {
                    for (let k = 0; k < this.roleObj.menus[i].second_level[j].third_level.length; k++) {
                        let obj = {
                            "permission_level_id": this.roleObj.menus[i].second_level[j].third_level[k].permission_level_id,
                            "is_access": this.roleObj.menus[i].second_level[j].third_level[k].actionAccess ? 1 : 0
                        }
                        menus.push(obj);
                    }
                }
                if(this.roleObj.menus[i].menu_slug == 'dispatch'){
                    let obj = {
                        "permission_level_id": this.roleObj.menus[i].permission_level_id,
                        "is_access": this.roleObj.menus[i].actionAccess ? 1 : 0
                    }
                    menus.push(obj);
                }
            }
            //menus.push({ 'permission_level_id': this.mobileAccess.permission_level_id, 'is_access': this.mobileAccess.actionAccess ? 1 : 0 });
            this.roleObj.menus = menus;
            console.log(this.roleObj);
            self.util.addSpinner('submitRole', "Submit");
            this.http.doPost('roles', self.roleObj, function(error: boolean, response: any){
                self.util.removeSpinner('submitRole', "Submit");
                if(response.status){
                    sessionStorage.removeItem('roleDetails');
                    self.util.showDialog(DialogComponent, response.message, [self.routeObj.list, self.routeObj.add]);
                }else{
                    self.isError = true;
                    self.errMsg = response.message;
                }
            });
        }catch(err){
            this.global.addException('role review','submitRole()',err);
        }
    }
}
