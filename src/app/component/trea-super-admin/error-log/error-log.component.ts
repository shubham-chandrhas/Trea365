
import { Component, Inject, ViewChild, OnInit } from '@angular/core';

import { HttpService } from '../../../shared/service/http.service';
import { UtilService } from '../../../shared/service/util.service';
import { ConstantsService } from '../../../shared/service/constants.service';
import { GlobalService } from '../../../shared/service/global.service';
import { ActivatedRoute } from '@angular/router';
import { FileService } from '../../../shared/service/file.service';
import {FormControl, FormGroupDirective, NgForm, Validators, FormGroup, FormBuilder} from '@angular/forms';

@Component({
    selector: '',
    templateUrl: './error-log.html',
    styleUrls: ['./error-log.css']
})

export class ErrorLogComponent implements OnInit { 
    public errMsg:string = '';
    public isError:boolean = false; 
    public submitted:boolean = false;
    public sortColumn: string = 'organization';
    public sortOrder: string = 'ASC';
	public ErrorList: any = '';
	public searchTxt: string;
    public paginationKey:any;
    public listCount:number = 0;
    public selectedLog: any = null;
    updLogFm: FormGroup;

    public nameSearch;
    public typeSearch;
    public urlSearch;
    public responseSearch;
    public prioritySearch;
    public assignToSearch;
    public statusSearch;
    public createdSearch;
    public timezone: number;
    
    searchList;
    paginationItems: any[] = [ 100, 200, 300, 400, 500, 1000];
    selectedIndex;
	constructor( 
        private http: HttpService, 
        private util: UtilService, 
        public constant:ConstantsService,
        private global: GlobalService,
        public route: ActivatedRoute,
        private fb: FormBuilder,
        private file: FileService,
    ) {
        const timeZoneOffset = new Date().getTimezoneOffset();
        
        var self = this;
        self.ErrorList = [];
        this.util.showProcessing('processing-spinner');
        try{
            this.http.doGet('getAllLogs', function(error: boolean, response: any){
                if( error ){
                    alert(response.error.error);
                }else{
                    self.ErrorList = response.data;
                    //console.log(response.data);
                    for(let i = 0; i<response.data.length; i++){
                        response.data[i].organization = response.data[i].organization ? response.data[i].organization : '';
                        response.data[i].error_type = response.data[i].error_type ? response.data[i].error_type : '';
                        response.data[i].priority = response.data[i].priority ? response.data[i].priority : '';
                        response.data[i].url = response.data[i].url ? response.data[i].url : '';
                        response.data[i].response_sent = response.data[i].response_sent ? response.data[i].response_sent : '';
                        self.ErrorList[i].created_at = response.data[i].created_at ? response.data[i].created_at : '';
                    }
                    self.constant.ITEM_COUNT = response.data.length;
                    self.util.hideProcessing('processing-spinner');
                    //console.log(self.ErrorList);
                }
            });
        }catch(err){
            this.global.addException('Error Log','constructor()',err);
        }
        // this.paginationKey = { itemsPerPage: this.constant.ITEMS_PER_PAGE, currentPage: this.constant.CURRENT_PAGE };
	}
    ngOnInit() {
        this.paginationKey = { itemsPerPage: 100, currentPage: this.constant.CURRENT_PAGE };
        this.util.setWindowHeight();
        this.createForm();
        this.util.setPageTitle(this.route);
        
    }
    changePage(event){this.paginationKey.currentPage = event;window.scrollTo(0, 0);}
    changeItemPerPage(){window.scrollTo(0, 0);}
    getSearchTxt(filterValue: string) { if(filterValue == ''){ this.searchTxt = '' } }
    updateCount(count){ this.constant.ITEM_COUNT = count ;this.listCount = count; }
    apiPos(string){

        return string.indexOf('api');
    }

    public createForm(){
        this.updLogFm = this.fb.group({
            assign_to: new FormControl('', [ 
                Validators.required
            ]),
            status: new FormControl('', [ 
                Validators.required, 
            ]),
           
        });
    } 

    get assign_to() { return this.updLogFm.get('assign_to'); }
    get status() { return this.updLogFm.get('status'); }

    updateLog(form: NgForm,error_id): void {
        var self = this;
        this.errMsg = '';
        this.isError = false;
        this.submitted = true;
        console.log(form);
        try {
            if (form.valid) {  
                self.ErrorList = []; 
                self.util.showProcessing('processing-spinner');             
                self.util.addSpinner('assign-btn', "Submit");
                let formData: FormData = new FormData();
                formData.append('error_id', error_id);
                formData.append('assign_to', form.value.assign_to);
                formData.append('status', form.value.status);
                
                this.file.formDataAPICall(formData, 'updateLog', function (error: boolean, response: any) {
                    self.util.removeSpinner('assign-btn', "Submit");
                    //self.util.hideProcessing('processing-spinner');
                    if (error) {
                        self.errMsg = response.message;
                        self.isError = true;
                    } else {
                        self.http.doGet('getAllLogs', function(error: boolean, response: any){
                            if( error ){
                                alert(response.error.error);
                            }else{
                                self.ErrorList = response.data;
                                //console.log(response.data);
                                for(let i = 0; i<response.data.length; i++){
                                    response.data[i].organization = response.data[i].organization ? response.data[i].organization : '';
                                    response.data[i].error_type = response.data[i].error_type ? response.data[i].error_type : '';
                                    response.data[i].priority = response.data[i].priority ? response.data[i].priority : '';
                                    self.ErrorList[i].created_at = response.data[i].created_at ? response.data[i].created_at : '';
                                }
                                self.constant.ITEM_COUNT = response.data.length;
                                
                                //console.log(self.ErrorList);
                            }
                        });
                        self.getSelectedLog(response.data,1);
                        self.util.hideProcessing('processing-spinner');
                    }
                });
            } else {
            }
        } catch (err) {
            this.global.addException('Error Logs', 'updateLog()', err);
        }
    }
    
    
  	applyFilter(filterValue: string) {
	  
    }
    getSelectedLog(error, index){ 
        let self = this;
        this.selectedIndex = index;
        this.selectedLog = error;
        setTimeout(function () {
            self.util.scrollDown('maintenanceMark');
        }, 1000);
    }

}



