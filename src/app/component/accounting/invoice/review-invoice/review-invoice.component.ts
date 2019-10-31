import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';

import { UtilService } from '../../../../shared/service/util.service';
import { HttpService } from '../../../../shared/service/http.service';
import { GlobalService } from '../../../../shared/service/global.service';
import { DialogComponent } from '../../../../shared/model/dialog/dialog.component';
import { APP_CONFIG, AppConfig } from '../../../../app-config.module';

@Component({
    selector: 'app-review-invoice',
    templateUrl: './review-invoice.component.html',
    styleUrls: ['./review-invoice.component.css']
})
export class ReviewInvoiceComponent implements OnInit {
    pageData:any;
    private routeObj: any;
    public errMsg:string = '';
    public isError:boolean = false;
    public isSendInvoices:boolean = true;
    constructor(
        public dialog: MatDialog,
        public util:UtilService,
        public http:HttpService,
        public router: Router,
        private global: GlobalService,
        public route: ActivatedRoute,
        @Inject(APP_CONFIG)
        private config: AppConfig
    ) { }

    ngOnInit() {
        this.util.menuChange({'menu':7,'subMenu':33});
        this.util.setPageTitle(this.route);
        this.util.setWindowHeight();
        this.routeObj = { 'list': '/account/csa/invoice-list/0', 'add': '/account/csa/new-invoice' }
        if(sessionStorage.getItem('INV_DETAILS')){
            this.pageData = JSON.parse(sessionStorage.getItem('INV_DETAILS'));            
            console.log('Page Data',this.pageData);
        }
    }

    IsSendInvoice(isSend){
        let self = this;
        self.isSendInvoices = isSend.isSendInvoices;
    }

    sendInvoice(){
        let self = this;
        self.util.addSpinner('send', "Create Invoice");
        let reqObj:any = {};
        try{
            reqObj.project_estimate_id = this.pageData.project_estimate_id;
            reqObj.pe_payment_schedule_id = this.pageData.pe_payment_schedule_id;
            reqObj.client_id = this.pageData.client_id;
            reqObj.client_contact_id = this.pageData.client_contact_id;
            reqObj.client_billing_location_id = this.pageData.client_billing_location_id;
            reqObj.due_date = JSON.parse(JSON.stringify(this.pageData.formData.due_date));
            reqObj.due_date = this.util.getYYYYMMDDDate(this.util.stringToDate(reqObj.due_date));
            reqObj.notes = this.pageData.formData.notes;
            
            reqObj.shipping_and_handling = this.pageData.formData.shipping_and_handling;
            reqObj.adjustment = this.pageData.formData.adjustment;
            reqObj.taxes = this.pageData.formData.tax; //tax percent
            reqObj.subtotal = this.pageData.costs[0].subtotal;
            reqObj.total_payment_amount = this.pageData.costs[0].total_cost;
            reqObj.isSendInvoices = self.isSendInvoices;

            let services:any = [];
            let products:any = [];
            let schedules:any = [];
            for(let i = 0; i < this.pageData.formData.items.length; i++){
                let obj:any = {};
                if(this.pageData.formData.items[i].itemType == 'Service' && this.pageData.formData.items[i].add_to_invoice){
                    if(this.pageData.formData.items[i].is_adhoc == 1){
                        obj.ad_hoc_service = this.pageData.formData.items[i].name;
                    }else{
                        obj.service_definition_id = this.pageData.formData.items[i].id;
                    }
                    
                    obj.cost = this.pageData.formData.items[i].cost;
                    obj.quantity = this.pageData.formData.items[i].invoice_quantity;
                    obj.total_amount = this.pageData.formData.items[i].total_amount;
                    obj.details = this.pageData.formData.items[i].details;
                    obj.pe_service_id = this.pageData.formData.items[i].pe_service_id;
                    obj.is_unlisted = 0;
                    services.push(obj);
                }else if(this.pageData.formData.items[i].itemType == 'Product' && this.pageData.formData.items[i].add_to_invoice){
                    obj.type = this.pageData.formData.items[i].type;
                    obj.manf_part_id = this.pageData.formData.items[i].id;
                    obj.cost = this.pageData.formData.items[i].cost;
                    obj.quantity = this.pageData.formData.items[i].invoice_quantity;
                    obj.total_amount = this.pageData.formData.items[i].total_amount;
                    obj.details = this.pageData.formData.items[i].details;
                    obj.pe_product_material_id = this.pageData.formData.items[i].pe_product_material_id;
                    obj.is_unlisted = 0;
                    products.push(obj);
                }
            }
            
            for(let i = 0; i < this.pageData.formData.unlisted_items.length; i++){
                let obj:any = {};
                if(this.pageData.formData.unlisted_items[i].id!='' && this.pageData.formData.unlisted_items[i].type
                =='Service')
                {
                    obj.service_definition_id = this.pageData.formData.unlisted_items[i].id;
                    obj.cost = this.pageData.formData.unlisted_items[i].cost;
                    obj.quantity = this.pageData.formData.unlisted_items[i].quantity;
                    obj.total_amount = this.pageData.formData.unlisted_items[i].total_amount;
                    obj.details = this.pageData.formData.unlisted_items[i].details;
                    obj.is_unlisted = 1;
                    services.push(obj);
                }
                else if(this.pageData.formData.unlisted_items[i].id!='' && this.pageData.formData.unlisted_items[i].type
                    =='Product')
                {
                    obj.type = this.pageData.formData.unlisted_items[i].prdtype;
                    obj.manf_part_id = this.pageData.formData.unlisted_items[i].id;
                    obj.cost = this.pageData.formData.unlisted_items[i].cost;
                    obj.quantity = this.pageData.formData.unlisted_items[i].quantity;
                    obj.total_amount = this.pageData.formData.unlisted_items[i].total_amount;
                    obj.details = this.pageData.formData.unlisted_items[i].details;
                    obj.is_unlisted = 1;
                    products.push(obj);
                }
                else
                {
                    obj.ad_hoc_service = this.pageData.formData.unlisted_items[i].ad_hoc_service;
                    obj.cost = this.pageData.formData.unlisted_items[i].cost;
                    obj.quantity = this.pageData.formData.unlisted_items[i].quantity;
                    obj.total_amount = this.pageData.formData.unlisted_items[i].total_amount;
                    obj.details = this.pageData.formData.unlisted_items[i].details;
                    obj.is_unlisted = 1;
                    services.push(obj);
                }
                
            }
            for(let i = 0; i < this.pageData.payment_schedules.length; i++){
                let obj:any = {};
                obj.amount_due = this.pageData.payment_schedules[i].amount_due;
                obj.payment_date = this.pageData.payment_schedules[i].payment_date;
                schedules.push(obj);
            }
            reqObj.paymentSchedules = schedules;
            if(services.length){
                reqObj.services = services;
            }
            if(products.length){
                reqObj.productMaterials = products;
            }
            self.isError = false;
            self.errMsg = '';
            console.log("reqObj ::",reqObj);
            this.http.doPost('createInvoice', reqObj, function(error: boolean, response: any){
                self.util.removeSpinner('send', "Create Invoice");
                if(error){
                    console.log("error",response);
                    self.isError = true;
                    self.errMsg = response.message;
                }else{
                    sessionStorage.removeItem('INV_DETAILS');
                    self.util.showDialog(DialogComponent, response.message, [self.routeObj.list, self.routeObj.add]);
                }
            });
        }catch(err){
            this.global.addException('Invoice - Review Invoice', 'sendInvoice()', err);
        }    
    }

