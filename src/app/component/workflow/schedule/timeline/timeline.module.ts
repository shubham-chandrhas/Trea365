import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { TextMaskModule } from 'angular2-text-mask';

import { MaterialModule } from '../../../../shared/module/material.module';
import { AppConfigModule, APP_DI_CONFIG } from '../../../../app-config.module';
import { TimelineRoutingModule, TimelineComponentList, TimelineEntryComponentList } from './timeline-routing.module';

@NgModule({
  imports: [
    CommonModule,
    TimelineRoutingModule,
    ReactiveFormsModule, 
    TextMaskModule,
    FormsModule,
    MaterialModule
  ],
  declarations: APP_DI_CONFIG.lazyLoading ? TimelineComponentList : [],
  entryComponents: APP_DI_CONFIG.lazyLoading ? TimelineEntryComponentList : [],
})
export class TimelineModule { }
