import { Injectable} from '@angular/core';
import { Router } from '@angular/router';

import { HttpService } from '../../../shared/service/http.service';
import { UtilService } from '../../../shared/service/util.service';
import { FileService } from '../../../shared/service/file.service';

import { DialogComponent } from '../../../shared/model/dialog/dialog.component';

@Injectable()
export class WorkOrderService {
	public timeFormats:any = ['am','pm'];
	private formValidationStatus: any = {
		'servicesFm': false,
		'teamFm': false,
		'assetsFm': false,
		'materialsFm': false
	}		
	quatationTab: string = 'services';
	currentClick: string; 
	private currentState: string ;
	PE_DATA: any = null;
	WO_DATA: any = {};
	requestObjCR: any = {};
    isCRwithService: boolean = false;
    isCRwithProduct: boolean = false;
    isRecurringWO: boolean = false;
    scheduleDetails: any;
    woType: string;
    associatedAsset: any[] = [];
    deletedService: any[] = [];
    deletedProductMaterial: any[] = [];
    deletedTeamMember: any[] = [];
    deletedAsset: any[] = [];
    deletedPaySchedule: any[] = [];
    //crAlert: boolean = false;
	constructor(private file: FileService, private util: UtilService, public http: HttpService, public router: Router,){}
	
	updateFormStatus(form, status): void { this.formValidationStatus[form] = status; }
	getFormValidationStatus() { return this.formValidationStatus; }
	setcurrentState(state){ this.currentState = state; };
	getcurrentState(){ return this.currentState; };

	public changeFormat(event, control){
        let format = event.target.value.split(':');
        format = format[1].split(' ');
        console.log(format);
        control.setValue(format[1]);
    }

    addCR(callback){
    	let self = this;
        console.log('API CALL...');
        self.requestObjCR.schedule[0].start_date = this.util.getYYYYMMDDDate(self.requestObjCR.schedule[0].start_date);
        self.requestObjCR.schedule[0].end_date = this.util.getYYYYMMDDDate(self.requestObjCR.schedule[0].end_date);
        this.deletedService.map(item => { 
            self.requestObjCR.services.push({
                'wo_service_id': item,
                'is_deleted': 1  
            }) 
        });

        this.deletedProductMaterial.map(item => { 
            self.requestObjCR.productMaterial.push({
                'wo_material_id': item,
                'is_deleted': 1  
            }) 
        });

        this.deletedTeamMember.map(item => { 
            self.requestObjCR.team.push({
                'scheduling_id': item,
                'is_deleted': 1  
            }) 
        });

        this.deletedAsset.map(item => { 
            self.requestObjCR.assets.push({
                'scheduling_id': item,
                'is_deleted': 1  
            }) 
        });

        delete self.requestObjCR.work_location;
        
        this.http.doPost('WorkOrder/edit', self.requestObjCR, function(error: boolean, response: any){
        	return callback(error, response);
        });
    }

    checkValidation(woData, callback){
    	//this.checkFormStatusEvent('ADD_SERVICES', {});
        //this.checkFormStatusEvent('ADD_TEAM', {});
        //this.checkFormStatusEvent('ADD_ASSETS', {});
        //this.checkFormStatusEvent('ADD_PROD_MAT', {});
        console.log("CheckValidation in service", this.WO_DATA);
        if(!this.getFormValidationStatus().servicesFm){
            this.quatationTab = 'services'; 
            this.router.navigate(['/workflow/wo/csa/wo-external/services']);
            return callback(false);
        }else if(!this.getFormValidationStatus().teamFm){
            this.quatationTab = 'team'; 
            this.router.navigate(['/workflow/wo/csa/wo-external/team']);
            return callback(false);
        }else if(!this.getFormValidationStatus().assetsFm){
            this.quatationTab = 'assets'; 
            this.router.navigate(['/workflow/wo/csa/wo-external/assets']);
            return callback(false);
        }else if(!this.getFormValidationStatus().materialsFm){
            this.quatationTab = 'products'; 
            this.router.navigate(['/workflow/wo/csa/wo-external/products']);
            return callback(false);
        }

        sessionStorage.setItem('woDetails', JSON.stringify(this.WO_DATA));
        sessionStorage.setItem('woFormFlag', JSON.stringify(this.getFormValidationStatus));

        this.WO_DATA.scheduleInfo = {};
        this.WO_DATA.scheduleInfo.schedule_items = woData.woForm.value.schedule;
        for(let i = 0; i < this.WO_DATA.assetsDetails.length; i++){
            if(woData.currentAction != 'EDIT'){
                this.WO_DATA.assetsDetails[i].start_date = this.util.getDDMMYYYYDate(this.WO_DATA.assetsDetails[i].start_date);
                this.WO_DATA.assetsDetails[i].end_date = this.util.getDDMMYYYYDate(this.WO_DATA.assetsDetails[i].end_date);
            }
            if(woData.isEdit && i < woData.WOSubContractorObj.assetsDetails.length){
                this.WO_DATA.assetsDetails[i].scheduling_id = woData.WOSubContractorObj.assetsDetails[i].scheduling_id;
            }
        }
        for(let i = 0; i < this.WO_DATA.scheduleInfo.schedule_items.length; i++){
            if(woData.currentAction != 'EDIT'){
                this.WO_DATA.scheduleInfo.schedule_items[i].start_date = this.util.getDDMMYYYYDate(this.WO_DATA.scheduleInfo.schedule_items[i].start_date);
                this.WO_DATA.scheduleInfo.schedule_items[i].end_date = this.util.getDDMMYYYYDate(this.WO_DATA.scheduleInfo.schedule_items[i].end_date);
            }
            if(woData.isEdit && i < woData.WOSubContractorObj.scheduleInfo.schedule_items.length){
                this.WO_DATA.scheduleInfo.schedule_items[i].scheduling_id = woData.WOSubContractorObj.scheduleInfo.schedule_items[i].scheduling_id;
            }
        }
        for(let i = 0; i < this.WO_DATA.teamDetails.length; i++){
            if(woData.currentAction != 'EDIT'){
                this.WO_DATA.teamDetails[i].start_date = this.util.getDDMMYYYYDate(this.WO_DATA.teamDetails[i].start_date);
                this.WO_DATA.teamDetails[i].end_date = this.util.getDDMMYYYYDate(this.WO_DATA.teamDetails[i].end_date);
            }
            if(woData.isEdit && i < woData.WOSubContractorObj.teamDetails.length){
                this.WO_DATA.teamDetails[i].scheduling_id = woData.WOSubContractorObj.teamDetails[i].scheduling_id;
            }
        }
        for(let i = 0; i < this.WO_DATA.materialsDetails.length; i++){
            if(woData.isEdit && i < woData.WOSubContractorObj.materialsDetails.length){
                this.WO_DATA.materialsDetails[i].wo_material_id = woData.WOSubContractorObj.materialsDetails[i].wo_material_id;
            }
        }
        if(woData.currentAction == 'EDIT'){
            //this.WOService.WO_DATA.servicesDetails = this.WOSubContractorObj.servicesDetails;
            for(let i = 0; i < this.WO_DATA.servicesDetails.length; i++){
                if(woData.isEdit && i < this.WO_DATA.servicesDetails.length){
                    this.WO_DATA.servicesDetails[i].wo_service_id = this.WO_DATA.servicesDetails[i].service_definition_id;
                }
            }
        }else{
            for(let i = 0; i < this.WO_DATA.servicesDetails.length; i++){
                if(woData.isEdit && i < woData.WOSubContractorObj.servicesDetails.length){
                    this.WO_DATA.servicesDetails[i].wo_service_id = woData.WOSubContractorObj.servicesDetails[i].wo_service_id;
                }
            }
        }
        

        this.WO_DATA.work_order_type = '2';
        // this.WOService.WO_DATA.client_id = this.selectedQuotation.client_id;
        this.WO_DATA.client_id = woData.WOSubContractorObj.client_id;
        this.WO_DATA.require_client_sign = woData.woForm.value.require_client_sign ? 1 : 0;
        // this.WOService.WO_DATA.work_location_id = this.selectedQuotation.client_work_location_id;
        this.WO_DATA.work_location_id = woData.selectedQuotation.client_work_location.location_id;
        this.WO_DATA.work_location = woData.selectedQuotation;
        // this.WOService.WO_DATA.project_estimate_id = this.selectedQuotation.project_estimate_id;
        this.WO_DATA.project_estimate_id = woData.WOSubContractorObj.project_estimate_id;

        return callback(true);
    }

    checkFormStatusEvent(action, data): void {
        this.util.changeEvent({
            'source': 'EXTERNAL_WO', 
            'action': action,
            'data': {}
        });
    }

}
