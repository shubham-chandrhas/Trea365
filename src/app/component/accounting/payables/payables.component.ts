import { Component, OnInit, ApplicationRef} from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormControl, FormGroup, FormBuilder, FormArray, Validators, NgForm, AbstractControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import * as _ from 'underscore';

import { UtilService } from '../../../shared/service/util.service';
import { HttpService } from '../../../shared/service/http.service';
import { ConstantsService } from '../../../shared/service/constants.service';
import { GlobalService } from '../../../shared/service/global.service';
import { DialogComponent } from '../../../shared/model/dialog/dialog.component';
import { ExportService } from '../../../shared/service/export.service';
import { FileService } from '../../../shared/service/file.service';

@Component({
    selector: 'app-payables',
    templateUrl: './payables.component.html',
    styleUrls: ['./payables.component.css']
})
export class PayablesComponent implements OnInit {
    public payablesList: any[] = [];
    public paymentSchedules: any[] = [];
    public paidPaymentList: any[] = [];
    public selectedPayable: any;
    public selectedIndex;
    public sortColumn: string = 'pay_id';
    public sortOrder: string = 'DSC';
    public columnType: string = 'N';
    public searchData: any = {};
    public searchList;
    public searchTxt;
    public listCount:number = 0;
    public paginationKey:any;
    public errMsg:string = '';
    public isError:boolean = false;
    public editTab: string = '';
    public isEdit:boolean = false;
    public submitted:boolean = false;
    public fileUploaded:any[] = [];
    today:any = new Date();
    pageData: any = {'attributeList' : [{'label':'', 'format':''}], 'errMsg': '', 'isError': false, 'isAttributeError': false, 'newFileUpload': false, 'isThumbnailSet': false, 'dragOver': false, 'imgDocPriArr': []}
    public onBoarding:boolean = false;
    public addPayment:FormGroup;
    timeLineData: any = { 'thirty': true, 'sixty': false, 'ninty': false, 'oneEighty': false };

    permissionsSet: any;

    constructor(
        private fb: FormBuilder,
        public dialog: MatDialog,
		public util:UtilService,
        public router: Router,
        private http: HttpService,
        public constant:ConstantsService,
        private global: GlobalService,
        private file:ExportService,
        private fileService: FileService,
        private ref: ApplicationRef,
        public route: ActivatedRoute,
        private location: Location
    ) { }

    ngOnInit() {
        let self = this;
        this.today.setHours(0,0,0,0);
        self.util.menuChange({'menu':7,'subMenu':37});
        this.util.setPageTitle(this.route);
        self.paginationKey = { itemsPerPage: self.constant.ITEMS_PER_PAGE, currentPage: self.constant.CURRENT_PAGE };
        self.util.setWindowHeight();
        this.getPayableList(30);
        this.permissionsSet = this.util.getModulePermission(151);

        this.util.changeDetection.subscribe(dataObj => {
            if(dataObj && dataObj.source == 'UPDATE_PAYMENT'){
                this.getPayableList(30, 'REFRESH');
                this.isEdit = false;
                this.editTab = '';
            }
        });
    }

    getSearchTxt(filterValue: string) { if(filterValue == ''){ this.searchTxt = '' } }
    updateCount(count){ this.constant.ITEM_COUNT = this.listCount = count ; }
    generatepdf(){ this.file.generatePortraitpdf('payable-tbl', 'Payable List', 'payable_list'); }
    generatecsv(){ this.file.generatecsv('payable-csv-tbl', 'payable_list'); }

    showImage(url,invoices){
        if(url){
            this.dialog.open(DialogComponent, { data: { 'action': 'invoice', 'url': url, 'invoices': invoices } });
            this.ref.tick();
        }
    }

