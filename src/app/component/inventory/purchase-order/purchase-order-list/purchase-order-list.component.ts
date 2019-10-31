import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import * as _ from 'underscore';

import { AdminService } from '../../../admin/admin.service';
import { ConstantsService } from '../../../../shared/service/constants.service';
import { UtilService } from '../../../../shared/service/util.service';
import { HttpService } from '../../../../shared/service/http.service';
import { GlobalService } from '../../../../shared/service/global.service';

import { PurchaseOrderDialog } from '../purchase-order-dialog.component';

declare var $:any;
@Component({
    selector: 'app-purchase-order-list',
    templateUrl: './purchase-order-list.component.html',
    styleUrls: ['./purchase-order-list.component.css']
})
export class PurchaseOrderListComponent implements OnInit {

    public selectedIndex: any;
    public selectedPerOrder: any = null;
    public purchaseOrders: any = []; //this should be empty array for pagination
    public isView:boolean = false;
    // serarch and sort filters variables
    public sortColumn: String = 'purchase_order_id';
    public searchList;
    public searchTxt;
    public statusSearch;
    public ordNumberSearch;
    public dateSearch;
    public supplierSearch;
    public sortOrder = 'DSC';
    public sortVal = 'N';
    // pagination variables
    public paginationKey:any;
    public listCount:number = 0;

    public errMsg:string = '';
    public isError:boolean = false;
    public userInfo:any;
    permissionsSet: any;
    public onBoarding:boolean = false; 

    constructor(
        public dialog: MatDialog,
        public util:UtilService,
        private http: HttpService,
        private global: GlobalService,
        public constant:ConstantsService,
        public router: Router,
        private admin: AdminService,
        private route: ActivatedRoute,
        private location: Location
    ) { }

    ngOnInit() {
        this.util.showProcessing('processing-spinner');
        this.util.menuChange({'menu':3,'subMenu':22});
        this.util.setWindowHeight();
        this.util.setPageTitle(this.route);
        this.getPurchaseOrders();
        //this.util.poAction = '';
        //this.util.poID = '0';
        this.permissionsSet = this.util.getModulePermission(92);
        this.paginationKey = { itemsPerPage: this.constant.ITEMS_PER_PAGE, currentPage: this.constant.CURRENT_PAGE };
        if(localStorage.getItem('USER')){
            this.userInfo = JSON.parse(atob(localStorage.getItem('USER')));
            console.log(this.userInfo);
        }

        this.util.changeDetection.subscribe(dataObj => {
            console.log(dataObj);
            if(dataObj && dataObj.source == 'PO_SAVED'){
                this.isView = false;
                this.getPurchaseOrders('REFRESH');
                this.selectedIndex = null;
            }else if(dataObj && dataObj.source == 'PO_SENT'){
                //this.isView = false;
                this.getPurchaseOrders('REFRESH', dataObj.data.id);
                //this.selectedIndex = null;
            }else if(dataObj && dataObj.source == 'CANCEL_EDIT'){
                this.isView = false;
                this.selectedIndex = null;
            }else if(dataObj && dataObj.source == 'PO_CANCEL'){
                this.getPurchaseOrders('REFRESH');
                this.isView = false;
                this.selectedIndex = null;
            }else if(dataObj && dataObj.source == 'CANCEL_PO'){
                this.getPurchaseOrders('REFRESH');
                this.isView = false;
                this.selectedIndex = null;
            }
        });
        sessionStorage.removeItem('PO_EXISTING');
        //sessionStorage.removeItem('PO_INFO');
    }
    // pagination
    changePage(event){
        this.paginationKey.currentPage = event;
        window.scrollTo(0, 0);
    }
    changeItemPerPage(){
        window.scrollTo(0, 0);
    }
    updateCount(count){ this.constant.ITEM_COUNT = count ;this.listCount = count; }
    // search and sort filters
    getSearchTxt(filterValue: string) { if(filterValue == ''){ this.searchTxt = '' } }
    sortList(columnName: string, sortType){
        this.sortColumn = columnName;
        this.sortVal = sortType;
        if(this.sortColumn === columnName){
            if(this.sortOrder === 'ASC')
                this.sortOrder = 'DSC';
            else
                this.sortOrder = 'ASC';
        }else{
            this.sortOrder = 'ASC';
        }
    }

    addNew(){
        sessionStorage.removeItem('MFG_PART_FOR_NEW_PO');
        sessionStorage.removeItem('PO_INFO');
        this.util.poID = '0';
        this.router.navigate(['/inventory/po/csa/new-purchase-order']);
    }

    showPODetails(origin, poId): void {
        let sortedList: any[] = _.sortBy(this.purchaseOrders, 'purchase_order_id').reverse();
        let id = origin == 'REFRESH' ? poId : this.route.snapshot.paramMap.get('id');
         for (var i = 0; i < sortedList.length; ++i) {
            id == sortedList[i].purchase_order_id ? (this.selectPerOrdList(sortedList[i], i),this.selectedIndex = i):'';
        }
    }

    selectPerOrdList(obj:any, index){
        this.isView = false;
        this.selectedPerOrder = obj;
        console.log("obj :::",obj);
        this.isView = true;
        sessionStorage.removeItem('MFG_PART_FOR_NEW_PO');
        //this.util.poID = obj.purchase_order_id;
        this.location.go('/inventory/po/csa/purchase-order-list/'+obj.purchase_order_id);
        sessionStorage.setItem('POID', obj.purchase_order_id);
        this.util.poID == '0' ? sessionStorage.removeItem('PO_INFO') : '';
        this.util.changeEvent({
            'source': 'PURCHASE_ORDER',
            'action': 'VIEW',
            'data': this.selectedPerOrder
        });
    }
    getPurchaseOrders(origin: string = 'INIT', id: number = 0){
        let self = this;
        try{
            this.http.doGet('purchaseOrder', function(error: boolean, response: any){
                console.log(response);
                self.util.hideProcessing('processing-spinner');
                if( error ){
                    // console.log('error');
                    self.purchaseOrders = [];
                }else{
                    self.purchaseOrders = response.data;
                    // self.purchaseOrders = response.data.filter(item=>(
                    //         item.supplier_name = item.supplier_name.supplier_name,
                    //         item.formatedDate = self.util.getFormatedDate(item.purchase_order_date),
                    //         item.po_date = new Date(item.purchase_order_date).getTime()
                    //     ));
                    self.purchaseOrders.map(item => {
                        item.supplier_name = item.supplier_name.supplier_name;
                        item.formatedDate = self.util.getFormatedDate(item.purchase_order_date);
                        item.po_date = new Date(item.purchase_order_date).getTime();
                        item.order_items.map(poItem => {
                            poItem.isItemDelete = '0';
                        });
                        item.payment_schedules.map(poItem => {
                            poItem.isScheduleDelete = '0';
                        });
                        // item.purchase_items.map(poItem => {
                        //     poItem.isItemDelete = '0';
                        // });
                    });
                    self.route.snapshot.paramMap.get('id') != '0' || origin == 'REFRESH' ? self.showPODetails(origin, id) : '';
                }
                if(self.purchaseOrders.length == 0) {
                    self.onBoarding = true;
                  }
                console.log(self.purchaseOrders);
            });
        }catch(err){
            this.global.addException('Purchase Order List','getPurchaseOrders()',err);
        }
    }


}
