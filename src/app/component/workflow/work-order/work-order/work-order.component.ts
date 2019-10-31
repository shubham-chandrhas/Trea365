import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Router, ActivatedRouteSnapshot,ActivatedRoute } from '@angular/router';
import { FormControl, FormGroup, FormBuilder, FormArray, Validators, NgForm, AbstractControl } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { startWith } from 'rxjs/operators/startWith';
import { map } from 'rxjs/operators/map';
import { ElementRef, NgZone, ViewChild } from '@angular/core';

import { UtilService } from '../../../../shared/service/util.service';
import { HttpService } from '../../../../shared/service/http.service';
import { GlobalService } from '../../../../shared/service/global.service';
import { ConstantsService } from '../../../../shared/service/constants.service';

import { WorkOrderDialog } from '../work-order-dialog.component';
import { WorkOrderService } from '../work-order.service';
import { DialogComponent } from '../../../../shared/model/dialog/dialog.component';

@Component({
    selector: 'app-work-order',
    templateUrl: './work-order.component.html',
    styleUrls: ['./work-order.component.css']
})
export class WorkOrderComponent implements OnInit {
    public minDate = new Date();
    public isBack: boolean = false;
    public isEdit: boolean = false;
    public fromMaintenance: boolean = false;
    public isScheduleValid: boolean = false;
    public timeNowError: boolean = false;
    EndDateType : string = '';
    public repeatList:any[] = [];
    public empList:any[] = [];
    is_after:boolean = false;
    filteredScheduleRepeat: Observable<string[]>;
    public isSchedule: boolean = false;
    public submitted: boolean = false;
    public submittedS: boolean = false;
    public contratorList:any[] = [];
    public assetsList:any[] = [];
    public assetsDetails:any = {};
    public filteredEmployee: Observable<any[]>;
    public filteredAssets: Observable<any[]>;
    public WOInfo:any = {};
    public userInfo:any;
    today: number = Date.now();
    public workOrderTab: string = 'services';
    filteredAssignee: Observable<string[]>;
    public subAssigneeList: any = [];
    errMsg: string = '';
    isError: boolean = false;
    isMainLocationLoad: boolean = false;
    isSubLocationLoad: boolean = false;

    public filteredLocations: Observable<string[]>;
    public filteredTags: Observable<string[]>;
    public locList: any[] = [];
    public locTagsList: any[] = [];
    setupForm: FormGroup;
    scheduleForm: FormGroup;
    public scheduleType: string = 'once';
    public assetType:string = 'Needs Maintenance';
    public filterAssetType: boolean = true;
    // pageData:any;
    pageData: any = { 'scheduleType': [] };
    currentAction: String;
    changeText: boolean = false;
    constructor(
        public dialog: MatDialog,
        public util:UtilService,
        public http:HttpService,
        public global:GlobalService,
        public router: Router,
        private fb: FormBuilder,
        public constant: ConstantsService,
        public WOService: WorkOrderService,
        public route: ActivatedRoute
    ) {

    }

    ngOnInit() {
      const d = new Date();
      let offset = d.getTimezoneOffset();
      console.log('off = ', offset);
// const date = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
d.setMinutes( d.getMinutes() + d.getTimezoneOffset() );


console.log('date normal =', d);
// console.log('date utc =', date);
// console.log('date utc =', typeof date);
        this.WOService.setcurrentState('ADD');
        this.util.menuChange({'menu':4,'subMenu':26});
        this.util.setPageTitle(this.route);
        this.util.setWindowHeight();
        this.WOService.woType = 'Internal';
        //this.WOService.associatedAsset = [];
        this.WOService.isCRwithService = false;
        this.WOService.isCRwithProduct = false;
        this.isMainLocationLoad = true;
        this.WOService.deletedService = [];
        this.WOService.deletedProductMaterial = [];
        this.WOService.deletedTeamMember = [];
        this.WOService.deletedAsset = [];

        if(sessionStorage.getItem('WO_DETAILS')){
            this.assetsDetails = null;
            this.getAssetsList();
            this.getLocationList();
            this.getContractorList();
            this.getAssigneeList();
            this.pageData = this.WOService.WO_DATA = JSON.parse(sessionStorage.getItem('WO_DETAILS'));
            console.log(this.pageData);
            this.isBack = true;
            this.createWOsetupForm('1',this.pageData);
            this.createForm('1',this.pageData);
            this.asset_details.setValue(this.pageData.scheduleInfo ? this.pageData.scheduleInfo.asset_details : '');
            this.maintenance_request_id.setValue(this.pageData.scheduleInfo ? this.pageData.scheduleInfo.maintenance_request_id : '');
            if(sessionStorage.getItem('WO_From_Maintenance')){
                this.pageData.assets_detail = this.pageData.repairInfo;
                this.pageData.assets_detail.short_tag = this.pageData.repairInfo.asset_name;
                this.asset_id.setValue(this.pageData.repairInfo.asset_id);
                this.fromMaintenance = true;
            }
        }else if(sessionStorage.getItem('WO_EDIT')){
            this.pageData = JSON.parse(sessionStorage.getItem('WO_EDIT'));
            this.WOService.WO_DATA = JSON.parse(sessionStorage.getItem('WO_EDIT'));
            // this.minDate = new Date(this.pageData.scheduleInfo.schedule_items[0].start_date);
            // console.log('min date=', this.minDate);

            const d = new Date('2019-05-25');
            d.setMinutes( d.getMinutes() + d.getTimezoneOffset() );
      this.minDate = d;

            this.isSchedule = true;
            this.isScheduleValid = true;
            this.isEdit = true;
            console.log(this.pageData);
            this.WOInfo.assignee = this.pageData.assign.status;
            this.WOInfo.assignee_id = this.pageData.assign.type_id;
            this.WOInfo.location_id = this.pageData.work_location ? this.pageData.work_location.location_id : '';
            this.WOInfo.location = this.pageData.work_location ? this.pageData.work_location.location_name : 'N/A';
            this.WOInfo.defaultLocation = this.pageData.work_location ? this.pageData.work_location.location_name : 'N/A';

            if(this.pageData.maintenance_asset_detail){
                this.assetsDetails = JSON.parse(JSON.stringify(this.pageData.maintenance_asset_detail));
                this.assetsDetails.manf_detail = {};
                this.assetsDetails.manf_part_detail = {};
                this.assetsDetails.mainetenance_req = this.pageData.maintenance_request;
                this.assetsDetails.manf_detail.manf_name = this.pageData.maintenance_asset_detail.manufacturer.manf_name;
                this.assetsDetails.manf_part_detail.short_name = this.pageData.maintenance_asset_detail.manf_part_detail.short_name;
                this.assetsDetails.manf_part_detail.full_name = this.pageData.maintenance_asset_detail.manf_part_detail.full_name;
                this.assetsDetails.asset_details = this.pageData.details;
            }else{
                this.assetsDetails = JSON.parse(JSON.stringify(this.pageData.asset_detail ? this.pageData.asset_detail : this.pageData.assetsDetails));
                this.assetsDetails.manf_detail = {};
                this.assetsDetails.manf_part_detail = {};
                if(this.pageData.asset_detail){
                    this.assetsDetails.manf_detail.manf_name = this.pageData.asset_detail.manufacturer.manf_name;
                    this.assetsDetails.manf_part_detail.short_name = this.pageData.asset_detail.manf_part_detail.short_name;
                    this.assetsDetails.manf_part_detail.full_name = this.pageData.asset_detail.manf_part_detail.full_name;
                }
                this.assetsDetails.asset_details = this.pageData.details;
            }

            // this.assetsDetails.manf_detail = this.pageData.maintenance_asset_detail ? this.pageData.maintenance_asset_detail.manufacturer : '';

            // this.assetsDetails.manf_part_detail = this.pageData.maintenance_asset_detail ? this.pageData.maintenance_asset_detail.manf_part_detail : '';
            // this.assetsDetails.serial_no = this.pageData.maintenance_asset_detail ? this.pageData.maintenance_asset_detail.serial_no : '';
            // this.assetsDetails.mainetenance_req = this.pageData.maintenance_request;
            this.createForm('1',this.pageData);
            // this.checkScheduleDates();
            this.asset_details.setValue(this.pageData.details);
            this.maintenance_request_id.setValue(this.pageData.maintenance_request_id);
            this.WOService.setcurrentState('EDIT');


        }else if(sessionStorage.getItem('WO_From_Maintenance')){
            // this.getAssetsList();
            this.getLocationList();
            this.getContractorList();
            this.getAssigneeList();
            this.pageData = JSON.parse(sessionStorage.getItem('WO_From_Maintenance'));
            this.fromMaintenance = true;
            console.log(this.pageData);
            this.assetsDetails.manf_detail = this.pageData.assets_detail.manf_detail;
            this.assetsDetails.manf_part_detail = this.pageData.assets_detail.manf_part_detail;
            this.assetsDetails.serial_no = this.pageData.assets_detail.serial_no;
            this.assetsDetails.mainetenance_req = {};
            this.assetsDetails.mainetenance_req.maintenance_details = this.pageData.maintenance_details;
            this.createWOsetupForm('0');
            this.createForm('0');
            this.onChanges();
            this.asset_name.setValue(this.pageData.assets_detail.short_tag);
            this.asset_id.setValue(this.pageData.assets_detail.asset_id);
            this.asset_details.setValue(this.pageData.maintenance_details);
            this.maintenance_request_id.setValue(this.pageData.maintenance_request_id);
            this.WOService.WO_DATA = {};
        }else{
            this.assetsDetails = null;
            this.getAssetsList();
            this.getLocationList();
            this.getContractorList();
            this.getAssigneeList();
            this.isBack = this.isEdit = false;
            this.createWOsetupForm('0');
            this.createForm('0');
            this.onChanges();
            this.WOService.WO_DATA = {};
        }

        if(localStorage.getItem('USER')){
            this.userInfo = JSON.parse(atob(localStorage.getItem('USER')));
        }
        this.workOrderTab = this.router.url.split('/')[this.router.url.split('/').length - 1];
        this.currentAction = this.WOService.getcurrentState();
        sessionStorage.removeItem('woSetupData');
        console.log('this.filterAssetType: '+this.filterAssetType);
        this.getPEScheduleType();
        this.getPEScheduleRepeatType();
        if(this.currentAction == "EDIT"){
            this.WOService.updateFormStatus('servicesFm', true);
            this.WOService.updateFormStatus('teamFm', true);
            this.WOService.updateFormStatus('assetsFm', true);
            this.WOService.updateFormStatus('materialsFm', true);
        }
        // this.getScheduleRepeatList();

    }
    onChanges(){
        // this.schedule_items.at(0).get('start_date').valueChanges.subscribe(date => {
        //     console.log(date);
        //     this.checkScheduleDates();
        // });
        // this.schedule_items.at(0).get('end_date').valueChanges.subscribe(date => {
        //     console.log(date);
        //     this.checkScheduleDates();
        // });

    }
    // startDate,endDate
    checkScheduleDates() {
        try {
            console.log(this.schedule_items.value);
            if(this.changeText){
                if (this.schedule_items.at(0).get('start_date').value != '' && this.schedule_items.at(0).get('end_date').value != '' && this.schedule_items.at(0).get('start_time').value != '' && this.schedule_items.at(0).get('end_time').value != '' && this.schedule_items.at(0).get('start_time').valid && this.schedule_items.at(0).get('end_time').valid) {
                    console.log('asd: ', this.schedule_items.at(0).get('end_time').valid);

                    let reqObj: any;
                    if (this.isEdit) {
                        reqObj = {
                            start_date: this.util.getYYYYMMDDDate(this.pageData.scheduleInfo.schedule_items[0].start_date),
                            end_date: this.util.getYYYYMMDDDate(this.pageData.scheduleInfo.schedule_items[0].end_date),
                            start_time: this.pageData.scheduleInfo.schedule_items[0].start_time,
                            end_time: this.pageData.scheduleInfo.schedule_items[0].end_time,
                            start_time_format: this.pageData.scheduleInfo.schedule_items[0].start_time_format,
                            end_time_format: this.pageData.scheduleInfo.schedule_items[0].end_time_format
                        }
                    } else {
                        reqObj = {
                            start_date: this.util.getYYYYMMDDDate(this.schedule_items.at(0).get('start_date').value),
                            end_date: this.util.getYYYYMMDDDate(this.schedule_items.at(0).get('end_date').value),
                            start_time: this.schedule_items.at(0).get('start_time').value,
                            end_time: this.schedule_items.at(0).get('end_time').value,
                            start_time_format: this.schedule_items.at(0).get('start_time_format').value,
                            end_time_format: this.schedule_items.at(0).get('end_time_format').value
                        }
                    }

                    console.log(this.scheduleForm.value);
                    this.isScheduleValid = true;
                    // sessionStorage.setItem('schedules', JSON.stringify(this.scheduleForm.value.schedule_items[0]) );
                    sessionStorage.setItem('schedules', JSON.stringify(reqObj));
                    this.WOService.WO_DATA.assetsDetails = undefined;
                    this.WOService.WO_DATA.teamDetails = undefined;
                    this.WOService.updateFormStatus('teamFm', false);
                    this.WOService.updateFormStatus('assetsFm', false);
                    this.WOService.associatedAsset = [];
                    this.util.changeEvent({
                        'source': 'WO_INTERNAL',
                        'action': 'SCHEDULE_CHANGE',
                        'data': ''
                    });
                }
            }
        }
        catch (err) {
            this.global.addException('WO', 'checkScheduleDates()', err);
        }
    }

