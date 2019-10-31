import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';

import { UtilService } from '../../../../shared/service/util.service';
import { ProjectEstimatorService } from '../project-estimator.service';
import { DialogComponent } from '../../../../shared/model/dialog/dialog.component';
import { ProjectEstimatorDialog } from '../project-estimator-dialog.component';
import { GlobalService } from '../../../../shared/service/global.service';
import { APP_CONFIG, AppConfig } from '../../../../app-config.module';
@Component({
    selector: 'app-quotation-review',
    templateUrl: './quotation-review.component.html',
    styleUrls: ['./quotation-review.component.css']
})
export class QuotationReviewComponent implements OnInit {
    quotationDetails: any = {};
    errMsg: string = '';
    isError: boolean = false;
    versionlist: any='';
    versions: any[] = [];
    totalScheduledPay: number = 0;
    remainingPayment: number = 0;
    quotationStatus: boolean = false;
    serviceMaterialStatus: boolean = false;
    paymentScheduleStatus: boolean = false;
    scheduleStatus: boolean = false;

    scheduleWithDetails: boolean = false;
    scheduleWithoutDetails: boolean = false;

    // action:string='';
    constructor(
        public dialog: MatDialog,
		public util:UtilService,
        public router: Router,
        private route: ActivatedRoute,
        public PEService:ProjectEstimatorService,
        private global: GlobalService,
        @Inject(APP_CONFIG)
        private config: AppConfig
    ) { }

    ngOnInit() {
      // debugger;
        this.totalScheduledPay = 0;
        this.remainingPayment = 0;
        this.util.menuChange({'menu':4,'subMenu':25});
          this.util.setWindowHeight();
          this.util.setPageTitle(this.route);
        //console.log("Review :: ngOnInit()");
        //console.log(sessionStorage.getItem('quotationDetails'));
        this.quotationDetails = JSON.parse(sessionStorage.getItem('quotationDetails'));
        console.log('quotationDetails == ==========',this.quotationDetails);
        if(this.quotationDetails.scheduleDetails){
            if(this.quotationDetails.scheduleDetails.schedule_type_name == 'Not Known')
            {
                this.scheduleWithoutDetails = true;
            }
        }
        this.checkScheduleDetails();
        this.PEService.siteInspection = this.quotationDetails.site_inspection;
        //console.log("session"+JSON.stringify(this.quotationDetails),this.quotationDetails.scheduleDetails);
        if(this.quotationDetails.scheduleDetails){
            this.quotationDetails.scheduleDetails.start_time = this.quotationDetails.scheduleDetails.start_time && this.quotationDetails.scheduleDetails.start_time != '' ? this.quotationDetails.scheduleDetails.start_time.substring(0,5) : '';

            this.quotationDetails.scheduleDetails.end_time = this.quotationDetails.scheduleDetails.end_time && this.quotationDetails.scheduleDetails.end_time != '' ? this.quotationDetails.scheduleDetails.end_time.substring(0,5): '';

            if(this.quotationDetails.scheduleDetails.start_date.indexOf('-') > -1)
                this.quotationDetails.scheduleDetails.start_date = this.util.getDDMMYYYYDate(this.quotationDetails.scheduleDetails.start_date);

            if(this.quotationDetails.scheduleDetails.end_date && this.quotationDetails.scheduleDetails.end_date.indexOf('-') > -1)
                this.quotationDetails.scheduleDetails.end_date = this.util.getDDMMYYYYDate(this.quotationDetails.scheduleDetails.end_date);

            this.quotationDetails.scheduleDetails.start_date =  this.util.stringToDate(this.quotationDetails.scheduleDetails.start_date);
            this.quotationDetails.scheduleDetails.end_date =  this.util.stringToDate(this.quotationDetails.scheduleDetails.end_date);
        }
        // else{
        //     delete this.quotationDetails.scheduleDetails;
        // }
        if(this.quotationDetails.clientDetails.client_billing_location == '' && this.quotationDetails.clientDetails.billingLocationSameAsWork == true){
            this.quotationDetails.clientDetails.client_billing_location = this.quotationDetails.clientDetails.location;
            this.quotationDetails.clientDetails.client_billing_location_id = this.quotationDetails.clientDetails.location_id;
        }

        this.quotationDetails.today = new Date();
        this.quotationDetails.generatedBy = JSON.parse(atob(localStorage.getItem('USER'))).first_name+" "+(JSON.parse(atob(localStorage.getItem('USER'))).last_name ? JSON.parse(atob(localStorage.getItem('USER'))).last_name : '');
        //console.log(this.quotationDetails.reviewVersion);
        if(this.quotationDetails.reviewVersion && this.quotationDetails.reviewVersion.length>0){
            this.quotationDetails.reviewVersion.forEach(value => {
                this.versions.push(value);
            });
        }else{
            this.versions=[];
        }
        if(sessionStorage.getItem('versionIndex')== null)
            this.versionlist='0';
        else
            this.versionlist= sessionStorage.getItem('versionIndex');



        //this.quotationDetails.subtotal = parseInt(this.quotationDetails.paymentScheduleDetails.cost_of_service) + parseInt(this.quotationDetails.paymentScheduleDetails.cost_of_material);

        let costOfService: any = 0, costOfMaterial: any = 0;

        if(this.quotationDetails.materialsDetails)
            this.quotationDetails.materialsDetails.materials.map(material => { costOfMaterial += parseFloat(material.total_amount) });

        if(this.quotationDetails.servicesDetails)
            this.quotationDetails.servicesDetails.services.map(service => { costOfService += parseFloat(service.total_amount) });
        let subTotal = parseFloat(costOfService)+parseFloat(costOfMaterial);
        let paymentDetails: any = JSON.parse(JSON.stringify(this.quotationDetails.paymentScheduleDetails));
        let shipping = paymentDetails.shipping_handling && paymentDetails.shipping_handling != '' && paymentDetails.shipping_handling != 0 ? parseFloat(paymentDetails.shipping_handling) : 0;
        let adjustment = paymentDetails.adjustment && paymentDetails.adjustment != '' && paymentDetails.adjustment != 0 ? parseFloat(paymentDetails.adjustment) : 0;
        let tax = paymentDetails.taxes && paymentDetails.taxes != '' && paymentDetails.taxes != 0 ? parseFloat(paymentDetails.taxes) : 0;
        let taxAmount = ((subTotal+shipping+adjustment)*(tax/100));
        let totalCost = (subTotal+shipping+adjustment+taxAmount);

        this.quotationDetails.paymentScheduleDetails.cost_of_service = costOfService;
        this.quotationDetails.paymentScheduleDetails.cost_of_material = costOfMaterial;
        this.quotationDetails.paymentScheduleDetails.subtotal = subTotal;
        this.quotationDetails.paymentScheduleDetails.shipping_handling = shipping;
        this.quotationDetails.paymentScheduleDetails.adjustment = adjustment;
        this.quotationDetails.paymentScheduleDetails.tax_amount = taxAmount;
        this.quotationDetails.paymentScheduleDetails.total_cost = totalCost;

        this.quotationDetails.paymentScheduleDetails.paymentTerm = paymentDetails.paymentTerm;
        this.quotationDetails.paymentScheduleDetails.scheduleType = paymentDetails.scheduleType;

        this.quotationDetails.paymentScheduleDetails.date_items.map(item => {
            this.totalScheduledPay += parseFloat(item.amount_due);
        });
        this.remainingPayment = parseFloat(this.quotationDetails.paymentScheduleDetails.total_cost) - this.totalScheduledPay;
        this.checkQuotationStatus();
    }

