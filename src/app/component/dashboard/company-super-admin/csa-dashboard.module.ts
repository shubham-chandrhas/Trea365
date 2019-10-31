import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AppConfigModule, APP_DI_CONFIG } from '../../../app-config.module';
import { TreaCommonModule } from '../../../shared/module/trea-common.module';
import { MaterialModule } from '../../../shared/module/material.module'; 
import { CSADashboardRoutingModule, DashboardComponentList } from './csa-dashboard-routing.module';

@NgModule({
  imports: [ 
    CommonModule,
    //BrowserModule,
    MaterialModule,
    //BrowserAnimationsModule,
    ReactiveFormsModule,
    FormsModule,
    CSADashboardRoutingModule,
    TreaCommonModule
  ],
  declarations: APP_DI_CONFIG.lazyLoading ? DashboardComponentList : []
})
export class CSADashboardModule { }