    // changeQuotTab(tabName){
    //     this.workOrderTab = tabName;
    //     this.router.navigate(['/workflow/wo/csa/work-order/'+tabName]);
    // }

    changeTimeFormat(event:any, type){
        console.log(event.target.value);
        console.log(type);
    }

    getAssigneeList(){
        let self = this;
        try{
            // getSubContractor getCommonStatus
            this.http.doGet('getCommonStatus/WO_ASSIGN_TO', function(error: boolean, response: any){
                self.util.hideProcessing('processing-spinner');
                if(error){ console.log(response) }else{
                    console.log("cotractor List =",response.data.statusList);
                    self.subAssigneeList = response.data.statusList;
                    // for (let i = 0; i < response.data.length; i++) {
                    //     let empObj: any = response.data[i].subcontractor_info;
                    //     empObj.title = response.data[i].subcontractor_info.title ? response.data[i].subcontractor_info.title : '-';
                    //     empObj.fullName = response.data[i].subcontractor_info.first_name+" "+response.data[i].subcontractor_info.last_name;
                    //     self.subContractorList.push(empObj);
                    // }
                    console.log("cotractor List =",self.subAssigneeList);
                    self.filteredAssignee = self.assignee.valueChanges.pipe(startWith(''),map(value => self.assigneeFilter(value)));
                }
            });
        }
        catch(err){
        this.global.addException('sub assignee list','getAssigneeList()',err);
        }
    }
    getSelectedAssignee(assignee, event: any): void {
        try {
            if (event.isUserInput) {
                console.log(assignee);
                this.assignee_id.setValue(assignee.type_id);
            }
        } catch (err) {
            this.global.addException('WO', 'getSelectedAssignee()', err);
        }
    }

    private assigneeFilter(value: string): string[] {
        try{
        return this.subAssigneeList.filter(option => option.status.toLowerCase().includes(value ? value.toLowerCase() : ''));
        }catch (err) {
            this.global.addException('WO', 'assigneeFilter()', err);
        }
    }

    public validateAssignee(event: any) {
        try {
            let assignee = event.target.value;
            let match = this.subAssigneeList.filter(item => item.status.toLowerCase() == assignee.toLowerCase());
            console.log(match);
            if (assignee == '') {
                this.assignee_id.setValue('');
                return;
            }
            if (match.length > 0) {
                this.assignee_id.setValue(match[0].type_id);
                this.assignee.setValue(match[0].status);
            }
        } catch (err) {
            this.global.addException('WO', 'validateAssignee()', err);
        }
    }

