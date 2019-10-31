import { BrowserModule } from '@angular/platform-browser';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MultiselectDropdownModule } from 'angular-2-dropdown-multiselect';
import { Ng2DragDropModule } from 'ng2-drag-drop';
import { TextMaskModule } from 'angular2-text-mask';
import { NgxPaginationModule } from 'ngx-pagination';
import { FileDropModule } from 'ngx-file-drop';
import { NgxBarcodeModule } from 'ngx-barcode';
import { AgmCoreModule } from '@agm/core';

import { AppConfigModule, APP_DI_CONFIG } from '../../app-config.module';
//import { TreaCommonModule } from '../../shared/module/trea-common.module';

import { MaterialModule } from '../../shared/module/material.module';
import { SupplierModule } from '../../shared/module/supplier/supplier.module';
import { ManufacturerModule } from '../../shared/module/manufacturer/manufacturer.module';
import { ManufacturerPartModule } from '../../shared/module/manufacturer-part/manufacturer-part.module';
import { BusinessNatureModule } from '../../shared/module/business-nature/business-nature.module';
import { PipeModule } from '../../shared/module/pipe.module';
import { AdminRoutingModule, AdminComponentList, AdminEntryComponentList } from './admin-routing.module';
import { TreaCommonModule } from '../../shared/module/trea-common.module';

import { AdminService } from './admin.service';
import { LocationService } from './location/location.service';
import { ItemClassesModule } from './item-classes/item-classes.module';

@NgModule({
  	imports: [
	    CommonModule,
	    AdminRoutingModule,
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
	    PipeModule,
	    NgxBarcodeModule,
	    SupplierModule,
      ManufacturerModule,
      ItemClassesModule,
		ManufacturerPartModule,
		BusinessNatureModule,
		TreaCommonModule,
		AgmCoreModule.forRoot({
      		apiKey: APP_DI_CONFIG.googleMapKey,
      		libraries: ["places"]
    	}),
  	],
  	declarations: APP_DI_CONFIG.lazyLoading ? AdminComponentList : [],
  	entryComponents: APP_DI_CONFIG.lazyLoading ? AdminEntryComponentList : [],
  	providers: [ AdminService, LocationService ]
})
export class AdminModule { }
