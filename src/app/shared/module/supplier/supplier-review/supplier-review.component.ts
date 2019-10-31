import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';

import { UtilService } from '../../../service/util.service';
import { HttpService } from '../../../service/http.service';
import { DialogComponent } from '../../../model/dialog/dialog.component';
import { GlobalService } from '../../../../shared/service/global.service';
declare var $ :any;

@Component({
    selector: 'app-supplier-review',
    templateUrl: './supplier-review.component.html',
    styleUrls: ['./supplier-review.component.css']
})
export class SupplierReviewComponent implements OnInit {
    public errMsg:string = '';
    public isError:boolean = false; 
    public submitted:boolean = false;
    public supInfo:any;
    private routeObj: any;
    currentPath: string;
    constructor(
        private router: Router,
        public dialog: MatDialog,
        private http: HttpService,
        public util: UtilService,
        private global: GlobalService
    ) { 
        this.supInfo=JSON.parse(sessionStorage.getItem('supplierObject'));
    }

    ngOnInit() {
        this.util.setWindowHeight();
        this.currentPath = this.router.url.split('/')[3];
        this.currentPath == 'supplier-review' ? this.router.url.split('/')[2]=='csa-onboarding' ? this.util.menuChange({'menu':'guide','subMenu':''}) : this.util.menuChange({'menu':2,'subMenu':16}) : '';
        this.router.url.split('/')[2]=='csa-onboarding' ? this.routeObj = { 'add': '/admin/csa-onboarding/add-supplier', 'list': '/csa-onboarding/guide' } : this.routeObj = { 'add': '/admin/csa/add-supplier', 'list': '/admin/csa/supplier-list/0' }
    }

    addSupplier() {
        try {
            var self = this;
            this.errMsg = '';
            this.isError = false;
            this.submitted = true;
            let reqObj: any = {};
            reqObj = JSON.parse(JSON.stringify(this.supInfo.reqObj));
            reqObj.phoneNumber = self.util.unMaskPhoneNumber(this.supInfo.reqObj.phoneNumber);
            self.util.addSpinner('addSupBtn', 'Submit');
            this.http.doPost('suppliers', reqObj, function (error: boolean, response: any) {
                self.util.removeSpinner('addSupBtn', 'Submit');
                if (error) {
                    self.errMsg = response.message;
                    self.isError = true;
                } else {
                    sessionStorage.removeItem('supplierObject');
                    self.currentPath == 'supplier-review' ? (self.util.showDialog(DialogComponent, response.message, [self.routeObj.list, self.routeObj.add])) : self.onTheFlyEvent({ 'step': 'DONE' });
                }
            });
        } catch (err) {
            this.global.addException('Supplier review', 'addSupplier()', err);
        }
    }

    goToEditDetails() {
        try {
            this.currentPath == 'supplier-review' ? this.router.navigate([this.routeObj.add]) : this.onTheFlyEvent({ 'step': 'S1' });
        } catch (err) {
            this.global.addException('Supplier review', 'goToEditDetails()', err);
        }
    }
    cancelSupplier() {
        try {
            sessionStorage.removeItem('supplierObject');
            this.currentPath == 'supplier-review' ? this.router.navigate([this.routeObj.list]) : this.onTheFlyEvent({ 'step': 'S0' });
        } catch (err) {
            this.global.addException('Supplier review', 'cancelSupplier()', err);
        }

    }


    onTheFlyEvent(data): void {
        this.util.changeEvent({
            'source': 'ON_THE_FLY_SUPPLIER', 
            'action': 'ADD',
            'data': data
        });
    }

}
