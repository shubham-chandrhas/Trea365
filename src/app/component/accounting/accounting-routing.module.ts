import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Accounting Components
import { PayablesComponent } from '../accounting/payables/payables.component';
import { ReceivablesComponent } from '../accounting/receivables/receivables.component';
import { CreateInvoiceComponent } from '../accounting/invoice/create-invoice/create-invoice.component';
import { InvoiceListComponent } from '../accounting/invoice/invoice-list/invoice-list.component';
import { NewInvoiceComponent } from '../accounting/invoice/new-invoice/new-invoice.component';
import { LedgerListComponent } from '../accounting/ledger/ledger-list/ledger-list.component';
import { ReviewInvoiceComponent } from '../accounting/invoice/review-invoice/review-invoice.component';
import { InvoiceQuotationReviewComponent } from '../accounting/invoice/invoice-quotation-review/invoice-quotation-review.component';
import { AccountingDialog } from '../accounting/accounting-dialog.component';

import { CSALandingComponent } from '../dashboard/company-super-admin/landing.component';

import { RoleGuardService as RoleGuard } from '../../auth/role-guard.service';

export const AccountingComponentList = [ PayablesComponent, ReceivablesComponent, CreateInvoiceComponent, InvoiceListComponent,NewInvoiceComponent,LedgerListComponent, ReviewInvoiceComponent, AccountingDialog, InvoiceQuotationReviewComponent ];
export const AccountingEntryComponentList = [ AccountingDialog ];

const routes: Routes = [
    { path: 'csa', component: CSALandingComponent ,
    children: [
       { path: 'acc-payables/:id', component: PayablesComponent, data: { permissionLevelId: 152, title: 'Financials - Payables' } },
       { path: 'acc-receivables/:id', component: ReceivablesComponent, data: { permissionLevelId: 148, title: 'Financials - Receivables' } },
       { path: 'invoice-list/:id', component: InvoiceListComponent, data: { permissionLevelId: 156, title: 'Financials - Invoice List' } },
       { path: 'new-invoice', component: NewInvoiceComponent, data: { permissionLevelId: 156, title: 'Financials - Create Invoice' } },
       { path: 'ledger-list/:id', component: LedgerListComponent, data: { permissionLevelId: 164, title: 'Financials - Ledger' } },
       { path: 'create-invoice', component: CreateInvoiceComponent, data: { permissionLevelId: 156, title: 'Financials - Create Invoice' } },
       { path: 'review-invoice', component: ReviewInvoiceComponent, data: { permissionLevelId: 156, title: 'Financials - Create Invoice' } },
       { path: 'invoice-quote-review', component: InvoiceQuotationReviewComponent, data: { permissionLevelId: 156, title: 'Financials - Create Invoice' } },
    ],
    canActivate: [ RoleGuard ], 
    data: { expectedRole: [ 2, 3 ] }
    },
    { path: '**', redirectTo: '404', pathMatch: 'full', data: { title: '404' } },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AccountingRoutingModule { }
