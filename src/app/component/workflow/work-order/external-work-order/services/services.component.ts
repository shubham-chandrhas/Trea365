import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormBuilder, FormArray, Validators, NgForm, AbstractControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

import { UtilService } from '../../../../../shared/service/util.service';
import { HttpService } from '../../../../../shared/service/http.service';
import { ConstantsService } from '../../../../../shared/service/constants.service';
import { WorkOrderDialog } from '../../work-order-dialog.component';
import { WorkOrderService } from '../../work-order.service';
import { GlobalService } from '../../../../../shared/service/global.service';

@Component({
    selector: 'app-services',
    templateUrl: './services.component.html',
    styleUrls: ['./services.component.scss']
})
export class WOServicesComponent implements OnInit {
    servicesForm: FormGroup;
	servicesList: any[] = [];
    backupServicesList: any[] = [];
    submitted: boolean = false;
    newTotalServiceAmt: any = 0;
	action: string = 'ADD';
	oldWODetails: any = { 'servicesDetails': [] };
	filteredservices: Observable<string[]>;
	subscription: Subscription;

	constructor(
		public dialog: MatDialog,
		public util: UtilService,
		private constant: ConstantsService,
		private fb: FormBuilder,
		private http: HttpService,
		public WOService: WorkOrderService,
        public route: ActivatedRoute,
        public global:GlobalService
	) { }

	ngOnInit() {
		let self = this;
		this.util.showProcessing('processing-spinner');
		this.util.setPageTitle(this.route);
		this.getservicesList();
		this.util.changeEvent({});
		this.WOService.quatationTab = 'services';
		//this.WOService.isCRwithService = false;
		this.addServicesForm('0');

		this.subscription = this.util.changeDetection.subscribe(dataObj => {
      		if(dataObj && (dataObj.source == 'INTERNAL_WO' || dataObj.source == 'EXTERNAL_WO') && dataObj.action == 'ADD_SERVICES'){
        		console.log("Change Detection .......", dataObj);
        		//this.reviewService();
                dataObj.data.validation ? this.addValidation(this.services) : this.removeValidation(this.services);
                this.updateValidation(this.services);
                this.reviewService();
      		}
    	});
	}

    setServicesData(): void {
        if(this.WOService.WO_DATA.servicesDetails || this.WOService.WO_DATA.wo_services){
            let totalAmt = 0;
            this.WOService.WO_DATA.servicesDetails ? this.addServicesForm('1', this.WOService.WO_DATA.servicesDetails) : this.addServicesForm('0');
            if(this.WOService.WO_DATA.wo_services){
                this.oldWODetails = JSON.parse(JSON.stringify(this.WOService.WO_DATA));
                this.oldWODetails.wo_services.forEach(function(obj) { totalAmt+= parseFloat(obj.total_amount);});
                this.oldWODetails.totalAmt = totalAmt;
                this.action = 'EDIT';
            }
        }else if(sessionStorage.getItem('woSetupData')){
            console.log(JSON.stringify(JSON.parse(sessionStorage.getItem('woSetupData'))));
            this.addExWOServicesForm('1', JSON.parse(sessionStorage.getItem('woSetupData')));
            this.action = 'ADD';
        }else{
            this.addServicesForm('0');
            this.action = 'ADD';
        }
    }

	ngOnDestroy() {
	    this.subscription.unsubscribe();
	}

	//Get Service Definition List
    getservicesList() {
        var self = this;
        this.http.doGet('businessType', function (error: boolean, response: any) {
            self.util.hideProcessing('processing-spinner');
            if (error) {
                console.log("error", response);
            } else {
                if (response.data) {
                    self.servicesList = [];
                    for (let i = 0; i < response.data.length; i++) {
                        for (let j = 0; j < response.data[i].services.length; j++) {
                            for (let k = 0; k < response.data[i].services[j].serviceDefinition.length; k++) {
                                self.servicesList.push({
                                    'businessTypeId': response.data[i].businessTypeId,
                                    'businessType': response.data[i].businessType,
                                    'serviceType': response.data[i].services[j].serviceType,
                                    'service_definition_id': response.data[i].services[j].serviceDefinition[k].service_definition_id,
                                    //'serviceDefinition': response.data[i].services[j].serviceDefinition[k].name,
                                    'serviceDefinition' : response.data[i].services[j].serviceType+' ('+response.data[i].services[j].serviceDefinition[k].name+')',
                                    'servicePrice': parseFloat(response.data[i].services[j].serviceDefinition[k].price),

                                });
                            }
                        }
                    }
                    self.backupServicesList = JSON.parse(JSON.stringify(self.servicesList));
                    self.setServicesData();
                }
            }
        });
    }

