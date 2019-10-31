import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { TextMaskModule } from 'angular2-text-mask';

import { APP_DI_CONFIG } from '../../../app-config.module';
import { PipeModule } from '../../../shared/module/pipe.module';
import { MaterialModule } from '../../../shared/module/material.module';
import { TreaCommonModule } from '../../../shared/module/trea-common.module';
import { ItemClassesRoutingModule, ItemClassComponentList, ItemClassEntryComponentList } from './item-classes-routing.mdule';

@NgModule({
  imports: [
    CommonModule,
    ItemClassesRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    NgxPaginationModule,
    PipeModule,
    TextMaskModule,
    MaterialModule,
    TreaCommonModule
  ],
  declarations: APP_DI_CONFIG.lazyLoading ? ItemClassComponentList : [],
  entryComponents: APP_DI_CONFIG.lazyLoading ? ItemClassEntryComponentList : [],
  providers: [],
  exports: APP_DI_CONFIG.lazyLoading ? [ ItemClassComponentList ] : []
})
export class ItemClassesModule { }
