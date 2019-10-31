import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

//MAterial Components
import { AddMaterialComponent } from './add-material/add-material.component';
import { MaterialListComponent } from './material-list/material-list.component';
import { MaterialReviewComponent } from './material-review/material-review.component';

import { InventoryDialog } from '../inventory-dialog.component';

import { CSAOnboardingComponent } from '../../onboarding/dashboard/landing.component';
import { CSALandingComponent } from '../../dashboard/company-super-admin/landing.component';

import { RoleGuardService as RoleGuard } from '../../../auth/role-guard.service';
import { from } from 'rxjs/observable/from';

export const MaterialComponentList = [ AddMaterialComponent, MaterialListComponent, MaterialReviewComponent ];
export const MaterialEntryComponentList = [ ]

const commonRoutes: any = [
    { path: 'add-material', component: AddMaterialComponent, data: { permissionLevelId: 76, title: 'Inventory - Material' } },
    { path: 'material-list/:id', component: MaterialListComponent, data: { permissionLevelId: 76, title: 'Inventory - Material' } },
    { path: 'material-review', component: MaterialReviewComponent, data: { permissionLevelId: 76, title: 'Inventory - Material' } },
]
const routes: Routes = [
	{ path: 'csa-onboarding', component: CSAOnboardingComponent ,
        children: [ ...commonRoutes ],
        canActivate: [ RoleGuard ], 
        data: { expectedRole: [ 2 ] }
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
export class MaterialRoutingModule { }
