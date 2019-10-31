import { Component, OnInit } from '@angular/core';

import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormControl, FormGroupDirective, NgForm, Validators, FormGroup, FormBuilder, FormArray } from '@angular/forms';

import { Observable, Subscription } from 'rxjs';
import * as _ from 'underscore';
import { map, startWith } from 'rxjs/operators';
import { UtilService } from '../../../../shared/service/util.service';
import { HttpService } from '../../../../shared/service/http.service';
import { GlobalService } from '../../../../shared/service/global.service';
import { ConstantsService } from '../../../../shared/service/constants.service';
import { InventoryDialog } from '../../inventory-dialog.component';
import { ManufacturerDialog } from '../../../../shared/module/manufacturer/manufacturer/manufacturer.component';
import { DialogComponent } from '../../../../shared/model/dialog/dialog.component';


declare var $ :any;

@Component({
    selector: 'app-add-receiving-slip',
    templateUrl: './add-receiving-slip.component.html',
    styleUrls: ['./add-receiving-slip.component.css']
})
export class AddReceivingSlipComponent implements OnInit {
    addUnlistedItemFm: FormGroup;
    today = new Date();
    problemItemFm: FormGroup;
    isError: boolean = false;
    submitted: boolean = false;
    errMsg: string = '';
    isErrorPI: boolean = false;
    errMsgPI: string = '';
    poData: any = { 'order_items': [] };
    inventoryCart: any[] = [];
    manufacturerList: any[] = [];
    materialManufacturerList: any[] = [];
    classList: any[] = [];
    unlistedExtraItem: any[] = [];
    receiveAll;
    poDate: any;
    private receivingSlipId: number;
    private currentRow: number;

    subscription: Subscription;

    constructor(
        private router: Router,
        public dialog: MatDialog,
        public util:UtilService,
        public constant: ConstantsService,
        private http: HttpService,
        private fb: FormBuilder,
        private global: GlobalService,
        private route: ActivatedRoute,
    ) { }

    ngOnInit() {
        this.util.menuChange({'menu':3,'subMenu':23});
        this.util.setWindowHeight();
        this.util.setPageTitle(this.route);
        

        try{
            this.getPOById(JSON.parse(sessionStorage.getItem('po')).purchase_order_id);
            this.getManufacturerList();
            this.getClassList();
            this.util.setReceivingItemCount(0);
            this.subscription = this.util.changeDetection.subscribe(ofDataObj => {
                if(ofDataObj){
                    if(ofDataObj.data && ofDataObj.source == 'INVENTORY_DIALOG' && ofDataObj.data.step == 'CONTINUE_ADDING'){
                        this.inventoryCart.length > 0 ? this.continueAdding() : this.inventoryCart.length == 0 ? this.getPOById(JSON.parse(sessionStorage.getItem('po')).purchase_order_id) : '';
                    }else if(ofDataObj.data && ofDataObj.source == 'ON_THE_FLY_MANUFACTURER_PART' && ofDataObj.data.step == 'DONE'){
                        this.getManufacturerPart('REFRESH', this.currentRow, ofDataObj.data.id);
                    }else if(ofDataObj.source == 'MANUFACTURER'){
                        this.getManufacturerList('REFRESH');
                    }else if(ofDataObj.data && ofDataObj.source == 'ON_THE_FLY_DIALOG' && ofDataObj.data.step == 'CLOSE'){
                        this.getPOById(JSON.parse(sessionStorage.getItem('po')).purchase_order_id);
                    }
                }
            });
        }catch(err){
            this.global.addException('Add Receiving Slip', 'ngOnInit()', err);
        }
        console.log("Onload.....");
    }

    ngOnDestroy() { 
        this.util.setReceivingItemCount(0);
        this.subscription.unsubscribe();
    }

   

    getPOById(poId, origin: string = 'INIT'): void {
        let self = this;
        try{
            this.util.showProcessing('processing-spinner');
            this.http.doGet('purchaseOrder/'+poId, function(error: boolean, response: any){
                self.util.hideProcessing('processing-spinner');
                if(error){ console.log(response.message) }else{
                    response.data.supplier_name = response.data.supplier_name.supplier_name;
                    self.poData = response.data;
                    self.poData.order_items.map(item => {
                        item.quantity_ordered = parseFloat(item.quantity_ordered);
                        item.quantity_received = parseFloat(item.quantity_received);
                    });
                    self.poDate = self.util.getDateObjet(response.data.purchase_order_date);
                    self.createForm(origin);
                }
            });
        }catch(err){
            this.global.addException('Add Receiving Slip', 'getPOById()', err);
        }    
    };


