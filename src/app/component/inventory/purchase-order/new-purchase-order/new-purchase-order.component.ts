/*
    Pending - After deleting supplier edit PO
*/


import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormControl, FormGroupDirective, NgForm, Validators, FormGroup, FormBuilder, FormArray } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import * as _ from 'underscore';

import { AdminService } from '../../../admin/admin.service';
import { UtilService } from '../../../../shared/service/util.service';
import { HttpService } from '../../../../shared/service/http.service';
import { GlobalService } from '../../../../shared/service/global.service';
import { DialogComponent } from '../../../../shared/model/dialog/dialog.component';
import { PurchaseOrderDialog } from '../purchase-order-dialog.component';
import { ConstantsService } from '../../../../shared/service/constants.service';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { InventoryDialog } from '../../inventory-dialog.component';
import { ManufacturerDialog } from '../../../../shared/module/manufacturer/manufacturer/manufacturer.component';
declare var jQuery:any;
declare var $ :any;
@Component({
    selector: 'app-new-purchase-order',
    templateUrl: './new-purchase-order.component.html',
    styleUrls: ['./new-purchase-order.component.css']
})
export class NewPurchaseOrderComponent implements OnInit {
    pageData: any = { 'addOption': 'WithPO', 'itemClass': [], 'manufacturerPartList': [], 'manufacturerList': [], 'supplierList': [], 'submitted': false, 'selectedVal' : {}, 'selectedMfgPart': null, 'defaultManfId': null, 'defaultManfName': null, 'locationList': [], 'addOpt': 'WithPO' };
  	addPurchaseOdrFm: FormGroup;
    public totalPayErr:boolean = false;
    public errMsg:string = '';
    public isError:boolean = false;
    isSupplierLoad: boolean = false;
    public backEdit:boolean = false;
    public editMode:boolean = false;
    public notFound:boolean = false;
    public submitted:boolean = false;
    public submittedSup:boolean = false;
    public submittedPartial:boolean = false;
    public submittedPartialDate:boolean = false;
    public pageVariables:any = {'costOfOrder': '', 'subTotal': '', 'taxes': '', 'totalCost': '', 'totalPaymentAmount': 0, 'purchaseOrder' : {}};
    public currentIndex:number = 0;
    public userInfo:any;
    public newData:any = {};
    today: number = Date.now();
    public suppliersList:any;
    public manufacturerList:any;
    mfgBkList: any[] = [];
    public manfPartsList:any;
    public minDate = new Date();
    private routeObj: any;
    private currentPath;
    autoNumber: number;
    filteredSupplier: Observable<string[]>;
    itemClass:any[] = [];
    // filteredClass: Observable<string[]>;

  	constructor(
  		private fb: FormBuilder,
		public dialog: MatDialog,
        public util:UtilService,
        private constant: ConstantsService,
        private http: HttpService,
        private global: GlobalService,
		public router: Router,
        private admin: AdminService,
        private route: ActivatedRoute
  	) { }

  	ngOnInit() {
        console.log(this.minDate);
        //this.getSupplierList1();
        //this.getSupplierList();
        this.util.showProcessing('processing-spinner');
        this.getItemClass();
        this.getManufacturerList();
        this.isSupplierLoad = true;
        this.routeObj = { 'list': '/inventory/po/csa/purchase-order-list/', 'add': '/inventory/po/csa/new-purchase-order' }
        this.currentPath = this.router.url.split('/')[this.router.url.split('/').length - 1];
        this.autoNumber = this.util.getUniqueString();
        this.util.changeDetection.subscribe(dataObj => {
            if(dataObj && this.currentPath == 'new-purchase-order'){
                if(dataObj.source == 'ON_THE_FLY_SUPPLIER' && dataObj.data.step == 'DONE'){
                    this.getSupplierList('REFRESH');
                }else if(dataObj.source == 'ON_THE_FLY_MANUFACTURER_PART' && dataObj.data.step == 'DONE'){
                    this.getManufacturerPart('REFRESH', this.currentIndex, dataObj.data.id);
                }else if(dataObj.source == 'MANUFACTURER'){
                    this.getManufacturerList('REFRESH');
                }
            }
        });
        if (sessionStorage.getItem('PO_INFO')) {
            this.backEdit = true;
            //this.util.showProcessing('processing-spinner');
            console.log(JSON.parse(sessionStorage.getItem('PO_INFO')));
            this.newData = JSON.parse(sessionStorage.getItem('PO_INFO'));
            if(!this.newData.purchaseOrder.hasOwnProperty('purchase_items')){
                this.editMode = true;
                this.minDate = new Date(this.newData.purchase_order_date);
                this.newData.purchaseOrder.purchase_items = this.newData.order_items;
                this.newData.purchaseOrder.date_items = this.newData.payment_schedules;
                this.newData.purchaseOrder.supplier = this.newData.supplier_name;
                this.newData.purchaseOrder.supplierId = this.newData.supplier_id;
                this.newData.purchaseOrder.tax = this.newData.tax;
                this.newData.purchaseOrder.shipAndHandling = this.newData.shipping_and_handling;
                this.newData.purchaseOrder.adjustment = this.newData.adjustment;
                this.newData.purchaseOrder.comment = this.newData.comment;
                this.newData.purchaseOrder.purchase_items.filter(item=>(item.itemType = item.item_manuf_parts_name.manuf_part_class_name.item_class_type, item.itemClassName = item.item_manuf_parts_name.manuf_part_class_name.item_class_name, item.itemClassId = item.item_manuf_parts_name.manuf_part_class_name.item_class_id, item.manf_name = item.item_manuf_name.manf_name, item.manfId = item.item_manuf_name.manf_id, item.manf_part_name = item.item_manuf_parts_name.short_name, item.manfPartId = item.item_manuf_parts_name.manf_part_id, item.quantity = item.quantity_ordered, item.unitPrice = item.price_per_unit, item.itemId = item.purchase_order_item_id));
                let totalPaymentAmount:number = 0;
                this.newData.purchaseOrder.date_items.filter(item=>(item.paymentDate = item.payment_date, item.paymentScheduleId = item.po_payment_schedule_id, item.paymentAmount = item.amount_due, totalPaymentAmount = totalPaymentAmount + parseFloat(item.amount_due) ));
                this.pageVariables.purchase_order_no = this.newData.purchase_order_no;

            }else{
                this.editMode = false;
            }
            this.editMode = this.util.poID == '0' ? false : true;
            console.log("this.editMode", this.editMode);
            this.createForm('1', this.newData);
            this.pageVariables.costOfOrder = this.newData.costOfOrder;
            this.pageVariables.subTotal = this.newData.subTotal;
            this.pageVariables.taxes = this.newData.taxes;
            this.pageVariables.totalCost = this.newData.totalCost;
            this.pageVariables.totalPaymentAmount = this.newData.totalPaymentAmount;

            // this.getManufacturerPart(JSON.parse(sessionStorage.getItem('productInfo')));
            console.log(this.minDate);
        }else{
            this.backEdit = false;
            this.createForm('0');
        }
        this.onChanges();
        this.util.menuChange({'menu':3,'subMenu':22});
        this.util.setWindowHeight();
        this.util.setPageTitle(this.route);
        sessionStorage.getItem('POID') ? ($('html,body').animate({scrollTop: $( "#poHeader" ).offset().top}, 1500), sessionStorage.removeItem('POID')) : '';
        if(localStorage.getItem('USER')){
            this.userInfo = JSON.parse(atob(localStorage.getItem('USER')));
        }
  	}
      ngOnDestroy(){
          sessionStorage.removeItem('MFG_PART_FOR_NEW_PO');
      }

