import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TSADashboardComponent } from './dashboard/dashboard.component';
import { ErrorLogComponent } from './error-log/error-log.component';
import { TSALandingComponent } from './dashboard/landing.component';
import { CompanyRegistrationComponent } from './company-registration/company-registration.component';

//import { TSADialogComponent } from './tsa.dialog';
import { EmployeeListComponent } from '../../component/hr/employee/employee-list/employee-list.component';
import { NewEmployeeComponent } from '../../component/hr/employee/new-employee/new-employee.component';
import { EmployeeReviewComponent } from '../../component/hr/employee/employee-review/employee-review.component';

import { RoleGuardService as RoleGuard } from '../../auth/role-guard.service';

export const TSAComponentList = [ TSALandingComponent, TSADashboardComponent, ErrorLogComponent, CompanyRegistrationComponent ]
//export const TSAEntryComponentList = [ TSADialogComponent ];

const routes: Routes = [
	{ path: 'tsa', component: TSALandingComponent,
        children: [
            { path: '', redirectTo: 'dashboard/0', pathMatch: 'full' },
            { path: 'dashboard/0', component: TSADashboardComponent, data: { title: 'Company'}  },
            { path: 'error-log', component: ErrorLogComponent, data: { title: 'Error Log'}  },
            { path: 'company-registration', component: CompanyRegistrationComponent, data: { title: 'Company Registration'}  },
            { path: 'users-list/:compId/:id', component: EmployeeListComponent, data: { title: 'User List'}  },
            { path: 'add-user/:id', component: NewEmployeeComponent, data: { title: 'Add User'}  },
            { path: 'user-review/:id', component: EmployeeReviewComponent, data: { title: 'User Review'}  }
        ],
        canActivate: [ RoleGuard ], 
        data: { expectedRole: [1], data: { title: 'Admin'}  }
    },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TreaSuperAdminRoutingModule { }