    // ###############################  ORDER ITEMS  ############################### 
    continueAdding(): void {
        try{
            if(this.inventoryCart[0].item_manuf_parts_name.manuf_part_class_name.item_class_type == 'Product' || this.inventoryCart[0].item_manuf_parts_name.manuf_part_class_name.item_class_type == 'Material'){
                this.inventoryCart.shift(); 
            }else{
                this.inventoryCart[0].quantity_received_OTF < this.inventoryCart[0].qty_received ? this.inventoryCart[0].quantity_received_OTF++ : this.inventoryCart.shift();
            }
            this.inventoryCart.length > 0 ? this.processInventory() : this.getPOById(this.poData.purchase_order_id, 'REFRESH');
        }catch(err){
            this.global.addException('Add Receiving Slip', 'continueAdding()', err);
        }      
    }

    receiveAllCheck(): void {
        try{
            if(this.receiveAll){
                for (let i = 0; i < this.poData.order_items.length; i++) {
                    if(this.poData.order_items[i].quantity_ordered > this.poData.order_items[i].quantity_received)
                        this.poData.order_items[i].qty_received = this.poData.order_items[i].quantity_ordered-this.poData.order_items[i].quantity_received;
                }
            }else{
                for (let i = 0; i < this.poData.order_items.length; i++) {
                    if(this.poData.order_items[i].quantity_ordered != this.poData.order_items[i].quantity_received && this.poData.order_items[i].quantity_ordered > this.poData.order_items[i].quantity_received)
                        this.poData.order_items[i].qty_received = '';
                }
            }
        }catch(err){
            this.global.addException('Add Receiving Slip', 'receiveAllCheck()', err);
        }     
    }

    addToInventory(): void {
        try{
            this.inventoryCart = this.poData.order_items.filter(item => item.qty_received != '' && item.qty_received > 0);
            this.isError = false;
            this.submitted = true;

            if(!this.addUnlistedItemFm.valid || !this.problemItemFm.valid){
                return;   
            }

            if (this.inventoryCart.length == 0 && this.unlisted_items.length == 0 && this.problem_items.length == 0) {
                this.isError = true;
                this.errMsg = 'Please enter valid received quantity.'
                return;
            }
            this.inventoryCart = this.inventoryCart.filter(item => item.quantity_received_OTF = 1);

            this.addReceivingslip();
        }catch(err){
            this.global.addException('Add Receiving Slip', 'addToInventory()', err);
        }     
    }

    addReceivingslip(): void {
        let self = this;
        try{
            let reqObj: any = {
                'purchase_order_id': this.poData.purchase_order_id,
                'ordered_item': [],
                'problem_item': [],
                'unlisted_item': []
            };

            let unlistedItems = this.addUnlistedItemFm.value.unlisted_items;
            for (let i = 0; i < unlistedItems.length; ++i) {
                if(parseFloat(unlistedItems[i].quantity_received) < 0 || parseFloat(unlistedItems[i].price_per_unit) < 0){
                    this.isError = true;
                    this.errMsg = 'Please enter valid received quantity and Price/Unit.'
                    return;
                }

                reqObj.unlisted_item.push({
                    "manufacturer_id": unlistedItems[i].manf_id,
                    "manufacturer_part_id": unlistedItems[i].manf_part_id,
                    "quantity_received": JSON.parse(JSON.stringify(unlistedItems[i].quantity_received)),
                    "price_per_unit": JSON.parse(JSON.stringify(unlistedItems[i].price_per_unit))
                })
            }

            for (let i = 0; i < this.inventoryCart.length; ++i) {
                
                if((this.inventoryCart[i].qty_received!='') && (!this.constant.AMOUNT_PATTERN.test(this.inventoryCart[i].qty_received))){
                    this.isError = true;
                    this.errMsg = 'Invalid Received quantity of Ordered Items.'
                    return;
                }
                if(parseFloat(this.inventoryCart[i].qty_received) > (parseFloat(this.inventoryCart[i].quantity_ordered) - parseFloat(this.inventoryCart[i].quantity_received))){
                    this.isError = true;
                    this.errMsg = 'Received quantity should less than ordered quantity.'
                    return;
                }
                if(this.inventoryCart[i].item_manuf_parts_name.manuf_part_class_name.item_class_type == 'Product' || this.inventoryCart[i].item_manuf_parts_name.manuf_part_class_name.item_class_type == 'Material'){
                    this.inventoryCart[i].uom_id = this.inventoryCart[i].item_manuf_parts_name.uom_name.uom_id;
                    this.inventoryCart[i].uom = this.inventoryCart[i].item_manuf_parts_name.uom_name.uom_name;
                }else{
                    this.inventoryCart[i].uom_id = '';
                    this.inventoryCart[i].uom = '';
                }
                reqObj.ordered_item.push({ 
                    "purchase_order_item_id": this.inventoryCart[i].purchase_order_item_id, 
                    "quantity_received": this.inventoryCart[i].qty_received 
                });    
            } 

            let problemItems = this.problemItemFm.get('problem_items').value;
            for (let i = 0; i < problemItems.length; ++i) {
                let poItemDetails = this.poData.order_items.filter(item => item.purchase_order_item_id == problemItems[i].purchase_order_item_id);
                let receiveItemDetails = reqObj.ordered_item.filter(item => item.purchase_order_item_id == problemItems[i].purchase_order_item_id); 
                if (receiveItemDetails.length > 0) {
                    if(parseFloat(problemItems[i].quantity) > (parseFloat(poItemDetails[0].quantity_ordered) - parseFloat(receiveItemDetails[0].quantity_received))){
                        this.isError = true;
                        this.errMsg = 'Problem items and received quantity should less than ordered quantity.'
                        return;
                    }
                }else{
                    if(parseFloat(problemItems[i].quantity) > parseFloat(poItemDetails[0].quantity_ordered)){
                        this.isError = true;
                        this.errMsg = 'Problem items and received quantity should less than ordered quantity.'
                        return;
                    }
                }
                reqObj.problem_item.push({
                    'purchase_order_item_id': problemItems[i].purchase_order_item_id,
                    'quantity': problemItems[i].quantity,
                    'comment': problemItems[i].comment
                });
            }

            self.util.addSpinner('add-inventory', "Add to inventory");
            this.http.doPost('receivingslip', reqObj, function(error: boolean, response: any){
                self.util.removeSpinner('add-inventory', "Add to inventory");
                if(error){
                    self.isError = true;
                    self.errMsg = response.message;
                }else{
                    self.receivingSlipId = response.data;
                    self.checkUnlistedItems();
                }
            });
            //self.receivingSlipId = 310;
            //self.checkUnlistedItems();
        }catch(err){
            this.global.addException('Add Receiving Slip', 'addReceivingslip()', err);
        }     

        //this.processInventory();
    }

