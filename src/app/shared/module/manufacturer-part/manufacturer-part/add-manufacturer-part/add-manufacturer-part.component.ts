// TO DO :- Bug while edit mfg fail to check class type


import { Component, Inject, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormControl, Validators, FormGroup, FormBuilder } from '@angular/forms';
import { IMultiSelectOption, IMultiSelectSettings, IMultiSelectTexts } from 'angular-2-dropdown-multiselect';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ManufacturerPartDialog } from './../manufacturer-part.component';
import { Observable, Subscription } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

import { AdminService } from '../../../../../component/admin/admin.service';
import { UtilService } from '../../../../service/util.service';
import { HttpService } from '../../../../service/http.service';
import { ConstantsService } from '../../../../service/constants.service';
import { ManufacturerDialog } from '../../../manufacturer/manufacturer/manufacturer.component';
import { GlobalService } from '../../../../../shared/service/global.service';
import { ItemClassesDialog } from '../../../../../component/admin/item-classes/item-classes.component';

@Component({
    selector: 'app-add-manufacturer-part',
    templateUrl: './add-manufacturer-part.component.html',
    styleUrls: ['./add-manufacturer-part.component.css']
})

export class AddManufacturerPartComponent implements OnInit {
    pageData: any = { 'manufacturerList': [], 'errMsg': '', 'isError': false, 'submitted': false, 'attributeList': [], 'isSalesMarkup': false, 'upcAvailability':'0', 'classType': 'Product', 'itemclass': [], 'UPC_VALIDATORS': [ Validators.required, Validators.max(999999999999999999999999999999) ], 'module': 'Item Definition', 'allManfParts': []};
    listKeys: string[] = ['uomList', 'itemclass'];
    addMFGForm: FormGroup;
    public manfPartsList: any;
    public replacesList: IMultiSelectOption[]  = [];
    public equivalentList: IMultiSelectOption[]  = [];
    public selectText: IMultiSelectTexts = {
        defaultTitle: ''
    };
    public currentPath: string;
    filteredManufacturer: Observable<string[]>;
    filteredClass: Observable<string[]>;
    mulSelSettings: IMultiSelectSettings = { displayAllSelectedText: true };
    type : string = 'is_product_type';
    subscription: Subscription;

    constructor(
        public util: UtilService,
        private constant: ConstantsService,
        private http: HttpService,
        private router: Router,
        private fb: FormBuilder,
        private route: ActivatedRoute,
        public dialog: MatDialog,
        private admin: AdminService,
        private global: GlobalService
        ) { }

    ngOnInit() {
        this.currentPath = this.router.url.split('/')[3];
        this.currentPath == 'add-manufacturer-part' ? this.router.url.split('/')[2]=='csa-onboarding' ? this.util.menuChange({'menu':'guide','subMenu':''}) : this.util.menuChange({'menu':2,'subMenu':14}) : '';
        this.util.setWindowHeight();
        this.util.showProcessing('processing-spinner');
        this.getManufacturerList();
        this.getDDLists();
        this.util.setPageTitle(this.route);
        //this.getItemClass();
        if(sessionStorage.getItem('newPart')){
            JSON.parse(atob(sessionStorage.getItem('newPart'))).classType == 'Material' ? '' : this.getManfPartsList(JSON.parse(atob(sessionStorage.getItem('newPart'))).manufacturerId);
            this.createMFGForm(JSON.parse(atob(sessionStorage.getItem('newPart'))));
            this.getSelectedEqAndReplaces();
            this.pageData.attributeList = JSON.parse(atob(sessionStorage.getItem('newPart'))).attribute;
        }else{
            this.createMFGForm('0');
        }

        this.onChanges();
        this.subscription = this.util.changeDetection.subscribe(dataObj => {
            if(dataObj){
                if(dataObj.source == 'MANUFACTURER'){
                    console.log(dataObj.source);
                    this.getManufacturerList('REFRESH');
                    this.util.changeEvent(null);
                }else if (dataObj.source == 'ON_THE_FLY_ITEM_CATEGORY') {
                    this.getCategoryList();
                  }
            }
        });

    }
    ngOnDestroy() {
	    this.subscription.unsubscribe();
	}

    onChanges(): void {
        try {
            this.addMFGForm.get('manufacturerId').valueChanges.subscribe(selmfg => {
                if (selmfg != '') {
                    this.replaces.setValue([]);
                    this.equivalent.setValue([]);
                    //this.getManfPartsList(selmfg);
                }
            });
        }
        catch (err) {
            this.global.addException('Manufacturer', 'onChanges()', err);
        }
    }

