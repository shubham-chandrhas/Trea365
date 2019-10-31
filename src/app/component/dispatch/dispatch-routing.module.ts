import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CSALandingComponent } from '../dashboard/company-super-admin/landing.component';
import { DispatchAllComponent } from './dispatch-dashboard/dispatch-all/dispatch-all.component';
import { DispatchStaffComponent } from './dispatch-dashboard/dispatch-staff/dispatch-staff.component';
import { DispatchWoComponent } from './dispatch-dashboard/dispatch-wo/dispatch-wo.component';
import { RoleGuardService as RoleGuard } from '../../auth/role-guard.service';
import { DispatchDashboardComponent } from './dispatch-dashboard/dispatch-dashboard.component';
export const DispatchComponent = [DispatchAllComponent,DispatchStaffComponent, DispatchWoComponent, DispatchDashboardComponent];

const routes: Routes = [
    { path: 'csa', component: CSALandingComponent ,
    children: [
        { path: 'dashboard', component: DispatchDashboardComponent, data: { permissionLevelId: 166, title: 'Dispatch'}  },
    ],
    canActivate: [ RoleGuard ],
    data: { expectedRole: [ 2, 3 ] }
}
];

@NgModule({
    imports: [RouterModule.forChild(routes)
    ],
  exports: [RouterModule]
})
export class DispatchRoutingModule { }
