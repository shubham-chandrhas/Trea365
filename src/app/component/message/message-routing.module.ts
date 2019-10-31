import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CSALandingComponent } from '../dashboard/company-super-admin/landing.component';
import { MessagingComponent } from './messaging/messaging.component';

export const MessageComponentList = [ MessagingComponent ]

const routes: Routes = [
	{ path: 'csa', component: CSALandingComponent, 
        children: [
			{ path: 'messaging', component: MessagingComponent, data: { title: 'Messaging' }, }
		]
	}	
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MessageRoutingModule { }
