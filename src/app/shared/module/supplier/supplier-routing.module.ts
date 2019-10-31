import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

//New Supplier Components
import { SupplierListComponent } from './supplier-list/supplier-list.component';
import { AddSupplierComponent } from './add-supplier/add-supplier.component';
import { SupplierReviewComponent } from './supplier-review/supplier-review.component';

import { CSAOnboardingComponent } from '../../../component/onboarding/dashboard/landing.component';
import { CSALandingComponent } from '../../../component/dashboard/company-super-admin/landing.component';

import { RoleGuardService as RoleGuard } from '../../../auth/role-guard.service';

export const SupplierComponentList = [ SupplierListComponent, AddSupplierComponent, SupplierReviewComponent ];

export const SupplierEntryComponentList = [ ];
const commonRoutes: any = [
    { path: 'supplier-list/:id', component: SupplierListComponent, data: { permissionLevelId: 39, title: 'Admin - Suppliers' } },
    { path: 'add-supplier', component: AddSupplierComponent, data: { permissionLevelId: 39, title: 'Admin - Suppliers' } },
    { path: 'supplier-review', component: SupplierReviewComponent, data: { permissionLevelId: 39, title: 'Admin - Suppliers' } },
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
export class SupplierRoutingModule { }
