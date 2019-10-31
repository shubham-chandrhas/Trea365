import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormControl, FormGroupDirective, NgForm, Validators, FormGroup, FormBuilder, FormArray } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

import { GlobalService } from '../../../../shared/service/global.service';
import { HttpService } from '../../../../shared/service/http.service';
import { UtilService } from '../../../../shared/service/util.service';
import { ConstantsService } from '../../../../shared/service/constants.service';

@Component({
    selector: 'app-create-invoice',
    templateUrl: './create-invoice.component.html',
    styleUrls: ['./create-invoice.component.css']
})
export class CreateInvoiceComponent implements OnInit {
    show = false;
    isBack = false;
    moreItems = false;
    invoiceForm: FormGroup;
    public minDate = new Date();
    public servicesList:any;
    public pageData:any = null;
    public backupData:any = null;
    public submitted:boolean = false;
    filteredservices: Observable<string[]>;

    permissionsSet: any;
    constructor(
        private fb: FormBuilder,
        public dialog: MatDialog,
        public util:UtilService,
        private http:HttpService,
        private constant:ConstantsService,
		private global:GlobalService,
        public router: Router,
        private route: ActivatedRoute,
    ) { }

    ngOnInit() {
        this.util.menuChange({'menu':7,'subMenu':33});
        this.util.setPageTitle(this.route);
        window.scrollTo(0, 0);
        this.getservicesList();
        this.permissionsSet = this.util.getModulePermission(159);
        this.createForm('0');
        try{
            if(sessionStorage.getItem('CREATE_INVOICE')){
                let obj = JSON.parse(sessionStorage.getItem('CREATE_INVOICE'));
                console.log(obj);
                this.getQuotation(obj.project_estimate_id);
            }else if(sessionStorage.getItem('INV_DETAILS')){
                this.isBack = true;
                this.pageData = JSON.parse(sessionStorage.getItem('INV_DETAILS'));
                this.pageData.costs[0].shipping_and_handling = this.pageData.formData.shipping_and_handling;
                this.pageData.costs[0].adjustment = this.pageData.formData.adjustment;
                this.pageData.costs[0].taxes = this.pageData.formData.tax;
                this.pageData.notes = this.pageData.formData.notes;
                this.pageData.due_date = this.util.getYYYYMMDDDate(this.util.stringToDate(this.pageData.formData.due_date));
                for(let i = 0; i < this.pageData.formData.items.length; i++){
                    if(this.pageData.formData.items[i].itemType == 'Service'){
                        this.pageData.formData.items[i].is_service = 1;
                    }else{
                        this.pageData.formData.items[i].is_service = 0;
                    }
                }
                this.createForm('1',this.pageData);
            }else{
                this.createForm('0');
            }
        }catch(err){
            this.global.addException('Create Account','ngOnInit()', err);
        }
    }