	private serviceFilter(value: string): string[] {
        return this.servicesList.filter(option => option.serviceDefinition.toLowerCase().includes(value ? value.toLowerCase() : ''));
	}

	getSelectedService(service, event: any = false, index): void {
		if(event.isUserInput){
			this.services.at(index).get('service_definition_id').setValue(service.service_definition_id);
			this.services.at(index).get('cost').setValue(service.servicePrice);
			let totalAmt = this.services.at(index).get('cost').value*this.services.at(index).get('quantity').value;
			this.services.at(index).get('total_amount').setValue(totalAmt);
            this.services.at(index).get('quantity').setValue('1');
			this.calculateTotalServicesAmount();
            this.removeServiceFormList(service.service_definition_id, 'service_definition_id', this.servicesList);
        }
    }
    public validateService(event: any, item: any, index) {
        try {
            let service = event.target.value;
            if (service == '') {
                let checkOccurance = this.servicesList.filter(listItem => listItem.service_definition_id == item.get('service_definition_id').value);

                item.get('service_definition_id').value != '' && checkOccurance.length == 0 ? this.backupServicesList.filter(listItem => listItem.service_definition_id == item.get('service_definition_id').value)[0] ? this.servicesList.push(this.backupServicesList.filter(listItem => listItem.service_definition_id == item.get('service_definition_id').value)[0]) : '' : '';
                item.get('service_definition_id').setValue('');
                for (let i = 0; i < this.services.length; i++) {
                    this.services.at(i).get('service_definition_id').value == '' ? this.setObservable(i) : '';
                }
                return;
            }
            let match = this.servicesList.filter(item => item.serviceDefinition.toLowerCase() == service.toLowerCase());
            if (match.length > 0) {
                item.get('service_definition_id').setValue(match[0].service_definition_id);
                item.get('service_definition').setValue(match[0].serviceDefinition);
                item.get('cost').setValue(match[0].servicePrice);
                item.get('quantity').setValue('1');
                this.removeServiceFormList(item.get('service_definition_id').value, 'service_definition_id', this.servicesList);
            } else {
                if(item.get('service_definition_id').value != ''){
                    let serviceName = this.backupServicesList.filter(listItem => listItem.service_definition_id == item.get('service_definition_id').value)[0].serviceDefinition;

                    if(serviceName.toLowerCase() != service.toLowerCase()){
                        let checkOccurance = this.servicesList.filter(listItem => listItem.service_definition_id == item.get('service_definition_id').value);
                        checkOccurance.length == 0 ? this.servicesList.push(this.backupServicesList.filter(listItem => listItem.service_definition_id == item.get('service_definition_id').value)[0]) : '';
                        item.get('service_definition_id').setValue('');
                        item.get('cost').setValue(0);
                    }
                }

                // item.get('service_definition_id').value != '' ? this.servicesList.push(this.backupServicesList.filter(listItem => listItem.service_definition_id == item.get('service_definition_id').value)[0]) : '';
                // item.get('service_definition_id').setValue('');
                // item.get('cost').setValue(0);
            }
        } catch (err) {
            this.global.addException('Work order - services', 'validateService()', err);
        }
    }

    removeServiceFormList = (id, key, list) => {
        this.servicesList = list.filter(item => item[key] != id);
        for (let i = 0; i < this.services.length; i++) {
            this.services.at(i).get('service_definition_id').value == '' ? this.setObservable(i) : '';
        }
    };

    addServiceToList = (id, key, list, backupList) => {
        if(backupList.filter(item => item[key] == id).length > 0){
            list.push(backupList.filter(item => item[key] == id)[0]);
        }
        for (let i = 0; i < this.services.length; i++) {
            this.services.at(i).get('service_definition_id').value == '' ? this.setObservable(i) : '';
        }
    }

