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
  selector: 'app-wo-contractor-review',
  templateUrl: './wo-contractor-review.component.html',
  styleUrls: ['./wo-contractor-review.component.scss']
})
export class WoContractorReviewComponent implements OnInit {

  public userInfo:any;
  today: number = Date.now();
  public subContractor: any = {};
  private routeObj: any;
  public isExternalWO:boolean = false;
  public errMsg: string = '';
  public isError: boolean = false;
  public isBack: boolean = false;
  public isEdit: boolean = false;
  public WOSubContractorObj: any = {};
  public repeatOn:any[] = [];
  constructor(
    public dialog: MatDialog,
    public util:UtilService,
    public http:HttpService,
    public global:GlobalService,
    public router: Router, 
    private fb: FormBuilder,
    public constant: ConstantsService,
    private WOService: WorkOrderService,
    public route: ActivatedRoute,
    @Inject(APP_CONFIG)
    private config: AppConfig 
  ) {
      console.log("CREATE_WO",localStorage.getItem('CREATE_WO'));
      if(localStorage.getItem('CREATE_WO')){
        this.WOSubContractorObj = JSON.parse(localStorage.getItem('CREATE_WO'));
        console.log("this.WOSubContractorObj",this.WOSubContractorObj);
        //this.WOSubContractorObj.project_estimate_id ? this.getQuotation(this.WOSubContractorObj.project_estimate_id) : '';
        if(this.WOSubContractorObj.WO_TYPE == 'Internal Contractor'){
          this.subContractor.generated_by = JSON.parse(atob(localStorage.getItem('USER')));
         
        }else{
          //this.getQuotation(this.WOSubContractorObj.project_estimate_id);
        }
      }
   }

  ngOnInit() {
    this.util.menuChange({'menu':4,'subMenu':26});
    this.util.setPageTitle(this.route);
    window.scrollTo(0, 0);
    if(localStorage.getItem('USER')){
        this.userInfo = JSON.parse(atob(localStorage.getItem('USER')));
    }
    if(sessionStorage.getItem('WO_CONTRACTOR_DETAILS')){
        this.subContractor = JSON.parse(sessionStorage.getItem('WO_CONTRACTOR_DETAILS'));
        console.log("subContractor=",this.subContractor);
        if(this.subContractor.schedules[0].schedule_type == 2) {
              // this.pageData.repeatOn:any[] = [];
              this.subContractor.schedules[0].days_off[0].monday ? this.repeatOn.push(' Mon') : '';
              this.subContractor.schedules[0].days_off[0].tuesday ? this.repeatOn.push(' Tue') : '';
              this.subContractor.schedules[0].days_off[0].wednesday ? this.repeatOn.push(' Wed') : '';
              this.subContractor.schedules[0].days_off[0].thursday ? this.repeatOn.push(' Thu') : '';
              this.subContractor.schedules[0].days_off[0].friday ? this.repeatOn.push(' Fri') : '';
              this.subContractor.schedules[0].days_off[0].saturday ? this.repeatOn.push(' Sat') : '';
              this.subContractor.schedules[0].days_off[0].sunday ? this.repeatOn.push(' Sun') : '';
              // pageData.scheduleDetails.schedule_days.Mon
              console.log(this.repeatOn);
          }
       
    }
    this.isEdit = this.WOSubContractorObj.WO_TYPE == 'Edit Contractor' ? true : false; 
  }
  createNewWorkOrder(){
		let self = this;
		try{
        let reqObj:any = {};
        reqObj = JSON.parse(JSON.stringify(this.subContractor));
        reqObj.paymentSchedules = this.subContractor.payment_schedules;
        delete reqObj.payment_schedules;
        reqObj.shipping_and_handling = this.subContractor.shipping_handling;
        delete reqObj.shipping_handling;
        delete reqObj.schedules;
        reqObj.subtotal = this.subContractor.sub_total;
        reqObj.schedule = this.subContractor.schedules;
        if(reqObj.repairInfo){
          reqObj.maintenance_request_id = reqObj.repairInfo ? reqObj.repairInfo.maintenance_request_id : '';
          reqObj.is_repairing_asset = reqObj.repairInfo ? reqObj.repairInfo.maintenance_request_id ? 1 : 0 : '';
          reqObj.asset_id = reqObj.repairInfo ? reqObj.repairInfo.asset_id : '';  
        }
        
					console.log("Request Ext WO",reqObj,JSON.stringify(reqObj));
          self.util.addSpinner('saveWorkOrder', "Submit");
          if(this.WOSubContractorObj.WO_TYPE == 'Edit Contractor'){
            this.http.doPost('WorkOrder/edit',reqObj,function(error: boolean, response: any){
              self.util.removeSpinner('saveWorkOrder', "Submit");
              if(error){
                self.isError = true;
                self.errMsg = response.message;
              }else{
                console.log("Ext Work Order Edited",response);
                localStorage.removeItem('CREATE_WO');
                sessionStorage.removeItem('WO_CONTRACTOR_DETAILS');
                self.util.showDialog(DialogComponent, response.message, ['/workflow/wo/csa/work-order-list/0']);
                
              }
            });
          }else{
            this.http.doPost('WorkOrder',reqObj,function(error: boolean, response: any){
              self.util.removeSpinner('saveWorkOrder', "Submit");
              if(error){
                self.isError = true;
                self.errMsg = response.message;
              }else{
                console.log("Ext Work Order Created",response);
                localStorage.removeItem('CREATE_WO');
                sessionStorage.removeItem('WO_CONTRACTOR_DETAILS');
                self.util.showDialog(DialogComponent, response.message, ['/workflow/wo/csa/work-order-list/0']);
                
              }
            });
          }
					
          
          
			}catch(err){
				this.global.addException('External Work Order','createExtWorkOrder()',err);
		}
  }
  