    onChanges(){
        // this.addPurchaseOdrFm.get('supplierId').valueChanges.subscribe(supplierId => {
        //     for(let i = 0; i < this.suppliersList.length; i++){
        //         if(supplierId == this.suppliersList[i].supplier_id){
        //             this.pageVariables.supplierName = this.suppliersList[i].supplier_name;
        //         }
        //     }
        // });
    };
    public validateSupplier(event:any){
        try{
            let supplier = event.target.value;
            let match = this.pageData.supplierList.filter(item=>item.supplier_name.toLowerCase() == supplier.toLowerCase());
            if(supplier == ''){
                this.supplierId.setValue('');
                return;
            }
            if(match.length > 0){
                this.supplierId.setValue(match[0].supplier_id);
                this.supplier.setValue(match[0].supplier_name);
            }else{
                this.supplierId.setValue('');
            }
            this.notFound = match.length > 0 ? false : true;
        }catch(err){
            this.global.addException('Purchase Order','validateSupplier()',err);
        }
    }
    public validateManf(event:any, item:any, index){
        try{
            let manf = event.target.value;
            if(manf == ''){
                item.get('manfId').setValue('');
                this.purchase_items.at(index).get('manfPartId').setValue('');
                this.purchase_items.at(index).get('manf_part_name').setValue('');
                this.purchase_items.at(index).get('manfPartId').setValue('');
                this.purchase_items.at(index).get('filteredManufacturerPart').setValue('');
                return;
            }
            let match = this.pageData.manufacturerList.filter(item=>item.manf_name.toLowerCase() == manf.toLowerCase());
            if(match.length > 0){
                item.get('manfId').setValue(match[0].manf_id);
                item.get('manf_name').setValue(match[0].manf_name);
                this.getManufacturerPart('INIT', index, match[0].manf_id);
                this.purchase_items.at(index).get('manfPartId').setValue('');
                this.purchase_items.at(index).get('manf_part_name').setValue('');
                this.setItemType(index, match[0]);
            }else{
                item.get('manfId').setValue('');
            }
        }catch(err){
            this.global.addException('Purchase Order','validateManf()',err);
        }
    }
    public validateManfPart(event:any, item:any, index){
        try{
            let manfPart = event.target.value;
            let match = this.purchase_items.at(index).get('manfPartsList').value.filter(item=>item.short_name.toLowerCase() == manfPart.toLowerCase());
            if(match.length > 0){
                item.get('manfPartId').setValue(match[0].manf_part_id);
                item.get('manf_part_name').setValue(match[0].short_name);
            }else{
                item.get('manfPartId').setValue('');
            }
        }catch(err){
            this.global.addException('Purchase Order','validateManf()',err);
        }
    }

    // ===============   SUPPLIER  =================== //
    private getSupplierList(origin: string = 'INIT'): void {
        var self = this;
        this.util.showProcessing('processing-spinner');
        this.isSupplierLoad = true;
        this.http.doGet('suppliers', function(error: boolean, response: any){
            self.isSupplierLoad = false;
            try{
                if(error){  console.log("error",response); }else{
                    self.util.hideProcessing('processing-spinner');
                    self.pageData.supplierList=[];
                    for( let i = 0; i < response.data.length; i ++ ){
                        if( response.data[i].supplier_type.supplier_type == 'Assets' || response.data[i].supplier_type.supplier_type == 'Products and Materials' )
                            self.pageData.supplierList = self.pageData.supplierList.concat(response.data[i].suppliers);
                    }
                    self.pageData.supplierList = self.pageData.supplierList.reduce((x, y) => x.findIndex(e=>e.supplier_id == y.supplier_id)<0 ? [...x, y]: x, []);
                    self.pageData.supplierList = _.sortBy(self.pageData.supplierList, 'supplier_id');
                    self.filteredSupplier = self.supplier.valueChanges.pipe(startWith(''),map(value => self.supplierFilter(value)));
                    origin == 'REFRESH' ? (self.supplierId.setValue(self.pageData.supplierList[self.pageData.supplierList.length - 1].supplier_id) ,self.supplier.setValue(self.pageData.supplierList[self.pageData.supplierList.length - 1].supplier_name)) : '';

                    //This is for edit
                    if (sessionStorage.getItem('PO_INFO')) {
                        let poId = JSON.parse(sessionStorage.getItem('PO_INFO')).purchaseOrder ? JSON.parse(sessionStorage.getItem('PO_INFO')).purchaseOrder.supplierId : '';
                        let list: any[] = self.pageData.supplierList.filter(item => item.supplier_id == poId);
                        if(list.length > 0){
                            self.filterMfg(list[0].supplier_types, list[0].supplier_id, list[0].supplier_name, 'edit');
                        }
                    }
                    //console.log(JSON.stringify(self.pageData.supplierList));
                }
            }catch(err){
                this.global.addException('Purchase Order','getSupplierList()',err);
            }
        });
    }
    getSelectedSupplier(supplier,event:any): void {
        let self = this;
        if(event){
            if(event.isUserInput){
                self.filterMfg(supplier.supplier_types, supplier.supplier_id, supplier.supplier_name, 'change');
            }
        }
    }

    filterMfg(types, supplierId, supplierName, from){
        let self = this;
        //console.log(supplier);
        //this.supplierId.setValue(supplier.supplier_id);
        let mfgList = [];
        types.map( item => {
            switch (item.types.status) {
                case "Products and Materials":
                    mfgList = mfgList.concat(self.mfgBkList.filter(item => (item.is_product_type == 1 || item.is_material_type == 1)));
                    break;
                case "Assets":
                    mfgList = mfgList.concat(self.mfgBkList.filter(item => (item.is_asset_type == 1)));
                    break;
                // case "Finance":
                //     // code...
                //     break;
                // case "Contractors":
                //     // code...
                //     break;
                // case "Repair Services":
                //     // code...
                //     break;
                // case "Warranty":
                //     // code...
                //     break;

                default:
                    //mfgList = JSON.parse(JSON.stringify(self.mfgBkList));
                    break;
            }
        });

        mfgList = mfgList.reduce((x, y) => x.findIndex(e=>e.manf_id == y.manf_id)<0 ? [...x, y]: x, []);
        self.pageData.manufacturerList = JSON.parse(JSON.stringify(mfgList));
        self.createForm('0')
        from == 'change' ? '' : self.createForm('1', self.newData);
        self.supplierId.setValue(supplierId);
        self.supplier.setValue(supplierName);
        self.filteredSupplier = self.supplier.valueChanges.pipe(startWith(''),map(value => self.supplierFilter(value)));
        from == 'change' ? self.pageVariables = {'costOfOrder': '', 'subTotal': '', 'taxes': '', 'totalCost': '', 'totalPaymentAmount': 0, 'purchaseOrder' : {}} : '';
        sessionStorage.getItem('MFG_PART_FOR_NEW_PO') ? self.setItem() : '';
    }

    private supplierFilter(value: string): string[] {
        try{
            return this.pageData.supplierList.filter(option => option.supplier_name.toLowerCase().includes(value ? value.toLowerCase() : ''));
        }catch(err){
            this.global.addException('Purchase Order','supplierFilter()',err);
        }
    }
    showAddSupplierPopup(): void { sessionStorage.removeItem('supplierObject');this.util.changeEvent(null);this.dialog.open(InventoryDialog, { data: { 'action': 'addNewSupplier' } }); }
    // ==============   END SUPPLIER  =============== //