    getQuotation(id){
        var self = this;
        this.util.showProcessing('processing-spinner');
        try{
            this.http.doGet('getProjectEstimateById/'+id, function(error: boolean, response: any){
                self.util.hideProcessing('processing-spinner');
                if( error ){
                    console.log(response)
                }else{
                    self.backupData = response.data;
                    self.pageData = response.data;
                    self.pageData.client_details.company_name = self.pageData.client_details.company_name ? self.pageData.client_details.company_name : self.pageData.client_details.first_name+" "+self.pageData.client_details.last_name

                    let prodsNservices = [];
                    for(let i  = 0; i < self.pageData.services.length; i++){
                        if(self.pageData.services[i].service_defination){
                            self.pageData.services[i].name = self.pageData.services[i].service_defination.service_definition;
                            self.pageData.services[i].id = self.pageData.services[i].service_defination.service_definition_id;
                            self.pageData.services[i].is_adhoc = 0;
                        }else{
                            //adhoc service
                            self.pageData.services[i].name = self.pageData.services[i].ad_hoc_service;
                            self.pageData.services[i].id = self.pageData.services[i].service_definition_id;
                            self.pageData.services[i].is_adhoc = 1;
                        }
                        self.pageData.services[i].is_service = 1;
                        self.pageData.services[i].uom = '';
                        self.pageData.services[i].invoice_quantity = '';
                        self.pageData.services[i].invoice_amount = 0;
                        self.pageData.services[i].add_to_invoice = true;
                        prodsNservices.push(self.pageData.services[i]);

                    }

                    for(let i  = 0; i < self.pageData.product_materials.length; i++){
                        self.pageData.product_materials[i].is_adhoc = 0;
                        self.pageData.product_materials[i].name = self.pageData.product_materials[i].manf_part.short_name;
                        self.pageData.product_materials[i].id = self.pageData.product_materials[i].manf_part.manf_part_id;
                        self.pageData.product_materials[i].is_service = 0;
                        self.pageData.product_materials[i].invoice_quantity = '';
                        self.pageData.product_materials[i].invoice_amount = 0;
                        self.pageData.product_materials[i].uom = self.pageData.product_materials[i].manf_part ? self.pageData.product_materials[i].manf_part.uom_name.uom_symbol : '';
                        self.pageData.product_materials[i].add_to_invoice = true;
                        prodsNservices.push(self.pageData.product_materials[i]);
                    }

                    self.pageData.prodsNservices = prodsNservices;
                    self.pageData.pe_payment_schedule_id = JSON.parse(sessionStorage.getItem('CREATE_INVOICE')).pe_payment_schedule_id ? JSON.parse(sessionStorage.getItem('CREATE_INVOICE')).pe_payment_schedule_id : '';
                    self.createForm('1',self.pageData);
                }
            });
        }catch(err){
            this.global.addException('Create Account','getQuotation()', err);
        }
    }
    getservicesList(){
        var self = this;
        try{
            this.http.doGet('businessType', function(error: boolean, response: any){
                self.util.hideProcessing('processing-spinner');
                if(error){
                  console.log("error",response);
                }else{
                      if(response.data){
                        self.servicesList = [];
                        for (let i = 0; i < response.data.length; i++) {
                            for (let j = 0; j < response.data[i].services.length; j++) {
                                for (let k = 0; k < response.data[i].services[j].serviceDefinition.length; k++) {
                                    self.servicesList.push({
                                      'service_definition_id': response.data[i].services[j].serviceDefinition[k].service_definition_id,
                                    //   'ad_hoc_service' : response.data[i].services[j].serviceDefinition[k].name,
                                      'ad_hoc_service' : response.data[i].services[j].serviceType+' ('+response.data[i].services[j].serviceDefinition[k].name+')',
                                      'cost' : response.data[i].services[j].serviceDefinition[k].price,
                                      'type' : 'Service',
                                      'prdtype' : '',
                                      'uom': ''
                                  });
                                }
                            }
                        }
                        self.getMaterialList();
                    }
                }
            });
        }catch(err){
            this.global.addException('Create Account','getservicesList()', err);
        }
    }
    getMaterialList(){
        var self = this;
        try{
            this.http.doGet('materials', function(error: boolean, response: any){
                self.util.hideProcessing('processing-spinner');
                if(error){ console.log(response) }else{
                    if(response.data){
                        console.log("Material list ::" ,response.data);
                        for (let i = 0; i < response.data.length; i++) {
                            self.servicesList.push({
                              'service_definition_id': response.data[i].manf_part_id,
                              'ad_hoc_service' : response.data[i].short_name,
                              'cost' : response.data[i].cost,
                              'type' : 'Product',
                              'prdtype' : response.data[i].type,
                              'uom' : response.data[i].uom_name ? response.data[i].uom_name.uom_symbol : '',
                          });
                        }

                    }
                }
            });
        }catch(err){
            this.global.addException('Create Account','getMaterialList()', err);
        }
    }
    private serviceFilter(value: string): string[] {
        try{
            return this.servicesList.filter(option => option.ad_hoc_service.toLowerCase().includes(value ? value.toLowerCase() : ''));
        }catch(err){
            this.global.addException('Create Invoice','serviceFilter()',err);
        }
    }