    checkUnlistedItems(): void {
        try{
            if(this.unlisted_items.length > 0){
                //let unlistedItems = this.addUnlistedItemFm.value.unlisted_items;
                let unlistedItems = [...this.addUnlistedItemFm.value.unlisted_items]
                //let unlistedItems = Object.assign({}, this.addUnlistedItemFm.value.unlisted_items);
                for (let i = 0; i < unlistedItems.length; ++i) {
                    let itemObj: any = unlistedItems[i];
                    if(itemObj.selectedMfgPart.class_name.item_class_type == 'Product' || itemObj.selectedMfgPart.class_name.item_class_type == 'Material' ){
                        itemObj.quantity_ordered = itemObj.quantity_received;
                    }else{
                        itemObj.quantity_received_OTF = 1;
                        itemObj.qty_received = itemObj.quantity_received;                  
                    }
                    
                    delete itemObj.quantity_received;
                    //delete itemObj.price_per_unit;
                    delete itemObj.manfPartsList;
                    delete itemObj.filteredClass;
                    delete itemObj.filteredManufacturer;
                    delete itemObj.filteredManufacturerPart;
                    itemObj.receiving_slip_id = this.receivingSlipId;
                    itemObj.item_manuf_parts_name = { 'manuf_part_class_name': { 'item_class_type': itemObj.selectedMfgPart.class_name.item_class_type } }
                    this.inventoryCart.push(itemObj);
                }
                this.inventoryCart.length > 0 ? this.processInventory() : this.getPOById(JSON.parse(sessionStorage.getItem('po')).purchase_order_id, 'REFRESH');
            }else{
                this.inventoryCart.length > 0 ? this.processInventory() : this.getPOById(JSON.parse(sessionStorage.getItem('po')).purchase_order_id, 'REFRESH');
            }
        }catch(err){
            this.global.addException('Add Receiving Slip', 'checkUnlistedItems()', err);
        }     
    }

    processInventory(): void {
        try{
            this.calculateReceivingItemCount(this.inventoryCart);
            this.inventoryCart[0].item_manuf_parts_name.manuf_part_class_name.item_class_type == 'Product' || this.inventoryCart[0].item_manuf_parts_name.manuf_part_class_name.item_class_type == 'Material' ? this.inventoryCart[0].is_unlisted == 1 ? this.prepareAddProductAndMaterial({}, this.inventoryCart[0]) : this.createInventoryObject(this.inventoryCart[0]) : this.inventoryCart[0].is_unlisted == 1 ? this.prepareAddAsset({}, this.inventoryCart[0]) : this.createInventoryObject(this.inventoryCart[0], 'ASSET') ;
            this.util.changeEvent(null);
        }catch(err){
            this.global.addException('Add Receiving Slip', 'processInventory()', err);
        }     
    }

