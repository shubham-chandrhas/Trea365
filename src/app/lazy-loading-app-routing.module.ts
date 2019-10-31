import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { AuthService } from "./auth/auth.service";
import { AuthGuardService as AuthGuard } from "./auth/auth-guard.service";
import { RoleGuardService as RoleGuard } from "./auth/role-guard.service";

import { AppConfigModule, APP_DI_CONFIG } from "./app-config.module";
import { AppComponent } from "./app.component";
import {
  LoginComponent,
  ClientLoginComponent
} from "./auth/login/login.component";
import {
  ForgotCredentialStepOneComponent,
  ForgotCredentialStepTwoComponent,
  ResetCredentialStepTwoComponent,
  ForgotCredentialStepThreeComponent
} from "./auth/forgot-credential/forgot-credential.component";
import {
  SetPasswordStepOneComponent,
  SetPasswordStepTwoComponent
} from "./auth/set-password/set-password.component";
import { CSALandingComponent } from "./component/dashboard/company-super-admin/landing.component";
import { CompanyUsersDashboardComponent } from "./component/dashboard/company-users/dashboard.component";
import { CompanyUsersLandingComponent } from "./component/dashboard/company-users/landing.component";
import {
  AddUserComponent,
  AddUserWithSocialIDComponent
} from "./component/user-registration/user-registration.component";
import { CSAOnboardingComponent } from "./component/onboarding/dashboard/landing.component";
import {
  RedirectionComponent,
  MaintenanceComponent
} from "./shared/module/redirection/redirection.component";

import { CsvPreviewComponent } from "./component/csv/csv-preview/csv-preview.component";
import { E404Component } from "./component/error-pages/e404/e404.component";
import { DialogComponent } from "./shared/model/dialog/dialog.component";
import { OnboardingGuideDialogComponent } from "./component/onboarding/onboarding-guide/onboarding-guide.component";
import { ScheduleDialogComponent } from "./component/workflow/schedule/schedule-dialog.component";

import { TSADialogComponent } from "./component/trea-super-admin/tsa.dialog";
import { DialogMessageComponent } from "./shared/model/dialog/dialog-message.component";

export const LazyLoadingComponentList = [
  AppComponent,
  LoginComponent,
  ClientLoginComponent,
  ForgotCredentialStepOneComponent,
  ForgotCredentialStepTwoComponent,
  ResetCredentialStepTwoComponent,
  ForgotCredentialStepThreeComponent,
  CompanyUsersDashboardComponent,
  CompanyUsersLandingComponent,
  AddUserComponent,
  AddUserWithSocialIDComponent,
  E404Component,
  SetPasswordStepOneComponent,
  SetPasswordStepTwoComponent,
  DialogComponent,
  OnboardingGuideDialogComponent,
  RedirectionComponent,
  MaintenanceComponent,
  TSADialogComponent,
  ScheduleDialogComponent,
  DialogMessageComponent
];

export const LazyLoadingEntryComponentList = [
  DialogComponent,
  OnboardingGuideDialogComponent,
  MaintenanceComponent,
  TSADialogComponent,
  ScheduleDialogComponent,
  DialogMessageComponent
];

const routes: Routes = [
  { path: "", redirectTo: "login", pathMatch: "full" },
  {
    path: "login",
    component: LoginComponent,
    pathMatch: "full",
    data: { title: "Login" }
  },
  {
    path: "client-login",
    component: ClientLoginComponent,
    data: { title: "Login" }
  },

  {
    path: "forgot-credential-s1/:type",
    component: ForgotCredentialStepOneComponent,
    data: { title: "Forgot Credential" }
  },
  {
    path: "forgot-credential-s2/:status",
    component: ForgotCredentialStepTwoComponent,
    data: { title: "Forgot Credential" }
  },
  {
    path: "reset-credential-s2",
    component: ResetCredentialStepTwoComponent,
    data: { title: "Reset Credential" }
  },
  {
    path: "forgot-credential-s3",
    component: ForgotCredentialStepThreeComponent,
    data: { title: "Forgot Password" }
  },
  {
    path: "set-password-s1",
    component: SetPasswordStepOneComponent,
    data: { title: "Set Password" }
  },
  {
    path: "set-password-s2",
    component: SetPasswordStepTwoComponent,
    data: { title: "Set Password" }
  },

  {
    path: "csa",
    component: CSALandingComponent,
    children: [
      { path: "", redirectTo: "/c-dashboard/csa/summary", pathMatch: "full" },
      {
        path: "redirection/:page/:id",
        component: RedirectionComponent,
        data: { title: "" }
      }
    ],
    canActivate: [RoleGuard],
    data: { expectedRole: [2] } //'2'
  },
  {
    path: "company-users",
    component: CompanyUsersLandingComponent,
    children: [
      { path: "", redirectTo: "dashboard", pathMatch: "full" },
      {
        path: "dashboard",
        component: CompanyUsersDashboardComponent,
        data: { title: "User" }
      }
    ],
    canActivate: [RoleGuard],
    data: { expectedRole: [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15] } //'2'
  },
  {
    path: "csa-onboarding",
    component: CSAOnboardingComponent,
    loadChildren: "./component/onboarding/onboarding.module#OnboardingModule",
    canActivate: [RoleGuard],
    data: { expectedRole: [2, 3] } //2 , 3
  },
  // { path: '**', redirectTo: '404', pathMatch: 'full' },
  // @mohini
  {
      path: "crm",
      loadChildren: "./component/crm/crm.module#CrmModule"
    },
    {
      path: "new-crm",
      loadChildren: "./component/new-crm/crm.module#NewCrmModule"
    },
    // @mohini
  {
    path: "account",
    loadChildren: "./component/accounting/accounting.module#AccountingModule"
  },
  {
    path: "c-dashboard",
    loadChildren:
      "./component/dashboard/company-super-admin/csa-dashboard.module#CSADashboardModule"
  },
  {
    path: "hr",
    loadChildren: "./component/hr/hr.module#HrModule"
  },
  {
    path: "admin",
    loadChildren: "./component/admin/admin.module#AdminModule"
  },
  {
    path: "inventory",
    loadChildren: "./component/inventory/inventory.module#InventoryModule"
  },
  {
    path: "workflow",
    loadChildren: "./component/workflow/workflow.module#WorkflowModule"
  },
  {
    path: "dispatch",
    loadChildren: "./component/dispatch/dispatch.module#DispatchModule"
  },

  {
    path: "email-link",
    loadChildren:
      "./component/email-template/email-template.module#EmailTemplateModule"
  },
  {
    path: "message",
    loadChildren: "./component/message/message.module#MessageModule"
  },
  {
    path: "su",
    loadChildren:
      "./component/trea-super-admin/trea-super-admin.module#TreaSuperAdminModule"
  },

  { path: "404", component: E404Component, data: { title: "404" } }
];

@NgModule({
  imports: APP_DI_CONFIG.lazyLoading
    ? [RouterModule.forRoot(routes, { useHash: true })]
    : [],
  exports: APP_DI_CONFIG.lazyLoading ? [RouterModule] : []
})
export class LazyLoadingAppRoutingModule {}
