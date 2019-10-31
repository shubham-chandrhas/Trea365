import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { FormControl, FormGroup, FormBuilder, FormArray, Validators, NgForm, AbstractControl } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { startWith } from 'rxjs/operators/startWith';
import { map } from 'rxjs/operators/map';
import { ElementRef, NgZone, ViewChild } from '@angular/core';

import { UtilService } from '../../../../shared/service/util.service';
import { HttpService } from '../../../../shared/service/http.service';
import { GlobalService } from '../../../../shared/service/global.service';
import { ConstantsService } from '../../../../shared/service/constants.service';

import { WorkOrderDialog } from '../work-order-dialog.component';
import { WorkOrderService } from '../work-order.service';
import { DialogComponent } from '../../../../shared/model/dialog/dialog.component';
import { APP_CONFIG, AppConfig } from '../../../../app-config.module';



@Component({
    selector: 'app-work-order-review',
    templateUrl: './work-order-review.component.html',
    styleUrls: ['./work-order-review.component.css']
})
export class WorkOrderReviewComponent implements OnInit {
    public userInfo:any;
    today: number = Date.now();
    public pageData:any;
    public repeatOn:any[] = [];
    private routeObj: any;
    public isExternalWO:boolean = false;
    public errMsg: string = '';
    public isError: boolean = false;

    woType: string;
    constructor(
        public dialog: MatDialog,
        public util:UtilService,
        public http:HttpService,
        public global:GlobalService,
        public router: Router, 
        private route: ActivatedRoute,
        private fb: FormBuilder,
        public constant: ConstantsService,
        private WOService: WorkOrderService,
        @Inject(APP_CONFIG)
        private config: AppConfig 
    ) { }

    ngOnInit() {
        this.util.menuChange({'menu':4,'subMenu':26});
        window.scrollTo(0, 0);
        this.util.setPageTitle(this.route);
        this.routeObj = { 'list': '/workflow/wo/csa/work-order-list/0', 'add': '/workflow/wo/csa/work-order/services' };
        this.userInfo = JSON.parse(atob(localStorage.getItem('USER')));
        
        console.log("ngOnInit WorkOrderReviewComponent ::: ", JSON.stringify(JSON.parse(sessionStorage.getItem('WO_DETAILS'))));
        this.pageData = sessionStorage.getItem('WO_DETAILS') ? JSON.parse(sessionStorage.getItem('WO_DETAILS')) : {};
        this.woType = this.pageData.project_estimate_id ? 'external' : 'internal'; 

        if(this.woType == 'external'){
            this.pageData.scheduleDetails = this.pageData.scheduleInfo.schedule_items[0];
        }

        if(this.pageData.scheduleDetails.schedule_type == 2) {
            this.pageData.scheduleDetails.schedule_days.Mon ? this.repeatOn.push(' Mon') : '';
            this.pageData.scheduleDetails.schedule_days.Tue ? this.repeatOn.push(' Tue') : '';
            this.pageData.scheduleDetails.schedule_days.Wed ? this.repeatOn.push(' Wed') : '';
            this.pageData.scheduleDetails.schedule_days.Thu ? this.repeatOn.push(' Thu') : '';
            this.pageData.scheduleDetails.schedule_days.Fri ? this.repeatOn.push(' Fri') : '';
            this.pageData.scheduleDetails.schedule_days.Sat ? this.repeatOn.push(' Sat') : '';
            this.pageData.scheduleDetails.schedule_days.Sun ? this.repeatOn.push(' Sun') : '';
            console.log(this.repeatOn);
        }
        console.log(this.pageData);
    }

    edit() {
        try {
            this.pageData.assetsDetails ? this.pageData.assetsDetails.filter(item => (item.start_date = this.util.getYYYYMMDDDate(this.util.stringToDate(item.start_date)), item.end_date = this.util.getYYYYMMDDDate(this.util.stringToDate(item.end_date)))) : '';
            this.pageData.teamDetails ? this.pageData.teamDetails.filter(item => (item.start_date = this.util.getYYYYMMDDDate(this.util.stringToDate(item.start_date)), item.end_date = this.util.getYYYYMMDDDate(this.util.stringToDate(item.end_date)))) : '';
            this.pageData.scheduleInfo.schedule_items.filter(item => (item.start_date = this.util.getYYYYMMDDDate(this.util.stringToDate(item.start_date)), item.end_date = this.util.getYYYYMMDDDate(this.util.stringToDate(item.end_date))));
            sessionStorage.setItem('WO_DETAILS', JSON.stringify(this.pageData));

            if (this.woType == 'internal') {
                this.router.navigate(['/workflow/wo/csa/work-order/services']);
            } else {
                this.router.navigate(['/workflow/wo/csa/wo-external/services']);
            }
        }
        catch (err) {
            this.global.addException('Review Quotation', 'edit()', err,{  'routeURL': '/workflow/wo/csa/wo-external/services' + this.pageData.assetsDetails  });
           }
    }