    createInventoryObject(poItem: any, inventoryType: string = 'PRODUCT/MATERIAL'): void {
        try{
            let inventoryObject = {
                'po_id': poItem.purchase_order_id,
                'po_item_id': poItem.purchase_order_item_id,
                'receiving_slip_id': this.receivingSlipId, 
                'manf_id': poItem.manufacturer_id,
                'manufacturer': poItem.item_manuf_name.manf_name,
                'manf_part_id': poItem.manufacturer_part_id,
                'manufacturerPart': poItem.item_manuf_parts_name.short_name,
                'itemClassType': poItem.item_manuf_parts_name.manuf_part_class_name.item_class_type,
                'uom_id': poItem.uom_id,
                'uom': poItem.uom,
                'is_unlisted': 0,
                'comment': '',
            }
            inventoryType == 'PRODUCT/MATERIAL' ? this.prepareAddProductAndMaterial(poItem, inventoryObject) : this.prepareAddAsset(poItem, inventoryObject) ;
        }catch(err){
            this.global.addException('Add Receiving Slip', 'createInventoryObject()', err);
        }     
    }

    prepareAddProductAndMaterial(poItem: any, itemObj): void {
        try{
            let locKey: string = itemObj.itemClassType == 'Material' ? 'material_location' : 'products_location' ;
            itemObj.supplier_id = this.poData.supplier_id;
            itemObj.supplier = this.poData.supplier_name;
            itemObj.quantity_ordered = itemObj.totalQuantity = itemObj.remainingQuantity = itemObj.quantity_ordered ? itemObj.quantity_ordered : poItem.qty_received;
            itemObj.purchase_price = itemObj.is_unlisted == 0 ? poItem.price_per_unit : itemObj.price_per_unit ;
            if(itemObj.itemClassType == 'Material'){
                itemObj.class_name = itemObj.itemClass ? itemObj.itemClass : poItem.item_manuf_parts_name.manuf_part_class_name.item_class_name;
                itemObj.item_class_id = itemObj.itemClassId ? itemObj.itemClassId : poItem.item_manuf_parts_name.manuf_part_class_name.item_class_id;
                itemObj.material_name = itemObj.manufacturerPart;
            }

            itemObj[locKey] = [{
                'location_name': '',
                'location_id': '',
                'location_tag_id': '',
                'location_tag_name': '',
                'quantity': '',
                //'purchase_price': '',
                'locationList': [],
            }]

            if(itemObj.itemClassType == 'Material'){
                sessionStorage.setItem('materialInfo', JSON.stringify({'requestData': itemObj, 'displayData': {}}));
                this.dialog.open(InventoryDialog, { data: { 'action':  'addMaterial' } });
            }else{
                sessionStorage.setItem('productInfo', JSON.stringify({'requestData': itemObj, 'displayData': {}}));
                this.dialog.open(InventoryDialog, { data: { 'action':  'addProduct' } });
            }

        }catch(err){
            this.global.addException('Add Receiving Slip', 'prepareAddProductAndMaterial()', err);
        }     
    }

    prepareAddAsset(poItem: any, assetObj): void {
        console.log(poItem);
        console.log(assetObj);
        try{
            assetObj.serial_no = '';
            assetObj.short_tag = '';
            assetObj.scan_code = '';
            assetObj.location = '';
            assetObj.location_tag = '';
            assetObj.assign_to = '';
            assetObj.assign_name = '';
            assetObj.supplier = this.poData.supplier_name;
            assetObj.supplier_id = this.poData.supplier_id;
            assetObj.purchase_date = this.util.getYYYYMMDDDate(this.poDate);
            assetObj.purchase_price = poItem.price_per_unit;
            assetObj.manf_part = {
                'manf_part_id': assetObj.is_unlisted == 0 ? poItem.manufacturer_part_id : assetObj.selectedMfgPart.manf_part_id ,
                'short_name': assetObj.is_unlisted == 0 ? poItem.item_manuf_parts_name.short_name : assetObj.selectedMfgPart.short_name,
                'class_name': assetObj.is_unlisted == 0 ? { 'item_class_name': poItem.item_manuf_parts_name.manuf_part_class_name.item_class_name } : { 'item_class_name': assetObj.selectedMfgPart.class_name.item_class_name },
                'upc': assetObj.is_unlisted == 0 ? poItem.item_manuf_parts_name.upc : assetObj.selectedMfgPart.upc
            }
            assetObj.quantity_status = assetObj.is_unlisted == 0 ? poItem.quantity_received_OTF+'/'+poItem.qty_received : assetObj.quantity_received_OTF+'/'+assetObj.qty_received;
            assetObj.scan_code = "System Generated";
            sessionStorage.setItem('ASSET_OLD',JSON.stringify(assetObj));
            this.dialog.open(InventoryDialog, { data: { 'action':  'addAsset' } });
        }catch(err){
            this.global.addException('Add Receiving Slip', 'prepareAddAsset()', err);
        }     
    }
    // #############################  END ORDER ITEMS  ############################### 

