import { Component, Inject, OnInit, ApplicationRef } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormControl, Validators, FormGroup, FormBuilder } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

import { HttpService } from '../../shared/service/http.service';
import { UtilService } from '../../shared/service/util.service';
import { ConstantsService } from '../../shared/service/constants.service';
import { GlobalService } from '../../shared/service/global.service';

@Component({
    selector: '',
    templateUrl: './accounting-dialog.component.html',
    styleUrls: ['./accounting-dialog.component.css']
})

export class AccountingDialog{
    public action: string;
    public sortColumn: String = 'employee_id';
    pageData: any =  { 'quotationList':[], 'isEdit': false, 'isError': false, 'errMsg': '' ,'sortColumn': 'status_text', 'sortColumnType': 'A', 'sortOrder': 'ASC' };
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

    constructor(
        public util: UtilService,
        public constant: ConstantsService,
        private global: GlobalService,
        private http: HttpService,
        private ref: ApplicationRef,
        private router: Router,
        public route: ActivatedRoute,
        private fb: FormBuilder,
        public dialogRef: MatDialogRef<AccountingDialog>, 
        
    @Inject(MAT_DIALOG_DATA) public dataObj: any, 
    ) {
        this.action = dataObj.action;
        localStorage.removeItem('CREATE_WO');
    }

    ngOnInit() {
        this.util.setPageTitle(this.route);
        this.dataObj.action == 'quotationList' ? this.quotationList() : '';
        this.paginationKey = { itemsPerPage: 5, currentPage: this.constant.CURRENT_PAGE };
    }

    changePage(event){this.paginationKey.currentPage = event;window.scrollTo(0, 0);}
    changeItemPerPage(){window.scrollTo(0, 0);}
    updateCount(count){ this.constant.ITEM_COUNT = count ;this.listCount = count; }

    quotationList(){
        var self = this;
        self.pageData.quotationList = [];
        this.util.showProcessing('processing-spinner');
        try{
            this.http.doGet('getProjectEstimateList', function(error: boolean, response: any){
                if( error ){
                    console.log(error);
                }else{
                    self.pageData.quotationList = response.data;
                    for(let i = 0; i<response.data.length; i++){
                        self.pageData.quotationList[i].status_text = response.data[i].status_details.status;
                        self.pageData.quotationList[i].company_name = response.data[i].client_details.company_name ? response.data[i].client_details.company_name : response.data[i].client_details.first_name + ' ' +response.data[i].client_details.last_name;
                        self.pageData.quotationList[i].first_name = response.data[i].follower ? response.data[i].follower.first_name+' '+ response.data[i].follower.last_name : 'N/A';
                        self.pageData.quotationList[i].follower = { 'first_name' :  response.data[i].follower ? response.data[i].follower.first_name+' '+ response.data[i].follower.last_name : 'N/A' };
                    }
                    self.constant.ITEM_COUNT = response.data.length;
                    self.util.hideProcessing('processing-spinner');
                    self.pageData.quotationList = self.pageData.quotationList.filter(item=>(item.status_text == "Approved"));
                    console.log(self.pageData.quotationList);
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
    closeDialog(): void {
        this.dialogRef.close();
    }
    select(): void {
        if(this.selectedQuotation){
            let invObj: any = {};
            invObj.project_estimate_id = this.selectedQuotation.project_estimate_id;
            invObj.WO_TYPE = 'External Contractor';
            sessionStorage.setItem('CREATE_INVOICE', JSON.stringify(invObj));
            this.dialogRef.close();
            this.router.navigate(['/account/csa/create-invoice']);
        }else{
            this.pageData.isError = true;
            this.pageData.errMsg = "Please select quotation from the list to proceed.";
        }
    }
    review(): void {
        if(this.selectedQuotation){
            let create_WO_Obj: any = {};
            create_WO_Obj.project_estimate_id = this.selectedQuotation.project_estimate_id;
            create_WO_Obj.WO_TYPE = 'External Contractor';
            localStorage.setItem('CREATE_WO', JSON.stringify(create_WO_Obj));
            this.dialogRef.close();
            this.router.navigate(['/account/csa/invoice-quote-review']);
        }else{
            this.pageData.isError = true;
            this.pageData.errMsg = "Please select quotation from the list to proceed.";
        }
    }

}