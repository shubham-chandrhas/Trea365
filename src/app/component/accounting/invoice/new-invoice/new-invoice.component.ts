import { Component, OnInit, ApplicationRef } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormControl, FormGroupDirective, NgForm, Validators, FormGroup, FormBuilder, FormArray } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ConstantsService } from '../../../../shared/service/constants.service';
import { UtilService } from '../../../../shared/service/util.service';
import { HttpService } from '../../../../shared/service/http.service';
import { GlobalService } from '../../../../shared/service/global.service';
import { AdminService } from '../../../admin/admin.service';
import { DialogComponent } from '../../../../shared/model/dialog/dialog.component';
import { Observable, Subscription } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { AccountingDialog } from '../../accounting-dialog.component';

@Component({
	selector: 'app-new-invoice',
	templateUrl: './new-invoice.component.html',
	styleUrls: ['./new-invoice.component.scss']
})
export class NewInvoiceComponent implements OnInit {

  	public selectedLedger: any = null;
    public sortColumnType: string = 'N';
    public sortOrder: string = 'DSC';
    public searchList: string;
    public searchTxt: string;
    public minDate = new Date();
    public errMsg:string = '';
    public isError:boolean = false;
    public routeObj:any;
    public action: string;
    public sortColumn: String = 'employee_id';
    pageData: any =  { 'quotationList':[], 'isEdit': false, 'isError': false, 'errMsg': '' ,'sortColumn': 'project_estimate_date', 'sortColumnType': 'A', 'sortOrder': 'ASC' };
    public selectedQuotation: any = '';
    public selectedIndex:any = null;
    public paginationKey:any;
    public listCount:number = 0;

    public statusSearch;
    public dateSearch;
    public clientSearch;
    public followedBySearch;
    public quoteNoSearch;
    submitted: boolean = false;

    locList: any[] = [];
    locTagsList: any[] = [];
    locationType = '1';
    addSupplierForm: FormGroup;
    addInLocForm: FormGroup;
    filteredSupplier: Observable<string[]>;
    filteredLocations: Observable<string[]>;
    filteredTags: Observable<string[]>;
    permissionsSet: any;
    subscription: Subscription;

    constructor(
        public dialog: MatDialog,
        public util:UtilService,
        public constant:ConstantsService,
        private ref: ApplicationRef,
        public http:HttpService,
        public global:GlobalService,
        private admin: AdminService,
        public router: Router,
        public route: ActivatedRoute,
        private fb: FormBuilder,
    ) { }

  	ngOnInit() {
  		let self = this;
        this.util.setWindowHeight();
        this.util.setPageTitle(this.route);
        this.routeObj = { 'list': '/account/csa/invoice-list/0', 'add': '/account/csa/new-invoice' };
        this.quotationList();
        this.permissionsSet = this.util.getModulePermission(159);
        try{
            this.paginationKey = { itemsPerPage: this.constant.ITEMS_PER_PAGE, currentPage: this.constant.CURRENT_PAGE };
            this.util.menuChange({'menu':7,'subMenu':33});
            this.util.setWindowHeight();
        }catch(err){
            this.global.addException('New Invoice','ngOnInit()',err);
        }
        this.subscription =  this.util.changeDetection.subscribe(dataObj => {
          if (dataObj && dataObj.source == "QuotationListForInvoice") {
            self.quotationListOfClient(dataObj.data.client_id);
          }
        });
    }

    ngOnDestroy() {
      this.subscription.unsubscribe();
    }

  	changePage(event){
        this.paginationKey.currentPage = event;
        window.scrollTo(0, 0);
    }
    changeItemPerPage(){
        window.scrollTo(0, 0);
    }
    updateCount(count){ this.constant.ITEM_COUNT = count ;this.listCount = count; }
    getSearchTxt(filterValue: string) { if(filterValue == ''){ this.searchTxt = '' } }
    sortList(columnName: string, sortType){
        this.sortColumn = columnName;
        this.sortColumnType = sortType;
        if(this.sortColumn === columnName){
            if(this.sortOrder === 'ASC')
                this.sortOrder = 'DSC';
            else
                this.sortOrder = 'ASC';
        }else{
            this.sortOrder = 'ASC';
        }
    }