  edit(){
    // if(type == 'internal'){
    //     this.router.navigate(['/workflow/wo/csa/work-order/services']);
    // }else if(type == 'external'){
    // }
    this.router.navigate(['/workflow/wo/csa/wo-sub-contractor']);
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
    try{
        let reqObj:any = {};
        reqObj = JSON.parse(JSON.stringify(this.subContractor));
        reqObj.paymentSchedules = this.subContractor.payment_schedules;
        delete reqObj.payment_schedules;
        reqObj.shipping_and_handling = this.subContractor.shipping_handling;
        delete reqObj.shipping_handling;
        delete reqObj.schedules;
        reqObj.subtotal = this.subContractor.sub_total;
        reqObj.schedule = this.subContractor.schedules;
        if(reqObj.repairInfo){
        reqObj.maintenance_request_id = reqObj.repairInfo ? reqObj.repairInfo.maintenance_request_id : '';
        reqObj.is_repairing_asset = reqObj.repairInfo ? reqObj.repairInfo.maintenance_request_id ? 1 : 0 : '';
        reqObj.asset_id = reqObj.repairInfo ? reqObj.repairInfo.asset_id : '';  
        }
        
        console.log("Request Ext WO",reqObj,JSON.stringify(reqObj));
        self.util.addSpinner(btnId, btnTxt);
        if(this.WOSubContractorObj.WO_TYPE == 'Edit Contractor'){
            this.http.doPost('WorkOrder/edit',reqObj,function(error: boolean, response: any){
            self.util.removeSpinner(btnId, btnTxt);
            if(error){
                self.isError = true;
                self.errMsg = response.message;
            }else{
                console.log("Ext Work Order Edited",response);
                localStorage.removeItem('CREATE_WO');
                sessionStorage.removeItem('WO_CONTRACTOR_DETAILS');
                self.util.showDialog(DialogComponent, response.message, ['/workflow/wo/csa/work-order-list/0']);
                
            }
            });
        }else{
            this.http.doPost('WorkOrder',reqObj,function(error: boolean, response: any){
            self.util.removeSpinner(btnId, btnTxt);
            if(error){
                self.isError = true;
                self.errMsg = response.message;
            }else{
                console.log("Ext Work Order Created",response);
                localStorage.removeItem('CREATE_WO');
                sessionStorage.removeItem('WO_CONTRACTOR_DETAILS');
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
                self.util.showDialog(DialogComponent, response.message, ['/workflow/wo/csa/work-order-list/0']);
                
            }
            });
        }  
        }catch(err){
            this.global.addException('External Work Order','previewDataSave()',err);
    }
  }
  downloadPDFDoc(dataDownload) {
    window.open(dataDownload);
  }
  preview(dataPreview) {
    window.open(dataPreview);
  }

}
