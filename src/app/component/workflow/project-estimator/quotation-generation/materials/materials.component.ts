import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormBuilder, FormArray, Validators, NgForm, AbstractControl } from '@angular/forms';
import { GlobalService } from '../../../../../shared/service/global.service';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { UtilService } from '../../../../../shared/service/util.service';
import { HttpService } from '../../../../../shared/service/http.service';
import { ConstantsService } from '../../../../../shared/service/constants.service';
import { ProjectEstimatorService } from '../../project-estimator.service';

@Component({
	selector: 'app-materials',
	templateUrl: './materials.component.html',
	styleUrls: ['../quotation-generation.component.css', './materials.component.scss']
})
export class MaterialsComponent implements OnInit {

	materialsForm: FormGroup;
	materialsList: any[] = [];
    backupMaterialsList: any[] = [];
	submitted: boolean = false;

	constructor(
		public util: UtilService,
		private constant: ConstantsService,
		private fb: FormBuilder,
		private http:HttpService,
        private PEService: ProjectEstimatorService,
        private global: GlobalService
	) { }

	ngOnInit() {
		this.util.showProcessing('processing-spinner');

		this.getMaterialList();
		this.addMaterialsForm('0');
    }

    getEditMaterial()
    {
        if(this.PEService.projectEstimatorData.materialsDetails && this.PEService.projectEstimatorData.materialsDetails.materials.length>0 ){
			console.log(this.PEService.projectEstimatorData.materialsDetails);
			this.addMaterialsForm('1', this.PEService.projectEstimatorData.materialsDetails);
		}else{
			console.log("else");
			this.addMaterialsForm('0');
		}

		this.util.changeDetection.subscribe(dataObj => {
      		if(dataObj && dataObj.source == 'QUOTATION_GENERATION' && dataObj.action == 'ADD_MATERIALS'){
        		this.reviewMaterial();
      		}
    	});
    }

	//Get Material/Product List
	getMaterialList(){
		var self = this;
		this.http.doGet('materials', function(error: boolean, response: any){
            self.util.hideProcessing('processing-spinner');
            if(error){ console.log(response) }else{
				console.log("manufPart",response.data);
				self.materialsList = [];
				if(response.data){
					self.materialsList = response.data;
                    self.backupMaterialsList = JSON.parse(JSON.stringify(response.data));
                    console.log("self.materialsList",self.materialsList);
                    self.getEditMaterial();
					console.log(self.materials.length);
					if(self.materials.length>0)
						self.materials.at(0).get('filteredMaterial').setValue(self.materials.at(0).get('short_name').valueChanges.pipe(startWith(''),map(value => self.materialFilter(value))));
				}
            }
        });
	}

	private materialFilter(value: string): string[] {
        return this.materialsList.filter(option => option.short_name.toLowerCase().includes(value ? value.toLowerCase() : ''));
	}

	getSelectedMaterial(material, event: any = false, index): void {
		if(event.isUserInput){
            console.log(material);
			this.materials.at(index).get('item_id').setValue(material.manf_part_id);
			this.materials.at(index).get('cost').setValue(material.cost);
			let totalAmt = this.materials.at(index).get('cost').value*this.materials.at(index).get('quantity').value;
			this.materials.at(index).get('total_amount').setValue(totalAmt);
			this.materials.at(index).get('type').setValue(material.class_name.item_class_type == 'Product' ? 2 : 1);
            this.materials.at(index).get('uom').setValue(material.uom_name ? material.uom_name.uom_symbol : '');
			this.calculateTotalMaterialsAmount();
            this.addValidation(this.materials, index);
            this.removeMaterialFormList(material.manf_part_id, 'manf_part_id', this.materialsList);
        }
    }
	public validateMaterial(event:any, item:any, index){
        try {
            let material = event.target.value;

            if (material == '') {
                let checkOccurance = this.materialsList.filter(listItem => listItem.manf_part_id == item.get('item_id').value);
                item.get('item_id').value != '' && checkOccurance.length == 0 ? this.materialsList.push(this.backupMaterialsList.filter(listItem => listItem.manf_part_id == item.get('item_id').value)[0]) : '';
                item.get('item_id').setValue('');
                for (let i = 0; i < this.materials.length; i++) {
                    this.materials.at(i).get('item_id').value == '' ? this.setObservable(i) : '';
                }
                return;
            }
            this.addValidation(this.materials, index);
            let match = [];
            match = this.materialsList.filter(item => item.short_name.toLowerCase() == material.toLowerCase());
            if (match.length > 0) {
                item.get('item_id').setValue(match[0].manf_part_id);
                item.get('short_name').setValue(match[0].short_name);
                item.get('cost').setValue(match[0].cost);
                item.get('uom').setValue(match[0].uom_name ? match[0].uom_name.uom_symbol : '');

                this.removeMaterialFormList(material.manf_part_id, 'manf_part_id', this.materialsList);
            } else {
                if(item.get('item_id').value != ''){
                    let matName = this.backupMaterialsList.filter(listItem => listItem.manf_part_id == item.get('item_id').value)[0].short_name;

                    if(matName.toLowerCase() != material.toLowerCase()){
                        let checkOccurance = this.materialsList.filter(listItem => listItem.manf_part_id == item.get('item_id').value);
                        checkOccurance.length == 0 ? this.materialsList.push(this.backupMaterialsList.filter(listItem => listItem.manf_part_id == item.get('item_id').value)[0]) : '';
                        item.get('item_id').setValue('');
                    }
                }
            }
        } catch (err) {
            this.global.addException('materialValidation', 'validateMaterial()', err);
        }
    }