    quotationList(){
        var self = this;
        self.pageData.quotationList = [];
        this.util.showProcessing('processing-spinner');
        try{
            this.http.doGet('getPeForInvoice', function(error: boolean, response: any){
                if( error ){
                    console.log(error);
                }else{
                    self.pageData.quotationList = response.data;
                    // console.log("Length::"+response.data);
                    for(let i = 0; i<response.data.length; i++){
                        self.pageData.quotationList[i].status_text = response.data[i].status_details.status;
                        self.pageData.quotationList[i].company_name = response.data[i].client_details.company_name ? response.data[i].client_details.company_name : response.data[i].client_details.first_name + ' ' +response.data[i].client_details.last_name;
                        self.pageData.quotationList[i].first_name = response.data[i].follower ? response.data[i].follower.first_name+' '+ response.data[i].follower.last_name : 'N/A';
                        self.pageData.quotationList[i].follower = { 'first_name' :  response.data[i].follower ? response.data[i].follower.first_name+' '+ response.data[i].follower.last_name : 'N/A' };
                    }
                    self.constant.ITEM_COUNT = response.data.length;
                    self.util.hideProcessing('processing-spinner');
                    // sconsole.log(self.pageData.quotationList);
                    //self.pageData.quotationList = self.pageData.quotationList.filter(item=>(item.status_text == "Approved"));
                }
            });
        }catch(err){
            this.global.addException('Error Log','constructor()',err);
        }
    }

    quotationListOfClient(clietId:any){
      var self = this;
      self.pageData.quotationList = [];
      this.util.showProcessing('processing-spinner');
      try{
          this.http.doGet('getPeForInvoice/'+clietId, function(error: boolean, response: any){
              if( error ){
                  console.log(error);
              }else{
                  self.pageData.quotationList = response.data;
                  // console.log("Length::"+response.data);
                  for(let i = 0; i<response.data.length; i++){
                      self.pageData.quotationList[i].status_text = response.data[i].status_details.status;
                      self.pageData.quotationList[i].company_name = response.data[i].client_details.company_name ? response.data[i].client_details.company_name : response.data[i].client_details.first_name + ' ' +response.data[i].client_details.last_name;
                      self.pageData.quotationList[i].first_name = response.data[i].follower ? response.data[i].follower.first_name+' '+ response.data[i].follower.last_name : 'N/A';
                      self.pageData.quotationList[i].follower = { 'first_name' :  response.data[i].follower ? response.data[i].follower.first_name+' '+ response.data[i].follower.last_name : 'N/A' };
                  }
                  self.constant.ITEM_COUNT = response.data.length;
                  self.util.hideProcessing('processing-spinner');
                  // sconsole.log(self.pageData.quotationList);
                  //self.pageData.quotationList = self.pageData.quotationList.filter(item=>(item.status_text == "Approved"));
              }
          });
      }catch(err){
          this.global.addException('Error Log','constructor()',err);
      }
  }

    getSelectedQuotation(quotation, index){
        var self = this;
        self.selectedIndex = index;
        self.selectedQuotation = quotation;
        this.pageData.isError = false;
        this.pageData.errMsg = "";
    }

    select(quotation, index): void {
    	var self = this;
        self.selectedIndex = index;
        self.selectedQuotation = quotation;
        this.pageData.isError = false;
        this.pageData.errMsg = "";
        if(this.selectedQuotation){
            let invObj: any = {};
            invObj.project_estimate_id = this.selectedQuotation.project_estimate_id;
            invObj.WO_TYPE = 'External Contractor';
            sessionStorage.setItem('CREATE_INVOICE', JSON.stringify(invObj));
            this.router.navigate(['/account/csa/create-invoice']);
        }else{
            this.pageData.isError = true;
            this.pageData.errMsg = "Please select quotation from the list to proceed.";
        }
    }

    review(quotation, index): void {
    	var self = this;
        self.selectedIndex = index;
        self.selectedQuotation = quotation;
        this.pageData.isError = false;
        this.pageData.errMsg = "";
        if(this.selectedQuotation){
            let create_WO_Obj: any = {};
            create_WO_Obj.project_estimate_id = this.selectedQuotation.project_estimate_id;
            create_WO_Obj.WO_TYPE = 'External Contractor';
            localStorage.setItem('CREATE_WO', JSON.stringify(create_WO_Obj));
            this.router.navigate(['/account/csa/invoice-quote-review']);
        }else{
            this.pageData.isError = true;
            this.pageData.errMsg = "Please select quotation from the list to proceed.";
        }
    }

}
