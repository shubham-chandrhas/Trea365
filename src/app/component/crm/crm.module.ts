import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MultiselectDropdownModule } from 'angular-2-dropdown-multiselect';
import { CommonModule } from '@angular/common';
import { TextMaskModule } from 'angular2-text-mask';
import { NgxPaginationModule } from 'ngx-pagination';
import { AgmCoreModule } from '@agm/core';

import { AppConfigModule, APP_DI_CONFIG } from '../../app-config.module';

import { TreaCommonModule } from '../../shared/module/trea-common.module';
import { PipeModule } from '../../shared/module/pipe.module';
import { MaterialModule } from '../../shared/module/material.module'; 
import { CrmRoutingModule, CRMComponentList, CRMEntryComponentList } from './crm-routing.module';
import { CrmService } from '../crm/crm-service';

@NgModule({
  	imports: [
	    CommonModule,
	    CrmRoutingModule,
	    //BrowserModule,
	 	MaterialModule,
	    //BrowserAnimationsModule,
	    ReactiveFormsModule,
	    FormsModule,
		MultiselectDropdownModule,
		TextMaskModule,
		NgxPaginationModule,
		PipeModule,
		TreaCommonModule,
		AgmCoreModule.forRoot({
      		apiKey: APP_DI_CONFIG.googleMapKey,
      		libraries: ["places"]
    	}),
  	],
	declarations: APP_DI_CONFIG.lazyLoading ? CRMComponentList : [],
	entryComponents: APP_DI_CONFIG.lazyLoading ? CRMEntryComponentList : [],
	providers: [CrmService]
})
export class CrmModule { }