    getContractorList(){
        var self = this;
        try{
            this.http.doGet('suppliers', function(error: boolean, response: any){
                self.util.hideProcessing('processing-spinner');
                if(error){
                    console.log("error",response);
                }else{
                    console.log(response);
                    self.contratorList = [];
                    for(let i = 0; i < response.data.length; i++){
                        if(response.data[i].supplier_type.supplier_type == 'Contractors'){
                            self.contratorList = response.data[i].suppliers;
                        }
                    }
                    // self.contratorList = self.contratorList.filter(item=>item.supplier_type.supplier_type == 'Contractors');
                    console.log(self.contratorList);
                    self.filteredEmployee = self.supplier_name.valueChanges.pipe(startWith(''), map(data => data ? self.filterEmployee(data, self.contratorList) : self.contratorList.slice()) );

                }
            });
        }catch(err){
            this.global.addException('Work Order Internal', 'getClientList()', err);
        }
    }
    filterEmployee(name: string, list: any[]) {
        try{
            return list.filter(data => data.supplier_name.toLowerCase().indexOf(name.toLowerCase()) === 0);
        }catch(err){
            this.global.addException('Work Order Internal','filterEmployee()',err);
        }
    }
    getSelectedEmployee(event, selAsset: any){
        try{
            if(event && event.isUserInput){
                console.log(selAsset);
                this.supplier_id.setValue(selAsset.supplier_id);
            }
        }catch(err){
            this.global.addException('Work Order Internal','getSelectedEmployee()',err);
        }
    }
    public validateEmployee(event:any){
        try{
            let asset = event.target.value;
            if(asset == ''){
                this.supplier_id.setValue('');
                this.supplier_name.setValue('');
                return;
            }
            let match = this.contratorList.filter(item=>item.supplier_name.toLowerCase() == asset.toLowerCase());
            if(match.length > 0){
                this.assetsDetails = match[0];
                this.supplier_id.setValue(match[0].supplier_id);
                this.supplier_name.setValue(match[0].supplier_name);
            }else{
                this.supplier_id.setValue('');
            }
        }catch(err){
            this.global.addException('Work Order Internal','validateEmployee()',err);
        }
    }


    getAssetsList(){
        var self = this;
        try{
            this.http.doGet('getAssetsList', function(error: boolean, response: any){
                self.util.hideProcessing('processing-spinner');
                if(error){
                    console.log("error",response);
                }else{
                    console.log(response);
                    self.assetsList = response.data;
                    // let assetsMaintanence;
                    // self.assetsList = [];
                    // for(let i = 0; i < response.data.length; i++){
                    //     if(response.data[i].status == 'Needs Maintenance'){
                    //         self.assetsList = self.assetsList.concat(response.data[i]);
                    //     }
                    // }
                    console.log(self.assetsList);
                    self.filteredAssets = self.asset_name.valueChanges.pipe(startWith(''), map(data => data ? self.filterAssets(data, self.assetsList) : self.assetsList.slice()) );
                    if(self.isBack){
                        let match = self.assetsList.filter(item=>item.short_tag.toLowerCase() == self.pageData.repairInfo.asset_name.toLowerCase());
                        if(match.length > 0){
                            self.assetsDetails = match[0];
                        }
                    }
                }
            });
        }catch(err){
            this.global.addException('Work Order Internal', 'getClientList()', err);
        }
    }
    filterAssets(name: string, list: any[]) {
        try{
            return list.filter(data => data.short_tag.toLowerCase().indexOf(name.toLowerCase()) === 0);
        }catch(err){
            this.global.addException('Work Order Internal','filterAssets()',err);
        }
    }
    getSelectedAsset(selAsset: any, event){
        try{
            if(event && event.isUserInput){
                console.log(selAsset);
                this.assetsDetails = selAsset;
                this.asset_id.setValue(selAsset.asset_id);
            }
        }catch(err){
            this.global.addException('Work Order Internal','getSelectedInspector()',err);
        }
    }
    public validateAsset(event:any){
        try{
            let asset = event.target.value;
            if(asset == ''){
                this.asset_id.setValue('');
                this.asset_name.setValue('');
                this.assetsDetails = null;
                return;
            }
            let match = this.assetsList.filter(item=>item.short_tag.toLowerCase() == asset.toLowerCase());
            if(match.length > 0){
                this.assetsDetails = match[0];
                this.asset_id.setValue(match[0].asset_id);
                this.asset_name.setValue(match[0].short_tag);
            }else{
                this.asset_id.setValue('');
                this.assetsDetails = null;
            }
        }catch(err){
            this.global.addException('Work Order Internal','validateInspector()',err);
        }
    }
    statusFilterAssets(){
        try{
        // this.filterAssetType = this.filterAssetType ? false : true;
        console.log('this.filterAssetType: '+this.isRepairingAsset.value);
        this.assetType = this.isRepairingAsset.value ? '' : 'Needs Maintenance';
        this.asset_id.setValue('');
        this.asset_name.setValue('');
        this.assetsDetails = null;
        this.isRepairingAsset.value ? this.asset_id.setValidators([ Validators.required ]) : this.asset_id.setValidators([]);
        this.asset_id.updateValueAndValidity();
        }
        catch (err) {
            this.global.addException('WO', 'statusFilterAssets()', err);
        }
    }

    getLocationList(){
        let self = this;
        try{
            this.isMainLocationLoad = true;
            this.http.doGet('location/list', function(error: boolean, response: any){
                self.isMainLocationLoad = false;
                if( error ){
                }else{
                    self.locList = response.data.filter(item => item.location_type == 'Fixed');

                    self.filteredLocations = self.location.valueChanges.pipe(startWith(''),map(value => self.locationFilter(value)));
                }
            });
        }catch(err){
            this.global.addException('Work Order Internal','getLocationList()',err);
        }
    }
    private locationFilter(value: string): string[] {
        try{
            return this.locList.filter(option => option.location_name.toLowerCase().includes(value ? value.toLowerCase() : ''));
        }catch(err){
            this.global.addException('Work Order Internal','locationFilter()',err);
        }
    }
    public validateLoc(event:any){
        try{
            let loc = event.target.value;
            let match = this.locList.filter(item=>item.location_name.toLowerCase() == loc.toLowerCase());
            if(match.length > 0){
                this.location.setValue(match[0].location_name);
                this.location_id.setValue(match[0].location_id);
                this.getLocationTags(match[0].location_id);
            }
        }catch(err){
            this.global.addException('Work Order Internal','validateLoc()',err);
        }
    }
    getSelectedLocation(event:any, selectedLoc: any){

        try{
            if(event.isUserInput){
                this.location_id.setValue(selectedLoc.location_id);
                console.log(selectedLoc);
                // if((selectedLoc.latitude=='' || selectedLoc.latitude ==null) && (selectedLoc.longitude=='' || selectedLoc.longitude==null))
                // {
                //     this.defaultLocation.setValue(selectedLoc.address+', '+selectedLoc.city+', '+selectedLoc.province+', '+selectedLoc.country);
                // }
                // else
                // {
                //     this.defaultLocation.setValue(selectedLoc.address);
                // }
                this.defaultLocation.setValue(selectedLoc.address);
                this.getLocationTags(selectedLoc.location_id);
            }
        }catch(err){
            this.global.addException('Work Order Internal','getSelectedLocation()',err);
        }
    }
    getSelectedTag(event:any, selectedTag: any){
        try{
            if(event.isUserInput){
                this.location_tag_id.setValue(selectedTag.location_tag_id);
            }
        }catch(err){
            this.global.addException('Work Order Internal','getSelectedTag()',err);
        }
    }
    getLocationTags(id){
        var self = this;
        try{
            self.isSubLocationLoad = true;
            this.http.doGet('location/tag/'+id, function(error: boolean, response: any){
                self.isSubLocationLoad = false;
                console.log(response);
                if(error){  console.log("error",response); }else{
                    self.locTagsList = response.tags;
                    self.filteredTags = self.location_tag.valueChanges.pipe(startWith(''),map(value => self.locationTagsFilter(value)));
                }
            });
        }catch(err){
            this.global.addException('Work Order Internal','getLocationTags()',err);
        }
    }
    private locationTagsFilter(value: string): string[] {
        try{
            return this.locTagsList.filter(option => option.location_tag.toLowerCase().includes(value ? value.toLowerCase() : ''));
        }catch(err){
            this.global.addException('Work Order Internal','locationTagsFilter()',err);
        }
    }
    public validateLocTags(event:any){
        try{
            let loc = event.target.value;
            let match = this.locTagsList.filter(item=>item.location_tag.toLowerCase() == loc.toLowerCase());
            if(match.length > 0){
                this.location_tag.setValue(match[0].location_tag);
                this.location_tag_id.setValue(match[0].location_tag_id);
            }
        }catch(err){
            this.global.addException('Work Order Internal','validateLocTags()',err);
        }
    }

