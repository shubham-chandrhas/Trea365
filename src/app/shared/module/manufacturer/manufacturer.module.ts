import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MaterialModule } from '../../module/material.module';
import { NgxPaginationModule } from 'ngx-pagination'; 
import { PipeModule } from '../../module/pipe.module';
import { TextMaskModule } from 'angular2-text-mask';

import { AppConfigModule, APP_DI_CONFIG } from '../../../app-config.module';
import { TreaCommonModule } from '../../module/trea-common.module';
import { ManufacturerRoutingModule, ManufacturerComponentList, ManufacturerEntryComponentList } from './manufacturer-routing.module';

@NgModule({
  imports: [
    CommonModule,
    ManufacturerRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    NgxPaginationModule,
    PipeModule,
    TextMaskModule,
    MaterialModule,
    TreaCommonModule
  ],
  declarations: APP_DI_CONFIG.lazyLoading ? ManufacturerComponentList : [],
  entryComponents: APP_DI_CONFIG.lazyLoading ? ManufacturerEntryComponentList : [],
  providers: [],
  exports: APP_DI_CONFIG.lazyLoading ? [ ManufacturerComponentList ] : []
})
export class ManufacturerModule { }
