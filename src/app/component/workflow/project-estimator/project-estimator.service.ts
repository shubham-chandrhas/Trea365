import { Injectable} from '@angular/core';
//import { BehaviorSubject } from 'rxjs/BehaviorSubject';
//import { Validators } from '@angular/forms';

// import { ConstantsService } from '../../../shared/service/constants.service';
// import { ExportService } from '../../../shared/service/export.service';
// import { HttpService } from '../../../shared/service/http.service';
import { UtilService } from '../../../shared/service/util.service';
import { FileService } from '../../../shared/service/file.service';
import { GlobalService } from '../../../shared/service/global.service';
import { DialogComponent } from '../../../shared/model/dialog/dialog.component';

@Injectable()
export class ProjectEstimatorService {
	private formValidationStatus: any = {
		'servicesFm': false,
        'materialsFm': false,
		'scheduleFm': false,
		'paymentScheduleFm': false
	}

	projectEstimatorData: any = {};
	siteInspection: any = {};
	locationDetails: any = {
		'latitude': '',
    	'longitude': '',
    	'zoom': 18
	};
	constructor(private file: FileService, private util: UtilService, public global: GlobalService,){}

	updateFormStatus(form, status): void { this.formValidationStatus[form] = status; }
	getFormValidationStatus() { return this.formValidationStatus; }
	setFormValidationStatus(statusObj) { this.formValidationStatus = statusObj; }

	setResponseForPE(data){
			var self = this;
			try{
					self.projectEstimatorData = data;
					self.projectEstimatorData.reference_pe_id = data.project_estimate_id;
					self.projectEstimatorData.clientDetails= {
					"client_name": data.client_details.company_name?data.client_details.company_name:data.client_details.first_name + data.client_details.last_name,
					"client_id":data.client_details.client_id,"location":data.client_work_location.address_line_1,"location_id":data.client_work_location.client_address_id,
					"billingLocationSameAsWork":(data.client_work_location.client_address_id==data.client_billing_location.client_address_id)?true:false,
					"client_billing_location":data.client_billing_location.address_line_1,"client_billing_location_id":data.client_billing_location.client_address_id,
					"contact_name":data.client_contact_details.name,
					"contact_id":data.client_contact_details.client_contact_id,
					"email":data.client_contact_details.email_id,
					"phoneNo":data.client_contact_details.phone_no,
					"requirements":data.requirements};

					self.projectEstimatorData.servicesDetails={"services_amount":data.costs.length>0 ? self.projectEstimatorData.costs[0].cost_of_services:"","services":data.services};

					data.services.forEach(function (value,key) {
						if(value.service_definition_id!=0)
							self.projectEstimatorData.servicesDetails.services[key].service_definition = value.service_defination.service_definition
						else
							self.projectEstimatorData.servicesDetails.services[key].service_definition =value.ad_hoc_service
					});

					self.projectEstimatorData.materialsDetails={"materials_amount":data.costs.length>0?data.costs[0].cost_of_materials:'',"materials":data.product_materials}

					data.product_materials.forEach(function (value,key) {
					self.projectEstimatorData.materialsDetails.materials[key].item_id = value.manf_part_id;
					self.projectEstimatorData.materialsDetails.materials[key].short_name = value.manf_part.short_name;
					});

					self.projectEstimatorData.scheduleDetails =  data.schedules;
					if(self.projectEstimatorData.scheduleDetails)
						self.projectEstimatorData.scheduleDetails.schedule_type_name= self.projectEstimatorData.scheduleDetails.schedule_type_details.status;

					//  self.projectEstimatorData.scheduleDetails.start_date=self.util.getDDMMYYYYDate(self.projectEstimatorData.schedules.start_date);
					//   self.projectEstimatorData.scheduleDetails.end_date=self.util.getDDMMYYYYDate(self.projectEstimatorData.schedules.end_date);
				//   self.projectEstimatorData.scheduleDetails.start_date=self.util.stringToDate(self.projectEstimatorData.schedules.start_date);
				//  self.projectEstimatorData.scheduleDetails.end_date=self.util.stringToDate(self.projectEstimatorData.schedules.end_date);

				self.projectEstimatorData.paymentScheduleDetails={
					"cost_of_service":data.costs.length>0? self.projectEstimatorData.costs[0].cost_of_services:'0',
					"cost_of_material":data.costs.length>0? data.costs[0].cost_of_materials:'0',
					"sub_total":data.costs.length>0? data.costs[0].subtotal:'0',
					"total_cost":data.costs.length>0? data.costs[0].total_cost:'0',
					"tax_amount":data.costs.length>0 ? data.costs[0].tax_amount:'0',
					"shipping_handling":data.costs.length>0? data.costs[0].shipping_and_handling:'',
					"adjustment":data.costs.length>0? data.costs[0].adjustment:'',
					"taxes":data.costs.length>0? data.costs[0].taxes:'',
					"date_items":data.payment_schedules ? data.payment_schedules :[]
				};
				this.siteInspection = self.projectEstimatorData.site_inspection;
				let totalPaymentAmount = 0;
				data.payment_schedules.forEach(function (value,key) {
					self.projectEstimatorData.paymentScheduleDetails.date_items[key].payment_date = value.payment_date;
					self.projectEstimatorData.paymentScheduleDetails.date_items[key].amount_due = parseFloat(value.amount_due);
					totalPaymentAmount += parseFloat(value.amount_due);
				});
				self.projectEstimatorData.paymentScheduleDetails.totalPaymentAmount = totalPaymentAmount;
				data.images.forEach(function (value,key) {
					self.projectEstimatorData.images[key].attachment_name = value.attachment_path;
					self.projectEstimatorData.images[key].attachment_path = value.image_path
				});

				return JSON.stringify(self.projectEstimatorData);
			}catch(err){
					this.global.addException('PE service','setResponseForPE()',err);
			}

	}