    //This function set mfg and item definition form tracker
    setItem(): void {
        let self = this;
        let dataFromTracker = JSON.parse(sessionStorage.getItem('MFG_PART_FOR_NEW_PO'));
        let checkManfOccurance = self.pageData.manufacturerList.filter(item => item.manf_id == dataFromTracker.mfgId);
        if(checkManfOccurance.length > 0){
            this.setManf(0, checkManfOccurance[0]);
            this.getManufacturerPart('INIT', 0, dataFromTracker.mfgId);

            //self.autoSelectNewlyAddedMfgPart(0, JSON.parse(sessionStorage.getItem('MFG_PART_FOR_NEW_PO')).mfgId, self.purchase_items.at(0).get('manfPartsList').value.filter(item => item.manf_part_id == JSON.parse(sessionStorage.getItem('MFG_PART_FOR_NEW_PO')).mfgPartId)[0]);
        }
        //self.autoSelectNewlyAddedMfgPart(0, JSON.parse(sessionStorage.getItem('MFG_PART_FOR_NEW_PO')).mfgId, self.purchase_items.at(0).get('manfPartsList').value.filter(item => item.manf_part_id == JSON.parse(sessionStorage.getItem('MFG_PART_FOR_NEW_PO')).mfgPartId)[0]);
        //sessionStorage.removeItem('MFG_PART_FOR_NEW_PO');
    }

    setItemDefForTrackerPO(){
        let dataFromTracker = JSON.parse(sessionStorage.getItem('MFG_PART_FOR_NEW_PO'));
        let checkManfOccurance = this.pageData.manufacturerList.filter(item => item.manf_id == dataFromTracker.mfgId);
        if(checkManfOccurance.length > 0){
            this.autoSelectNewlyAddedMfgPart(0, JSON.parse(sessionStorage.getItem('MFG_PART_FOR_NEW_PO')).mfgId, this.purchase_items.at(0).get('manfPartsList').value.filter(item => item.manf_part_id == JSON.parse(sessionStorage.getItem('MFG_PART_FOR_NEW_PO')).mfgPartId)[0]);
        }
    }

    // ================   MANUFACTURER  ===================== //
    private getManufacturerList(origin: string = 'INIT'): void {
        let self = this;
        try{
            this.http.doGet('manufacturer', function(error: boolean, response: any){
                if(error){ console.log(response) }else{
                    self.manufacturerList = response.data;
                    self.pageData.defaultManfName = response.data.filter(item=>item.is_material_default == '1')[0].manf_name;
                    self.pageData.defaultManfId = response.data.filter(item=>item.is_material_default == '1')[0].manf_id;
                    //self.pageData.manufacturerList = response.data.filter(item=>item.is_material_default != '1');
                    self.pageData.manufacturerList = response.data;
                    self.mfgBkList = JSON.parse(JSON.stringify(response.data));
                    if(origin == 'REFRESH'){
                        let lastItem = self.manufacturerList[self.manufacturerList.length - 1];
                        //self.getMfg(lastItem, {}, self.currentIndex);
                        self.purchase_items.at(self.currentIndex).get('manf_name').setValue(lastItem.manf_name);
                        self.purchase_items.at(self.currentIndex).get('manfId').setValue(lastItem.manf_id);
                        self.getManufacturerPart('INIT', self.currentIndex, lastItem.manf_id);
                        self.setItemType(self.currentIndex, lastItem);
                    }

                    //origin == 'REFRESH' ? (self.getMfg(self.manufacturerList[self.manufacturerList.length - 1], {}, self.currentIndex),self.purchase_items.at(self.currentIndex).get('manf_name').setValue(self.manufacturerList[self.manufacturerList.length - 1].manf_name), self.purchase_items.at(self.currentIndex).get('manfId').setValue(self.manufacturerList[self.manufacturerList.length - 1].manf_id)) : '';
                    if(!self.backEdit && origin != 'REFRESH'){
                        self.createForm('0');
                    }
                    self.getSupplierList();

                    sessionStorage.getItem('MFG_PART_FOR_NEW_PO') ? self.getManufacturerPart('INIT', 0, JSON.parse(sessionStorage.getItem('MFG_PART_FOR_NEW_PO')).mfgId) : '';
                }
            });
        }catch(err){
            this.global.addException('Purchase Order','getManufacturerList()',err);
        }
    }
    setManf(index, manf){
        this.purchase_items.at(index).get('manfId').setValue(manf.manf_id);
        this.purchase_items.at(index).get('manf_name').setValue(manf.manf_name);
    }
    getMfg(mfg, event: any = false, index): void {
        event ? event.isUserInput ? (this.purchase_items.at(index).get('manfId').setValue(mfg.manf_id), this.getManufacturerPart('INIT', index, mfg.manf_id), this.setItemType(index, mfg)) : '' : (this.purchase_items.at(index).get('manfId').setValue(mfg.manf_id), this.getManufacturerPart('INIT', index, mfg.manf_id), this.setItemType(index, mfg));
    }
    setItemType(index, mfg){
        let list: any[] = [];
        if(mfg.is_asset_type == 1){
            list.push('Asset');
        }
        if(mfg.is_product_type == 1){
            list.push('Product');
        }
        if(mfg.is_material_type == 1){
            list.push('Material');
        }
        this.purchase_items.at(index).get('itemType').setValue(list);
    }
    private manufacturerFilter(value: string): string[] {
        try{
            return this.pageData.manufacturerList.filter(option => option.manf_name.toLowerCase().includes(value ? value.toLowerCase() : ''));
        }catch(err){
            this.global.addException('Purchase Order','manufacturerFilter()',err);
        }
    }
    showAddManufacturerPopup(index): void {
        this.currentIndex = index;
        this.util.changeEvent(null);this.dialog.open(ManufacturerDialog, { data: { 'action': 'addManufacturer' } });
    }
    // ===============   END MANUFACTURER  =================== //

    // ================   MANUFACTURER PART  ===================== //
    private getManufacturerPart(origin: string = 'INIT', index, mfgId): void {
        let self = this;
        this.http.doGet('manufPartById/'+mfgId, function(error: boolean, response: any){
            try{
                if(error){ console.log(response) }else{
                    self.pageData.manufacturerPartList = response.data;
                    self.purchase_items.at(index).get('manfPartsList').setValue(response.data);
                    self.purchase_items.at(index).get('filteredManufacturerPart').setValue(self.purchase_items.at(index).get('manf_part_name').valueChanges.pipe(startWith(''),map(value => self.manufacturerPartFilter(value, index))));

                    //origin == 'REFRESH' ? (self.getManfPart(response.data[response.data.length - 1], false, index),self.purchase_items.at(index).get('manfId').setValue(mfgId),self.purchase_items.at(index).get('manf_name').setValue(self.manufacturerList.filter(item => item.manf_id == mfgId)[0].manf_name),self.purchase_items.at(index).get('manf_part_name').setValue(response.data[response.data.length-1].short_name)) : '';
                    origin == 'REFRESH' ? self.autoSelectNewlyAddedMfgPart(index, mfgId, response.data[response.data.length - 1]) : '' ;

                    //sessionStorage.getItem('MFG_PART_FOR_NEW_PO') ? self.setItem() : '';
                    sessionStorage.getItem('MFG_PART_FOR_NEW_PO') ? self.setItemDefForTrackerPO() : '';
                }
            }catch(err){
                self.global.addException('Purchase Order','getManufacturerPart()',err);
            }
        });
    }


    //Set data forn OTF added Item Definition and form tracker
    autoSelectNewlyAddedMfgPart(index, mfgId, newPart): void {
        this.getManfPart(newPart, false, index);
        this.purchase_items.at(index).get('manfId').setValue(mfgId);
        this.purchase_items.at(index).get('manf_part_name').setValue(newPart.short_name);
        this.purchase_items.at(index).get('manf_name').setValue(newPart.manf_name);
        this.purchase_items.at(index).get('itemClassId').setValue(newPart.class_id);
        this.purchase_items.at(index).get('itemClassName').setValue(newPart.class_name.item_class_name);
    }