    calculateReceivingItemCount(cart): void {
        let count = 0;
        this.inventoryCart.map(item => {
            if(item.item_manuf_parts_name.manuf_part_class_name.item_class_type == 'Product' || item.item_manuf_parts_name.manuf_part_class_name.item_class_type == 'Material'){
                count++;
            }else{
                count = count + (this.inventoryCart[0].qty_received - item.quantity_received_OTF) + 1 ;
            }
        });
        this.util.setReceivingItemCount(count);
    }
    

    // ================   ITEM CLASS  ===================== //
    private getClassList(origin: string = 'INIT'): void {
        let self = this;
        try{
            this.http.doGet('itemclass', function(error: boolean, response: any){    
                if(error){ console.log(response) }else{
                    self.classList = response.data.filter(item => item.item_class_name);
                }
            });
        }catch(err){
            this.global.addException('Add Receiving Slip', 'getClassList()', err);
        }     
    }
    getSelectedClass(classObj, event: any = false, index): void { 
        try{
            event ? event.isUserInput ? (this.unlisted_items.at(index).get('itemClassType').setValue(classObj.item_class_type),this.unlisted_items.at(index).get('itemClassId').setValue(classObj.item_class_id)) : '' : (this.unlisted_items.at(index).get('itemClassType').setValue(classObj.item_class_type),this.unlisted_items.at(index).get('itemClassId').setValue(classObj.item_class_id));
            this.clearFields(index);
            classObj.item_class_type == 'Material' ? (this.getManufacturerPart('INIT', index, this.materialManufacturerList[0].manf_id),this.getMfg(this.materialManufacturerList[0], false, index)) : '';
        }catch(err){
            this.global.addException('Add Receiving Slip', 'getSelectedClass()', err);
        }     
    }
    private classFilter(value: string): string[] {
        try{
            return this.classList.filter(option => option.item_class_name.toLowerCase().includes(value ? value.toLowerCase() : ''));
        }catch(err){
            this.global.addException('Add Receiving Slip', 'classFilter()', err);
        }     
    }
    public validateClass(event:any, item:any, index){
        try{
            let className = event.target.value;
            if(className == ''){ 
                item.get('itemClassId').setValue('');
                item.get('itemClassType').setValue('');
                this.clearFields(index);
                return;
            }
            let match = this.classList.filter(item=>item.item_class_name.toLowerCase() == className.toLowerCase());
            if(match.length > 0){
                item.get('itemClassId').setValue(match[0].item_class_id);
                item.get('itemClass').setValue(match[0].item_class_name);
                item.get('itemClassType').setValue(match[0].item_class_type);
                this.clearFields(index);
                match[0].item_class_type == 'Material' ? (this.getManufacturerPart('INIT', index, this.materialManufacturerList[0].manf_id),this.getMfg(this.materialManufacturerList[0], false, index)) : '';
            }else{
                item.get('itemClassId').setValue('');
            }
        }catch(err){
            this.global.addException('Add Receiving Slip', 'validateClass()', err);
        }     
    }
    
    clearFields(index): void {
        try{
            this.unlisted_items.at(index).get('manf_id').setValue('');
            this.unlisted_items.at(index).get('manufacturer').setValue('');
            this.unlisted_items.at(index).get('manufacturerPart').setValue('');
            this.unlisted_items.at(index).get('manfPartsList').setValue([]);
            this.unlisted_items.at(index).get('manf_part_id').setValue('');
        }catch(err){
            this.global.addException('Add Receiving Slip', 'clearFields()', err);
        }     
    }
    //showAddManufacturerPopup(index): void { this.currentRow = index; this.util.changeEvent(null);this.dialog.open(ManufacturerDialog, { data: { 'action': 'addManufacturer' } }); }
    // ===============   END ITEM CLASS  =================== //

    // ================   MANUFACTURER  ===================== //
    private getManufacturerList(origin: string = 'INIT'): void {
        let self = this;
        try{
            this.http.doGet('manufacturer', function(error: boolean, response: any){    
                if(error){ console.log(response) }else{
                    // self.manufacturerList = response.data.filter(item => item.is_material_default == 0);
                    self.manufacturerList = response.data;
                    self.materialManufacturerList = response.data.filter(item => item.is_material_default != 0);
                    //self.materialManufacturerList.push(self.manufacturerList[0]);
                    origin == 'REFRESH' ? (self.getMfg(self.manufacturerList[self.manufacturerList.length - 1], {}, self.currentRow),self.unlisted_items.at(self.currentRow).get('manufacturer').setValue(self.manufacturerList[self.manufacturerList.length - 1].manf_name)) : '';
                }
            });
        }catch(err){
            this.global.addException('Add Receiving Slip', 'getManufacturerList()', err);
        }     
    }
    getMfg(mfg, event: any = false, index): void { 
        try{
            event ? event.isUserInput ? (this.unlisted_items.at(index).get('manf_id').setValue(mfg.manf_id), this.getManufacturerPart('INIT', index, mfg.manf_id),this.setItemType(index, mfg)) : '' : (this.unlisted_items.at(index).get('manf_id').setValue(mfg.manf_id), this.getManufacturerPart('INIT', index, mfg.manf_id), this.setItemType(index, mfg)); 
            this.unlisted_items.at(index).get('manufacturerPart').setValue('');
            this.unlisted_items.at(index).get('manf_part_id').setValue('');
        }catch(err){
            this.global.addException('Add Receiving Slip', 'getMfg()', err);
        }     
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
        this.unlisted_items.at(index).get('itemClassType').setValue(list);
    }

    private manufacturerFilter(value: string): string[] {
        try{
            return this.manufacturerList.filter(option => option.manf_name.toLowerCase().includes(value ? value.toLowerCase() : ''));
        }catch(err){
            this.global.addException('Add Receiving Slip', 'manufacturerFilter()', err);
        } 
    }
    public validateManf(event:any, item:any, index){
        try{
            let manf = event.target.value;
            if(manf == ''){ 
                item.get('manf_id').setValue('');
                this.unlisted_items.at(index).get('manf_part_id').setValue('');
                this.unlisted_items.at(index).get('manufacturerPart').setValue('');
                return;
            }
            let match = this.manufacturerList.filter(item=>item.manf_name.toLowerCase() == manf.toLowerCase());
            if(match.length > 0){
                item.get('manf_id').setValue(match[0].manf_id);
                item.get('manufacturer').setValue(match[0].manf_name);
                this.getManufacturerPart('INIT', index, match[0].manf_id);
                this.unlisted_items.at(index).get('manf_part_id').setValue('');
                this.unlisted_items.at(index).get('manufacturerPart').setValue('');
                this.setItemType(index, match[0]);
            }else{
                item.get('manf_id').setValue('');
            }
        }catch(err){
            this.global.addException('Add Receiving Slip', 'validateManf()', err);
        }     
    }
    showAddManufacturerPopup(index): void { this.currentRow = index; this.util.changeEvent(null);this.dialog.open(ManufacturerDialog, { data: { 'action': 'addManufacturer' } }); }
    // ===============   END MANUFACTURER  =================== //

    // ================   ITEM DEFINITION  ===================== //
    private getManufacturerPart(origin: string = 'INIT', index, mfgId): void {
        let self = this;
        try{
            this.http.doGet('manufPartById/'+mfgId, function(error: boolean, response: any){    
                if(error){ console.log(response) }else{
                    self.unlisted_items.at(index).get('manfPartsList').setValue(response.data);
                    self.unlisted_items.at(index).get('filteredManufacturerPart').setValue(self.unlisted_items.at(index).get('manufacturerPart').valueChanges.pipe(startWith(''),map(value => self.manufacturerPartFilter(value, index))));

                    //origin == 'REFRESH' ? (self.getManfPart(response.data[response.data.length - 1], false, index),self.unlisted_items.at(index).get('manf_id').setValue(mfgId),self.unlisted_items.at(index).get('manufacturer').setValue(self.manufacturerList.filter(item => item.manf_id == mfgId)[0].manf_name),self.unlisted_items.at(index).get('manufacturerPart').setValue(response.data[response.data.length-1].short_name)) : '';
                    
                    origin == 'REFRESH' ? self.autoSelectNewlyAddedMfgPart(index, mfgId, response.data[response.data.length - 1]) : '' ;
                }
            });
        }catch(err){
            this.global.addException('Add Receiving Slip', 'getManufacturerPart()', err);
        }     
    }
    autoSelectNewlyAddedMfgPart(index, mfgId, newPart): void {
        this.getManfPart(newPart, false, index);
        this.unlisted_items.at(index).get('manf_id').setValue(mfgId);
        this.unlisted_items.at(index).get('manufacturerPart').setValue(newPart.short_name);
        this.unlisted_items.at(index).get('manufacturer').setValue(newPart.manf_name);
        //this.unlisted_items.at(index).get('itemClassId').setValue(newPart.class_id);
        //this.unlisted_items.at(index).get('itemClass').setValue(newPart.class_name.item_class_name);
    }