    getSelectedService(service, event: any = false, index): void {
        if(event.isUserInput){
            console.log("service :: ",service);
            this.unlisted_items.at(index).get('id').setValue(service.service_definition_id);
            this.unlisted_items.at(index).get('cost').setValue(service.cost);
            this.unlisted_items.at(index).get('type').setValue(service.type);
            this.unlisted_items.at(index).get('prdtype').setValue(service.prdtype);
            this.unlisted_items.at(index).get('uom').setValue(service.uom);
        }
    }
    public validateService(event:any, item:any, index){
        let service = event.target.value;
        if(service == ''){
            item.get('id').setValue('');
            return;
        }
        let match = this.servicesList.filter(item=>item.ad_hoc_service.toLowerCase() == service.toLowerCase());
        if(match.length > 0){
            item.get('id').setValue(match[0].service_definition_id);
            item.get('ad_hoc_service').setValue(match[0].ad_hoc_service);
        }else{
            item.get('id').setValue('');
        }
    }

    createForm(option, val:any = {}){
        try{
            this.invoiceForm = this.fb.group({
                due_date:new FormControl(option == '0' ? '' : val.due_date, [Validators.required]),
                notes:new FormControl(option == '0' ? '' : val.notes,[Validators.maxLength(this.constant.DEFAULT_COMMENT_MAXLENGTH)]),
                shipping_and_handling:new FormControl(option == '0' ? '' : val.costs[0].shipping_and_handling, [Validators.pattern(this.constant.AMOUNT_PATTERN)]),
                adjustment:new FormControl(option == '0' ? '' : val.costs[0].adjustment, [Validators.pattern(this.constant.AMOUNT_NEG_PATTERN)]),
                tax: new FormControl(option == '0' ? '' : val.costs[0].taxes, [Validators.pattern(this.constant.AMOUNT_PATTERN), Validators.min(0), Validators.max(100)]),
                items: this.fb.array([]),
                pe_payment_schedule_id: new FormControl(option == '0' ? '' : val.pe_payment_schedule_id),
                unlisted_items: this.fb.array([]),
            });
            if( option == '1' ){
                if(this.isBack){
                    for(let i = 0; i < val.formData.items.length; i++){
                        this.addItem('1',val.formData.items[i]);
                    }
                    for(let i = 0; i < val.formData.unlisted_items.length; i++){
                        this.addUnlistedItems('1',val.formData.unlisted_items[i]);
                    }
                }else{
                    for(let i = 0; i < val.prodsNservices.length; i++){
                        if(val.prodsNservices[i].invoice_remaining_quantity > 0 && val.prodsNservices[i].is_approved == '1'){
                            this.addItem('1',val.prodsNservices[i]);
                        }
                    }
                }
                this.util.hideProcessing('processing-spinner');
            }
        }catch(err){
            this.global.addException('Create Account','createForm()', err);
        }
    }
    get due_date() { return this.invoiceForm.get('due_date'); }
    get notes() { return this.invoiceForm.get('notes'); }
    get tax() { return this.invoiceForm.get('tax'); }
    get shipping_and_handling() { return this.invoiceForm.get('shipping_and_handling'); }
    get adjustment() { return this.invoiceForm.get('adjustment'); }
    get items(): FormArray{ return <FormArray>this.invoiceForm.get('items') as FormArray; }
    get unlisted_items(): FormArray{ return <FormArray>this.invoiceForm.get('unlisted_items') as FormArray; }

