import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, NativeDateAdapter  } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { FormControl, FormGroupDirective, NgForm, Validators, FormGroup, FormBuilder, FormArray } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { ScheduleDialogComponent } from '../schedule-dialog.component';


import { UtilService } from '../../../../shared/service/util.service';
import { ConstantsService } from '../../../../shared/service/constants.service';
import { GlobalService } from '../../../../shared/service/global.service';
import { HttpService } from '../../../../shared/service/http.service';

@Component({
    selector: 'app-add-schedule',
    templateUrl: './add-schedule.component.html',
    styleUrls: ['./add-schedule.component.css']
})
export class AddScheduleComponent implements OnInit {
    public scheduleFor: string;
    public scheduleType: string = 'once';
    public assetList: any[] = [];
    public empList:any[] = [];
    public repeatList:any[] = [];
    public scheduleForAssetForm: FormGroup;
    filteredAssets: Observable<string[]>;
    filteredEmployee: Observable<string[]>;
    filteredScheduleRepeat: Observable<string[]>;
    public assetDetails:any = null;
    public personDetails:any =null;
    public minDate = new Date();
    public isBack: boolean = false;
    public isEdit: boolean = false;
    public is_after:boolean = false;
    submitted:boolean = false;
    timeNowError: boolean = false;
    constructor(
        private fb: FormBuilder,
		private constant: ConstantsService,
		public util: UtilService,
	    public http: HttpService,
	    public global: GlobalService,
        public dialog: MatDialog,
        public route: ActivatedRoute,
        public router: Router,
    ) {
        // this.scheduleData = JSON.parse(sessionStorage.getItem('schedulingInfo'));
        // console.log("scheduleData",this.scheduleData);
     }

    ngOnInit() {
        this.util.menuChange({'menu':4,'subMenu':27});
        this.util.setWindowHeight();
        this.util.setPageTitle(this.route);
        this.util.showProcessing('processing-spinner');
        this.scheduleFor = atob(this.route.snapshot.paramMap.get('type'));
        console.log(atob(this.route.snapshot.paramMap.get('type')));
        if(this.scheduleFor == 'Asset'){
            this.getAssetList();
        }
        this.getEmployeeList();
        this.getScheduleRepeatList();
        console.log("editSchedulingInfo",sessionStorage.getItem('editSchedulingInfo'));
        if(sessionStorage.getItem('editSchedulingInfo')){
            this.isEdit = true;
            let editSchedulingInfo:any = {};
            editSchedulingInfo = JSON.parse(sessionStorage.getItem('editSchedulingInfo'));
            if(this.scheduleFor == 'Asset'){
                //editSchedulingInfo.asset_id = editSchedulingInfo.asset_detail.asset_id;
                editSchedulingInfo.asset_name = editSchedulingInfo.asset_detail.short_tag;
                //editSchedulingInfo.assign_name = editSchedulingInfo.wo_assign_to ? (editSchedulingInfo.wo_assign_to.first_name+' '+editSchedulingInfo.wo_assign_to.last_name) : '';

            }else{
                editSchedulingInfo.staff_name = editSchedulingInfo.wo_team_member.first_name+' '+editSchedulingInfo.wo_team_member.last_name;
            }
            this.personDetails = editSchedulingInfo.wo_team_member;
            this.personDetails ? this.personDetails.created_at = editSchedulingInfo.created_at : '';

            if(editSchedulingInfo.asset_detail){
                this.assetDetails = editSchedulingInfo.asset_detail;
                this.assetDetails.manf_name = editSchedulingInfo.asset_detail.manufacturer.manf_name;
                this.assetDetails.manf_part_no = editSchedulingInfo.asset_detail.manf_part_detail.manf_part_no;
                this.assetDetails.short_name = editSchedulingInfo.asset_detail.manf_part_detail.short_name;
                this.assetDetails.item_class_name = editSchedulingInfo.asset_detail.manf_part_detail.class_name.item_class_name;
                this.assetDetails.upc = editSchedulingInfo.asset_detail.manf_part_detail.upc;
                this.assetDetails.location_name = editSchedulingInfo.asset_detail.location_details.location_name;
            }
            this.scheduleType = editSchedulingInfo.wo_schedule_type ? editSchedulingInfo.wo_schedule_type.status.toLowerCase() : 'indefinitely';
            // if(this.scheduleType == 'recurring'){
            //     editSchedulingInfo.schedule_days = editSchedulingInfo.schedule_days.split(',');
            // }
            editSchedulingInfo.schedule_repeat = editSchedulingInfo.wo_schedule_repeat ? editSchedulingInfo.wo_schedule_repeat.type_id : '';
            editSchedulingInfo.schedule_repeat_name = editSchedulingInfo.wo_schedule_repeat ? editSchedulingInfo.wo_schedule_repeat.status : '';
            editSchedulingInfo.schedule_days = editSchedulingInfo.schedule_days ? editSchedulingInfo.schedule_days.split(',') : [];
            editSchedulingInfo.days_off = [{"monday":false,"tuesday":false,"wednesday":false,"thursday":false,"friday":false,"saturday":false,"sunday":false}];
            for(let i=0; i<editSchedulingInfo.schedule_days.length; i++){
                for (let key in editSchedulingInfo.days_off[0]){
                   if(editSchedulingInfo.schedule_days[i].toLowerCase() == key.toLowerCase().substr(0,3)){
                        editSchedulingInfo.days_off[0][key] = true;
                    }
                }
            }
            console.log("editSchedulingInfo",this.scheduleType,JSON.stringify(editSchedulingInfo));
            this.addScheduleForAssetForm('1',editSchedulingInfo);
        }else if(sessionStorage.getItem('schedulingInfo')){
            let schedulingInfo: any = {};
            schedulingInfo = JSON.parse(sessionStorage.getItem('schedulingInfo'));
            this.personDetails = schedulingInfo.personDetails;
            this.assetDetails = schedulingInfo.assetDetails;
            this.scheduleType = schedulingInfo.scheduleType;
            this.isEdit = schedulingInfo.reqData.scheduling_id ? true : false;
            this.addScheduleForAssetForm('1',schedulingInfo.reqData);

        }else{
            this.addScheduleForAssetForm('0');
        }

        if(this.scheduleType == 'indefinitely'){
            this.removeScheduleValidator();
        }
        if(this.scheduleFor == 'Asset'){
            this.asset_name.setValidators([Validators.required]);
            //this.assign_name.setValidators([Validators.required]);
            this.asset_name.updateValueAndValidity();
            //this.assign_name.updateValueAndValidity();

        }else{
            this.staff_name.setValidators([Validators.required]);
            this.staff_name.updateValueAndValidity();
        }
    }

