//import { BrowserModule } from '@angular/platform-browser';
//import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TextMaskModule } from 'angular2-text-mask';
import { FileDropModule } from 'ngx-file-drop';
import { PopoverModule } from "ngx-popover";
import { NgxPaginationModule } from 'ngx-pagination';
import { PipeModule } from '../../shared/module/pipe.module';


import { AppConfigModule, APP_DI_CONFIG } from '../../app-config.module';
import { MaterialModule } from '../../shared/module/material.module'; 
import { AccountingRoutingModule, AccountingComponentList, AccountingEntryComponentList } from './accounting-routing.module';
import { TreaCommonModule } from '../../shared/module/trea-common.module';

@NgModule({
  imports: [
    CommonModule,
    AccountingRoutingModule,
    //BrowserModule,
    MaterialModule,
    //BrowserAnimationsModule,
    ReactiveFormsModule,
    FormsModule,
    TextMaskModule,
    FileDropModule,
    PopoverModule,
    TreaCommonModule,
    NgxPaginationModule,
    PipeModule
  ],
  declarations: APP_DI_CONFIG.lazyLoading ? AccountingComponentList : [],
  entryComponents: APP_DI_CONFIG.lazyLoading ? AccountingEntryComponentList : [],
})
export class AccountingModule { }
