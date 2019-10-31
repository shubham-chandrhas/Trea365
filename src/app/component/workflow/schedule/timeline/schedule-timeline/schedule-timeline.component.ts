 /*** 
*    View:- schedule-timeline.html
*    Component:- ScheduleTimelineComponent => schedule-timeline.component.ts
*    Route:- '/workflow/schedule/csa/schedule-timeline' 
*
*    Analysis:- 1. Fetch all schedule details selected date range and create Schedule list to showing on the timeline.
*    Code Review:- Pending
*    TO DO:- 1. Event as per time duration
*    Note:- 
*    Programers:- Sylvia, Yogesh
***/ 

import { Component, ApplicationRef, ViewChild } from '@angular/core';
import { FormGroup, FormControl } from "@angular/forms";
import { Router, ActivatedRoute } from '@angular/router';
import { addDays, format, startOfToday } from "date-fns";
import * as _ from 'underscore';
// import { convertToLocalTime } from "date-fns-timezone";

import { Schedule } from "../models/schedule.model";
import { SCHEDULE } from "../mock-schedule";
import { UtilService } from '../../../../../shared/service/util.service';
import { scheduleRangeValidator } from '../schedule-range-validator.directive';
import { HttpService } from '../../../../../shared/service/http.service';

@Component({
  selector: 'app-schedule',
  templateUrl: './schedule-timeline.component.html',
  styleUrls: ['./schedule-timeline.component.scss']
})

export class ScheduleTimelineComponent {
  searchTxt;
  searchList;
  timelineList: any[] = [];
  backupList: any[] = [];
  schedule: Schedule;
  scheduleList: Schedule;
  displayDays: number = 3;
  timeZone: string = 'America/New_York';
  defaultStart: Date = startOfToday();
  defaultEnd: Date = addDays(this.defaultStart, 13);
  isAssetCheck: boolean = true;
  isEmployeesCheck: boolean = true;
  isSubcontractorsCheck: boolean = true;

  scheduleFilters = new FormGroup({
    startDate: new FormControl(this.defaultStart),
    endDate: new FormControl(this.defaultEnd)
  }, { validators: scheduleRangeValidator });

  constructor(
    public util:UtilService, 
    private route: ActivatedRoute, 
    private http: HttpService,
    private ref: ApplicationRef,
  ) {   
    this.getSchedulingTimeline();
  }

  /***
  *  1. This function used to fetch all schedules between the selected date range.
  *  2. API Endpoint:- getSchedulingTimeline/2019-04-01/2019-04-14
  *  3. @ Param start date in format of YYYY-MM-DD
  *  4. @ Param end date in format of YYYY-MM-DD 
  ***/ 
  getSchedulingTimeline(){
    let self = this;
    this.util.showProcessing('processing-spinner');
    this.http.doGet('getSchedulingTimeline/'+this.util.getYYYYMMDDDate(this.defaultStart)+'/'+this.util.getYYYYMMDDDate(this.defaultEnd), function(error: boolean, response: any){
      self.util.hideProcessing('processing-spinner');
      if( error ) {
        console.log(response.message);
      } else {
        self.timelineList = _.sortBy(response.data, 'name');
        self.backupList = JSON.parse(JSON.stringify(_.sortBy(response.data, 'name')));
        self.createSchduleList(self.defaultStart, self.defaultEnd);
      }
    });
  }

  ngOnInit() {
    this.util.menuChange({'menu':4,'subMenu':27});
    this.util.setWindowHeight();
    this.util.setPageTitle(this.route);
    this.util.changeDetection.subscribe(dataObj => {
        if (dataObj && dataObj.source == "DELETE_SCHEDULE") {
            this.getSchedulingTimeline();
            console.log("DELETE_SCHEDULE");
        }
    });
  }

  startDateChange(event){
    this.defaultStart = event;
    this.getSchedulingTimeline();
  }

  endDateChange(event){
    this.defaultEnd = event;
    this.getSchedulingTimeline();
  }

  checkAsset(event){
    //console.log(event.target.checked);  
    this.isAssetCheck = event.target.checked;
    this.createSchduleList(this.defaultStart, this.defaultEnd);
  }

  checkEmployees(event){
    this.isEmployeesCheck = event.target.checked;
    this.createSchduleList(this.defaultStart, this.defaultEnd);
  }