    // ================   MANUFACTURER  ===================== //
    private getManufacturerList(origin: string = 'INIT'): void {
        let self = this;
        try{
            this.admin.getManufacturerList(function(error: boolean, response: any){
                if(error){ console.log(response) }else{
                    self.util.hideProcessing('processing-spinner');
                    // self.pageData.manufacturerList = response.data;
                    self.pageData.manufacturerList = response.data.filter(item=>item.is_material_default != '1');
                    self.pageData.manufacturerId = response.data.filter(item=>item.is_material_default == '1')[0].manf_id;
                    self.filteredManufacturer = self.manufacturer.valueChanges.pipe(startWith(''),map(value => self.manufacturerFilter(value)));
                    //Need to remove "self.getMfg()" which is no use
                    origin == 'REFRESH' ? (self.getMfg(self.pageData.manufacturerList[self.pageData.manufacturerList.length - 1],{}),self.manufacturer.setValue(self.pageData.manufacturerList[self.pageData.manufacturerList.length - 1].manf_name),self.manufacturerId.setValue(self.pageData.manufacturerList[self.pageData.manufacturerList.length - 1].manf_id)) : '';
                }
            });
        }catch(err) {
            console.log("-:: Exception Occurred ::-");
            console.log("Module:: Item Definition || Function:: getManufacturerList()");
            console.log(err);
        }
    }

    getMfg(mfg, event: any = false): void {
        console.log(mfg);
        //,this.getManfPartsList(mfg.manf_id)
        event ? event.isUserInput ? (this.manufacturerId.setValue(mfg.manf_id)) : '' : '';
    }
    private manufacturerFilter(value: string): string[] {
        try {
            return this.pageData.manufacturerList.filter(option => option.manf_name.toLowerCase().includes(value ? value.toLowerCase() : ''));
        } catch (err) {
            this.global.addException('Manufacturer', 'manufacturerFilter()', err);
        }
    }
    showAddManufacturerPopup(): void { this.util.changeEvent(null);this.dialog.open(ManufacturerDialog, { data: { 'action': 'addManufacturer' } }); }
    showAddItemCategoryPopup(): void {
      this.util.changeEvent(null);
      this.dialog.open(ItemClassesDialog, {
        data: { action: 'addNewItemClass' }
      });
    }
    public validateManf(event:any){
        let manf = event.target.value;
        let match = this.pageData.manufacturerList.filter(item=>item.manf_name.toLowerCase() == manf.toLowerCase());
        console.log(match);
        if(manf == ''){
            this.manufacturerId.setValue('');
            this.replacesList = [];
            this.equivalentList = [];
            return;
        }
        if(match.length > 0){
            //this.getManfPartsList(match[0].manf_id)
            this.manufacturerId.setValue(match[0].manf_id);
            this.manufacturer.setValue(match[0].manf_name);
        }else{
            this.replacesList = [];
            this.equivalentList = [];
        }
    }

    // ===============   END MANUFACTURER  =================== //
    public clearAutoComplete(name,id){
        // let str = this.updateLocFrm.get(name).value;
        // str = str.split('');
        // console.log(str);
        // for (let i = str.length - 1; i >= 0; i--) {
        //     str.splice(i, 1);
        //     let newStr = str.join('');
        //     console.log(newStr);
        //     this.updateLocFrm.get(name).setValue(newStr);
        // }
        this.addMFGForm.get(id).setValue('');
        this.addMFGForm.get(name).setValue('');
    }

    getManfPartsList(id) {
        try {
            let self = this;
            // if(!self.manufacturerId.valid && !self.manufacturerId.dirty){
            //     return;
            // }
            this.http.doGet('manufPartById/' + id, function (error: boolean, response: any) {
                if (error) { self.manfPartsList = []; } else {
                    self.manfPartsList = response.data;
                }
            });

        } catch (err) {
            this.global.addException('Manufacturer', 'getManfPartsList()', err);
        }
    }