    addItem(option, val:any = {}){
        try{
            this.items.push(this.fb.group({
                itemType: new FormControl(option == '0' ? 'Service' : val.is_service == '1' ? 'Service': 'Product'), //Only for edit
                isItemDelete: new FormControl('0'), //Only for edit
                type: new FormControl(option == '0' ? null : val.is_service == '1' ? null : val.type), //Only for edit
                is_adhoc: new FormControl(option == '0' ? '0' : val.is_adhoc ), //Only for edit
                id: new FormControl(option == '0' ? '0' : val.id ), //Only for edit
                name: new FormControl(option == '0' ? '' : val.name ), //Only for review
                pe_service_id: new FormControl(option == '0' ? '' : val.pe_service_id ? val.pe_service_id : null ), //Only for review
                pe_product_material_id: new FormControl(option == '0' ? '' : val.pe_product_material_id ? val.pe_product_material_id : null ), //Only for review
                details: new FormControl(option == '0' ? '' : val.details ), //Only for review
                cost: new FormControl(option == '0' ? '' : val.cost ),
                quantity: new FormControl(option == '0' ? '' : val.quantity), //Only for review
                uom: new FormControl(option == '0' ? '' : val.uom), //Only for review
                invoice_remaining_quantity: new FormControl(option == '0' ? '' : val.invoice_remaining_quantity), //Only for review
                total_amount: new FormControl(option == '0' ? '' : val.total_amount),
                add_to_invoice: new FormControl(option == '0' ? '' : val.add_to_invoice),
                invoice_quantity: new FormControl(option == '0' ? '' : val.invoice_remaining_quantity, val.add_to_invoice ? [Validators.required, Validators.max(val.invoice_remaining_quantity), Validators.pattern(this.constant.AMOUNT_PATTERN)] : []),
                invoice_amount: new FormControl(option == '0' ? '' : val.invoice_amount),
                is_unlisted: new FormControl('0'),
            }));
            this.calculateInvAmt(this.items.length - 1);
        }catch(err){
            this.global.addException('Create Account','addItem()', err);
        }
    }

    addUnlistedItems(option, val:any = {}){
        try{
            this.unlisted_items.push(this.fb.group({
                isItemDelete: new FormControl('0'), //Only for edit
                id: new FormControl(option == '0' ? '0' : val.id ), //Only for edit
                ad_hoc_service: new FormControl(option == '0' ? '' : val.ad_hoc_service, [Validators.required]), //Only for review
                cost: new FormControl(option == '0' ? '' : val.cost, [Validators.required, Validators.pattern(this.constant.AMOUNT_PATTERN)]),
                type: new FormControl(option == '0' ? '' : val.type), //Only for review
                prdtype : new FormControl(option == '0' ? '' : val.prdtype), //Only for review
                uom : new FormControl(option == '0' ? '' : val.uom), //Only for review
                quantity: new FormControl(option == '0' ? '' : val.quantity, 
                [Validators.required, Validators.pattern(this.constant.AMOUNT_NEG_PATTERN)]), //Only for review
                total_amount: new FormControl(option == '0' ? '0' : val.total_amount, [  ]),
                details: new FormControl(option == '0' ? '' : val.details, [  ]),
                is_unlisted: new FormControl(option == '0' ? '1' : val.is_unlisted, [  ]),
                filteredService: new FormControl( new Observable<string[]>() ),
            }));
            console.log("this.unlisted_items::::",this.unlisted_items);
            this.setObservable(this.unlisted_items.length - 1);
            this.checkUnlistedItemsCount();
        }catch(err){
            this.global.addException('Create Account','addUnlistedItems()', err);
        }
    }

    setObservable(index): void {
        try{
            this.unlisted_items.at(index).get('filteredService').setValue(this.unlisted_items.at(index).get('ad_hoc_service').valueChanges.pipe(startWith(''),map(value => this.serviceFilter(value))));
        }catch(err){
            this.global.addException('Create Account','setObservable()', err);
        }
    }

    checkUnlistedItemsCount(){
        if(this.unlisted_items.value.length > 0){
            this.moreItems = true;
        }else{
            this.moreItems = false;
        }
    }
    removeItem(position, item){
        this.unlisted_items.removeAt(position);
        this.checkUnlistedItemsCount();
        this.calculateTotal();
    }