    getAssetList(){
        let self = this;
        try{
            // getAssetsList
            this.http.doGet('assets', function(error: boolean, response: any){
                self.util.hideProcessing('processing-spinner');
                if( error ){
                    self.assetList = [];
                }else{
                    self.assetList = [];
                    //self.assetList = response.data;
                    for(let i=0; i<response.data.length; i++){
                        self.assetList.push(response.data[i].data);
                    }
                    console.log("assetList",response.data,self.assetList);
                }
                self.filteredAssets = self.asset_name.valueChanges.pipe(startWith(''),map(value => self.assetFilter(value)));
            });
        }catch(err){
            this.global.addException('Assets List','getAssetList()',err);
        }
    }
    getSelectedAsset(asset, event:any): void {
        if(event.isUserInput){
            this.assetDetails = asset;
            console.log("assetDetails",this.assetDetails);
            this.asset_id.setValue(asset.asset_id);
        }
    }
    clearSelAsset(){
        this.assetDetails = null;
    }
    private assetFilter(value: string): string[] {
        return this.assetList.filter(option => option.short_tag.toLowerCase().includes(value ? value.toLowerCase() : ''));
    }
    public validateAsset(event: any) {
        try {
            if (event.target.value != '') {
                let asset = event.target.value;
                let match = this.assetList.filter(item => item.short_tag.toLowerCase() == asset.toLowerCase());
                console.log(match);
                if (asset == '') {
                    this.asset_id.setValue('');
                    this.assetDetails = null;
                    return;
                }
                if (match.length > 0) {
                    this.asset_id.setValue(match[0].asset_id);
                    this.asset_name.setValue(match[0].short_tag);
                    this.assetDetails = match[0];
                }
            }
        } catch (err) {
            this.global.addException('add Schedule', 'validateAsset()', err);
        }
    }

