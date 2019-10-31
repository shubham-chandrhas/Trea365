import { Component, OnInit,Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormControl, FormGroup, FormBuilder, FormArray, Validators } from '@angular/forms';

import { HttpService } from '../../../../shared/service/http.service';
import { UtilService } from '../../../../shared/service/util.service';
import { GlobalService } from '../../../../shared/service/global.service';
import { ConstantsService } from '../../../../shared/service/constants.service';
import { ProjectEstimatorService } from '../../project-estimator/project-estimator.service';
import { DialogComponent } from '../../../../shared/model/dialog/dialog.component';

@Component({
	selector: 'app-change-request-review-changes',
	templateUrl: './change-request-review-changes.component.html',
	styleUrls: ['./change-request-review-changes.component.scss']
})

export class ChangeRequestReviewChangesComponent implements OnInit {
	selectedQuotation :any = {};
	versions :any[] = [];
	changeRequest :any = {};
	errMsg :string = '';
	isError :boolean = false; 
	totalPayErr: boolean = false;
	successMsg :string = '';
	isSuccess :boolean = false; 
	submitted: boolean = false;
	minDate = new Date();
	total: number = 0.0;
	totalPayment: number = 0.0;
	payScheduleForm: FormGroup;

	constructor(
		private http: HttpService,
		public util: UtilService,
		public constant: ConstantsService,
		private global: GlobalService,
		private PEService: ProjectEstimatorService,
		public router: Router,
		private route: ActivatedRoute,
		private fb: FormBuilder) { }

	ngOnInit() {
		let self = this;
		this.util.setWindowHeight();
		this.util.menuChange({ 'menu': 4, 'subMenu': 25 });
		this.util.setPageTitle(this.route);
		this.selectedQuotation = JSON.parse(sessionStorage.getItem('CrDetails'));
		console.log(JSON.stringify(this.selectedQuotation));
		this.versions = JSON.parse(sessionStorage.getItem('versions'));
		this.selectedQuotation.newServicesTotalCost = this.selectedQuotation.newMaterialsTotalCost = 0;
		this.selectedQuotation.services.forEach(function(obj) {  
			if(obj.is_cr == 0 || obj.is_approved == 1){
				self.selectedQuotation.newServicesTotalCost += parseFloat(obj.total_amount); 
			}
			obj.fontColor = (obj.is_cr == 1 && obj.newCR) || (!obj.newCR && obj.is_approved == 2) ? 'change-request' : ''; 
		});
		this.selectedQuotation.product_materials.forEach(function(obj) {  
			if(obj.is_cr == 0 || obj.is_approved == 1){
				self.selectedQuotation.newMaterialsTotalCost += parseFloat(obj.total_amount); 
			}
			obj.fontColor = (obj.is_cr == 1 && obj.newCR) || (!obj.newCR && obj.is_approved == 2) ? 'change-request' : '';
		});
		this.selectedQuotation.newSubtotal = parseFloat(this.selectedQuotation.newServicesTotalCost) + parseFloat(this.selectedQuotation.newMaterialsTotalCost);
		this.selectedQuotation.newTaxAmount = (parseFloat(this.selectedQuotation.newSubtotal + parseFloat(this.selectedQuotation.costs[0].adjustment) + parseFloat(this.selectedQuotation.costs[0].shipping_and_handling)) * (parseFloat(this.selectedQuotation.costs[0].taxes)/100));
		this.selectedQuotation.newTotalCost = (parseFloat(this.selectedQuotation.newTaxAmount)) + parseFloat(this.selectedQuotation.newSubtotal) + parseFloat(this.selectedQuotation.costs[0].adjustment) + parseFloat(this.selectedQuotation.costs[0].shipping_and_handling);
		//this.selectedQuotation.newPaymentAmt = JSON.parse(JSON.stringify(parseFloat(this.selectedQuotation.newTotalCost) > parseFloat(this.selectedQuotation.costs[0].total_cost) ? (parseFloat(this.selectedQuotation.newTotalCost) - parseFloat(this.selectedQuotation.costs[0].total_cost)) : 0.00));
		
		this.selectedQuotation.totalPaymentAmt = 0.00;
		this.selectedQuotation.payment_schedules.map(item => {
			this.selectedQuotation.totalPaymentAmt += parseFloat(item.amount_due);
		});
		this.selectedQuotation.newPaymentAmt = JSON.parse(JSON.stringify(parseFloat(this.selectedQuotation.newTotalCost) - parseFloat(this.selectedQuotation.totalPaymentAmt) ));
		this.selectedQuotation.oldTotalPaymentAmt = JSON.parse(JSON.stringify(this.selectedQuotation.totalPaymentAmt))
 		this.selectedQuotation.totalPaymentAmtBkup = JSON.parse(JSON.stringify(this.selectedQuotation.totalPaymentAmt));
 		this.selectedQuotation.newPaymentAmtBkup = JSON.parse(JSON.stringify(this.selectedQuotation.newPaymentAmt));
		this.createForm();
	}