    calculateTotal(event: any, item: any, index) {
        try {
            let service = event.target.value;
            if (service == '') {
                item.get('total_amount').setValue(0);
                this.calculateTotalServicesAmount();
                return;
            } else {
                let totalAmt = item.get('cost').value * item.get('quantity').value;
                item.get('total_amount').setValue(totalAmt);
                this.calculateTotalServicesAmount();
            }
        } catch (err) {
            this.global.addException('Work order - calculate', 'calculateTotal()', err);
        }
    }

	clearService(service, amount){
		//this.servicesForm.get('services_amount').setValue(this.servicesForm.get('services_amount').value > amount ? this.servicesForm.get('services_amount').value - amount : 0 );
        service.get('service_definition_id').value != '' ? this.addServiceToList(service.get('service_definition_id').value, 'service_definition_id', this.servicesList, this.backupServicesList) : '' ;
	}

	calculateTotalServicesAmount(){
        try {
            //let newTotalServiceAmt:number = 0;
            this.newTotalServiceAmt = parseFloat(this.oldWODetails) ? parseFloat(this.oldWODetails.totalAmt) : 0;
            for (let i = 0; i < this.services.length; i++) {
                this.newTotalServiceAmt = parseFloat(this.newTotalServiceAmt) + parseFloat(this.services.at(i).get('total_amount').value);
            }
            //this.servicesForm.get('services_amount').setValue(totalServiceAmt);
        } catch (err) {
            this.global.addException('Work order - calculate total', 'calculateTotalServicesAmount()', err);
        }
    }

    addServicesForm(option, data: any = {}) {
        try {
            this.servicesForm = this.fb.group({
                //services_amount: new FormControl(option == '1' ? data.services_amount : 0),
                peServicesCount: new FormControl(option == '1' ? data.peServicesCount : 0),
                woType: new FormControl(option == '1' ? data.woType : ''),
                services: this.fb.array([]),
                peServices: new FormControl(option == '1' ? data.peServices : []),
                woRemainingQuantity: new FormControl(option == '1' ? data.woRemainingQuantity : []),
            });
            if (option == '1') {
                for (var i = 0; i < data.services.length; i++) {
                    this.addServices(option, data.services[i]);
                    this.removeServiceFormList(data.services[i].service_definition_id, 'service_definition_id', this.servicesList);
                }
            }

            this.servicesForm.get('woType').setValue(this.action == 'ADD' && sessionStorage.getItem('woSetupData') ? 'EXTERNAL' : 'INTERNAL');

            if (this.WOService.WO_DATA.servicesAdditionalInfo) {
                this.servicesForm.get('woType').setValue(this.WOService.WO_DATA.servicesAdditionalInfo.woType);
                this.servicesForm.get('peServicesCount').setValue(this.WOService.WO_DATA.servicesAdditionalInfo.peServicesCount);
            }
        } catch (err) {
            this.global.addException('Work order - add services', 'addServicesForm()', err);
        }
    }


	get services(): FormArray{ return <FormArray>this.servicesForm.get('services') as FormArray;};

	addNewServices(): void {
        try{
		//alert(this.services.length);
		this.addServices('0');
		this.services.at(this.services.length-1).get('newlyAdded').setValue(sessionStorage.getItem('woSetupData') ? '1' : 0);
        }catch (err) {
            this.global.addException('Work order - add new services', 'addNewServices()', err);
        }
    }

    addValidation(controls){
        for (let i = 0; i < controls.length; i++) {
            controls.at(i).get('service_definition').setValidators([Validators.required]);
            controls.at(i).get('cost').setValidators([Validators.pattern(this.constant.AMOUNT_PATTERN)]);
            controls.at(i).get('quantity').setValidators([Validators.required, Validators.pattern(this.constant.AMOUNT_PATTERN)]);
        }
    }

    removeValidation(controls){
        for (let i = 0; i < controls.length; i++) {
            controls.at(i).get('service_definition').setValidators([]);
            controls.at(i).get('cost').setValidators([Validators.pattern(this.constant.AMOUNT_PATTERN)]);
            controls.at(i).get('quantity').setValidators([Validators.pattern(this.constant.AMOUNT_PATTERN)]);
        }
    }

    updateValidation(controls){
        for (let i = 0; i < controls.length; i++) {
            controls.at(i).get('service_definition').updateValueAndValidity();
            controls.at(i).get('cost').updateValueAndValidity();
            controls.at(i).get('quantity').updateValueAndValidity();
        }
    }

