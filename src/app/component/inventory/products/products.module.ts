import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MultiselectDropdownModule } from 'angular-2-dropdown-multiselect';
import { Ng2DragDropModule } from 'ng2-drag-drop';
import { TextMaskModule } from 'angular2-text-mask';
import { NgxPaginationModule } from 'ngx-pagination';
import { FileDropModule } from 'ngx-file-drop';
import { PopoverModule } from "ngx-popover";

import { AppConfigModule, APP_DI_CONFIG } from '../../../app-config.module';
import { ProductsRoutingModule, ProductComponentList } from './products-routing.module';
import { TreaCommonModule } from '../../../shared/module/trea-common.module';
import { MaterialModule } from '../../../shared/module/material.module';
import { PipeModule } from '../../../shared/module/pipe.module';


@NgModule({
  imports: [
    CommonModule,
    ProductsRoutingModule,
    TreaCommonModule,
    ReactiveFormsModule,
    FormsModule,
    MultiselectDropdownModule,
    Ng2DragDropModule,
    TextMaskModule,
    NgxPaginationModule,
    FileDropModule,
    PopoverModule,
    MaterialModule,
    PipeModule
  ],
  declarations: APP_DI_CONFIG.lazyLoading ? ProductComponentList : [],
  exports: APP_DI_CONFIG.lazyLoading ? ProductComponentList : []
})
export class ProductsModule { }