    previewDoc(): void {
        this.previewDataSave('previewBtn', "Preview",'PREVIEW');
    }

    previewDataSave(btnId, btnTxt, actionDoc){
        let self = this;
        self.util.addSpinner(btnId, btnTxt);
        let reqObj:any = {};
        try{
            reqObj.project_estimate_id = this.pageData.project_estimate_id;
            reqObj.pe_payment_schedule_id = this.pageData.pe_payment_schedule_id;
            reqObj.client_id = this.pageData.client_id;
            reqObj.client_contact_id = this.pageData.client_contact_id;
            reqObj.client_billing_location_id = this.pageData.client_billing_location_id;
            reqObj.due_date = JSON.parse(JSON.stringify(this.pageData.formData.due_date));
            reqObj.due_date = this.util.getYYYYMMDDDate(this.util.stringToDate(reqObj.due_date));
            reqObj.notes = this.pageData.formData.notes;
            
            reqObj.shipping_and_handling = this.pageData.formData.shipping_and_handling;
            reqObj.adjustment = this.pageData.formData.adjustment;
            reqObj.taxes = this.pageData.formData.tax; //tax percent
            reqObj.subtotal = this.pageData.costs[0].subtotal;
            reqObj.total_payment_amount = this.pageData.costs[0].total_cost;
            reqObj.isSendInvoices = false;

            let services:any = [];
            let products:any = [];
            let schedules:any = [];
            for(let i = 0; i < this.pageData.formData.items.length; i++){
                let obj:any = {};
                if(this.pageData.formData.items[i].itemType == 'Service' && this.pageData.formData.items[i].add_to_invoice){
                    if(this.pageData.formData.items[i].is_adhoc == 1){
                        obj.ad_hoc_service = this.pageData.formData.items[i].name;
                    }else{
                        obj.service_definition_id = this.pageData.formData.items[i].id;
                    }
                    
                    obj.cost = this.pageData.formData.items[i].cost;
                    obj.quantity = this.pageData.formData.items[i].invoice_quantity;
                    obj.total_amount = this.pageData.formData.items[i].total_amount;
                    obj.details = this.pageData.formData.items[i].details;
                    obj.pe_service_id = this.pageData.formData.items[i].pe_service_id;
                    obj.is_unlisted = 0;
                    services.push(obj);
                }else if(this.pageData.formData.items[i].itemType == 'Product' && this.pageData.formData.items[i].add_to_invoice){
                    obj.type = this.pageData.formData.items[i].type;
                    obj.manf_part_id = this.pageData.formData.items[i].id;
                    obj.cost = this.pageData.formData.items[i].cost;
                    obj.quantity = this.pageData.formData.items[i].invoice_quantity;
                    obj.total_amount = this.pageData.formData.items[i].total_amount;
                    obj.details = this.pageData.formData.items[i].details;
                    obj.pe_product_material_id = this.pageData.formData.items[i].pe_product_material_id;
                    obj.is_unlisted = 0;
                    products.push(obj);
                }
            }
            
            for(let i = 0; i < this.pageData.formData.unlisted_items.length; i++){
                let obj:any = {};
                if(this.pageData.formData.unlisted_items[i].id!='' && this.pageData.formData.unlisted_items[i].type
                =='Service')
                {
                    obj.service_definition_id = this.pageData.formData.unlisted_items[i].id;
                    obj.cost = this.pageData.formData.unlisted_items[i].cost;
                    obj.quantity = this.pageData.formData.unlisted_items[i].quantity;
                    obj.total_amount = this.pageData.formData.unlisted_items[i].total_amount;
                    obj.details = this.pageData.formData.unlisted_items[i].details;
                    obj.is_unlisted = 1;
                    services.push(obj);
                }
                else if(this.pageData.formData.unlisted_items[i].id!='' && this.pageData.formData.unlisted_items[i].type
                    =='Product')
                {
                    obj.type = this.pageData.formData.unlisted_items[i].prdtype;
                    obj.manf_part_id = this.pageData.formData.unlisted_items[i].id;
                    obj.cost = this.pageData.formData.unlisted_items[i].cost;
                    obj.quantity = this.pageData.formData.unlisted_items[i].quantity;
                    obj.total_amount = this.pageData.formData.unlisted_items[i].total_amount;
                    obj.details = this.pageData.formData.unlisted_items[i].details;
                    obj.is_unlisted = 1;
                    products.push(obj);
                }
                else
                {
                    obj.ad_hoc_service = this.pageData.formData.unlisted_items[i].ad_hoc_service;
                    obj.cost = this.pageData.formData.unlisted_items[i].cost;
                    obj.quantity = this.pageData.formData.unlisted_items[i].quantity;
                    obj.total_amount = this.pageData.formData.unlisted_items[i].total_amount;
                    obj.details = this.pageData.formData.unlisted_items[i].details;
                    obj.is_unlisted = 1;
                    services.push(obj);
                }
                
            }
            for(let i = 0; i < this.pageData.payment_schedules.length; i++){
                let obj:any = {};
                obj.amount_due = this.pageData.payment_schedules[i].amount_due;
                obj.payment_date = this.pageData.payment_schedules[i].payment_date;
                schedules.push(obj);
            }
            reqObj.paymentSchedules = schedules;
            if(services.length){
                reqObj.services = services;
            }
            if(products.length){
                reqObj.productMaterials = products;
            }
            self.isError = false;
            self.errMsg = '';
            console.log("reqObj ::",reqObj);
            this.http.doPost('createInvoice', reqObj, function(error: boolean, response: any){
                self.util.removeSpinner(btnId, btnTxt);
                if(error){
                    console.log("error",response);
                    self.isError = true;
                    self.errMsg = response.message;
                }else{
                    sessionStorage.removeItem('INV_DETAILS');
                    var randomNo = response.data.invoice_random_number;
                    self.util.showDialog(DialogComponent, response.message, [self.routeObj.list, self.routeObj.add]);
                    // var pdfLink =
                    // self.config.pdfEndpoint +
                    // "quotation/" +randomNo
                    // +
                    // "/pdf";
                    var previewLink =
                    self.config.pdfEndpoint +
                    "invoice/" +
                    randomNo;

                    if(actionDoc === 'PREVIEW'){
                        self.preview(previewLink);
                    } 
                }
            });
        }catch(err){
            this.global.addException('Invoice - Review Invoice', 'sendInvoice()', err);
        }    
    }

    edit(){
        sessionStorage.setItem('INV_DETAILS', JSON.stringify(this.pageData));
        this.router.navigate(['/account/csa/create-invoice']);
    }

    cancel(){
        sessionStorage.removeItem('INV_DETAILS');
        this.router.navigate(['/account/csa/invoice-list/0']);
    }

    preview(dataPreview) {
        window.open(dataPreview);
    }
}
