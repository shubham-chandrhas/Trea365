import { Component, OnInit, Inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { FormControl, FormGroup, FormBuilder, FormArray, Validators, NgForm, AbstractControl } from '@angular/forms';

import { UtilService } from '../../../../shared/service/util.service';
import { ConstantsService } from '../../../../shared/service/constants.service';
import { GlobalService } from '../../../../shared/service/global.service';

declare var $:any;

@Component({
	selector: 'app-add-business-nature',
  	templateUrl: './add-business-nature.component.html',
  	styleUrls: ['./add-business-nature.component.css']
})
export class AddBusinessNatureComponent implements OnInit {
	public errMsg:string = '';
	public isError:boolean = false; 
	public submitted:boolean = false;
	public formAction: string = 'add';
	private routeParam;
	private businessNatureId :number;
	addBusinessNatureFrm:FormGroup;
	  
  	constructor(
		  public util: UtilService,
		  public constant: ConstantsService,
		  private fb: FormBuilder,
		  private router: Router,
		  private route: ActivatedRoute,
		  private global: GlobalService
		) { }

  	ngOnInit() {
		this.util.setWindowHeight();
		this.util.setPageTitle(this.route);
		try{
			if(this.router.url.split('/')[2]=='csa-onboarding'){
				this.util.menuChange({'menu':'guide','subMenu':''}); //for onboarding dashboard
			}else{
				this.util.menuChange({'menu':2,'subMenu':11});
			}
			//alert(atob(this.route.snapshot.paramMap.get('id')));
			this.routeParam = atob(this.route.snapshot.paramMap.get('id'));
		
			if( atob(this.route.snapshot.paramMap.get('id')) == '0' ){
				if( sessionStorage.getItem('businessNature') ){
					//this.formAction = 'edit';
					this.createBusinessNatureFrm('edit', JSON.parse(sessionStorage.getItem('businessNature')));	
				}else{
					this.formAction = 'add';
					this.createBusinessNatureFrm(this.formAction);
				}
			}else{
				this.formAction = 'edit';
				this.businessNatureId = 101;
				this.createBusinessNatureFrm('edit', JSON.parse(sessionStorage.getItem('businessNature')));
			}
		}catch(err){
            this.global.addException('Add Business Nature','ngOnInit()',err);
        }
  	}

	public createBusinessNatureFrm(action, busiNatureObj:any = {}){
		this.addBusinessNatureFrm = this.fb.group({
			companyId: new FormControl(this.util.getCompanyId()),
			businessTypeId: new FormControl(action == 'edit' ? busiNatureObj.businessTypeId : ''),
			businessType: new FormControl(action == 'edit' ? busiNatureObj.businessType : '',[
				Validators.required,
				Validators.minLength(2),
				Validators.maxLength(this.constant.DEFAULT_TEXT_MAXLENGTH)
			]),
			services: this.fb.array([])
		});	
		if(action == 'add'){
			this.addServiceType(0, 0);
		}else{
			this.setBusiNatureDetails(busiNatureObj);
		}
		
	}
	get businessTypeId(){return this.addBusinessNatureFrm.get('businessTypeId');}
	get businessType(){return this.addBusinessNatureFrm.get('businessType');}
	get services(): FormArray {return <FormArray>this.addBusinessNatureFrm.get('services') as FormArray; }
	serviceDefinition(index): FormArray { return <FormArray>this.services.at(index).get('serviceDefinition') as FormArray; };

	getServiceTypeAt(index){ return this.services.at(index) };
	getServiceDefinitionAt(serviceIndx, serDefIndx){ return this.serviceDefinition(serviceIndx).at(serDefIndx) };

	checkPrice(price): void { price.setValue(this.util.removeCommas(price.value)); }

	public setBusiNatureDetails(busiNatureObj){
        let self = this;
        //self.addBusinessNatureFrm.get('businessType').setValue(busiNatureObj.businessType);
		for(let i=0; i<busiNatureObj.services.length; i++){
			this.addServiceType(i, 1, busiNatureObj.services[i]);
		}
	}
	cancelBusiNature(){
		try{
			if(this.router.url.split('/')[2]=='csa-onboarding'){
				this.router.navigate(['/csa-onboarding/guide']);
			}else{
				this.router.navigate(['/admin/csa/business-nature/0']);
			}
		}catch(err){
            this.global.addException('Add Business Nature','cancleBusiNature()',err);
        }
	}
	reviewBusiNature(form:FormGroup):void{
		this.errMsg = '';
        this.isError = false; 
		this.submitted = true;
		console.log("form.value",form.value);
		try{
			if(form.valid){
				let reqData = form.value;
				let self = this;
				this.isError = false; 
				
				if(this.routeParam == 0){
					sessionStorage.setItem('businessNature',JSON.stringify(reqData));
					if(self.router.url.split('/')[2]=='csa-onboarding'){
						self.router.navigate(['/admin/csa-onboarding/review-business-nature/'+btoa('add')]);
					}else{
						self.router.navigate(['/admin/csa/review-business-nature/'+btoa('add')]);
					}
				}else{
					reqData.businessTypeId = JSON.parse(sessionStorage.getItem('businessNature')).businessTypeId;
					sessionStorage.setItem('businessNature',JSON.stringify(reqData));
					
					if(self.router.url.split('/')[2]=='csa-onboarding'){
						self.router.navigate(['/admin/csa-onboarding/review-business-nature/'+btoa('edit')]);
					}else{
						self.router.navigate(['/admin/csa/review-business-nature/'+btoa('edit')]);
					}
				}
				
			}else{
				this.isError = true;
			}
		}catch(err){
            this.global.addException('Add Business Nature','reviewBusiNature()',err);
        }
	}

	  
  	addServiceType(serTypeIndx, option, serviceData: any ={}){
		this.submitted = false;
		this.services.push(this.fb.group({
			serviceTypeId: new FormControl(option == 1 ? serviceData.serviceTypeId : ''),
			is_deleted: new FormControl('0'),
			serviceType: new FormControl(option == 1 ? serviceData.serviceType : '', [  
			Validators.required,
			Validators.maxLength(200)
		]),
		serviceDefinition: this.fb.array([])
		}));
		if(option == 0){
			this.addServiceDefinition(serTypeIndx, 0);
		}else{
			for(let i=0;i<serviceData.serviceDefinition.length;i++){
				this.addServiceDefinition(serTypeIndx, 1, serviceData.serviceDefinition[i]);
			}
		}
		
  	}
	
  	addServiceDefinition(serviceIndx, option, serDefData: any = {}){
		  this.submitted = false;
		  this.serviceDefinition(serviceIndx).push(new FormGroup({
			service_definition_id: new FormControl(option == 1 ? serDefData.service_definition_id : ''),
			is_deleted: new FormControl(option == 1 ? (serDefData.is_deleted ? serDefData.is_deleted : '0') : '0'),
			name: new FormControl(option == 1 ? serDefData.name : '', [Validators.required,Validators.maxLength(200)]),
			price: new FormControl(option == 1 ? serDefData.price : '', [  
				Validators.required,
				Validators.maxLength(30),
				Validators.pattern(this.constant.AMOUNT_PATTERN)
				]) 
		  })); 
  	}

  	removeServiceType(serTypeIndx){
		if(!this.getServiceTypeAt(serTypeIndx).get('serviceTypeId').value){
			this.services.removeAt(serTypeIndx);
		}else{
			this.getServiceTypeAt(serTypeIndx).get('is_deleted').setValue('1');
		}
  	}
	removeServiceDefinition(serTypeIndx, serDefIndx){ 
		if(!this.getServiceDefinitionAt(serTypeIndx, serDefIndx).get('service_definition_id').value){
			this.serviceDefinition(serTypeIndx).removeAt(serDefIndx);
		}else{
			this.getServiceDefinitionAt(serTypeIndx, serDefIndx).get('is_deleted').setValue('1');
		} 
	}
}
