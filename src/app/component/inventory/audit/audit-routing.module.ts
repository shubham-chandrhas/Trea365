import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

//Audit Components
import { AuditListComponent } from './audit-list/audit-list.component';
import { AuditReportComponent } from './audit-report/audit-report.component';
import { NewAuditComponent } from './new-audit/new-audit.component';
import { AuditDialog } from './audit-dialog.component';
import { InventoryDialog } from '../inventory-dialog.component';

import { CSAOnboardingComponent } from '../../onboarding/dashboard/landing.component';
import { CSALandingComponent } from '../../dashboard/company-super-admin/landing.component';

import { RoleGuardService as RoleGuard } from '../../../auth/role-guard.service';
import { from } from 'rxjs/observable/from';

export const AuditComponentList = [ NewAuditComponent, AuditListComponent, AuditReportComponent, AuditDialog, NewAuditComponent ];
export const AuditEntryComponentList = [ AuditDialog ]


const routes: Routes = [
	{ path: 'csa', component: CSALandingComponent ,
        children: [
            { path: 'audit-list/:id', component: AuditListComponent, data: { permissionLevelId: 101, title: 'Inventory - Audit' } },
            { path: 'new-audit', component: NewAuditComponent, data: { permissionLevelId: 101, title: 'Inventory - Audit' } },
            { path: 'audit-report', component: AuditReportComponent, data: { permissionLevelId: 101, title: 'Inventory - Audit' } },
        ],
        canActivate: [ RoleGuard ], 
        data: { expectedRole: [ 2, 3 ] }
    }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuditRoutingModule { }
