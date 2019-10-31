import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';

import { UtilService } from '../../../shared/service/util.service';
import { AdminService } from '../../admin/admin.service';
import { ExportService } from '../../../shared/service/export.service';
import { HttpService } from '../../../shared/service/http.service';
import { ConstantsService } from '../../../shared/service/constants.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { GlobalService } from '../../../shared/service/global.service';

@Component({
    selector: '',
    templateUrl: './receiving-slip-dialog.component.html',
    styleUrls: ['./receiving-slip-dialog.component.css']
  })
  
export class ReceivingSlipDialog{
  pageData: any =  { 'purchaseOrderList':[], 'listCount': 0, 'action':'', 'isEdit': false, 'isError': false };
  public action: string;
  public empList: any = '';
	public searchList: string;
	public searchTxt: string;
	public empIdSearch: string;
	public nameSearch: string;
	public titleSearch: string;
	public roleSearch: string;
	public name: string;
	public appliedFilter: any = [];
	public sortColumn: string = 'employee_id';
	public selectedEmp: any;
	public selectedIndex: number; 
	public activeSearch: string;
	public lockedSearch: string; 
	public paginationKey:any;
	public listCount:number = 0;
	public sortOrder = 'ASC';
  constructor(
    private router: Router,
    public dialog: MatDialog,
		public util:UtilService,
    public constant: ConstantsService,
    private admin: AdminService,
    private http: HttpService,
    private file:ExportService,
    private route: ActivatedRoute,
    public dialogRef: MatDialogRef<ReceivingSlipDialog>, 
    @Inject(MAT_DIALOG_DATA) public dataObj: any, 
    private global: GlobalService
  ) {
    this.action = dataObj.action;
  }

  ngOnInit() {
    this.util.setWindowHeight();
    this.util.setPageTitle(this.route);
    this.purchaseOrderList();
  }

    purchaseOrderList() {
        try {
            let self = this;
            this.util.showProcessing('processing-spinner');
            this.http.doGet('purchaseOrder', function (error: boolean, response: any) {
                console.log(response);
                self.util.hideProcessing('processing-spinner');
                if (error) { console.log(response.message) } else {
                    self.pageData.purchaseOrderList = [];
                    for (let i = 0; i < response.data.length; i++) {
                        self.pageData.purchaseOrderList.push({
                            'purchase_order_no': response.data[i].purchase_order_no,
                            'purchase_order_date': response.data[i].purchase_order_date,
                            'supplier_name': response.data[i].supplier_name.supplier_name,
                            'status': response.data[i].status,
                        });
                    }
                }
                console.log(self.pageData.purchaseOrderList);
            });
        } catch (err) {
            this.global.addException('Tracker', 'purchaseOrderList()', err);
        }
    }

  sortList(columnName: string){
    //this.empList = JSON.parse(JSON.stringify(this.backupList)); 
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
  searchEmployee(filterValue: string, filterType: string){
    if(filterValue == ''){
      //this.removeTag(filterType);
    }else{
      if(this.appliedFilter.length > 0){
        for (var i = 0; i < this.appliedFilter.length; i++) {
          if(filterType == this.appliedFilter[i].tagName){
            this.appliedFilter[i].tagValue = filterValue;
            return;
          }
        }
        //this.addTag(filterType, filterValue);
      }else{
        //this.addTag(filterType, filterValue);
      }
    }
  };
  
  closeDialog(): void {
    this.dialogRef.close();
  }
}