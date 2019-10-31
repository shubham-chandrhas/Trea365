/*
    TO DO : Commonout code form getAssetList() and setAssetList()
*/


import { Component, OnInit, Input } from '@angular/core';
import { FormControl, FormGroup, FormBuilder, FormArray, Validators, NgForm, AbstractControl, FormGroupDirective } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';

import { Observable, Subscription } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

import { UtilService } from '../../../../../shared/service/util.service';
import { HttpService } from '../../../../../shared/service/http.service';
import { ConstantsService } from '../../../../../shared/service/constants.service';
import { GlobalService } from '../../../../../shared/service/global.service';
import { WorkOrderService } from '../../work-order.service';

import { WorkOrderDialog } from './../../work-order-dialog.component';

@Component({
  selector: 'app-assets',
  templateUrl: './assets.component.html',
  styleUrls: ['./assets.component.scss']
})
export class WOAssetsComponent implements OnInit {
    minDate = new Date();
    maxDate: any;
    public assetForm: FormGroup;
    public assetsList: any[] = [];
    public selectedAssetList: any[] = [];
    public submitted: boolean = false;
    //public filteredEmployee: Observable<any[]>;
    public pageData:any = {};
    subscription: Subscription;

    @Input() asset: any;
  dStart: Date;
  dEnd: Date;

    constructor(
        public router: Router,
        public util: UtilService,
        public global: GlobalService,
        private constant: ConstantsService,
        private fb: FormBuilder,
        private http:HttpService,
        public woService: WorkOrderService,
        public route: ActivatedRoute
    ) { }