  checkSubcontractors(event){
    this.isSubcontractorsCheck = event.target.checked;
    this.createSchduleList(this.defaultStart, this.defaultEnd);
  }

  /***
  *  This function used to create 'Schedule' list as per model.
  ***/ 
  createSchduleList(start: Date, end: Date) {
    this.schedule = this.scheduleList = {
      start: new Date(start),
      end: new Date(end),
      resources: []
    }
    let list = this.timelineList;
    list.map(event => {
      if((event.type == 'asset' && this.isAssetCheck) || (event.type == 'Employee' && this.isEmployeesCheck) || (event.type == 'Sub Contractor' && this.isSubcontractorsCheck)){
        let eventArr: any[] = []
        if(event.events.length > 0){
            event.events.map(schedule => {
                let startDate = schedule.start_date.split('-');
                let startTime = schedule.start_time.split(':');
                let endDate = schedule.end_date.split('-');
                let endTime = schedule.end_time.split(':');
                console.log("startDate", parseInt(startDate[1]));
                let redirectURL = schedule.name.toLowerCase().indexOf('work order') > -1 ? '/workflow/wo/csa/work-order-list/'+schedule.wo_detail.work_order_id : '';
                eventArr.push({
                  start: new Date(parseInt(startDate[0]), parseInt(startDate[1])-1, parseInt(startDate[2]), parseInt(startTime[0]), parseInt(startTime[1])),
                  end: new Date(parseInt(endDate[0]), parseInt(endDate[1])-1, parseInt(endDate[2]), parseInt(endTime[0]), parseInt(endTime[1])),
                  name: schedule.name,
                  url: redirectURL,
                  type: schedule.type.toLowerCase(),
                  schedule: schedule.schedule,
                  wo_number:schedule.name.toLowerCase().indexOf('work order') > -1 ? schedule.wo_detail.work_order_no : null
                });
              });
        }
         
        console.log("eventArr", eventArr);
        this.scheduleList.resources.push({
          name: event.name,
          user: event.user,
          type: event.type == 'Sub Contractor' ? 'subcontractor' : event.type.toLowerCase(),
          events: eventArr
        }) 
      }  
    });
    console.log("this.scheduleList", this.scheduleList);
    this.schedule = JSON.parse(JSON.stringify(this.scheduleList));
    this.ref.tick();
    //this.schedule = SCHEDULE;     // This is mock json for testing
  }
  
  getSchedule(start: Date, end: Date) {
    //this.schedule = SCHEDULE;    // This is mock json for testing 
    this.createSchduleList(this.defaultStart, this.defaultEnd); 
    this.schedule.start = start;
    this.schedule.end = end;
  }

  getSearchTxt(txt){
    if(txt == ''){
      this.timelineList = JSON.parse(JSON.stringify(this.backupList)); 
      this.createSchduleList(this.defaultStart, this.defaultEnd);
    }
  }

  getSearchResult(){
    if(this.searchList && this.searchList != ''){
      this.timelineList = this.backupList.filter(item => item.name.toLowerCase().indexOf(this.searchList.toLowerCase()) > -1 ? true : false); 
      this.createSchduleList(this.defaultStart, this.defaultEnd);
      //self.timelineList = response.data;
      //self.backupList = JSON.parse(JSON.stringify(response.data));
    }
  };

  // required for native HTML date input; may not be needed for other datepickers
  formatForDateInput(date: Date) {
    return format(date, 'YYYY-MM-DD');
  }

  updateSchedule() {
    if (this.scheduleFilters.errors) {
      return
    }    
    // TODO: correct for timezone errors
    // Using new Date() because formatForDateInput() returns a string
    let startString = this.scheduleFilters.value.startDate;
    this.schedule.start = new Date(startString), {timeZone: this.timeZone};

    let endString = this.scheduleFilters.value.endDate;
    this.schedule.end = new Date(endString), {timeZone: this.timeZone};
  }

  setDisplayDays(days) {
    this.displayDays = days;
  }

  sortListEvent(order){
      console.log(order);
      this.timelineList = order == 'asc' ? _.sortBy(this.timelineList, 'name') : _.sortBy(this.timelineList, 'name').reverse();
      this.createSchduleList(this.defaultStart, this.defaultEnd);
  }
}
