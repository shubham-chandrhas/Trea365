import { Component, OnInit, ApplicationRef } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';

import { FormControl, FormGroup, FormBuilder, FormArray, Validators, NgForm, AbstractControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { UtilService } from '../../../../shared/service/util.service';
import { HttpService } from '../../../../shared/service/http.service';
import { ConstantsService } from '../../../../shared/service/constants.service';
import { GlobalService } from '../../../../shared/service/global.service';

import { DialogComponent } from '../../../../shared/model/dialog/dialog.component';

@Component({
  selector: 'app-invoice-quotation-review',
  templateUrl: './invoice-quotation-review.component.html',
  styleUrls: ['./invoice-quotation-review.component.css']
})
export class InvoiceQuotationReviewComponent implements OnInit {
  public selectedQuotation: any = null;
  submitted: boolean = false;

  constructor(
    public dialog: MatDialog,
    private fb: FormBuilder, 
    public util: UtilService,
    public constant: ConstantsService,
    private global: GlobalService,
    private http: HttpService,
    private router: Router,
    private route: ActivatedRoute,
    private ref: ApplicationRef
  ) { 
      let workOrderObj: any = {};
      workOrderObj =  JSON.parse(localStorage.getItem('CREATE_WO'));
      localStorage.getItem('CREATE_WO') ? this.getQuotation(workOrderObj.project_estimate_id) :'';
  }

  ngOnInit() {
    this.util.menuChange({'menu':7,'subMenu':33});
    this.util.setWindowHeight();
    this.util.setPageTitle(this.route);
  }

  getQuotation(id){ 
    var self = this;
    this.util.showProcessing('processing-spinner');
      try{
        this.http.doGet('getProjectEstimateById/'+id, function(error: boolean, response: any){
            self.util.hideProcessing('processing-spinner');
            if( error ){
              console.log(response)
            }else{
              console.log(response.data);
              self.selectedQuotation = response.data;
              console.log("selectedQuotation",self.selectedQuotation);
            }
        });
      }catch(err){
          this.global.addException('Error Log','constructor()',err);
      }
  }

  createInvoice(){
    let invObj: any = {};
    invObj.project_estimate_id = this.selectedQuotation.project_estimate_id;
    invObj.WO_TYPE = 'External Contractor';
    sessionStorage.setItem('CREATE_INVOICE', JSON.stringify(invObj));
    this.router.navigate(['/account/csa/create-invoice']);
  }
}
