import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';

import { AdminService } from '../admin.service';
import { LocationService } from './location.service';
import { UtilService } from '../../../shared/service/util.service';
import { HttpService } from '../../../shared/service/http.service';
import { ExportService } from '../../../shared/service/export.service';
import { ConstantsService } from '../../../shared/service/constants.service';
import { GlobalService } from '../../../shared/service/global.service';

@Component({
  selector: '',
  templateUrl: './location-dialog.component.html',
  styleUrls: ['./location.component.css']
})

export class LocationDialog{

  public action: string;
  public errMsg: string = "";
  public successMsg: string = "";
  public isError: boolean = false; 
  public isSuccess: boolean = false;
  public submitted: boolean = false;
  public tagsList: any = [];
  public selLocList: any = [];
  public printList: any = [];
  public searchSelTag;
  public searchAllTag;
  public searchCode;
  public locName;
  private currentPath: string;

  constructor(
    private router: Router,
    public util: UtilService,
    private exportDoc: ExportService,
    private location: LocationService,
    private http: HttpService,
    private admin: AdminService,
    private global: GlobalService,
    public dialogRef: MatDialogRef<LocationDialog>, 
    @Inject(MAT_DIALOG_DATA) public dataObj: any, 
  ) {
      this.locName = dataObj.locName
      this.action = dataObj.action;
      this.tagsList = dataObj.tagsList ? dataObj.tagsList.filter(item => item.noOfCopy = 1) : [];
  }

  ngOnInit() {
    this.currentPath = this.router.url.split('/')[this.router.url.split('/').length - 2];
   }
  
  addToPrint(index, id){
    for (let i = 0; i < this.tagsList.length; i++) {
      if(this.tagsList[i].location_tag_id == id){
        this.tagsList[i].noOfCopy = 1;
        this.selLocList.push(this.tagsList[i]);
        this.tagsList.splice(i, 1);
        break;
      }
    }
    this.updatePrintTable(this.selLocList);
  }

  removeFromPrint(index, id){
    for (let i = 0; i < this.selLocList.length; i++) {
      if(this.selLocList[i].location_tag_id == id){
        this.tagsList.push(this.selLocList[i]);
        this.selLocList.splice(i, 1);
        break;
      }
    }
    this.updatePrintTable(this.selLocList);
  }

  updateNoOfCopy(option, index){
    if(option == '+'){
      this.selLocList[index].noOfCopy++;
    }else{
      this.selLocList[index].noOfCopy = this.selLocList[index].noOfCopy == 0 ? 0 : this.selLocList[index].noOfCopy - 1;
    }
    this.updatePrintTable(this.selLocList);
  }

  updateNoOfCopyOnInput(index): void {
        
    // console.log(list[index].noOfCopy);

  this.updatePrintTable(this.selLocList);
  }

  updatePrintTable(list){
    this.printList = [];
      for (let i = 0; i < list.length; i++) {
          for (let k = 0; k < list[i].noOfCopy; k++) {
              //labelList.push(list[i]);
              //this.totalPrintLabel++;
              this.printList.push(list[i]);
          }
      }

    // let count: number = 0, j: number = 0, labelList: any = [];
    // this.printList = [];
    // for (let i = 0; i < list.length; i++) {
    //   for (let k = 0; k < list[i].noOfCopy; k++) {
    //     labelList.push(list[i]);
    //   }
    // }

    // while(count < labelList.length){
    //   this.printList.push({'locRow': []})
    //   for (let i = 0; i < 3; i++,count++) {
    //     if(count < labelList.length)
    //       this.printList[j].locRow.push(labelList[count]);
    //     else
    //       return;
    //   }
    //   j++;
    // }
  }

  cancel(){
    for (let i = this.selLocList.length-1; i >= 0; i--) {
      this.tagsList.push(this.selLocList[i]);
      this.selLocList.splice(i, 1);
    }
  }

  onItemDrop(e: any) {
    // Get the dropped data here
    this.selLocList.push(e.dragData);
    //console.log(e.dragData);
    if(this.tagsList.length > 0){
      for (let i = 0; i < this.tagsList.length; i++) {
        if( this.tagsList[i].id == e.dragData.id ){
          //this.selLocList.push(this.tagsList[i]);
          this.tagsList.splice(i, 1);
          this.updatePrintTable(this.selLocList);
          return;
        }
      }
    }
  };

  closeDialog(): void { this.dialogRef.close(); }

  updateTags(): void {
    let self = this;
    let updatedTagList: any = [];
    try{
      for (var i = 0; i < this.tagsList.length; i++) {
        if(this.tagsList[i].newCode){
          let newCodeObj = {
            'id' : this.tagsList[i].location_tag_id,
            'location_id' : this.tagsList[i].location_id,
            'scan_code' : this.tagsList[i].newCode
          }
          updatedTagList.push(newCodeObj);
        }
      }
      console.log(updatedTagList);
      self.util.addSpinner('update-record-btn', "Update");
      this.http.doPost('location/tag/edit', { 'tagObj': updatedTagList }, function(error: boolean, response: any){
        self.util.removeSpinner('update-record-btn', "Update");
        if(error){ 
          self.isError = true;
          self.errMsg = response.message;
        }else{
          self.admin.updateList(true);
          self.util.setPopupFlag(false);
          console.log(self.currentPath);
                    self.currentPath == 'location-list' ? (self.isSuccess = true,self.successMsg = response.message) : self.dialogRef.close();
          //self.dialogRef.close();
        }
      });
    }catch(err){
      this.global.addException('location','updateTags()',err);
    }

  }

  print(id){ this.admin.printPreview(id); }
  printPreview(id){ this.admin.printPreview(id); }
  exportpdf(): void {
    //console.log("this.printList",this.printList); 
    //this.exportDoc.downloadLabel('print-loc-label');
    this.exportDoc.downloadLabel('print-tags');
  } 
}