    getEmployeeList(){
        let self = this;
        try{
            this.http.doGet('getEmployee', function(error: boolean, response: any){
                self.util.hideProcessing('processing-spinner');
                if( error ){
                    self.empList = [];
                }else{
                    self.empList = [];
                    //self.empList = response.data;
                    for(let i=0; i<response.data.length; i++){
                        response.data[i].employee_info.emp_name = response.data[i].employee_info.first_name +' '+response.data[i].employee_info.last_name;
                        self.empList.push(response.data[i].employee_info);
                    }
                    console.log("empList",response.data,self.empList);
                }
                 self.filteredEmployee = self.staff_name.valueChanges.pipe(startWith(''),map(value => self.empFilter(value)));

            });
        }catch(err){
            this.global.addException('Employee List','getEmployeeList()',err);
        }
    }
    getSelectedEmp(emp,event:any): void {
        if(event.isUserInput){
            console.log(emp);
            if(this.scheduleFor == 'Person'){
                this.staff_id.setValue(emp.id);
                this.personDetails = emp;
            }else{
                this.assign_to.setValue(emp.id);
            }
        }
    }
    clearSelEmp(){
        this.personDetails = null;
    }
    private empFilter(value: string): string[] {
        return this.empList.filter(option => option.emp_name.toLowerCase().includes(value ? value.toLowerCase() : ''));
    }
    public validateEmp(event: any) {
        try {
            let asset = event.target.value;
            let match = this.empList.filter(item => item.emp_name.toLowerCase() == asset.toLowerCase());
            console.log(match);
            if (asset == '') {
                this.assign_to.setValue('');
                this.personDetails = null;
                return;
            }
            if (match.length > 0) {
                if (this.scheduleFor == 'Person') {
                    this.staff_id.setValue(match[0].id);
                    this.staff_name.setValue(match[0].emp_name);
                    this.personDetails = match[0];
                } else {
                    this.assign_to.setValue(match[0].id);
                    this.assign_name.setValue(match[0].emp_name);
                }
            }
        } catch (err) {
            this.global.addException('add Schedule -Validate emp', 'validateEmp()', err);
        }
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
                 self.filteredScheduleRepeat = self.schedule_repeat_name.valueChanges.pipe(startWith(''),map(value => self.repeatFilter(value)));

            });
        }catch(err){
            this.global.addException('Schedule Repeat List','getScheduleRepeatList()',err);
        }
    }
    getSelectedRepeat(repeat,event:any): void {
        if(event.isUserInput){
            console.log(repeat);
            this.schedule_repeat.setValue(repeat.type_id);
        }
    }
    private repeatFilter(value: string): string[] {
        return this.repeatList.filter(option => option.status.toLowerCase().includes(value ? value.toLowerCase() : ''));
    }
    public validateRepeat(event: any) {
        try {
            let repeat = event.target.value;
            let match = this.empList.filter(item => item.status.toLowerCase() == repeat.toLowerCase());
            console.log(match);
            if (repeat == '') {
                this.schedule_type.setValue('');
                return;
            }
            if (match.length > 0) {
                this.schedule_type.setValue(match[0].type_id);
                this.schedule_repeat_name.setValue(match[0].status);
            }
        } catch (err) {
            this.global.addException('add Schedule -Validate repeat', 'validateRepeat()', err);
        }
    }
    public changeSchedule(type) {
        try {
            this.scheduleType = type;
            if (this.scheduleType == 'indefinitely') {
                this.removeScheduleValidator();
            } else if (this.scheduleType == 'recurring') {
                this.removeScheduleValidator();
                this.addScheduleValidator();
                this.schedule_days.setValue([]);
                this.schedule_repeat_name.setValue('');
                this.schedule_repeat.setValue('');
                this.end_after_occurences.setValue('');
                this.days_off.at(0).setValue({ "monday": false, "tuesday": false, "wednesday": false, "thursday": false, "friday": false, "saturday": false, "sunday": false });
            } else {
                this.removeScheduleValidator();
                this.addScheduleValidator();
            }
            this.submitted = false;
        } catch (err) {
            this.global.addException('Change Schedule', 'changeSchedule()', err);
        }
    }
    addScheduleValidator() {
        try {
            this.start_date.setValidators([Validators.required]);
            this.end_date.setValidators([Validators.required]);
            this.start_time.setValidators([Validators.required, Validators.pattern(this.constant.TIME_PATTERN)]);
            this.end_time.setValidators([Validators.required, Validators.pattern(this.constant.TIME_PATTERN)]);

            this.start_date.updateValueAndValidity();
            this.end_date.updateValueAndValidity();
            this.start_time.updateValueAndValidity();
            this.end_time.updateValueAndValidity();
        } catch (err) {
            this.global.addException('Schedule Validator', 'addScheduleValidator()', err);
        }
    }
    removeScheduleValidator(){
        try{
        this.start_date.setValue('');
        this.end_date.setValue('');
        this.start_time.setValue('');
        this.end_time.setValue('');
        this.start_time_format.setValue('am');
        this.end_time_format.setValue('am');
        this.start_date.setValidators([]);
        this.end_date.setValidators([]);
        this.start_time.setValidators([Validators.pattern(this.constant.TIME_PATTERN)]);
        this.end_time.setValidators([Validators.pattern(this.constant.TIME_PATTERN)]);
        this.end_after_occurences.setValidators([Validators.min(1), Validators.max(52)]);

        this.start_date.updateValueAndValidity();
        this.end_date.updateValueAndValidity();
        this.start_time.updateValueAndValidity();
        this.end_time.updateValueAndValidity();
        this.end_after_occurences.updateValueAndValidity();
        }catch (err) {
            this.global.addException('Schedule Validator - remove', 'removeScheduleValidator()', err);
        }
    }
    startDateChange(event){
        this.end_date.setValue('');
        this.clearEndTime();
    }
    clearEndTime(){
        this.end_time.setValue('');
        this.timeNowError = false;
    }
    changeOccrence(type) {
        //this.EndDateType = type;
        try {
            this.is_after = false;
            if (type == 'after') {
                this.is_after = true;
                this.end_date.setValidators([]);
            } else {
                this.end_date.setValidators([Validators.required]);
            }

            this.end_after_occurences.setValue('');
            this.end_date.setValue('');
        } catch (err) {
            this.global.addException('Add Schedule - Change occurrences', 'changeOccrence()', err);
        }
    }

    addScheduleForAssetForm(option, formVal:any = {}){
        this.scheduleForAssetForm = this.fb.group({
            scheduling_id: new FormControl(option == '0' ? '' : formVal.scheduling_id,[]),
            scheduling_type: new FormControl(option == '0' ? '' : formVal.scheduling_type,[]),
            asset_id: new FormControl(option == '0' ? '' : formVal.asset_id,[]),
            asset_name: new FormControl(option == '0' ? '' : formVal.asset_name,[]),
            assign_to: new FormControl(option == '0' ? '' : formVal.assign_to,[]),
            assign_name: new FormControl(option == '0' ? '' : formVal.assign_name,[]),
            staff_id: new FormControl(option == '0' ? '' : formVal.staff_id,[]),
            staff_name: new FormControl(option == '0' ? '' : formVal.staff_name,[]),
            schedule_type: new FormControl(option == '0' ? '' : formVal.schedule_type,[]),
            schedule_repeat: new FormControl(option == '0' ? '' : formVal.schedule_repeat,[]),
            schedule_repeat_name: new FormControl(option == '0' ? '' : formVal.schedule_repeat_name,[]),
            start_date: new FormControl(option == '0' ? '' : this.util.getTimeZoneDate(formVal.start_date),[Validators.required]),
            end_date: new FormControl(option == '0' ? '' : this.util.getTimeZoneDate(formVal.end_date),[Validators.required]),
            start_time: new FormControl(option == '0' ? '' : formVal.start_time ? formVal.start_time.substring(0,5) : '',[Validators.required, Validators.pattern(this.constant.TIME_PATTERN)]),
            end_time: new FormControl(option == '0' ? '' : formVal.end_time ? formVal.end_time.substring(0,5) : '',[Validators.required, Validators.pattern(this.constant.TIME_PATTERN)]),
            start_time_format: new FormControl(option == '0' ? 'am' : formVal.start_time_format,[]),
            end_time_format: new FormControl(option == '0' ? 'am' : formVal.end_time_format,[]),
            schedule_days: new FormControl(option == '0' ? [] : formVal.schedule_days,[]),
            days_off: this.fb.array([]),
            //end_after_occurences: new FormControl(option == '0' ? '' : formVal.end_after_occurences,[Validators.min(1), Validators.max(52)]),
            end_after_occurences: new FormControl(option == '0' ? '' : formVal.end_after_occurences),
            details: new FormControl(option == '0' ? '' :formVal.details ,[]),
            schedule_both: new FormControl(option == '0' ? '1' : formVal.schedule_both )
        });
        option == '1' ? this.addDaysOff('1',formVal.days_off[0]) : this.addDaysOff('0');
        if(option == '1'){ this.minDate = new Date(formVal.start_date); }
    }

    get scheduling_type() { return this.scheduleForAssetForm.get('scheduling_type'); }
    get asset_id() { return this.scheduleForAssetForm.get('asset_id'); }
    get asset_name() { return this.scheduleForAssetForm.get('asset_name'); }
    get assign_to() { return this.scheduleForAssetForm.get('assign_to'); }
    get assign_name() { return this.scheduleForAssetForm.get('assign_name'); }
    get staff_id() { return this.scheduleForAssetForm.get('staff_id'); }
    get staff_name() { return this.scheduleForAssetForm.get('staff_name'); }
    get schedule_type() { return this.scheduleForAssetForm.get('schedule_type'); }
    get schedule_repeat() { return this.scheduleForAssetForm.get('schedule_repeat'); }
    get schedule_repeat_name() { return this.scheduleForAssetForm.get('schedule_repeat_name'); }
    get start_date() { return this.scheduleForAssetForm.get('start_date'); }
    get end_date() { return this.scheduleForAssetForm.get('end_date'); }
    get start_time() { return this.scheduleForAssetForm.get('start_time'); }
    get end_time() { return this.scheduleForAssetForm.get('end_time'); }
    get start_time_format() { return this.scheduleForAssetForm.get('start_time_format'); }
    get end_time_format() { return this.scheduleForAssetForm.get('end_time_format'); }
    get schedule_days() { return this.scheduleForAssetForm.get('schedule_days'); }
    get days_off(): FormArray{ return <FormArray>this.scheduleForAssetForm.get('days_off') as FormArray; };
    get end_after_occurences() { return this.scheduleForAssetForm.get('end_after_occurences'); }
    get details() { return this.scheduleForAssetForm.get('details');}

    compareendtime(event) {
        try {
            //console.log(index)
            this.timeNowError = false;
            //console.log(this.schedule_items.at(index).get('start_date').value);
            let startDate = new Date(this.start_date.value);
            let startDateDay = startDate.getDate();
            let startDateMonth = startDate.getMonth();
            let startDateYear = startDate.getFullYear();

            let startDatestring = new Date(String(startDateYear) + '-' + String(startDateMonth) + '-' + String(startDateDay) + " " + this.start_time.value + " " + this.start_time_format.value);

            let endDate = new Date(this.end_date.value);
            let endDateDay = endDate.getDate();
            let endDateMonth = endDate.getMonth();
            let endDateYear = endDate.getFullYear();

            let endDatestring = new Date(String(endDateYear) + '-' + String(endDateMonth) + '-' + String(endDateDay) + " " + this.end_time.value + " " + this.end_time_format.value);

            //console.log(startDatestring.getTime(), endDatestring.getTime(), endDatestring, startDatestring);
            this.timeNowError = startDatestring.getTime() > endDatestring.getTime() ? true : false;
        } catch (err) {
            this.global.addException('Add Scheduling', 'compareendtime()', err);
        }
    }

    addDaysOff(option, valObj: any = {}){
        try{
            this.days_off.push(new FormGroup({
                monday: new FormControl(option == '1' ? valObj.monday : false),
                tuesday: new FormControl(option == '1' ? valObj.tuesday : false),
                wednesday: new FormControl(option == '1' ? valObj.wednesday : false),
                thursday: new FormControl(option == '1' ? valObj.thursday : false),
                friday: new FormControl(option == '1' ? valObj.friday : false),
                saturday: new FormControl(option == '1' ? valObj.saturday : false),
                sunday: new FormControl(option == '1' ? valObj.sunday : false)
            }));
        }catch(err){
            this.global.addException('add Scheduling','addDaysOff()',err);
        }
    }

    next(action): void {
        this.submitted = true;
        console.log(this.scheduleForAssetForm);
        console.log(this.scheduleForAssetForm.valid,this.scheduleForAssetForm.value);
        if(this.scheduleForAssetForm.valid && !this.timeNowError){
            this.util.addSpinner('next-btn', "Next");
            let reviewObj:any = {};
            let generated_at = new Date();
            reviewObj.reqData = JSON.parse(JSON.stringify(this.scheduleForAssetForm.value));
            reviewObj.reqData.start_date = this.util.getYYYYMMDDDate(reviewObj.reqData.start_date);
            reviewObj.reqData.end_date = this.util.getYYYYMMDDDate(reviewObj.reqData.end_date);
            reviewObj.reqData.generated_at = this.util.getYYYYMMDDDate(generated_at);
            reviewObj.reqData.scheduling_type = this.scheduleFor == 'Asset' ? 1 : 2;
            reviewObj.reqData.schedule_type = this.scheduleType == 'once' ? 1 : this.scheduleType == 'indefinitely' ? 3 : 2;
            reviewObj.assetDetails = this.assetDetails;
            reviewObj.personDetails = this.personDetails;
            reviewObj.scheduleType = this.scheduleType;
            reviewObj.reqData.schedule_days = [];
            reviewObj.reqData.schedule_repeat_name ='';
            reviewObj.reqData.schedule_repeat ='';
            reviewObj.reqData.end_after_occurences ='';
            if(this.scheduleType == 'recurring'){
                reviewObj.reqData.schedule_repeat_name = this.scheduleForAssetForm.value.schedule_repeat_name;
                reviewObj.reqData.schedule_repeat = this.scheduleForAssetForm.value.schedule_repeat;
                reviewObj.reqData.end_after_occurences = this.scheduleForAssetForm.value.end_after_occurences;

                for (let key in reviewObj.reqData.days_off[0]){
                   if(reviewObj.reqData.days_off[0][key] === true){
                        reviewObj.reqData.schedule_days.push(key.charAt(0).toUpperCase() + key.slice(1).substr(0,2));
                    }
                }
            }else{
                reviewObj.reqData.days_off = [{"monday":false,"tuesday":false,"wednesday":false,"thursday":false,"friday":false,"saturday":false,"sunday":false}];
            }
            if(this.scheduleType == 'indefinitely'){
                reviewObj.reqData.start_time_format = '';
                reviewObj.reqData.end_time_format = '';
            }
            console.log("reviewObj",JSON.stringify(reviewObj));
            sessionStorage.setItem('schedulingInfo',JSON.stringify(reviewObj));
            sessionStorage.removeItem('editSchedulingInfo');

            this.checkAssignedWO(action);
            // this.router.navigate(['/workflow/schedule/csa/schedule-review/'+btoa(action)]);
        }
    }


    checkAssignedWO(action): void {
        try {
            let self = this;
            let reqObj = {
                'type': this.scheduleFor.toLowerCase(),
                'type_id': this.scheduleFor == 'Asset' ? this.scheduleForAssetForm.value.asset_id : this.scheduleForAssetForm.value.staff_id,
                'start_date': this.util.getYYYYMMDDDate(this.scheduleForAssetForm.value.start_date),
                'end_date': this.util.getYYYYMMDDDate(this.scheduleForAssetForm.value.end_date),
                'start_time': this.scheduleForAssetForm.value.start_time,
                'start_time_format': this.scheduleForAssetForm.value.start_time_format,
                'end_time': this.scheduleForAssetForm.value.end_time,
                'end_time_format': this.scheduleForAssetForm.value.end_time_format
            }

            this.http.doPost('check-work-orders', reqObj, function (error: boolean, response: any) {
                self.util.removeSpinner('next-btn', "Next");
                if (error) {
                    console.log(error);
                } else {
                    console.log("getScheduleRepeatList", response);
                    if (response.data.work_orders.length == 0 && ((self.scheduleFor == 'Asset' && response.data.persons.length == 0) || (self.scheduleFor == 'Person' && response.data.assets.length == 0))) {
                        self.router.navigate(['/workflow/schedule/csa/schedule-review/' + btoa(action)]);
                    } else {
                        let resourceName = self.scheduleFor == 'Asset' ? self.scheduleForAssetForm.value.asset_name : self.scheduleForAssetForm.value.staff_name;
                        let msgStr = response.data.work_orders.length > 0 ? 'work orders' : '';
                        msgStr = self.scheduleFor == 'Asset' && response.data.persons.length > 0 ? response.data.work_orders.length > 0 ? msgStr + '/persons' : msgStr + 'persons' : msgStr;
                        msgStr = self.scheduleFor == 'Person' && response.data.assets.length > 0 ? response.data.work_orders.length > 0 ? msgStr + '/assets' : msgStr + 'assets' : msgStr;
                        self.util.showDialog(ScheduleDialogComponent, resourceName + " is assigned to the following " + msgStr + ":", ['/workflow/schedule/csa/schedule-review/' + btoa(action)], "Scheduling Confirmation", "CONFIRMATION_WITH_WARNING", { 'type': self.scheduleFor, 'details': response.data });
                    }
                }
            });
        } catch (err) {
            this.global.addException('Assign Work order', 'checkAssignedWO()', err, { 'API': 'check-work-orders|POST', 'APIRequest': this.scheduleForAssetForm.value });
        }
    }
}
