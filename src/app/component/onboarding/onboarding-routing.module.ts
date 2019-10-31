import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CSAOnboardingDashboardComponent } from './dashboard/dashboard.component';
import { OnboardingGuideComponent, OnboardingGuideDialogComponent } from './onboarding-guide/onboarding-guide.component';
import { EmpFieldsComponent } from './onboarding-guide/emp-fields/emp-fields.component';
import { AccountDetailsComponent } from './account-details/account-details.component';
import { EditAccountComponent, EditAccountDialog } from './account-details/edit-account/edit-account.component';
import { CsvPreviewComponent } from '../csv/csv-preview/csv-preview.component';

import { SettingsComponent, SettingsDialog } from './settings/settings.component';

// OnboardingGuideDialogComponent
export const OnboardingComponentList = [CsvPreviewComponent, CSAOnboardingDashboardComponent, OnboardingGuideComponent, EmpFieldsComponent, AccountDetailsComponent, EditAccountComponent, EditAccountDialog, SettingsComponent, SettingsDialog ]
// OnboardingGuideDialogComponent
export const OnboardingEntryComponentList = [ EditAccountDialog, SettingsDialog ];

const routes: Routes = [
    { path: '', redirectTo: 'account-details', pathMatch: 'full' },
    { path: 'dashboard', component: CSAOnboardingDashboardComponent, data: { title: 'Dashboard'} },
    { path: 'account-details', component: AccountDetailsComponent, data: { title: 'Account'} },
    { path: 'edit-account', component: EditAccountComponent, data: { title: 'Account'} },
    { path: 'settings', component: SettingsComponent, data: { title: 'Settings'} },
    { path: 'guide', component: OnboardingGuideComponent, data: { title: 'Onboarding Guide'} },
    { path: 'emp-fields', component: EmpFieldsComponent, data: { title: 'Employee Fields'} },
    { path: 'csv-preview/:type', component: CsvPreviewComponent, data: { title: 'CSV Preview'} },
];

@NgModule({
  	imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class OnboardingRoutingModule { }
