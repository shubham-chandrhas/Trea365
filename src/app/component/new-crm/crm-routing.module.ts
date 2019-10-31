import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { NewClientListComponent } from './new-client/client-list/client-list.component';
import { CSALandingComponent } from '../dashboard/company-super-admin/landing.component';
import { RoleGuardService as RoleGuard} from '../../auth/role-guard.service';
import { CSAOnboardingComponent } from '../onboarding/dashboard/landing.component';
//CRM Components
import { NewClientDialog } from '../new-crm/new-client/client-dialog.component';


//CRM Components
 import { NewAddClientComponent } from '../new-crm/new-client/add-client/add-client.component';
 import { NewClientReviewComponent } from '../new-crm/new-client/client-review/client-review.component';

 // import { ClientListComponent } from '../crm/client/client-list/client-list.component';
// import { ClientAddressComponent } from '../crm/client/client-list/client-address/client-address.component';
// import { ClientContactComponent } from '../crm/client/client-list/client-contact/client-contact.component';

// import { ClientDialog } from '../crm/client/client-dialog.component';

// import { CSALandingComponent } from '../dashboard/company-super-admin/landing.component';
// import { CSAOnboardingComponent } from '../onboarding/dashboard/landing.component';

// import { RoleGuardService as RoleGuard } from './auth/role-guard.service';
export const CRMComponentList = [  NewClientListComponent , NewAddClientComponent ,NewClientDialog, NewClientReviewComponent ];
// export const CRMComponentList = [ AddClientComponent, ClientListComponent, ClientAddressComponent, ClientContactComponent, ClientReviewComponent, ClientDialog ];
export const NewCRMEntryComponentList = [NewClientDialog];

const routes: Routes = [
	{ path: 'csa', component: CSALandingComponent ,
        children: [
            { path: 'client-list/:id', component: NewClientListComponent, data: { permissionLevelId: 122, title: 'CRM'  } },
            { path: 'add-client', component: NewAddClientComponent, data: { permissionLevelId: 122, title: 'CRM'  } },
            { path: 'client-review', component: NewClientReviewComponent, data: { permissionLevelId: 122, title: 'CRM'  } },
        ],
        canActivate: [ RoleGuard ],
        data: { expectedRole: [ 2, 3 ] }
    },{ path: 'csa-onboarding', component: CSAOnboardingComponent ,
    children: [
            { path: 'client-list/:id', component: NewClientListComponent, data: { permissionLevelId: 122, title: 'CRM' }},
            { path: 'add-client', component: NewAddClientComponent, data: { permissionLevelId: 122, title: 'CRM' }},
            { path: 'client-review', component: NewClientReviewComponent, data: { permissionLevelId: 122, title: 'CRM' }},
        ],
        canActivate: [ RoleGuard ],
        data: { expectedRole: [ 2, 3 ] }
    }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class NewCrmRoutingModule { }
