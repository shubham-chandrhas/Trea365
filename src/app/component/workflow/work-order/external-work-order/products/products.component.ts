import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormBuilder, FormArray, Validators, NgForm, AbstractControl, FormGroupDirective } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';

import { Observable, Subscription } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

import { UtilService } from '../../../../../shared/service/util.service';
import { HttpService } from '../../../../../shared/service/http.service';
import { ConstantsService } from '../../../../../shared/service/constants.service';
import { WorkOrderService } from '../../work-order.service';
import { GlobalService } from '../../../../../shared/service/global.service';
import { WorkOrderDialog } from './../../work-order-dialog.component';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss']
})
export class ProductsComponent implements OnInit {

    matProdForm: FormGroup;
    materialsList: any[] = [];
    backupMaterialsList: any[] = [];
    submitted: boolean = false;
    selectedprodMat: number;
    oldWODetails: any = { 'materials' : [] };
    action: string = 'ADD';
    newTotalServiceAmt: number = 0;
    subscription: Subscription;

    constructor(
        public util: UtilService,
        private constant: ConstantsService,
        private fb: FormBuilder,
        private http:HttpService,
        public WOService: WorkOrderService,
        public dialog: MatDialog,
        public route: ActivatedRoute,
        public global:GlobalService
    ) { }