    private validateInvQtyInput(callback){
        try{
            for(let i = 0; i < this.items.value.length; i++){
                this.util.removeCommas(this.items.at(i).get('invoice_quantity'));
                if( (this.items.at(i).get('invoice_quantity').value != '' && this.items.at(i).get('invoice_quantity').value != undefined && !this.constant.AMOUNT_NEG_PATTERN.test(this.items.at(i).get('invoice_quantity').value)) ){
                    return callback(false);
                }
            }
        }catch(err){
            this.global.addException('Create Account','validateInvQtyInput()', err);
        }
        return callback(true);
    }
    calculateInvAmt(index){
        let self = this;
        try{
            this.validateInvQtyInput(function(response){
                let invAmt = 0;
                if(!response){
                    invAmt = ( 0 * self.items.at(index).get('cost').value);
                }else{
                    invAmt = (self.items.at(index).get('invoice_quantity').value * self.items.at(index).get('cost').value);
                }
                self.items.at(index).get('invoice_amount').setValue(invAmt);
                self.calculateTotal();
            });
        }catch(err){
            this.global.addException('Create Account','calculateInvAmt()', err);
        }
    }
    changeAddToInvoice(index){
        try{
            if(this.items.at(index).get('add_to_invoice').value){
                this.util.addBulkValidators(this.invoiceForm, [this.items.at(index).get('invoice_quantity')], [Validators.required, Validators.pattern(this.constant.AMOUNT_NEG_PATTERN)], 'ARRAY');
            }else{
                this.util.addBulkValidators(this.invoiceForm, [this.items.at(index).get('invoice_quantity')], [], 'ARRAY');
            }
            this.calculateTotal();
        }catch(err){
            this.global.addException('Create Account','changeAddToInvoice()', err);
        }
    }

    calculateTotal(){
        let self = this;
        let subTotal:any = 0;
        try{
            for(let i = 0; i < this.items.value.length; i++){
                if(this.items.at(i).get('add_to_invoice').value){
                    if(this.items.at(i).get('invoice_quantity').value == ''){
                        subTotal = parseFloat(subTotal) + parseFloat(this.items.at(i).get('total_amount').value);
                    }else{
                        subTotal = parseFloat(subTotal) + parseFloat(this.items.at(i).get('invoice_amount').value);
                    }
                }
            }
            for(let i = 0; i < this.unlisted_items.value.length; i++){
                subTotal = parseFloat(subTotal) + parseFloat(this.unlisted_items.at(i).get('total_amount').value);
            }

            let totalForTax = parseFloat(self.invoiceForm.get('shipping_and_handling').value) + parseFloat(self.invoiceForm.get('adjustment').value) + parseFloat(subTotal);
            var itemTax = self.invoiceForm.get('tax').value == null ? 0 : self.invoiceForm.get('tax').value;
            if(itemTax.length > 0){
                self.pageData.costs[0].tax_amount = ( (parseFloat(itemTax) / 100) * totalForTax ).toFixed(2);
            }else{
                self.pageData.costs[0].tax_amount = 0;
            }
            console.log('tax amt',self.pageData.costs[0].tax_amount);
            let total = parseFloat(self.invoiceForm.get('shipping_and_handling').value) + parseFloat(self.invoiceForm.get('adjustment').value) + parseFloat(self.pageData.costs[0].tax_amount) + parseFloat(subTotal);
            this.pageData.costs[0].subtotal = subTotal;
            this.pageData.costs[0].total_cost = total;
        }catch(err){
            this.global.addException('Create Account','calculateTotal()', err);
        }
    }

    private validateOtherInput(callback){
        try{
            this.util.removeCommas(this.invoiceForm.get('shipping_and_handling'));
            this.util.removeCommas(this.invoiceForm.get('adjustment'));
            if( (this.invoiceForm.get('shipping_and_handling').value != '' && this.invoiceForm.get('shipping_and_handling').value != undefined && !this.constant.AMOUNT_PATTERN.test(this.invoiceForm.get('shipping_and_handling').value)) || (this.invoiceForm.get('adjustment').value != '' && this.invoiceForm.get('adjustment').value != undefined && !this.constant.AMOUNT_PATTERN.test(this.invoiceForm.get('adjustment').value)) ){
                return callback(false);
            }
        }catch(err){
            this.global.addException('Create Account','validateOtherInput()', err);
        }
        return callback(true);
    }

