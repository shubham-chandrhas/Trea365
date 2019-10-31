import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MultiselectDropdownModule } from 'angular-2-dropdown-multiselect';
import { TextMaskModule } from 'angular2-text-mask';
import { NgxPaginationModule } from 'ngx-pagination';

import { AppConfigModule, APP_DI_CONFIG } from '../../../app-config.module';
import { AuditRoutingModule, AuditComponentList, AuditEntryComponentList } from './audit-routing.module';
import { TreaCommonModule } from '../../../shared/module/trea-common.module';
import { MaterialModule } from '../../../shared/module/material.module';
import { PipeModule } from '../../../shared/module/pipe.module';

@NgModule({
  imports: [
    CommonModule,
    AuditRoutingModule,
    TreaCommonModule,
    ReactiveFormsModule,
    FormsModule,
    MultiselectDropdownModule,
    TextMaskModule,
    NgxPaginationModule,
    MaterialModule,
    PipeModule
  ],
  declarations: APP_DI_CONFIG.lazyLoading ? AuditComponentList : [],
  entryComponents: APP_DI_CONFIG.lazyLoading ? AuditEntryComponentList : []
})
export class AuditModule { }