    ngOnInit() {
        this.util.showProcessing('processing-spinner');
        this.util.setPageTitle(this.route);
        this.getMaterialList();
        this.createForm(0);
        this.WOService.quatationTab = 'products';
        this.WOService.isCRwithProduct = false;
        this.subscription = this.util.changeDetection.subscribe(dataObj => {
            if(dataObj && dataObj.source == 'EXTERNAL_WO' && dataObj.action == 'ADD_LOCATION'){
                //this.updateLocation(dataObj.data);
            }else if((dataObj && dataObj.source == 'EXTERNAL_WO' && dataObj.action == 'ADD_PROD_MAT') || (dataObj && dataObj.source == 'INTERNAL_WO' && dataObj.action == 'ADD_PROD_MAT')){
                dataObj.data.validation ? this.addValidation(this.productMaterial) : this.removeValidation(this.productMaterial);
                this.updateValidation(this.productMaterial);
                this.reviewMaterial();
            }
        });
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

    //Get Material/Product List
    getMaterialList() {
        try {
            var self = this;
            this.http.doGet('materials', function (error: boolean, response: any) {
                self.util.hideProcessing('processing-spinner');
                if (error) { console.log(response) } else {
                    console.log("manufPart", response.data);
                    //self.getQuantityAsPerLocation(function(result){
                        //if(result){
                            self.materialsList = [];
                            if (response.data) {
                                self.materialsList = response.data;
                                //console.log(self.materialsList);
                                //self.getQuantityAsPerLocation();
                                console.log(self.materialsList);
                                self.backupMaterialsList = JSON.parse(JSON.stringify(self.materialsList));
                                if (self.WOService.WO_DATA.materialsDetails || self.WOService.WO_DATA.wo_material_products) {
                                    console.log('self.WOService.WO_DATA.wo_material_products', JSON.stringify(self.WOService.WO_DATA.wo_material_products));
                                    let totalAmt = 0;
                                    self.WOService.WO_DATA.materialsDetails.length > 0 ? self.createForm('1', self.WOService.WO_DATA) : self.createForm('0');
                                    if (self.WOService.WO_DATA.wo_material_products) {
                                        self.oldWODetails.wo_material_products = self.WOService.WO_DATA.wo_material_products;
                                        self.WOService.WO_DATA.wo_material_products.forEach(function (obj) { totalAmt += parseFloat(obj.total_amount); });
                                        self.oldWODetails.totalAmt = totalAmt;
                                        self.action = 'EDIT';
                                    }
                                } else if (sessionStorage.getItem('woSetupData')) {
                                    let dataObj = JSON.parse(sessionStorage.getItem('woSetupData'));
                                    dataObj.materialsDetails = dataObj.product_materials.filter(option => option.quantity > 0 );

                                    self.createForm('1', dataObj);
                                } else {
                                    //self.addProdMat('0');
                                }
                                //self.getQuantityAsPerLocation();
                            }
                        //}
                    //});
                }
            });
        } catch (err) {
            this.global.addException('Work order', 'getMaterialList()', err);
        }
    }

    setLocationDetails(id, index){
        this.productMaterial.at(index).get('locationDetails').setValue({});
        this.productMaterial.at(index).get('prodMatLocation').setValue([]);
        this.productMaterial.at(index).get('prodMatLocationBackup').setValue([]);
        for (let i = 0; i < this.materialsList.length; i++) {
            if(id == this.materialsList[i].manf_part_id){
                this.productMaterial.at(index).get('locationDetails').setValue(this.materialsList[i].locationDetails);

                this.productMaterial.at(index).get('prodMatLocation').setValue(this.materialsList[i].prodMatlocation ? this.materialsList[i].prodMatlocation : []);
                this.productMaterial.at(index).get('prodMatLocationBackup').setValue(this.materialsList[i].prodMatlocation ? this.materialsList[i].prodMatlocation : []);
                // this.productMaterial.at(index).get('locationDetails').setValue(this.materialsList[i].locationDetails);
                // prodMatLocation: new FormControl(option == '1' ? data.prodMatlocation : []),
                // prodMatLocationBackup: new FormControl(option == '1' ? data.prodMatlocation : []),
                //this.setPickupLocation(index, this.materialsList[i].locationDetails);
                break;
            }
        }
    }

    private materialFilter(value: string): string[] {
        try {
            return value && value != '' ? (this.materialsList.filter(option => option.short_name.toLowerCase().includes(value ? value.toLowerCase() : ''))) : this.materialsList;
        } catch (err) {
            this.global.addException('Products', 'materialFilter()', err);
        }
    }

    private materialLocationFilter(value: any, index): string[] {
        try {
            return this.productMaterial.at(index).get('prodMatLocation').value.filter(option => option.location_tag.toLowerCase().includes(value ? value.toLowerCase() : ''));
        } catch (err) {
            this.global.addException('Products', 'materialLocationFilter()', err);
        }
    }

    getSelectedMaterial(material, event: any = false, index): void {
        try {
            if (event.isUserInput) {
                console.log("selected material : ",material);
                this.productMaterial.at(index).get('material_id').setValue(material.manf_part_id);
                this.productMaterial.at(index).get('quantity').setValue('1');
                let totalAmt = this.productMaterial.at(index).get('cost').value * this.productMaterial.at(index).get('quantity').value;
                this.productMaterial.at(index).get('total_amount').setValue(totalAmt);
                this.productMaterial.at(index).get('type').setValue(material.class_name.item_class_type == 'Product' ? 2 : 1);
                this.productMaterial.at(index).get('locationDetails').setValue(material.locationDetails);
                this.productMaterial.at(index).get('cost').setValue(material.cost);
                this.calculateTotalMaterialsAmount();
                this.productMaterial.at(index).get('uom').setValue(material.uom_name ? material.uom_name.uom_symbol : '');
                this.productMaterial.at(index).get('prodMatLocationBackup').setValue(material.prodMatlocation);
                this.productMaterial.at(index).get('prodMatLocation').setValue(material.prodMatlocation);
                this.productMaterial.at(index).get('remainingPickupQuantity').setValue(material.quantity);
                for (let i = 0; i < this.getLocations(index).length; i++) {
                     this.getLocations(index).removeAt(i);
                }
                this.addPickupLocation('0', {}, index);
                this.removeMaterialFormList(material.manf_part_id, 'manf_part_id', this.materialsList);
            }
        } catch (err) {
            this.global.addException('Products', 'getSelectedMaterial()', err);
        }
    }

    public validateMaterial(event: any, item: any, index){
        try {
            let material = event.target.value;
            if (material == '') {
                let checkOccurance = this.materialsList.filter(listItem => listItem.manf_part_id == item.get('item_id').value);
                item.get('material_id').value != '' && checkOccurance.length == 0 ? this.materialsList.push(this.backupMaterialsList.filter(listItem => listItem.manf_part_id == item.get('material_id').value)[0]) : '';
                item.get('material_id').setValue('');
                for (let i = 0; i < this.productMaterial.length; i++) {
                    this.productMaterial.at(i).get('material_id').value == '' ? this.setObservable(i) : '';
                }
                return;
            }
            let match = this.materialsList.filter(item => item.short_name.toLowerCase() == material.toLowerCase());
            if (match.length > 0) {
                item.get('material_id').setValue(match[0].manf_part_id);
                item.get('quantity').setValue('1');
                item.get('short_name').setValue(match[0].short_name);
                item.get('cost').setValue(match[0].cost);
                item.get('prodMatLocationBackup').setValue(match[0].prodMatlocation);
                item.get('prodMatLocation').setValue(match[0].prodMatlocation);
                item.get('remainingPickupQuantity').setValue(match[0].quantity);
                for (let i = 0; i < this.getLocations(index).length; i++) {
                     this.getLocations(index).removeAt(i);
                }
                this.removeMaterialFormList(material.manf_part_id, 'manf_part_id', this.materialsList);
            } else {
                if(item.get('material_id').value != ''){
                    let matName = this.backupMaterialsList.filter(listItem => listItem.manf_part_id == item.get('material_id').value)[0].short_name;

                    if(matName.toLowerCase() != material.toLowerCase()){
                        let checkOccurance = this.materialsList.filter(listItem => listItem.manf_part_id == item.get('material_id').value);
                        checkOccurance.length == 0 ? this.materialsList.push(this.backupMaterialsList.filter(listItem => listItem.manf_part_id == item.get('material_id').value)[0]) : '';
                        item.get('material_id').setValue('');
                    }
                }
            }
        } catch (err) {
            this.global.addException('materialValidation', 'validateMaterial()', err);
        }
    }

    setPickupLocation(matIndex, locIndex, locationDetails){
        // this.productMaterial.at(index).get('prodMatLocationBackup').setValue(material.prodMatlocation);
        // this.productMaterial.at(index).get('prodMatLocation').setValue(material.prodMatlocation);
        // this.productMaterial.at(index).get('remainingPickupQuantity').setValue(material.quantity);
        locationDetails.location_type = true;
        // this.productMaterial.at(index).get('supplier_location_id').setValue(0);

        // this.productMaterial.at(index).get('location_id').setValue(locationDetails.location_id);
        // this.productMaterial.at(index).get('location_tag_id').setValue(locationDetails.location_tag_id);

        // this.productMaterial.at(index).get('mainLocation').setValue(locationDetails.location);
        // this.productMaterial.at(index).get('subLocation').setValue(locationDetails.location_tag);

        this.addPickupLocation('1', locationDetails, matIndex);
    }

    getSelectedMaterialLocation(event: any = false, selectedLocationObj, materialControl, matIndx, locationControl, locIndex): void {
        if (event.isUserInput) {
            let locList: any[] = JSON.parse(JSON.stringify(this.productMaterial.at(matIndx).get('prodMatLocation').value));
            for (let i = 0; i < locList.length; i++) {
                if(locList[i].location_tag_id == selectedLocationObj.location_tag_id){
                    locList.splice(i, 1)
                    this.productMaterial.at(matIndx).get('prodMatLocation').setValue(locList);
                    break;
                }
            }
            this.updateLocation(selectedLocationObj, materialControl, matIndx, locationControl, locIndex);
        }
        console.log(location);
    }

    removeMaterialFormList = (id, key, list) => {
        this.materialsList = list.filter(item => item[key] != id);
        for (let i = 0; i < this.productMaterial.length; i++) {
            this.productMaterial.at(i).get('material_id').value == '' ? this.setObservable(i) : '';
        }
    };

    addMaterialToList = (id, key, list, backupList) => {
        if(backupList.filter(item => item[key] == id).length > 0){
            list.push(backupList.filter(item => item[key] == id)[0]);
        }
        for (let i = 0; i < this.productMaterial.length; i++) {
            this.productMaterial.at(i).get('material_id').value == '' ? this.setObservable(i) : '';
        }
    }

    clearMaterial(material, amount, index){
        this.matProdForm.get('material_amount').setValue(this.matProdForm.get('material_amount').value > amount ? this.matProdForm.get('material_amount').value - amount : 0 );
        material.get('material_id').value != '' ? this.addMaterialToList(material.get('material_id').value, 'manf_part_id', this.materialsList, this.backupMaterialsList) : '' ;
        //this.productMaterial.at(index).get('prodMatLocation1').removeAt(0);
        while (this.getLocations(index).length !== 0) {
            this.getLocations(index).removeAt(0)
          }
        //this.getLocations(index).removeAll();
    }
    createForm(option, data: any = {}): void {
        this.matProdForm = this.fb.group({
            peMaterialsCount: new FormControl( option == '1' ? data.peMaterialsCount : 0 ),
            woType: new FormControl( option == '1' ? data.woType : '' ),

            material_amount: new FormControl(0),
            productMaterial: this.fb.array([]),
            peProductMaterial: new FormControl(option == '1' ? data.materialsAdditionalInfo ? data.materialsAdditionalInfo.peProductMaterial : [] : []),
            woRemainingQuantity: new FormControl(option == '1' ? data.materialsAdditionalInfo ? data.materialsAdditionalInfo.woRemainingQuantity : [] : []),
        });

        if(option == '1'){
            if(data.materialsDetails.length){
                for (var i = 0; i < data.materialsDetails.length; i++) {
                    let materialsList: any[] = this.matProdForm.get('peProductMaterial').value;
                    materialsList.push(data.materialsDetails[i].material_id);
                    this.matProdForm.get('peProductMaterial').setValue(materialsList);
                    let woRemainingQuantity: any[] = this.matProdForm.get('woRemainingQuantity').value;
                    woRemainingQuantity.push(data.materialsDetails[i].wo_remaining_quantity);

                    console.log("data.materialsDetails[i] : ",data.materialsDetails[i]);
                    if(parseFloat(data.materialsDetails[i].quantity) > 0){
                        this.addProdMat(option, data.materialsDetails[i]);
                        this.setLocationDetails(data.materialsDetails[i].material_id, i);
                        if (this.WOService.WO_DATA.materialsDetails || this.WOService.WO_DATA.wo_material_products) {
                            for (var j = 0; j < data.materialsDetails[i].prodMatLocation1.length; j++) {
                                this.setPickupLocation(i, j, data.materialsDetails[i].prodMatLocation1[j]);
                            }
                            if(data.materialsDetails[i].prodMatLocation1.length == 0){
                                this.addPickupLocation('0', {}, i);
                            }
                        }else if(sessionStorage.getItem('woSetupData')){
                            this.addPickupLocation('0', {}, i);
                        }
                        this.removeMaterialFormList(data.materialsDetails[i].material_id, 'manf_part_id', this.materialsList);
                    }
                }
            }else{
                //this.addProdMat('0');
            }
		}

        this.matProdForm.get('woType').setValue( this.action == 'ADD' && sessionStorage.getItem('woSetupData') ? 'EXTERNAL' : 'INTERNAL' );
        this.matProdForm.get('peMaterialsCount').setValue( this.action == 'ADD' && sessionStorage.getItem('woSetupData') && data.materialsDetails ? data.materialsDetails.length : 0 );

        if( this.WOService.WO_DATA.materialsAdditionalInfo ){
            this.matProdForm.get('woType').setValue( this.WOService.WO_DATA.servicesAdditionalInfo && this.WOService.WO_DATA.servicesAdditionalInfo.woType ? this.WOService.WO_DATA.servicesAdditionalInfo.woType : '' );
            this.matProdForm.get('peMaterialsCount').setValue( this.WOService.WO_DATA.servicesAdditionalInfo && this.WOService.WO_DATA.materialsAdditionalInfo.peMaterialsCount ? this.WOService.WO_DATA.materialsAdditionalInfo.peMaterialsCount : 0 );
        }
    }
    get productMaterial(): FormArray{ return <FormArray>this.matProdForm.get('productMaterial') as FormArray;};

    addNewProdMat(): void {
        this.addProdMat('0');
        this.productMaterial.at(this.productMaterial.length-1).get('newlyAdded').setValue(sessionStorage.getItem('woSetupData') ? '1' : 0);
    }

    addValidation(controls){
        for (let i = 0; i < controls.length; i++) {
            controls.at(i).get('material_name').setValidators([Validators.required]);
            controls.at(i).get('cost').setValidators([Validators.required, Validators.pattern(this.constant.AMOUNT_PATTERN)]);
            controls.at(i).get('quantity').setValidators([Validators.required, Validators.pattern(this.constant.AMOUNT_PATTERN)]);
            controls.at(i).get('locationType').setValidators([Validators.required]);
        }
    }

    removeValidation(controls){
        for (let i = 0; i < controls.length; i++) {
            controls.at(i).get('material_name').setValidators([]);
            controls.at(i).get('cost').setValidators([Validators.pattern(this.constant.AMOUNT_PATTERN)]);
            controls.at(i).get('quantity').setValidators([Validators.pattern(this.constant.AMOUNT_PATTERN)]);
            controls.at(i).get('locationType').setValidators([]);
        }
    }

    updateValidation(controls){
        for (let i = 0; i < controls.length; i++) {
            controls.at(i).get('material_name').updateValueAndValidity();
            controls.at(i).get('cost').updateValueAndValidity();
            controls.at(i).get('quantity').updateValueAndValidity();
            controls.at(i).get('locationType').updateValueAndValidity();
        }
    }

    addProdMat(option, data: any = {}): void {
        let self = this;
        this.productMaterial.push(this.fb.group({
            type: new FormControl(option == '1' ? data.type : ''),
            material_id: new FormControl(option == '1' ? data.material_id : ''),
            wo_material_id: new FormControl(option == '1' ? data.wo_material_id : ''),
            material_name: new FormControl(option == '1' ? data.material_name : '', [Validators.required]),
            cost: new FormControl(option == '1' ? data.cost : '', [Validators.required, Validators.pattern(this.constant.AMOUNT_PATTERN)]),
			quantity: new FormControl(option == '1' ? data.quantity : '1', [Validators.required, Validators.pattern(this.constant.AMOUNT_PATTERN)]),
            total_amount: new FormControl(option == '1' ? data.total_amount : ''),
            details: new FormControl(option == '1' ? data.details : ''),
            location_type: new FormControl(option == '1' ? data.location_type : 3),
            location_id: new FormControl(option == '1' ? data.location_id : ''),
            location_tag_id: new FormControl(option == '1' ? data.location_tag_id : ''),
            supplier_location_id: new FormControl(option == '1' ? data.supplier_location_id : ''),
            //isDelete: new FormControl(""),
            filteredMaterial: new FormControl( new Observable<string[]>() ),
            //New
            filteredMaterialLocation: new FormControl( new Observable<string[]>() ),
            prodMatLocation: new FormControl(option == '1' ? data.prodMatlocation : []),
            prodMatLocationBackup: new FormControl(option == '1' ? data.prodMatlocation : []),
            prodMatLocation1: this.fb.array([]),
            selectedProdMatLocation: new FormControl(''),
            remainingPickupQuantity: new FormControl(option == '1' ? data.quantity : 0),
            uom: new FormControl(option == '1' ? data.uom : ''),

            isEdit: new FormControl(option == '1' ? data.isEdit ? true : false : false),
            isLocationSet: new FormControl(option == '1' ? data.isLocationSet ? true : false : false),
            locationType: new FormControl(option == '1' ? data.locationType : 3,[Validators.required]),
            supplier_id: new FormControl(option == '1' ? data.supplier_id : ''),
            supplierName: new FormControl(option == '1' ? data.supplierName : ''),
            mainLocation: new FormControl(option == '1' ? data.mainLocation : ''),
            subLocation: new FormControl(option == '1' ? data.subLocation : ''),
            locationDetails: new FormControl(option == '1' ? {} : {}),

            newlyAdded: new FormControl( self.action == 'EDIT' ? data.newlyAdded : 0 ),
            oldCost: new FormControl( self.action == 'EDIT' ? data.oldCost : data.cost ),
            oldQuantity: new FormControl( self.action == 'EDIT' ? data.oldQuantity : data.wo_remaining_quantity ),
            is_deleted: new FormControl(0)
        }));

        this.setObservable(this.productMaterial.length - 1);
        setTimeout(() => { this.calculateTotalMaterialsAmount(); }, 100);
    }

    getLocations(id): FormArray { return <FormArray>this.productMaterial.at(id).get('prodMatLocation1') as FormArray;}

    addPickupLocation(option, data, index){
        this.getLocations(index).push(this.fb.group({
            wo_material_id: new FormControl(option == '1' ? data.wo_material_id : ''),
            filteredMaterialLocation: new FormControl( new Observable<string[]>() ),
            prodMatLocation: new FormControl([]),
            prodMatLocation1: this.fb.array([]),
            selectedProdMatLocation: new FormControl(''),
            pickupQuantity: new FormControl(option == '1' ? data.pickupQuantity : 0),

            isEdit: new FormControl(option == '1' ? data.location_type ? true : false : false),
            isLocationSet: new FormControl(option == '1' ? data.location_type ? true : false : false),
            locationType: new FormControl(option == '1' ? data.locationType : '',[]), //Validators.required
            supplier_id: new FormControl(option == '1' ? data.supplier_id : ''),
            supplierName: new FormControl(option == '1' ? data.supplierName : ''),
            mainLocation: new FormControl(option == '1' ? data.mainLocation : ''),
            subLocation: new FormControl(option == '1' ? data.subLocation : ''),
            locationDetails: new FormControl(option == '1' ? {} : {}),
            location_id: new FormControl(option == '1' ? data.location_id : ''),
            location_tag_id: new FormControl(option == '1' ? data.location_tag_id : '')
        }));

        this.setObservableForMatProdLoction(index, this.getLocations(index).at(this.getLocations(index).length - 1));
    }

    setObservable(index): void {
        this.productMaterial.at(index).get('filteredMaterial').setValue(this.productMaterial.at(index).get('material_name').valueChanges.pipe(startWith(''),map(value => this.materialFilter(value))));
    }
    setObservableForMatProdLoction(matIndex, location){
        console.log(location);
        location.get('filteredMaterialLocation').setValue(location.get('selectedProdMatLocation').valueChanges.pipe(startWith(''),map(value => this.materialLocationFilter(value, matIndex))));
        //this.productMaterial.at(index).get('filteredMaterialLocation').setValue(this.productMaterial.at(index).get('selectedProdMatLocation').valueChanges.pipe(startWith(''),map(value => this.materialLocationFilter(value, index))));
    }
    removeMaterial(position, material): void {
        if(material.get('material_id').value != ''){
            this.addMaterialToList(material.get('material_id').value, 'manf_part_id', this.materialsList, this.backupMaterialsList);
        }
        if(material.get('wo_material_id').value != ''){
            this.WOService.deletedProductMaterial.push(material.get('wo_material_id').value);
        }
		this.productMaterial.removeAt(position);
    }
    selectLocation(index): void {
        this.selectedprodMat = index;
        this.dialog.open(WorkOrderDialog, { data: { 'action': 'selectLocation' ,'locationDetails': this.productMaterial.at(index).get('locationDetails').value}, autoFocus: false});
    }

    updateLocation(selectedLocationObj, materialControl, matIndx, locationControl, locIndex): void {
        try {
            locationControl.get('locationType').setValue(3);
            //locationControl.get('location_type').setValue(3);
            locationControl.get('supplier_id').setValue(0);
            locationControl.get('supplierName').setValue('');
            //locationObj.get('supplier_location_id').setValue(0);

            materialControl.get('location_id').setValue(selectedLocationObj.location_id);
            materialControl.get('location_tag_id').setValue(selectedLocationObj.location_tag_id);
            locationControl.get('location_id').setValue(selectedLocationObj.location_id);
            locationControl.get('location_tag_id').setValue(selectedLocationObj.location_tag_id);
            materialControl.get('uom').setValue(selectedLocationObj.uom);
            locationControl.get('mainLocation').setValue(selectedLocationObj.location);
            locationControl.get('subLocation').setValue(selectedLocationObj.location_tag);
            materialControl.get('mainLocation').setValue(selectedLocationObj.location);
            materialControl.get('subLocation').setValue(selectedLocationObj.location_tag);

            locationControl.get('isLocationSet').setValue(true);
            locationControl.get('isEdit').setValue(true);
            materialControl.get('isLocationSet').setValue(true);
            materialControl.get('isEdit').setValue(true);


            if(materialControl.get('remainingPickupQuantity').value > selectedLocationObj.quantity){
                locationControl.get('pickupQuantity').setValue(selectedLocationObj.quantity);
                materialControl.get('remainingPickupQuantity').setValue(materialControl.get('remainingPickupQuantity').value - selectedLocationObj.quantity);

                materialControl.get('prodMatLocation').value.length > 0 ? this.addPickupLocation('0', {}, matIndx) : '';
            }else{
                locationControl.get('pickupQuantity').setValue(materialControl.get('remainingPickupQuantity').value);
                materialControl.get('remainingPickupQuantity').setValue(0);
            }

            this.productMaterial.at(matIndx).get('total_amount').setValue(parseFloat(this.productMaterial.at(matIndx).get('cost').value) * parseFloat(this.productMaterial.at(matIndx).get('quantity').value));

        } catch (err) {
            this.global.addException('Work order', 'updateLocation()', err);
        }
    }

    editLocation(index): void {
        try{
            this.productMaterial.at(index).get('isEdit').setValue(false);
            this.productMaterial.at(index).get('isLocationSet').setValue(false);
            while (this.getLocations(index).length !== 0) {
                this.getLocations(index).removeAt(0);
            }
            this.addPickupLocation('0', {}, index);
            this.productMaterial.at(index).get('prodMatLocation').setValue(this.productMaterial.at(index).get('prodMatLocationBackup').value);
            this.productMaterial.at(index).get('remainingPickupQuantity').setValue(this.productMaterial.at(index).get('quantity').value);
        }catch (err){
            this.global.addException('Products', 'editLocation()', err);
        }
    }

    reviewMaterial(){
        this.submitted = true;
        console.log(this.matProdForm.value);
        if(this.productMaterial.valid){
            let prodMatList: any = [];
            let createCR: boolean = false;
            for (var i = 0; i < this.productMaterial.value.length; i++) {
                let locationList: any [] = [], reqLocationList: any[] = [];

                for (var j = 0; j < this.productMaterial.value[i].prodMatLocation1.length; j++) {
                    if(this.productMaterial.value[i].prodMatLocation1[j].pickupQuantity != '' && this.productMaterial.value[i].prodMatLocation1[j].pickupQuantity != 0){
                        let locObj: any = {
                            //'prodMatLocation': this.productMaterial.value[i].prodMatLocation1[j].prodMatLocation,
                            //'prodMatLocation1': this.productMaterial.value[i].prodMatLocation1[j].prodMatLocation1,
                            'selectedProdMatLocation': this.productMaterial.value[i].prodMatLocation1[j].selectedProdMatLocation,
                            'pickupQuantity': this.productMaterial.value[i].prodMatLocation1[j].pickupQuantity,
                            'isEdit': this.productMaterial.value[i].prodMatLocation1[j].isEdit,
                            'isLocationSet': this.productMaterial.value[i].prodMatLocation1[j].isLocationSet,
                            'locationType': this.productMaterial.value[i].prodMatLocation1[j].locationType,
                            'supplier_id': this.productMaterial.value[i].prodMatLocation1[j].supplier_id,
                            'supplierName': this.productMaterial.value[i].prodMatLocation1[j].supplierName,
                            'mainLocation': this.productMaterial.value[i].prodMatLocation1[j].mainLocation,
                            'subLocation': this.productMaterial.value[i].prodMatLocation1[j].subLocation,
                            'locationDetails': this.productMaterial.value[i].prodMatLocation1[j].locationDetails,
                            'location_tag_id': this.productMaterial.value[i].prodMatLocation1[j].location_tag_id,
                            'wo_material_id': this.productMaterial.value[i].prodMatLocation1[j].wo_material_id,
                            'location_id': this.productMaterial.value[i].prodMatLocation1[j].location_id,
                            'is_deleted': 0
                        }
                        locationList.push(locObj);

                        reqLocationList.push({
                            "location_type": 3,
                            "location_id": this.productMaterial.value[i].prodMatLocation1[j].location_id,
                            "location_tag_id": this.productMaterial.value[i].prodMatLocation1[j].location_tag_id,
                            "quantity": this.productMaterial.value[i].prodMatLocation1[j].pickupQuantity,
                            "wo_material_id": this.productMaterial.value[i].prodMatLocation1[j].wo_material_id
                        });
                    }
                }

                prodMatList.push({
                    "wo_material_id": this.productMaterial.value[i].wo_material_id,
                    "type": this.productMaterial.value[i].type,
                    "material_id": this.productMaterial.value[i].material_id,
                    "manf_part_id": this.productMaterial.value[i].material_id,
                    "location_type": 3,
                    "location_id": this.productMaterial.value[i].location_id,
                    "material_name": this.productMaterial.value[i].material_name,
                    "location_tag_id": this.productMaterial.value[i].location_tag_id,
                    "supplier_location_id": this.productMaterial.value[i].supplier_location_id,
                    "cost": this.productMaterial.value[i].cost,
                    "quantity": this.productMaterial.value[i].quantity,
                    "uom": this.productMaterial.value[i].uom,
                    "total_amount": this.productMaterial.value[i].total_amount,
                    "locationType": 3,
                    "supplier_id": this.productMaterial.value[i].supplier_id,
                    "supplierName": this.productMaterial.value[i].supplierName,
                    "mainLocation": this.productMaterial.value[i].mainLocation,
                    "subLocation": this.productMaterial.value[i].subLocation,
                    "details": "",
                    "isEdit": this.productMaterial.value[i].isEdit,
                    "isLocationSet": this.productMaterial.value[i].isLocationSet,
                    "prodMatLocation1": locationList,
                    "locations": reqLocationList,
                    'is_deleted': 0
                });

                // if(parseInt(this.productMaterial.value[i].quantity) > parseInt(this.productMaterial.value[i].oldQuantity) || parseFloat(this.productMaterial.value[i].cost) > parseFloat(this.productMaterial.value[i].oldCost)){
                //     createCR = true;
                // }

                if(this.matProdForm.value.woType == 'EXTERNAL'){
                    if (parseInt(this.productMaterial.value[i].quantity) > parseInt(this.productMaterial.value[i].oldQuantity)) {
                        createCR = true;
                    }
                    if(this.matProdForm.value.peProductMaterial.indexOf(this.productMaterial.value[i].material_id) > 0 &&  parseInt(this.productMaterial.value[i].quantity) > parseInt(this.matProdForm.value.woRemainingQuantity[this.matProdForm.value.peProductMaterial.indexOf(this.productMaterial.value[i].material_id)])){
                        createCR = true;
                    }
                    if(this.matProdForm.value.peProductMaterial.indexOf(this.productMaterial.value[i].material_id) < 0){
                        createCR = true;
                    }
                }
            }

            if(this.matProdForm.value.woType == 'EXTERNAL'){
                // if(this.productMaterial.length > this.matProdForm.value.peMaterialsCount){
                //     createCR = true;
                // }
                if(createCR && !this.WOService.isCRwithProduct){
                    this.WOService.isCRwithProduct = true;
                    this.dialog.open(WorkOrderDialog, { data: { 'action': 'createCRConfirmation' , 'formDataObj' : prodMatList, 'msg': 'If product/material quantity is more than quoted quantity or If you added new product/material this will create change request automatically to update Project Estimator.', 'navigateTo': '/workflow/wo/csa/work-order-review', 'materialInfo': this.matProdForm.value }, autoFocus: false });
                    //return;
                }
            }

            this.WOService.WO_DATA.materialsAdditionalInfo = {
                'woType': this.matProdForm.value.woType,
                'peMaterialsCount': this.matProdForm.value.peMaterialsCount,
                'peProductMaterial': this.matProdForm.value.peProductMaterial,
                'woRemainingQuantity': this.matProdForm.value.woRemainingQuantity
            }

            this.WOService.WO_DATA.materialsDetails = prodMatList;
            console.log(JSON.stringify(this.WOService.WO_DATA.materialsDetails));
            this.WOService.updateFormStatus('materialsFm', true);
        }else{
            this.WOService.updateFormStatus('materialsFm', false);
        }
    }


    calculateTotal(event: any, item: any, index) {
        try {
            let material = event.target.value;
            if (material == '') {
                item.get('total_amount').setValue(0);
                this.calculateTotalMaterialsAmount();
                item.get('prodMatLocation1').setValue([]);
                return;
            } else {
                let totalAmt = item.get('cost').value * item.get('quantity').value;
                item.get('total_amount').setValue(totalAmt);
                this.calculateTotalMaterialsAmount();
                item.get('remainingPickupQuantity').setValue(item.get('quantity').value);
            }
        } catch (err) {
            this.global.addException('Work order - products', 'calculateTotal()', err);
        }
    }

    calculateTotalMaterialsAmount() {
        try {
            let totalMaterialAmt: any = this.oldWODetails ? this.oldWODetails.totalAmt ? this.oldWODetails.totalAmt : 0 : 0;
            for (let i = 0; i < this.productMaterial.length; i++) {
                totalMaterialAmt = parseFloat(totalMaterialAmt) + parseFloat(this.productMaterial.at(i).get('total_amount').value);
            }
            this.matProdForm.get('material_amount').setValue(totalMaterialAmt);
            this.newTotalServiceAmt = totalMaterialAmt;
        } catch (err) {
            this.global.addException('Work order - calculate total', 'calculateTotalMaterialsAmount()', err);
        }
    }

    getQuantityAsPerLocation() {
        try {
            for (let i = 0; i < this.materialsList.length; i++) {
                let prodTaglist: any[] = this.materialsList[i].class_name.item_class_type == 'Product' ? this.materialsList[i].inv_products : this.materialsList[i].inv_materials.filter(item => item.location = item.material_location);
                this.materialsList[i].prodMatlocation = [];
                let uom = this.materialsList[i].uom_name.uom_symbol;
                if(this.materialsList[i].locationDetails){
                    for (let j = 0; j < this.materialsList[i].locationDetails.length; j++) {
                        for (let k = 0; k < this.materialsList[i].locationDetails[j].locationTag.length; k++) {
                            this.materialsList[i].locationDetails[j].locationTag[k].quantity = 0;
                            //this.materialsList[i].locationDetails[j].locationTag[k].uom = this.materialsList[i].uom_name.uom_name;

                            for (let m = 0; m < prodTaglist.length; m++) {
                                for (let n = 0; n < prodTaglist[m].location.length; n++) {
                                    if (prodTaglist[m].location[n].location_tag_id == this.materialsList[i].locationDetails[j].locationTag[k].location_tag_id) {
                                        this.materialsList[i].locationDetails[j].locationTag[k].uom = prodTaglist[m].location[n].uom_name;
                                        this.materialsList[i].locationDetails[j].locationTag[k].quantity += parseFloat(prodTaglist[m].location[n].updated_quantity);
                                    }
                                }
                            }
                            this.materialsList[i].locationDetails[j].locationTag[k].location_tag = this.materialsList[i].locationDetails[j].locationTag[k].location_tag + " (" + this.materialsList[i].locationDetails[j].locationTag[k].quantity + " " + (this.materialsList[i].locationDetails[j].locationTag[k].uom ? this.materialsList[i].locationDetails[j].locationTag[k].uom : uom) +")";
                            this.materialsList[i].locationDetails[j].locationTag[k].location = this.materialsList[i].locationDetails[j].location_name;
                            this.materialsList[i].prodMatlocation.push(this.materialsList[i].locationDetails[j].locationTag[k]);
                        }
                    }
                }

            }
            //return callback(true);
            //setTimeout(function(){ return callback(true); }, 1000);
            console.log('getQuantityAsPerLocation()', this.materialsList);
        } catch (err) {
            this.global.addException('Work order - get quantity', 'getQuantityAsPerLocation()', err, { 'materialList': this.materialsList });
        }
    }
}
