import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

//Schedule Components

import { AddScheduleComponent } from './add-schedule/add-schedule.component';
import { ScheduleListComponent } from './schedule-list/schedule-list.component';
import { ScheduleReviewComponent } from './schedule-review/schedule-review.component';

import { ScheduleDialogComponent } from './schedule-dialog.component';


import { CSALandingComponent } from '../../dashboard/company-super-admin/landing.component';
import { RoleGuardService as RoleGuard } from '../../../auth/role-guard.service';

export const ScheduleComponentList = [ AddScheduleComponent, ScheduleListComponent, ScheduleReviewComponent ];
export const ScheduleEntryComponentList = [ ];

const routes: Routes = [
	{ path: 'csa', component: CSALandingComponent ,
        children: [
        	//Schedule Module Routing
            { path: 'add-schedule/:type', component: AddScheduleComponent, data: { permissionLevelId: 119, title: 'Workflow - Scheduling'  } },
            { path: 'schedule-review/:type', component: ScheduleReviewComponent, data: { permissionLevelId: 119, title: 'Workflow - Scheduling'  } },
            { path: 'schedule-list/:id', component: ScheduleListComponent, data: { permissionLevelId: 119, title: 'Workflow - Scheduling'  } },
        ],
        canActivate: [ RoleGuard ], 
        data: { expectedRole: [ 2, 3 ] }
    }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ScheduleRoutingModule { }
