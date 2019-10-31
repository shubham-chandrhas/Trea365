import { Component, Inject, OnInit, ApplicationRef } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { UploadEvent, UploadFile } from 'ngx-file-drop';

import { UtilService } from '../../shared/service/util.service';
import { HttpService } from '../../shared/service/http.service';
import { ConstantsService } from '../../shared/service/constants.service';
import { FileService } from '../../shared/service/file.service';
import { GlobalService } from '../../shared/service/global.service';

@Component({
    selector: '',
    templateUrl: './inventory-dialog.component.html',
    styleUrls: ['./inventory-dialog.component.css', './../../shared/module/manufacturer-part/manufacturer-part/mfg-attributes/mfg-attributes.component.css']
})

  
export class InventoryDialog{
    pageData: any =  { 'purchaseOrderList':[], 'listCount': 0, 'isEdit': false, 'isError': false, 'errMsg': '' ,'sortColumn': 'purchase_order_id', 'sortColumnType': 'N', 'sortOrder': 'DSC', 'addSupStep': 'S1', 'addMfgPartStep': 'S1', 'addProductStep': 'S1', 'addAsset': 'S1', 'addMaterialStep': 'S1' };
    uploadDocData: any = {'errMsg': '', 'isError': false, 'isAttributeError': false, 'newFileUpload': false, 'isThumbnailSet': false, 'dragOver': false, 'imgDocPriArr': []}
    public isDeleteCount:number = 0;
    
    constructor(
        private router: Router,
        public dialog: MatDialog,
        public util:UtilService,
        public constant: ConstantsService,
        private file: FileService,
        private ref: ApplicationRef,
        private http: HttpService,
        public dialogRef: MatDialogRef<InventoryDialog>, 
        @Inject(MAT_DIALOG_DATA) public dataObj: any, 
        private global: GlobalService
    ) {}

    ngOnInit() {
        let self = this;
        this.util.setWindowHeight();
        this.dataObj.action == 'purchaseOrderList' ? this.purchaseOrderList() : '';
        this.pageData.paginationKey = { itemsPerPage: 5, currentPage: this.constant.CURRENT_PAGE };
        //addSupOF
        if(self.dataObj.assetInfo){
            for(let i = 0; i<self.dataObj.assetInfo.attachments.length; i++){
                let attachmentObj:any = {};
                let file:any = {};
                file.name = self.dataObj.assetInfo.attachments[i].attachment_name;
                file.type = self.dataObj.assetInfo.attachments[i].attachment_type == 1 ? "image/png" : "application/pdf";
               // attachmentObj.file = file;
               if(self.dataObj.action == 'UPLOAD_ASSET_DOC'){
                attachmentObj.fileId = self.dataObj.assetInfo.attachments[i].asset_attachment_id
               }else if(self.dataObj.action == 'UPLOAD_PRODUCT_DOC'){
                attachmentObj.fileId = self.dataObj.assetInfo.attachments[i].product_attachment_id
               }else{
                attachmentObj.fileId = self.dataObj.assetInfo.attachments[i].material_attachment_id
               }
                let fileName: string[] =  self.dataObj.assetInfo.attachments[i].attachment_name.split('.');
                fileName.pop();
                //attachmentObj.fileId = self.dataObj.assetInfo.attachments[i].asset_attachment_id ? self.dataObj.assetInfo.attachments[i].asset_attachment_id : self.dataObj.assetInfo.attachments[i].product_attachment_id;
                attachmentObj.isFileDelete = 0;
                attachmentObj.attachment_name = fileName;
                attachmentObj.extension = self.dataObj.assetInfo.attachments[i].attachment_name.split('.').pop();
                attachmentObj.attachment_path = self.dataObj.assetInfo.attachments[i].attachment_path;
                attachmentObj.comment = self.dataObj.assetInfo.attachments[i].comment;
                attachmentObj.attachment_type = self.dataObj.assetInfo.attachments[i].attachment_type;
                this.uploadDocData.imgDocPriArr.push(attachmentObj);
            }
            console.log("IMGDOC ARRAY", this.uploadDocData.imgDocPriArr);
            //this.uploadDocData.imgDocPriArr = self.dataObj.assetInfo.attachments;
        }
        this.util.changeDetection.subscribe(ofDataObj => {
            if(ofDataObj && ofDataObj.data){
                if(ofDataObj.data.step == 'S0' || ofDataObj.data.step == 'DONE'){
                    this.dialogRef.close();//self.closeDialog();
                }else if(ofDataObj.source == 'ON_THE_FLY_SUPPLIER'){
                    this.pageData.addSupStep = ofDataObj.data.step; 
                }else if(ofDataObj.source == 'ON_THE_FLY_MANUFACTURER_PART'){
                    this.pageData.addMfgPartStep = ofDataObj.data.step; 
                }else if(ofDataObj.source == 'ON_THE_FLY_PRODUCT'){
                    this.pageData.addProductStep = ofDataObj.data.step; 
                }else if(ofDataObj.source == 'ON_THE_FLY_MATERIAL'){
                    this.pageData.addMaterialStep = ofDataObj.data.step; 
                }else if(ofDataObj.source == 'ON_THE_FLY_ASSET'){
                    this.pageData.addAsset = ofDataObj.data.step; 
                }else if(ofDataObj.source == 'OTF_ADD_SUCCESS'){
                    this.dataObj.action = 'SUCCESS';
                    this.dataObj.message = ofDataObj.data.msg;
                    this.dataObj.alertBtn = this.util.getReceivingItemCount() == 1 ? 'DONE' : 'CONTINUE_ADDING';
                }
            }
        });
        console.log('POPUP');
    }

