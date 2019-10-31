import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

//Product Components
import { AddProductComponent } from './add-product/add-product.component';
import { ProductListComponent } from './product-list/product-list.component';
import { ProductReviewComponent } from './product-review/product-review.component';
import { InventoryDialog } from '../inventory-dialog.component';

import { CSAOnboardingComponent } from '../../onboarding/dashboard/landing.component';
import { CSALandingComponent } from '../../dashboard/company-super-admin/landing.component';

import { RoleGuardService as RoleGuard } from '../../../auth/role-guard.service';
import { from } from 'rxjs/observable/from';

export const ProductComponentList = [ AddProductComponent, ProductListComponent, ProductReviewComponent ];
export const ProductEntryComponentList = [ ]

const commonRoutes: any = [
    { path: 'add-product', component: AddProductComponent, data: { permissionLevelId: 52, title: 'Inventory - Product' } },
    { path: 'product-list/:id', component: ProductListComponent, data: { permissionLevelId: 52, title: 'Inventory - Product' } },
    { path: 'product-review', component: ProductReviewComponent, data: { permissionLevelId: 52, title: 'Inventory - Product' } },
]
const routes: Routes = [
	{ path: 'csa-onboarding', component: CSAOnboardingComponent ,
        children: [ ...commonRoutes],
        canActivate: [ RoleGuard ], 
        data: { expectedRole: [ 2 ] }
    },{ path: 'csa', component: CSALandingComponent ,
        children: [ ...commonRoutes ],
        canActivate: [ RoleGuard ], 
        data: { expectedRole: [ 2, 3 ] }
    },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProductsRoutingModule { }
