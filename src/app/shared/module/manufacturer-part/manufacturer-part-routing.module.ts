import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

//Item Definition Components
import { ManufacturerPartComponent, ManufacturerPartDialog } from './manufacturer-part/manufacturer-part.component';
import { AddManufacturerPartComponent } from './manufacturer-part/add-manufacturer-part/add-manufacturer-part.component';
import { MfgAttributesComponent } from './manufacturer-part/mfg-attributes/mfg-attributes.component';
import { ManufacturerPartReviewComponent } from './manufacturer-part/manufacturer-part-review/manufacturer-part-review.component';

import { CSAOnboardingComponent } from '../../../component/onboarding/dashboard/landing.component';
import { CSALandingComponent } from '../../../component/dashboard/company-super-admin/landing.component';

import { RoleGuardService as RoleGuard } from '../../../auth/role-guard.service';

export const ManufacturerPartComponentList = [ ManufacturerPartComponent, AddManufacturerPartComponent, MfgAttributesComponent, ManufacturerPartReviewComponent, ManufacturerPartDialog ];

export const ManufacturerPartEntryComponentList = [ ManufacturerPartDialog ];
const commonRoutes: any = [
    { path: 'manufacturer-part/:id', component: ManufacturerPartComponent, data: { permissionLevelId: 29, title: 'Admin - Item Definition' } },
    { path: 'add-manufacturer-part/:id', component: AddManufacturerPartComponent, data: { permissionLevelId: 29, title: 'Admin - Item Definition' } },
    { path: 'mfg-attributes', component: MfgAttributesComponent, data: { permissionLevelId: 29, title: 'Admin - Item Definition' } },
    { path: 'manufacturer-part-review', component: ManufacturerPartReviewComponent, data: { permissionLevelId: 29, title: 'Admin - Item Definition' } },
];

const routes: Routes = [
	{ path: 'csa-onboarding', component: CSAOnboardingComponent ,
        children: [ ...commonRoutes ],
        canActivate: [ RoleGuard ], 
        data: { expectedRole: [ 2, 3 ] }
    },{ path: 'csa', component: CSALandingComponent ,
        children: [ ...commonRoutes ],
        canActivate: [ RoleGuard ], 
        data: { expectedRole: [ 2, 3 ] }
    }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ManufacturerPartRoutingModule { }
