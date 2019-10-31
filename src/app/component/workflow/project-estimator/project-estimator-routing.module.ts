import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

//Workflow Components
import { QuotationListComponent } from './quotation-list/quotation-list.component';
import { ClientSelectionComponent } from './client-selection/client-selection.component';
import { ProjectEstimatorDialog } from './project-estimator-dialog.component';
import { QuotationGenerationComponent } from './quotation-generation/quotation-generation.component';
import { QuotationReviewComponent } from './quotation-review/quotation-review.component';
import { CSALandingComponent } from '../../dashboard/company-super-admin/landing.component';
import { RoleGuardService as RoleGuard } from '../../../auth/role-guard.service';

import { ServicesComponent } from './quotation-generation/services/services.component';
import { MaterialsComponent } from './quotation-generation/materials/materials.component';
import { ScheduleComponent } from './quotation-generation/schedule/schedule.component';
import { PaymentScheduleComponent } from './quotation-generation/payment-schedule/payment-schedule.component';
import { ImagesComponent } from './quotation-generation/images/images.component';
import { ChangeRequestReviewComponent } from './change-request-review/change-request-review.component';
import { ChangeRequestReviewChangesComponent } from './change-request-review-changes/change-request-review-changes.component';

export const ProjectEstimatorComponentList = [ QuotationListComponent, ClientSelectionComponent, QuotationGenerationComponent, QuotationReviewComponent, ProjectEstimatorDialog, ServicesComponent, MaterialsComponent, ScheduleComponent, PaymentScheduleComponent, ImagesComponent,ChangeRequestReviewComponent,ChangeRequestReviewChangesComponent]
export const ProjectEstimatorEntryComponentList = [ ProjectEstimatorDialog ]

const routes: Routes = [
	{ path: 'csa', component: CSALandingComponent ,
        children: [
        	//ProjectEstimator Module Routing
            { path: 'quotation-list/:id', component: QuotationListComponent, data: { permissionLevelId: 107, title: 'Workflow - Project estimator'} },
            { path: 'client-selection', component: ClientSelectionComponent, data: { permissionLevelId: 107, title: 'Workflow - Project estimator' } },
            { path: 'quotation-review', component: QuotationReviewComponent, data: { permissionLevelId: 107, title: 'Workflow - Project estimator' } },
            { path: 'change-request-review', component: ChangeRequestReviewChangesComponent, data: { permissionLevelId: 107, title: 'Workflow - Project estimator' } },
            { path: 'quotation', component: QuotationGenerationComponent, data: { permissionLevelId: 107, title: 'Workflow - Project estimator' },
                children: [
                    //ProjectEstimator Module Routing
                    { path: 'services', component: ServicesComponent, data: {title: 'Workflow - Project estimator'} },
                    { path: 'materials', component: MaterialsComponent, data: {title: 'Workflow - Project estimator'}  },
                    { path: 'schedule', component: ScheduleComponent, data: {title: 'Workflow - Project estimator'}  },
                    { path: 'payment-schedule', component: PaymentScheduleComponent, data: {title: 'Workflow - Project estimator'}  },
                    { path: 'images', component: ImagesComponent, data: {title: 'Workflow - Project estimator'}  },
                ]
            },
        ],
        canActivate: [ RoleGuard ], 
        data: { expectedRole: [ 2, 3 ] }
    }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProjectEstimatorRoutingModule { }
