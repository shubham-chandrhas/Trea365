import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AppConfigModule, APP_DI_CONFIG } from '../../app-config.module';
//Workflow Components
// import { QuotationListComponent } from './project-estimator/quotation-list/quotation-list.component';
// import { ClientSelectionComponent } from './project-estimator/client-selection/client-selection.component';
// import { ProjectEstimatorDialog } from './project-estimator/project-estimator-dialog.component';
// import { QuotationGenerationComponent } from './project-estimator/quotation-generation/quotation-generation.component';
// import { QuotationReviewComponent } from './project-estimator/quotation-review/quotation-review.component';
// import { WorkOrderComponent } from './work-order/work-order/work-order.component';
// import { WorkOrderDialog } from './work-order/work-order-dialog.component';
// import { WorkOrderListComponent } from './work-order/work-order-list/work-order-list.component';
// import { WorkOrderReviewComponent } from './work-order/work-order-review/work-order-review.component';
// import { WoQuotationReviewComponent } from './work-order/wo-quotation-review/wo-quotation-review.component';
// import { AddScheduleComponent } from './schedule/add-schedule/add-schedule.component';
// import { ScheduleListComponent } from './schedule/schedule-list/schedule-list.component';
// import { ScheduleReviewComponent } from './schedule/schedule-review/schedule-review.component';

// import { CSALandingComponent } from '../dashboard/company-super-admin/landing.component';
// import { RoleGuardService as RoleGuard } from '../../auth/role-guard.service';

// export const WorkflowComponentList = [ QuotationListComponent, ClientSelectionComponent, QuotationGenerationComponent, QuotationReviewComponent, WorkOrderComponent, WorkOrderListComponent, WorkOrderReviewComponent, AddScheduleComponent, ScheduleListComponent, ScheduleReviewComponent, ProjectEstimatorDialog, WorkOrderDialog, WoQuotationReviewComponent ]
// export const WorkflowEntryComponentList = [ ProjectEstimatorDialog, WorkOrderDialog ]

const routes: Routes = [
// 	{ path: 'csa', component: CSALandingComponent ,
//         children: [
//         	//Workflow Module Routing
//             { path: 'quotation-list', component: QuotationListComponent },
//             { path: 'client-selection', component: ClientSelectionComponent },
//             { path: 'quotation-generation', component: QuotationGenerationComponent },
//             { path: 'quotation-review', component: QuotationReviewComponent },
//             { path: 'work-order', component: WorkOrderComponent },
//             { path: 'work-order-list/0', component: WorkOrderListComponent },
//             { path: 'work-order-review', component: WorkOrderReviewComponent },
//             { path: 'wo-quotation-review', component: WoQuotationReviewComponent },
//             { path: 'add-schedule', component: AddScheduleComponent },
//             { path: 'schedule-review', component: ScheduleReviewComponent },
//             { path: 'schedule-list/:id', component: ScheduleListComponent },
//         ],
//         canActivate: [ RoleGuard ], 
//         data: { expectedRole: [2] }
//     }

	{
        path: 'quote',
        loadChildren: './project-estimator/project-estimator.module#ProjectEstimatorModule',
    },
    {
        path: 'wo',
        loadChildren: './work-order/work-order.module#WorkOrderModule',
    },
    {
        path: 'schedule',
        loadChildren: './schedule/schedule.module#ScheduleModule',
    },
];

@NgModule({
  imports: APP_DI_CONFIG.lazyLoading ? [RouterModule.forChild(routes)] : [],
  exports: APP_DI_CONFIG.lazyLoading ? [RouterModule] : []
})
export class WorkflowRoutingModule { }