    changeOccrence(type){
        this.EndDateType = type;
        this.is_after = false;
        if(type=='after'){
            this.is_after = true;
            this.schedule_items.at(1).get('end_date').setValidators([]);
            this.schedule_items.at(1).get('end_after_occurences').setValidators([Validators.required,Validators.min(1), Validators.max(52)]);
            this.schedule_items.at(1).get('end_date').updateValueAndValidity();
            this.schedule_items.at(1).get('end_after_occurences').updateValueAndValidity();
        }else{
            this.schedule_items.at(1).get('end_date').setValidators([Validators.required]);
            this.schedule_items.at(1).get('end_after_occurences').setValidators([]);
            this.schedule_items.at(1).get('end_date').updateValueAndValidity();
            this.schedule_items.at(1).get('end_after_occurences').updateValueAndValidity();
        }

        this.schedule_items.at(1).get('end_after_occurences').setValue('');
        this.schedule_items.at(1).get('end_date').setValue('');
    }
    getScheduleRepeatList(){
        let self = this;
        try{
            this.http.doGet('getCommonStatus/SCHEDULE_REPEAT', function(error: boolean, response: any){
                self.util.hideProcessing('processing-spinner');
                if( error ){
                    self.repeatList = [];
                }else{
                    self.repeatList = [];
                    self.repeatList = response.data.statusList;
                    console.log("getScheduleRepeatList",response.data,self.repeatList);
                }
                // if(self.schedule_items.length>0)
                //     self.filteredScheduleRepeat = self.schedule_items.at(1).get('schedule_repeat_name').valueChanges.pipe(startWith(''),map(value => self.repeatFilter(value)));
            });
        }catch(err){
            this.global.addException('Schedule Repeat List','getScheduleRepeatList()',err);
        }
    }
    getSelectedRepeat(repeat, event: any): void {
        try {
            if (event.isUserInput) {
                console.log(repeat);
                if (this.schedule_items.length > 0)
                    this.schedule_items.at(1).get('schedule_repeat').setValue(repeat.type_id);
            }
        } catch (err) {
            this.global.addException('WO', 'getSelectedRepeat()', err);
        }
    }
    private repeatFilter(value: string): string[] {
        try {
            //console.log(value,this.repeatList);
            return this.repeatList.filter(option => option.status.toLowerCase().includes(value ? value.toLowerCase() : ''));
        } catch (err) {
            this.global.addException('WO', 'repeatFilter()', err);
        }
    }
    public validateRepeat(event: any) {
        try {
            let repeat = event.target.value;
            let match = this.empList.filter(item => item.status.toLowerCase() == repeat.toLowerCase());
            console.log(match);
            if (repeat == '') {
                //this.schedule_items.at(1).get('schedule_type').setValue('');
                return;
            }
            if (match.length > 0) {
                // this.schedule_type.setValue(match[0].type_id);
                //this.schedule_items.at(1).get('schedule_type').setValue(match[0].type_id);
                this.schedule_items.at(1).get('schedule_repeat_name').setValue(match[0].status);
            }
        }
        catch (err) {
            this.global.addException('WO', 'validateRepeat()', err);
        }
    }
    getPEScheduleType(): void {
        try {
            let self = this;
            this.http.doGet('getCommonStatus/PE_SCHEDULE_TYPE', function (error: boolean, response: any) {
                self.util.hideProcessing('processing-spinner');
                if (error) {

                } else {
                    self.pageData.scheduleType = response.data.statusList;
                    for (var i = 0; i < self.pageData.scheduleType.length - 1; i++) {
                        if (self.isEdit && self.pageData.scheduleType[i].type_id == self.pageData.wo_schedule.schedule_type) {
                            // this condition works for edit wo to initiate WOService.WO_DATA.scheduleDetails only
                            self.WOService.WO_DATA.scheduleDetails = JSON.parse(JSON.stringify(self.pageData.wo_schedule));
                        }

                        if (self.WOService.WO_DATA.scheduleDetails && self.pageData.scheduleType[i].type_id == self.WOService.WO_DATA.scheduleDetails.schedule_type) {
                            //console.log("Date"+self.WOService.WO_DATA.scheduleDetails.start_date.toString().indexOf('/'));
                            if (self.WOService.WO_DATA.scheduleDetails.start_date.toString().indexOf('/') > -1)
                                self.WOService.WO_DATA.scheduleDetails.start_date = self.util.stringToDate(self.WOService.WO_DATA.scheduleDetails.start_date);

                            if (self.WOService.WO_DATA.scheduleDetails.end_date.toString().indexOf('/') > -1)
                                self.WOService.WO_DATA.scheduleDetails.end_date = self.util.stringToDate(self.WOService.WO_DATA.scheduleDetails.end_date);
                            // self.scheduleType = self.WOService.WO_DATA.scheduleDetails.schedule_type == '1' ? 'once' : self.WOService.WO_DATA.scheduleDetails.schedule_type == '2' ? 'reccuring' : 'now';

                            self.scheduleType = self.WOService.WO_DATA.scheduleDetails.schedule_type=='1'?'once':self.WOService.WO_DATA.scheduleDetails.schedule_type=='4'?'not_known':'now';

                            if (self.WOService.WO_DATA.scheduleDetails.schedule_type == 2) {
                                if (self.isEdit) {
                                    // self.WOService.WO_DATA.scheduleDetails.schedule_days = {};
                                    let schedule_days = self.WOService.WO_DATA.scheduleDetails.schedule_days;

                                    self.WOService.WO_DATA.scheduleDetails.schedule_days = [];
                                    schedule_days.forEach((element, key) => {
                                        self.WOService.WO_DATA.scheduleDetails.schedule_days[element.trim()] = true;
                                    });

                                }
                                // let schedule_days =  Array.isArray(self.WOService.WO_DATA.scheduleDetails.schedule_days) ? self.WOService.WO_DATA.scheduleDetails.schedule_days : self.WOService.WO_DATA.scheduleDetails.schedule_days.split(',');

                                //  self.WOService.WO_DATA.scheduleDetails.schedule_days=[];
                                //      schedule_days.forEach((element,key) => {
                                //         self.WOService.WO_DATA.scheduleDetails.schedule_days[element.trim()]= true;
                                //      });

                                // self.WOService.WO_DATA.scheduleDetails.schedule_days =   Object.assign({}, self.WOService.WO_DATA.scheduleDetails.schedule_days);
                            }
                            self.WOService.WO_DATA.scheduleDetails.schedule_repeat_details = self.WOService.WO_DATA.scheduleDetails.schedule_repeat_name && self.WOService.WO_DATA.scheduleDetails.schedule_repeat ? { 'type_id': self.WOService.WO_DATA.scheduleDetails.schedule_repeat, 'status': self.WOService.WO_DATA.scheduleDetails.schedule_repeat_name } : self.WOService.WO_DATA.scheduleDetails.schedule_repeat_details;

                            console.log(self.WOService.WO_DATA.scheduleDetails.schedule_days);
                            self.addScheduleItem('1', self.pageData.scheduleType[i], self.WOService.WO_DATA.scheduleDetails);
                            self.is_after = !self.WOService.WO_DATA.scheduleDetails.end_date ? true : false;
                            self.WOService.scheduleDetails = self.WOService.WO_DATA.scheduleDetails;
                        } else {
                            self.addScheduleItem('0', self.pageData.scheduleType[i]);
                        }
                    }
                    self.getScheduleRepeatList();
                }
            });
        } catch (err) {
            this.global.addException('WO', 'getPEScheduleType()', err);
        }
    }
    getPEScheduleRepeatType(): void {
        try {
            let self = this;
            this.http.doGet('getCommonStatus/SCHEDULE_REPEAT', function (error: boolean, response: any) {
                self.util.hideProcessing('processing-spinner');
                if (error) { } else {
                    self.pageData.scheduleRepeatType = response.data.statusList;

                }
            });
        }
        catch (err) {
            this.global.addException('WO', 'getPEScheduleRepeatType()', err);
        }

    }


    public createWOsetupForm(option, val:any = {}){
        this.setupForm = this.fb.group({
            assignee: new FormControl(option == '0' ? '' : val.repairInfo.assignee, []),
            assignee_id: new FormControl(option == '0' ? '' : val.repairInfo.assignee_id, [Validators.required]),
            asset_name: new FormControl(option == '0' ? '' : val.repairInfo.asset_name, []),
            asset_id: new FormControl(option == '0' ? '' : val.repairInfo.asset_id, [Validators.required]),
            location: new FormControl(option == '0' ? '' : val.repairInfo.location, []),
            location_id: new FormControl(option == '0' ? '' : val.repairInfo.location_id, [Validators.required]),
            location_tag: new FormControl(option == '0' ? '' : val.repairInfo.location_tag, []),
            location_tag_id: new FormControl(option == '0' ? '' : val.repairInfo.location_tag_id, [Validators.required]),
            isRepairingAsset: new FormControl(option == '0' ? true : val.repairInfo.isRepairingAsset),
            defaultLocation: new FormControl(option == '0' ? '' : val.repairInfo.defaultLocation, [])
            // employee_name: new FormControl(option == '0' ? '' : val.repairInfo.employee_name, []),
            // employee_id: new FormControl(option == '0' ? '' : val.repairInfo.employee_id, []),
            // assigned_to: new FormControl(option == '0' ? '' : val.repairInfo.assigned_to, [Validators.required]),
        });
        if(option != '0'){ this.statusFilterAssets(); };
    }
    get assignee(){return this.setupForm.get('assignee');}
    get assignee_id(){return this.setupForm.get('assignee_id');}
    get asset_name() { return this.setupForm.get('asset_name'); }
    get asset_id() { return this.setupForm.get('asset_id'); }
    get location() { return this.setupForm.get('location'); }
    get location_id() { return this.setupForm.get('location_id'); }
    get location_tag() { return this.setupForm.get('location_tag'); }
    get location_tag_id() { return this.setupForm.get('location_tag_id'); }
    get isRepairingAsset() { return this.setupForm.get('isRepairingAsset'); }
    get defaultLocation() { return this.setupForm.get('defaultLocation'); }
    // get employee_name() { return this.setupForm.get('employee_name'); }
    // get employee_id() { return this.setupForm.get('employee_id'); }
    // get assigned_to() { return this.setupForm.get('assigned_to'); }

