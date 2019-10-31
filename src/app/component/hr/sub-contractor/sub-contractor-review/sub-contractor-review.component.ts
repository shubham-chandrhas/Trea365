import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

import { EmployeeDialog } from '../../employee/employee-dialog.component';
import { HrService } from '../../hr.service';
import { FileService } from '../../../../shared/service/file.service';
import { UtilService } from '../../../../shared/service/util.service';
import { DialogComponent } from '../../../../shared/model/dialog/dialog.component';
import { GlobalService } from '../../../../shared/service/global.service';

@Component({
  selector: 'app-sub-contractor-review',
  templateUrl: './sub-contractor-review.component.html',
  styleUrls: ['./sub-contractor-review.component.css']
})
export class SubContractorReviewComponent implements OnInit {

  subConObj:any;
  errMsg = '';
  isError = false;
  submitted = false;
  action: string = 'add';
  private routeObj: any;
  //defaultLocation: string = "";
  constructor(
    public util: UtilService, 
    private file: FileService, 
    public router: Router, 
    private route: ActivatedRoute,
    private hr: HrService,
    public dialog: MatDialog,
    private global: GlobalService,
){

      this.subConObj=JSON.parse(sessionStorage.getItem('subContractor'));
      this.subConObj.imgDocArr = this.util.getDocumentObj();
      this.action = this.subConObj.id != 0 ? 'edit' : 'add';
      //console.log(JSON.stringify(this.subConObj));
      console.log(this.subConObj);
    //   if((this.subConObj.latitude=='' || this.subConObj.latitude ==null) && (this.subConObj.longitude=='' || this.subConObj.longitude==null))
    //     {
    //         this.defaultLocation = this.subConObj.address1+', '+this.subConObj.cityId+', '+this.subConObj.provinceId+', '+this.subConObj.countryName;
    //     }
    //     else
    //     {
    //         this.defaultLocation = this.subConObj.address1;
    //     }
  }

  ngOnInit() { 
     this.util.setWindowHeight();
     this.util.setPageTitle(this.route);
    this.router.url.split('/')[2]=='csa-onboarding' ? (this.util.menuChange({'menu':'guide','subMenu':''}),this.routeObj = { 'list': '/csa-onboarding/guide', 'add': '/hr/csa-onboarding/add-subcontractor' }) : (this.util.menuChange({'menu':6,'subMenu':29}),this.routeObj = { 'list': '/hr/csa/sub-contractor-list/0', 'add': '/hr/csa/add-subcontractor' });
  }

  addSubContractor(){
    let self = this;
    this.errMsg = '';
    this.isError = false;
    this.submitted = true;
    let imgDocPriArr = this.util.getDocumentObj();
    let reqObject:any = JSON.parse(JSON.stringify(this.subConObj));
    let formData:FormData = new FormData();
    let thumbnail: number = -1;
    for (let key in reqObject.days_off[0]){
        reqObject.days_off[0][key] = reqObject.days_off[0][key] ? 1 : 0;
    }
    let url = reqObject.id != 0 ? 'user/edit' : 'user/add' ;
    reqObject.id ? formData.append('user_id', reqObject.id) : '' ;
    formData.append('userType', 'SUB-CONTRACTOR' );
    formData.append('first_name', reqObject.first_name );
    formData.append('last_name', reqObject.last_name );
    formData.append('username', reqObject.username );
    formData.append('title', reqObject.title );
    formData.append('email_id', reqObject.email_id );
    formData.append('wage_amount', reqObject.wage_amount );
    formData.append('mobile_no', self.util.unMaskPhoneNumber(reqObject.mobile_no) );
    formData.append('work_phone', self.util.unMaskPhoneNumber(reqObject.work_phone) );
    formData.append('emergency_contact', reqObject.emergency_contact );
    formData.append('emergency_number', self.util.unMaskPhoneNumber(reqObject.emergency_number) );
    formData.append('relationship', reqObject.relationship );
    formData.append('user_services', reqObject.user_services );
    formData.append('company_id', self.util.getCompanyId() );
    formData.append('country_code', self.util.getCountryCode() );
    formData.append('fileCount', imgDocPriArr.length.toString());
    console.log(reqObject.user_services);
    formData.append('user_services', reqObject.user_services);
    formData.append('additional_fields',JSON.stringify(reqObject.additional_fields));
    formData.append('days_off',JSON.stringify(reqObject.days_off));
    formData.append('address_line_1', reqObject.address1 );
    formData.append('address_line_2', (reqObject.address2 == null || reqObject.address2 == 'null' ) ? '' : reqObject.address2 );
    formData.append('country_id', reqObject.countryId );
    formData.append('province_id', reqObject.provinceId );
    formData.append('city_id', reqObject.cityId );
    formData.append('postal_code', reqObject.postalCode );
    formData.append('latitude', reqObject.latitude );
    formData.append('longitude', reqObject.longitude );
    for (var i = 0; i < imgDocPriArr.length; i++) {
        if(imgDocPriArr[i].thumbnail == 1){ thumbnail = i };
        if(reqObject.id){
            formData.append( 'fileId'+(i+1), imgDocPriArr[i].fileId );
            formData.append( 'isDelete'+(i+1), imgDocPriArr[i].fileId == 0 ? 0 : imgDocPriArr[i].isDelete );
            formData.append( 'fileType'+(i+1), imgDocPriArr[i].extension );
        }
        imgDocPriArr[i].fileId == 0 ? formData.append('fileUploaded'+(i+1), imgDocPriArr[i].file) : '';         
        formData.append('fileUploaded'+(i+1), imgDocPriArr[i].file);
        formData.append('description'+(i+1), imgDocPriArr[i].description == '' ? "" : imgDocPriArr[i].description);
        formData.append('fileName'+(i+1), imgDocPriArr[i].fileName == '' ? "" : imgDocPriArr[i].fileName+'.'+imgDocPriArr[i].extension);
    }
    formData.append('thumbnail', JSON.stringify(thumbnail));
    console.log("reqObject= ",reqObject);
    self.util.addSpinner('add-emp-btn', "Submit");
    try{ 
        console.log("form data : ");
        console.log(formData);
        this.file.formDataAPICall(formData, url, function(error: boolean, response: any){
            self.util.removeSpinner('add-emp-btn', "Submit");
            if( error ){
                self.errMsg = response.message;
                self.isError = true;
            }else{    
                sessionStorage.removeItem('subContractor');
                self.util.showDialog(DialogComponent, response.message,  reqObject.id != 0 ? [self.routeObj.list] : [self.routeObj.list, self.routeObj.add]);
            }        
        });
    }
    catch(err){
        this.global.addException('sub contractor review','addSubContractor()',err);
    }
}

editSubContractor(): void{
  sessionStorage.setItem('previousPage', 'review');
  this.router.navigate([this.routeObj.add]);
}

cancelSubCotractorReview(){
  this.router.navigate([this.routeObj.list]);
  }
}
