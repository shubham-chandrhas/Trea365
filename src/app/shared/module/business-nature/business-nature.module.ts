import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MaterialModule } from '../../module/material.module';
import { NgxPaginationModule } from 'ngx-pagination'; 
import { PipeModule } from '../../module/pipe.module';
import { TextMaskModule } from 'angular2-text-mask';

import { AppConfigModule, APP_DI_CONFIG } from '../../../app-config.module';
import { TreaCommonModule } from '../../module/trea-common.module';
import { BusinessNatureRoutingModule, BusinessNatureComponentList, BusinessNatureEntryComponentList } from './business-nature-routing.module';


@NgModule({
  imports: [
    CommonModule,
    BusinessNatureRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    NgxPaginationModule,
    PipeModule,
    TextMaskModule,
    MaterialModule,
    TreaCommonModule
  ],
  declarations: APP_DI_CONFIG.lazyLoading ? BusinessNatureComponentList : [],
  entryComponents: APP_DI_CONFIG.lazyLoading ? BusinessNatureEntryComponentList : [],
  providers: [],
  exports: APP_DI_CONFIG.lazyLoading ? [ BusinessNatureComponentList ] : []
})
export class BusinessNatureModule { }
