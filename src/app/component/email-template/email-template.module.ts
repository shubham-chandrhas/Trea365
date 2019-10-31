import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import {  MatProgressSpinnerModule  } from '@angular/material';

import { EmailTemplateRoutingModule } from './email-template-routing.module';
import { QuotationComponent } from './quotation/quotation.component';
import { ProjectEstimatorService } from '../workflow/project-estimator/project-estimator.service';
import { InvoiceComponent } from './invoice/invoice.component';


@NgModule({
  imports: [
    CommonModule,
    EmailTemplateRoutingModule,
    MatProgressSpinnerModule
  ],
  declarations: [QuotationComponent, InvoiceComponent],
  providers: [ ProjectEstimatorService ]
})
export class EmailTemplateModule { }
