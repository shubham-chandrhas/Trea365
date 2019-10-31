import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

//Hr Components
import { EmployeeDialog } from '../hr/employee/employee-dialog.component';
import { EmployeeListComponent } from '../hr/employee/employee-list/employee-list.component';
import { NewEmployeeComponent } from '../hr/employee/new-employee/new-employee.component';
import { EmployeeReviewComponent } from '../hr/employee/employee-review/employee-review.component';
import { SubContractorListComponent } from '../hr/sub-contractor/sub-contractor-list/sub-contractor-list.component';
import { AddSubContractorComponent } from '../hr/sub-contractor/add-sub-contractor/add-sub-contractor.component';
import { SubContractorReviewComponent } from '../hr/sub-contractor/sub-contractor-review/sub-contractor-review.component';
import { TimesheetListComponent } from '../hr/timesheet/timesheet-list/timesheet-list.component';

import { CSALandingComponent } from '../dashboard/company-super-admin/landing.component';
import { CSAOnboardingComponent } from '../onboarding/dashboard/landing.component';

import { RoleGuardService as RoleGuard } from '../../auth/role-guard.service';

export const HRComponentList = [ SubContractorListComponent, AddSubContractorComponent, SubContractorReviewComponent, TimesheetListComponent, EmployeeDialog ];
export const HREntryComponentList = [ EmployeeDialog ];
const commonRoutes: any = [
    { path: 'employee-list/:id', component: EmployeeListComponent, data: { permissionLevelId: 127, title: 'HR - Employees'} },
    { path: 'employee-review', component: EmployeeReviewComponent, data: { permissionLevelId: 127, title: 'HR - Employees'} },
    { path: 'new-employee', component: NewEmployeeComponent, data: { permissionLevelId: 127, title: 'HR - Employees'} },
    { path: 'sub-contractor-list/:id', component: SubContractorListComponent, data: { permissionLevelId: 136, title: 'HR - Subcontractor'} },
    { path: 'add-subcontractor', component: AddSubContractorComponent, data: { permissionLevelId: 136, title: 'HR - Subcontractor'} },
    { path: 'subcontractor-review', component: SubContractorReviewComponent, data: { permissionLevelId: 136, title: 'HR - Subcontractor'} },
]
const routes: Routes = [
    {   
        path: 'csa', component: CSALandingComponent ,
        children: [
            ...commonRoutes,  
            { path: 'timesheet-list/:id', component: TimesheetListComponent, data: { permissionLevelId: 144, title: 'HR - Timesheets'} },
        ],
        canActivate: [ RoleGuard ], 
        data: { expectedRole: [ 2, 3 ] }
    },{ 
        path: 'csa-onboarding', component: CSAOnboardingComponent ,
        children: [ ...commonRoutes ],
        canActivate: [ RoleGuard ], 
        data: { expectedRole: [ 2, 3 ] }
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class HrRoutingModule { }