    getPayableList(days, origin: string = 'INIT'): void {
        let self = this;
        if( origin == 'INIT' ){ this.selectedIndex = null; }
        try{
            this.util.showProcessing('processing-spinner');
            this.http.doGet('getPayablesList/'+days, function(error: boolean, response: any){
                self.util.hideProcessing('processing-spinner');
                if(error){ } else {
console.log('payable list before =',JSON.stringify(response.data));
                    self.pageData.totalAmountDue = self.pageData.amountRemaining = 0;
                    for(let i=0; i<response.data.length; i++){
                        if(response.data[i].po_details){
                            response.data[i].payType = 'PO';
                            response.data[i].pay_id = response.data[i].po_payment_schedule_id;
                            response.data[i].id = 'PO'+response.data[i].po_payment_schedule_id;
                            response.data[i].payment_date = response.data[i].payment_date;
                            response.data[i].dateInMS = new Date(response.data[i].payment_date);
                            response.data[i].payable_no = response.data[i].po_details.purchase_order_no;
                            response.data[i].supplier_name = response.data[i].po_details.suppliers.supplier_name;
                            response.data[i].amount_due = parseFloat(response.data[i].amount_due);
                            response.data[i].total_cost = parseFloat(response.data[i].po_details.total_cost);
                            response.data[i].status = response.data[i].po_details.status;
                            response.data[i].payment_terms = response.data[i].po_paid_payment;
                            response.data[i].suppliers = response.data[i].po_details.suppliers;
                            response.data[i].supplier_id = response.data[i].po_details.supplier_id;
                            response.data[i].invoiceDocList = response.data[i].po_paid_payment.length > 0 ? response.data[i].po_paid_payment[0].po_payment_invoice_file : [];
                            self.pageData.totalAmountDue += parseFloat(response.data[i].po_details.total_cost);
                        }else{
                            response.data[i].payType = 'WO';
                            response.data[i].pay_id = response.data[i].wo_payment_schedule_id;
                            response.data[i].id = 'WO'+response.data[i].wo_payment_schedule_id;
                            response.data[i].payment_date = response.data[i].date;
                            response.data[i].dateInMS = new Date(response.data[i].date);
                            response.data[i].payable_no = response.data[i].wo_detail.work_order_no;
                            response.data[i].supplier_name = response.data[i].wo_detail.suppliers ? response.data[i].wo_detail.suppliers.supplier_name : '';
                            response.data[i].amount_due = parseFloat(response.data[i].amount_due);
                            response.data[i].total_cost = parseFloat(response.data[i].wo_detail.total_cost);
                            response.data[i].status = response.data[i].wo_detail.wo_status ? response.data[i].wo_detail.wo_status.status : '';
                            response.data[i].payment_terms = response.data[i].wo_paid_payment;
                            response.data[i].suppliers = response.data[i].wo_detail.suppliers;
                            response.data[i].supplier_id = response.data[i].wo_detail.supplier_id;
                            response.data[i].invoiceDocList = response.data[i].wo_paid_payment.length > 0 ? response.data[i].wo_paid_payment[0].wo_payment_invoice_file : [];
                            self.pageData.totalAmountDue += parseFloat(response.data[i].wo_detail.total_cost);
                        }
                        response.data[i].formatedDate = self.util.getFormatedDate(response.data[i].payment_date);
                        console.log(response.data[i].remaining_amount);
                        self.pageData.amountRemaining += parseFloat(response.data[i].remaining_amount);
                        response.data[i].remaining_amount = parseFloat(response.data[i].remaining_amount);
                    }
                    console.log(origin);
                    self.payablesList = response.data ? response.data : [];
                    if(origin == 'REFRESH'){
                        if(self.payablesList.filter(item => item.id == self.selectedPayable.id).length > 0){
                            self.getSelectedPayable(self.payablesList.filter(item => item.id == self.selectedPayable.id)[0], self.selectedIndex);
                        }else{
                            self.selectedIndex = null;
                            self.selectedPayable = null;
                        }
                    }
                    self.route.snapshot.paramMap.get('id') != '0' ? self.showPayDetails() : '';
                    console.log('self.payablesList:::',self.payablesList);
                }
                if(self.payablesList.length == 0) {
                    self.onBoarding = true;
                  }
            });
        }catch(err){
            this.global.addException('Payable','getPayableList()',err);
        }

    }

    showPayDetails(){
        let sortedList: any[] = _.sortBy(this.payablesList, 'pay_id');
        for (var i = 0; i < sortedList.length; ++i) {
            if(this.route.snapshot.paramMap.get('id') == sortedList[i].pay_id){
                this.getSelectedPayable(sortedList[i], i);
                this.selectedIndex = i;
                break;
            }
        }
    }

