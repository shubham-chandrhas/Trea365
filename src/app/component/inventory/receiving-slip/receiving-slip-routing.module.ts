import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

//RS Components

import { ReceivingSlipsListComponent } from './receiving-slips-list/receiving-slips-list.component';
import { AddReceivingSlipComponent } from './add-receiving-slip/add-receiving-slip.component';
import { ReceivingSlipDialog } from './receiving-slip-dialog.component';

import { InventoryDialog } from '../inventory-dialog.component';

import { CSAOnboardingComponent } from '../../onboarding/dashboard/landing.component';
import { CSALandingComponent } from '../../dashboard/company-super-admin/landing.component';

import { RoleGuardService as RoleGuard } from '../../../auth/role-guard.service';

export const RSComponentList = [ ReceivingSlipsListComponent, AddReceivingSlipComponent, ReceivingSlipDialog ];
export const RSEntryComponentList = [ ReceivingSlipDialog ]


const routes: Routes = [
    {   path: 'csa', component: CSALandingComponent ,
        children: [
            { path: 'receiving-slips-list/:id', component: ReceivingSlipsListComponent, data: { permissionLevelId: 98, title: 'Inventory - Receiving Slips' } },
            { path: 'add-receiving-slip', component: AddReceivingSlipComponent, data: { permissionLevelId: 98, title: 'Inventory - Receiving Slips' } },
        ],
        canActivate: [ RoleGuard ], 
        data: { expectedRole: [ 2, 3 ] }
    },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReceivingSlipRoutingModule { }
