import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';

import { UtilService } from '../../../../../shared/service/util.service';
import { HttpService } from '../../../../../shared/service/http.service';
import { GlobalService } from '../../../../../shared/service/global.service';

import { DialogComponent } from '../../../../../shared/model/dialog/dialog.component';

@Component({
  selector: 'app-schedule-review',
  templateUrl: './timeline-schedule-review.component.html',
  styleUrls: ['./timeline-schedule-review.component.css']
})
export class TimelineScheduleReviewComponent implements OnInit {
  scheduleFor: string;
  public scheduleData:any;
  public errMsg: string = '';
  public isError: boolean = false;

  constructor(
    public dialog: MatDialog,
    public util:UtilService,
    public http:HttpService,
    public global:GlobalService,
    public router: Router, 
    private route: ActivatedRoute,
  ) {
      this.scheduleData = JSON.parse(sessionStorage.getItem('schedulingInfo'));
      console.log("scheduleData",this.scheduleData);
   }

  ngOnInit() {
    this.util.menuChange({'menu':4,'subMenu':27});
    this.util.setWindowHeight();
    this.util.setPageTitle(this.route);
    window.scrollTo(0, 0);
    this.scheduleFor = atob(this.route.snapshot.paramMap.get('type'));
  }

    public editInfo(action) {
        try {
            console.log(action);
            this.router.navigate(['/workflow/schedule/csa/add-timeline-schedule/' + btoa(action) + '/' + this.scheduleData.personDetails.id]);
        } catch (err) {
            this.global.addException('Schedule-review', 'editInfo()', err, { 'routeURL': '/workflow/schedule/csa/add-timeline-schedule/' + btoa(action) });
        }
    }
    
  save(){
    let self = this;
    try{
      let reqObj:any = {};
      reqObj = this.scheduleData.reqData
      delete reqObj.days_off;
        console.log("Request Ext WO",reqObj,JSON.stringify(this.scheduleData));
        self.util.addSpinner('saveSchedule', "Submit");
        if(!reqObj.scheduling_id){
          this.http.doPost('storeScheduling',reqObj,function(error: boolean, response: any){
            self.util.removeSpinner('saveSchedule', "Submit");
            console.log("response.message",response.message);
            if(error){
              self.isError = true;
              self.errMsg = response.message;
            }else{
              self.util.showDialog(DialogComponent, response.message, ['/workflow/schedule/csa/schedule-timeline']);
              
            }
          });
        }else{
          this.http.doPost('updateScheduling',reqObj,function(error: boolean, response: any){
            self.util.removeSpinner('saveSchedule', "Submit");
            if(error){
              self.isError = true;
              self.errMsg = response.message;
            }else{
              self.util.showDialog(DialogComponent, response.message, ['/workflow/schedule/csa/schedule-timeline']);
              
            }
          });
        }

    }catch(err){
      this.global.addException('Scheduling','save()',err);
    }

  }
}
