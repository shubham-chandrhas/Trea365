import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { TextMaskModule } from 'angular2-text-mask';
import { NgxPaginationModule } from 'ngx-pagination';
import { PopoverModule } from "ngx-popover";

import { AppConfigModule, APP_DI_CONFIG } from '../../../app-config.module';
import { PurchaseOrderRoutingModule, POComponentList, POEntryComponentList } from './purchase-order-routing.module';
import { TreaCommonModule } from '../../../shared/module/trea-common.module';
import { MaterialModule } from '../../../shared/module/material.module';
import { PipeModule } from '../../../shared/module/pipe.module';

@NgModule({
  imports: [
    CommonModule,
    PurchaseOrderRoutingModule,
    TreaCommonModule,
    ReactiveFormsModule,
    FormsModule,
    TextMaskModule,
    NgxPaginationModule,
    MaterialModule,
    PipeModule,
    PopoverModule
  ],
  declarations: APP_DI_CONFIG.lazyLoading ? POComponentList : [],
  entryComponents: APP_DI_CONFIG.lazyLoading ? POEntryComponentList : []
})
export class PurchaseOrderModule { }
