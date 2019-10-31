import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AppConfigModule, APP_DI_CONFIG } from '../../app-config.module';

//new Inventory Components
// import { AddAssetComponent } from './assets/add-asset/add-asset.component';
// import { AssetListComponent } from './assets/asset-list/asset-list.component';
// import { AssetReviewComponent } from './assets/asset-review/asset-review.component';
// import { AddProductComponent } from './products/add-product/add-product.component';
// import { ProductListComponent } from './products/product-list/product-list.component';
// import { ProductReviewComponent } from './products/product-review/product-review.component';
// import { AddMaterialComponent } from './material/add-material/add-material.component';
// import { MaterialListComponent } from './material/material-list/material-list.component';
// import { MaterialReviewComponent } from './material/material-review/material-review.component';
// import { PurchaseOrderListComponent } from './purchase-order/purchase-order-list/purchase-order-list.component';
// import { NewPurchaseOrderComponent } from './purchase-order/new-purchase-order/new-purchase-order.component';
// import { PurchaseOrderReviewComponent } from './purchase-order/purchase-order-review/purchase-order-review.component';
// import { PurchaseOrderDialog } from './purchase-order/purchase-order-dialog.component';
// import { AuditListComponent } from './audit/audit-list/audit-list.component';
// import { AuditReportComponent } from './audit/audit-report/audit-report.component';
// import { NewAuditComponent } from './audit/new-audit/new-audit.component';
// import { AuditDialog } from './audit/audit-dialog.component';
// import { ReceivingSlipsListComponent } from './receiving-slip/receiving-slips-list/receiving-slips-list.component';
// import { AddReceivingSlipComponent } from './receiving-slip/add-receiving-slip/add-receiving-slip.component';
// import { ReceivingSlipDialog } from './receiving-slip/receiving-slip-dialog.component';
import { MaintenanceListComponent, MaintenanceDialog } from './maintenance/maintenance-list/maintenance-list.component';
import { TrackerComponent } from './tracker/tracker.component';
import { InventoryDialog } from './inventory-dialog.component';

import { CSAOnboardingComponent } from '../onboarding/dashboard/landing.component';
import { CSALandingComponent } from '../dashboard/company-super-admin/landing.component';

import { RoleGuardService as RoleGuard } from '../../auth/role-guard.service';

export const InventoryComponentList = [ MaintenanceListComponent, MaintenanceDialog, InventoryDialog, TrackerComponent ];
export const InventoryEntryComponentList = [ MaintenanceDialog, InventoryDialog ]

const commonRoutes: any = [
    // { path: 'add-asset', component: AddAssetComponent },
    // { path: 'asset-list/:id', component: AssetListComponent },
    // { path: 'asset-review', component: AssetReviewComponent },
    // { path: 'add-product', component: AddProductComponent },
    // { path: 'product-list/:id', component: ProductListComponent },
    // { path: 'product-review', component: ProductReviewComponent },
    // { path: 'add-material', component: AddMaterialComponent },
    // { path: 'material-list/:id', component: MaterialListComponent },
    // { path: 'material-review', component: MaterialReviewComponent },
]
const routes: Routes = [
	// { path: 'csa-onboarding', component: CSAOnboardingComponent ,
 //        children: [ ...commonRoutes],
 //        canActivate: [ RoleGuard ], 
 //        data: { expectedRole: [2] }
 //    },
    { path: 'csa', component: CSALandingComponent ,
        children: [
            ...commonRoutes,
            // { path: 'new-purchase-order', component: NewPurchaseOrderComponent },
            // { path: 'purchase-order-list/:id', component: PurchaseOrderListComponent },
            // { path: 'purchase-order-review', component: PurchaseOrderReviewComponent },
            // { path: 'audit-list', component: AuditListComponent },
            // { path: 'new-audit', component: NewAuditComponent },
            // { path: 'audit-report', component: AuditReportComponent },
            // { path: 'receiving-slips-list/:id', component: ReceivingSlipsListComponent },
            // { path: 'add-receiving-slip', component: AddReceivingSlipComponent },
            { path: 'maintenance-list/:id', component: MaintenanceListComponent, data: { permissionLevelId: 86, title: 'Inventory - Maintenance' } },
            { path: 'tracker/:id', component: TrackerComponent, data: { permissionLevelId: 72, title: 'Inventory - Tracker' } }
        ],
        canActivate: [ RoleGuard ], 
        data: { expectedRole: [ 2, 3 ] }
    },
    // {
    //     path: 'asset',
    //     loadChildren: './assets/assets.module#AssetsModule',
    // },
    // {
    //     path: 'product',
    //     loadChildren: './products/products.module#ProductsModule',
    // },
    // {
    //     path: 'material',
    //     loadChildren: './material/material.module#InventoryMaterialModule',
    // },
    {
        path: 'audit',
        loadChildren: './audit/audit.module#AuditModule',
    },
    {
        path: 'po',
        loadChildren: './purchase-order/purchase-order.module#PurchaseOrderModule',
    },
    {
        path: 'rs',
        loadChildren: './receiving-slip/receiving-slip.module#ReceivingSlipModule',
    },
    
];

@NgModule({
  imports: APP_DI_CONFIG.lazyLoading ? [RouterModule.forChild(routes)] : [],
  exports: APP_DI_CONFIG.lazyLoading ? [RouterModule] : []
})
export class InventoryRoutingModule { }