    getManfPart(part, event: any = false, index): void { 
        event ? event.isUserInput ? this.getMfgPartDetails(part, index) : '' : this.getMfgPartDetails(part, index); 
    }
    getMfgPartDetails(part, index): void {
        try{
            this.unlisted_items.at(index).get('manf_part_id').setValue(part.manf_part_id);
            this.unlisted_items.at(index).get('selectedMfgPart').setValue(part);
            if(part.class_name.item_class_type == 'Product' || part.class_name.item_class_type == 'Material'){
                this.unlisted_items.at(index).get('uom_id').setValue(part.uom_name.uom_id);
                this.unlisted_items.at(index).get('uom').setValue(part.uom_name.uom_name);
            }
        }catch(err){
            this.global.addException('Add Receiving Slip', 'getMfgPartDetails()', err);
        }     
    }
    private manufacturerPartFilter(value: string, index): string[] {
        try{
            return this.unlisted_items.at(index).get('manfPartsList').value.filter(option => (option.short_name.toLowerCase().includes(value ? value.toLowerCase() : '')));
        }catch(err){
            this.global.addException('Add Receiving Slip', 'manufacturerPartFilter()', err);
        }     
    }
    public validateManfPart(event:any, item:any, index){
        try{
            let manfPart = event.target.value;
            let match = this.unlisted_items.at(index).get('manfPartsList').value.filter(item=>item.short_name.toLowerCase() == manfPart.toLowerCase());
            if(match.length > 0){
                item.get('manf_part_id').setValue(match[0].manf_part_id);
                item.get('manufacturerPart').setValue(match[0].short_name);
                item.get('selectedMfgPart').setValue(match[0]);
                if(match[0].class_name.item_class_type == 'Product' || match[0].class_name.item_class_type == 'Material'){
                    this.unlisted_items.at(index).get('uom_id').setValue(match[0].uom_name.uom_id);
                    this.unlisted_items.at(index).get('uom').setValue(match[0].uom_name.uom_name);
                }
            }else{
                item.get('manf_part_id').setValue('');
            }
        }catch(err){
            this.global.addException('Add Receiving Slip', 'validateManfPart()', err);
        }     
    }
    showAddManufacturerPartPopup(index): void { 
        this.currentRow = index;
        sessionStorage.removeItem('newPart');
        this.unlisted_items.at(index).get('itemClassType').value != '' ? sessionStorage.setItem('class',JSON.stringify(this.unlisted_items.at(index).get('itemClassType').value)) : sessionStorage.removeItem('class');
        this.util.changeEvent(null);
        this.dialog.open(InventoryDialog, { data: { 'action': 'addNewManufacturerPart' } }); 
    }
    // ===============   END ITEM DEFINITION  =================== //
    
    // ===============   UNLISTED ITEM =================== //
    showUnlistedItem(){ 
        try{
            this.unlisted_items.length == 0 ? (this.addPurchaseItem(),$('html,body').animate({scrollTop: $( "#unlistedItemFm" ).offset().top}, 1500)) : '';
        }catch(err){
            this.global.addException('Add Receiving Slip', 'showUnlistedItem()', err);
        }     
    }
    createForm(origin){
        try{
            this.addUnlistedItemFm = this.fb.group({
                unlisted_items: this.fb.array([]),
            });
            if(origin == 'INIT'){
                this.problemItemFm = this.fb.group({
                    purchase_order_id: new FormControl(JSON.parse(sessionStorage.getItem('po')).purchase_order_id),
                    problem_items: this.fb.array([]),
                });
            }
        }catch(err){
            this.global.addException('Add Receiving Slip', 'createForm()', err);
        }     
    };
    get unlisted_items(): FormArray{ return <FormArray>this.addUnlistedItemFm.get('unlisted_items') as FormArray; }
    get problem_items(): FormArray{ return <FormArray>this.problemItemFm.get('problem_items') as FormArray; }
    addPurchaseItem(){
        this.isError = false;
        this.submitted = false;
        this.unlisted_items.push(this.fb.group({
            itemClassId: new FormControl(''),
            itemClass: new FormControl(''),
            itemClassType: new FormControl(''),
            filteredClass: new FormControl( new Observable<string[]>() ),

            manf_id: new FormControl('', [ Validators.required ]),
            manufacturer: new FormControl(''),
            filteredManufacturer: new FormControl( new Observable<string[]>() ),
            
            manf_part_id: new FormControl('', [ Validators.required ]),
            manufacturerPart: new FormControl(''),
            selectedMfgPart: new FormControl({}),
            manfPartsList: new FormControl([]),
            filteredManufacturerPart: new FormControl( new Observable<string[]>() ),
            

            uom_id: new FormControl(''),
            uom: new FormControl(''),
            po_id: new FormControl(JSON.parse(sessionStorage.getItem('po')).purchase_order_id),
            po_item_id: new FormControl(0),
            is_unlisted: new FormControl(1),
            comment: new FormControl(''),
            quantity_received: new FormControl('', [ Validators.required, Validators.pattern(this.constant.AMOUNT_PATTERN)]),
            price_per_unit: new FormControl('', [ Validators.required, Validators.pattern(this.constant.AMOUNT_PATTERN)]),
        }));
        this.setObservable(this.unlisted_items.length - 1);
    }

    setObservable(index): void {
        try{
            this.unlisted_items.at(index).get('filteredClass').setValue(this.unlisted_items.at(index).get('itemClass').valueChanges.pipe(startWith(''),map(value => this.classFilter(value))));
            this.unlisted_items.at(index).get('filteredManufacturer').setValue(this.unlisted_items.at(index).get('manufacturer').valueChanges.pipe(startWith(''),map(value => this.manufacturerFilter(value))));
            this.unlisted_items.at(index).get('filteredManufacturerPart').setValue(this.unlisted_items.at(index).get('manufacturerPart').valueChanges.pipe(startWith(''),map(value => this.manufacturerPartFilter(value, index))));
        }catch(err){
            this.global.addException('Add Receiving Slip', 'setObservable()', err);
        }     
    }

    removeItem(position, item){ this.unlisted_items.removeAt(position); }
    removeProblemItem(position, item){ this.problem_items.removeAt(position); }

    addUnlistedItem(option){ this.addPurchaseItem(); }

    removeUnlistedExtraItem(position){ 
        try{
            this.unlistedExtraItem.splice(position, 1); 
        }catch(err){
            this.global.addException('Add Receiving Slip', 'removeUnlistedExtraItem()', err);
        }     
    }
    // #############################  END UNLISTED ITEM  ###############################


    // #############################  PROBLEM ITEMS  ###############################


    accept(form: FormGroup) {
        try {
          this.submitted = true;
          var self = this;
          if (form.valid) {
            let data: any = {
              API_URL: "acceptAuditDiscrepancies",
              reqObj: form.value,
              event: {
                source: "AUDIT_REPORT_CONFIRM",
                action: "CONFIRM"
              }
            };
            this.util.showDialog(
              DialogComponent,
              "Are you sure you want to update. ",
              [],
              "Accept Discrepancies ?",
              "AUDIT-CONFIRMATION",
              data
            ); 
          }
        } catch (err) {
          this.global.addException('Add Receiving Slip', "accept()", err);
        }
      }

    addProblemItem(item): void {
        this.submitted = false;
        this.isErrorPI = false;
        let addStatus: boolean = true;
        try{
            for (let i = 0; i < this.problem_items.length; ++i) {
                if(this.problem_items.at(i).get('purchase_order_item_id').value == item.purchase_order_item_id)
                    addStatus = false;
            }
            if(!addStatus)
                return

            this.problem_items.push(this.fb.group({
                purchase_order_item_id: new FormControl(item.purchase_order_item_id),
                manufacturer: new FormControl(item.item_manuf_name.manf_name),
                manufacturerPart: new FormControl(item.item_manuf_parts_name.short_name),
                quantity: new FormControl('', [ Validators.required, Validators.pattern(this.constant.AMOUNT_PATTERN)]),
                comment: new FormControl('', [ Validators.required ]),
            }));
            this.problem_items.length == 1 ? $('html,body').animate({scrollTop: $( "#problemItemFm" ).offset().top}, 1500) : '';
        }catch(err){
            this.global.addException('Add Receiving Slip', 'addProblemItem()', err);
        }     
    }

    sendToSupplier(form: NgForm): void {
        let self = this;
        this.submitted = true;
        self.isErrorPI = false;
        try{
            if(form.valid){
                let reqObj = JSON.parse(JSON.stringify(form.value));
                for (let i = 0; i < reqObj.problem_items.length; ++i) {
                    if(this.poData.order_items.filter(item => item.purchase_order_item_id == reqObj.problem_items[i].purchase_order_item_id)[0].quantity_ordered < reqObj.problem_items[i].quantity){
                        self.isErrorPI = true;
                        self.errMsgPI = "Problem item quantity should not exceed ordered quantity.";
                        return;
                    }
                    delete reqObj.problem_items[i].manufacturer;
                    delete reqObj.problem_items[i].manufacturerPart;
                }

                self.util.addSpinner('send-supplier-btn', "Send to supplier");
                this.http.doPost('receivingslip/sendProblemMail', reqObj, function(error: boolean, response: any){
                    self.util.removeSpinner('send-supplier-btn', "Send to supplier");
                    if(error){
                        self.isErrorPI = true;
                        self.errMsgPI = response.data;
                        self.util.showDialog(DialogComponent, response.message);
                    }else{
                        self.util.showDialog(DialogComponent, response.message);
                        //self.getPOById(self.poData.purchase_order_id)
                  }
                }); 
            }
        }catch(err){
            this.global.addException('Add Receiving Slip', 'sendToSupplier()', err);
        }     
    }

    // #############################  END PROBLEM ITEMS  ###############################
}