    getSelectedEqAndReplaces(){
        let self = this;
        // if (!self.class.valid && !self.class.dirty) {
        //     return;
        // }
        this.http.doGet('manufPart', function (error: boolean, response: any) {
            if (error) { console.log(response) } else {
                self.pageData.allManfParts = response.data;
                let menus = [];
                for (let i = 0; i < response.data.length; i++) {
                    if(response.data[i].class_id == self.class.value){
                        let obj: any = {
                            'id': response.data[i].manf_part_id,
                            'name': response.data[i].short_name
                        };
                        menus.push(obj);
                    }
                }
                self.replacesList = menus;
                self.equivalentList = menus;
            }
        });
    }
    getCategoryList(): void {
        let self = this;
        this.http.doGet('itemclass', function(error: boolean, response: any) {
          if (error) {
            console.log(response);
          } else {
            self.pageData.itemclass = response.data;
            self.filteredClass = self.class_name.valueChanges.pipe(
              startWith(''),
              map(value => self.classFilter(value))
            );
            self.class.setValue(response.data[response.data.length - 1].item_class_id);
            self.class_name.setValue(response.data[response.data.length - 1].item_class_name);
            self.getSelectedClass(response.data[response.data.length - 1], {'isUserInput': true});
          }
        });
      }
    getDDLists() {
        let self = this;
        try {
            for (let i = 0; i < this.listKeys.length; i++) {
                this.http.doGet(i == 0 ? 'manufPart/' + self.listKeys[i] : self.listKeys[i], function (error: boolean, response: any) {
                    if (error) { console.log(response) } else {
                        self.pageData[self.listKeys[i]] = response.data; console.log(self.pageData);
                        if(self.listKeys[i] == 'itemclass' && sessionStorage.getItem('class')){
                            console.log(JSON.parse(sessionStorage.getItem('class')));
                            let classList = [];
                            let list = sessionStorage.getItem('class') ? JSON.parse(sessionStorage.getItem('class')) : [];

                            list.map(type => {
                                //alert(self.pageData.itemclass.filter(item => item.item_class_type == type).length);
                                classList = classList.concat(self.pageData.itemclass.filter(item => item.item_class_type == type));
                            });
                            self.pageData[self.listKeys[i]] = JSON.parse(JSON.stringify(classList));
                        }
                        self.listKeys[i] == 'itemclass' ? (self.filteredClass = self.class_name.valueChanges.pipe(startWith(''), map(value => self.classFilter(value)))) : '';

                        //self.listKeys[i] == 'itemclass' ? (sessionStorage.getItem('class') ? self.pageData.itemclass = self.pageData.itemclass.filter(item => item.item_class_type == sessionStorage.getItem('class')) : '', self.filteredClass = self.class_name.valueChanges.pipe(startWith(''), map(value => self.classFilter(value)))) : '';
                    }
                });
            }
        }
        catch (err) {
            this.global.addException('Manufacturer', 'getDDLists()', err);
        }
    }

    getSelectedClass(obj, event: any): void {
        console.log(obj);
        try {
            if (event.isUserInput) {
                this.class.setValue(obj.item_class_id);
                this.getClass(obj.item_class_type);
                //this.getManfPartsList(this.manufacturerId.value);
                this.getSelectedEqAndReplaces();
                //this.filteredManufacturer.filter(item => item.item_class_name == obj.item_class_type);
                this.type = 'is_'+obj.item_class_type.toLowerCase()+'_type';
                if(this.manufacturerId.value != '') {
                    let manufList = this.pageData.manufacturerList.filter(item => item[this.type] == '1');
                    if(manufList.filter(item => item.manf_id == this.manufacturerId.value).length == 0){
                        this.manufacturerId.setValue('');
                        this.manufacturer.setValue('');
                    }
                }
            }
        }
        catch (err) {
            this.global.addException('Manufacturer', 'getSelectedClass()', err);
        }
    }
    private classFilter(value: string): string[] {
        try {
            return this.pageData.itemclass.filter(option => option.item_class_name.toLowerCase().includes(value ? value.toLowerCase() : ''));
        }
        catch (err) {
            this.global.addException('Manufacturer', 'classFilter()', err);
        }
    }
    public validateClass(event: any) {
        try {
            let classVal = event.target.value;
            let match = this.pageData.itemclass.filter(item => item.item_class_name.toLowerCase() == classVal.toLowerCase());
            console.log(match);
            if (classVal == '') {
                this.class.setValue('');
                return;
            }
            if (match.length > 0) {
                this.class.setValue(match[0].item_class_id);
                this.class_name.setValue(match[0].item_class_name);
                this.getClass(match[0].item_class_type);
                //this.getManfPartsList(this.manufacturerId.value);
                this.getSelectedEqAndReplaces();
                this.type = 'is_'+match[0].item_class_type.toLowerCase()+'_type';
                if(this.manufacturerId.value != '') {
                    let manufList = this.pageData.manufacturerList.filter(item => item[this.type] == '1');
                    if(manufList.filter(item => item.manf_id == this.manufacturerId.value).length == 0){
                        this.manufacturerId.setValue('');
                        this.manufacturer.setValue('');
                    }
                }
            }
        } catch (err) {
            this.global.addException('Manufacturer', 'validateClass()', err);
        }
    }

