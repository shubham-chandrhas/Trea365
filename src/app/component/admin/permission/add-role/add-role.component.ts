import { Component, OnInit } from '@angular/core';
import { NgForm, FormGroup ,FormControl} from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import {Location} from '@angular/common';

import { UtilService } from '../../../../shared/service/util.service';
import { HttpService } from '../../../../shared/service/http.service';
import { ConstantsService } from '../../../../shared/service/constants.service';
import { AdminService } from '../../admin.service';
import { DialogComponent } from '../../../../shared/model/dialog/dialog.component';
import { GlobalService } from '../../../../shared/service/global.service';

@Component({
    selector: 'app-add-role',
    templateUrl: './add-role.component.html',
    styleUrls: ['./add-role.component.css']
})
export class AddRoleComponent implements OnInit {
    public menuList: any = [];
    public roleObj: any = {};
    public isEdit: boolean = false;
    public errMsg: string = '';
    public isError: boolean = false;
    public submitted: boolean = false;
    private routeObj: any;
    //mobileAppAccess: any = { 'permission_level_id': 165, 'actionAccess': false };

    roleForm: NgForm;
    constructor(
        private router: Router,
        private util: UtilService,
        private http: HttpService,
        public dialog: MatDialog,
        private admin: AdminService,
        private global: GlobalService,
        public constant: ConstantsService,
        private _location: Location,
        public route: ActivatedRoute
        ) { }

    ngOnInit() {
        this.util.setWindowHeight();
        this.util.setPageTitle(this.route);
        try{
            if(this.router.url.split('/')[2] == 'csa-onboarding'){
                this.util.menuChange({'menu':'guide','subMenu':''});
                this.routeObj = { 'list': '/csa-onboarding/guide', 'review': '/admin/csa-onboarding/role-review' }
            }else{
                this.util.menuChange({'menu':2,'subMenu':17});
                this.routeObj = { 'list': '/admin/csa/role-list/0', 'review': '/admin/csa/role-review' }
            }
            if(sessionStorage.getItem('existingRoleEdit')){
                this.roleObj = JSON.parse(sessionStorage.getItem('existingRoleEdit'));
                this.menuList = this.roleObj.menus;
                this.getRolePermissions(this.roleObj.role_id);
                this.isEdit = true;
            }else if(sessionStorage.getItem('roleEdit')){
                this.roleObj = JSON.parse(sessionStorage.getItem('roleEdit'));
                //this.mobileAppAccess = JSON.parse(sessionStorage.getItem('mobileAccess'));
                this.menuList = this.roleObj.menus;
            }else{
                this.getAllMenus();
            }
        }catch(err){
            this.global.addException('add role','ngOnInit()',err);
        }
    }


    getAllMenus(){
        var self = this;
        try{
            self.util.showProcessing('processing-spinner');
            this.http.doGet('getPermissionLevels', function(error: boolean, response: any){
                if( !error ){
                    self.util.hideProcessing('processing-spinner');
                    self.menuList = response.data.filter(item => item.permission_level_id != 165);
                    console.log('manulist of access=',   self.menuList )
                    for(let i = 0; i < self.menuList.length; i++){
                        let crmActions = JSON.parse(JSON.stringify(self.menuList[i].second_level));
                        if(self.menuList[i].menu_slug == 'crm'){
                            self.menuList[i].second_level = self.createCRMMenu(crmActions);
                        }
                        else if(self.menuList[i].menu_slug == 'dispatch'){
                            self.menuList[i].actionAccess = true;
                        }
                        self.menuList[i].accessType = "Full Access";
                        for (let j = 0; j < self.menuList[i].second_level.length; j++) {
                          self.menuList[i].second_level[j].accessType = "Full Access";
                          self.checkStatus( self.menuList[i].second_level[j]);

                          for (let k = 0; k < self.menuList[i].second_level[j].third_level.length; k++) {

                            self.menuList[i].second_level[j].third_level[k].actionAccess = true;
                            // self.menuList.filter(item => item.isDisable = false)
                            // self.menuList[i].second_level.filter(item => item.isDisable = false);
                            // self.menuList[i].second_level[j].third_level.filter(item => item.isDisable = false);
                            self.checkStatus( self.menuList[i].second_level[j].third_level[k]);
                        }
                        }
                    }

                }
            });
        }catch(err){
            this.global.addException('add role','getAllMenus()',err);
        }
    }

    createCRMMenu(crmActions): any {
        return ([{
            "permission_level_id":122,
            "parent_menu_id":4,
            "menu":"CRM",
            "is_menu":0,
            "menu_slug":"crm",
            "third_level": crmActions
        }])
    }

