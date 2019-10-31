import { BrowserModule } from '@angular/platform-browser';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA  } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MultiselectDropdownModule } from 'angular-2-dropdown-multiselect';
import { Ng2DragDropModule } from 'ng2-drag-drop';
import { TextMaskModule } from 'angular2-text-mask';
import { NgxPaginationModule } from 'ngx-pagination';
import { FileDropModule } from 'ngx-file-drop';

import { PopoverModule } from "ngx-popover";
import { SupplierModule } from '../../shared/module/supplier/supplier.module';
import { ManufacturerModule } from '../../shared/module/manufacturer/manufacturer.module';
import { ManufacturerPartModule } from '../../shared/module/manufacturer-part/manufacturer-part.module';
//import { TreaCommonModule } from '../../shared/module/trea-common.module';

import { AppConfigModule, APP_DI_CONFIG } from '../../app-config.module';
import { TreaCommonModule } from '../../shared/module/trea-common.module';
import { MaterialModule } from '../../shared/module/material.module';
import { PipeModule } from '../../shared/module/pipe.module';
import { InventoryRoutingModule, InventoryComponentList, InventoryEntryComponentList } from './inventory-routing.module';

import { AssetsModule } from './assets/assets.module';
import { ProductsModule } from './products/products.module';
import { InventoryMaterialModule } from './material/material.module';
import { WorkOrderService } from '../workflow/work-order/work-order.service';


@NgModule({
  	imports: [
    	CommonModule,
    	InventoryRoutingModule,
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
	    PopoverModule,
	    PipeModule,
	    SupplierModule,
	    ManufacturerModule,
	    ManufacturerPartModule,
	    TreaCommonModule,
	    AssetsModule,
	    ProductsModule,
	    InventoryMaterialModule,
  	],
 	declarations: APP_DI_CONFIG.lazyLoading ? InventoryComponentList : [],
  	entryComponents: APP_DI_CONFIG.lazyLoading ? InventoryEntryComponentList : [],
  	providers: [ WorkOrderService ]
  	//exports: [ SupplierModule, ManufacturerModule, ManufacturerPartModule, AssetsModule, ProductsModule, InventoryMaterialModule ]
})
export class InventoryModule { }
