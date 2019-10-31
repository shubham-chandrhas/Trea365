import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

import { HrService } from '../../hr.service';
import { FileService } from '../../../../shared/service/file.service';
import { UtilService } from '../../../../shared/service/util.service';
import { DialogComponent } from '../../../../shared/model/dialog/dialog.component';
import { GlobalService } from '../../../../shared/service/global.service';

@Component({
    selector: 'app-employee-review',
    templateUrl: './employee-review.component.html',
    styleUrls: ['./employee-review.component.css']
})

export class EmployeeReviewComponent implements OnInit {
    empObj: any;
    errMsg = '';
    isError = false;
    submitted = false;
    action: string = 'add';
    private routeObj: any;
    isTSA:boolean = false; //if Trea Super Admin is logged in
    routStrArr;
    loggedInUser;
    //defaultLocation : string = "";
    constructor(
        public util: UtilService, 
        private file: FileService, 
        public router: Router, 
        private route: ActivatedRoute,
        private hr: HrService,
        public dialog: MatDialog,
        private global: GlobalService
    ){
        this.empObj=JSON.parse(sessionStorage.getItem('emp'));
        console.log(this.empObj);
        // if((this.empObj.latitude=='' || this.empObj.latitude ==null) && (this.empObj.longitude=='' || this.empObj.longitude==null))
        // {
        //     this.defaultLocation = this.empObj.address1+', '+this.empObj.cityId+', '+this.empObj.provinceId+', '+this.empObj.countryName;
        // }
        // else
        // {
        //     this.defaultLocation = this.empObj.address1;
        // }
        this.empObj.imgDocArr = this.util.getDocumentObj();
        this.action = this.empObj.id != 0 ? 'edit' : 'add';
    }

    ngOnInit() {
        try{
            this.router.url.split('/')[2] == 'csa-onboarding' ? (this.util.menuChange({'menu':'guide','subMenu':''}),this.routeObj = { 'list': '/csa-onboarding/guide', 'add': '/hr/csa-onboarding/new-employee' }) : (this.util.menuChange({'menu':6,'subMenu':28}),this.routeObj = { 'list': '/hr/csa/employee-list/0', 'add': '/hr/csa/new-employee' });  

            this.routStrArr = this.router.url.split('/');
            this.loggedInUser = JSON.parse(atob(localStorage.getItem('USER')));
            console.log(this.routStrArr[this.routStrArr.length - 1]);
            if(this.loggedInUser.role_id == '1'){
                // this.router.navigate(['/su/tsa/users-list/'+this.routStrArr[this.routStrArr.length - 1] ]);
                this.routeObj = { 'list': '/su/tsa/users-list/'+this.routStrArr[this.routStrArr.length - 1]+'/0', 'add': '/su/tsa/add-user/'+this.routStrArr[this.routStrArr.length - 1] }
            }
            // this.loggedInUser.role_id == '1' ? (this.getServiceTypeList(atob(this.routStrArr[this.routStrArr.length - 1])),this.isTSA = true) : this.getServiceTypeList();
        }catch(err){
            this.global.addException('employee review','ngOnInit()',err);
        }
        this.util.setPageTitle(this.route);
        
    }