    submit(){
        let self = this;
        self.isError = false;
        self.errMsg = '';
        try{
            let woDetails:any = JSON.parse(JSON.stringify(this.pageData));
            let reqObj: any = {
                'assign_to': 1,
                'status': 1,
                'cost_of_services': '',
                'shipping_and_handling': '',
                'adjustment': '',
                'subtotal': '',
                'taxes': '',
                'total_cost': '',
                'require_client_sign': this.woType == 'external' ? woDetails.require_client_sign : 0,
                'work_order_type': this.woType == 'external' ? 2 : 1,
                'is_repairing_asset': this.woType == 'external' ? 0 : 1,
                'client_id': this.woType == 'external' ? woDetails.work_location.client_id : '',
                'project_estimate_id': this.woType == 'external' ? woDetails.project_estimate_id : '',
                'asset_id': this.woType == 'external' ? '' : woDetails.repairInfo ? woDetails.repairInfo.asset_id : '',
                'work_location_id': this.woType == 'external' ? woDetails.work_location.client_work_location_id : woDetails.repairInfo ? woDetails.repairInfo.location_id : woDetails.work_location.client_work_location_id,
            };
            
            if(this.woType == 'internal'){
                reqObj.asset_details = woDetails.scheduleInfo.asset_details;
                reqObj.maintenance_request_id = woDetails.scheduleInfo.maintenance_request_id;
                reqObj.supplier_id = woDetails.scheduleInfo.supplier_id;
            }

            reqObj.schedule = [{
                'start_date':  this.util.getYYYYMMDDDate(this.util.stringToDate(woDetails.scheduleDetails.start_date)),
                'end_date':  this.util.getYYYYMMDDDate(this.util.stringToDate(woDetails.scheduleDetails.end_date)),
                'start_time': woDetails.scheduleDetails.start_time,
                'start_time_format': woDetails.scheduleDetails.start_time_format,
                'end_time': woDetails.scheduleDetails.end_time,
                'end_time_format': woDetails.scheduleDetails.end_time_format,
                'schedule_days': woDetails.scheduleDetails.schedule_days,
                'end_after_occurences': woDetails.scheduleDetails.end_after_occurences,
                'schedule_repeat_name': woDetails.scheduleDetails.schedule_repeat_name,
                'schedule_repeat': woDetails.scheduleDetails.schedule_repeat,
                'schedule_type': woDetails.scheduleDetails.schedule_type,
                'scheduling_id': woDetails.scheduleDetails.scheduling_id,
            }];
            reqObj.services = woDetails.servicesDetails.services;
            reqObj.team = woDetails.teamDetails.filter(item=> (item.start_date = this.util.getYYYYMMDDDate(this.util.stringToDate(item.start_date)),item.end_date = this.util.getYYYYMMDDDate(this.util.stringToDate(item.end_date)) ));
            reqObj.assets = woDetails.assetsDetails ? woDetails.assetsDetails.filter(item=> (item.start_date = this.util.getYYYYMMDDDate(this.util.stringToDate(item.start_date)),item.end_date = this.util.getYYYYMMDDDate(this.util.stringToDate(item.end_date)) )) : [];
            reqObj.productMaterial = woDetails.materialsDetails;
            reqObj.paymentSchedules = [];

            console.log("Request Ext WO ",reqObj);
            self.util.addSpinner('submit', "Submit");
            this.http.doPost('WorkOrder', reqObj, function(error: boolean, response: any){
                self.util.removeSpinner('submit', "Submit");
                console.log(response);
                if( error ){
                    self.isError = true;
                    self.errMsg = response.message;
                }else{
                    sessionStorage.removeItem('PO_INFO');
                    sessionStorage.removeItem('WO_DETAILS');
                    self.WOService.WO_DATA = {};
                    self.util.showDialog(DialogComponent, response.message, [self.routeObj.list, self.routeObj.add]);
                }
            });

        }catch(err){
            this.global.addException('Work Order Review','submit()',err);
        }
    }

    previewDoc(): void {
        this.previewDataSave('previewBtn', "Preview",'PREVIEW');
    }
    downloadPDF(): void {
        this.previewDataSave('downloadPDF', "Download as PDF", 'PDF');
    }

