import { Component, OnInit, ApplicationRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { UploadEvent, UploadFile } from 'ngx-file-drop';

import { UtilService } from '../../../../service/util.service';
import { GlobalService } from '../../../../service/global.service';
import { ManufacturerPartDialog } from './../manufacturer-part.component';
//import { AdminService } from '../../admin.service';

declare var $:any;

@Component({
    selector: 'app-mfg-attributes',
    templateUrl: './mfg-attributes.component.html',
    styleUrls: ['./mfg-attributes.component.css']
})
export class MfgAttributesComponent implements OnInit {
    pageData: any = {'attributeList' : [{'label':'', 'format':''}], 'errMsg': '', 'isError': false, 'isAttributeError': false, 'newFileUpload': false, 'isThumbnailSet': false, 'dragOver': false, 'imgDocPriArr': []}
    currentPath: string;

    constructor(
    private router: Router,
    public util: UtilService,
    public global: GlobalService,
    private dialog: MatDialog,
    //private admin: AdminService,
    private ref: ApplicationRef,
    ) { }

    ngOnInit() {
        this.currentPath = this.router.url.split('/')[3];
        this.currentPath == 'mfg-attributes' ? this.router.url.split('/')[2]=='csa-onboarding' ? this.util.menuChange({'menu':'guide','subMenu':''}) : this.util.menuChange({'menu':2,'subMenu':14}) : '';
        this.util.setWindowHeight();
        if(sessionStorage.getItem('newPart')){
            this.pageData.attributeList = JSON.parse(atob(sessionStorage.getItem('newPart'))).attribute.length > 0 ? JSON.parse(atob(sessionStorage.getItem('newPart'))).attribute : [{'label':'', 'format':''}];
            this.pageData.imgDocPriArr = this.util.getMfgPartData();
        }
    }

    addAttribute(): void {
        try {
            this.pageData.errMsg = '';
            this.pageData.isAttributeError = false;
            if (this.pageData.attributeList.length != 0 && (this.pageData.attributeList[this.pageData.attributeList.length - 1].label == '' || this.pageData.attributeList[this.pageData.attributeList.length - 1].format == '')) {
                this.pageData.isAttributeError = true;
                this.pageData.errMsg = "Enter Attribute Label and Attribute Data.";
            } else {
                this.pageData.attributeList.push({ 'label': '', 'format': '' });
            }
        }
        catch (err) {
            this.global.addException('Mfg attribute', 'addAttribute()', err);
        }
    }

    removeAttribute(index){
        // if(this.pageData.attributeList.length == 1){
        //     this.pageData.isAttributeError = true;
        //     this.pageData.errMsg = "At Least One Attribute Label and Attribute Data Required.";
        // }else{
            this.pageData.attributeList.splice(index, 1);
        // }
    }

    mfgReview() {
        try {
            this.pageData.errMsg = '';
            this.pageData.isError = this.pageData.isAttributeError = false;
            let manufacturerPartData: any = JSON.parse(atob(sessionStorage.getItem('newPart')));
            let attArr: any = []
            for (var i = 0; i < this.pageData.attributeList.length; i++) {
                if ((this.pageData.attributeList[i].label).trim() == '' || (this.pageData.attributeList[i].format).trim() == '') {
                    if (this.pageData.attributeList.length != 1) {
                        this.pageData.isError = true;
                        this.pageData.errMsg = "Enter Attribute Label and Attribute Data.";
                        return;
                    }
                } else {
                    attArr.push(this.pageData.attributeList[i]);
                }

                // else if((this.pageData.attributeList[i].label).trim().length > 30 || (this.pageData.attributeList[i].format).trim().length > 30){
                //     this.pageData.isError = true;
                //     this.pageData.errMsg = "Attribute Label and Attribute Data must be less than 30 characters.";
                //     return;
                // }
            }
            manufacturerPartData.attribute = attArr;
            for (let i = 0; i < this.pageData.imgDocPriArr.length; i++) {
                if(this.pageData.imgDocPriArr[i].fileName == '' && this.pageData.imgDocPriArr[i].isDelete != 1){
                    this.pageData.errMsg = "File name is required.";
                    this.pageData.isError = true;
                    return;
                }
            }
            this.util.setMfgPartData(this.pageData.imgDocPriArr);
            sessionStorage.setItem('newPart', btoa(JSON.stringify(manufacturerPartData)));

            this.currentPath == 'mfg-attributes' ? this.router.url.split('/')[2] == 'csa-onboarding' ? this.router.navigate(['/admin/csa-onboarding/manufacturer-part-review']) : this.router.navigate(['/admin/csa/manufacturer-part-review']) : this.onTheFlyEvent({ 'step': 'S3' });
        } catch (err) {
            this.global.addException('Mfg attribute', 'mfgReview()', err);
        }
    }

    previousPage(){
        this.currentPath == 'mfg-attributes' ? this.router.url.split('/')[2]=='csa-onboarding' ? this.router.navigate(['/admin/csa-onboarding/add-manufacturer-part/'+btoa('1')]) : this.router.navigate(['/admin/csa/add-manufacturer-part/'+btoa('1')]) : this.onTheFlyEvent({'step': 'S1'});
    }

    cancelAddManufacturer(){
        this.currentPath == 'mfg-attributes' ? this.dialog.open(ManufacturerPartDialog, { data: { 'action': 'cancelAddManufacturerPart' }, autoFocus: false }) : this.onTheFlyEvent({'step': 'S0'});
    }

    onFileChange(event){
        let self = this;
        let extension: string = '';
        let fileDetailsObj: any = {};
        self.pageData.errMsg = "";
        self.pageData.isError = false;
        let fileList: FileList = event.target.files;
        if(fileList.length > 0) {
            let imgCount = 0;
            self.addImg(imgCount, fileList, fileDetailsObj, extension);
        }
    }

    addImg(imgCount: number, fileList, fileDetailsObj, extension){
        let self = this;
        let file: File = fileList[imgCount], fileName: string[] = [];
        fileDetailsObj = {};
        fileDetailsObj.thumbnail = 0;
        fileDetailsObj.fileName =  fileList[imgCount] && fileList[imgCount].name ? fileList[imgCount].name : '';
        extension = fileList[imgCount].name.split('.').pop();
        fileName = fileList[imgCount].name.split('.');
        fileName.pop();
        if(extension == 'jpg' || extension == 'png' || extension == 'pdf' || extension == 'jpeg'){
            if((fileList[imgCount].size/1048576) < 10 ){
                self.convertToBase64(file, function(base64){
                    fileDetailsObj.imgPath = JSON.parse(JSON.stringify(base64));;
                    fileDetailsObj.description = '';
                    fileDetailsObj.fileName = fileName.join('.');
                    fileDetailsObj.extension = extension;
                    fileDetailsObj.file = file
                    self.pageData.imgDocPriArr.push(fileDetailsObj);
                    self.ref.tick();

                    if(!self.pageData.isThumbnailSet){
                        if(extension == 'jpg' || extension == 'png' || extension == 'jpeg'){
                            fileDetailsObj.thumbnail = 1;
                            self.pageData.isThumbnailSet = true;
                            self.ref.tick();
                        }
                    }

                    if(self.pageData.imgDocPriArr.length > 0){
                        self.pageData.newFileUpload = false;
                        self.ref.tick();
                    }

                    if(imgCount < fileList.length - 1)
                        return self.addImg(++imgCount, fileList, fileDetailsObj, extension);
                });

            }else{
                self.pageData.errMsg = "File must be less than 10 MB.";
                self.pageData.isError = true;
                self.ref.tick();
            }
        }else{
            self.pageData.isError = true;
            self.pageData.errMsg = 'Only jpg, jpeg, png or pdf file allowed.';
            self.ref.tick();
        }
    }

    convertToBase64(file, callback){
        let reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (fileLoadedEvent:any) => {
            return callback(fileLoadedEvent.target.result);
        };
    };

    onSelectionChange(index){
        for (var i = 0; i < this.pageData.imgDocPriArr.length; i++) {
            this.pageData.imgDocPriArr[i].thumbnail = 0;
        }
        this.pageData.imgDocPriArr[index].thumbnail = 1;
    }

    changeUploadFileFlage(){
        this.pageData.newFileUpload = true;
        this.ref.tick();
    }

    removeImgDoc(index,option){
        console.log(index);
        try{
            let isThumbnail = this.pageData.imgDocPriArr[index].thumbnail == 1 ? true : false;
            let newList = this.pageData.imgDocPriArr.filter(item=>item.extension != 'pdf');
            let self = this;
            self.pageData.isError = false;
            self.pageData.errMsg = "";
            // let reqObj = { "manufPartFileId" : id }
            self.ref.tick();
            // if(this.pageData.imgDocPriArr[index].fileId == 0){
            //     if(isThumbnail && (newList.length > 1)){
            //         self.pageData.isError = true;
            //         self.pageData.errMsg = "You can not remove thumbnail image. If you want to remove thumbnail image please set other image as thumbnail.";
            //         self.ref.tick();
            //         return;
            //     }
            //     if(this.pageData.imgDocPriArr[index].extension != 'pdf' && this.pageData.imgDocPriArr[index].thumbnail == 1){
            //         this.pageData.isThumbnailSet = false;
            //     }
            //     this.pageData.imgDocPriArr.splice(index, 1);
            //     this.pageData.imgDocPriArr.length == 0 ? this.pageData.newFileUpload = true : '';
            //     return;
            // }
            if(option == 'img'){
                if(isThumbnail && (newList.length > 1)){
                    self.pageData.isError = true;
                    self.pageData.errMsg = "You can not remove thumbnail image. If you want to remove thumbnail image please set other image as thumbnail.";
                    self.ref.tick();
                }else{
                    // this.pageData.imgDocPriArr[index].isDelete = 1;
                    this.pageData.imgDocPriArr[index].thumbnail == 1 ? this.pageData.isThumbnailSet = false : '';
                    this.pageData.imgDocPriArr.splice(index, 1);
                    newList.length == 0 ? this.pageData.newFileUpload = true : '';
                    self.ref.tick();
                }
            }else{
                self.ref.tick();
            }
        }catch(err){
            this.global.addException('new item definition','removeImgDoc()',err);
        }



        // let isThumbnail = this.pageData.imgDocPriArr[index].thumbnail == 1 ? true : false;
        // this.pageData.imgDocPriArr.splice(index, 1);
        // this.ref.tick();
        // if(this.pageData.imgDocPriArr.length == 0){
        //     this.pageData.isThumbnailSet = false;
        //     this.pageData.newFileUpload = true;
        //     this.ref.tick();
        // }else{
        //     if(isThumbnail){
        //         let checkImg = this.pageData.imgDocPriArr.filter(item=>item.extension != 'pdf');
        //         if(checkImg.length > 0){
        //             checkImg[0].thumbnail = 1;
        //             this.ref.tick();
        //         }else{
        //             this.pageData.isThumbnailSet = false;
        //             this.ref.tick();
        //         }
        //     }
        // }
    }

    dropped(event: UploadEvent, option) {
        try {
            let self = this;
            let extension: string = '';
            let fileDetailsObj: any = {};
            self.pageData.errMsg = "";
            self.pageData.isError = false;
            for (let file of event.files) {
                file.fileEntry.file(info => {
                    if (info) { self.addImg(0, [info], fileDetailsObj, extension); self.pageData.dragOver = false; this.ref.tick(); }
                });
            }
        }
        catch (err) {
            this.global.addException('Mfg attribute', 'dropped()', err);
        }
    }

    fileOver(event){ this.pageData.dragOver = true;this.ref.tick(); }
    fileLeave(event){ this.pageData.dragOver = false;this.ref.tick(); }

    onTheFlyEvent(data): void {
        this.util.changeEvent({
            'source': 'ON_THE_FLY_MANUFACTURER_PART', 
            'action': 'ADD',
            'data': data
        });
    }
}