    clearClass(){
        this.replacesList = [];
        this.equivalentList = [];
    }

    getClass(itemClassType) {
        try {
            this.pageData.submitted = false;
            this.pageData.classType = itemClassType;
            if (this.pageData.classType == 'Asset' || this.pageData.classType == 'Product') {
                this.util.addBulkValidators(this.addMFGForm, ['manufacturer', 'manufacturerId', 'UOM'], [Validators.required]);
                // this.util.addBulkValidators(this.addMFGForm, ['manufacturerPartNo'], [Validators.required, Validators.pattern(this.constant.NO_SPACE_PATTERN)]);
                this.util.addBulkValidators(this.addMFGForm, ['manufacturerPartNo'], [ Validators.pattern(this.constant.NO_SPACE_PATTERN)]);
                // this.util.addBulkValidators(this.addMFGForm, ['manfUPC'], this.pageData.UPC_VALIDATORS);
                
                if(this.pageData.classType == 'Asset'){
                    this.util.addBulkValidators(this.addMFGForm, ['UOM'], []);
                    this.util.addBulkValidators(this.addMFGForm, ['minimumStock'], []);
                }else{
                    this.util.addBulkValidators(this.addMFGForm, ['minimumStock'], [Validators.required, Validators.min(0), Validators.max(99999999)]);
                }
            } else if (this.pageData.classType == 'Material') {
                this.util.addBulkValidators(this.addMFGForm, ['manufacturer', 'manufacturerId', 'manufacturerPartNo', 'UOM', 'manfUPC'], []);
                this.util.addBulkValidators(this.addMFGForm, ['UOM'], [Validators.required]);
                this.util.addBulkValidators(this.addMFGForm, ['minimumStock'], [Validators.required, Validators.min(0), Validators.max(99999999)]);
            }
        }
        catch (err) {
            this.global.addException('Manufacturer', 'getClass()', err);
        }
    }



    public createMFGForm(val){
        console.log(val);
        console.log(val.manufacturer);
        console.log(val.manufacturerId);
        this.pageData.classType = val == '0' ? 'Product' : val.classType;
        this.addMFGForm = this.fb.group({
            manufacturer:new FormControl(val == '0' ? '' : val.manufacturer, [ Validators.required ]),
            manufacturerId:new FormControl(val == '0' ? '' : val.manufacturerId, [ Validators.required ]),
            manufacturerPartNo:new FormControl(val == '0' ? '' : val.manufacturerPartNo, [
                Validators.pattern(this.constant.NO_SPACE_PATTERN),Validators.maxLength(30)
            ]),
            // manufacturerPartNo:new FormControl(val == '0' ? '' : val.manufacturerPartNo, [
            //     Validators.required,Validators.pattern(this.constant.NO_SPACE_PATTERN),Validators.maxLength(30)
            // ]),
            manfUPC:new FormControl(val == '0' ? '' : val.manfUPC,[
                Validators.pattern(this.constant.CODE39_WITHOUT_SPACE_PATTERN)]),
            fullName:new FormControl(val == '0' ? '' : val.fullName, []),
            shortName:new FormControl(val == '0' ? '' : val.shortName, [
                Validators.required,
                Validators.maxLength(50)
            ]),
            equivalent:new FormControl(val == '0' ? [] : val.equivalent),
            salesMarkup:new FormControl(val == '0' ? '' : val.salesMarkup, [
                Validators.min(0),
                Validators.max(100),
                Validators.pattern(this.constant.AMOUNT_PATTERN)
            ]),
            minimumStock:new FormControl(val == '0' ? '' : val.minimumStock, [
                Validators.min(0),
                Validators.max(99999999)
            ]),
            UOM:new FormControl(val == '0' ? '' : val.UOM, [ Validators.required ]),
            class:new FormControl(val == '0' ? '' : val.class, [ Validators.required ]),
            class_name:new FormControl(val == '0' ? '' : val.class_name, [ Validators.required ]),
            replaces: new FormControl(val == '0' ? [] : val.replaces),
        });
        val == '0' ? '' : this.getClass(val.classType) ;
    }