    previewDataSave(btnId, btnTxt, actionDoc)
    {
        let self = this;
        self.isError = false;
        self.errMsg = '';
        try{
            let woDetails:any = JSON.parse(JSON.stringify(this.pageData));
            let reqObj: any = {
                'assign_to': 1,
                'status': 1,
                'cost_of_services': '',
                'shipping_and_handling': '',
                'adjustment': '',
                'subtotal': '',
                'taxes': '',
                'total_cost': '',
                'require_client_sign': this.woType == 'external' ? woDetails.require_client_sign : 0,
                'work_order_type': this.woType == 'external' ? 2 : 1,
                'is_repairing_asset': this.woType == 'external' ? 0 : 1,
                'client_id': this.woType == 'external' ? woDetails.work_location.client_id : '',
                'project_estimate_id': this.woType == 'external' ? woDetails.project_estimate_id : '',
                'asset_id': this.woType == 'external' ? '' : woDetails.repairInfo ? woDetails.repairInfo.asset_id : '',
                'work_location_id': this.woType == 'external' ? woDetails.work_location.client_work_location_id : woDetails.repairInfo ? woDetails.repairInfo.location_id : woDetails.work_location.client_work_location_id,
            };
            
            if(this.woType == 'internal'){
                reqObj.asset_details = woDetails.scheduleInfo.asset_details;
                reqObj.maintenance_request_id = woDetails.scheduleInfo.maintenance_request_id;
                reqObj.supplier_id = woDetails.scheduleInfo.supplier_id;
            }

            reqObj.schedule = [{
                'start_date':  this.util.getYYYYMMDDDate(this.util.stringToDate(woDetails.scheduleDetails.start_date)),
                'end_date':  this.util.getYYYYMMDDDate(this.util.stringToDate(woDetails.scheduleDetails.end_date)),
                'start_time': woDetails.scheduleDetails.start_time,
                'start_time_format': woDetails.scheduleDetails.start_time_format,
                'end_time': woDetails.scheduleDetails.end_time,
                'end_time_format': woDetails.scheduleDetails.end_time_format,
                'schedule_days': woDetails.scheduleDetails.schedule_days,
                'end_after_occurences': woDetails.scheduleDetails.end_after_occurences,
                'schedule_repeat_name': woDetails.scheduleDetails.schedule_repeat_name,
                'schedule_repeat': woDetails.scheduleDetails.schedule_repeat,
                'schedule_type': woDetails.scheduleDetails.schedule_type,
                'scheduling_id': woDetails.scheduleDetails.scheduling_id,
            }];
            reqObj.services = woDetails.servicesDetails.services;
            reqObj.team = woDetails.teamDetails.filter(item=> (item.start_date = this.util.getYYYYMMDDDate(this.util.stringToDate(item.start_date)),item.end_date = this.util.getYYYYMMDDDate(this.util.stringToDate(item.end_date)) ));
            reqObj.assets = woDetails.assetsDetails ? woDetails.assetsDetails.filter(item=> (item.start_date = this.util.getYYYYMMDDDate(this.util.stringToDate(item.start_date)),item.end_date = this.util.getYYYYMMDDDate(this.util.stringToDate(item.end_date)) )) : [];
            reqObj.productMaterial = woDetails.materialsDetails;
            reqObj.paymentSchedules = [];

            console.log("Request Ext WO ",reqObj);
            self.util.addSpinner(btnId, btnTxt);
            this.http.doPost('WorkOrder', reqObj, function(error: boolean, response: any){
                self.util.removeSpinner(btnId, btnTxt);
                console.log(response);
                if( error ){
                    self.isError = true;
                    self.errMsg = response.message;
                }else{
                    sessionStorage.removeItem('PO_INFO');
                    sessionStorage.removeItem('WO_DETAILS');
                    self.WOService.WO_DATA = {};
                    var randomNo = response.data.wo_random_number;
                    var pdfLink =
                    self.config.pdfEndpoint +
                    "work-order/" +randomNo
                    +
                    "/pdf";
                    var previewLink =
                    self.config.pdfEndpoint +
                    "work-order/" +
                    randomNo;

                    if(actionDoc === 'PDF') {
                        self.downloadPDFDoc(pdfLink);
                    } else if(actionDoc === 'PREVIEW'){
                        self.preview(previewLink);
                    } else{

                    }
                    self.util.showDialog(DialogComponent, response.message, [self.routeObj.list, self.routeObj.add]);
                }
            });

        }catch(err){
            this.global.addException('Work Order Review','previewDataSave()',err);
        }
        
    }
    downloadPDFDoc(dataDownload) {
        window.open(dataDownload);
    }
    preview(dataPreview) {
        window.open(dataPreview);
    }
}
