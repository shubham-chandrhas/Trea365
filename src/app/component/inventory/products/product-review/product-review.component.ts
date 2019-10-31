import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';

import { UtilService } from '../../../../shared/service/util.service';
import { HttpService } from '../../../../shared/service/http.service';
import { InventoryDialog } from '../../inventory-dialog.component';
import { DialogComponent } from '../../../../shared/model/dialog/dialog.component';
import { GlobalService } from '../../../../shared/service/global.service';
@Component({
    selector: 'app-product-review',
    templateUrl: './product-review.component.html',
    styleUrls: ['./product-review.component.css']
})
export class ProductReviewComponent implements OnInit {
    isError: boolean = false;
    errMsg: string = '';
    productInfo: any;
    currentURL: string;
    private routeObj: any;
    public totalQuantity: number = 0;
    public totalPrice: number = 0;
    constructor(
        public dialog: MatDialog,
        public util:UtilService,
        public router: Router,
        private http: HttpService,
        private route: ActivatedRoute,
        private global: GlobalService
    ) { }

    ngOnInit() {
        this.util.setWindowHeight();
        this.util.setPageTitle(this.route);
        this.currentURL = this.router.url.split('/')[this.router.url.split('/').length-1];
        this.currentURL == 'product-review' ? this.router.url.split('/')[2] == 'csa-onboarding' ? this.util.menuChange({'menu':'guide','subMenu':''}) : this.util.menuChange({'menu':3,'subMenu':19}) : '';
        this.router.url.split('/')[2] == 'csa-onboarding' ? this.routeObj = { 'list': '/csa-onboarding/guide', 'add': 'inventory/csa-onboarding/add-product' } : this.routeObj = { 'list': '/inventory/csa/product-list/0', 'add': '/inventory/csa/add-product' };
        this.productInfo = JSON.parse(sessionStorage.getItem('productInfo'));
        console.log(this.productInfo);
        for(let i=0; i<this.productInfo.requestData.products_location.length; i++){
            this.totalQuantity = this.totalQuantity + parseFloat(this.productInfo.requestData.products_location[i].quantity);
            this.totalPrice = this.totalPrice + parseFloat(this.productInfo.requestData.products_location[i].purchase_price);
        }
    }

    submitProduct() {
        try {
            let self = this;
            let reqObj = JSON.parse(JSON.stringify(this.productInfo.requestData));
            let totalprodQty: any = 0;
            for (var i = 0; i < reqObj.products_location.length; ++i) {
                delete reqObj.products_location[i].location_name;
                delete reqObj.products_location[i].location_id;
                delete reqObj.products_location[i].location_tag_name;
                delete reqObj.products_location[i].locationList;
                delete reqObj.products_location[i].locationTagList;
                totalprodQty = parseFloat(totalprodQty) + parseFloat(reqObj.products_location[i].quantity);
            }
            delete reqObj.supplier;
            delete reqObj.manufacturer;
            delete reqObj.manufacturerPart;
            delete reqObj.quantity_ordered;
            self.util.addSpinner('product-sub-btn', "Submit");
            this.http.doPost('product/create', reqObj, function (error: boolean, response: any) {
                self.util.removeSpinner('product-sub-btn', "Submit");
                if (error) {
                    self.isError = true;
                    self.errMsg = response.message;
                } else {
                    sessionStorage.removeItem('productInfo');
                    self.currentURL == 'product-review' ? self.util.showDialog(DialogComponent, response.message, [self.routeObj.list, self.routeObj.add]) : self.onTheFlyEvent({ 'msg': 'New item (' + totalprodQty + ' items) succesfully added.' }, 'OTF_ADD_SUCCESS');
                }
            });
        } catch (err) {
            this.global.addException('Product review', 'submitProduct()', err);
        }

    }

    editProduct() { this.currentURL == 'product-review' ? this.router.navigate([this.routeObj.add]) : this.onTheFlyEvent({'step': 'S1'}); }

    cancelProduct() {
        try{
        sessionStorage.removeItem('productInfo');
        this.currentURL == 'product-review' ? this.router.navigate([this.routeObj.list]) : this.onTheFlyEvent({'step': 'S0'});
         }catch (err) {
            this.global.addException('Product review', 'cancelProduct()', err);
        }
    }

    onTheFlyEvent(data: any, source: string = 'ON_THE_FLY_PRODUCT'): void {
        this.util.changeEvent({
            'source': source,
            'action': 'ADD',
            'data': data
        });
    }
}
