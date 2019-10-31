import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MaterialModule } from '../../module/material.module';
import { NgxPaginationModule } from 'ngx-pagination'; 
import { PipeModule } from '../../module/pipe.module';
import { TextMaskModule } from 'angular2-text-mask';

import { MultiselectDropdownModule } from 'angular-2-dropdown-multiselect';
import { Ng2DragDropModule } from 'ng2-drag-drop';
import { FileDropModule } from 'ngx-file-drop';

import { AppConfigModule, APP_DI_CONFIG } from '../../../app-config.module';
import { TreaCommonModule } from '../../module/trea-common.module';
import { ManufacturerPartRoutingModule, ManufacturerPartComponentList, ManufacturerPartEntryComponentList } from './manufacturer-part-routing.module';

@NgModule({
  imports: [
    CommonModule,
    ManufacturerPartRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    NgxPaginationModule,
    PipeModule,
    TextMaskModule,
    MaterialModule,
    MultiselectDropdownModule,
    Ng2DragDropModule,
    FileDropModule,
    TreaCommonModule
  ],
  declarations: APP_DI_CONFIG.lazyLoading ? ManufacturerPartComponentList : [],
  entryComponents: APP_DI_CONFIG.lazyLoading ? ManufacturerPartEntryComponentList : [],
  providers: [],
  exports: APP_DI_CONFIG.lazyLoading ? [ ManufacturerPartComponentList ] : []
})
export class ManufacturerPartModule { }