	createForm(){
		this.payScheduleForm = this.fb.group({
			date_items: this.fb.array([])
		});
	}

	editCR() {
		try {
			this.router.navigate(['/workflow/quote/csa/quotation-list/' + this.selectedQuotation.project_estimate_id]);
		} catch (err) {
			this.global.addException('Review Quotation', 'editCR()', err, {  'routeURL': '/workflow/quote/csa/quotation-list/' + this.selectedQuotation.project_estimate_id});
		}
	}
	approveCR(){	
		try{
			var self = this;
			this.errMsg = '';
			this.isError = false; 
			//this.totalPayErr = false;
			this.submitted = true;
			if(this.payScheduleForm.valid){
				// if((parseFloat(self.selectedQuotation.newTotalCost) - parseFloat(self.selectedQuotation.costs[0].total_cost)) == this.total){
				// 	self.totalPayErr = true;
	   //              self.errMsg = 'Total payment amount should not exceed new total cost.';
				// }else{

				// }


				//@@ Commented code by Yogesh for remove validation
				// if(this.selectedQuotation.newPaymentAmt != 0){
				// 	self.totalPayErr = true;
				// 	self.errMsg = 'Total payment amount should match exactly to Total Cost.';
				// 	return;
				// }

				self.util.showProcessing('processing-spinner');
				this.changeRequest.product_services = [];
				this.selectedQuotation.services.forEach((element,key) => {
					if(element.is_cr == 1){ this.changeRequest.product_services.push({'pe_service_id':element.pe_service_id,'status':element.is_approved}) };	 
				});

				this.changeRequest.product_materials = [];
				this.selectedQuotation.product_materials.forEach((element,key) => {
					if(element.is_cr == 1){ this.changeRequest.product_materials.push({'pe_product_material_id':element.pe_product_material_id,'status':element.is_approved}) };
				});

				this.changeRequest.payment_schedules = JSON.parse(JSON.stringify(this.payScheduleForm.value.date_items));
				this.changeRequest.payment_schedules.forEach((element,key) => {
					element.payment_date = this.util.getYYYYMMDDDate(element.payment_date);
				});
				//console.log(this.changeRequest);
				this.http.doPost('PEQuotationApproveReject', this.changeRequest, function(error: boolean, response: any){
					self.util.hideProcessing('processing-spinner');
					if(error){
						self.errMsg = response.message;
						self.isError = true;
					}else{
						if(response.status){
							self.util.showDialog(DialogComponent, response.message, ['/workflow/quote/csa/quotation-list/0']);
						}else{
							self.errMsg = response.message;
							self.isError = true;
						}
					}
				});
			}
			
			
		}catch(err){
		    this.global.addException('Review Quotation','approveCR()', err, { 'API': 'PEQuotationApproveReject|POST', 'APIRequest': this.changeRequest, 'other': { 'selectedQuotation': this.selectedQuotation, 'changeRequest': this.changeRequest, 'FormData': this.payScheduleForm.value } } );
		}		
	}