    ngOnDestroy() { 
        if(this.dataObj.action == 'SUCCESS'){
            this.onTheFlyEvent('INVENTORY_DIALOG', 'ADD', {'step': 'CONTINUE_ADDING'});
        }
        if(this.dataObj.action == 'addProduct' || this.dataObj.action == 'addAsset'){
            this.onTheFlyEvent('ON_THE_FLY_DIALOG', 'CANCEL', {'step': 'CLOSE'});
        }
    } 

    purchaseOrderList() {
        let self = this;
        try {
            this.util.showProcessing('processing-spinner');
            this.http.doGet('purchaseOrderActive/active', function (error: boolean, response: any) {
                console.log(response);
                self.util.hideProcessing('processing-spinner');
                if (error) { console.log(response.message) } else {
                    // self.pageData.purchaseOrderList = response.data.filter(item => (item.supplier_name = item.supplier_name.supplier_name, item.po_date = new Date(item.purchase_order_date).getTime())).filter(item => item.status == 'Received' || item.status == 'Partial' || item.status == 'Sent');
                    self.pageData.purchaseOrderList = response.data.filter(item => (item.supplier_name = item.supplier_name.supplier_name, item.po_date = new Date(item.purchase_order_date).getTime()));
                    //if(response.data[i].status == 'Received' || response.data[i].status == 'Partial'){
                    // console.log(self.pageData.purchaseOrderList);
                }
            });
        } catch (err) {
            this.global.addException('Inventory Dailog', 'purchaseOrderList()', err);
        }
    }


    updateCount(count): void { this.constant.ITEM_COUNT = this.pageData.listCount = count ; }

    getSelectedPO(po): void {
        this.pageData.isError = false;
        this.pageData.selPO = po;
    }

    proceedWithPO(): void {
        if(this.pageData.selPO){
            sessionStorage.setItem('po', JSON.stringify(this.pageData.selPO));
            this.dialogRef.close();
            this.dataObj.redirectPath.length > 0 ? this.router.navigate([this.dataObj.redirectPath[0]]) : '';  
        }else{
            this.pageData.isError = true;
            this.pageData.errMsg = "Please select purchase order to proceed.";
        }
    }

    continueAdding(): void {
        this.dialogRef.close();
        //this.onTheFlyEvent('INVENTORY_DIALOG', 'ADD', {'step': 'CONTINUE_ADDING'});
    }

    doneWithAdding(): void {
        this.dialogRef.close();
        this.router.navigate(['/inventory/rs/csa/receiving-slips-list/0']);
    }
  
    closeDialog(): void { 
        //this.onTheFlyEvent('ON_THE_FLY_DIALOG', 'CANCEL', {'step': 'CLOSE'});
        this.dialogRef.close(); 
    }

