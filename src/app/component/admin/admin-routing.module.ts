import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

//Old Admin Components
import { LocationDialog } from './location/location.component';

//New Admin Components
import { PrintLabelComponent } from './print-label/print-label.component';
import { AddLocationComponent } from './location/add-location/add-location.component';
import { LocationReviewComponent } from './location/location-review/location-review.component';
import { LocationListComponent } from './location/location-list/location-list.component';
// import { ItemClassesComponent, ItemClassesDialog } from './item-classes/item-classes.component';
import { RoleListComponent } from './permission/role-list/role-list.component';
import { AddRoleComponent } from './permission/add-role/add-role.component';
import { RoleReviewComponent } from './permission/role-review/role-review.component';

import { CSAOnboardingComponent } from '../onboarding/dashboard/landing.component';
import { CSALandingComponent } from '../dashboard/company-super-admin/landing.component';;

import { RoleGuardService as RoleGuard } from '../../auth/role-guard.service';

export const AdminComponentList = [ LocationDialog, PrintLabelComponent, AddLocationComponent, LocationReviewComponent,
   LocationListComponent, RoleListComponent, AddRoleComponent, RoleReviewComponent];

export const AdminEntryComponentList = [ LocationDialog ];
const commonRoutes: any = [
    { path: 'location-list/:id', component: LocationListComponent, data: { permissionLevelId: 13, title: 'Admin - Location' } },
    { path: 'add-location', component: AddLocationComponent, data: { permissionLevelId: 13, title: 'Admin - Location'  } },
    { path: 'location-review', component: LocationReviewComponent, data: { permissionLevelId: 13, title: 'Admin - Location'  } },
    // { path: 'item-classes/:id', component: ItemClassesComponent, data: { permissionLevelId: 19, title: 'Admin - Item Categories'  } },
    { path: 'role-list/:id', component: RoleListComponent, data: { permissionLevelId: 45, title: 'Admin - Permissions'  } },
    { path: 'add-role', component: AddRoleComponent, data: { permissionLevelId: 45, title: 'Admin - Permissions'  } },
    { path: 'role-review', component: RoleReviewComponent, data: { permissionLevelId: 45, title: 'Admin - Permissions'  } }
];

const routes: Routes = [
	{ path: 'csa-onboarding', component: CSAOnboardingComponent ,
        children: [ ...commonRoutes ],
        canActivate: [ RoleGuard ],
        data: { expectedRole: [ 2, 3 ] }
    },{ path: 'csa', component: CSALandingComponent ,
        children: [ { path: 'print-label', component: PrintLabelComponent , data: { permissionLevelId: 49, title: 'Admin - Labels' } }, ...commonRoutes ],
        canActivate: [ RoleGuard ],
        data: { expectedRole: [ 2, 3 ] }
    }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