	cancleCR() {
		try {
			sessionStorage.removeItem('CrDetails');
			sessionStorage.removeItem('versions');
			this.router.navigate(['/workflow/quote/csa/quotation-list/' + this.selectedQuotation.project_estimate_id]);
		} catch (err) {
			this.global.addException('Review Quotation', 'cancleCR()', err,{  'routeURL': '/workflow/quote/csa/quotation-list/' + this.selectedQuotation.project_estimate_id  });
		}
	}

	get date_items(): FormArray{ return <FormArray>this.payScheduleForm.get('date_items') as FormArray;};

	addpayment(option, val: any = {}) {
		try {
			this.totalPayErr = false;
			this.date_items.push(this.fb.group({
				project_estimate_id: new FormControl(option == '1' ? val.project_estimate_id : this.selectedQuotation.project_estimate_id), //hidden
				payment_date: new FormControl(option == '1' ? val.payment_date : '', [Validators.required]),
				amount_due: new FormControl(option == '1' ? val.amount_due : '', [Validators.required, Validators.pattern(this.constant.AMOUNT_PATTERN)]),
			}));
			//console.log("Add Payment DONE :::::");
			//console.log(val);
		}
		catch (err) {
			this.global.addException('Review Quotation - Add Payment', 'addpayment()', err,{ 'selectedQuotation': this.selectedQuotation, 'functionParameter': val} );
		}
	}

	removePaySchedule(position, item) {
		try {
			this.totalPayErr = false;
			this.errMsg = '';
			this.date_items.removeAt(position);
			this.calculatePaymentAmount();
		}
		catch (err) {
			this.global.addException('Review Quotation - Remove', 'removePaySchedule()', err);
		}
	}

	private validatePaymentInput(callback) {
		try {
			for (let i = 0; i < this.date_items.value.length; i++) {
				if (this.date_items.value[i].amount_due != '' && !this.constant.AMOUNT_PATTERN.test(this.date_items.value[i].amount_due)) {
					return callback(false);
				}
			}
			return callback(true);
		} catch (err) {
			this.global.addException('Validate payment', 'validatePaymentInput()', err);
		}
	}

	calculatePaymentAmount() {
		try {
			let self = this;
			for (let i = 0; i < self.date_items.value.length; i++) {
				if(self.date_items.value[i].amount_due != null && self.date_items.value[i].amount_due != ''){
					this.util.removeCommas(self.date_items.at(i).get('amount_due'));
				}
			}
			this.validatePaymentInput(function (response) {
				if (!response) { return; }
				let newPayTotal = JSON.parse(JSON.stringify(parseFloat(self.selectedQuotation.newPaymentAmtBkup)));
                
                self.total = 0.00;
				for (let i = 0; i < self.date_items.value.length; i++) {

					//if (self.date_items.value[i].amount_due != '') {
						var payAmt = self.date_items.value[i].amount_due == null || self.date_items.value[i].amount_due == '' ? 0 : self.date_items.value[i].amount_due;
						self.total = (self.total) + parseFloat(payAmt);
						//@@ Commented code by Yogesh for remove validation
						// if (newPayTotal < self.total) {
						// 	self.totalPayErr = true;
						// 	self.errMsg = 'Total payment amount should not exceed new total cost.';
						// } else {
						// 	self.totalPayErr = false;
						// 	self.errMsg = '';
						// }
					//}
                }
                let totalPay = parseFloat(self.selectedQuotation.totalPaymentAmtBkup) + self.total;
                self.selectedQuotation.totalPaymentAmt = JSON.parse(JSON.stringify(totalPay));
				self.selectedQuotation.newPaymentAmt = newPayTotal - self.total;
			});
		} catch (err) {
			this.global.addException('Calculate payment amount', 'calculatePaymentAmount()', err, {'selectedQuotation': this.selectedQuotation, '': ''  });
		}
	}

}