    setManfPart(index, manf){
        this.purchase_items.at(index).get('manfPartId').setValue(manf.manf_part_id);
        this.purchase_items.at(index).get('manf_part_name').setValue(manf.short_name);
    }
    getManfPart(part, event: any = false, index): void {
        event ? event.isUserInput ? this.getMfgPartDetails(part, index) : '' : this.getMfgPartDetails(part, index);
    }
    getMfgPartDetails(part, index): void {
        this.purchase_items.at(index).get('manfPartId').setValue(part.manf_part_id);
        this.purchase_items.at(index).get('manf_part_name').setValue(part.short_name);

        this.purchase_items.at(index).get('itemClassId').setValue(part.class_name ? part.class_name.item_class_id : '');
        this.purchase_items.at(index).get('itemClassName').setValue(part.class_name ? part.class_name.item_class_name : '');
    }
    private manufacturerPartFilter(value: string, index): string[] {
        try{
            //return this.purchase_items.at(index).get('manfPartsList').value.filter(option => (option.class_name.item_class_id == this.purchase_items.at(index).get('itemClassId').value && option.short_name.toLowerCase().includes(value ? value.toLowerCase() : '')));
            return this.purchase_items.at(index).get('manfPartsList').value.filter(option => (option.short_name.toLowerCase().includes(value ? value.toLowerCase() : '')));
        }catch(err){
            this.global.addException('Purchase Order','manufacturerPartFilter()',err);
        }
    }
    showAddManufacturerPartPopup(index): void {
        this.currentIndex = index;
        sessionStorage.removeItem('newPart');
        this.purchase_items.at(index).get('itemType').value != '' ? sessionStorage.setItem('class',JSON.stringify(this.purchase_items.at(index).get('itemType').value)) : sessionStorage.removeItem('class');
        this.util.changeEvent(null);
        this.dialog.open(InventoryDialog, { data: { 'action': 'addNewManufacturerPart' } });
    }
    // ==============   END MANUFACTURER PART  =================== //
    // ==============   CLASS NOT IN USE  =================== //
    // Need to remove class related code
    private getItemClass(origin: string = 'INIT'): void {
        let self = this;
        this.http.doGet('itemclass', function(error: boolean, response: any){
            try{
                if(error){ console.log(response) }else{
                    self.pageData.itemClass = response.data;
                    console.log("itemClass",self.pageData.itemClass);
                    if(!self.backEdit && origin != 'REFRESH'){
                        self.createForm('0');
                    }
                }
            }catch(err){
                this.global.addException('Purchase Order','getItemClass()',err);
            }
        });
    }
    getSelectedClass(obj,event:any,index): void {
        try{
            if(event.isUserInput){
                this.purchase_items.at(index).get('itemClassId').setValue(obj.item_class_id);
                let match = this.pageData.itemClass.filter(item=>item.item_class_name.toLowerCase() == obj.item_class_name.toLowerCase());
                if(match.length > 0){
                    if(match[0].item_class_type == 'Material'){
                        this.getManufacturerPart('INIT', index, match[0].manufacturer_id);
                        this.purchase_items.at(index).get('manfId').setValue(this.pageData.defaultManfId);
                        this.purchase_items.at(index).get('manf_name').setValue(this.pageData.defaultManfName);
                        this.purchase_items.at(index).get('manfPartId').setValue('');
                        this.purchase_items.at(index).get('manf_part_name').setValue('');
                    }else{
                        this.purchase_items.at(index).get('manfId').setValue('');
                        this.purchase_items.at(index).get('manf_name').setValue('');
                    }
                    this.purchase_items.at(index).get('itemType').setValue(match[0].item_class_type);
                    this.purchase_items.at(index).get('itemClassId').setValue(match[0].item_class_id);
                    this.purchase_items.at(index).get('itemClassName').setValue(match[0].item_class_name);
                }else{
                    this.purchase_items.at(index).get('itemType').setValue('');
                    this.purchase_items.at(index).get('itemClassId').setValue('');
                }
            }
        }catch(err){
            this.global.addException('Purchase Order','getSelectedClass()',err);
        }
    }
    private classFilter(value: string): string[] {
        try{
            return this.pageData.itemClass.filter(option => option.item_class_name.toLowerCase().includes(value ? value.toLowerCase() : ''));
        }catch(err){
            this.global.addException('Purchase Order','classFilter()',err);
        }
    }
    public validateClass(event:any, item:any, index){
        try{
            let classVal = event.target.value;
            if(classVal == ''){
                item.get('itemClassId').setValue('');
                return;
            }
            let match = this.pageData.itemClass.filter(item=>item.item_class_name.toLowerCase() == classVal.toLowerCase());
            if(match.length > 0){
                if(match[0].item_class_type == 'Material'){
                    this.getManufacturerPart('INIT', index, match[0].manufacturer_id);
                    this.purchase_items.at(index).get('manfId').setValue(this.pageData.defaultManfId);
                    this.purchase_items.at(index).get('manf_name').setValue(this.pageData.defaultManfName);
                    this.purchase_items.at(index).get('manfPartId').setValue('');
                    this.purchase_items.at(index).get('manf_part_name').setValue('');
                    this.getManufacturerPart('INIT', index, match[0].manufacturer_id);
                }else{
                    this.purchase_items.at(index).get('manfId').setValue('');
                    this.purchase_items.at(index).get('manf_name').setValue('');
                }
                this.purchase_items.at(index).get('itemType').setValue(match[0].item_class_type);
                this.purchase_items.at(index).get('itemClassId').setValue(match[0].item_class_id);
                this.purchase_items.at(index).get('itemClassName').setValue(match[0].item_class_name);
            }else{
                this.purchase_items.at(index).get('itemClassId').setValue('');
                this.purchase_items.at(index).get('itemType').setValue('');
            }
        }catch(err){
            this.global.addException('Purchase Order','validateClass()',err);
        }
    }
    // ==============   END CLASS  =================== //
    // public clearAutoComplete(name,id){
    //     let self = this;
    //     let backspaceEvent = jQuery.Event("keyup", { keyCode: 20 });
    //     $("#"+id).trigger( backspaceEvent );
    //     setTimeout(function(){
    //         self.addPurchaseOdrFm.get(id).setValue('');
    //         self.addPurchaseOdrFm.get(name).setValue('');
    //     },1);
    // }
    // public clearAutoCompleteItem(name,id,index){
    //     let self = this;
    //     // let backspaceEvent = jQuery.Event("keyup", { keyCode: 20 });
    //     // $("#"+id).trigger( backspaceEvent );
    //     setTimeout(function(){
    //         self.purchase_items.at(index).get(id).setValue('');
    //         self.purchase_items.at(index).get(name).setValue('');
    //     },1);
    // }
  	createForm(option, val:any = {}){
  		this.addPurchaseOdrFm = this.fb.group({
            supplier:new FormControl(option == '0' ? '' : val.purchaseOrder.supplier, []),
            supplierId:new FormControl(option == '0' ? '' : val.purchaseOrder.supplierId, []),
            shipAndHandling:new FormControl(option == '0' ? '' : val.purchaseOrder.shipAndHandling, [Validators.pattern(this.constant.AMOUNT_PATTERN)]),
            adjustment:new FormControl(option == '0' ? '' : val.purchaseOrder.adjustment, [Validators.pattern(this.constant.AMOUNT_NEG_PATTERN)]),
            comment:new FormControl(option == '0' ? '' : val.purchaseOrder.comment,[Validators.maxLength(this.constant.DEFAULT_COMMENT_MAXLENGTH)]),
            tax: new FormControl(option == '0' ? '' : val.purchaseOrder.tax, [Validators.pattern(this.constant.AMOUNT_PATTERN), Validators.min(0), Validators.max(100)]),
            purchase_items: this.fb.array([]),
            date_items: this.fb.array([])
        });
        this.util.addBulkValidators(this.addPurchaseOdrFm, ['supplier','supplierId'], [ Validators.required ]);
        if( option == '1' ){
            if(val.purchaseOrder.purchase_items.length == 0){
                this.addPurchaseItem('0');
            }else{
                for (let i = 0; i < val.purchaseOrder.purchase_items.length; i++) {
                    if(!this.backEdit){
                        val.purchaseOrder.purchase_items[i].itemType = val.purchaseOrder.purchase_items[i].item_manuf_parts_name.manuf_part_class_name.item_class_type;
                    }
                    val.purchaseOrder.purchase_items.length > 0 ? this.addPurchaseItem(option, val.purchaseOrder.purchase_items[i]) :  this.addPurchaseItem('0');
                    // this.purchase_items.at(index).get('itemType').setValue(val.purchaseOrder.purchase_items.item_manuf_parts_name.manuf_part_class_name.item_class_type);
                    // this.getManf(this.purchase_items.at(i));
                }
            }
            if(val.purchaseOrder.date_items.length == 0){
                this.addDateItem('0');
            }else{
                for (let i = 0; i < val.purchaseOrder.date_items.length; i++) {
                    val.purchaseOrder.date_items.length > 0 ? this.addDateItem(option, val.purchaseOrder.date_items[i]) : this.addDateItem('0');
                }
            }
            //this.util.hideProcessing('processing-spinner');
        }else{
            this.addPurchaseItem('0');
            this.addDateItem('0');
        }
        if(this.editMode){
            this.calculateCostOfOrder();
            this.calculatePaymentAmount();
        }
  	};
    get supplier() { return this.addPurchaseOdrFm.get('supplier'); }
    get supplierId() { return this.addPurchaseOdrFm.get('supplierId'); }
    get comment() { return this.addPurchaseOdrFm.get('comment'); }
    get tax() { return this.addPurchaseOdrFm.get('tax'); }
    get shipAndHandling() { return this.addPurchaseOdrFm.get('shipAndHandling'); }
    get adjustment() { return this.addPurchaseOdrFm.get('adjustment'); }
    get purchase_items(): FormArray{ return <FormArray>this.addPurchaseOdrFm.get('purchase_items') as FormArray; }
    get date_items(): FormArray{ return <FormArray>this.addPurchaseOdrFm.get('date_items') as FormArray; }