    change2ndLavel(menu, index, type): void {
      console.log('2nd level ==',type, menu);
        if(type == 'Full Access'){
            for (var i = 0; i < menu.second_level.length; i++) {
                menu.second_level[i].accessType = 'Full Access';
                for (var j = 0; j < menu.second_level[i].third_level.length; j++) {
                    menu.second_level[i].third_level[j].actionAccess = true;
                    this.checkStatus(menu.second_level[i].third_level[j]);
                }
            }
        }else if(type == 'No Access'){
            for (var i = 0; i < menu.second_level.length; i++) {
                menu.second_level[i].accessType = 'No Access';
                for (var j = 0; j < menu.second_level[i].third_level.length; j++) {
                    menu.second_level[i].third_level[j].actionAccess = false;
                    this.checkStatus(menu.second_level[i].third_level[j]);
                }
            }
        }else if(type == 'View Access'){
            for (var i = 0; i < menu.second_level.length; i++) {
                menu.second_level[i].accessType = 'View Access';
                for (var j = 0; j < menu.second_level[i].third_level.length; j++) {
                    menu.second_level[i].third_level[j].actionAccess = j == 0 ? true : false;
                    this.checkStatus(menu.second_level[i].third_level[j]);
                }
            }
        }
    }

    change3ndLavel(menu, index, type): void {
      console.log('2nd level ==',type, menu);

        if(type == 'Full Access'){
            for (var i = 0; i < menu.third_level.length; i++) {
                menu.third_level[i].actionAccess = true;
                this.checkStatus(menu.third_level[i]);
            }
        }else if(type == 'No Access'){
            for (var i = 0; i < menu.third_level.length; i++) {
                menu.third_level[i].actionAccess = false;
                this.checkStatus(menu.third_level[i]);
            }
        }else if(type == 'View Access'){
            for (var i = 0; i < menu.third_level.length; i++) {
                menu.third_level[i].actionAccess = i == 0 ? true : false;
                this.checkStatus(menu.third_level[i]);
            }
        }
    }

    checkStatus(action){
        this.checkDependency(action);
        this.updateAccessDropDown();
    }

    updateAccessDropDown(): void {
        for(let a = 0; a < this.menuList.length; a++){
            for (let indexTwo = 0; indexTwo < this.menuList[a].second_level.length; indexTwo++) {
                let count: number = 0;
                let subMenuCount: any = {
                    'fullAccess': 0,
                    'noAccess': 0,
                    'viewAccess': 0,
                    'partialAccess': 0
                };
                for(var i = 0; i < this.menuList[a].second_level[indexTwo].third_level.length; i++){
                    if(this.menuList[a].second_level[indexTwo].third_level[i].actionAccess){
                        count++;
                    }
                }
                if(this.menuList[a].second_level[indexTwo].third_level.length == count){
                    this.menuList[a].second_level[indexTwo].accessType = 'Full Access';
                }else if(count == 0){
                    this.menuList[a].second_level[indexTwo].accessType = 'No Access';
                }else if(count == 1 && this.menuList[a].second_level[indexTwo].third_level[0].actionAccess){
                    this.menuList[a].second_level[indexTwo].accessType = 'View Access';
                }else{
                    this.menuList[a].second_level[indexTwo].accessType = 'Partial Access';
                }

                for (var i = 0; i < this.menuList[a].second_level.length; i++) {
                    if(this.menuList[a].second_level[i].accessType == 'Full Access'){
                        subMenuCount.fullAccess++;
                    }else if(this.menuList[a].second_level[i].accessType == 'No Access'){
                        subMenuCount.noAccess++;
                    }else if(this.menuList[a].second_level[i].accessType == 'View Access'){
                        subMenuCount.viewAccess++;
                    }else if(this.menuList[a].second_level[i].accessType == 'Partial Access'){
                        subMenuCount.partialAccess++;
                    }
                }

                if(this.menuList[a].second_level.length == subMenuCount.fullAccess){
                    this.menuList[a].accessType = 'Full Access';
                }else if(this.menuList[a].second_level.length == subMenuCount.noAccess){
                    this.menuList[a].accessType = 'No Access';
                }else if(this.menuList[a].second_level.length == subMenuCount.viewAccess){
                    this.menuList[a].accessType = 'View Access';
                }else if(this.menuList[a].second_level.length == subMenuCount.partialAccess || this.menuList[a].second_level.length > subMenuCount.partialAccess){
                    this.menuList[a].accessType = 'Partial Access';
                }
            }
        }
    }



