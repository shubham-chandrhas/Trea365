import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MaterialModule } from '../../module/material.module';
import { NgxPaginationModule } from 'ngx-pagination'; 
import { PipeModule } from '../../module/pipe.module';
import { TextMaskModule } from 'angular2-text-mask';
import { AgmCoreModule } from '@agm/core';
import { MultiselectDropdownModule } from 'angular-2-dropdown-multiselect';

import { AppConfigModule, APP_DI_CONFIG } from '../../../app-config.module';
import { SupplierRoutingModule, SupplierComponentList, SupplierEntryComponentList } from './supplier-routing.module';


@NgModule({
  imports: [
    CommonModule,
    SupplierRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    NgxPaginationModule,
    PipeModule,
    TextMaskModule,
    MaterialModule,
    MultiselectDropdownModule,
    AgmCoreModule.forRoot({
        apiKey: APP_DI_CONFIG.googleMapKey,
        libraries: ["places"]
    }),
  ],
  declarations: APP_DI_CONFIG.lazyLoading ? SupplierComponentList : [],
  entryComponents: APP_DI_CONFIG.lazyLoading ? SupplierEntryComponentList : [],
  providers: [],
  exports: APP_DI_CONFIG.lazyLoading ? [ SupplierComponentList ] : []
})
export class SupplierModule { }
