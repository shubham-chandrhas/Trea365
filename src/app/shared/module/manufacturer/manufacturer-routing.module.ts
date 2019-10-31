import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

//New Manufacturer Components
import { ManufacturerComponent, ManufacturerDialog } from './manufacturer/manufacturer.component';

import { CSAOnboardingComponent } from '../../../component/onboarding/dashboard/landing.component';
import { CSALandingComponent } from '../../../component/dashboard/company-super-admin/landing.component';

import { RoleGuardService as RoleGuard } from '../../../auth/role-guard.service';

export const ManufacturerComponentList = [ ManufacturerComponent, ManufacturerDialog ];
export const ManufacturerEntryComponentList = [ ManufacturerDialog ];


const routes: Routes = [
	{ path: 'csa-onboarding', component: CSAOnboardingComponent ,
        children: [ { path: 'manufacturer/:id', component: ManufacturerComponent, data: { permissionLevelId: 24, title: 'Admin - Manufacturer' } } ],
        canActivate: [ RoleGuard ], 
        data: { expectedRole: [ 2, 3 ] }
    },{ path: 'csa', component: CSALandingComponent ,
        children: [ { path: 'manufacturer/:id', component: ManufacturerComponent,data: { title: 'Admin - Manufacturer' } } ],
        canActivate: [ RoleGuard ], 
        data: { expectedRole: [ 2, 3 ] }
    }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ManufacturerRoutingModule { }
