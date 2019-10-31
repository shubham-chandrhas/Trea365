import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

//New Supplier Components
import { BusinessNatureComponent } from '../business-nature/business-nature/business-nature.component';
import { AddBusinessNatureComponent } from '../business-nature/add-business-nature/add-business-nature.component';
import { ReviewBusinessNatureComponent } from '../business-nature/review-business-nature/review-business-nature.component';

import { CSAOnboardingComponent } from '../../../component/onboarding/dashboard/landing.component';
import { CSALandingComponent } from '../../../component/dashboard/company-super-admin/landing.component';

import { RoleGuardService as RoleGuard } from '../../../auth/role-guard.service';

export const BusinessNatureComponentList = [ BusinessNatureComponent, AddBusinessNatureComponent, ReviewBusinessNatureComponent ];

export const BusinessNatureEntryComponentList = [ ];
const commonRoutes: any = [
    { path: 'business-nature/:id', component: BusinessNatureComponent, data: { permissionLevelId: 8, title: 'Admin - Nature of Business' } },
    { path: 'add-business-nature/:id', component: AddBusinessNatureComponent, data: { permissionLevelId: 8, title: 'Admin - Nature of Business' } },
    { path: 'review-business-nature/:action', component: ReviewBusinessNatureComponent, data: { permissionLevelId: 8, title: 'Admin - Nature of Business' } },
];

const routes: Routes = [
	{   
        path: 'csa-onboarding', component: CSAOnboardingComponent ,
        children: [ ...commonRoutes ],
        canActivate: [ RoleGuard ], 
        data: { expectedRole: [ 2, 3 ] }
    },{ 
        path: 'csa', component: CSALandingComponent ,
        children: [ ...commonRoutes ],
        canActivate: [ RoleGuard ], 
        data: { expectedRole: [ 2, 3 ] }
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class BusinessNatureRoutingModule { }
