import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MultiselectDropdownModule } from 'angular-2-dropdown-multiselect';
import { CommonModule } from '@angular/common';
import { TextMaskModule } from 'angular2-text-mask';
import { NgxPaginationModule } from 'ngx-pagination';
import { AgmCoreModule } from '@agm/core';
import { NewCrmRoutingModule, CRMComponentList, NewCRMEntryComponentList } from './crm-routing.module';
import { MaterialModule } from '../../shared/module/material.module';
import { PipeModule } from '../../shared/module/pipe.module';
import { TreaCommonModule } from '../../shared/module/trea-common.module';
import { APP_DI_CONFIG } from '../../app-config.module';
import { NewCrmService } from './crm-service';




@NgModule({
  	imports: [
	    CommonModule,
	    NewCrmRoutingModule,
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
	entryComponents: APP_DI_CONFIG.lazyLoading ? NewCRMEntryComponentList : [],
	providers: [NewCrmService]

})
export class NewCrmModule { }
