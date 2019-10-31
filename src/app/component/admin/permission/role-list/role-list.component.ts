import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import * as _ from 'underscore';

import { UtilService } from '../../../../shared/service/util.service';
import { HttpService } from '../../../../shared/service/http.service';
import { ConstantsService } from '../../../../shared/service/constants.service';
import { AdminService } from '../../admin.service';
import { GlobalService } from '../../../../shared/service/global.service';

@Component({
    selector: 'app-role-list',
    templateUrl: './role-list.component.html',
    styleUrls: ['./role-list.component.css']
})
export class RoleListComponent implements OnInit {
    public roleList: any = [];
    public roleObj: any = [];
    public sortColumn: string = 'role_id';
    public sortColumnType: string = 'N';
    public sortOrder: string = 'DSC';
    commentSearch;
    public errMsg: string;
    public isError: boolean = false;
    public isEditRole: boolean = false;
    public searchList;
    public searchTxt: string;
    public paginationKey:any;
    public listCount:number = 0;
    public selectedIndex: number;
    permissionsSet: any;
    descSearch;
    roleSearch;
    public onBoarding:boolean = false; 

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        public util: UtilService,
        private http: HttpService,
        public dialog: MatDialog,
        public constant: ConstantsService,
        private admin: AdminService,
        private global: GlobalService,
        private location: Location
    ) { }

    ngOnInit() {
        var self = this;
        this.util.setWindowHeight();
        this.util.setPageTitle(this.route);
        this.permissionsSet = this.util.getModulePermission(44);
        console.log(this.permissionsSet);
        try{
            
            if(this.router.url.split('/')[2]=='csa-onboarding'){
                this.util.menuChange({'menu':'guide','subMenu':''}); //for onboarding dashboard
            }else{
                this.util.menuChange({'menu':2,'subMenu':17});
            }
            this.paginationKey = { itemsPerPage: this.constant.ITEMS_PER_PAGE, currentPage: this.constant.CURRENT_PAGE };
           
            this.admin.newRecord.subscribe(recordId => {
                if(recordId){
                    sessionStorage.removeItem('existingRoleEdit');
                    self.isEditRole = false;
                    self.roleObj = [];
                    self.getAllRoles();
                }
            });
            this.getAllRoles();

            this.util.changeDetection.subscribe(dataObj => {
                if (dataObj && dataObj.source == "UPDATE") {
                    this.getAllRoles();
                }
              });
        }catch(err){
            this.global.addException('role list','ngOnInit()',err);
        }
    }

    newRole(){
        try{
            sessionStorage.removeItem('roleDetails');
            sessionStorage.removeItem('existingRoleEdit');
            sessionStorage.removeItem('roleEdit');

            if(this.router.url.split('/')[2]=='csa-onboarding'){
                this.router.navigate(['/admin/csa-onboarding/add-role']);
            }else{
                this.router.navigate(['/admin/csa/add-role']);
            }
        }catch(err){
            this.global.addException('role list','newRole()',err);
        }
    }

    getAllRoles(){
        var self = this;
        self.util.showProcessing('processing-spinner');
        try{
            this.http.doGet('roles', function(error: boolean, response: any){
                //console.log(response);
                if( error ){
                    console.log('error');
                    self.roleList = [];
                }else{
                    console.log('no error');
                    self.roleList = response.data;
                }
                //console.log(self.roleList);
                if(self.roleList.length == 0) {
                    self.onBoarding = true;
                  }
                self.util.hideProcessing('processing-spinner');
                self.route.snapshot.paramMap.get('id') != '0' ? self.showRoleDetails() : '';
            });
        }catch(err){
            this.global.addException('role list','getAllRoles()',err);
        }

    }

    showRoleDetails(){
        let sortedList: any[] = _.sortBy(this.roleList, 'role_id').reverse();
        for (var i = 0; i < sortedList.length; ++i) {
            if(this.route.snapshot.paramMap.get('id') == sortedList[i].role_id){
                this.getRoleDetails(sortedList[i].role_id, i);
                this.selectedIndex = i;
                break;
            }
        }
    }

    getRolePermissions(id){
        var self = this;
        try{
            this.http.doGet('roles/getpermission/'+id, function(error: boolean, response: any){
                console.log(response);
                self.util.hideProcessing('processing-spinner');
                if( error ){
                    console.log('error');
                    self.roleObj = [];
                }else{
                    console.log('no error');
                    self.roleObj = response.data;
                    for(let i = 0; i < self.roleObj.permissions.length; i++){
                        if(!self.roleObj.permissions[i].hasOwnProperty("child_menu")){
                            self.roleObj.permissions[i].isAlone = true;
                            self.roleObj.permissions[i].viewAccess = self.roleObj.permissions[i].viewAccessType == "Full Access" ? true : false;
                            self.roleObj.permissions[i].editAccess = self.roleObj.permissions[i].editAccessType == "Full Access" ? true : false;
                        }else{
                            self.roleObj.permissions[i].isAlone = false;
                        }
                    }
                    self.location.go(self.location.path().split('/').splice(0, self.location.path().split('/').length - 1).join('/')+'/'+id);
                    setTimeout(function() {
                        self.util.scrollDown('roleMark');
                    }, 1000);
                    //console.log(self.roleObj);
                }
            });
        }catch(err){
            this.global.addException('role list','getRolePermissions()',err);
        }
    }
    getRoleDetails(id, indx){
        this.util.showProcessing('processing-spinner');
        var self = this;
        this.selectedIndex = indx;
        self.roleObj = [];
        sessionStorage.removeItem('existingRoleEdit');
        self.isEditRole = false;
        self.getRolePermissions(id);
    }
    editRole(obj){
        var self = this;
        // self.util.showProcessing('processing-spinner');
        self.isEditRole = true;
        sessionStorage.setItem('existingRoleEdit', JSON.stringify(obj));
    }

    changePage(event){
        this.paginationKey.currentPage = event;
        window.scrollTo(0, 0);
    }
    changeItemPerPage(){
        window.scrollTo(0, 0);
    }
    updateCount(count){ this.constant.ITEM_COUNT = count ;this.listCount = count; }
    
    getSearchTxt(filterValue: string) { if(filterValue == ''){ this.searchTxt = '' } }
    sortList(columnName: string, sortType){
        this.sortColumn = columnName;
        this.sortColumnType = sortType;
        if(this.sortColumn === columnName){
            if(this.sortOrder === 'ASC')
                this.sortOrder = 'DSC';
            else
                this.sortOrder = 'ASC';
        }else{
            this.sortOrder = 'ASC';
        }
    }


}