    addServices(option, data: any = {}) {
        let self = this;
        try {
            this.services.push(this.fb.group({
                wo_service_id : new FormControl(option == '1' ? data.wo_service_id : '', []),
                service_definition: new FormControl(option == '1' ? data.service_definition : '', [Validators.required]),
                service_definition_id: new FormControl(option == '1' ? data.service_definition_id : ''),
                ad_hoc_service: new FormControl(option == '1' ? data.ad_hoc_service : ''),
                cost: new FormControl(option == '1' ? data.cost : '', [Validators.pattern(this.constant.AMOUNT_PATTERN)]),
                quantity: new FormControl(option == '1' ? data.quantity : '1', [Validators.required, Validators.pattern(this.constant.AMOUNT_PATTERN)]),
                total_amount: new FormControl(option == '1' ? data.total_amount : 0),
                details: new FormControl(option == '1' ? data.details : ''),
                filteredService: new FormControl(new Observable<string[]>()),

                newlyAdded: new FormControl(self.action == 'EDIT' ? data.newlyAdded : 0),
                oldCost: new FormControl(self.action == 'EDIT' ? data.oldCost : data.cost),
                oldQuantity: new FormControl(self.action == 'EDIT' ? data.oldQuantity : data.wo_remaining_quantity),
                is_deleted: new FormControl(0)
            }));

            this.setObservable(this.services.length - 1);
            setTimeout(() => {
                this.calculateTotalServicesAmount();
            }, 100);
            //console.log(this.servicesForm.value);
        } catch (err) {
            this.global.addException('Work order - add services', 'addServices()', err);
        }
    }

    addExWOServicesForm(option, data: any = {}) {
        try {
            let self = this;
            this.servicesForm = this.fb.group({
                //services_amount: new FormControl(option == '1' ? data.services_amount : 0),
                woType: new FormControl(option == '1' ? data.woType : ''),
                peServicesCount: new FormControl(option == '1' ? data.services.length : 0),
                services: this.fb.array([]),
                peServices: new FormControl([]),
                woRemainingQuantity: new FormControl([]),
            });
            for (var i = 0; i < data.services.length; i++) {
                let servicesList: any[] = this.servicesForm.get('peServices').value;
                servicesList.push(data.services[i].service_definition_id);
                this.servicesForm.get('peServices').setValue(servicesList);
                let woRemainingQuantity: any[] = this.servicesForm.get('woRemainingQuantity').value;
                woRemainingQuantity.push(data.services[i].wo_remaining_quantity);
                this.servicesForm.get('woRemainingQuantity').setValue(woRemainingQuantity);
                if(parseFloat(data.services[i].quantity) > 0){
                    this.services.push(this.fb.group({
                        wo_service_id : new FormControl(option == '1' ? data.services[i].wo_service_id : '', []),
                        service_definition: new FormControl(option == '1' ? data.services[i].service : '', []),
                        service_definition_id: new FormControl(option == '1' ? data.services[i].service_definition_id : ''),
                        ad_hoc_service: new FormControl(option == '1' ? data.services[i].service_definition_id == 0 ? data.services[i].ad_hoc_service : '' : ''),
                        cost: new FormControl(option == '1' ? data.services[i].cost : '', [Validators.pattern(this.constant.AMOUNT_PATTERN)]),
                        quantity: new FormControl(option == '1' ? data.services[i].quantity : '1', [Validators.pattern(this.constant.AMOUNT_PATTERN)]),
                        total_amount: new FormControl(option == '1' ? data.services[i].total_amount : 0),
                        details: new FormControl(option == '1' ? data.services[i].details : ''),
                        filteredService: new FormControl(new Observable<string[]>()),

                        newlyAdded: new FormControl(self.action == 'EDIT' ? data.newlyAdded : 0),
                        oldCost: new FormControl(self.action == 'EDIT' ? data.oldCost : data.services[i].cost),
                        oldQuantity: new FormControl(self.action == 'EDIT' ? data.oldQuantity : data.services[i].wo_remaining_quantity),
                        is_deleted: new FormControl(0)
                    }));
                    this.setObservable(this.services.length - 1);
                    this.removeServiceFormList(data.services[i].service_definition_id, 'service_definition_id', this.servicesList);
                }
            }

            this.servicesForm.get('woType').setValue(this.action == 'ADD' && sessionStorage.getItem('woSetupData') ? 'EXTERNAL' : 'INTERNAL');

            if (this.WOService.WO_DATA.servicesAdditionalInfo) {
                this.servicesForm.get('woType').setValue(this.WOService.WO_DATA.servicesAdditionalInfo.woType);
                this.servicesForm.get('peServicesCount').setValue(this.WOService.WO_DATA.servicesAdditionalInfo.peServicesCount);
            }
        } catch (err) {
            this.global.addException('Work order - Add WO Services', 'addExWOServicesForm()', err);
        }
    }