	saveProjectEstimator(action,option, callback){
		let self = this;
		let formData:FormData = new FormData();
		let quotationDetails = JSON.parse(sessionStorage.getItem('quotationDetails'));
		let costOfService: any = 0, costOfMaterial: any = 0;
		let paymentDetails: any = quotationDetails.paymentScheduleDetails;
		console.log("Details:"+ JSON.stringify(quotationDetails));
		let paymentSchedule: any[] = [];
		if(paymentDetails){
			JSON.parse(JSON.stringify(paymentDetails.date_items)).map(item => {
				if(item.payment_date != '' || item.amount_due != ''){
					if(item.payment_date != '')
						item.payment_date = this.util.getYYYYMMDDDate(new Date(item.payment_date));
					paymentSchedule.push(item);
				}
			});
		}


		//paymentDetails ? JSON.parse(JSON.stringify(paymentDetails.date_items)) : [];
		//paymentSchedule.filter(item => item.payment_date = this.util.getYYYYMMDDDate(new Date(item.payment_date)));

		//if(paymentSchedule)
			// paymentSchedule.forEach(function(v){ delete v.pe_payment_schedule_id });

		if(quotationDetails.materialsDetails)
			quotationDetails.materialsDetails.materials.map(material => { costOfMaterial += parseFloat(material.total_amount) });

		if(quotationDetails.servicesDetails)
			quotationDetails.servicesDetails.services.map(service => { costOfService += parseFloat(service.total_amount) });
		//console.log(quotationDetails.materialsDetails.materials);

		if(action=='add'){
			formData.append('reference_pe_id', '0');
		}else if(action =='edit'){
			console.log("schedules:",quotationDetails.scheduleDetails);
			quotationDetails.servicesDetails.services.forEach(function(v){
				quotationDetails.services.forEach(function(va){
					if(va.service_definition_id == v.service_definition_id){
						v.pe_service_id = va.pe_service_id;
					}
				});
			});

			if(quotationDetails.scheduleDetails && quotationDetails.scheduleDetails.start_date && quotationDetails.scheduleDetails.start_date.indexOf('-') > -1){
				quotationDetails.scheduleDetails.start_date = this.convertDate(quotationDetails.scheduleDetails.start_date);
				quotationDetails.scheduleDetails.end_date = this.convertDate(quotationDetails.scheduleDetails.end_date);
			}
      formData.append('reference_pe_id', quotationDetails.project_estimate_id);
			formData.append('randomKey', quotationDetails.randomKey);
			if(paymentDetails)
				quotationDetails.subtotal = parseInt(paymentDetails.cost_of_service) + parseInt(paymentDetails.cost_of_material);
		}


		formData.append('client_id', quotationDetails.clientDetails.client_id );
		formData.append('client_work_location_id', quotationDetails.clientDetails.location_id );
		formData.append('client_billing_location_id', quotationDetails.clientDetails.billingLocationSameAsWork ? quotationDetails.clientDetails.location_id : quotationDetails.clientDetails.client_billing_location_id );
		formData.append('client_contact_id', quotationDetails.clientDetails.contact_id );
		formData.append('requirements', quotationDetails.clientDetails.requirements);
		quotationDetails.servicesDetails ? formData.append('services', JSON.stringify(quotationDetails.servicesDetails.services)) : '';
		quotationDetails.materialsDetails ? formData.append('item', JSON.stringify(quotationDetails.materialsDetails.materials)) : '';

		if(option == 'SEND_QUOTE'){
			formData.append('saveAndSend', '1');
		}
		if(quotationDetails.followUpDetails){
			formData.append('follow_up_by', JSON.stringify(quotationDetails.followUpDetails.inspector_follow));
			formData.append('follow_up_comment', JSON.stringify(quotationDetails.followUpDetails.comment));
		}
		//console.log("paymentDetails.cost_of_service ====", paymentDetails.cost_of_service)
		let subTotal = parseFloat(costOfService)+parseFloat(costOfMaterial);
		let shipping = paymentDetails && paymentDetails.shipping_handling && paymentDetails.shipping_handling != '' && paymentDetails.shipping_handling != 0 ? parseFloat(paymentDetails.shipping_handling) : 0;
		let adjustment = paymentDetails && paymentDetails.adjustment && paymentDetails.adjustment != '' && paymentDetails.adjustment != 0 ? parseFloat(paymentDetails.adjustment) : 0;
		let tax = paymentDetails && paymentDetails.taxes && paymentDetails.taxes != '' && paymentDetails.taxes != 0 ? parseFloat(paymentDetails.taxes) : 0;
		let taxAmount = ((subTotal+shipping+adjustment)*(tax/100));
		let totalCost = (subTotal+shipping+adjustment+taxAmount);
		formData.append('cost', JSON.stringify([{
			"cost_of_services": costOfService,
			"cost_of_materials": costOfMaterial,
			"shipping_and_handling": shipping,
			"adjustment": adjustment,
			"subtotal": subTotal,
			"taxes": tax,
			"tax_amount": taxAmount,
			"total_cost": totalCost
		}]));
		//console.log(typeof quotationDetails.scheduleDetails.schedule_days);
			quotationDetails.scheduleDetails ? formData.append('schedules', JSON.stringify([{
				"schedule_type": quotationDetails.scheduleDetails.schedule_type,
				"start_date": quotationDetails.scheduleDetails.start_date ? this.convertDate(quotationDetails.scheduleDetails.start_date) : '',
				"end_date": quotationDetails.scheduleDetails.end_date ?  this.convertDate(quotationDetails.scheduleDetails.end_date) : '',
				"start_time": quotationDetails.scheduleDetails.start_time ?  quotationDetails.scheduleDetails.start_time : '',
				"start_time_format": quotationDetails.scheduleDetails.start_time_format,
				"end_time": quotationDetails.scheduleDetails.end_time ?  quotationDetails.scheduleDetails.end_time : '',
				"end_time_format": quotationDetails.scheduleDetails.end_time_format,
				"schedule_repeat":quotationDetails.scheduleDetails.schedule_repeat,
				"schedule_days":typeof quotationDetails.scheduleDetails.schedule_days=='object' ? quotationDetails.scheduleDetails.schedule_days : quotationDetails.scheduleDetails.schedule_days.split(","),
				"end_after_occurences":quotationDetails.scheduleDetails.end_after_occurences,
				"is_after" : quotationDetails.scheduleDetails.is_after

			}])) : '';


		if(option == 'SITE_INSPECTION'){
			formData.append('inspection', JSON.stringify([{
				"inspection_date": this.util.getYYYYMMDDDate(new Date(quotationDetails.siteInspection.inspection_date)),
				"start_time": quotationDetails.siteInspection.start_time,
				"start_time_format": quotationDetails.siteInspection.start_time_format,
				"end_time": quotationDetails.siteInspection.end_time,
				"end_time_format": quotationDetails.siteInspection.end_time_format,
				"inspector": quotationDetails.siteInspection.inspector
			}]));

			formData.append('status', '1');
		}else if(option == 'APPROVE'){
			formData.append('status', '5');
			formData.append('approve_note', quotationDetails.approveNote ? quotationDetails.approveNote : '');
		}else if(option == 'SEND_QUOTE'){
			formData.append('status', '4');
		}else{
			formData.append('status', '1');
		}
			// PE_STATUS 1 Saved
			// * PE_STATUS 2 Scheduled
			// * PE_STATUS 3 Changed
			// * PE_STATUS 4 Sent
			// * PE_STATUS 5 Approved
			// * PE_STATUS 6 Rejected
			// * PE_STATUS 7 Expired

		// this.projectEstimatorData.images ? this.projectEstimatorData.images = this.projectEstimatorData.images.filter(item => item.fileId=='') : '';
		console.log(this.projectEstimatorData,quotationDetails.scheduleDetails);

		if(this.projectEstimatorData.images){
			this.projectEstimatorData.images = this.projectEstimatorData.images.filter(item => item.fileId=='');
			formData.append('fileCount', this.projectEstimatorData.images.length);
			for (var i = 0; i < this.projectEstimatorData.images.length; i++) {
	            formData.append('fileUploaded'+(i+1), this.projectEstimatorData.images[i].file);
	        }
		}

		formData.append('payment_schedule', JSON.stringify(paymentSchedule));
		//console.log("formData:"+formData[0]);
		this.file.formDataAPICall(formData, 'WorkflowProjectEstimates', function(error: boolean, response: any){

			return callback(error, response);
            //self.util.removeSpinner('sub-btn', "Submit");
            //if(error){
                //self.isError = true;
                //self.errMsg = response.message;
                //return callback(error, response);
            //}else{
            	//alert(response.message);
            	//self.util.showDialog(DialogComponent, response.message,  ['/workflow/quote/csa/quotation-list/0'] );
                //sessionStorage.removeItem('newPart');
                //self.util.setMfgPartData([]);
                //self.currentPath == 'manufacturer-part-review' ? self.util.showDialog(DialogComponent, response.message, [self.routeObj.list, self.routeObj.add]) : self.onTheFlyEvent({'step': 'DONE', 'id': self.mfgPartObj.manufacturerId});
            //}
        });
	}