    addEmp(){
        let self = this;
        this.errMsg = '';
        this.isError = false;
        this.submitted = true;
        let imgDocPriArr = this.util.getDocumentObj();
        try{
            let reqObject:any = JSON.parse(JSON.stringify(this.empObj));
            console.log(reqObject);
            let formData:FormData = new FormData();
            let thumbnail: number = -1;
            for (let key in reqObject.days_off[0]){
                reqObject.days_off[0][key] = reqObject.days_off[0][key] ? 1 : 0;
            }
            let url;
            if(this.loggedInUser.role_id == '1'){
                url = reqObject.id != 0 ? 'user/edit/'+this.routStrArr[this.routStrArr.length - 1] : 'user/add/'+this.routStrArr[this.routStrArr.length - 1] ;
            }else{
                url = reqObject.id != 0 ? 'user/edit' : 'user/add' ;
            }
            reqObject.id ? formData.append('user_id', reqObject.id) : '' ;
            formData.append('userType', 'EMPLOYEE' );
            formData.append('first_name', reqObject.first_name );
            formData.append('last_name', reqObject.last_name );
            formData.append('username', reqObject.username ? reqObject.username : '' );
            formData.append('employee_id', reqObject.employee_id );
            //formData.append('designation', reqObject.designation );
            formData.append('role_id', reqObject.role_id );
            formData.append('title', reqObject.title );
            formData.append('email_id', reqObject.email_id );
            formData.append('permission_role_id', reqObject.permission_role_id ? reqObject.permission_role_id : '');
            formData.append('wage_frequency', reqObject.wage_frequency ? reqObject.wage_frequency : '' );
            formData.append('wage_amount', reqObject.wage_amount ? reqObject.wage_amount : '' );
            formData.append('mobile_no', self.util.unMaskPhoneNumber(reqObject.mobile_no) );
            formData.append('work_phone',  reqObject.work_phone ? self.util.unMaskPhoneNumber(reqObject.work_phone) : '' );
            formData.append('emergency_contact', reqObject.emergency_contact );
            formData.append('emergency_number', self.util.unMaskPhoneNumber(reqObject.emergency_number) );
            formData.append('relationship', reqObject.relationship );
            formData.append('company_id', self.util.getCompanyId() );
            formData.append('country_code', self.util.getCountryCode() );
            formData.append('fileCount', imgDocPriArr.length.toString());
            //console.log(reqObject.user_services);
            formData.append('user_services', reqObject.user_services);
            formData.append('additional_fields',JSON.stringify(reqObject.additional_fields));
            formData.append('days_off',JSON.stringify(reqObject.days_off));

            formData.append('address_line_1', reqObject.address1 ? reqObject.address1 : '' );
            formData.append('address_line_2', ( reqObject.address2 == null || reqObject.address2 == 'null' ) ? '' : reqObject.address2 );
            formData.append('country_id', reqObject.countryId );
            formData.append('province_id', reqObject.provinceId );
            formData.append('city_id', reqObject.cityId );
            formData.append('postal_code', reqObject.postalCode );
            formData.append('latitude', reqObject.latitude );
            formData.append('longitude', reqObject.longitude );
            
            for (let i = 0; i < imgDocPriArr.length; i++) {
                if(imgDocPriArr[i].thumbnail == 1){ thumbnail = i }; 
                if(reqObject.id){
                    formData.append( 'fileId'+(i+1), imgDocPriArr[i].fileId );
                    formData.append( 'isDelete'+(i+1), imgDocPriArr[i].fileId == 0 ? 0 : imgDocPriArr[i].isDelete );
                    formData.append( 'fileType'+(i+1), imgDocPriArr[i].extension );
                }
                imgDocPriArr[i].fileId == 0 ? formData.append('fileUploaded'+(i+1), imgDocPriArr[i].file) : '';
                formData.append('description'+(i+1), imgDocPriArr[i].description == '' ? "" : imgDocPriArr[i].description);
                formData.append('fileName'+(i+1), imgDocPriArr[i].fileName == '' ? "" : imgDocPriArr[i].fileName+'.'+imgDocPriArr[i].extension);
            }
            formData.append('thumbnail', JSON.stringify(thumbnail));
            //console.log("reqObject= ",reqObject);
            self.util.addSpinner('add-emp-btn', "Submit");
            this.file.formDataAPICall(formData, url, function(error: boolean, response: any){
                self.util.removeSpinner('add-emp-btn', "Submit");
                if( error ){
                    self.errMsg = response.message;
                    self.isError = true;
                    //console.log(response.message);
                }else{    
                    //console.log(response.message);  
                    sessionStorage.removeItem('emp');
                    self.util.showDialog(DialogComponent, response.message,  reqObject.id != 0 ? [self.routeObj.list] : [self.routeObj.list, self.routeObj.add]);
                }        
            });
        }
        catch(err){
            this.global.addException('employer review','addEmp()',err);
        }
    }

    cancel(): void {
        
        if(this.loggedInUser.role_id == '1'){
            this.router.navigate(['/su/tsa/users-list/'+this.routStrArr[this.routStrArr.length - 1]+'/0' ]);
        }else{
            this.router.navigate([this.routeObj.list]);
        }
    }

    editEmp(): void {
        sessionStorage.setItem('previousPage', 'review');
        
        if(this.loggedInUser.role_id == '1'){
            this.router.navigate(['/su/tsa/add-user/'+this.routStrArr[this.routStrArr.length - 1] ]);
        }else{
            this.router.navigate([this.routeObj.add]);
        }
    }
}