    showMoreMfgPartsPopup(){
    	this.dialog.open(PurchaseOrderDialog, { data: { 'action': 'newManufacturerPart' } });
    }
    addPurchaseItem(option, val:any = {}){

        this.purchase_items.push(this.fb.group({
            itemType: new FormControl(option == '0' ? 'Product' : val.itemType), //Only for edit
            isItemDelete: new FormControl('0'), //Only for edit
            itemId: new FormControl(option == '0' ? '0' : val.itemId ), //Only for edit
            itemClassName: new FormControl(option == '0' ? '' : val.itemClassName ), //Only for review
            itemClassId: new FormControl(option == '0' ? '' : val.itemClassId ),
            manf_name: new FormControl(option == '0' ? '' : val.manf_name ), //Only for review
            manfId: new FormControl(option == '0' ? '' : val.manfId, [  ]),
            manf_part_name: new FormControl(option == '0' ? '' : val.manf_part_name, [  ]),
            manfPartId: new FormControl(option == '0' ? '' : val.manfPartId, [  ]),
            quantity: new FormControl(option == '0' ? '' : val.quantity, [ Validators.pattern(this.constant.AMOUNT_PATTERN) ]), //ONLY_NUMBER
            unitPrice: new FormControl(option == '0' ? '' : val.unitPrice, [ Validators.pattern(this.constant.AMOUNT_PATTERN) ]),
            manfPartsList: new FormControl([]),
            filteredClass: new FormControl( new Observable<string[]>() ),
            filteredManufacturer: new FormControl( new Observable<string[]>() ),
            filteredManufacturerPart: new FormControl( new Observable<string[]>() )
        }));
        this.setObservable(this.purchase_items.length - 1);
        if(!this.backEdit){
        }
    }
    setObservable(index): void {
        this.purchase_items.at(index).get('filteredClass').setValue(this.purchase_items.at(index).get('itemClassName').valueChanges.pipe(startWith(''),map(value => this.classFilter(value))));
        this.purchase_items.at(index).get('filteredManufacturer').setValue(this.purchase_items.at(index).get('manf_name').valueChanges.pipe(startWith(''),map(value => this.manufacturerFilter(value))));
        this.purchase_items.at(index).get('filteredManufacturerPart').setValue(this.purchase_items.at(index).get('manf_part_name').valueChanges.pipe(startWith(''),map(value => this.manufacturerPartFilter(value, index))));
    }

    addDateItem(option, val:any = {}){
        this.date_items.push(this.fb.group({
            isScheduleDelete: new FormControl('0'), //Only for edit
            paymentScheduleId: new FormControl(option == '0' ? '0' : val.paymentScheduleId ), //Only for edit
            paymentDate: new FormControl(option == '0' ? '' : this.util.getDateObjet(val.paymentDate), [  ] ),
            paymentAmount: new FormControl(option == '0' ? '' : val.paymentAmount, [ Validators.pattern(this.constant.AMOUNT_PATTERN) ]),
            dateList: new FormControl(),
        }));
    }

    getManf(obj){
        let self = this;
        try{
            this.http.doGet('manufPartById/'+obj.get('manfId').value, function(error: boolean, response: any){
                if( error ){ console.log("error",response); }else{
                    obj.get('manfPartsList').setValue(response.data);
                    obj.get('manf_name').setValue(self.manufacturerList.filter(item => item.manf_id == obj.get('manfId').value)[0].manf_name);
                }
            });
        }catch(err){
            this.global.addException('Purchase Order','getManf()',err);
        }
    }

    removeItem(position, item){
        item.get('itemId').value == "0" ? this.purchase_items.removeAt(position) : item.get('isItemDelete').setValue('1');
        console.log(item);
        console.log(this.purchase_items.value.length);
        this.calculateCostOfOrder();
    }
    removeDate(position, date){
        date.get('paymentScheduleId').value == "0" ? this.date_items.removeAt(position) : date.get('isScheduleDelete').setValue('1');
        this.calculatePaymentAmount();
    }