    next(form: FormGroup) {
        try {
            //console.log(form);
            this.submitted = true;

            if (this.isBack) {
                this.isScheduleValid = true;
            }
            if (form.valid) {
                this.WOInfo = form.value;
                this.WOInfo.assigned = form.value.assigned_to == 'internal' ? 'Staff/Subcontractor' : 'External Contractor';
                this.isSchedule = true;
                this.WOService.WO_DATA.repairInfo = form.value;
                localStorage.removeItem('CREATE_WO');
                if (this.isRepairingAsset.value) {
                    this.asset_details.setValue(this.assetsDetails.mainetenance_req ? this.assetsDetails.mainetenance_req.maintenance_details : '');
                    (this.assetsDetails.mainetenance_req && this.assetsDetails.mainetenance_req.maintenance_request_id) ? (this.maintenance_request_id.setValue(this.assetsDetails.mainetenance_req ? this.assetsDetails.mainetenance_req.maintenance_request_id : '')) : '';
                }
                if (this.assignee.value == 'Contractor') {
                    let create_WO_Obj: any = {};
                    create_WO_Obj.WO_TYPE = 'Internal Contractor';
                    create_WO_Obj.assetsDetails = this.assetsDetails;
                    create_WO_Obj.repairInfo = form.value;
                    create_WO_Obj.repairInfo.maintenance_request_id = this.maintenance_request_id.value;
                    localStorage.setItem('CREATE_WO', JSON.stringify(create_WO_Obj));
                    this.router.navigate(['/workflow/wo/csa/wo-sub-contractor']);
                }
            }
        } catch (err) {
            this.global.addException('WO', 'next()', err);
        }
    }
    save(form:FormGroup){
        this.submittedS = true;
        this.isError = false;
        this.errMsg = "";
        let scIndex ;
        try {
        // scIndex =  this.scheduleType=='once' ? 0 :this.scheduleType=='reccuring' ? 1 : 2;
        // this.scheduleForm.value.schedule_items[scIndex].schedule_type_name = scIndex == 0 ? 'Once' : scIndex == 1 ?'Recurring' :'Now';
        scIndex =  this.scheduleType=='once' ? 0 :this.scheduleType=='now' ? 1 : 2;
        this.scheduleForm.value.schedule_items[scIndex].schedule_type_name = scIndex == 0 ? 'Once' : scIndex == 1 ?  'Now' : 'Not Known';
        if(this.scheduleType== 'once' ){
            //console.log("valid");
            //this.schedule_items.at(0).get('start_date').setValidators([Validators.required]);

           // this.schedule_items.at(0).get('end_date').setValidators([Validators.required]);


            this.schedule_items.at(0).get('start_time').setValidators([Validators.required,Validators.pattern(this.constant.TIME_PATTERN)]);

            this.schedule_items.at(0).get('end_time').setValidators([Validators.required,Validators.pattern(this.constant.TIME_PATTERN)]);

            // this.schedule_items.at(0).get('start_date').updateValueAndValidity();
           // this.schedule_items.at(0).get('end_date').updateValueAndValidity();
            this.schedule_items.at(0).get('start_time').updateValueAndValidity();
            this.schedule_items.at(0).get('end_time').updateValueAndValidity();

        }else {

            this.schedule_items.at(0).get('start_date').setValidators([]);
            this.schedule_items.at(0).get('end_date').setValidators([]);
            this.schedule_items.at(0).get('start_time').setValidators([Validators.pattern(this.constant.TIME_PATTERN)]);
            this.schedule_items.at(0).get('end_time').setValidators([Validators.pattern(this.constant.TIME_PATTERN)]);

            this.schedule_items.at(0).get('start_date').updateValueAndValidity();
            this.schedule_items.at(0).get('end_date').updateValueAndValidity();
            this.schedule_items.at(0).get('start_time').updateValueAndValidity();
            this.schedule_items.at(0).get('end_time').updateValueAndValidity();

        }
        console.log(this.scheduleForm , this.timeNowError)
        if(form.valid && !this.timeNowError){
            this.WOService.WO_DATA.scheduleInfo = form.value;
            this.WOService.WO_DATA.scheduleDetails = JSON.parse(JSON.stringify(this.scheduleForm.value.schedule_items[scIndex])) ;
            if(this.currentAction != 'EDIT'){
                if(this.workOrderTab == 'services'){
                    this.checkFormStatusEvent('ADD_SERVICES', { 'validation': true });
                    if(this.WOService.getFormValidationStatus().servicesFm){
                        //this.quatationTab = 'materials';
                        this.changeQuotTab('team');
                    }
                    return;

                }
                if(this.workOrderTab == 'team'){
                    this.checkFormStatusEvent('ADD_TEAM', { 'validation': true });
                    if(this.WOService.getFormValidationStatus().teamFm){
                        //this.quatationTab = 'materials';
                        this.changeQuotTab('assets');
                    }
                    return;
                }
                if(this.workOrderTab == 'assets'){
                    this.checkFormStatusEvent('ADD_ASSETS', { 'validation': true });
                    if(this.WOService.getFormValidationStatus().assetsFm){
                        //this.quatationTab = 'materials';
                        this.changeQuotTab('products');
                    }
                    return;
                }
                if(this.workOrderTab == 'products'){
                    //this.changeQuotTab('images');
                    this.checkFormStatusEvent('ADD_PROD_MAT', { 'validation': true });
                    if(this.WOService.getFormValidationStatus().materialsFm){
                         this.checkValidation();
                    }
                }
            }else{
                this.workOrderTab == 'services' ? this.checkFormStatusEvent('ADD_SERVICES', { 'validation': true }) : '';
                this.workOrderTab == 'team' ? this.checkFormStatusEvent('ADD_TEAM', { 'validation': true }) : '';
                this.workOrderTab == 'assets' ? this.checkFormStatusEvent('ADD_ASSETS', { 'validation': true }) : '';
                this.workOrderTab == 'products' ? this.checkFormStatusEvent('ADD_PROD_MAT', { 'validation': true }) : '';
            }

            this.checkFormStatusEvent('ADD_TEAM', { 'validation': true });
            if(!this.WOService.getFormValidationStatus().teamFm){
                this.changeQuotTab('team');
                return;
            }

            this.checkFormStatusEvent('ADD_SERVICES', { 'validation': true });
            if(!this.WOService.getFormValidationStatus().servicesFm){
                this.changeQuotTab('services');
                return;
            }
            console.log("this.WOService.getFormValidationStatus().materialsFm",this.WOService.getFormValidationStatus().materialsFm);

            if(!this.WOService.getFormValidationStatus().materialsFm){
                return;
            }

            if(this.WOService.WO_DATA.assetsDetails){
                for(let i = 0; i < this.WOService.WO_DATA.assetsDetails.length; i++){
                    let validAssetsDetails: boolean = true;

                    if(this.WOService.WO_DATA.assetsDetails[i].asset == "" || this.WOService.WO_DATA.assetsDetails[i].asset_id == "" || this.WOService.WO_DATA.assetsDetails[i].start_time == "" || this.WOService.WO_DATA.assetsDetails[i].end_time == ""){
                        validAssetsDetails = false;
                    }

                    if(!validAssetsDetails){
                        this.isError = true;
                        this.errMsg = "Please add valid data for all Assets OR remove Asset from list.";
                        this.changeQuotTab('assets');
                        return;
                    }
                }
            }


            if(this.WOService.WO_DATA.materialsDetails){
                for(let i = 0; i < this.WOService.WO_DATA.materialsDetails.length; i++){
                    let validMaterialsDetails: boolean = true;
                    if(this.WOService.WO_DATA.materialsDetails[i].locations.length == 0){ validMaterialsDetails = false; }

                    this.WOService.WO_DATA.materialsDetails[i].locations.map(loc => {
                        if(loc.quantity == undefined){ validMaterialsDetails = false; }
                        if(loc.quantity == '' || loc.quantity == 0){ validMaterialsDetails = false; }
                    });

                    if(!validMaterialsDetails){
                        this.isError = true;
                        this.errMsg = "Please add pickup quantity for all Products/Materials OR remove Product/Material from list.";
                        this.changeQuotTab('products');
                        return;
                    }
                }
            }

            console.log(this.WOService.WO_DATA);
            if(this.WOService.WO_DATA.assetsDetails){
                for(let i = 0; i < this.WOService.WO_DATA.assetsDetails.length; i++){
                    if(this.currentAction != 'EDIT'){
                        this.WOService.WO_DATA.assetsDetails[i].start_date = this.util.getDDMMYYYYDate(this.WOService.WO_DATA.assetsDetails[i].start_date);
                        this.WOService.WO_DATA.assetsDetails[i].end_date = this.util.getDDMMYYYYDate(this.WOService.WO_DATA.assetsDetails[i].end_date);
                    }
                    if(this.isEdit && i < this.pageData.assetsDetails.length){
                        this.WOService.WO_DATA.assetsDetails[i].scheduling_id = this.pageData.assetsDetails[i].scheduling_id;
                    }
                }
            }

            if(this.WOService.WO_DATA.scheduleInfo && this.WOService.WO_DATA.scheduleInfo){
                for(let i = 0; i < this.WOService.WO_DATA.scheduleInfo.schedule_items.length; i++){
                    if(this.currentAction != 'EDIT'){
                      // alert('1');
                      this.WOService.WO_DATA.scheduleInfo.schedule_items[i].start_date = this.util.getDDMMYYYYDate(this.WOService.WO_DATA.scheduleInfo.schedule_items[i].start_date);
                      this.WOService.WO_DATA.scheduleInfo.schedule_items[i].end_date = this.util.getDDMMYYYYDate(this.WOService.WO_DATA.scheduleInfo.schedule_items[i].end_date);
                    }
                    if(this.isEdit && i < this.pageData.scheduleInfo.schedule_items.length){
                      console.log('2 ==', this.WOService.WO_DATA.scheduleInfo.schedule_items[i].start_date);
                        this.WOService.WO_DATA.scheduleInfo.schedule_items[i].scheduling_id = this.pageData.scheduleInfo.schedule_items[i].scheduling_id;
                    }
                }
            }

            if(this.WOService.WO_DATA.teamDetails){
                for(let i = 0; i < this.WOService.WO_DATA.teamDetails.length; i++){
                    if(this.currentAction != 'EDIT'){
                        this.WOService.WO_DATA.teamDetails[i].start_date = this.util.getDDMMYYYYDate(this.WOService.WO_DATA.teamDetails[i].start_date);
                        this.WOService.WO_DATA.teamDetails[i].end_date = this.util.getDDMMYYYYDate(this.WOService.WO_DATA.teamDetails[i].end_date);

                    }
                    if(this.isEdit && i < this.pageData.teamDetails.length){
                        this.WOService.WO_DATA.teamDetails[i].scheduling_id = this.pageData.teamDetails[i].scheduling_id;
                    }

                }
            }

            if(this.WOService.WO_DATA.servicesDetails){
                for(let i = 0; i < this.WOService.WO_DATA.servicesDetails.length; i++){

                    if(this.isEdit && i < this.pageData.servicesDetails.length){
                        this.WOService.WO_DATA.servicesDetails[i].wo_service_id = this.pageData.servicesDetails[i].wo_service_id;
                    }
                }
            }

            if(this.WOService.WO_DATA.materialsDetails){
                for(let i = 0; i < this.WOService.WO_DATA.materialsDetails.length; i++){
                    if(this.isEdit && i < this.pageData.materialsDetails.length){
                        this.WOService.WO_DATA.materialsDetails[i].wo_material_id = this.pageData.materialsDetails[i].wo_material_id;
                    }
                }
            }

            this.WOService.WO_DATA.client_id = null;
            // sessionStorage.setItem('WO_DETAILS', JSON.stringify(this.WOService.WO_DATA));
            // this.router.navigate(['/workflow/wo/csa/work-order-review']);
            if(this.currentAction == 'EDIT'){
                this.addCR();
            }else{
              console.log('without stringify date = ',  this.WOService.WO_DATA.scheduleDetails.start_date);
              console.log('with stringify date = ',  JSON.stringify(this.WOService.WO_DATA.scheduleDetails.start_date));

                this.WOService.WO_DATA.scheduleDetails.start_date = this.util.getDDMMYYYYDate(this.WOService.WO_DATA.scheduleDetails.start_date);
                this.WOService.WO_DATA.scheduleDetails.end_date = this.util.getDDMMYYYYDate(this.WOService.WO_DATA.scheduleDetails.end_date);


                sessionStorage.setItem('WO_DETAILS', JSON.stringify(this.WOService.WO_DATA));
                this.router.navigate(['/workflow/wo/csa/work-order-review']);
            }

        }
        } catch (err) {
            this.global.addException('WO', 'save()', err);
        }
        // console.log(this.WOService.WO_DATA);
        // this.WOInfo = form.value;
        // this.isSchedule = true;
    }
    checkValidation(): void {
        try {
            this.isError = false;
            this.checkFormStatusEvent('ADD_SERVICES', { 'validation': true });
            this.checkFormStatusEvent('ADD_TEAM', { 'validation': true });
            this.checkFormStatusEvent('ADD_ASSETS', { 'validation': true });
            this.checkFormStatusEvent('ADD_PROD_MAT', { 'validation': true });
            if (!this.WOService.getFormValidationStatus().servicesFm) {
                this.workOrderTab = 'services';
                this.router.navigate(['//workflow/wo/csa/work-order/services']);
                return;
            } else if (!this.WOService.getFormValidationStatus().teamFm) {
                this.workOrderTab = 'team';
                this.router.navigate(['//workflow/wo/csa/work-order/team']);
                return;
            } else if (!this.WOService.getFormValidationStatus().assetsFm) {
                this.workOrderTab = 'assets';
                this.router.navigate(['//workflow/wo/csa/work-order/assets']);
                return;
            } else if (!this.WOService.getFormValidationStatus().materialsFm) {
                this.workOrderTab = 'products';
                this.router.navigate(['//workflow/wo/csa/work-order/products']);
                return;
            }
        } catch (err) {
            this.global.addException('WO', 'checkValidation()', err);
        }
        // sessionStorage.setItem('woDetails', JSON.stringify(this.WOService.WO_DATA));
        // sessionStorage.setItem('woFormFlag', JSON.stringify(this.WOService.getFormValidationStatus));

        //this.router.navigate(['/workflow/quote/csa/quotation-review']);
        // this.submitWOData();
    }
    changeQuotTab(tabName, checkValidation: boolean = true){
        console.log(tabName);
        if(this.workOrderTab == 'services'){
            this.checkFormStatusEvent('ADD_SERVICES', { 'validation': checkValidation });
            if(checkValidation && !this.WOService.getFormValidationStatus().servicesFm){
                console.log('1');
                return
            }
        }

        if(this.workOrderTab == 'products'){
            this.checkFormStatusEvent('ADD_PROD_MAT', { 'validation': checkValidation });
            if(checkValidation && !this.WOService.getFormValidationStatus().materialsFm){
                console.log('2');
                return;
            }
        }
        if(this.workOrderTab == 'team'){
            this.checkFormStatusEvent('ADD_TEAM', { 'validation': checkValidation });
            if(checkValidation && !this.WOService.getFormValidationStatus().teamFm){
                console.log('3');
                return;
            }
        }
        if(this.workOrderTab == 'assets'){
            this.checkFormStatusEvent('ADD_ASSETS', { 'validation': checkValidation });
            if(checkValidation && !this.WOService.getFormValidationStatus().assetsFm){
                console.log('4');
                return;
            }
        }

        this.workOrderTab = tabName;
        this.router.navigate(['/workflow/wo/csa/work-order/'+tabName]);
    }
    checkFormStatusEvent(action, data): void {
        this.util.changeEvent({
            'source': 'INTERNAL_WO',
            'action': action,
            'data': data
        });
    }