    checkDependency(action){
        let self = this;
        self.util.getDependentActions(action.permission_level_id, function(response){
            for (var a = 0; a < response.length; a++) {
                for(let i = 0; i < self.menuList.length; i++){
                    for (let j = 0; j < self.menuList[i].second_level.length; j++) {
                        for (let k = 0; k < self.menuList[i].second_level[j].third_level.length; k++) {
                            if(self.menuList[i].second_level[j].third_level[k].permission_level_id == response[a]){
                                if(action.actionAccess){
                                    self.menuList[i].second_level[j].third_level[k].actionAccess =  true;
                                    self.menuList[i].second_level[j].third_level[k].isDisable = true;
                                    self.menuList[i].second_level[j].isDisable = true;
                                    //self.menuList[i].isDisable = true;
                                }else{
                                    self.menuList[i].second_level[j].third_level[k].isDisable = false;
                                    self.menuList[i].second_level[j].isDisable = self.checkSecondLevalDisable(self.menuList[i].second_level[j]);
                                    self.menuList[i].isDisable = self.checkFirstLevalDisable(self.menuList[i]);
                                }
                            }
                        }
                    }
                }
            }
        });
    }

    checkFirstLevalDisable(menu): boolean {
        for (let i = 0; i < menu.second_level.length; i++) {
            for (let j = 0; j < menu.second_level[i].third_level.length; j++) {
                if(menu.second_level[i].third_level[j].isDisable){
                    return true;
                }
            }
        }
        return false;
    }

    checkSecondLevalDisable(subMenu): boolean {
        for (let j = 0; j < subMenu.third_level.length; j++) {
            if(subMenu.third_level[j].isDisable){
                return true;
            }
        }
        return false;
    }

    reviewRole(from: NgForm){
        var self = this;
        self.submitted = true;
        if(from.valid){
            this.roleObj.menus = self.menuList;
            sessionStorage.setItem('roleDetails', JSON.stringify(this.roleObj));
            //sessionStorage.setItem('mobileAccess', JSON.stringify(this.mobileAppAccess));
            this.router.navigate([this.routeObj.review]);
            sessionStorage.removeItem('roleEdit');
        }
    }


    getRolePermissions(id){
        var self = this;
        try{
            this.http.doGet('roles/getpermission/'+id, function(error: boolean, response: any){
                self.util.hideProcessing('processing-spinner');
                if( error ){
                    self.roleObj = [];
                }else{
                    self.roleObj.roleId = response.data.role_id;
                    self.roleObj.roleName = response.data.role_name;
                    self.roleObj.roleDesc = response.data.role_desc;
                    self.menuList = response.data.permissions;

                    for (let i = 0; i < self.menuList.length; i++) {
                        let crmActions = JSON.parse(JSON.stringify(self.menuList[i].second_level));
                        if(self.menuList[i].menu_slug == 'crm'){
                            self.menuList[i].second_level = self.createCRMMenu(crmActions);
                        }

                        if(self.menuList[i].menu_slug == 'dispatch'){
                            self.menuList[i].actionAccess = self.menuList[i].is_access == 1 ? true : false;
                        }

                        for (let j = 0; j < self.menuList[i].second_level.length; j++) {
                            for (let k = 0; k < self.menuList[i].second_level[j].third_level.length; k++) {
                                self.menuList[i].second_level[j].third_level[k].actionAccess = self.menuList[i].second_level[j].third_level[k].is_access == 1 ? true : false;
                                self.checkStatus(self.menuList[i].second_level[j].third_level[k]);
                            }
                        }
                    }
                }
            });
        }catch(err){
            this.global.addException('add role','getRolePermissions()',err);
        }
    }



    updateRole(id){
        this.errMsg = '';
        this.isError = false;
        var self = this;
        try{
            this.roleObj.menus = self.menuList;
            let menus = [];
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
            this.roleObj.menus = menus;
                self.util.addSpinner('updateRole', "Update");
            this.http.doPost('roles/edit', this.roleObj, function(error: boolean, response: any){
                self.util.removeSpinner('updateRole', "Update");
                if(error){
                    console.log('error');
                }else{
                    console.log('no error');
                    if(response.status){
                        self.admin.updateList(response.status);
                        self.util.showDialog(DialogComponent, response.message, [self.routeObj.list]);

                        if(self._location.path().includes("role-list")){
                            console.log("include");
                            self.util.changeEvent({
                                'source': 'UPDATE',
                                'action': 'UPDATE',
                                'data': response.data
                            });
                        }
                    }else{
                        console.log('error');
                        self.isError = true;
                        self.errMsg = response.message;
                    }
                }
            });
        }catch(err){
            this.global.addException('add role','updateRole()',err);
        }
    }

    checkDispatchStatus(){

    }

    cancelRole(){
        if(this.isEdit){
            sessionStorage.removeItem('existingRoleEdit');
            this.admin.updateList(true);
        }else{
            sessionStorage.removeItem('roleEdit');
        }
        this.router.navigate([this.routeObj.list]);
    }
}
