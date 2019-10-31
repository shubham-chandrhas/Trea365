import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MultiselectDropdownModule } from 'angular-2-dropdown-multiselect';
import { Ng2DragDropModule } from 'ng2-drag-drop';
import { TextMaskModule } from 'angular2-text-mask';
import { NgxPaginationModule } from 'ngx-pagination';
import { FileDropModule } from 'ngx-file-drop';

import { AgmCoreModule } from '@agm/core';
import { AppConfigModule, APP_DI_CONFIG } from '../../app-config.module';
import { PipeModule } from '../../shared/module/pipe.module';
//import { TreaCommonModule } from '../../shared/module/trea-common.module';

import { MaterialModule } from '../../shared/module/material.module';
import { WorkflowRoutingModule } from './workflow-routing.module';
import { ProjectEstimatorModule } from './project-estimator/project-estimator.module';
import { ScheduleModule } from './schedule/schedule.module';
import { WorkOrderModule } from './work-order/work-order.module';
import { TreaCommonModule } from '../../shared/module/trea-common.module';

@NgModule({
  	imports: [
    	CommonModule,
    	WorkflowRoutingModule,
		//BrowserModule,
		PipeModule,
	 	MaterialModule,
	    //BrowserAnimationsModule,
	    ReactiveFormsModule,
	    FormsModule,
	    MultiselectDropdownModule,
	    Ng2DragDropModule,
	    TextMaskModule,
	    NgxPaginationModule,
	    FileDropModule,
	    AgmCoreModule.forRoot({
      		apiKey: APP_DI_CONFIG.googleMapKey,
      		libraries: ["places"]
    	}),
	    //ProjectEstimatorModule,
	    //ScheduleModule,
	    //WorkOrderModule,
	    TreaCommonModule
  	],
  	declarations: []
})
export class WorkflowModule { }