    calculateOthers(type){
        let self = this;
        try{
            this.validateOtherInput(function(response){
                if(response){ self.calculateTotal(); }
            });
        }catch(err){
            this.global.addException('Create Account','calculateOthers()', err);
        }
    }

    private validateTaxInput(callback){
        try{
            if(this.invoiceForm.get('tax').value != '' && this.invoiceForm.get('tax').value != undefined && !this.constant.AMOUNT_PATTERN.test(this.invoiceForm.get('tax').value)){
                    return callback(false);
            }
        }catch(err){
            this.global.addException('Create Account','validateTaxInput()', err);
        }
        return callback(true);
    }
    calculateTaxes(){
        let self = this;
        try{
            this.validateTaxInput(function(response){
                if(!response){return;}

                if(self.invoiceForm.get('tax').value != '' && self.pageData.costs[0].subtotal > 0){
                    var itemTax = self.invoiceForm.get('tax').value == null ? 0 : self.invoiceForm.get('tax').value;
                    self.pageData.costs[0].tax_amount = ( (parseFloat(itemTax) / 100) * parseFloat(self.pageData.costs[0].subtotal) ).toFixed(2);
                }else{
                    self.pageData.costs[0].tax_amount = 0;
                }
                self.calculateTotal();
            });
        }catch(err){
            this.global.addException('Create Account','calculateTaxes()', err);
        }
    }
    private validateInvQtyInputUnlist(callback){
        try{
            for(let i = 0; i < this.unlisted_items.value.length; i++){
                if( (this.unlisted_items.at(i).get('quantity').value != '' && this.unlisted_items.at(i).get('quantity').value != undefined && !this.constant.AMOUNT_NEG_PATTERN.test(this.unlisted_items.at(i).get('quantity').value)) || (this.unlisted_items.at(i).get('cost').value != '' && this.unlisted_items.at(i).get('cost').value != undefined && !this.constant.AMOUNT_NEG_PATTERN.test(this.unlisted_items.at(i).get('cost').value)) ){
                    return callback(false);
                }
            }
        }catch(err){
            this.global.addException('Create Account','validateInvQtyInputUnlist()', err);
        }
        return callback(true);
    }
    calculateInvAmtUnlist(index){
        let self = this;
        try{
            this.validateInvQtyInput(function(response){
                let invAmt = 0;
                if(!response){
                    return;
                }else{
                    invAmt = (self.unlisted_items.at(index).get('quantity').value * self.unlisted_items.at(index).get('cost').value);
                }
                self.unlisted_items.at(index).get('total_amount').setValue(invAmt);
                self.calculateTotal();
            });
        }catch(err){
            this.global.addException('Create Account','calculateInvAmtUnlist()', err);
        }
    }

    next(form:FormGroup){
        try{
            this.submitted = true;
            if(form.valid){
                this.pageData.formData = form.value;
                this.pageData.formData.unlisted_items.forEach((value)=>{
                    delete value.filteredService;
                })
                this.pageData.formData.due_date = this.util.getDDMMYYYYDate(this.pageData.formData.due_date);
                sessionStorage.setItem('INV_DETAILS', JSON.stringify(this.pageData));
                sessionStorage.removeItem('CREATE_INVOICE');
                this.router.navigate(['/account/csa/review-invoice']);
            }
        }catch(err){
            this.global.addException('Create Account','next()', err);
        }
    }

    cancel(){
        sessionStorage.removeItem('CREATE_INVOICE');
        sessionStorage.removeItem('INV_DETAILS');
        this.router.navigate(['/account/csa/invoice-list/0']);
    }

}