    setVersion(index){
        sessionStorage.removeItem('versionIndex');
        sessionStorage.setItem('versionIndex',index);
        //console.log("checksession"+sessionStorage.getItem('versionIndex'));
        this.quotationDetails ={};

        this.quotationDetails =JSON.stringify(this.versions[index]);

        this.quotationDetails= JSON.parse(this.quotationDetails);
        this.quotationDetails.reviewVersion=[];
        this.versions.forEach(value => {
            this.quotationDetails.reviewVersion.push(value);
        });

        this.quotationDetails.today=new Date();
        this.quotationDetails.generatedBy = JSON.parse(atob(localStorage.getItem('USER'))).first_name+" "+(JSON.parse(atob(localStorage.getItem('USER'))).last_name ? JSON.parse(atob(localStorage.getItem('USER'))).last_name : '');


    }
    // @Shubham : Date - 8/05/2019
    cancelPE()
    {
        this.PEService.updateFormStatus('materialsFm', false);
        this.PEService.updateFormStatus('paymentScheduleFm', false);
        this.PEService.updateFormStatus('scheduleFm', false);
        this.PEService.updateFormStatus('servicesFm', false);
        sessionStorage.removeItem('quotationDetails');
    }
    editQuotation(pe_id) {
        try {
            //sessionStorage.removeItem('versionIndex');
            // console.log("quotationDetails",this.quotationDetails);
            if (this.quotationDetails.scheduleDetails) {
                this.quotationDetails.scheduleDetails.start_date = this.util.getYYYYMMDDDate(this.quotationDetails.scheduleDetails.start_date);
                this.quotationDetails.scheduleDetails.end_date = this.util.getYYYYMMDDDate(this.quotationDetails.scheduleDetails.end_date);
            }
            //   console.log("quotationDetails",this.quotationDetails);
            sessionStorage.removeItem('quotationDetails');
            sessionStorage.setItem('quotationDetails', JSON.stringify(this.quotationDetails));

            this.router.navigate(['/workflow/quote/csa/quotation/services']);
        } catch (err) {
            this.global.addException('Review Quotation - Edit', 'editQuotation()', err, { 'routeURL': '/workflow/quote/csa/quotation/services' + this.quotationDetails.scheduleDetails });
        }
    }

