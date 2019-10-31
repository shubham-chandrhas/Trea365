import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

//import { QuotationComponent } from './quotation/quotation.component';
import { QuotationComponent } from '../../component/email-template/quotation/quotation.component';
import { InvoiceComponent } from './invoice/invoice.component';

const routes: Routes = [ 
  { path: 'quotation/:pe_token', component: QuotationComponent, data: { title: 'Quotation'} },
  { path: 'invoice/:invoice_token', component: InvoiceComponent, data: { title: 'Invoice'} },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EmailTemplateRoutingModule { }
