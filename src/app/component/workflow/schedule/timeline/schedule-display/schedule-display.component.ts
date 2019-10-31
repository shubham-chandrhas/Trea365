import { Component, Input, AfterViewInit, Output, EventEmitter } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { addDays, differenceInMinutes, eachDay, endOfDay, format, startOfDay, startOfToday } from "date-fns";
import { Schedule } from '../models/schedule.model';
import { UtilService } from '../../../../../shared/service/util.service';
import { GlobalService } from "../../../../../shared/service/global.service";
import { ScheduleDialogComponent } from "../../schedule-dialog.component";
import { DialogComponent } from "../../../../../shared/model/dialog/dialog.component";
import { HttpService } from "../../../../../shared/service/http.service";

@Component({
  selector: 'app-schedule-display',
  templateUrl: './schedule-display.component.html',
  styleUrls: ['./schedule-display.component.scss']
})

export class ScheduleDisplayComponent implements AfterViewInit {

  //public wid = '220px';
  public wid = '260px';
  sortOrder = 'asc';
  selectedResource: any;
  public selectedPersonSchedule: any = "";
  public selectedAssetSchedule: any = "";
  public scheduleFor: any = "";
  
  @Input() schedule: Schedule;
  @Input() displayDays: number;  
  
  constructor(public util:UtilService, private route: ActivatedRoute, private global: GlobalService, public router: Router, private http: HttpService,) { 
    sessionStorage.removeItem("schedulingInfo");
    sessionStorage.removeItem("editSchedulingInfo");
  }

  @Output() childEvent = new EventEmitter();
  test(){
      this.childEvent.emit('this is a test');
  }

  ngOnInit() {
    let self = this;
    this.util.menuChange({'menu':4,'subMenu':27});
    this.util.setWindowHeight();
    this.util.setPageTitle(this.route);

    this.util.changeDetection.subscribe(dataObj => {
        if (dataObj && dataObj.source == "DELETE_SCHEDULE") {
            self.selectedResource =  null;
            dataObj.source == null;
            console.log("DELETE_SCHEDULE");
        }
    });

  }

  // doSomething(){
  //   this.ngOnInit();
  // }

  ngAfterViewInit() {
    this.fixFirstColumn();
  }

  getDates() {    
    //console.log("eachDay() ::", eachDay(this.schedule.start, this.schedule.end));
    return eachDay(this.schedule.start, this.schedule.end);
  }
  
  getHeaderDates() {
    let dates = this.getDates();
    return dates.map(date => format(date, 'MMM D YYYY'));
  }

  getHourVisibility() {
    return this.displayDays == 3 ? 'hidden' : 'visible';
  }
  
  getScheduleDuration() {
    let actualEnd = endOfDay(this.schedule.end)
    return differenceInMinutes(actualEnd, this.schedule.start);
  }

  getEventDuration(event) {
    return differenceInMinutes(event.end, event.start);
  }
  
  getEventStartOffset(event) {
    return differenceInMinutes(event.start, this.schedule.start);
  }
  
  setEventPos(event) {
    // we want event margin as percent of schedule width
   /*  console.log('getEventStartOffset====>',this.getEventStartOffset(event));
    console.log('getScheduleDuration====>',this.getScheduleDuration()); */
    let minWidth = this.getMinWidth();
    let hrs = this.getEventStartOffset(event)/60;
    let dayWidth = this.getDayWidth();
    let hrWidth = dayWidth/24;
    //console.log('hrs ====> ',event.name + ' ------------ hr: ' + hrWidth + ' -- day: '+dayWidth); 
    let eventoffset = hrs*hrWidth;
    //return eventoffset;
    return `${eventoffset}px`;
    //return (this.getEventStartOffset(event) / this.getScheduleDuration() *100);
  }
  
  setEventWidth(event) {
    // we want event width as percent of schedule width
    let eventWidthInMin = differenceInMinutes(event.end, event.start)/60;
    let dayWidth = this.getDayWidth();
    let hrWidth = dayWidth/24;
    let eventWidthPx = eventWidthInMin*hrWidth;
    return `${eventWidthPx}px`;
    //return this.getEventDuration(event) / this.getScheduleDuration() *100;
  }
  
  alignEventText(event) {
    let offset = this.getEventStartOffset(event);
    if ( offset < 0 ) {
      return offset / this.getScheduleDuration() * 100 * -1;
    } 
  }

  getDayWidth(){
    let days = this.displayDays;
    let boxWidth = document.querySelector('.ngsc-table-scroll').clientWidth;
    let colWidth = 210;
    let dayWidth = ((boxWidth - colWidth) / days);
    return dayWidth;
  }
  getMinWidth(){
    let days = this.displayDays;
    let boxWidth = document.querySelector('.ngsc-table-scroll').clientWidth;
    let colWidth = 0; 
    // let colWidth = document.querySelector('.ngsc-fixed-col').clientWidth; 
    let minWidth = ((boxWidth - colWidth) / days)/1440;
    return minWidth;
  }
  setDayWidth(days) {
    let boxWidth = document.querySelector('.ngsc-table-scroll').clientWidth;
    let colWidth = 210;   
    // let colWidth = document.querySelector('.ngsc-fixed-col').clientWidth;   
    //console.log(boxWidth + ' = ' + colWidth); 
    return `${((boxWidth - colWidth) / days)}px`;
  }

  // setDayWidth(days) {
  //   let boxWidth = document.querySelector('.ngsc-table-scroll').clientWidth;
  //   let colWidth = document.querySelector('.ngsc-fixed-col').clientWidth;
  //   setTimeout(() => {
  //       this.wid = (boxWidth - colWidth) / days+'px';
  //   }, 1000);
  //   //console.log(wid);
  //   return this.wid;
  // }
  
