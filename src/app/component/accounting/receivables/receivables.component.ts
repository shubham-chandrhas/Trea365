import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormControl, FormGroupDirective, NgForm, Validators, FormGroup, FormBuilder, FormArray } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import * as _ from 'underscore';

import { UtilService } from '../../../shared/service/util.service';
import { HttpService } from '../../../shared/service/http.service';
import { ConstantsService } from '../../../shared/service/constants.service';
import { GlobalService } from '../../../shared/service/global.service';
import { DialogComponent } from '../../../shared/model/dialog/dialog.component';
import { ExportService } from '../../../shared/service/export.service';

@Component({
    selector: 'app-receivables',
    templateUrl: './receivables.component.html',
    styleUrls: ['./receivables.component.css']
})

export class ReceivablesComponent implements OnInit {
    receivablesList: any[] = [];
    paymentSchedules: any[] = [];
    selectedReceivable: any;
    selectedIndex;
    sortColumn: string = 'due_date';
    sortOrder: string = 'ASC';
    columnType: string = 'A';
    searchData: any = {};
    searchList;
    searchTxt;
    listCount:number = 0;
    paginationKey:any;
    errMsg:string = '';
    isError:boolean = false;
    routeObj:any;
    public isRecord:boolean = false;
    public submittedPay:boolean = false;
    minDate = new Date();
    today:any = new Date();
    permissionsSet: any;

    public onBoarding:boolean = false;

    //public selectedInvoice: any = null;
    timeLineData: any = { 'thirty': true, 'sixty': false, 'ninty': false, 'oneEighty': false };
    recordPayForm:FormGroup;
    pageData:any = {};

    constructor(
        public dialog: MatDialog,
		public util:UtilService,
        public router: Router,
        private http: HttpService,
        public constant:ConstantsService,
        private global: GlobalService,
        private file:ExportService,
        private fb: FormBuilder,
        public route: ActivatedRoute,
        private location: Location
    ) { }

    ngOnInit() {
        let self = this;
        this.today.setHours(0,0,0,0);
        this.util.setPageTitle(this.route);
        self.util.menuChange({'menu':7,'subMenu':32});
        this.routeObj = { 'list': '/account/csa/invoice-list/0', 'add': '/account/csa/create-invoice' }
        self.paginationKey = { itemsPerPage: self.constant.ITEMS_PER_PAGE, currentPage: self.constant.CURRENT_PAGE };
        self.util.setWindowHeight();
        this.getReceivable(30);
        this.permissionsSet = this.util.getModulePermission(7);
    }

    getSearchTxt(filterValue: string) { if(filterValue == ''){ this.searchTxt = '' } }
    updateCount(count){ this.constant.ITEM_COUNT = this.listCount = count ; }
    generatepdf(){ this.file.generatePortraitpdf('receivable-tbl', 'Receivable List', 'receivable_list'); }
    generatecsv(){ this.file.generatecsv('receivable-csv-tbl', 'receivable_list'); }

    getReceivable(days): void {
        let self = this;
        this.selectedIndex = null;
        try{
            this.util.showProcessing('processing-spinner');
            this.http.doGet('getReceivableList/'+days, function(error: boolean, response: any){
                self.util.hideProcessing('processing-spinner');
                if(error){ } else{
                    self.pageData.totalAmount = 0;
                    self.pageData.amountRemaining = 0;
                    self.receivablesList = response.data ? response.data : [];
                    self.receivablesList.filter(item => (item.name = item.client.company_name ? item.client.company_name : item.client.first_name+" "+item.client.last_name, item.total_amount = parseFloat(item.total_payment_amount), item.paid_amount = parseFloat(item.total_payment_amount) - item.remaining_amount ));
                    for (var i = 0; i < self.receivablesList.length; i++) {
                        self.pageData.totalAmount += parseFloat(self.receivablesList[i].total_amount)
                        self.pageData.amountRemaining += parseFloat(self.receivablesList[i].remaining_amount);
                        self.receivablesList[i].remaining_amount = parseFloat(self.receivablesList[i].remaining_amount);
                        self.receivablesList[i].dateInMS = new Date(self.receivablesList[i].due_date);
                        self.receivablesList[i].due_date = self.util.getFormatedDate(self.receivablesList[i].due_date);
                    }
                    self.route.snapshot.paramMap.get('id') != '0' ? self.showReceivableDetails() : '' ;
                    console.log('list of receivable=',self.receivablesList);
                }
                if(self.receivablesList.length == 0) {
                    self.onBoarding = true;
                  }
            });


        }catch(err){
            this.global.addException('Receivale','getReceivable()',err);
        }
    }

    showReceivableDetails(): void {
        try{
            let sortedList: any[] = _.sortBy(this.receivablesList, 'invoice_date');
            for (var i = 0; i < sortedList.length; ++i) {
                this.route.snapshot.paramMap.get('id') == sortedList[i].invoice_id ? (this.getSelectedInvoice(sortedList[i], i), this.selectedIndex = i) : '';
            }
        }catch(err){
            this.global.addException('Receivale','getReceivable()',err);
        }
    }