    getSelectedPayable(item, index): void {
        let self = this;
        this.isEdit = false;
        this.editTab = '';
        this.selectedPayable = item;
        try{
            this.paidPaymentList = [{
                'work_order_id': item.purchase_order_id ? "" : item.work_order_id,
                'purchase_order_id': item.purchase_order_id ? item.purchase_order_id : "",
                'date': item.payment_date,
                'amount_due': item.amount_due,
                'company_id': item.company_id,
                'payment_terms': item.payment_terms,
                'paidPayments': item.payment_terms
            }];
            self.location.go(self.location.path().split('/').splice(0, self.location.path().split('/').length - 1).join('/')+'/'+item.pay_id);
            setTimeout(function() {
                self.util.scrollDown('payMark');
            }, 1000);
            this.createForm();
        }catch(err){
            this.global.addException('Payable', 'getSelectedPayable()', err);
        }
    }

    public uploadFile(){

    }

    public onFileChange(event){
        let self = this;
        let extension: string = '';
        let fileDetailsObj: any = {};
        let fileList: FileList = event.target.files;
        if(fileList.length > 0) {
            let imgCount = 0;
            self.addImg(imgCount, fileList, fileDetailsObj, extension);
        }
    }
    addImg(imgCount: number, fileList, fileDetailsObj, extension){
        let self = this;
        let file: File = fileList[imgCount];
        try{
            fileDetailsObj = {};
            fileDetailsObj.thumbnail = 0;
            fileDetailsObj.fileName =  fileList[imgCount] && fileList[imgCount].name ? fileList[imgCount].name : '';
            extension = fileList[imgCount].name.split('.').pop();

            if(extension == 'pdf'){
                if((fileList[imgCount].size/1048576) < 10 ){
                    self.convertToBase64(file, function(base64){
                        fileDetailsObj.imgPath = JSON.parse(JSON.stringify(base64));;
                        fileDetailsObj.description = '';
                        fileDetailsObj.extension = extension;
                        fileDetailsObj.file = file
                        self.fileUploaded.push(fileDetailsObj);
                        self.ref.tick();

                        if(imgCount < fileList.length - 1)
                            return self.addImg(++imgCount, fileList, fileDetailsObj, extension);
                    });

                    self.util.addSpinner('upload-btn', "Upload");
                    let formData:FormData = new FormData();
                    formData.append('po_payment_schedule_id', self.selectedPayable.po_payment_schedule_id ? self.selectedPayable.po_payment_schedule_id : '' );
                    formData.append('wo_payment_schedule_id', self.selectedPayable.wo_payment_schedule_id ? self.selectedPayable.wo_payment_schedule_id : '');
                    formData.append('fileUploaded1', file);
                    formData.append('fileCount', '1');

                    self.fileService.formDataAPICall(formData, 'payableInvoiceFileUpload', function(error: boolean, response: any){
                        self.util.removeSpinner('upload-btn', "Upload");
                        if(error){
                            self.isError = true;
                            self.errMsg = response.message;
                        }else{
                            self.util.showDialog(DialogComponent, response.message, ['/account/csa/acc-payables/0']);
                            self.util.changeEvent({
                                'source': 'UPDATE_PAYMENT',
                                'action': 'EDIT',
                                'data': ''
                            });
                        }
                    })

                    self.pageData.isError = false;
                }else{
                    self.pageData.errMsg = "File must be less than 10 MB.";
                    self.pageData.isError = true;
                    self.ref.tick();
                }
            }else{
                self.pageData.isError = true;
                self.pageData.errMsg = 'Only pdf file allowed.';
                self.ref.tick();
            }
        }catch(err){
            this.global.addException('Payable', 'getSelectedPayable()', err);
        }
    }
    convertToBase64(file, callback){
        let reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (fileLoadedEvent:any) => {
            return callback(fileLoadedEvent.target.result);
        };
    };

