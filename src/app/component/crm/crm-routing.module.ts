import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

//CRM Components
import { AddClientComponent } from '../crm/client/add-client/add-client.component';
import { ClientListComponent } from '../crm/client/client-list/client-list.component';
import { ClientAddressComponent } from '../crm/client/client-list/client-address/client-address.component';
import { ClientContactComponent } from '../crm/client/client-list/client-contact/client-contact.component';
import { ClientReviewComponent } from '../crm/client/client-review/client-review.component';

import { ClientDialog } from '../crm/client/client-dialog.component';

import { CSALandingComponent } from '../dashboard/company-super-admin/landing.component';
import { CSAOnboardingComponent } from '../onboarding/dashboard/landing.component';

import { RoleGuardService as RoleGuard } from '../../auth/role-guard.service';

export const CRMComponentList = [ AddClientComponent, ClientListComponent, ClientAddressComponent, ClientContactComponent, ClientReviewComponent, ClientDialog ];
export const CRMEntryComponentList = [ClientDialog];

const routes: Routes = [
	{ path: 'csa', component: CSALandingComponent ,
        children: [
            { path: 'client-list/:id', component: ClientListComponent, data: { permissionLevelId: 122, title: 'CRM'  } },
            { path: 'add-client', component: AddClientComponent, data: { permissionLevelId: 122, title: 'CRM'  } },
            { path: 'client-review', component: ClientReviewComponent, data: { permissionLevelId: 122, title: 'CRM'  } },
        ],
        canActivate: [ RoleGuard ], 
        data: { expectedRole: [ 2, 3 ] }
    },{ path: 'csa-onboarding', component: CSAOnboardingComponent ,
    children: [
            { path: 'client-list/:id', component: ClientListComponent, data: { permissionLevelId: 122, title: 'CRM' }},
            { path: 'add-client', component: AddClientComponent, data: { permissionLevelId: 122, title: 'CRM' }},
            { path: 'client-review', component: ClientReviewComponent, data: { permissionLevelId: 122, title: 'CRM' }},
        ],
        canActivate: [ RoleGuard ], 
        data: { expectedRole: [ 2, 3 ] }
    }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CrmRoutingModule { }
