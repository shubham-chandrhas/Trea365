import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { TextMaskModule } from 'angular2-text-mask';
import { PopoverModule } from "ngx-popover";
import { NgxPaginationModule } from 'ngx-pagination';
import { AgmCoreModule } from '@agm/core';

import { AppConfigModule, APP_DI_CONFIG } from '../../app-config.module';
import { PipeModule } from '../../shared/module/pipe.module';
import { MaterialModule } from '../../shared/module/material.module'; 
import { TreaCommonModule } from '../../shared/module/trea-common.module';
import { MultiselectDropdownModule } from 'angular-2-dropdown-multiselect';
import { FileDropModule } from 'ngx-file-drop';

import { TreaSuperAdminRoutingModule, TSAComponentList } from './trea-super-admin-routing.module';

@NgModule({
  imports: [
    CommonModule,
    TreaSuperAdminRoutingModule,
    PipeModule,
    MaterialModule,
    TextMaskModule,
    PopoverModule,
    NgxPaginationModule,
    ReactiveFormsModule,
    FormsModule,
    MultiselectDropdownModule,
    FileDropModule,
    TreaCommonModule,
    AgmCoreModule.forRoot({
        apiKey: APP_DI_CONFIG.googleMapKey,
        libraries: ["places"]
    }),
  ],
  declarations: APP_DI_CONFIG.lazyLoading ? TSAComponentList : [],
  //entryComponents: APP_DI_CONFIG.lazyLoading ? TSAEntryComponentList : [] 
})
export class TreaSuperAdminModule { }
