import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

//Dashboard Components
import { CSAReportsComponent } from '../company-super-admin/reports/reports.component';
import { SummaryComponent } from '../company-super-admin/summary/summary.component';
import { OldSummaryComponent } from '../company-super-admin/summary-old/summary.component';
import { RepairesComponent } from '../company-super-admin/reports/repaires/repaires.component';
import { WorkflowComponent } from '../company-super-admin/reports/workflow/workflow.component';
import { HrComponent } from '../company-super-admin/reports/hr/hr.component';
import { SalesComponent } from '../company-super-admin/reports/sales/sales.component';
import { FinancialsComponent } from '../company-super-admin/reports/financials/financials.component';
import { AssetsComponent } from '../company-super-admin/reports/assets/assets.component';

import { CSALandingComponent } from '../../dashboard/company-super-admin/landing.component';
import { CSAOnboardingComponent } from '../../onboarding/dashboard/landing.component';

import { RoleGuardService as RoleGuard } from '../../../auth/role-guard.service';

export const DashboardComponentList = [CSAReportsComponent, RepairesComponent, WorkflowComponent, HrComponent, SalesComponent, FinancialsComponent, AssetsComponent, SummaryComponent, OldSummaryComponent];
export const DashboardEntryComponentList = [];

const routes: Routes = [
    { path: 'csa', component: CSALandingComponent ,
    children: [
      { path: 'summary', component: SummaryComponent, data: { title: 'Dashboard - Summary' }}, 
      { path: 'summary-old', component: OldSummaryComponent },
      { path: 'reports', component: CSAReportsComponent, data: { title: 'Dashboard - Reports'},
          children: [
                      { path: '', redirectTo: 'repaires', pathMatch: 'full', data: { title: 'Dashboard - Reports'} },
                      { path: 'repaires', component: RepairesComponent, data: { title: 'Dashboard - Reports'} },
                      { path: 'workflow', component: WorkflowComponent, data: { title: 'Dashboard - Reports'} },
                      { path: 'hr', component: HrComponent, data: { title: 'Dashboard - Reports'} },
                      { path: 'sales', component: SalesComponent, data: { title: 'Dashboard - Reports'} },
                      { path: 'financials', component: FinancialsComponent, data: { title: 'Dashboard - Reports'} },
                      { path: 'assets', component: AssetsComponent, data: { title: 'Dashboard - Reports'} },
                      
                  ],
      },
      
    ],
    canActivate: [ RoleGuard ], 
    data: { expectedRole: [ 2, 3 ] }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CSADashboardRoutingModule { }
