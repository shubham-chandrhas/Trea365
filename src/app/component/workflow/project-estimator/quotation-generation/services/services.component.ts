import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormControl, FormGroup, FormBuilder, FormArray, Validators, NgForm, AbstractControl } from '@angular/forms';

import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { UtilService } from '../../../../../shared/service/util.service';
import { HttpService } from '../../../../../shared/service/http.service';
import { ConstantsService } from '../../../../../shared/service/constants.service';
import { ProjectEstimatorService } from '../../project-estimator.service';
import { ProjectEstimatorDialog } from '../../project-estimator-dialog.component';
import { GlobalService } from '../../../../../shared/service/global.service';

@Component({
	selector: 'app-services',
	templateUrl: './services.component.html',
	styleUrls: ['../quotation-generation.component.css', './services.component.scss']
})
export class ServicesComponent implements OnInit {

	servicesForm: FormGroup;
	servicesList: any[] = [];
	backupServicesList: any[] = [];
	autoNumber: number;
	currentSelection: number;
	submitted: boolean = false;
	showService: boolean = false;
	filteredservices: Observable<string[]>;

	constructor(
		public dialog: MatDialog,
		public util: UtilService,
		private constant: ConstantsService,
		private fb: FormBuilder,
		private http:HttpService,
		private peService: ProjectEstimatorService,
		private global: GlobalService,
	) { }

	ngOnInit() {
		this.util.showProcessing('processing-spinner');
		this.autoNumber = this.util.getUniqueString();
		try{
			this.getservicesList();
			this.addServicesForm('0');
		}catch(err){
			this.global.addException('PE Qutation Generation Service Tab','ngOnInit()',err);
		}




    }
    getServiceEdit()
    {
        if(this.peService.projectEstimatorData.servicesDetails && this.peService.projectEstimatorData.servicesDetails.services.length>0 ){
            this.addServicesForm('1', this.peService.projectEstimatorData.servicesDetails);
        }else{
            this.addServicesForm('0');
        }

        this.util.changeDetection.subscribe(dataObj => {
            if(dataObj && dataObj.source == 'QUOTATION_GENERATION' && dataObj.action == 'ADD_SERVICES'){
                this.reviewService();
            } else if(dataObj && dataObj.source == 'QUOTATION_GENERATION' && dataObj.action == 'ADD_SERVICE_DEFINITION'){
                this.getservicesList(dataObj.data.service_definition);
            }
        });
    }
	addFirstService(){
		if(this.showService==false)
			this.showService = true;
	}
	//Get Service Definition List
	getservicesList(service_defination?){
		var self = this;
		this.http.doGet('businessType', function(error: boolean, response: any){
			self.util.hideProcessing('processing-spinner');
			if(error){
			    console.log("error",response);
			}else{
				console.log("response.data",response.data);
			    if(response.data){
					self.servicesList = [];
					for (let i = 0; i < response.data.length; i++) {
						for (let j = 0; j < response.data[i].services.length; j++) {
							for (let k = 0; k < response.data[i].services[j].serviceDefinition.length; k++) {
								self.servicesList.push({
								  'businessTypeId' : response.data[i].businessTypeId,
								  'businessType' : response.data[i].businessType,
								  'serviceType' : response.data[i].services[j].serviceType,
								  'service_definition_id': response.data[i].services[j].serviceDefinition[k].service_definition_id,
								  'serviceDefinition' : response.data[i].services[j].serviceType+' ('+response.data[i].services[j].serviceDefinition[k].name+')',
								  'servicePrice' : response.data[i].services[j].serviceDefinition[k].price,
                                  'serviceName' :  response.data[i].services[j].serviceDefinition[k].name
                                });
							}
						}
					}
					self.backupServicesList = JSON.parse(JSON.stringify(self.servicesList));
					console.log("self.servicesList",self.servicesList);

					console.log("new Service",service_defination);
					if(service_defination != undefined){
						for (let index = 0; index < self.servicesList.length; index++) {
							const service = self.servicesList[index];
							if(self.servicesList[index].serviceName == service_defination){
								console.log(self.servicesList[index]);
								console.log(self.services.length);
								self.services.at(self.currentSelection).get('service_definition_id').setValue(self.servicesList[index].service_definition_id);
								self.services.at(self.currentSelection).get('service_definition').setValue(self.servicesList[index].serviceDefinition);
								self.services.at(self.currentSelection).get('cost').setValue(self.servicesList[index].servicePrice);
								let totalAmt = self.services.at(self.currentSelection).get('cost').value*self.services.at(self.currentSelection).get('quantity').value;
								self.services.at(self.currentSelection).get('total_amount').setValue(totalAmt);
								self.calculateTotalServicesAmount();
								self.addValidation(self.services, self.currentSelection);
								break;
							}
						}
					}else{
                        self.getServiceEdit();
						if(self.services.length>0)
							self.services.at(0).get('filteredService').setValue(self.services.at(0).get('service_definition').valueChanges.pipe(startWith(''),map(value => self.serviceFilter(value))));
					}
				}
			}
		});
	}
	private serviceFilter(value: string): string[] {
		console.log('this.servicesList ::: ', this.servicesList);
        return this.servicesList.filter(option => option.serviceDefinition.toLowerCase().includes(value ? value.toLowerCase() : ''));
	}