    getSelectedInvoice(invoice, index): void {
        this.selectedIndex = index;
        this.location.go('/account/csa/acc-receivables/'+invoice.invoice_id);
        this.getPaymentSchedules(invoice.invoice_id, invoice.name, index);
    }

    getPaymentSchedules(id, clientName, index): void {
        let self = this;
        this.selectedIndex = index;
        this.submittedPay = false;
        try{
            this.util.showProcessing('processing-spinner');
            this.http.doGet('getReceivableById/'+id, function(error: boolean, response: any){
                self.util.hideProcessing('processing-spinner');
                if(error){ } else{
                    self.selectedReceivable = response.data;
                    self.selectedReceivable.name = clientName;
                    self.selectedReceivable.total_payment_amount = parseFloat(self.selectedReceivable.total_payment_amount);
                    self.selectedReceivable.amount_paid = parseFloat(self.selectedReceivable.total_payment_amount) - parseFloat(self.selectedReceivable.remaining_amount);

                    //self.selectedReceivable.paymentSchedules.filter(item => (item.amount_due = parseFloat(item.amount_due), item.invoice_amount = parseFloat(item.invoice_amount)));
                    self.createRecordPayForm('0');
                    //console.log("self.route.snapshot.paramMap.get('id')", self.route.snapshot.paramMap.get('id'));
                    setTimeout(function() {
                        self.util.scrollDown('receivableMark');
                    }, 1000);
                }
            });
        }catch(err){
            this.global.addException('Receivale', 'getPaymentSchedules()', err);
        }
    }

    createInvoice(paymentSchedule): void {
        sessionStorage.setItem('CREATE_INVOICE', JSON.stringify(paymentSchedule));
        this.router.navigate(['/account/csa/create-invoice']);
    }
    public recordPay(){
        this.isRecord = !this.isRecord;
        if(this.isRecord){
            this.createRecordPayForm('0');
        }
    }
    removeItem(position){
        this.items.removeAt(position);
    }
    public saveRecordPay(form:FormGroup){
        let self = this;
        this.submittedPay = true;
        try{
            if(form.valid){
                let reqObj: any = {};
                let totalPay: number = 0;
                reqObj.invoice_id = this.selectedReceivable.invoice_id;
                reqObj.payments = form.value.items;
                reqObj.payments.filter(item=>( item.payment_date = this.util.getYYYYMMDDDate(item.payment_date) ));
                self.isError = false;
                self.errMsg = '';
                form.value.items.forEach(function(element) { totalPay += parseFloat(element.payment_amount); });
                //@@ Commented code by Yogesh for remove validation
                // if(totalPay > this.selectedReceivable.remaining_amount){
                //     self.isError = true;
                //     self.errMsg = 'Total payment amount should be less than remaining amount.';
                //     return;
                // }
                self.util.addSpinner('savePay', "Save");
                this.http.doPost('recordInvoicePayment', reqObj, function(error: boolean, response: any){
                    self.util.removeSpinner('savePay', "Save");
                    if(error){
                        self.isError = true;
                        self.errMsg = response.message;
                    }else{
                        self.util.showDialog(DialogComponent, response.message, [ '/account/csa/acc-receivables/0' ]);
                        self.getReceivable(30);
                        self.getPaymentSchedules(self.selectedReceivable.invoice_id, self.selectedReceivable.name, self.selectedIndex);
                    }
                });
            }
        }catch(err){
            this.global.addException('Receivale', 'saveRecordPay()', err);
        }
    }
    createRecordPayForm(option, val:any = {}){
        try{
            this.recordPayForm = this.fb.group({
                items: this.fb.array([]),
            });
            if( option == '1' ){
                for(let i = 0; i < val.prodsNservices.length; i++){
                    this.addItem('1',val.prodsNservices[i]);
                }
                this.util.hideProcessing('processing-spinner');
            }else{
                this.addItem('0');
            }
        }catch(err){
            this.global.addException('Receivale', 'saveRecordPay()', err);
        }
    }
    get items(): FormArray{ return <FormArray>this.recordPayForm.get('items') as FormArray; }
    addItem(option, val:any = {}){
        try{
            this.items.push(this.fb.group({
                payment_date: new FormControl(option == '0' ? '' : val.payment_date, [Validators.required]), //Only for edit
                payment_amount: new FormControl(option == '0' ? '' : val.payment_amount, [Validators.required, Validators.pattern(this.constant.AMOUNT_PATTERN)] ), //Only for edit
                payment_method: new FormControl(option == '0' ? '' : val.payment_method, []), //Only for review
                payment_reference: new FormControl(option == '0' ? '' : val.payment_reference, []), //Only for review
            }));
        }catch(err){
            this.global.addException('Receivale', 'saveRecordPay()', err);
        }
    }
    timeLineChange(event, id){
        this.timeLineData.thirty = id == 'thirty' ? true : false;
        this.timeLineData.sixty = id == 'sixty' ? true : false;
        this.timeLineData.ninty = id == 'ninty' ? true : false;
        this.timeLineData.oneEighty = id == 'oneEighty' ? true : false;
        this.getReceivable(event.target.value);
    }
}
