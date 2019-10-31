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
import { AppConfigModule, APP_DI_CONFIG } from '../../../app-config.module';
import { PipeModule } from '../../../shared/module/pipe.module';
import { DatePipe } from '@angular/common';

import { TreaCommonModule } from '../../../shared/module/trea-common.module';
import { MaterialModule } from '../../../shared/module/material.module';
import { ProjectEstimatorRoutingModule, ProjectEstimatorComponentList, ProjectEstimatorEntryComponentList } from './project-estimator-routing.module';

import { ProjectEstimatorService } from './project-estimator.service';


@NgModule({
  	imports: [
    	CommonModule,
		ProjectEstimatorRoutingModule,
		PipeModule,
	    //BrowserModule,
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

    	TreaCommonModule
  	],
  	declarations: APP_DI_CONFIG.lazyLoading ? ProjectEstimatorComponentList : [],
  	entryComponents: APP_DI_CONFIG.lazyLoading ? ProjectEstimatorEntryComponentList : [],
  	providers: [ ProjectEstimatorService ]
})
export class ProjectEstimatorModule { }