    get manufacturer() { return this.addMFGForm.get('manufacturer'); }
    get manufacturerId() { return this.addMFGForm.get('manufacturerId'); }
    get manufacturerPartNo() { return this.addMFGForm.get('manufacturerPartNo'); }
    get manfUPC() { return this.addMFGForm.get('manfUPC'); }
    get fullName() { return this.addMFGForm.get('fullName'); }
    get shortName() { return this.addMFGForm.get('shortName'); }
    get equivalent() { return this.addMFGForm.get('equivalent'); }
    get salesMarkup() { return this.addMFGForm.get('salesMarkup'); }
    get minimumStock() { return this.addMFGForm.get('minimumStock'); }
    get UOM() { return this.addMFGForm.get('UOM'); }
    get class() { return this.addMFGForm.get('class'); }
    get class_name() { return this.addMFGForm.get('class_name'); }
    get replaces() { return this.addMFGForm.get('replaces'); }

    addManufacturer(form: FormGroup){
        var self = this;
        try{
            this.pageData.errMsg = '';
            this.pageData.isError = false;
            this.pageData.submitted = true;
            //this.getClass();
            console.log(form)
            if(form.valid  &&  this.pageData.upcAvailability == '0'){
                form.value.selectedVal = {
                    'manufacturer' : this.pageData.classType == 'Material' ? '' : this.pageData.manufacturerList.filter(item => item.manf_id == form.value.manufacturerId)[0].manf_name ,
                    'equivalentName': this.pageData.classType == 'Material' ? '' : this.getSelectedManfParts(form.value.equivalent),
                    'replacesName' : this.pageData.classType == 'Material' ? '' : this.getSelectedManfParts(form.value.replaces),
                    'UOMName' : form.value.UOM && form.value.UOM != '' ? this.pageData.uomList.filter(item => item.uom_id == form.value.UOM)[0].uom_name : '',
                    //'className' : this.pageData.itemclass.filter(item => item.item_class_id == form.value.class)[0].item_class_name,
                    'className' : form.value.class_name
                }
                this.pageData.classType == 'Material' ? form.value.manufacturerId = this.pageData.manufacturerId : '';
                //self.pageData.manufacturerList = response.data.filter(item=>item.is_material_default != '1');
                form.value.attribute = this.pageData.attributeList;
                let manfPartDetails:any = {};
                manfPartDetails = form.value;
                manfPartDetails.classType = self.pageData.classType;
                sessionStorage.setItem('newPart', btoa(JSON.stringify(manfPartDetails)));

                this.currentPath == 'add-manufacturer-part' ? this.router.url.split('/')[2] == 'csa-onboarding' ? this.router.navigate(['/admin/csa-onboarding/mfg-attributes']) : this.router.navigate(['/admin/csa/mfg-attributes']) : this.onTheFlyEvent({'step': 'S2'});
            }
        }catch(err) {
            console.log("Exception Occurred ::- Module::- "+this.pageData.module+" || Function::- addManufacturer()");
            console.log(err);
        }
    }

    getSelectedManfParts(partIds: any) {
        try {
            let partNames: any[] = [];
            for (let i = 0; i < this.pageData.allManfParts.length; i++) {
                for (let j = 0; j < partIds.length; j++) {
                    if (this.pageData.allManfParts[i].manf_part_id == partIds[j]) {
                        partNames.push(this.pageData.allManfParts[i].short_name);
                        break;
                    }
                }
            }
            return partNames;
        }
        catch (err) {
            this.global.addException('Manufacturer', 'getSelectedManfParts()', err);
        }
    }

    cancelAddManufacturerPart() {
        try {
            this.currentPath == 'add-manufacturer-part' ? this.dialog.open(ManufacturerPartDialog, { data: { 'action': 'cancelAddManufacturerPart' }, autoFocus: false }) : this.onTheFlyEvent({ 'step': 'S0' });
        } catch (err) {
            this.global.addException('Manufacturer', 'cancelAddManufacturerPart()', err);
        }
    }

    onTheFlyEvent(data): void {
        this.util.changeEvent({
            'source': 'ON_THE_FLY_MANUFACTURER_PART',
            'action': 'ADD',
            'data': data
        });
    }

    validateUPC(event: any) {
        let self = this;
        self.pageData.isError = false;
        if (!self.manfUPC.valid && !self.manfUPC.dirty) {
            return;
        }
        try {
            if(this.manfUPC.value != '')
            {
                this.http.doGet('isUniqueManufPartUpc/'+this.manfUPC.value,  function (error: boolean, response: any) {
                    //console.log(response);
                    if (error) {
                        console.log(response.message);
                    } else {
                        self.pageData.isError = true;
                        self.pageData.upcAvailability = response.data.is_available;
                        console.log(self.pageData.upcAvailability);
                    }
                });
            }
        }
        catch (err) {
            this.global.addException('validate UPC', 'validateUPC()', err);
        }
    }
}