    onTheFlyEvent(source, action, data): void {
        this.util.changeEvent({
            'source': source, 
            'action': action,
            'data': data
        });
    }

    dropped(event: UploadEvent, option) {
        try {
            let self = this;
            let extension: string = '';
            let fileDetailsObj: any = {};
            self.uploadDocData.errMsg = "";
            self.uploadDocData.isError = false;
            for (let file of event.files) {
                file.fileEntry.file(info => {
                    if (info) { self.addImg(0, [info], fileDetailsObj, extension); self.uploadDocData.dragOver = false; this.ref.tick(); }
                });
            }
        } catch (err) {
            this.global.addException('Inventory Dailog', 'dropped()', err);
        }
    }

    fileOver(event){ this.uploadDocData.dragOver = true;this.ref.tick(); }
    fileLeave(event){ this.uploadDocData.dragOver = false;this.ref.tick(); }

    changeUploadFileFlage(){
        this.uploadDocData.newFileUpload = true;
        this.ref.tick();
    }
    onFileChange(event) {
        try {
            let self = this;
            let extension: string = '';
            let fileDetailsObj: any = {};
            self.uploadDocData.errMsg = "";
            self.uploadDocData.isError = false;
            let fileList: FileList = event.target.files;
            console.log("fileList", fileList, event.target.files);
            if (fileList.length > 0) {
                let imgCount = 0;
                self.addImg(imgCount, fileList, fileDetailsObj, extension);
            }
        } catch (err) {
            this.global.addException('Inventory Dailog', 'onFileChange()', err);
        }
    }
    addImg(imgCount: number, fileList, fileDetailsObj, extension) {
        try {
            let self = this;
            let file: File = fileList[imgCount];
            fileDetailsObj = {};
            fileDetailsObj.thumbnail = 0;
            fileDetailsObj.fileId = '';
            fileDetailsObj.isFileDelete = 0;
            let fileName: string[] =  fileList[imgCount] && fileList[imgCount].name ? fileList[imgCount].name.split('.') : '';
            fileName.pop();
            fileDetailsObj.attachment_name = fileName;
            extension = fileList[imgCount].name.split('.').pop();
            

            if (extension == 'jpg' || extension == 'png' || extension == 'pdf' || extension == 'jpeg') {
                if ((fileList[imgCount].size / 1048576) < 10) {
                    self.convertToBase64(file, function (base64) {
                        fileDetailsObj.attachment_path = JSON.parse(JSON.stringify(base64));;
                        fileDetailsObj.comment = '';
                        //fileDetailsObj.attachment_path = '';
                        fileDetailsObj.extension = extension;
                        fileDetailsObj.file = file;
                        //fileDetailsObj.file = file
                        self.uploadDocData.imgDocPriArr.push(fileDetailsObj);
                        self.ref.tick();

                        if (!self.uploadDocData.isThumbnailSet) {
                            if (extension == 'jpg' || extension == 'png' || extension == 'jpeg') {
                                fileDetailsObj.thumbnail = 1;
                                self.uploadDocData.isThumbnailSet = true;
                                self.ref.tick();
                            }
                        }

                        if (self.uploadDocData.imgDocPriArr.length > 0) {
                            self.uploadDocData.newFileUpload = false;
                            self.ref.tick();
                        }

                        if (imgCount < fileList.length - 1)
                            return self.addImg(++imgCount, fileList, fileDetailsObj, extension);
                    });

                } else {
                    self.uploadDocData.errMsg = "File must be less than 10 MB.";
                    self.uploadDocData.isError = true;
                    self.ref.tick();
                }
            } else {
                self.uploadDocData.isError = true;
                self.uploadDocData.errMsg = 'Only jpg, jpeg, png or pdf file allowed.';
                self.ref.tick();
            }
        }
        catch (err) {
            this.global.addException('Inventory Dailog', 'addImg()', err);
        }
    }


    convertToBase64(file, callback){
        let reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (fileLoadedEvent:any) => {
            return callback(fileLoadedEvent.target.result);
        };
    };

    onSelectionChange(index) {
        try {
            for (var i = 0; i < this.uploadDocData.imgDocPriArr.length; i++) {
                this.uploadDocData.imgDocPriArr[i].thumbnail = 0;
            }
            this.uploadDocData.imgDocPriArr[index].thumbnail = 1;
        } catch (err) {
            this.global.addException('Inventory Dailog', 'onSelectionChange()', err);
        }
    }