    createForm(){
        let formObj:any = {}
        try{
            for(let i=0; i<this.paidPaymentList.length;i++){
                formObj['paidPayments'+i] = this.fb.array([]);
            }
            this.addPayment = this.fb.group(formObj);
        }catch(err){
            this.global.addException('Payable', 'createForm()', err);
        }
    }
    paidPayments(key): FormArray { return <FormArray>this.addPayment.get(key) as FormArray;}

    addPaymentTerms(index,val:any={}){
        let self =this;
        let wo_id, po_id;
        try{
            po_id = self.selectedPayable.po_payment_schedule_id ? self.selectedPayable.po_payment_schedule_id : '';
            wo_id = self.selectedPayable.wo_payment_schedule_id ? self.selectedPayable.wo_payment_schedule_id : '';

            this.paidPayments('paidPayments'+index).push(this.fb.group({
                wo_payment_schedule_id: new FormControl(wo_id),
                po_payment_schedule_id: new FormControl(po_id),
                payment_date: new FormControl('',[Validators.required]),
                payment_amount: new FormControl('',[Validators.required, Validators.pattern(this.constant.AMOUNT_PATTERN)]),
                payment_method:  new FormControl('',[Validators.required]),
                payment_reference:  new FormControl('',[Validators.required])
            }));
        }catch(err){
            this.global.addException('Payable', 'addPaymentTerms()', err);
        }
    }
    removePaidPayment(listIndx,ctrlIndx){
        this.paidPayments('paidPayments'+listIndx).removeAt(ctrlIndx);
    }

    public edit(){
        this.editTab = 'edit';
        this.isEdit = true;
        this.submitted = false;
    }
    public cancelEdit(){
        this.editTab = '';
        this.isEdit = false;
        this.isError = false;
        this.submitted = false;
    }
    public update(){
        this.submitted = true;
        try{
            if(this.addPayment.valid){
                let self = this;
                let reqObj: any = {"woPaySchedule":[],"poPaySchedule":[]};
                let totalAmt: number = 0;
                for(let i=0; i<this.paidPaymentList.length;i++){
                    for(let j=0; j<this.addPayment.value['paidPayments'+i].length; j++){
                        this.addPayment.value['paidPayments'+i][j].payment_date = this.util.getDDMMYYYYDate(this.addPayment.value['paidPayments'+i][j].payment_date);
                        if(this.addPayment.value['paidPayments'+i][j].po_payment_schedule_id){
                            delete this.addPayment.value['paidPayments'+i][j].wo_payment_schedule_id
                            reqObj.poPaySchedule.push(this.addPayment.value['paidPayments'+i][j]);
                        }else{
                            delete this.addPayment.value['paidPayments'+i][j].po_payment_schedule_id
                            reqObj.woPaySchedule.push(this.addPayment.value['paidPayments'+i][j]);
                        }

                        totalAmt += parseFloat(this.addPayment.value['paidPayments'+i][j].payment_amount);
                    }
                }
                // if(totalAmt > this.selectedPayable.remaining_amount){
                //     self.isError = true;
                //     self.errMsg = "Total payment amount should be less than remaining amount.";
                //     return;
                // }

                self.util.addSpinner('update-btn', 'Update');
                this.http.doPost('createPayables', reqObj, function(error: boolean, response: any){
                    self.util.removeSpinner('update-btn', 'Update');
                    if(error){
                        self.isError = true;
                        self.errMsg = response.message;
                    }else{
                        self.isError = false;
                        self.errMsg = "";
                        self.util.showDialog(DialogComponent, response.message, ['/account/csa/acc-payables/0']);
                        self.util.changeEvent({
                            'source': 'UPDATE_PAYMENT',
                            'action': 'EDIT',
                            'data': ''
                        });
                    }
                });
            }
        }catch(err){
            this.global.addException('Add Paid Payment','update()',err);
        }
    }

    timeLineChange(event,id){
        this.timeLineData.thirty = id == 'thirty' ? true : false;
        this.timeLineData.sixty = id == 'sixty' ? true : false;
        this.timeLineData.ninty = id == 'ninty' ? true : false;
        this.timeLineData.oneEighty = id == 'oneEighty' ? true : false;
        this.getPayableList(event.target.value);
    }

}