    ngOnInit() {
        let self = this;
        this.pageData.currentUrl = this.router.url.split('/')[5];
        this.woService.quatationTab = 'assets';
        this.util.setPageTitle(this.route);
        //this.getAssetList();
        //this.woService.isRecurringWO ? this.setAssetList() : this.getAssetList();
        if(this.woService.WO_DATA.assetsDetails){
            if(this.woService.WO_DATA.scheduleInfo){
                this.minDate = new Date(this.woService.WO_DATA.scheduleInfo.schedule_items[0].start_date);
            }
            this.addAssetForm('1', this.woService.WO_DATA.assetsDetails);
            this.addAssociatedAsset();
        }else{
            //console.log("Asset Init ####", sessionStorage.getItem('schedules'));
            this.addAssetForm('0');
            this.addAssociatedAsset();
        }

        this.subscription = this.util.changeDetection.subscribe(dataObj => {
            if(dataObj && (dataObj.source == 'INTERNAL_WO' || dataObj.source == 'EXTERNAL_WO') && dataObj.action == 'ADD_ASSETS'){
            	console.log('ggggggggggggggg  aaaa');
                this.review();
            }
            if(dataObj && dataObj.source == 'WO_INTERNAL' && dataObj.action == 'SCHEDULE_CHANGE'){
                console.log('SCHEDULE_CHANGE in assets');

                this.minDate = new Date(this.woService.scheduleDetails ? this.woService.scheduleDetails.start_date : '');
                this.maxDate = new Date(this.woService.scheduleDetails ? this.woService.scheduleDetails.end_date : '');

                delete this.woService.WO_DATA.assetsDetails;
                for (let i = self.assets.length - 1; i >= 0; i--) {
                    self.assets.removeAt(i);
                    // self.assets.at(i).get('start_date').setValue('');
                    // self.assets.at(i).get('start_time').setValue('');
                    // self.assets.at(i).get('start_time_format').setValue('am');
                    // self.assets.at(i).get('end_date').setValue('');
                    // self.assets.at(i).get('end_time').setValue('');
                    // self.assets.at(i).get('end_time_format').setValue('am');
                    // self.assets.at(i).get('name').setValue('');
                    // self.assets.at(i).get('asset_id').setValue('');
                    // self.assets.removeAt(i);
                }
                //if(this.pageData.currentUrl == 'assets'){
                    //this.util.showProcessing('processing-spinner');
                    //this.getAssetList();
                //}
            }
        });
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

    assetsStartDateChange(event, index){
        this.getAssetListOnChange(event, index);
        //this.assets.at(index).get('end_date').setValue('');
    }

    assetsEndDateChange(event, index){
        this.getAssetListOnChange(event, index);
    }

    getAssetListOnChange(event: any = false, index): void {
        try {
            let self = this;
            if (self.assets.at(index).get('start_time').valid && self.assets.at(index).get('end_time').valid) {
                self.getAssetList(index, this.assetForm.value.assets[index]);
            }
        } catch (err) {
            this.global.addException('Assets', 'getAssetListOnChange()', err);
        }
    }

    setAssetList(): void {
        this.addAssetForm('0');
        this.util.hideProcessing('processing-spinner');
        console.log("List form recurring ....", this.asset);
        this.assetsList = [];
        for (var i = 0; i < this.asset.length; i++) {
            let assetObj: any = this.asset[i].asset;
            assetObj.locationAsset = this.asset[i].locationAsset;
            assetObj.locationProduct = this.asset[i].locationProduct;
            assetObj.locationMaterial = this.asset[i].locationMaterial;
            this.assetsList.push(assetObj);
        }
        this.assets.length > 0 ? this.assets.at(0).get('filteredAsset').setValue(this.assets.at(0).get('name').valueChanges.pipe(startWith(''),map(value => this.assetFilter(value, 0)))) : '';
        for(let i=0; i<this.assets.length; i++){
            let asset:any = this.assetsList.filter(option => option.asset_id ==  this.assets.at(i).get('asset_id').value)[0];
            asset ? this.getSelectedAsset(asset, {isUserInput:true}, i) : '';
        }
    }

    //Get Material/Product List
    getAssetList(index, scheduleObj: any = JSON.parse(sessionStorage.getItem('schedules'))) {
        var self = this;
        let reqObj: any = {
            'start_date': this.util.getYYYYMMDDDate(scheduleObj.start_date),
            'end_date': this.util.getYYYYMMDDDate(scheduleObj.end_date),
            'start_time': scheduleObj.start_time.substring(0, 5),
            'end_time': scheduleObj.end_time.substring(0, 5),
            'start_time_format': scheduleObj.start_time_format,
            'end_time_format': scheduleObj.end_time_format,
            'work_order_id': this.woService.WO_DATA.work_order_id ? this.woService.WO_DATA.work_order_id : 0
        }
        try {
            this.util.showProcessing('processing-spinner');
            this.http.doPost('getAssetListForWo', reqObj, function (error: boolean, response: any) {
                self.util.hideProcessing('processing-spinner');
                if (error) { console.log(response) } else {
                    self.assetsList = [];
                    for (let i = response.data.length - 1 ; i >= 0; i--) {
                        for (let j = 0; j < self.assets.length; j++) {
                            if(response.data[i] && self.assets.at(j).get('asset_id').value == response.data[i].asset.asset_id){
                                response.data = response.data.filter(item => item.asset.asset_id != self.assets.at(j).get('asset_id').value);
                            }
                        }
                    }

                    for (var i = 0; i < response.data.length; i++) {
                        let assetObj: any = response.data[i].asset;
                        assetObj.locationAsset = response.data[i].locationAsset;
                        assetObj.locationProduct = response.data[i].locationProduct;
                        assetObj.locationMaterial = response.data[i].locationMaterial;
                        self.assetsList.push(assetObj);
                    }
                    console.log("assetsList", self.assetsList);
                    console.log(self.assets.length);

                    //self.assets.length > 0 ? self.assets.at(0).get('filteredAsset').setValue(self.assets.at(0).get('name').valueChanges.pipe(startWith(''),map(value => self.assetFilter(value)))) : '';
                    for (let i = 0; i < self.assets.length; i++) {
                        let asset: any = self.assetsList.filter(option => option.asset_id == self.assets.at(i).get('asset_id').value)[0];
                        if (asset) {
                            self.getSelectedAsset(asset, { isUserInput: true }, i);
                        }
                    }
                    self.assets.at(index).get('assetList').setValue(self.assetsList);
                    if(self.assets.at(index) && self.assets.at(index).get('assetList').value)
                    {
                        self.setObservable(index);
                    }
                }
            });
        } catch (err) {
            this.global.addException('Work order', 'getAssetList()', err);
        }
    }
    private assetFilter(value: string, index: number = 0): string[] {
        
        if(this.assets.at(index) && this.assets.at(index).get('assetList').value){
            //alert(index);
            return this.assets.at(index).get('assetList').value.filter(option => option.short_tag.toLowerCase().includes(value ? value.toLowerCase() : ''));
        }
    }
    clearSelAssetList(index) {
        try {
            this.selectedAssetList = [];
            this.assets.at(index).get('selectedAssetList').setValue(this.selectedAssetList);
            this.assets.at(index).get('associatedMember').setValue('');
            for (let i = 0; i < this.assets.length; i++) {
                this.getAssetList(i, this.assetForm.value.assets[i]);
            }
        } catch (err) {
            this.global.addException('Work order', 'clearSelAssetList()', err);
        }
    }
    getSelectedAsset(asset, event: any = false, index): void {
        try{
        console.log("event",event,asset);
            if(event.isUserInput){
                console.log("getSelectedAsset",asset);

                this.assets.at(index).get('asset_id').setValue(asset.asset_id);
                this.assets.at(index).get('associatedMember').setValue(asset.associated_member);
                this.selectedAssetList = [];
                if(asset.locationAsset){
                    for (var i = 0; i < asset.locationAsset.length; i++) {
                        let assetObj: any = {};
                        assetObj.assetId = asset.locationAsset[i].asset_id;
                        assetObj.assetName = asset.locationAsset[i].short_tag;
                        assetObj.assetType = 'Asset';
                        this.selectedAssetList.push(assetObj);
                    }
                }
                if(asset.locationProduct){
                    for (var i = 0; i < asset.locationProduct.length; i++) {
                        let assetObj: any = {};
                        assetObj.assetId = asset.locationProduct[i].manf_part_product_detail.manf_part_id;
                        assetObj.assetName = asset.locationProduct[i].manf_part_product_detail.short_name;
                        assetObj.assetType = 'Product';
                        this.selectedAssetList.push(assetObj);
                    }
                }
                if(asset.locationMaterial){
                    for (var i = 0; i < asset.locationMaterial.length; i++) {
                        let assetObj: any = {};
                        assetObj.assetId = asset.locationMaterial[i].manf_part_material_detail.manf_part_id;
                        assetObj.assetName = asset.locationMaterial[i].manf_part_material_detail.short_name;
                        assetObj.assetType = 'Material';
                        this.selectedAssetList.push(assetObj);
                    }
                }
                console.log("selectedAssetList",this.selectedAssetList);

                for (let i = 0; i < this.assets.length; i++) {
                    this.getAssetList(i, this.assetForm.value.assets[i]);
                }
                this.assets.at(index).get('selectedAssetList').setValue(this.selectedAssetList);
            }
        } catch (err) {
            this.global.addException('Work order', 'getSelectedAsset()', err);
        }
    }

    public validateAsset(event: any, item: any, index) {
        try {
            let team = event.target.value;
            if (team == '') {
                item.get('asset_id').setValue('');
                return;
            }
            let match = this.assetsList.filter(item => item.short_tag.toLowerCase() == team.toLowerCase());
            if (match.length > 0) {
                item.get('asset_id').setValue(match[0].asset_id);
                item.get('name').setValue(match[0].short_tag);
                item.get('associatedMember').setValue(match[0].associated_member);
                for (let i = 0; i < this.assets.length; i++) {
                    this.getAssetList(i, this.assetForm.value.assets[i]);
                }
            } else {
                item.get('asset_id').setValue('');
            }
        } catch (err) {
            this.global.addException('Work order', 'validateAsset()', err);
        }
    }


    addAssetForm(option, data: any = {}){
        try {
            this.minDate = new Date(this.woService.scheduleDetails ? this.woService.scheduleDetails.start_date : '');
            this.maxDate = new Date(this.woService.scheduleDetails ? this.woService.scheduleDetails.end_date : '');
            this.assetForm = this.fb.group({
                // materials_amount: new FormControl(option == '1' ? data.materials_amount : 0),
                assets: this.fb.array([])
            });
            if (option == '1') {
                for (var i = 0; i < data.length; i++) {
                    this.addAssets(option, data[i]);
                }
            }
        } catch (err) {
            this.global.addException('Work order', 'addAssetForm()', err);
        }
    }

    get assets(): FormArray{ return <FormArray>this.assetForm.get('assets') as FormArray;};



    addAssets(option, val: any = {}){
        try{

          if(val) {
            this.dStart = new Date(val.start_date);
            this.dStart.setMinutes( this.dStart.getMinutes() + this.dStart.getTimezoneOffset() );

            this.dEnd = new Date(val.end_date);
            this.dEnd.setMinutes( this.dEnd.getMinutes() + this.dEnd.getTimezoneOffset() );
          }
            this.assets.push(this.fb.group({
                name: new FormControl(option == '1' ? val.asset : ''),
                asset_id: new FormControl(option == '1' ? val.asset_id : '', []), //Validators.required
                scheduling_id: new FormControl(option == '1' ? val.scheduling_id : ''),
                //ad_hoc_service: new FormControl(''),
                start_date: new FormControl(option == '1' ?  this.dStart : this.woService.scheduleDetails ? this.util.getDateObjet(this.woService.scheduleDetails.start_date) : '', [Validators.required]),
                start_time: new FormControl(option == '1' ? val.start_time.substring(0,5) : this.woService.scheduleDetails ? this.woService.scheduleDetails.start_time.substring(0,5) : '', [Validators.pattern(this.constant.TIME_PATTERN)]), //Validators.required
                start_time_format: new FormControl(option == '1' ? val.start_time_format : this.woService.scheduleDetails ? this.woService.scheduleDetails.start_time_format : ''),
                end_date: new FormControl(option == '1' ?  this.dEnd : this.woService.scheduleDetails ? this.util.getDateObjet(this.woService.scheduleDetails.end_date) : '', [Validators.required]),
                end_time: new FormControl(option == '1' ? val.end_time.substring(0,5) : this.woService.scheduleDetails ? this.woService.scheduleDetails.end_time.substring(0,5) : '', [Validators.pattern(this.constant.TIME_PATTERN)]), //Validators.required
                end_time_format: new FormControl(option == '1' ? val.end_time_format : this.woService.scheduleDetails ? this.woService.scheduleDetails.end_time_format : ''),
                assetList: new FormControl([]),
                filteredAsset: new FormControl( new Observable<string[]>() ),
                selectedAssetList: new FormControl([]),
                associatedMember: new FormControl('')
            }));
            this.setObservable(this.assets.length - 1);
            this.getAssetList(this.assets.length - 1, this.assetForm.value.assets[ this.assets.length - 1 ]);
        }catch(err){
            this.global.addException('Work order', 'addAssets()', err, { 'assetParam': val, 'woServiceData': this.woService, 'formData': this.assetForm.value });
        }
    }
    test(form:FormGroup){
    	console.log(form);
    	this.submitted = true;
    }
    setObservable(index): void {
        this.assets.at(index).get('filteredAsset').setValue(this.assets.at(index).get('name').valueChanges.pipe(startWith(''),map(value => this.assetFilter(value, index))));
    }

    removeAsset(position, material): void {
        //this.util.focusHiddenInput('hiddenInput');
        if(this.assets.at(position).get('scheduling_id').value != ""){
            this.woService.deletedAsset.push(this.assets.at(position).get('scheduling_id').value);
        }
        this.assets.removeAt(position);
        for (let i = 0; i < this.assets.length; i++) {
            this.getAssetList(i, this.assetForm.value.assets[i]);
        }
    }
    review() {
        try {
            console.log(this.assetForm);
            this.submitted = true;
            if (this.assetForm.valid) {
                let assets: any[] = [];
                for (var i = 0; i < this.assetForm.value.assets.length; i++) {
                    assets.push({
                        "asset": this.assetForm.value.assets[i].name,
                        "asset_id": this.assetForm.value.assets[i].asset_id,
                        "scheduling_id": this.assetForm.value.assets[i].scheduling_id,
                        "start_date": this.util.getYYYYMMDDDate(this.assetForm.value.assets[i].start_date),
                        "end_date": this.util.getYYYYMMDDDate(this.assetForm.value.assets[i].end_date),
                        "start_time": this.assetForm.value.assets[i].start_time,
                        "start_time_format": this.assetForm.value.assets[i].start_time_format,
                        "end_time": this.assetForm.value.assets[i].end_time,
                        "end_time_format": this.assetForm.value.assets[i].end_time_format,
                        "is_deleted": 0
                    });
                }
                this.woService.WO_DATA.assetsDetails = assets;
                this.woService.updateFormStatus('assetsFm', true);
            } else {
                this.woService.updateFormStatus('assetsFm', false);
            }
        } catch (err) {
            this.global.addException('Work order', 'review()', err, { 'woServiceData': this.woService, 'formData': this.assetForm.value });
        }
    }

    addAssociatedAsset(): void {
        if(this.woService.WO_DATA.teamDetails){
            this.woService.WO_DATA.teamDetails.map(member => {
                if(member.associatedAssetList && member.associatedAssetList.length > 0){
                    member.associatedAssetList.map(associatedAsset => {
                        this.woService.associatedAsset.map( aAsset => {
                            if(aAsset.asset_id == associatedAsset.asset_id && aAsset.status == 'Not Added'){
                                let search: boolean = true;
                                for (let i = 0; i < this.assetForm.value.assets.length; i++) {
                                    search = true;
                                    if(this.assetForm.value.assets[i].asset_id == aAsset.asset_id){
                                        search = false;
                                        break;
                                    }
                                }
                                if(search){
                                    let asset = JSON.parse(JSON.stringify(member));
                                    asset.asset_id = associatedAsset.asset_id;
                                    asset.asset = associatedAsset.short_tag;
                                    this.addAssets('1', asset);
                                    aAsset.status = 'Added';
                                };
                            }
                        })
                    });
                }
            });
        }
    }
}



