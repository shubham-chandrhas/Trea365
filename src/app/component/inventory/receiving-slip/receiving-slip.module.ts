import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { TextMaskModule } from 'angular2-text-mask';
import { NgxPaginationModule } from 'ngx-pagination';

import { AppConfigModule, APP_DI_CONFIG } from '../../../app-config.module';
import { ReceivingSlipRoutingModule, RSComponentList, RSEntryComponentList } from './receiving-slip-routing.module';
import { TreaCommonModule } from '../../../shared/module/trea-common.module';
import { MaterialModule } from '../../../shared/module/material.module';
import { PipeModule } from '../../../shared/module/pipe.module';

@NgModule({
  imports: [
    CommonModule,
    ReceivingSlipRoutingModule,
    TreaCommonModule,
    ReactiveFormsModule,
    FormsModule,
    TextMaskModule,
    NgxPaginationModule,
    MaterialModule,
    PipeModule
  ],
  declarations: APP_DI_CONFIG.lazyLoading ? RSComponentList : [],
  entryComponents: APP_DI_CONFIG.lazyLoading ? RSEntryComponentList : []
})
export class ReceivingSlipModule { }
