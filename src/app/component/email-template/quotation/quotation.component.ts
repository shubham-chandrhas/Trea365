import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router , ParamMap } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { HttpService } from '../../../shared/service/http.service';
import { UtilService } from '../../../shared/service/util.service';
import { ConstantsService } from '../../../shared/service/constants.service';
import { GlobalService } from '../../../shared/service/global.service';
import { ProjectEstimatorService } from '../../workflow/project-estimator/project-estimator.service';
@Component({
  selector: 'app-quotation',
  templateUrl: './quotation.component.html',
  styleUrls: ['./quotation.component.scss']
})
export class QuotationComponent implements OnInit {

  public  pe_token: any = '';
  public  pe_details: any = '';
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
    this.getPeByRN();

   }

  ngOnInit() {
    this.util.showLoading();
    console.log(this.route.snapshot.paramMap.get('pe_token'));
    this.util.setPageTitle(this.route);
  }

  getPeByRN(){
    this.pe_token= this.route.snapshot.paramMap.get('pe_token')?this.route.snapshot.paramMap.get('pe_token'):'';
    var self = this;

    this.loading = true;
        try{
            this.http.doGet('getProjectEstimateByRN/'+this.pe_token, function(error: boolean, response: any){
                self.loading = false;
                if( error ){
                  self.util.hideLoading();
                    console.log(response);
                }else{
                    self.pe_details = response.data;
                    
                    // if((self.pe_details.client_work_location.latitude=='' || self.pe_details.client_work_location.latitude ==null) && (self.pe_details.client_work_location.longitude=='' || self.pe_details.client_work_location.longitude==null))
                    // {
                    //     self.pe_details.workLocation = self.pe_details.client_work_location.address_line_1
                    //     +', '+self.pe_details.client_work_location.city_details.city_name+', '+self.pe_details.client_work_location.province_details.province_name+', '+self.pe_details.client_work_location.country_details.country_name;
                    // }
                    // else
                    // {
                    //     self.pe_details.workLocation = self.pe_details.client_work_location.address_line_1
                    //     ;
                    // }

                    // if(self.pe_details.client_billing_location  && (self.pe_details.client_billing_location.latitude=='' || self.pe_details.client_billing_location.latitude ==null) && (self.pe_details.client_billing_location.longitude=='' || self.pe_details.client_billing_location.longitude==null))
                    // {
                    //     self.pe_details.billingLocation = self.pe_details.client_billing_location.address_line_1
                    //     +', '+self.pe_details.client_billing_location.city_details.city_name+', '+self.pe_details.client_billing_location.province_details.province_name+', '+self.pe_details.client_billing_location.country_details.country_name;
                    // }
                    // else
                    // {
                    //     self.pe_details.billingLocation = self.pe_details.client_billing_location.address_line_1
                    //     ;
                    // }
                    //self.util.hideProcessing('processing-spinner1');
                    self.pe_details.workLocation = self.pe_details.client_billing_location ? this.util.concatenateStrings(self.pe_details.client_work_location.address_line_2,self.pe_details.client_work_location.address_line_1) : '';
                    self.pe_details.billingLocation = self.pe_details.client_billing_location ? this.util.concatenateStrings(self.pe_details.client_billing_location.address_line_2,self.pe_details.client_billing_location.address_line_1) : '';
                    console.log(self.pe_details);
                }
            });
        }catch(err){
            this.global.addException('Quotation','constructor()',err);
        }
  }

    // approvePE(pe_id) {
    //     this.loading = true;
    //     try {
    //         console.log(pe_id, this.pe_details);
    //         let data = this.PEService.setResponseForPE(this.pe_details);
    //         var self = this;
    //         sessionStorage.removeItem('quotationDetails');
    //         sessionStorage.setItem('quotationDetails', data);
    //         this.PEService.saveProjectEstimator("edit", "APPROVE", function (error: boolean, response: any) {
    //             self.loading = false;
    //             if (error) {
    //                 self.errMsg = response.message;
    //             } else {

    //                 self.pe_details.status = 5;
    //                 console.log(response);
    //             }
    //         });
    //     }
    //     catch (err) {
    //         this.global.addException('Quotation', 'approvePE()', err);
    //     }
    // }
    approvePE(pe_id) {
        this.loading = true;
        console.log(pe_id);
        var self = this;
        let reqObj: any = {
            'project_estimate_id': pe_id,
            'status_id': 5,
        };
        try {
            this.http.doPost('updateProjectEstimateStatus', reqObj, function (error: boolean, response: any) {
                self.loading = false;
                if (error) {
                    self.errMsg = response.message;
                } else {

                    self.pe_details.status = 5;
                    console.log(response);
                }
            });
        } catch (err) {
            this.global.addException('Quotation', 'rejectPE()', err);
        }
    }

    rejectPE(pe_id) {
        this.loading = true;
        console.log(pe_id);
        var self = this;
        let reqObj: any = {
            'project_estimate_id': pe_id,
            'status_id': 6,
        };
        try {
            this.http.doPost('updateProjectEstimateStatus', reqObj, function (error: boolean, response: any) {
                self.loading = false;
                if (error) {
                    self.errMsg = response.message;
                } else {

                    self.pe_details.status = 6;
                    console.log(response);
                }
            });
        } catch (err) {
            this.global.addException('Quotation', 'rejectPE()', err);
        }
    }

}