	getSelectedService(service, event: any = false, index): void {
		if(event.isUserInput){
			this.services.at(index).get('service_definition_id').setValue(service.service_definition_id);
			this.services.at(index).get('cost').setValue(service.servicePrice);
			this.services.at(index).get('quantity').setValue(1);
			let totalAmt = this.services.at(index).get('cost').value*this.services.at(index).get('quantity').value;
			this.services.at(index).get('total_amount').setValue(totalAmt);
			this.calculateTotalServicesAmount();
			this.addValidation(this.services, index);
			this.removeServiceFormList(service.service_definition_id, 'service_definition_id', this.servicesList);
        }
    }
    public validateService(event: any, item: any, index) {
        try {
            let service = event.target.value;
            if (service == '') {
                let checkOccurance = this.servicesList.filter(listItem => listItem.service_definition_id == item.get('service_definition_id').value);
                item.get('service_definition_id').value != '' && checkOccurance.length == 0 ? this.servicesList.push(this.backupServicesList.filter(listItem => listItem.service_definition_id == item.get('service_definition_id').value)[0]) : '';
                item.get('service_definition_id').setValue('');
				for (let i = 0; i < this.services.length; i++) {
		    		this.services.at(i).get('service_definition_id').value == '' ? this.setObservable(i) : '';
		    	}
                return;
            }
            //console.log(service);
            //console.log(index);
            //console.log(this.services);

            this.addValidation(this.services, index);
            let match = this.servicesList.filter(item => item.serviceDefinition.toLowerCase() == service.toLowerCase());
            //console.log(match);
            if (match.length > 0) {
                item.get('service_definition_id').setValue(match[0].service_definition_id);
                item.get('service_definition').setValue(match[0].serviceDefinition);
                item.get('cost').setValue(match[0].servicePrice);
                item.get('quantity').setValue(1);
                this.removeServiceFormList(item.get('service_definition_id').value, 'service_definition_id', this.servicesList);
            } else {
                if(item.get('service_definition_id').value != ''){
                    let serviceName = this.backupServicesList.filter(listItem => listItem.service_definition_id == item.get('service_definition_id').value)[0].serviceDefinition;

                    if(serviceName.toLowerCase() != service.toLowerCase()){
                        let checkOccurance = this.servicesList.filter(listItem => listItem.service_definition_id == item.get('service_definition_id').value);
                        checkOccurance.length == 0 ? this.servicesList.push(this.backupServicesList.filter(listItem => listItem.service_definition_id == item.get('service_definition_id').value)[0]) : '';
                        item.get('service_definition_id').setValue('');
                    }
                }
                //console.log("item.get('service_definition_id').value",item.get('service_definition_id').value);
            }
        } catch (err) {
            this.global.addException('Service validate', 'validateService()', err);
        }
    }

    removeServiceFormList = (id, key, list) => {
        this.servicesList = list.filter(item => item[key] != id);
        console.log(this.servicesList);
    	for (let i = 0; i < this.services.length; i++) {
    		this.services.at(i).get('service_definition_id').value == '' ? this.setObservable(i) : '';
    	}
	};

	addServiceToList = (id, key, list, backupList) => {
		list.push(backupList.filter(item => item[key] == id)[0]);
		for (let i = 0; i < this.services.length; i++) {
    		this.services.at(i).get('service_definition_id').value == '' ? this.setObservable(i) : '';
    	}
	}

    addValidation(control, index){
    	control.at(index).get('cost').setValidators([Validators.required, Validators.pattern(this.constant.AMOUNT_PATTERN)]);
		control.at(index).get('quantity').setValidators([Validators.required, Validators.pattern(this.constant.AMOUNT_PATTERN)]);
        control.at(index).get('cost').updateValueAndValidity();
        control.at(index).get('quantity').updateValueAndValidity();
    }