    removeMaterialFormList = (id, key, list) => {
        this.materialsList = list.filter(item => item[key] != id);
        for (let i = 0; i < this.materials.length; i++) {
            this.materials.at(i).get('item_id').value == '' ? this.setObservable(i) : '';
        }
    };

    addMaterialToList = (id, key, list, backupList) => {
        let checkOccurance = this.materialsList.filter(listItem => listItem.manf_part_id == id);
        checkOccurance.length == 0 ? list.push(backupList.filter(item => item[key] == id)[0]) : '';
        for (let i = 0; i < this.materials.length; i++) {
            this.materials.at(i).get('item_id').value == '' ? this.setObservable(i) : '';
        }
    }

    addValidation(control, index){
        control.at(index).get('item_id').setValidators([Validators.required]);
        control.at(index).get('cost').setValidators([Validators.required, Validators.pattern(this.constant.AMOUNT_PATTERN)]);
        control.at(index).get('quantity').setValidators([Validators.required, Validators.pattern(this.constant.AMOUNT_PATTERN)]);
        control.at(index).get('cost').updateValueAndValidity();
        control.at(index).get('item_id').updateValueAndValidity();
        control.at(index).get('quantity').updateValueAndValidity();
    }

    calculateTotal(event: any, item: any, index) {
        try {
            let material = event.target.value;
            //console.log(material);
            if (material == '') {
                item.get('total_amount').setValue(0);
                this.calculateTotalMaterialsAmount();
                return;
            } else {
                let totalAmt = item.get('cost').value * item.get('quantity').value;
                item.get('total_amount').setValue(totalAmt);
                this.calculateTotalMaterialsAmount();
            }
        } catch (err) {
            this.global.addException('materialCalculate', 'calculateTotal()', err);
        }
    }

	clearMaterial(material, amount){
		this.materialsForm.get('materials_amount').setValue(this.materialsForm.get('materials_amount').value > amount ? this.materialsForm.get('materials_amount').value - amount : 0 );
        material.get('item_id').value != '' ? this.addMaterialToList(material.get('item_id').value, 'manf_part_id', this.materialsList, this.backupMaterialsList) : '' ;
	}
    calculateTotalMaterialsAmount() {
        try {
            let totalMaterialAmt: number = 0;
            for (let i = 0; i < this.materials.length; i++) {
                totalMaterialAmt = totalMaterialAmt + parseFloat(this.materials.at(i).get('total_amount').value);
            }
            this.materialsForm.get('materials_amount').setValue(totalMaterialAmt);
        } catch (err) {
            this.global.addException('materialAmount', 'calculateTotalMaterialsAmount()', err);
        }
    }
	addMaterialsForm(option, data: any = {}){
		this.materialsForm = this.fb.group({
			materials_amount: new FormControl(option == '1' ? data.materials_amount : 0),
			materials: this.fb.array([])
        });
        console.log(this.materialsList);
		if(option == '1'){
			for (var i = 0; i < data.materials.length; i++) {
                if(data.materials[i].is_approved != '2')
                {
                    this.addMaterials(option, data.materials[i]);
                    this.removeMaterialFormList(data.materials[i].item_id, 'manf_part_id', this.materialsList);
                    this.addValidation(this.materials, i);
                }
                    
			}
		}
        //else{
			//this.addMaterials(option);
		//}

	}
	get materials(): FormArray{ return <FormArray>this.materialsForm.get('materials') as FormArray;};

	addMaterials(option, val: any = {}){
		this.materials.push(this.fb.group({
			short_name: new FormControl(option == '1' ? val.short_name : ''),
            item_id: new FormControl(option == '1' ? val.item_id : '', [ ]),
            //ad_hoc_service: new FormControl(''),
            type: new FormControl(option == '1' ? val.type : ''),
            cost: new FormControl(option == '1' ? val.cost : '', []),
			quantity: new FormControl(option == '1' ? val.quantity : '1', []),
			total_amount: new FormControl(option == '1' ? val.total_amount : 0),
			details: new FormControl(option == '1' ? val.details : ''),
			filteredMaterial: new FormControl( new Observable<string[]>() ),
            uom: new FormControl(option == '1' ? val.uom : '')
		}));

		this.setObservable(this.materials.length - 1);
        this.calculateTotalMaterialsAmount();
	}
	setObservable(index): void {
		if(this.materials)
        	this.materials.at(index).get('filteredMaterial').setValue(this.materials.at(index).get('short_name').valueChanges.pipe(startWith(''),map(value => this.materialFilter(value))));
	}

    removeMaterial(position, material): void {
        try {
            material.get('item_id').value != '' ? this.addMaterialToList(material.get('item_id').value, 'manf_part_id', this.materialsList, this.backupMaterialsList) : '' ;
            this.materials.removeAt(position);
            this.calculateTotalMaterialsAmount();
        } catch (err) {
            this.global.addException('materialRemove', 'removeMaterial()', err);
        }
    }
    reviewMaterial() {
        try {
            this.submitted = true;
            // if(form.valid){
            // 	console.log("Valid materials",form.value.materials);
            // }

            if (this.materialsForm.valid) {
                this.PEService.projectEstimatorData.materialsDetails = this.materialsForm.value;
                for (var i = 0; i < this.PEService.projectEstimatorData.materialsDetails.materials.length; i++) {
                    delete this.PEService.projectEstimatorData.materialsDetails.materials[i].filteredMaterial;
                }
                console.log(this.PEService.projectEstimatorData.materialsDetails.materials);
                this.PEService.updateFormStatus('materialsFm', true);
            } else {
                this.PEService.updateFormStatus('materialsFm', false);
            }
        } catch (err) {
            this.global.addException('materialReview', 'reviewMaterial()', err);
        }
    }
}