    removeImgDoc(index) {
        try {
            let isThumbnail = this.uploadDocData.imgDocPriArr[index].thumbnail == 1 ? true : false;

            if (this.uploadDocData.imgDocPriArr[index].fileId != '') {
                this.uploadDocData.imgDocPriArr[index].isFileDelete = 1;
                this.isDeleteCount++;
            } else {
                this.uploadDocData.imgDocPriArr.splice(index, 1);
            }
            this.ref.tick();
            if (this.uploadDocData.imgDocPriArr.length == 0) {
                this.uploadDocData.isThumbnailSet = false;
                this.uploadDocData.newFileUpload = true;
                this.ref.tick();
            } else {
                if (isThumbnail) {
                    let checkImg = this.uploadDocData.imgDocPriArr.filter(item => item.extension != 'pdf');
                    if (checkImg.length > 0) {
                        checkImg[0].thumbnail = 1;
                        this.ref.tick();
                    } else {
                        this.uploadDocData.isThumbnailSet = false;
                        this.ref.tick();
                    }
                }
            }
        } catch (err) {
            this.global.addException('Inventory Dailog', 'removeImgDoc()', err);
        }
    }

    uploadNewDoc(){
        let self = this;
        self.util.addSpinner('update-doc-btn', "Submit");
        let formData:FormData = new FormData();
        try{
        //console.log(this.uploadDocData.imgDocPriArr, self.dataObj.assetInfo.asset_id);
        for (let i = 0; i < self.uploadDocData.imgDocPriArr.length; i++) {
            if(self.uploadDocData.imgDocPriArr[i].attachment_name == '' && self.uploadDocData.imgDocPriArr[i].isFileDelete != 1){
                self.uploadDocData.errMsg = "File name is required.";
                self.util.removeSpinner('update-doc-btn', "Submit");
                self.uploadDocData.isError = true;
                return;
            }
            else
            {
                //formData.append('extension'+(i+1), self.uploadDocData.imgDocPriArr[i].extension);
                formData.append('fileName'+(i+1), self.uploadDocData.imgDocPriArr[i].attachment_name ? self.uploadDocData.imgDocPriArr[i].attachment_name+'.'+self.uploadDocData.imgDocPriArr[i].extension : '');
                formData.append('comment'+(i+1), self.uploadDocData.imgDocPriArr[i].comment ? self.uploadDocData.imgDocPriArr[i].comment : '');
                formData.append('fileUploaded'+(i+1), self.uploadDocData.imgDocPriArr[i].file ? self.uploadDocData.imgDocPriArr[i].file : '');
                formData.append('attachmentPath'+(i+1), self.uploadDocData.imgDocPriArr[i].attachment_path ? self.uploadDocData.imgDocPriArr[i].attachment_path : '');
                //formData.append('attachmentPath'+(i+1), '');
                formData.append('fileId'+(i+1), self.uploadDocData.imgDocPriArr[i].fileId);
                formData.append('isFileDelete'+(i+1), self.uploadDocData.imgDocPriArr[i].isFileDelete);
            }
        }

        formData.append('inventoryId', self.dataObj.assetInfo.inventoryId);
        formData.append('inventoryType',  self.dataObj.assetInfo.inventoryType);
        formData.append('fileCount', self.uploadDocData.imgDocPriArr.length);
        //console.log("imgDocPriArr = ",self.uploadDocData.imgDocPriArr);
        console.log(formData);
        this.file.formDataAPICall(formData, 'inventoryFileUpload', function(error: boolean, response: any){
            self.util.removeSpinner('update-doc-btn', "Submit");
            if(error){
                self.uploadDocData.isError = true;
                self.uploadDocData.errMsg = response.message;
            }else{ 
                self.uploadDocData.isEdit = self.uploadDocData.newFileUpload = false;
                self.closeDialog();
                self.util.changeEvent({'source': self.dataObj.action, 'action': 'UPLOAD', 'data': self.dataObj.assetInfo});
            }
        });
    }
        catch (err) {
            this.global.addException('Inventory Dailog', 'uploadNewDoc()', err);
        }
    }

}