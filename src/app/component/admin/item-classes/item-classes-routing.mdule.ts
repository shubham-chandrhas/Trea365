import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

//New Manufacturer Components

import { CSAOnboardingComponent } from '../../../component/onboarding/dashboard/landing.component';
import { CSALandingComponent } from '../../../component/dashboard/company-super-admin/landing.component';

import { RoleGuardService as RoleGuard } from '../../../auth/role-guard.service';
import { ItemClassesDialog, ItemClassesComponent } from './item-classes.component';

export const ItemClassComponentList = [ ItemClassesComponent, ItemClassesDialog ];
export const ItemClassEntryComponentList = [ ItemClassesDialog ];

const commonRoutes: any = [
  { path: 'item-classes/:id', component: ItemClassesComponent, data: { permissionLevelId: 19, title: 'Admin - Item Categories'  } },
];

const routes: Routes = [
{ path: 'csa-onboarding', component: CSAOnboardingComponent ,
      children: [ ...commonRoutes ],
      canActivate: [ RoleGuard ],
      data: { expectedRole: [ 2, 3 ] }
  },{ path: 'csa', component: CSALandingComponent ,
      children: [  ...commonRoutes ],
      canActivate: [ RoleGuard ],
      data: { expectedRole: [ 2, 3 ] }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ItemClassesRoutingModule { }