    public changeSchedule(type){
        try{
        console.log(type);
        this.scheduleType = type;
        this.timeNowError = false;
        if(this.scheduleType == 'now'){
            // this.schedule_items.at(0).get('schedule_type').setValue(3);
            // this.schedule_items.at(0).get('schedule_type_name').setValue('Now');
            this.schedule_items.at(2).get('start_date').setValue(this.today);
            this.schedule_items.at(2).get('end_date').setValue(this.today);
        }
        }
        catch (err) {
            this.global.addException('WO', 'changeSchedule()', err);
        }

    }
    createForm(option, val:any = {}){
        this.scheduleForm = this.fb.group({
            supplier_name:new FormControl(option == '0' ? '' : val.scheduleInfo.supplier_name, []),
            supplier_id:new FormControl(option == '0' ? '' : val.scheduleInfo.supplier_id, []),
            asset_details:new FormControl(option == '0' ? '' : val.scheduleInfo.asset_details, []),
            maintenance_request_id:new FormControl(option == '0' ? '' : val.scheduleInfo.maintenance_request_id, []),
            schedule_items: this.fb.array([])
        });
        // this.util.addBulkValidators(this.scheduleForm, ['supplier','supplierId'], [ Validators.required ]);
        if( option == '1' ){
            console.log('val.scheduleInfo.schedule_items.length: '+val.scheduleInfo.schedule_items.length);
            //if(val.scheduleInfo.schedule_items.length == 0){
                // this.addScheduleItem('0');
            //}else{
                //for (let i = 0; i < val.scheduleInfo.schedule_items.length; i++) {
                    // this.addScheduleItem(option, val.scheduleInfo.schedule_items[i]);
                //}
            //}
            this.util.hideProcessing('processing-spinner');
        }else{
            //for (let i = 0; i < 1; i++) {
                // this.addScheduleItem('0');
            //}
        }
      };
    get supplier_name() { return this.scheduleForm.get('supplier_name'); }
    get supplier_id() { return this.scheduleForm.get('supplier_id'); }
    get asset_details() { return this.scheduleForm.get('asset_details'); }
    get maintenance_request_id() { return this.scheduleForm.get('maintenance_request_id'); }
    get schedule_items(): FormArray{ return <FormArray>this.scheduleForm.get('schedule_items') as FormArray; }
    // addScheduleItem(option, val:any = {}){
    //     this.schedule_items.push(this.fb.group({
    //         schedule_type: new FormControl(option == '0' ? 'Once' : val.schedule_type), //Only for edit
    //         // isItemDelete: new FormControl('0'), //Only for edit
    //         schedule_repeat: new FormControl(option == '0' ? '' : val.schedule_repeat ), //Only for edit
    //         start_date: new FormControl(option == '0' ? '' : val.start_date, [Validators.required] ), //Only for review
    //         end_date: new FormControl(option == '0' ? '' : val.end_date, [Validators.required] ),
    //         start_time: new FormControl(option == '0' ? '' : val.start_time.substring(0,5), [Validators.required, Validators.pattern(this.constant.TIME_PATTERN)] ), //Only for review
    //         start_time_format: new FormControl(option == '0' ? 'am' : val.start_time_format, [Validators.required]),
    //         end_time: new FormControl(option == '0' ? '' : val.end_time.substring(0,5), [Validators.required, Validators.pattern(this.constant.TIME_PATTERN)]),
    //         end_time_format: new FormControl(option == '0' ? 'am' : val.end_time_format, [Validators.required]),
    //         schedule_days: new FormControl(option == '0' ? '' : val.schedule_days, [ ]),
    //         end_after_occurences: new FormControl(option == '0' ? '' : val.end_after_occurences, [ ]),
    //     }));
    // }