    saveAPICall(btnId, btnTxt, option){
        let self = this;
        let action;
        let responseData;
        self.errMsg = '';
        self.isError = false;
        action = this.quotationDetails.project_estimate_id ? 'edit' : 'add';
        self.util.addSpinner(btnId, btnTxt);
        try {
            this.PEService.saveProjectEstimator(action, option, function (error: boolean, response: any) {
                self.util.removeSpinner(btnId, btnTxt);
                if (error) {
                    self.errMsg = response.message;
                    self.isError = true;
                } else {
                    if (btnId == 'saveAsDraft') {
                        sessionStorage.removeItem('quotationDetails');
                        responseData = self.PEService.setResponseForPE(response.data);
                        sessionStorage.setItem('quotationDetails', responseData);
                        console.log('data = =',sessionStorage.getItem('quotationDetails'));
                        self.ngOnInit();

                        //self.util.showDialog(DialogComponent, response.message, ['/workflow/quote/csa/quotation-review']);
                    }
                    self.PEService.updateFormStatus('materialsFm', false);
                    self.PEService.updateFormStatus('paymentScheduleFm', false);
                    self.PEService.updateFormStatus('servicesFm', false);
                    self.PEService.updateFormStatus('scheduleFm', false);
                    //else {
                        //self.util.showDialog(DialogComponent, response.message, ['/workflow/quote/csa/quotation-list/0']);
                    //}
                    self.util.showDialog(DialogComponent, response.message, ['/workflow/quote/csa/quotation-list/0']);
                }
            });
        } catch (err) {
            this.global.addException('Quotation - Save', 'saveAPICall()', err);
        }
    }

    showSaveForFollowUpPopup(){
        this.errMsg='';
        this.isError = false;
        if(this.quotationDetails.project_estimate_id){
                this.dialog.open(ProjectEstimatorDialog, { data: { 'action': 'saveForFollowUp' } });
        }else{
            this.errMsg="Save Quotation against selected client before follow up";
            this.isError = true;
        }
    }
    showSiteInspectionPopup(){
        this.errMsg='';
        this.isError = false;
        //console.log(this.quotationDetails);
        if(this.quotationDetails.project_estimate_id){
                this.dialog.open(ProjectEstimatorDialog, { data: { 'action': 'siteInspection' } });
        }else{
            this.errMsg="Save Quotation against selected client before schedule site inspection";
            this.isError = true;
        }
    }
    saveAsDraft(): void {
        this.saveAPICall('saveAsDraft', "Save", '');
        //this.PEService.saveProjectEstimator('pe-save-follow-up', 'SAVE_FOR_FOLLOW_UP');
    }


    sendQuote(): void {
        // if(!this.quotationStatus){
        //     this.isError = true;
        //     this.errMsg = "Quotation status is Incomplete, Please add remaining incomplete information.";
        //     return;
        // }
        this.saveAPICall('pe-send-quote', 'SendQuote', 'SEND_QUOTE');
        //this.PEService.saveProjectEstimator('pe-send-quote', 'SEND_QUOTE');
    }

    checkScheduleDetails(): void {
        if(this.quotationDetails.scheduleDetails && (this.quotationDetails.scheduleDetails.start_date == '' || this.quotationDetails.scheduleDetails.start_date == null) && (this.quotationDetails.scheduleDetails.end_date == '' || this.quotationDetails.scheduleDetails.end_date == null) && (this.quotationDetails.scheduleDetails.start_time == '' || this.quotationDetails.scheduleDetails.start_time == null) && (this.quotationDetails.scheduleDetails.end_time == '' || this.quotationDetails.scheduleDetails.end_time == null)){
            this.quotationDetails.scheduleDetails = null;
        }
    }

