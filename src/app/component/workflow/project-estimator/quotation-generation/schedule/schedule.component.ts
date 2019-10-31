import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, NativeDateAdapter  } from '@angular/material';
import { Router } from '@angular/router';
import { FormControl, FormGroupDirective, NgForm, Validators, FormGroup, FormBuilder, FormArray } from '@angular/forms';

import { Observable, Subscription } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { GlobalService } from '../../../../../shared/service/global.service';
import { UtilService } from '../../../../../shared/service/util.service';
import { HttpService } from '../../../../../shared/service/http.service';
import { AdminService } from '../../../../admin/admin.service';
import { ConstantsService } from '../../../../../shared/service/constants.service';
import { ProjectEstimatorService } from '../../project-estimator.service';
import { element } from '../../../../../../../node_modules/protractor';

@Component({
	selector: 'app-schedule',
	templateUrl: './schedule.component.html',
	styleUrls: ['../quotation-generation.component.css', './schedule.component.scss']
})
export class ScheduleComponent implements OnInit {
    //scheduleType: string = 'once';
    scheduleType: string = 'not_known';
    EndDateType : string = '';
    is_after:boolean = false;
	scheduleForm: FormGroup;
    submitted:boolean = false;
    startTimeNow:any = '';
    public repeatList:any[] = [];
    public empList:any[] = [];
    filteredScheduleRepeat: Observable<string[]>;
    timeNowError:boolean = false;
    pageData: any = { 'scheduleType': [] };
    public minDate = new Date();
    public today = new Date();
    mapTypeId: string;
    showMap: boolean = false;
    subscription: Subscription;
	constructor(
		private fb: FormBuilder,
		private constant: ConstantsService,
		public util: UtilService,
	    public http: HttpService,
	    public global: GlobalService,
	    public dialog: MatDialog,
        public router: Router,
        private admin: AdminService,
        private PEService: ProjectEstimatorService
	) {

		this.createForm('0');

	}