    addScheduleItem(option, masterVal:any = {}, formVal:any = {}){
        console.log("formval",formVal);

        const dStart = new Date(formVal.start_date);
        dStart.setMinutes( dStart.getMinutes() + dStart.getTimezoneOffset() );

        const dEnd = new Date(formVal.end_date);
        dEnd.setMinutes( dEnd.getMinutes() + dEnd.getTimezoneOffset() );

       try{
            this.schedule_items.push(this.fb.group({
                schedule_type_name: new FormControl(masterVal.status, [ ]), //Only for edit
                schedule_type: new FormControl(masterVal.type_id, [ ]), //Only for edit
                schedule_repeat: new FormControl(option == '0' ? '' : formVal.schedule_repeat_details ? formVal.schedule_repeat_details.type_id:formVal.wo_schedule_repeat ? formVal.wo_schedule_repeat.type_id : '' ), //Only for edit
                start_date: new FormControl(option == '0' ? '' : dStart), //Only for review
                //start_date: new FormControl(option == '0' ? '' : this.util.getYYYYMMDDDate(this.util.stringToDate(formVal.start_date)) ), //Only for review
                schedule_repeat_name :  new FormControl(option == '0' ? '' : formVal.schedule_repeat_details?formVal.schedule_repeat_details.status:formVal.wo_schedule_repeat ? formVal.wo_schedule_repeat.status : ''),
                end_date: new FormControl(option == '0' ? '' : dEnd,  ),
                //end_date: new FormControl(option == '0' ? '' : this.util.getYYYYMMDDDate(this.util.stringToDate(formVal.end_date)) ),
                start_time: new FormControl(option == '0' ? '' : formVal.start_time.substring(0,5),[Validators.pattern(this.constant.TIME_PATTERN)] ), //Only for review
                start_time_format: new FormControl(option == '0' ? 'am' : formVal.start_time_format),
                end_time: new FormControl(option == '0' ? '' : formVal.end_time.substring(0,5),[Validators.pattern(this.constant.TIME_PATTERN)]),
                end_time_format: new FormControl(option == '0' ? 'am' : formVal.end_time_format),
                //schedule_days: new FormControl(option == '0' ? [] : formVal.schedule_days, []),
                schedule_days : new FormGroup({
                    Mon: new FormControl(option == '0' ? false :formVal.schedule_days ? formVal.schedule_days.Mon :false ),
                    Tue: new FormControl(option == '0' ? false :formVal.schedule_days ? formVal.schedule_days.Tue :false ),
                    Wed: new FormControl(option == '0' ? false :formVal.schedule_days? formVal.schedule_days.Wed :false ),
                    Thu: new FormControl(option == '0' ? false :formVal.schedule_days? formVal.schedule_days.Thu :false ),
                    Fri: new FormControl(option == '0' ? false :formVal.schedule_days? formVal.schedule_days.Fri :false ),
                    Sat: new FormControl(option == '0' ? false :formVal.schedule_days? formVal.schedule_days.Sat :false ),
                    Sun: new FormControl(option == '0' ? false :formVal.schedule_days? formVal.schedule_days.Sun :false ),

                }),
                end_after_occurences: new FormControl(option == '0' ? '' : formVal.end_after_occurences, [ ]),
            }));
            console.log("formval",formVal);
        }catch(err){
            this.global.addException('Schedule add','addScheduleItem()',err);
        }
    }
    startDateChange(event,index){
        console.log(event);
        console.log(this.schedule_items.at(index).get('start_date').value);
        this.schedule_items.at(index).get('start_date').setValue(event);
        this.schedule_items.at(index).get('end_date').setValue('');
        this.setSchedule(index);
    }


    clearendtime(event, index) {
        try {
            this.timeNowError = false;
            //this.schedule_items.at(index).get('end_date').setValue(event);
            this.schedule_items.at(index).get('end_time').setValue('');
            this.setSchedule(index);
        }
        catch (err) {
            this.global.addException('WO', 'clearendtime()', err);
        }
    }

    compareendtime(event, index) {
        try {
            console.log(index)
            this.timeNowError = false;
            console.log(this.schedule_items.at(index).get('start_date').value);
            let startDate = new Date(this.schedule_items.at(index).get('start_date').value);
            let startDateDay = startDate.getDate();
            let startDateMonth = startDate.getMonth();
            let startDateYear = startDate.getFullYear();

            let startDatestring = new Date(String(startDateYear) + '-' + String(startDateMonth) + '-' + String(startDateDay) + " " + this.schedule_items.at(index).get('start_time').value + " " + this.schedule_items.at(index).get('start_time_format').value);

            let endDate = new Date(this.schedule_items.at(index).get('end_date').value);
            let endDateDay = endDate.getDate();
            let endDateMonth = endDate.getMonth();
            let endDateYear = endDate.getFullYear();

            let endDatestring = new Date(String(endDateYear) + '-' + String(endDateMonth) + '-' + String(endDateDay) + " " + this.schedule_items.at(index).get('end_time').value + " " + this.schedule_items.at(index).get('end_time_format').value);

            console.log(startDatestring.getTime(), endDatestring.getTime(), endDatestring, startDatestring);
            if (startDatestring.getTime() > endDatestring.getTime()) {
                this.timeNowError = true;
            }
            else {
                this.timeNowError = false;
            }
            if (this.schedule_items.at(index).get('start_date').value != '' && this.schedule_items.at(index).get('start_date').value != '') {
                // code...
            }
            this.setSchedule(index);
        } catch (err) {
            this.global.addException('WO Subcontractor', 'compareendtime()', err);
        }
    }

