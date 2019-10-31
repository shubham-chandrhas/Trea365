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
  selector: 'app-wo-quotation-review',
  templateUrl: './wo-quotation-review.component.html',
  styleUrls: ['./wo-quotation-review.component.css']
})
export class WoQuotationReviewComponent implements OnInit {
  // public subContractorList: any = [];
  // public WOSetupForm: FormGroup;
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
    private ref: ApplicationRef,
    public route: ActivatedRoute
  ) { 
      let workOrderObj: any = {};
      workOrderObj =  JSON.parse(localStorage.getItem('CREATE_WO'));
      localStorage.getItem('CREATE_WO') ? this.getQuotation(workOrderObj.project_estimate_id) :'';
  }

  ngOnInit() {
    this.util.menuChange({'menu':4,'subMenu':26});
    this.util.setPageTitle(this.route);
  	window.scrollTo(0, 0);
  }

  getQuotation(id){ 
    var self = this;
    this.util.showProcessing('processing-spinner');
      try{
        //quotation.project_estimate_id
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

  WOContractor(){
    this.router.navigate(['/workflow/wo/csa/wo-setup']);
  }
}
