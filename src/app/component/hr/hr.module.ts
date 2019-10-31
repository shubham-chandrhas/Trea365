//import { BrowserModule } from '@angular/platform-browser';
//import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TextMaskModule } from 'angular2-text-mask';
import { FileDropModule } from 'ngx-file-drop';
import { PopoverModule } from "ngx-popover";
import { MultiselectDropdownModule } from 'angular-2-dropdown-multiselect';
import { NgxPaginationModule } from 'ngx-pagination';

import { AppConfigModule, APP_DI_CONFIG } from '../../app-config.module';
import { PipeModule } from '../../shared/module/pipe.module';
import { MaterialModule } from '../../shared/module/material.module'; 
import { TreaCommonModule } from '../../shared/module/trea-common.module';

import { AgmCoreModule } from '@agm/core';
import { HrRoutingModule, HRComponentList, HREntryComponentList } from './hr-routing.module';
// import { HrService } from './hr.service';
import { Ng2ImgMaxModule } from 'ng2-img-max/dist/src/ng2-img-max.module';
import { Ng2ImgMaxService } from 'ng2-img-max/dist/src/ng2-img-max.service';

@NgModule({
  imports: [
    CommonModule,
    HrRoutingModule,
    //BrowserModule,
    MaterialModule,
    //BrowserAnimationsModule,
    ReactiveFormsModule,
    FormsModule,
    TextMaskModule,
    FileDropModule,
    PopoverModule,
    MultiselectDropdownModule,
    PipeModule,
    NgxPaginationModule,
    TreaCommonModule,
    Ng2ImgMaxModule,
    AgmCoreModule.forRoot({
        apiKey: APP_DI_CONFIG.googleMapKey,
        libraries: ["places"]
    }),
  ],
  declarations: APP_DI_CONFIG.lazyLoading ? HRComponentList : [],
  entryComponents: APP_DI_CONFIG.lazyLoading ? HREntryComponentList : [],
  // providers: [HrService]
  exports: APP_DI_CONFIG.lazyLoading ? [ HRComponentList ] : []
})
export class HrModule { }
