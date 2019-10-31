import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ScheduleDisplayComponent } from './schedule-display/schedule-display.component';
import { ScheduleTimelineComponent } from './schedule-timeline/schedule-timeline.component';
import { AddTimelineScheduleComponent } from './add-timeline-schedule/add-timeline-schedule.component';
import { TimelineScheduleReviewComponent } from './timeline-schedule-review/timeline-schedule-review.component';

import { CSALandingComponent } from '../../../dashboard/company-super-admin/landing.component';
import { RoleGuardService as RoleGuard } from '../../../../auth/role-guard.service';

export const TimelineComponentList = [ 
    ScheduleTimelineComponent,
    ScheduleDisplayComponent,
    AddTimelineScheduleComponent,
    TimelineScheduleReviewComponent
];
export const TimelineEntryComponentList = [];

const routes: Routes = [
	{ path: 'csa', component: CSALandingComponent ,
        children: [
        	//Schedule Module Routing
            { 
                path: 'schedule-timeline', component: ScheduleTimelineComponent, data: { title: 'Workflow - Scheduling'  },
                
            },
            {
                path: "add-timeline-schedule/:type/:id",
                component: AddTimelineScheduleComponent,
                data: { title: "Workflow - Add Schedule" }
            },
            {
                path: "timeline-schedule-review/:type",
                component: TimelineScheduleReviewComponent,
                data: { title: "Workflow - Add Schedule" }
            }
        ],
        canActivate: [ RoleGuard ], 
        data: { expectedRole: [ 2, 3 ] }
    }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TimelineRoutingModule { }
