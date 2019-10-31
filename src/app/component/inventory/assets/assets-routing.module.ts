import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

//Asset Components
import { AddAssetComponent } from './add-asset/add-asset.component';
import { AssetListComponent } from './asset-list/asset-list.component';
import { AssetReviewComponent } from './asset-review/asset-review.component';


import { InventoryDialog } from '../inventory-dialog.component';

import { CSAOnboardingComponent } from '../../onboarding/dashboard/landing.component';
import { CSALandingComponent } from '../../dashboard/company-super-admin/landing.component';

import { RoleGuardService as RoleGuard } from '../../../auth/role-guard.service';
import { from } from 'rxjs/observable/from';

export const AssetComponentList = [ AddAssetComponent, AssetListComponent, AssetReviewComponent ];
export const AssetEntryComponentList = [ ]

const commonRoutes: any = [
    { path: 'add-asset', component: AddAssetComponent, data: { permissionLevelId: 62, title: 'Inventory - Assets' } },
    { path: 'asset-list/:id', component: AssetListComponent, data: { permissionLevelId: 62, title: 'Inventory - Assets' } },
    { path: 'asset-review', component: AssetReviewComponent, data: { permissionLevelId: 62, title: 'Inventory - Assets' } }
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
export class AssetsRoutingModule { }