	ngOnInit() {
        this.mapTypeId = 'roadmap';
        this.showMap = this.PEService.locationDetails.latitude && this.PEService.locationDetails.longitude && this.PEService.locationDetails.latitude != '' && this.PEService.locationDetails.longitude ? true : false;
        this.util.showProcessing('processing-spinner');
        this.getPEScheduleType();
        this.getPEScheduleRepeatType();
        this.getScheduleRepeatList();
        //console.log("schedule:"+JSON.stringify(this.PEService.projectEstimatorData.scheduleDetails));
        this.subscription = this.util.changeDetection.subscribe(dataObj => {
            if(dataObj && dataObj.source == 'QUOTATION_GENERATION' && dataObj.action == 'ADD_SCHEDULE'){
                this.reviewSchedule();
            }
        });

    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

    setMapType(mapTypeId: string) { this.mapTypeId = mapTypeId; }

    getScheduleRepeatList() {
        let self = this;
        this.http.doGet('getCommonStatus/SCHEDULE_REPEAT', function (error: boolean, response: any) {
            self.util.hideProcessing('processing-spinner');
            if (error) {
                self.repeatList = [];
            } else {
                self.repeatList = [];
                self.repeatList = response.data.statusList;
                console.log("getScheduleRepeatList", response.data, self.repeatList);
            }
            if (self.schedule_items.length > 0)
                self.filteredScheduleRepeat = self.schedule_items.at(1).get('schedule_repeat_name').valueChanges.pipe(startWith(''), map(value => self.repeatFilter(value)));

        });
    }
    getSelectedRepeat(repeat,event:any): void {
        if(event.isUserInput){
            console.log(repeat);
            if(this.schedule_items.length>0)
                this.schedule_items.at(1).get('schedule_repeat').setValue(repeat.type_id);
        }
    }
    private repeatFilter(value: string): string[] {
        //console.log(value,this.repeatList);
        return this.repeatList.filter(option => option.status.toLowerCase().includes(value ? value.toLowerCase() : ''));
    }
    public validateRepeat(event:any){
        let repeat = event.target.value;
        let match = this.empList.filter(item=>item.status.toLowerCase() == repeat.toLowerCase());
        console.log(match);
        if(repeat == ''){
            //this.schedule_items.at(1).get('schedule_type').setValue('');
            return;
        }
        if(match.length > 0){
           // this.schedule_type.setValue(match[0].type_id);
           //this.schedule_items.at(1).get('schedule_type').setValue(match[0].type_id);
           this.schedule_items.at(1).get('schedule_repeat_name').setValue(match[0].status);
        }
    }

    getPEScheduleType(): void {
        let self = this;
        this.http.doGet('getCommonStatus/PE_SCHEDULE_TYPE', function(error: boolean, response: any){
            self.util.hideProcessing('processing-spinner');
            if( error ){

            }else{
                self.pageData.scheduleType = response.data.statusList;
                if(self.PEService.projectEstimatorData.project_estimate_id){
                    self.minDate = self.PEService.projectEstimatorData.schedules ? new Date(self.PEService.projectEstimatorData.schedules.start_date) : new Date();
                }
                for (var i = 0; i < self.pageData.scheduleType.length ; i++) {
                    if(self.PEService.projectEstimatorData.scheduleDetails && (self.pageData.scheduleType[i].type_id == self.PEService.projectEstimatorData.scheduleDetails.schedule_type)){
                        //console.log("Date"+self.PEService.projectEstimatorData.scheduleDetails.start_date.toString().indexOf('/'));
                        if(self.PEService.projectEstimatorData.scheduleDetails.start_date.toString().indexOf('/') > -1)
                            self.PEService.projectEstimatorData.scheduleDetails.start_date = self.util.stringToDate(self.PEService.projectEstimatorData.scheduleDetails.start_date);
                        if(self.PEService.projectEstimatorData.scheduleDetails.end_date.toString().indexOf('/') > -1)
                            self.PEService.projectEstimatorData.scheduleDetails.end_date = self.util.stringToDate(self.PEService.projectEstimatorData.scheduleDetails.end_date);
                            // self.scheduleType = self.PEService.projectEstimatorData.scheduleDetails.schedule_type=='1'?'once':self.PEService.projectEstimatorData.scheduleDetails.schedule_type=='2'?'reccuring':'now';

                            self.scheduleType = self.PEService.projectEstimatorData.scheduleDetails.schedule_type=='1'?'once':self.PEService.projectEstimatorData.scheduleDetails.schedule_type=='4'?'not_known':'now';

                        if(self.PEService.projectEstimatorData.scheduleDetails.schedule_type==2){
                            let schedule_days =  Array.isArray(self.PEService.projectEstimatorData.scheduleDetails.schedule_days) ? self.PEService.projectEstimatorData.scheduleDetails.schedule_days : self.PEService.projectEstimatorData.scheduleDetails.schedule_days.split(',');

                             self.PEService.projectEstimatorData.scheduleDetails.schedule_days=[];
                                 schedule_days.forEach((element,key) => {
                                    self.PEService.projectEstimatorData.scheduleDetails.schedule_days[element.trim()]= true;
                                 });

                            self.PEService.projectEstimatorData.scheduleDetails.schedule_days =   Object.assign({}, self.PEService.projectEstimatorData.scheduleDetails.schedule_days);
                        }
                        self.PEService.projectEstimatorData.scheduleDetails.schedule_repeat_details = self.PEService.projectEstimatorData.scheduleDetails.schedule_repeat_name && self.PEService.projectEstimatorData.scheduleDetails.schedule_repeat ? {'type_id':self.PEService.projectEstimatorData.scheduleDetails.schedule_repeat,'status':self.PEService.projectEstimatorData.scheduleDetails.schedule_repeat_name}:self.PEService.projectEstimatorData.scheduleDetails.schedule_repeat_details;

                        console.log(self.PEService.projectEstimatorData.scheduleDetails.schedule_days);
                        self.addScheduleItem('1', self.pageData.scheduleType[i], self.PEService.projectEstimatorData.scheduleDetails);
                         self.is_after =  !self.PEService.projectEstimatorData.scheduleDetails.end_date ? true : false;
                    }else{
                        self.addScheduleItem('0', self.pageData.scheduleType[i]);
                    }
                }
            }
        });
    }

    getPEScheduleRepeatType(): void {
        let self = this;
        this.http.doGet('getCommonStatus/SCHEDULE_REPEAT', function(error: boolean, response: any){
            self.util.hideProcessing('processing-spinner');
            if( error ){}else{
                self.pageData.scheduleRepeatType = response.data.statusList;

            }
        });
    }
	public changeSchedule(type){

        this.scheduleType = type;
        this.timeNowError = false;

        // if(this.scheduleType == 'once'){
        //     this.schedule_items.at(0).get('schedule_type').setValue(1);
        //     this.schedule_items.at(0).get('schedule_type_name').setValue('Once');
        //     this.schedule_items.at(0).get('start_date').setValue('');
        //     this.schedule_items.at(0).get('end_date').setValue('');
        // }
        // if(this.scheduleType == 'reccuring'){
        //     this.schedule_items.at(0).get('schedule_type').setValue(2);
        //     this.schedule_items.at(0).get('schedule_type_name').setValue('Recurring');
        //     this.schedule_items.at(0).get('start_date').setValue('');
        //     this.schedule_items.at(0).get('end_date').setValue('');
        // }
        if(this.scheduleType == 'now'){
            // this.schedule_items.at(0).get('schedule_type').setValue(3);
            // this.schedule_items.at(0).get('schedule_type_name').setValue('Now');
            this.schedule_items.at(this.schedule_items.length - 2).get('start_date').setValue(this.today);
            this.schedule_items.at(this.schedule_items.length - 2).get('end_date').setValue(this.today);
            this.showMap = this.PEService.locationDetails.latitude && this.PEService.locationDetails.longitude && this.PEService.locationDetails.latitude != '' && this.PEService.locationDetails.longitude ? true : false;
            this.getCurrentTime();
        }
        //console.log("schedule_items",type,this.schedule_items);
    }

    getCurrentTime(){
    //  *** @mohini start *** //
        let date = new Date();

        // let currentDate = new Date();
        // let currentTime = ((currentDate.getHours() > 12 ? (currentDate.getHours() - 12) : currentDate.getHours()) < 10 ? '0' : '') +(currentDate.getHours() > 12 ? (currentDate.getHours() - 12) : currentDate.getHours()) +':'+ (currentDate.getHours() < 10 ? '0' : '')+ (currentDate.getMinutes() < 10  ? '0'+currentDate.getMinutes() : currentDate.getMinutes());
        // this.schedule_items.at(this.schedule_items.length - 2).get('start_time').setValue(currentTime);
        // this.schedule_items.at(this.schedule_items.length - 2).get('end_time').setValue(currentTime);

        // this.schedule_items.at(this.schedule_items.length - 2).get('start_time_format').setValue(currentDate.getHours() > 12 ? 'pm' : 'am');
        // this.schedule_items.at(this.schedule_items.length - 2).get('end_time_format').setValue(currentDate.getHours() > 12 ? 'pm' : 'am');


        var hours = date.getHours();
        var minutes = date.getMinutes();
        var minutesStr;
        var hoursStr;
        var ampm = hours >= 12 ? 'pm' : 'am';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        hoursStr = hours < 10 ? '0'+hours: hours;
        minutesStr = minutes < 10 ? '0'+minutes : minutes;
        var strTime = hoursStr + ':' + minutesStr + ' ' + ampm;
        var hM  = hoursStr + ':' + minutesStr ;
          this.schedule_items.at(this.schedule_items.length - 2).get('start_time').setValue(hM);
        this.schedule_items.at(this.schedule_items.length - 2).get('end_time').setValue(hM);

        this.schedule_items.at(this.schedule_items.length - 2).get('start_time_format').setValue(ampm);
        this.schedule_items.at(this.schedule_items.length - 2).get('end_time_format').setValue(ampm);
    //  *** @mohini end *** //


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
	createForm(option, val:any = {}){
  		this.scheduleForm = this.fb.group({
            schedule_items: this.fb.array([]),
            //schedule_days : this.fb.array([])
        });

  	};
    get schedule_items(): FormArray{ return <FormArray>this.scheduleForm.get('schedule_items') as FormArray; };
    get schedule_days(): FormArray{  return <FormArray>this.scheduleForm.get('schedule_items.schedule_days') as FormArray; };

    addScheduleItem(option, masterVal:any = {}, formVal:any = {}){
        console.log("formval",formVal);
       try{
            this.schedule_items.push(this.fb.group({
                schedule_type_name: new FormControl(masterVal.status, [ ]), //Only for edit
                schedule_type: new FormControl(masterVal.type_id, [ ]), //Only for edit
                schedule_repeat: new FormControl(option == '0' ? '' : formVal.schedule_repeat_details ? formVal.schedule_repeat_details.type_id:'' ), //Only for edit
                start_date: new FormControl(option == '0' ? '' : formVal.start_date != '' ?  this.util.getTimeZoneDate(formVal.start_date) : ''), //Only for review
                //start_date: new FormControl(option == '0' ? '' : this.util.getYYYYMMDDDate(this.util.stringToDate(formVal.start_date)) ), //Only for review
                schedule_repeat_name :  new FormControl(option == '0' ? '' : formVal.schedule_repeat_details?formVal.schedule_repeat_details.status:''),
                end_date: new FormControl(option == '0' ? '' : formVal.end_date != '' ?   this.util.getTimeZoneDate(formVal.end_date) : ''),
                //end_date: new FormControl(option == '0' ? '' : this.util.getYYYYMMDDDate(this.util.stringToDate(formVal.end_date)) ),
                start_time: new FormControl(option == '0' ? '' : formVal.start_time ? formVal.start_time.substring(0,5) : '',[] ), //Only for review   // Validators.pattern(this.constant.TIME_PATTERN)
                start_time_format: new FormControl(option == '0' ? 'am' : formVal.start_time_format),
                end_time: new FormControl(option == '0' ? '' : formVal.end_time ? formVal.end_time.substring(0,5) : '',[]), //  Validators.pattern(this.constant.TIME_PATTERN)
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
     	this.schedule_items.at(index).get('end_date').setValue('');
    }


    clearendtime(event,index){
        this.timeNowError = false;
        this.schedule_items.at(index).get('end_time').setValue('');
    }

    compareendtime(event,index){
        console.log(index)
        this.timeNowError = false;
        let startDate = new Date(this.schedule_items.at(index).get('start_date').value);
            let startDateDay = startDate.getDate();
            let startDateMonth = startDate.getMonth();
            let startDateYear = startDate.getFullYear();

            let startDatestring = new Date(String(startDateYear) + '-'+  String(startDateMonth) + '-'+  String(startDateDay) + " "+ this.schedule_items.at(index).get('start_time').value + " " + this.schedule_items.at(index).get('start_time_format').value);

        let endDate = new Date(this.schedule_items.at(index).get('end_date').value);
            let endDateDay = endDate.getDate();
            let endDateMonth = endDate.getMonth();
            let endDateYear = endDate.getFullYear();

            let endDatestring = new Date(String(endDateYear) + '-'+  String(endDateMonth) + '-'+  String(endDateDay) + " "+ this.schedule_items.at(index).get('end_time').value + " " + this.schedule_items.at(index).get('end_time_format').value);

                console.log(startDatestring.getTime(),endDatestring.getTime(),endDatestring,startDatestring);
                if(startDatestring.getTime() > endDatestring.getTime()){
                    this.timeNowError = true;
                }
                else{
                    this.timeNowError = false;
                }

    }


    reviewSchedule(){
        console.log(this.scheduleForm.value);
        try{
        let scIndex ;
        // scIndex =  this.scheduleType=='once' ? 0 :this.scheduleType=='reccuring' ? 1 : 2;
        // this.scheduleForm.value.schedule_items[scIndex].schedule_type_name = scIndex == 0 ? 'Once' : scIndex == 1 ?'Recurring' :'Now';
        scIndex =  this.scheduleType=='once' ? 0 :this.scheduleType=='now' ? 1 : 2;
        this.scheduleForm.value.schedule_items[scIndex].schedule_type_name = scIndex == 0 ? 'Once' : scIndex == 1 ?  'Now' : 'Not Known';
        //console.log(this.scheduleType);
        this.submitted = true;

            if(this.scheduleType== 'once' ){
                if(this.schedule_items.at(0).get('start_time').value != ''){
                    this.schedule_items.at(0).get('start_time').setValidators([Validators.required,Validators.pattern(this.constant.TIME_PATTERN)]);
                    this.schedule_items.at(0).get('start_time').updateValueAndValidity();
                }

                if(this.schedule_items.at(0).get('end_time').value != ''){
                    this.schedule_items.at(0).get('end_time').setValidators([Validators.required,Validators.pattern(this.constant.TIME_PATTERN)]);
                    this.schedule_items.at(0).get('end_time').updateValueAndValidity();
                }
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
           // console.log("repeat:"+this.schedule_items.at(0).get('schedule_repeat').value);
            // console.log(this.PEService.projectEstimatorData.scheduleDetails.schedule_days);
       console.log(this.scheduleForm , this.timeNowError)
        if(this.scheduleForm.valid && !this.timeNowError){
            //alert('hii');
            this.PEService.projectEstimatorData.scheduleDetails = JSON.parse(JSON.stringify(this.scheduleForm.value.schedule_items[scIndex])) ;
            //console.log(this.scheduleType)
            if(this.scheduleType=='reccuring'){
                this.PEService.projectEstimatorData.scheduleDetails.is_after = this.is_after;
                let arr = Object.keys(this.PEService.projectEstimatorData.scheduleDetails.schedule_days).map(key => ({type: key, value: this.PEService.projectEstimatorData.scheduleDetails.schedule_days[key]}));
                this.PEService.projectEstimatorData.scheduleDetails.schedule_days=[];
                //console.log(this.PEService.projectEstimatorData.scheduleDetails.schedule_days,arr);
                arr.forEach((element) => {
                if(element.value===true)
                        this.PEService.projectEstimatorData.scheduleDetails.schedule_days.push(element.type)
                });
                //this.PEService.projectEstimatorData.scheduleDetails.schedule_repeat =
            }
            else{
                this.PEService.projectEstimatorData.scheduleDetails.schedule_days=[];
            }
            this.PEService.projectEstimatorData.scheduleDetails.start_date = this.util.getDDMMYYYYDate(this.PEService.projectEstimatorData.scheduleDetails.start_date);
            this.PEService.projectEstimatorData.scheduleDetails.end_date = this.util.getDDMMYYYYDate(this.PEService.projectEstimatorData.scheduleDetails.end_date);
            this.PEService.updateFormStatus('scheduleFm', true);
            //console.log("projectEstimatorData",this.PEService.projectEstimatorData.scheduleDetails);
        }else{
           // delete
           //this.PEService.projectEstimatorData.scheduleDetails=null;
            this.PEService.updateFormStatus('scheduleFm', false);
        }
        //console.log(this.PEService.projectEstimatorData)
    }catch(err){
        this.global.addException('Schedule Review','reviewSchedule()',err);
    }
    }

}