  fixFirstColumn() {
    let layer: any = document.querySelector('.ngsc-table').cloneNode(true);
    <any>document.querySelector('.ngsc-table-scroll').appendChild(layer).classList.add('cloned-col');
  }
  
  sortList(){
    this.sortOrder = this.sortOrder == 'asc' ? 'desc' : 'asc';
    this.childEvent.emit(this.sortOrder);
  }

  getSelectedResource(resource){
    try{
        let self = this;
        self.selectedResource = null;
        self.selectedResource = resource;
        console.log('selectedResource',self.selectedResource);
        // self.getAllList();
        setTimeout(function() {
            self.util.scrollDown('moreInfo');
        }, 1000);
    }
    catch (err) {
        //this.global.addException('SelectedWo', 'getSelectedWo()', err);
    }
  }

  addSchedule(option,selectedResource): void {
      console.log('selectedResource ==> ', selectedResource);
    try {
      this.router.navigate([
        "/workflow/schedule/csa/add-timeline-schedule/" + btoa(option) + "/" + (option == 'person' ? selectedResource.user.id : selectedResource.user.asset_id)
      ]);
    } catch (err) {
      this.global.addException("Timeline", "addSchedule()", err, {
        routeURL: "/workflow/schedule/csa/add-timeline-schedule/" + btoa(option) + "/" + (option == 'person' ? selectedResource.user.id : selectedResource.user.asset_id)
      });
    }
  }

  Edit(schedule,type) {
    try {
      if (type == 'Asset') {
        console.log("Asset", schedule.schedule);
        sessionStorage.setItem(
          "editSchedulingInfo",
          JSON.stringify(schedule.schedule)
        );
        this.router.navigate([
          "/workflow/schedule/csa/add-timeline-schedule/" + btoa("Asset") + '/' + this.selectedResource.user.asset_id
        ]);
      } else {
        console.log("Person", schedule.schedule);
        sessionStorage.setItem(
          "editSchedulingInfo",
          JSON.stringify(schedule.schedule)
        );
        this.router.navigate([
          "/workflow/schedule/csa/add-timeline-schedule/" + btoa("person") + '/' + this.selectedResource.user.id
        ]);
      }
    } catch (err) {
      this.global.addException("Schedule list - edit", "Edit()", err, {
        routeURL: "/workflow/schedule/csa/add-timeline-schedule/" + btoa("Asset")
      });
    }
  }

  deleteSchedule(schedule,scheduleFor): void {
    try {
      let reqObj;
      let self = this;
      var personORasset;
      self.scheduleFor = scheduleFor;
      reqObj = { scheduling_id: schedule.schedule.scheduling_id };
      if(self.scheduleFor == "Asset"){
        personORasset= schedule.schedule.asset_detail.short_tag?schedule.schedule.asset_detail.short_tag:'';
      }else{
        personORasset= schedule.schedule.first_name?schedule.schedule.first_name:'';
      }
      // alert(self.scheduleFor);
      sessionStorage.setItem(
        "deleteSchedulingInfo",
        JSON.stringify(schedule.schedule)
      );

      this.http.doPost("schedule/delete-check", reqObj, function(
        error: boolean,
        response: any
      ) {
        if (error) {
          console.log(error);
        } else {
          console.log("getSchedule === ", response.data);
          if (
            (self.scheduleFor == "Asset" &&
              response.data.persons.length == 0) ||
            (self.scheduleFor == "Person" && response.data.assets.length == 0)
          ) {
            let data: any = {
              API_URL: "schedule/delete",
              reqObj: {
                scheduling_id: reqObj.scheduling_id,
                delete_both: 0
              },
              event: {
                source: "DELETE_SCHEDULE",
                action: "DELETE"
              }
            };
            self.util.showDialog(
              DialogComponent,
              "Are you sure you want to delete schedule for "+personORasset+" ?",
              [
                "/workflow/schedule/csa/schedule-timeline"
              ],
              "Delete Confirmation",
              "CONFIRMATION",
              data
            );
            //self.router.navigate(["/workflow/schedule/csa/schedule-timeline"]);
          } else {
            let resourceName =
              self.scheduleFor == "Asset"
                ? schedule.schedule.asset_detail.short_tag
                : schedule.schedule.first_name;
            // let msgStr = response.data.work_orders.length > 0 ? 'work orders' : '';
            let msgStr = "";
            msgStr =
              self.scheduleFor == "Asset" && response.data.persons.length > 0
                ? msgStr + "persons"
                : msgStr;
            msgStr =
              self.scheduleFor == "Person" && response.data.assets.length > 0
                ? msgStr + "assets"
                : msgStr;
            // msgStr = self.scheduleFor == 'Person' && response.data.assets.length > 0 ? response.data.work_orders.length > 0 ? msgStr + '/assets' : msgStr + 'assets' : msgStr;
            console.log("msgStr = ", msgStr);
            self.util.showDialog(
              ScheduleDialogComponent,
              resourceName + " is assigned to the following " + msgStr + ":",
              [
                "/workflow/schedule/csa/schedule-timeline"
              ],
              "Delete Confirmation",
              "CONFIRMATION_WITH_WARNING_2",
              { type: self.scheduleFor, details: response.data }
            );
          }
        }
      });
    } catch (err) {
       this.global.addException('Assign Work order', 'checkAssignedWO()', err, { 'API': 'check-work-orders|POST', 'APIRequest': { scheduling_id: schedule.schedule.scheduling_id } });
    }
  }

}