    scheduleStartDateChange(event, index){
        console.log(event);
        this.schedule_items.at(index).get('end_date').setValue('');
    }
    setSchedule(index){
        console.log(this.schedule_items.value);
        if(this.changeText){
            if(this.schedule_items.at(index).get('start_date').value != '' && this.schedule_items.at(index).get('end_date').value != '' && this.schedule_items.at(index).get('start_time').value != '' && this.schedule_items.at(index).get('end_time').value != '' && this.schedule_items.at(index).get('start_time').valid && this.schedule_items.at(index).get('end_time').valid){
                console.log('asd: ',this.schedule_items.at(index).get('end_time').valid);





                let reqObj:any;
                if(this.isEdit){
                    reqObj = {
                        start_date: this.util.getYYYYMMDDDate(this.pageData.scheduleInfo.schedule_items[0].start_date),
                        end_date: this.util.getYYYYMMDDDate(this.pageData.scheduleInfo.schedule_items[0].end_date),
                        start_time: this.pageData.scheduleInfo.schedule_items[0].start_time,
                        end_time: this.pageData.scheduleInfo.schedule_items[0].end_time,
                        start_time_format: this.pageData.scheduleInfo.schedule_items[0].start_time_format,
                        end_time_format: this.pageData.scheduleInfo.schedule_items[0].end_time_format
                    }
                }else{
                    reqObj = {
                        start_date: this.util.getYYYYMMDDDate(this.schedule_items.at(index).get('start_date').value),
                        end_date: this.util.getYYYYMMDDDate(this.schedule_items.at(index).get('end_date').value),
                        start_time: this.schedule_items.at(index).get('start_time').value,
                        end_time: this.schedule_items.at(index).get('end_time').value,
                        start_time_format: this.schedule_items.at(index).get('start_time_format').value,
                        end_time_format: this.schedule_items.at(index).get('end_time_format').value
                    }
                }
                this.WOService.scheduleDetails = reqObj;
                console.log(this.scheduleForm.value);
                console.log(reqObj);
                this.isScheduleValid = true;
                // sessionStorage.setItem('schedules', JSON.stringify(this.scheduleForm.value.schedule_items[0]) );
                sessionStorage.setItem('schedules', JSON.stringify(reqObj) );
                this.WOService.WO_DATA.assetsDetails = undefined;
                this.WOService.WO_DATA.teamDetails = undefined;
                this.WOService.updateFormStatus('teamFm', false);
                this.WOService.updateFormStatus('assetsFm', false);
                this.WOService.associatedAsset = [];
                this.util.changeEvent({
                    'source': 'WO_INTERNAL',
                    'action': 'SCHEDULE_CHANGE',
                    'data': ''
                });
            }
        }
    }
    testClick(form:FormGroup){
        console.log(form);
    }

    showMemberSearchPopup(){
        this.dialog.open(WorkOrderDialog, { data: { 'action': 'memberSearch' } });
    }

    showAssetSearchPopup(){
        this.dialog.open(WorkOrderDialog, { data: { 'action': 'assetSearch' } });
    }

    addCR(): void {
        try {
            let self = this;
            let reqObj: any = {};
            reqObj.work_order_id = this.WOService.WO_DATA.work_order_id;
            reqObj.work_order_type = '1';
            reqObj.assign_to = this.WOService.WO_DATA.assign_to;
            reqObj.maintenance_request_id = this.WOService.WO_DATA.maintenance_request_id;
            reqObj.is_repairing_asset = this.WOService.WO_DATA.is_repairing_asset;
            reqObj.asset_id = this.WOService.WO_DATA.asset_id;
            reqObj.asset_details = this.WOService.WO_DATA.asset_details;
            reqObj.supplier_id = this.WOService.WO_DATA.supplier_id;
            // reqObj.client_id = this.WOSubContractorObj.client_id;
            //reqObj.work_location = this.WOService.WO_DATA.work_location;
            reqObj.work_location_id = this.WOService.WO_DATA.work_location_id;
            reqObj.cost_of_services = this.WOService.WO_DATA.cost_of_services;
            reqObj.cost_of_product_material = this.WOService.WO_DATA.cost_of_product_material;
            reqObj.shipping_and_handling = this.WOService.WO_DATA.shipping_and_handling;
            reqObj.adjustment = this.WOService.WO_DATA.adjustment;
            reqObj.subtotal = this.WOService.WO_DATA.subtotal;
            reqObj.taxes = this.WOService.WO_DATA.taxes;
            reqObj.total_cost = this.WOService.WO_DATA.total_cost;
            // reqObj.require_client_sign = this.woForm.value.require_client_sign ? 1 : 0;
            reqObj.project_estimate_id = '';
            // reqObj.schedule = this.WOService.WO_DATA.scheduleDetails;
            let schedule = [];
            // alert('in meth');
            let obj = {
                'start_date': this.util.getYYYYMMDDDate(this.WOService.WO_DATA.scheduleDetails.start_date),
                'end_date': this.util.getYYYYMMDDDate(this.WOService.WO_DATA.scheduleDetails.end_date),
                'start_time': this.WOService.WO_DATA.scheduleDetails.start_time,
                'start_time_format': this.WOService.WO_DATA.scheduleDetails.start_time_format,
                'end_time': this.WOService.WO_DATA.scheduleDetails.end_time,
                'end_time_format': this.WOService.WO_DATA.scheduleDetails.end_time_format,
                'schedule_days': this.WOService.WO_DATA.scheduleDetails.schedule_days,
                'end_after_occurences': this.WOService.WO_DATA.scheduleDetails.end_after_occurences,
                'schedule_repeat_name': this.WOService.WO_DATA.scheduleDetails.schedule_repeat_name,
                'schedule_repeat': this.WOService.WO_DATA.scheduleDetails.schedule_repeat,
                'schedule_type': this.WOService.WO_DATA.scheduleDetails.schedule_type,
                'scheduling_id': this.pageData.wo_schedule.scheduling_id,
            }
            schedule.push(obj);
            reqObj.schedule = schedule;
            let servicesList = JSON.parse(JSON.stringify(this.WOService.WO_DATA.servicesDetails));
          //  alert('edit date = '+obj.start_date);
            // console.log('should be date = ',this.util.getYYYYMMDDDate(this.WOService.WO_DATA.scheduleDetails.start_date);
            // servicesList.map(item => {
            //     delete item.peServices;
            //     delete item.peServicesCount;
            //     delete item.woRemainingQuantity;
            //     delete item.woType;
            // });
            reqObj.services = this.WOService.WO_DATA.servicesDetails.services;
            reqObj.team = this.WOService.WO_DATA.teamDetails;
            reqObj.assets = this.WOService.WO_DATA.assetsDetails;
            reqObj.paymentSchedules = this.WOService.WO_DATA.wo_payment_terms;
            reqObj.productMaterial = JSON.parse(JSON.stringify(this.WOService.WO_DATA.materialsDetails));
            reqObj.productMaterial.map(item => { delete item.prodMatLocation1; });
            this.WOService.deletedService.map(item => {
                reqObj.services.push({
                    'wo_service_id': item,
                    'is_deleted': 1
                })
            });

            this.WOService.deletedProductMaterial.map(item => {
                reqObj.productMaterial.push({
                    'wo_material_id': item,
                    'is_deleted': 1
                })
            });

            this.WOService.deletedTeamMember.map(item => {
                reqObj.team.push({
                    'scheduling_id': item,
                    'is_deleted': 1
                })
            });

            this.WOService.deletedAsset.map(item => {
                reqObj.assets.push({
                    'scheduling_id': item,
                    'is_deleted': 1
                })
            });

            console.log('API CALL...######');
            self.util.addSpinner('update-btn', "Update");
            this.http.doPost('WorkOrder/edit', reqObj, function (error: boolean, response: any) {
                self.util.removeSpinner('update-btn', "Update");
                if (error) {
                    self.isError = true;
                    self.errMsg = response.message;
                } else {
                    self.util.showDialog(DialogComponent, response.message, ['/workflow/wo/csa/work-order-list/0'])
                }
            });
        }
        catch (err) {
            this.global.addException('WO', 'addCR()', err);
        }
    }
}