    checkQuotationStatus(): void {
        if((this.quotationDetails.scheduleDetails && this.quotationDetails.scheduleDetails.start_date != '' && this.quotationDetails.scheduleDetails.end_date != '' && this.quotationDetails.scheduleDetails.start_time != '' && this.quotationDetails.scheduleDetails.end_time != '') && (this.quotationDetails.servicesDetails.services.length > 0 || this.quotationDetails.materialsDetails.materials.length > 0)){
            // && ( this.quotationDetails.paymentScheduleDetails.total_cost == this.totalScheduledPay)
            this.quotationStatus = true;
        }
        if(this.quotationDetails.servicesDetails.services.length > 0 || this.quotationDetails.materialsDetails.materials.length > 0){
            this.serviceMaterialStatus = true;
        }

        //@@ Commented code by Yogesh for remove validation
        // if(this.quotationDetails.paymentScheduleDetails.total_cost == this.totalScheduledPay){
        //     this.paymentScheduleStatus = true;
        // }
    }

    // approve(note: string = ''): void {
    //     let updatedPE = JSON.parse(sessionStorage.getItem('quotationDetails'));
    //     updatedPE.approveNote = note;
    //     sessionStorage.setItem('quotationDetails', JSON.stringify(updatedPE));
    //     this.saveAPICall('pe-approve', 'Approve', 'APPROVE');
    //     this.util.changeEvent(null);
    //     //this.PEService.saveProjectEstimator('pe-approve', 'APPROVE');
    // }

    showConfirmation(): void {
        // if(!this.quotationStatus){
        //     this.isError = true;
        //     this.errMsg = "Quotation status is Incomplete, Please add remaining incomplete information.";
        //     return;
        // }
        this.dialog.open(ProjectEstimatorDialog, { data: { 'action': 'approveConfirmation' , 'dataObj' : 'APPROVE_PE', 'apiAction': this.quotationDetails.project_estimate_id ? 'edit' : 'add' }, autoFocus: false});
    }
    downloadPDF(): void {
      this.downloadAPI('downloadPDF', "Download as PDF", '', 'PDF');
  }
    previewDoc(): void {
      this.downloadAPI('previewBtn', "Preview", '','PREVIEW');
  }
    downloadAPI(btnId, btnTxt, option, actionDoc){
      let self = this;
      let action;
      let responseData;
      self.errMsg = '';
      self.isError = false;
      action = this.quotationDetails.project_estimate_id ? 'edit' : 'add';
      self.util.addSpinner(btnId, btnTxt);
      try {
          this.PEService.saveProjectEstimator(action, option, function (error: boolean, response: any) {
              self.util.removeSpinner(btnId, btnTxt);
              if (error) {
                  self.errMsg = response.message;
                  self.isError = true;
              } else {
                  if (btnId == 'downloadPDF' || btnId == 'previewBtn') {
                      sessionStorage.removeItem('quotationDetails');
                      responseData = self.PEService.setResponseForPE(response.data);
                      sessionStorage.setItem('quotationDetails', responseData);
                      console.log('details = ',JSON.parse(sessionStorage.getItem('quotationDetails')));
                      self.ngOnInit();
var randomNo = JSON.parse(sessionStorage.getItem('quotationDetails')).pe_random_number;
                    var pdfLink =
                    self.config.pdfEndpoint +
                    "quotation/" +randomNo
                    +
                    "/pdf";

                    var preview =
                    self.config.pdfEndpoint +
                    "quotation/" +
                    randomNo;
                    if(actionDoc === 'PDF') {
                      self.downloadPDFDoc(pdfLink);
                    } else if(actionDoc === 'PREVIEW'){
                      self.preview(preview);
                    } else{

                    }

                      //self.util.showDialog(DialogComponent, response.message, ['/workflow/quote/csa/quotation-review']);
                  }
                  self.PEService.updateFormStatus('materialsFm', false);
                  self.PEService.updateFormStatus('paymentScheduleFm', false);
                  self.PEService.updateFormStatus('servicesFm', false);
                  self.PEService.updateFormStatus('scheduleFm', false);
                  //else {
                      //self.util.showDialog(DialogComponent, response.message, ['/workflow/quote/csa/quotation-list/0']);
                  //}
                  // self.util.showDialog(DialogComponent, response.message, ['/workflow/quote/csa/quotation-list/0']);
              }
          });
      } catch (err) {
          this.global.addException('Quotation - Save', 'saveAPICall()', err);
      }
  }
  downloadPDFDoc(dataDownload) {
    window.open(dataDownload);
  }
  preview(dataPreview) {
    window.open(dataPreview);
  }
}