    // getSupplierList1(){
    //     let self = this;
    //     try{
    //         this.http.doGet('suppliers', function(error: boolean, response: any){
    //             if( error ){
    //             }else{
    //                 self.suppliersList=[];
    //                 for(let i=0; i<response.data.length;i++){
    //                     for(let j=0; j<response.data[i].suppliers.length; j++){
    //                         let supplierObj:any ={};
    //                         supplierObj=response.data[i].suppliers[j];
    //                         self.suppliersList.push(supplierObj);
    //                     }
    //                 }
    //             }
    //         });
    //     }catch(err){
    //         this.global.addException('Purchase Order','getSupplierList1()',err);
    //     }
    // }
    private validateCOOInput(callback){
        for(let i = 0; i < this.purchase_items.value.length; i++){
            this.util.removeCommas(this.purchase_items.at(i).get('quantity'));
            this.util.removeCommas(this.purchase_items.at(i).get('unitPrice'));
            if( !this.constant.AMOUNT_PATTERN.test(this.purchase_items.value[i].quantity ? this.purchase_items.value[i].quantity : 0) || !this.constant.AMOUNT_PATTERN.test(this.purchase_items.value[i].unitPrice ? this.purchase_items.value[i].unitPrice : 0) ){
                return callback(false);
            }
        }
        return callback(true);
    }
    private validateSTInput(callback){
        this.util.removeCommas(this.shipAndHandling);
        this.util.removeCommas(this.adjustment);
        if( !this.constant.AMOUNT_PATTERN.test(this.shipAndHandling.value ? this.shipAndHandling.value : 0) || !this.constant.AMOUNT_NEG_PATTERN.test(this.adjustment.value ? this.adjustment.value : 0) ){
            return callback(false);
        }
        return callback(true);
    }
    calculateCostOfOrder(){
        let self = this;
        let total = 0;

        this.validateCOOInput(function(response){
            if(!response){ return; }
            console.log(self.purchase_items.value.length);
            for(let i = 0; i < self.purchase_items.value.length; i++){
                if(self.purchase_items.value[i].isItemDelete == '0')
                {
                    self.purchase_items.value[i].quantity = isNaN(self.purchase_items.value[i].quantity) ? self.purchase_items.value[i].quantity.setValue('') : self.purchase_items.value[i].quantity;
                    self.purchase_items.value[i].unitPrice = isNaN(self.purchase_items.value[i].unitPrice) ? self.purchase_items.value[i].unitPrice.setValue('') : self.purchase_items.value[i].unitPrice;
                    var itemQty = self.purchase_items.value[i].quantity == null ? 0 : self.purchase_items.value[i].quantity == '' ? 0 : self.purchase_items.value[i].quantity;
                    var itemPrice = self.purchase_items.value[i].unitPrice == null ? 0 : self.purchase_items.value[i].unitPrice == '' ? 0 : self.purchase_items.value[i].unitPrice;
                    total = (total + (itemPrice * itemQty) );
                }
            }
            self.pageVariables.costOfOrder = (total).toFixed(2);
            self.calculateTaxes();
        });
        this.validateSTInput(function(response){
            self.isError = false;
            self.errMsg = "";
            if(!response){ return; }

            if(!isNaN(self.shipAndHandling.value) && !isNaN(self.adjustment.value)){
                var itemShip = (self.shipAndHandling.value == null || self.shipAndHandling.value == '') ? 0 : self.shipAndHandling.value == '' ? 0 : self.shipAndHandling.value;
                var itemAdjustment = (self.adjustment.value == null || self.adjustment.value == '') ? 0 : self.adjustment.value == '' ? 0 : self.adjustment.value;
                self.pageVariables.subTotal = ( total + ( parseFloat(itemShip) + parseFloat(itemAdjustment) ) );
                self.pageVariables.subTotal = (self.pageVariables.subTotal).toFixed(2);

                if(itemAdjustment < 0 && (total + ( parseFloat(itemShip)) < (itemAdjustment*-1))){
                    self.isError = true;
                    self.errMsg = 'Adjustment(-) amount should not exceed (Cost of Order + Shipping & Handling) .'
                }

                self.calculateTaxes();
            }
        });
    }
    private validatePaymentInput(callback){
        for(let i = 0; i < this.date_items.value.length; i++){
            this.util.removeCommas(this.date_items.at(i).get('paymentAmount'));
            if( !this.constant.AMOUNT_PATTERN.test(this.date_items.value[i].paymentAmount ? this.date_items.value[i].paymentAmount : 0) ){
                return callback(false);
            }
        }
        return callback(true);
    }
    calculatePaymentAmount(){
        let self = this;
        this.validatePaymentInput(function(response){
            if(!response){return;}

            let total = 0.00;
            for(let i = 0; i < self.date_items.value.length; i++){
                if(self.date_items.value[i].isScheduleDelete == '0'){
                    var payAmt = (self.date_items.value[i].paymentAmount == null || self.date_items.value[i].paymentAmount == '') ? 0 : self.date_items.value[i].paymentAmount;
                    total = self.editMode == true ? (total) + parseFloat(payAmt) : (total) + parseFloat(payAmt);
                    if(self.pageVariables.totalCost < total){
                        self.isError = true;
                        self.errMsg = 'Total payment amount should not exceed Total cost.'
                    }else{
                        self.isError = false;
                        self.errMsg = ''
                    }
                }
            }
            //console.log("self.pageVariables.totalCost", self.pageVariables.totalCost);
            self.pageVariables.totalPaymentAmount = (total).toFixed(2);
            self.pageVariables.remainingPaymentAmount = ( self.pageVariables.totalCost == 'XXXX' ? 0 : self.pageVariables.totalCost - total ).toFixed(2);
        });
    }
    private validateTaxInput(callback){
        if( !this.constant.AMOUNT_PATTERN.test(this.tax.value ? this.tax.value : 0)){
            return callback(false);
        }
        return callback(true);
    }
    calculateTaxes(){
        let self = this;
        this.validateTaxInput(function(response){
            if(!response){return;}
            if(self.pageVariables.subTotal >= 0){
                var itemTax = (self.tax.value == null || self.tax.value == '') ? 0 : self.tax.value;
                self.pageVariables.taxes = self.tax.value ? ( (parseFloat(itemTax) / 100) * parseFloat(self.pageVariables.subTotal) ).toFixed(2) : 0;
                self.pageVariables.totalCost = parseFloat(self.pageVariables.taxes) + parseFloat(self.pageVariables.subTotal);
                self.pageVariables.totalCost = self.pageVariables.totalCost.toFixed(2);
                self.pageVariables.taxPercent = self.tax.value ? self.tax.value : 0;
                if(self.pageVariables.totalPaymentAmount > 0){
                    self.calculatePaymentAmount();
                }else{
                    self.pageVariables.remainingPaymentAmount = self.pageVariables.totalCost;
                }
            }
        });
    }

