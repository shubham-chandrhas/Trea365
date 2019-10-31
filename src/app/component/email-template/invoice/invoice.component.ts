import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpService } from '../../../shared/service/http.service';
import { UtilService } from '../../../shared/service/util.service';
import { ConstantsService } from '../../../shared/service/constants.service';
import { GlobalService } from '../../../shared/service/global.service';
import { ProjectEstimatorService } from '../../workflow/project-estimator/project-estimator.service';

@Component({
  selector: 'app-invoice',
  templateUrl: './invoice.component.html',
  styleUrls: ['./invoice.component.scss']
})
export class InvoiceComponent implements OnInit {

    public  invoice_token: any = '';
    public  invoice_details: any = '';
    public  errMsg: any = '';
    public  successMsg: any = '';
    loading: boolean = true;
    constructor(
      private route: ActivatedRoute,
      private router: Router,
      private http: HttpService,
      private util: UtilService,
      public constant:ConstantsService,
      private global: GlobalService,
      private PEService: ProjectEstimatorService
    ) {
      this.getInvoiceByRN();
  
     }
  
    ngOnInit() {
      this.util.showLoading();
      console.log(this.route.snapshot.paramMap.get('invoice_token'));
      this.util.setPageTitle(this.route);
    }
  
    getInvoiceByRN(){
      this.invoice_token= this.route.snapshot.paramMap.get('invoice_token')?this.route.snapshot.paramMap.get('invoice_token'):'';
      var self = this;
  
      this.loading = true;
          try{
              this.http.doGet('getInvoiceByRN/'+this.invoice_token, function(error: boolean, response: any){
                  self.loading = false;
                  if( error ){
                    self.util.hideLoading();
                      console.log(response);
                  }else{
                      self.invoice_details = response.data;
                    //   if((self.invoice_details.client_work_location.latitude=='' || self.invoice_details.client_work_location.latitude ==null) && (self.invoice_details.client_work_location.longitude=='' || self.invoice_details.client_work_location.longitude==null))
                    //   {
                    //       self.invoice_details.workLocation = self.invoice_details.client_work_location.address_line_1
                    //       +', '+self.invoice_details.client_work_location.city_details.city_name+', '+self.invoice_details.client_work_location.province_details.province_name+', '+self.invoice_details.client_work_location.country_details.country_name;
                    //   }
                    //   else
                    //   {
                    //       self.invoice_details.workLocation = self.invoice_details.client_work_location.address_line_1
                    //       ;
                    //   }
  
                    //   if(self.invoice_details.client_billing_location  && (self.invoice_details.client_billing_location.latitude=='' || self.invoice_details.client_billing_location.latitude ==null) && (self.invoice_details.client_billing_location.longitude=='' || self.invoice_details.client_billing_location.longitude==null))
                    //   {
                    //       self.invoice_details.billingLocation = self.invoice_details.client_billing_location.address_line_1
                    //       +', '+self.invoice_details.client_billing_location.city_details.city_name+', '+self.invoice_details.client_billing_location.province_details.province_name+', '+self.invoice_details.client_billing_location.country_details.country_name;
                    //   }
                    //   else
                    //   {
                    //       self.invoice_details.billingLocation = self.invoice_details.client_billing_location.address_line_1
                    //       ;
                    //   }
  
                      //self.util.hideProcessing('processing-spinner1');
                      console.log(self.invoice_details);
                  }
              });
          }catch(err){
              this.global.addException('Quotation','constructor()',err);
          }
    }
  
     
    //   approvePE(pe_id) {
    //       this.loading = true;
    //       console.log(pe_id);
    //       var self = this;
    //       let reqObj: any = {
    //           'project_estimate_id': pe_id,
    //           'status_id': 5,
    //       };
    //       try {
    //           this.http.doPost('updateProjectEstimateStatus', reqObj, function (error: boolean, response: any) {
    //               self.loading = false;
    //               if (error) {
    //                   self.errMsg = response.message;
    //               } else {
  
    //                   self.invoice_details.status = 5;
    //                   console.log(response);
    //               }
    //           });
    //       } catch (err) {
    //           this.global.addException('Quotation', 'rejectPE()', err);
    //       }
    //   }
  
    //   rejectPE(pe_id) {
    //       this.loading = true;
    //       console.log(pe_id);
    //       var self = this;
    //       let reqObj: any = {
    //           'project_estimate_id': pe_id,
    //           'status_id': 6,
    //       };
    //       try {
    //           this.http.doPost('updateProjectEstimateStatus', reqObj, function (error: boolean, response: any) {
    //               self.loading = false;
    //               if (error) {
    //                   self.errMsg = response.message;
    //               } else {
  
    //                   self.invoice_details.status = 6;
    //                   console.log(response);
    //               }
    //           });
    //       } catch (err) {
    //           this.global.addException('Quotation', 'rejectPE()', err);
    //       }
    //   }

}
