import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Router } from '@angular/router';

//import { AdminService } from '../../admin.service';
import { FileService } from '../../../../service/file.service';
import { UtilService } from '../../../../service/util.service';
import { ManufacturerPartDialog } from './../manufacturer-part.component';
import { DialogComponent } from '../../../../model/dialog/dialog.component';
import { GlobalService } from '../../../../../shared/service/global.service';
@Component({
    selector: 'app-manufacturer-part-review',
    templateUrl: './manufacturer-part-review.component.html',
    styleUrls: ['./manufacturer-part-review.component.css']
})
export class ManufacturerPartReviewComponent implements OnInit {
    isError: boolean = false;
    errMsg: string = '';
    mfgPartObj: any;
    routeObj: any;
    currentPath: string;
    constructor( 
        public router: Router,
        public util:UtilService,
        public dialog: MatDialog,
        private file: FileService,
        private global: GlobalService
        //private admin: AdminService
    ) { }

    ngOnInit() {
        this.currentPath = this.router.url.split('/')[3];
        this.router.url.split('/')[2]=='csa-onboarding' ? this.routeObj = {'list': '/csa-onboarding/guide', 'add': '/admin/csa-onboarding/add-manufacturer-part/'+btoa('0'), 'edit': '/admin/csa-onboarding/add-manufacturer-part/'+btoa('1')} : this.routeObj = {'list': '/admin/csa/manufacturer-part/0', 'add': '/admin/csa/add-manufacturer-part/'+btoa('0'), 'edit': '/admin/csa/add-manufacturer-part/'+btoa('1')};
        this.currentPath == 'manufacturer-part-review' ? this.router.url.split('/')[2]=='csa-onboarding' ? this.util.menuChange({'menu':'guide','subMenu':''}) : this.util.menuChange({'menu':2,'subMenu':14}) : '';
        this.util.setWindowHeight();
        this.mfgPartObj = JSON.parse(atob(sessionStorage.getItem('newPart')));
        this.mfgPartObj.imgDocArr = this.util.getMfgPartData();
    }


    submitNewMfgPart() {
        try {
            let self = this;
            let imgDocPriArr = this.util.getMfgPartData();
            self.util.addSpinner('sub-btn', "Submit");
            let formData: FormData = new FormData();
            let description: string = '', thumbnail: number = -1;
            formData.append('manufacturerId', self.mfgPartObj.manufacturerId);
            formData.append('manufacturerPartNo', self.mfgPartObj.manufacturerPartNo);
            formData.append('manfUPC', self.mfgPartObj.manfUPC);
            formData.append('fullName', self.mfgPartObj.fullName);
            formData.append('shortName', self.mfgPartObj.shortName);
            formData.append('UOM', self.mfgPartObj.UOM);
            formData.append('class', self.mfgPartObj.class);
            formData.append('replaces', JSON.stringify(self.getSelectedValuesArray(self.mfgPartObj.replaces, 'replace')));
            formData.append('equivalent', JSON.stringify(self.getSelectedValuesArray(self.mfgPartObj.equivalent, 'equivalent')));
            formData.append('minimumStock', self.mfgPartObj.minimumStock);
            // formData.append('approxUnitPrice', self.mfgPartObj.approxUnitPrice );
            formData.append('salesMarkup', self.mfgPartObj.salesMarkup);
            formData.append('attribute', JSON.stringify(self.mfgPartObj.attribute));
            formData.append('fileCount', imgDocPriArr.length.toString());
            for (var i = 0; i < imgDocPriArr.length; i++) {
                if (imgDocPriArr[i].thumbnail == 1) { thumbnail = i };
                formData.append('fileUploaded' + (i + 1), imgDocPriArr[i].file);
                formData.append('description' + (i + 1), imgDocPriArr[i].description == '' ? "" : imgDocPriArr[i].description);
                formData.append('fileName'+(i+1), imgDocPriArr[i].fileName == '' ? "" : imgDocPriArr[i].fileName+'.'+imgDocPriArr[i].extension);
            }
            formData.append('thumbnail', JSON.stringify(thumbnail));

            this.file.formDataAPICall(formData, 'manufPart/create', function (error: boolean, response: any) {
                self.util.removeSpinner('sub-btn', "Submit");
                if (error) {
                    self.isError = true;
                    self.errMsg = response.message;
                } else {
                    sessionStorage.removeItem('newPart');
                    self.util.setMfgPartData([]);
                    self.currentPath == 'manufacturer-part-review' ? self.util.showDialog(DialogComponent, response.message, [self.routeObj.list, self.routeObj.add]) : self.onTheFlyEvent({ 'step': 'DONE', 'id': self.mfgPartObj.manufacturerId });
                }
            })
        }
        catch (err) {
            this.global.addException('Manufacturer', 'submitNewMfgPart()', err);
        }
    }

    editDetails() {
        try {
            this.currentPath == 'manufacturer-part-review' ? this.router.navigate([this.routeObj.edit]) : this.onTheFlyEvent({ 'step': 'S1' });
        } catch (err) {
            this.global.addException('Manufacturer', 'editDetails()', err);
        }
    }

    cancelAddManufacturer() {
        try {
            this.currentPath == 'manufacturer-part-review' ? this.dialog.open(ManufacturerPartDialog, { data: { 'action': 'cancelAddManufacturerPart' }, autoFocus: false }) : this.onTheFlyEvent({ 'step': 'S0' });
        } catch (err) {
            this.global.addException('Manufacturer', 'cancelAddManufacturer()', err);
        }
    }

    getSelectedValuesArray(array: any[], keyString) {
        try {
            let result = [];
            keyString = keyString + '_id';
            for (let i = 0; i < array.length; i++) {
                let obj: any = {};
                obj[keyString] = array[i];
                result.push(obj);
            }
            return result;
        }
        catch (err) {
            this.global.addException('Manufacturer', 'getSelectedValuesArray()', err);
        }
    }

    onTheFlyEvent(data): void {
        this.util.changeEvent({
            'source': 'ON_THE_FLY_MANUFACTURER_PART', 
            'action': 'ADD',
            'data': data
        });
    }

}