    calculateTotal(event: any, item: any, index) {
        try {
            let service = event.target.value;
            //console.log(service);
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
            this.global.addException('Service Calculate total', 'calculateTotal()', err);
        }
    }
	clearService(service, amount){
        try {
            this.servicesForm.get('services_amount').setValue(this.servicesForm.get('services_amount').value > amount ? this.servicesForm.get('services_amount').value - amount : 0);
            service.get('service_definition_id').value != '' ? this.addServiceToList(service.get('service_definition_id').value, 'service_definition_id', this.servicesList, this.backupServicesList) : '' ;
        } catch (err) {
            this.global.addException('Clear Service', 'clearService()', err);
        }
	}
	calculateTotalServicesAmount(){
        try {
            let totalServiceAmt: number = 0;
            for (let i = 0; i < this.services.length; i++) {
                totalServiceAmt = totalServiceAmt + parseFloat(this.services.at(i).get('total_amount').value);
            }
            this.servicesForm.get('services_amount').setValue(totalServiceAmt);
        } catch (err) {
            this.global.addException('Total Service amount', 'calculateTotalServicesAmount()', err);
        }
	}
	addServicesForm(option, data: any = {}){
        try {
            console.log(data);
            this.servicesForm = this.fb.group({
                services_amount: new FormControl(option == '1' ? data.services_amount : 0),
                services: this.fb.array([])
            });
            if (option == '1') {
                for (var i = 0; i < data.services.length; i++) {
                    if(data.services[i].is_approved != '2')
                    {
                        this.addServices(option, data.services[i]);
                        this.removeServiceFormList(data.services[i].service_definition_id, 'service_definition_id', this.servicesList);
                    }
                }
            } else {
                //	this.addServices(option);
            }
        } catch (err) {
            this.global.addException('Service form', 'addServicesForm()', err);
        }
	}
	get services(): FormArray{
		try{
			{return <FormArray>this.servicesForm.get('services') as FormArray;}
		}catch(err){
			this.global.addException('PE Qutation Generation Service Tab','get services()',err);
		}

	}


	addServices(option, data: any = {}){
        try {
            this.services.push(this.fb.group({
                service_definition: new FormControl(option == '1' ? data.service_definition : '', []),
                service_definition_id: new FormControl(option == '1' ? data.service_definition_id : ''),
                ad_hoc_service: new FormControl(option == '1' ? data.ad_hoc_service : ''),
                cost: new FormControl(option == '1' ? data.cost : '', []),
                quantity: new FormControl(option == '1' ? data.quantity : '1', [Validators.required, Validators.pattern(this.constant.AMOUNT_PATTERN)]),
                total_amount: new FormControl(option == '1' ? data.total_amount : 0),
                details: new FormControl(option == '1' ? data.details : ''),
                filteredService: new FormControl(new Observable<string[]>()),
            }));

            this.setObservable(this.services.length - 1);
            this.calculateTotalServicesAmount();
        } catch (err) {
            this.global.addException('Add services', 'addServices()', err);
        }
	}
	setObservable(index): void {
        this.services.at(index).get('filteredService').setValue(this.services.at(index).get('service_definition').valueChanges.pipe(startWith(''),map(value => this.serviceFilter(value))));
	}

	removeService(position, service): void {
		service.get('service_definition_id').value != '' ? this.addServiceToList(service.get('service_definition_id').value, 'service_definition_id', this.servicesList, this.backupServicesList) : '' ;
		this.services.removeAt(position);
		this.calculateTotalServicesAmount();
    }
	reviewService(){
        try {
            //console.log(this.servicesForm.value);
            this.submitted = true;
            if (this.servicesForm.valid) {
                this.peService.projectEstimatorData.servicesDetails = this.servicesForm.value;
                for (var i = 0; i < this.peService.projectEstimatorData.servicesDetails.services.length; i++) {
                    if (this.peService.projectEstimatorData.servicesDetails.services[i].service_definition_id == '') {
                        this.peService.projectEstimatorData.servicesDetails.services[i].ad_hoc_service = this.peService.projectEstimatorData.servicesDetails.services[i].service_definition;
                    }
                    delete this.peService.projectEstimatorData.servicesDetails.services[i].filteredService;
                }
                this.peService.updateFormStatus('servicesFm', true);
            } else {
                this.peService.updateFormStatus('servicesFm', false);
            }
        } catch (err) {
            this.global.addException('Review services', 'reviewService()', err);
        }
	}

	showAddServiceDefinationPopup(index): void {
        try {
            this.currentSelection = index;
            this.util.changeEvent(null); this.dialog.open(ProjectEstimatorDialog, { data: { 'action': 'addServiceDefination' } });
        } catch (err) {
            this.global.addException('show  Add Service Popup', 'showAddServiceDefinationPopup()', err);
        }
	}
}
