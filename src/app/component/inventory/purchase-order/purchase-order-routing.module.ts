import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

//new P/O Components
import { PurchaseOrderListComponent } from './purchase-order-list/purchase-order-list.component';
import { NewPurchaseOrderComponent } from './new-purchase-order/new-purchase-order.component';
import { PurchaseOrderReviewComponent } from './purchase-order-review/purchase-order-review.component';
import { PurchaseOrderDialog } from './purchase-order-dialog.component';
import { InventoryDialog } from '../inventory-dialog.component';

import { CSAOnboardingComponent } from '../../onboarding/dashboard/landing.component';
import { CSALandingComponent } from '../../dashboard/company-super-admin/landing.component';

import { RoleGuardService as RoleGuard } from '../../../auth/role-guard.service';
import { from } from 'rxjs/observable/from';

export const POComponentList = [ PurchaseOrderListComponent, NewPurchaseOrderComponent,  PurchaseOrderReviewComponent, PurchaseOrderDialog ];
export const POEntryComponentList = [ PurchaseOrderDialog ]


const routes: Routes = [
    { path: 'csa', component: CSALandingComponent ,
        children: [
            { path: 'new-purchase-order', component: NewPurchaseOrderComponent, data: { permissionLevelId: 93, title: 'Inventory - Purchase Orders' } },
            { path: 'purchase-order-list/:id', component: PurchaseOrderListComponent, data: { permissionLevelId: 93, title: 'Inventory - Purchase Orders' } },
            { path: 'purchase-order-review', component: PurchaseOrderReviewComponent, data: { permissionLevelId: 93, title: 'Inventory - Purchase Orders' } },
        ],
        canActivate: [ RoleGuard ], 
        data: { expectedRole: [ 2, 3 ] }
    },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PurchaseOrderRoutingModule { }
