import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import * as _ from 'underscore';

import { UtilService } from '../../../../shared/service/util.service';
import { ReceivingSlipDialog } from '../receiving-slip-dialog.component';
import { AdminService } from '../../../admin/admin.service';
import { ExportService } from '../../../../shared/service/export.service';
import { HttpService } from '../../../../shared/service/http.service';
import { ConstantsService } from '../../../../shared/service/constants.service';
import { InventoryDialog } from '../../inventory-dialog.component';
import { GlobalService } from '../../../../shared/service/global.service';

@Component({
    selector: 'app-receiving-slips-list',
    templateUrl: './receiving-slips-list.component.html',
    styleUrls: ['./receiving-slips-list.component.css']
})
export class ReceivingSlipsListComponent implements OnInit {
    pageData: any =  { 'receivingSlipList':[], 'listCount': 0, 'action':'', 'isEdit': false, 'isError': false };
    public sortColumn: string = 'receiving_slip_id';
    public sortColumnType: string = 'N';
    public sortOrder: string = 'DSC';
    public searchList: string;
    public searchTxt: string;
    public paginationKey:any;
    public listCount:number = 0;
    public selectedIndex: number;
    public errMsg:string = '';
    public isError:boolean = false;
    public submitted:boolean = false;
    public isEdit: boolean = false;
    public selectedRS: any = null;

    public rsNoSearch;
    public poNoSearch;
    public dateSearch;
    public supplierSearch;

    permissionsSet: any;

    public onBoarding:boolean = false; 

    constructor(
        public dialog: MatDialog,
        public util:UtilService,
        public router: Router,
        public constant: ConstantsService,
        private admin: AdminService,
        private http: HttpService,
        private file:ExportService,
        private route: ActivatedRoute,
        private location: Location,
        private global: GlobalService
    ) { }

    ngOnInit() {
        let self = this;
        this.router.url.split('/')[2]=='csa-onboarding' ? this.util.menuChange({'menu':'guide','subMenu':''}) : this.util.menuChange({'menu':3,'subMenu':23});
        this.paginationKey = { itemsPerPage: this.constant.ITEMS_PER_PAGE, currentPage: this.constant.CURRENT_PAGE };
        this.util.setWindowHeight();
        this.util.setPageTitle(this.route);
        this.receivingSlipList();
        this.permissionsSet = this.util.getModulePermission(97);
    }

    updateCount(count){ this.constant.ITEM_COUNT = count ;this.listCount = count; }
    getSearchTxt(filterValue: string) { if(filterValue == ''){ this.searchTxt = '' } }
    changePage(event){this.paginationKey.currentPage = event;window.scrollTo(0, 0);}
    changeItemPerPage(){window.scrollTo(0, 0);}

    receivingSlipList() {
        try {
            let self = this;
            this.util.showProcessing('processing-spinner');
            this.http.doGet('receivingslip', function (error: boolean, response: any) {
                self.util.hideProcessing('processing-spinner');
                if (error) { console.log(response.message) } else {
                    self.pageData.receivingSlipList = [];
                    for (let i = 0; i < response.data.length; i++) {
                        self.pageData.receivingSlipList.push({
                            'receiving_slip_id': response.data[i].receiving_slip.receiving_slip_id,
                            'receiving_slip_no': response.data[i].receiving_slip.receiving_slip_no,
                            'purchase_order_no': response.data[i].receiving_slip.purchase_order_no,
                            'receiving_slip_date': self.util.getFormatedDate(response.data[i].receiving_slip.receiving_slip_date),
                            'supplier_name': response.data[i].receiving_slip.supplier_name,
                            'genrated_by': response.data[i].genrated_by,
                            'ordered_item': response.data[i].ordered_item,
                            'problem_item': response.data[i].problem_item,
                            'unlisted_item': response.data[i].unlisted_item,
                            'rs_data': new Date(response.data[i].receiving_slip.receiving_slip_date).getTime()
                        });
                        
                    }
                    self.route.snapshot.paramMap.get('id') != '0' ? self.showRSDetails() : '';
                }
                if(self.pageData.receivingSlipList.length == 0) {
                    self.onBoarding = true;
                  }
                // console.log(self.pageData.receivingSlipList);
            });
        } catch (err) {
            this.global.addException('Tracker', 'receivingSlipList()', err);
        }
    }

    showRSDetails(): void {
        try {
            let sortedList: any[] = _.sortBy(this.pageData.receivingSlipList, 'receiving_slip_id').reverse();;
            for (var i = 0; i < sortedList.length; ++i) {
                if (this.route.snapshot.paramMap.get('id') == sortedList[i].receiving_slip_id) {
                    this.getSelectedRS(sortedList[i], i);
                    this.selectedIndex = i;
                    break;
                }
            }
        } catch (err) {
            this.global.addException('Tracker', 'showRSDetails()', err);
        }
    }

    getSelectedRS(selSuppObj: any, index: number) {
        try {
            let self = this;
            this.selectedRS = selSuppObj;
            this.isEdit = false;
            this.selectedIndex = index;
            self.location.go(self.location.path().split('/').splice(0, self.location.path().split('/').length - 1).join('/') + '/' + selSuppObj.receiving_slip_id);
            setTimeout(function () {
                self.util.scrollDown('rsMark');
            }, 1000);

            console.log(this.selectedRS);
        } catch (err) {
            this.global.addException('Tracker', 'getSelectedRS()', err);
        }
    }

    sortList(columnName: string){
        this.sortColumn = columnName;
        if(this.sortColumn === columnName){
            if(this.sortOrder === 'ASC')
                this.sortOrder = 'DSC';
            else
                this.sortOrder = 'ASC';
        }else{
            this.sortOrder = 'ASC';
        }
    }

    addNewRS() {
        try {
            this.util.changeEvent(null);
            this.dialog.open(InventoryDialog, { data: { 'action': 'purchaseOrderList', 'redirectPath': ['/inventory/rs/csa/add-receiving-slip'] } });
        } catch (err) {
            this.global.addException('Tracker', 'addNewRS()', err);
        }
    }
}
