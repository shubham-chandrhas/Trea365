import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';

import { AppConfigModule, APP_DI_CONFIG } from '../../app-config.module';
import { TreaCommonModule } from '../../shared/module/trea-common.module';
import { MessageRoutingModule, MessageComponentList } from './message-routing.module';
import { PipeModule } from '../../shared/module/pipe.module';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MessageRoutingModule,
    NgxPaginationModule,
    TreaCommonModule,
    PipeModule
  ],
  declarations: APP_DI_CONFIG.lazyLoading ? MessageComponentList :[]
})
export class MessageModule { }