	convertDate(dateStr){
		if(dateStr == ""){ return "" };
		if(dateStr.indexOf('/') > -1){
			return this.util.getYYYYMMDDDate(this.util.stringToDate(dateStr));
		}else{
			return this.util.getYYYYMMDDDate(new Date(dateStr));
		}
	}

	// client_id:1
	// client_contact_id:1
	// client_work_location_id:1
	// client_billing_location_id:1
	// requirements:test
	// follow_up_by:2
	// follow_up_comment:test
	// cost:[{"cost_of_services":3400,"cost_of_materials":2000, "shipping_and_handling":300,"adjustment":100,"subtotal":5800,"taxes":10, "total_cost":6380}]
	// payment_schedule:[{"payment_date":"2018-08-13", "amount_due":3190}, {"payment_date":"2018-08-23", "amount_due":3190}]
	// products:[{"cost":340, "quantity":2, "total_amount":680, "details":"test" }, {"product_id":367, "cost":340, "quantity":1, "total_amount":340, "details":"test"} ]
	// materials:[{"material_id":755, "cost":440, "quantity":2, "total_amount":880, "details":"test" },{"material_id":235, "cost":440, "quantity":1, "total_amount":440, "details":"test" }]
	// schedules:[{"schedule_type":1, "schedule_repeat":2, "start_date":"2018-08-18", "end_date":"2018-08-18", "start_time":"10:00", "start_time_format":"AM", "end_time":"17:00", "end_time_format":"PM", "schedule_days":["Mon","Tue","Wed"], "end_after_occurences":4 }]
	// services:[{"service_definition_id":null, "ad_hoc_service":"value", "cost":350, "quantity":3, "total_amount":1050, "details":"test" }, {"service_definition_id":"id" , "ad_hoc_service":"value", "cost":400, "quantity":3, "total_amount":1200, "details":"test" }]
	// inspection:[{"inspection_date":"2018-08-09", "start_time":"10:00", "start_time_format":"AM", "end_time":"11:00", "end_time_format":"AM", "inspector":"346"}]

}
