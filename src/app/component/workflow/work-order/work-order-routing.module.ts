import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

//WorkOrder Components
import { WorkOrderComponent } from './work-order/work-order.component';
import { WorkOrderDialog } from './work-order-dialog.component';
import { WorkOrderListComponent } from './work-order-list/work-order-list.component';
import { WorkOrderReviewComponent } from './work-order-review/work-order-review.component';
import { WoQuotationReviewComponent } from './wo-quotation-review/wo-quotation-review.component';
import { WoSetupComponent } from './wo-setup/wo-setup.component';
import { ExternalWorkOrderComponent } from './external-work-order/external-work-order.component';
import { RecurringWorkOrderComponent } from './recurring-work-order/recurring-work-order.component';
import { WOServicesComponent } from './external-work-order/services/services.component';
import { TeamComponent } from './external-work-order/team/team.component';
import { WOAssetsComponent } from './external-work-order/assets/assets.component';
import { ProductsComponent } from './external-work-order/products/products.component';
import { WoSubContractorComponent } from './wo-sub-contractor/wo-sub-contractor.component';
import { WoContractorReviewComponent } from './wo-contractor-review/wo-contractor-review.component';

import { CSALandingComponent } from '../../dashboard/company-super-admin/landing.component';
import { RoleGuardService as RoleGuard } from '../../../auth/role-guard.service';

export const WorkOrderComponentList = [ WorkOrderComponent, WorkOrderListComponent, WorkOrderReviewComponent, WorkOrderDialog, WoQuotationReviewComponent, WoSetupComponent, ExternalWorkOrderComponent, WOServicesComponent, TeamComponent, WOAssetsComponent, ProductsComponent, WoSubContractorComponent, WoContractorReviewComponent, RecurringWorkOrderComponent];
export const WorkOrderEntryComponentList = [ WorkOrderDialog ];

const routes: Routes = [
	{ path: 'csa', component: CSALandingComponent ,
        children: [
        	//WorkOrder Module Routing
            { path: 'work-order', component: WorkOrderComponent, data: { permissionLevelId: 115 },
                children:[
                    { path: 'services', component: WOServicesComponent, data: {  title: 'Workflow - Work Orders' } },
                    { path: 'team', component: TeamComponent, data: {  title: 'Workflow - Work Orders' } },
                    { path: 'assets', component: WOAssetsComponent, data: {  title: 'Workflow - Work Orders' } },
                    { path: 'products', component: ProductsComponent, data: {  title: 'Workflow - Work Orders' } }
                ]
            },
            { path: 'work-order-list/:id', component: WorkOrderListComponent, data: { permissionLevelId: 115, title: 'Workflow - Work Orders' } },
            { path: 'work-order-review', component: WorkOrderReviewComponent, data: { permissionLevelId: 115, title: 'Workflow - Work Orders' } },
            { path: 'wo-quotation-review', component: WoQuotationReviewComponent, data: { permissionLevelId: 115, title: 'Workflow - Work Orders' } },
            { path: 'wo-setup', component: WoSetupComponent, data: { permissionLevelId: 115, title: 'Workflow - Work Orders' } },
            { path: 'wo-external', component: ExternalWorkOrderComponent, data: { permissionLevelId: 115, title: 'Workflow - Work Orders' },
                children:[
                    { path: 'services', component: WOServicesComponent, data: {  title: 'Workflow - Work Orders' }  },
                    { path: 'team', component: TeamComponent, data: {  title: 'Workflow - Work Orders' }  },
                    { path: 'assets', component: WOAssetsComponent, data: {  title: 'Workflow - Work Orders' }  },
                    { path: 'products', component: ProductsComponent, data: {  title: 'Workflow - Work Orders' }  }
                ]
            },
            { path : 'wo-sub-contractor', component: WoSubContractorComponent, data: { permissionLevelId: 115,data: {  title: 'Workflow - Work Orders' }  } },
            { path : 'wo-contractor-review', component: WoContractorReviewComponent, data: { permissionLevelId: 115,  data: {  title: 'Workflow - Work Orders' }  } },
            { path : 'wo-recurring', component: RecurringWorkOrderComponent, data: { permissionLevelId: 115,  data: {  title: 'Workflow - Work Orders' }  } }
        ],
        canActivate: [ RoleGuard ], 
        data: { expectedRole: [ 2, 3 ] }
    }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WorkOrderRoutingModule { }