    reviewOrder(form:FormGroup){
        try{
            console.log(form.valid);
            console.log(form.value);
            this.submitted = true;
            if(this.isError){return;};
            for(let i = 0; i < this.purchase_items.length; i++){
                // if( this.purchase_items.at(i).get('itemClassId').value ? (this.pageData.itemClass.filter(item=>item.item_class_id == this.purchase_items.at(i).get('itemClassId').value)[0].item_class_type == 'Material') : false ){
                // //if( this.pageData.itemClass.filter(item=>item.item_class_id == this.purchase_items.at(i).get('itemClassId').value)[0].item_class_type == 'Material' ){ //old line
                //     this.util.addBulkValidators(this.addPurchaseOdrFm, [this.purchase_items.at(i).get('manfId')], [ ],'ARRAY');
                // }else{
                //     this.util.addBulkValidators(this.addPurchaseOdrFm, [this.purchase_items.at(i).get('manfId')], [ Validators.required ],'ARRAY');
                // }

                this.util.addBulkValidators(this.addPurchaseOdrFm, [this.purchase_items.at(i).get('manfId')], [ Validators.required ],'ARRAY');
                this.util.addBulkValidators(this.addPurchaseOdrFm, [this.purchase_items.at(i).get('itemClassId'), this.purchase_items.at(i).get('manfPartId')], [ Validators.required ],'ARRAY');
                    this.util.addBulkValidators(this.addPurchaseOdrFm, [this.purchase_items.at(i).get('quantity')], [ Validators.required, Validators.pattern(this.constant.AMOUNT_PATTERN) ],'ARRAY');
                    this.util.addBulkValidators(this.addPurchaseOdrFm, [this.purchase_items.at(i).get('unitPrice')], [ Validators.required, Validators.pattern(this.constant.AMOUNT_PATTERN) ],'ARRAY');
            }
            if(this.date_items.length == 1 && this.pageVariables.totalCost != 0){
                for(let i = 0; i < this.date_items.length; i++){
                    this.util.addBulkValidators(this.addPurchaseOdrFm, [this.date_items.at(i).get('paymentDate')], [ Validators.required ],'ARRAY');
                        this.util.addBulkValidators(this.addPurchaseOdrFm, [this.date_items.at(i).get('paymentAmount')], [ Validators.required, Validators.pattern(this.constant.AMOUNT_PATTERN) ],'ARRAY');
                }
            }

            //this.util.addBulkValidators(this.addPurchaseOdrFm, ['shipAndHandling'], [Validators.required, Validators.pattern(this.constant.AMOUNT_PATTERN)]);
            //this.util.addBulkValidators(this.addPurchaseOdrFm, ['adjustment'], [Validators.required, Validators.pattern(this.constant.AMOUNT_NEG_PATTERN)]);
            this.util.addBulkValidators(this.addPurchaseOdrFm, ['tax'], [ Validators.min(0), Validators.max(100), Validators.pattern(this.constant.AMOUNT_PATTERN)]);

            if(this.pageVariables.totalPaymentAmount != this.pageVariables.totalCost){
                this.isError = true;
                this.errMsg = 'Total payment amount should match exactly to Total Cost.'
            }else{
                this.isError = false;
                this.errMsg = ''
                this.pageVariables.purchaseOrder = form.value;
                for (let i = 0; i < this.pageVariables.purchaseOrder.purchase_items.length; i++) {
                    delete this.pageVariables.purchaseOrder.purchase_items[i].filteredClass;
                    delete this.pageVariables.purchaseOrder.purchase_items[i].filteredManufacturer;
                    delete this.pageVariables.purchaseOrder.purchase_items[i].filteredManufacturerPart;
                }
                for(let i = 0; i < this.pageVariables.purchaseOrder.date_items.length; i++){
                    this.pageVariables.purchaseOrder.date_items[i].paymentDate = this.util.getDDMMYYYYDate(this.util.getDateObjet(this.pageVariables.purchaseOrder.date_items[i].paymentDate));
                }
                if(form.valid){
                    sessionStorage.setItem('PO_INFO',JSON.stringify(this.pageVariables));
                    this.router.navigate(['/inventory/po/csa/purchase-order-review']);
                }
            }
        }catch(err){
            this.global.addException('Purchase Order','reviewOrder()',err);
        }
    }
    createPurchaseOrder(form:FormGroup, type){
        console.log(form);

        this.submittedSup = true;
        this.pageVariables.purchaseOrder = form.value;
        let self = this;
        let reqObj:any = {};
        self.isError = false;
        self.errMsg = '';
        reqObj = form.value;

        reqObj.saveAndSend = 0;
        reqObj.items = this.pageVariables.purchaseOrder.purchase_items;
        reqObj.poPaySchedule = JSON.parse(JSON.stringify(this.pageVariables.purchaseOrder.date_items));
        reqObj.poPaySchedule = reqObj.poPaySchedule.filter(item=>item.paymentDate = this.util.getYYYYMMDDDate(item.paymentDate))
        // reqObj.poPaySchedule = this.pageVariables.purchaseOrder.date_items.filter(item=>item.paymentDate= this.util.getYYYYMMDDDate(this.util.stringToDate(item.paymentDate)) );
        reqObj.costOfOrder = this.pageVariables.costOfOrder == 'XXXX' ? '' : this.pageVariables.costOfOrder;
        reqObj.subTotal = this.pageVariables.subTotal == 'XXXX' ? '' : this.pageVariables.subTotal;
        reqObj.totalCost = this.pageVariables.totalCost == 'XXXX' ? '' : this.pageVariables.totalCost;
        delete reqObj.purchase_items;
        delete reqObj.date_items;
        let noPurchaseItems = 0;
        for (var i = reqObj.items.length - 1; i >= 0; i--) {
            delete reqObj.items[i].filteredManufacturer;
            delete reqObj.items[i].filteredManufacturerPart;
            if(reqObj.items[i].itemClassId == '' && reqObj.items[i].manfId == '' && reqObj.items[i].manfPartId == '' && reqObj.items[i].quantity == '' && reqObj.items[i].unitPrice == ''){
                noPurchaseItems++;
            }
        }
        let noDateItems = 0;
        for (var i = reqObj.poPaySchedule.length - 1; i >= 0; i--) {
            if(reqObj.poPaySchedule[i].paymentAmount == '' && reqObj.poPaySchedule[i].paymentDate == ''){
                noDateItems++;
            }
        }
        if(noPurchaseItems != 0){
            reqObj.items = [];
            this.submittedPartial = false;
        }else{
            this.submittedPartial = true;
        }
        if(noDateItems != 0){
            reqObj.poPaySchedule = [];
            this.submittedPartialDate = false;
        }else{
            this.submittedPartialDate = true;
        }
        if(type == 1){
            if(reqObj.items.length > 0){
                for(let i = 0; i < reqObj.items.length; i++){
                    if(reqObj.items[i].itemClassId == '' || reqObj.items[i].manfId == '' || reqObj.items[i].manfPartId == '' || reqObj.items[i].quantity == '' || reqObj.items[i].unitPrice == ''){
                        // if( this.pageData.itemClass.filter(item=>item.item_class_id == this.purchase_items.at(i).get('itemClassId').value)[0].item_class_type == 'Material' ){
                        //     this.util.addBulkValidators(this.addPurchaseOdrFm, [this.purchase_items.at(i).get('manfId')], [ ],'ARRAY');
                        // }else{
                        //     this.util.addBulkValidators(this.addPurchaseOdrFm, [this.purchase_items.at(i).get('manfId')], [ Validators.required ],'ARRAY');
                        // }
                        this.util.addBulkValidators(this.addPurchaseOdrFm, [this.purchase_items.at(i).get('itemClassId'), this.purchase_items.at(i).get('manfId'), this.purchase_items.at(i).get('manfPartId')], [ Validators.required ],'ARRAY');
                        this.util.addBulkValidators(this.addPurchaseOdrFm, [this.purchase_items.at(i).get('quantity')], [ Validators.required, Validators.pattern(this.constant.AMOUNT_PATTERN) ],'ARRAY');
                        this.util.addBulkValidators(this.addPurchaseOdrFm, [this.purchase_items.at(i).get('unitPrice')], [ Validators.required, Validators.pattern(this.constant.AMOUNT_PATTERN) ],'ARRAY');
                    }else if(reqObj.items[i].itemClassId == '' && reqObj.items[i].manfId == '' && reqObj.items[i].manfPartId == '' && reqObj.items[i].quantity == '' && reqObj.items[i].unitPrice == ''){
                        this.util.addBulkValidators(this.addPurchaseOdrFm, [this.purchase_items.at(i).get('itemClassId'), this.purchase_items.at(i).get('manfId'), this.purchase_items.at(i).get('manfPartId'), this.purchase_items.at(i).get('quantity'),this.purchase_items.at(i).get('unitPrice')], [ ],'ARRAY');
                    }
                }
            }

            if(reqObj.poPaySchedule.length > 0){
                for(let i = 0; i < reqObj.poPaySchedule.length; i++){
                    if(reqObj.poPaySchedule[i].paymentAmount == '' || reqObj.poPaySchedule[i].paymentDate == ''){
                        this.util.addBulkValidators(this.addPurchaseOdrFm, [this.date_items.at(i).get('paymentDate')], [ Validators.required ],'ARRAY');
                        this.util.addBulkValidators(this.addPurchaseOdrFm, [this.date_items.at(i).get('paymentAmount')], [ Validators.required, Validators.pattern(this.constant.AMOUNT_PATTERN) ],'ARRAY');
                    }else if(reqObj.poPaySchedule[i].paymentAmount == '' && reqObj.poPaySchedule[i].paymentDate == ''){
                        this.util.addBulkValidators(this.addPurchaseOdrFm, [this.date_items.at(i).get('paymentDate'), this.date_items.at(i).get('paymentAmount')], [ ],'ARRAY');
                    }
                }
            }
            else
            {
                this.util.addBulkValidators(this.addPurchaseOdrFm, [this.date_items.at(0).get('paymentDate'), this.date_items.at(0).get('paymentAmount')], [ ],'ARRAY');
            }
            this.util.addBulkValidators(this.addPurchaseOdrFm, ['shipAndHandling'], this.shipAndHandling.value != '' && this.shipAndHandling.value != null ? [ Validators.pattern(this.constant.AMOUNT_PATTERN)] : []);
            this.util.addBulkValidators(this.addPurchaseOdrFm, ['adjustment'], this.adjustment.value != '' && this.adjustment.value != null ? [ Validators.pattern(this.constant.AMOUNT_NEG_PATTERN)] : []);
            this.util.addBulkValidators(this.addPurchaseOdrFm, ['tax'], this.tax.value != '' && this.tax.value != null ? [ Validators.min(0), Validators.max(100), Validators.pattern(this.constant.AMOUNT_PATTERN)] : []);
            for (let i = 0; i < form.value.purchase_items.length; i++) {
                delete form.value.purchase_items[i].filteredClass;
                delete form.value.purchase_items[i].filteredManufacturer;
                delete form.value.purchase_items[i].filteredManufacturerPart;
            }
            if(form.valid){
                try{

                    self.util.addSpinner('savePO', "Save");
                    this.http.doPost('purchaseorder/create', reqObj, function(error: boolean, response: any){
                        self.util.removeSpinner('savePO', "Save");
                        if( error ){
                            self.isError = true;
                            self.errMsg = response.message;
                        }else{
                            sessionStorage.removeItem('PO_INFO');

                            self.util.showDialog(DialogComponent, response.message, [self.routeObj.list+'0']);
                        }
                    });
                }catch(err){
                    this.global.addException('Purchase Order','createPurchaseOrder()',err);
                }
            }
        }else{
            if(reqObj.items.length > 0){
                for(let i = 0; i < reqObj.items.length; i++){
                    if(reqObj.items[i].itemClassId == '' || reqObj.items[i].manfId == '' || reqObj.items[i].manfPartId == '' || reqObj.items[i].quantity == '' || reqObj.items[i].unitPrice == ''){
                        // if( this.pageData.itemClass.filter(item=>item.item_class_id == this.purchase_items.at(i).get('itemClassId').value)[0].item_class_type == 'Material' ){
                        //     this.util.addBulkValidators(this.addPurchaseOdrFm, [this.purchase_items.at(i).get('manfId')], [ ],'ARRAY');
                        // }else{
                        //     this.util.addBulkValidators(this.addPurchaseOdrFm, [this.purchase_items.at(i).get('manfId')], [ Validators.required ],'ARRAY');
                        // }
                        this.util.addBulkValidators(this.addPurchaseOdrFm, [this.purchase_items.at(i).get('manfId')], [ Validators.required ],'ARRAY');
                        this.util.addBulkValidators(this.addPurchaseOdrFm, [this.purchase_items.at(i).get('itemClassId'), this.purchase_items.at(i).get('manfPartId')], [ Validators.required ],'ARRAY');
                        this.util.addBulkValidators(this.addPurchaseOdrFm, [this.purchase_items.at(i).get('quantity')], [ Validators.required, Validators.pattern(this.constant.AMOUNT_PATTERN) ],'ARRAY');
                        this.util.addBulkValidators(this.addPurchaseOdrFm, [this.purchase_items.at(i).get('unitPrice')], [ Validators.required, Validators.pattern(this.constant.AMOUNT_PATTERN) ],'ARRAY');
                    }else if(reqObj.items[i].itemClassId == '' && reqObj.items[i].manfId == '' && reqObj.items[i].manfPartId == '' && reqObj.items[i].quantity == '' && reqObj.items[i].unitPrice == ''){
                        this.util.addBulkValidators(this.addPurchaseOdrFm, [this.purchase_items.at(i).get('manfId'), this.purchase_items.at(i).get('manfPartId'), this.purchase_items.at(i).get('quantity'),this.purchase_items.at(i).get('unitPrice')], [ ],'ARRAY');
                    }
                }
            }
            if(reqObj.poPaySchedule.length > 0){
                for(let i = 0; i < reqObj.poPaySchedule.length; i++){
                    if(reqObj.poPaySchedule[i].paymentAmount == '' || reqObj.poPaySchedule[i].paymentDate == ''){
                        this.util.addBulkValidators(this.addPurchaseOdrFm, [this.date_items.at(i).get('paymentDate')], [ Validators.required ],'ARRAY');
                        this.util.addBulkValidators(this.addPurchaseOdrFm, [this.date_items.at(i).get('paymentAmount')], [ Validators.required, Validators.pattern(this.constant.AMOUNT_PATTERN) ],'ARRAY');
                    }else if(reqObj.poPaySchedule[i].paymentAmount == '' && reqObj.poPaySchedule[i].paymentDate == ''){
                        this.util.addBulkValidators(this.addPurchaseOdrFm, [this.date_items.at(i).get('paymentDate'), this.date_items.at(i).get('paymentAmount')], [ ],'ARRAY');
                    }
                }
            }
            else
            {
                this.util.addBulkValidators(this.addPurchaseOdrFm, [this.date_items.at(0).get('paymentDate'), this.date_items.at(0).get('paymentAmount')], [ ],'ARRAY');
            }
            this.util.addBulkValidators(this.addPurchaseOdrFm, ['shipAndHandling'], this.shipAndHandling.value != '' && this.shipAndHandling.value != null ? [ Validators.pattern(this.constant.AMOUNT_PATTERN)] : []);
            this.util.addBulkValidators(this.addPurchaseOdrFm, ['adjustment'], this.adjustment.value != '' && this.adjustment.value != null ? [ Validators.pattern(this.constant.AMOUNT_NEG_PATTERN)] : []);
            this.util.addBulkValidators(this.addPurchaseOdrFm, ['tax'], this.tax.value != '' && this.tax.value != null ? [ Validators.min(0), Validators.max(100), Validators.pattern(this.constant.AMOUNT_PATTERN)] : []);
            for (let i = 0; i < form.value.purchase_items.length; i++) {
                delete form.value.purchase_items[i].filteredClass;
                delete form.value.purchase_items[i].filteredManufacturer;
                delete form.value.purchase_items[i].filteredManufacturerPart;
            }
            if(form.valid){
                try{
                    reqObj.purchaseOrderId = this.newData.purchase_order_id;
                    self.util.addSpinner('saveExsisting', "Save");
                    this.http.doPost('purchaseOrder/edit', reqObj, function(error: boolean, response: any){
                        self.util.removeSpinner('saveExsisting', "Save");
                        if( error ){
                        }else{
                            sessionStorage.removeItem('PO_INFO');
                            self.util.showDialog(DialogComponent, response.message, [self.routeObj.list+self.newData.purchase_order_id]);
                            self.util.changeEvent({
                                'source': 'PO_SAVED',
                                'action': 'SAVE',
                                'data': reqObj
                            });
                        }
                    });
                }catch(err){
                    this.global.addException('Purchase Order','createPurchaseOrder()',err);
                }
            }
        }
    }

    cancel(type){
        sessionStorage.removeItem('PO_INFO');
        if(type==1){
            this.router.navigate(['/inventory/po/csa/purchase-order-list/0']);
        }else{
            this.util.changeEvent({
                'source': 'CANCEL_EDIT',
                'action': 'VIEW'
            });
        }
    }

}