	setObservable(index): void {
        this.services.at(index).get('filteredService').setValue(this.services.at(index).get('service_definition').valueChanges.pipe(startWith(''),map(value => this.serviceFilter(value))));
	}

    removeService(position, service): void {
        try {
            service.get('service_definition_id').value != '' ? this.addServiceToList(service.get('service_definition_id').value, 'service_definition_id', this.servicesList, this.backupServicesList) : '' ;
            if(service.get('wo_service_id').value != ''){
                this.WOService.deletedService.push(service.get('wo_service_id').value);
            }
            this.services.removeAt(position);
            this.calculateTotalServicesAmount();
        } catch (err) {
            this.global.addException('Work order - remove services', 'removeService()', err);
        }
    }

    reviewService(): void {
        try {
            console.log("Review Service :::::::", this.servicesForm.value);

            this.submitted = true;
            if (this.servicesForm.valid) {
                let createCR: boolean = false;
                console.log("Review Service :::::::", this.services);
                this.WOService.WO_DATA.servicesDetails = this.servicesForm.value;
                for (var i = 0; i < this.WOService.WO_DATA.servicesDetails.services.length; i++) {
                    delete this.WOService.WO_DATA.servicesDetails.services[i].filteredService;
                    if (this.WOService.WO_DATA.servicesDetails.services[i].service_definition_id == '') {
                        this.WOService.WO_DATA.servicesDetails.services[i].ad_hoc_service = this.WOService.WO_DATA.servicesDetails.services[i].service_definition;
                    }
                    if (this.servicesForm.value.woType == 'EXTERNAL') {
                        if (parseInt(this.WOService.WO_DATA.servicesDetails.services[i].quantity) > parseInt(this.WOService.WO_DATA.servicesDetails.services[i].oldQuantity)) {
                            createCR = true;
                        }
                        if(this.WOService.WO_DATA.servicesDetails.peServices.indexOf(this.WOService.WO_DATA.servicesDetails.services[i].service_definition_id) > 0 &&  parseInt(this.WOService.WO_DATA.servicesDetails.services[i].quantity) > parseInt(this.WOService.WO_DATA.servicesDetails.woRemainingQuantity[this.WOService.WO_DATA.servicesDetails.peServices.indexOf(this.WOService.WO_DATA.servicesDetails.services[i].service_definition_id)])){
                            createCR = true;
                        }
                        if(this.WOService.WO_DATA.servicesDetails.peServices.indexOf(this.WOService.WO_DATA.servicesDetails.services[i].service_definition_id) < 0){
                            createCR = true;
                        }
                    }
                }
                if (this.servicesForm.value.woType == 'EXTERNAL') {

                    // if (this.services.length > this.servicesForm.value.peServicesCount) {
                    //     createCR = true;
                    // }
                    if (createCR && !this.WOService.isCRwithService) {
                        //this.WOService.isCRwithService = true;
                        this.dialog.open(WorkOrderDialog, { data: { 'action': 'createCRConfirmation', 'formDataObj': this.servicesForm.value, 'msg': 'If service quantity is more than quoted quantity or If you added new services this will create change request automatically to update Project Estimator.', 'navigateTo': '/workflow/wo/csa/wo-external/team' }, autoFocus: false });
                        this.WOService.isCRwithService = true;
                        //return;
                    }
                }

                this.WOService.WO_DATA.servicesAdditionalInfo = {
                    'woType': this.servicesForm.value.woType,
                    'peServicesCount': this.servicesForm.value.peServicesCount
                }
                //this.WOService.WO_DATA.servicesDetails = this.services.value;


                this.addValidation(this.services);
                this.updateValidation(this.services);

                this.WOService.updateFormStatus('servicesFm', this.servicesForm.valid);

            } else {
                this.WOService.updateFormStatus('servicesFm', false);
            }
        } catch (err) {
            this.global.addException('Work order - Review Services', 'reviewService()', err);
        }
    }
}
