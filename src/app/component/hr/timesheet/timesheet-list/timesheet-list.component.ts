import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import * as _ from 'underscore';

import { UtilService } from '../../../../shared/service/util.service';
import { HttpService } from '../../../../shared/service/http.service';
import { ExportService } from '../../../../shared/service/export.service';
import { ConstantsService } from '../../../../shared/service/constants.service';
import { GlobalService } from '../../../../shared/service/global.service';
import { FormControl,FormGroupDirective, Validators, FormGroup, FormBuilder } from '@angular/forms';
import { DialogComponent } from '../../../../shared/model/dialog/dialog.component';
@Component({
    selector: 'app-timesheet-list',
    templateUrl: './timesheet-list.component.html',
    styleUrls: ['./timesheet-list.component.css']
})
export class TimesheetListComponent implements OnInit {
    public sortColumn: string = 'timesheet_summary_id';
    public sortColumnType: string = 'N';
    public isError: boolean = false;
    public errMsg: string;
    public sortOrder: string = 'DSC';
    public timesheetList: any = [];
    public selectedTimeSheet: any = null;
    public paginationKey: any;
    public listCount: number = 0;
    public selectedIndex: number;
    public searchList: string;
    public searchTxt: string;
    public employeeNameSearch;
    public employeeRoleSearch;
    public expectedHrSearch;
    public recordedHrSearch;
    public discrepanciesHrSearch;
    public timesheetdate:any;
    public timesheetDetails:any=[];
    permissionsSet: any;
    editEmpFrm:FormGroup;
    public isEdit: boolean = false;
    minDate: any = new Date();
    strtDate: string;
    endDate: string;
    singleDate: string;
    public old_date: any;
    public onBoarding:boolean = false;
    constructor(
        public util: UtilService, 
        public dialog: MatDialog, 
        public constant: ConstantsService, 
        private http: HttpService, 
        public router: Router, 
        private route: ActivatedRoute, 
        public global: GlobalService, 
        private file: ExportService, 
        private ts: FormBuilder, 
        private location: Location
    ) { }
    ngOnInit() {
        let self = this;
        this.util.showProcessing('processing-spinner');
        this.util.setWindowHeight();
        this.util.setPageTitle(this.route);
        this.util.menuChange({ 'menu': 6, 'subMenu': 30 });
        this.paginationKey = { itemsPerPage: this.constant.ITEMS_PER_PAGE, currentPage: this.constant.CURRENT_PAGE };
        var dte = new Date();
        dte.setDate(dte.getDate() - 1);
        this.singleDate = this.util.getYYYYMMDDDate(dte);
        this.getTimesheetList(this.util.getYYYYMMDDDate(dte));
        this.permissionsSet = this.util.getModulePermission(143);
        this.editTimesheetForm(); 
        this.strtDate = this.endDate = this.util.getYYYYMMDDDate(dte);
        
    }
    changePage(event) {
        this.paginationKey.currentPage = event;
        window.scrollTo(0, 0);
    }
    changeItemPerPage() {
        window.scrollTo(0, 0);
    }
    updateCount(count) { this.constant.ITEM_COUNT = count; this.listCount = count; }
    getSearchTxt(filterValue: string) {
        if (filterValue == '') {
            this.searchTxt = '';
        }
    }
    
    generatepdf(){ this.file.generateLandscapepdf('timesheet_detail', 'Timesheet', 'timesheet_edit'); }
    generatecsv(){ this.file.generatecsv('timesheet_detail', 'timesheet_edit'); }
    dateChange(event){
    //    console.log(this.util.getYYYYMMDDDate(event));
       this.getTimesheetList(this.util.getYYYYMMDDDate(event)); 
    }

    getTimesheetList(date) {
        let self = this;
        self.selectedTimeSheet ='';
        self.selectedIndex = null;
        this.util.showProcessing('processing-spinner');
        try {
            this.http.doGet('get-timesheet-summary/'+date, function (error: boolean, response: any) {
                self.util.hideProcessing('processing-spinner');
                if (error) {
                    console.log(response);
                }
                else {
                    self.timesheetList = response.data ? response.data : [];
                    self.constant.ITEM_COUNT = self.timesheetList.length;
                    self.util.hideProcessing('processing-spinner');
                    self.route.snapshot.paramMap.get('id') != '0' ? self.showTimesheetDetails() : '';
                }
                if(self.timesheetList.length == 0) {
                    self.onBoarding = true;
                  }
            });
        }
        catch (err) {
            this.global.addException('invoice list', 'getInvoiceList()', err);
        }
    }

    showTimesheetDetails() {
        try {
            let sortedList: any[] = _.sortBy(this.timesheetList, 'timesheet_summary_id').reverse();
            for (var i = 0; i < sortedList.length; ++i) {
                if (this.route.snapshot.paramMap.get('id') == sortedList[i].timesheet_summary_id) {
                    this.getSelectedTimeSheet(sortedList[i], i);
                    this.selectedIndex = i;
                    break;
                }
            }
        } catch (err) {
            this.global.addException('Timesheet', 'showTimesheetDetails()', err);
        }
    }
    
    startDateChange(event) {
        //console.log("This is the DATE:", this.util.getYYYYMMDDDate(this.strtDate));
        this.getDetailList(this.selectedTimeSheet.staff_id, this.util.getYYYYMMDDDate(this.strtDate), this.endDate);
    }
    endDateChange(event) {
        //console.log("This is the DATE:", this.util.getYYYYMMDDDate(this.endDate));
        this.getDetailList(this.selectedTimeSheet.staff_id, this.strtDate, this.util.getYYYYMMDDDate(this.endDate));
    }

    getSelectedTimeSheet(timesheet, indx) {
        try{
        let self = this;
        this.isEdit = false;
        self.selectedTimeSheet = timesheet;
        self.selectedIndex = indx;
        self.getDetailList(timesheet.staff_id, this.strtDate, this.endDate);
        }
        catch (err) {
            this.global.addException('Timesheet', 'getSelectedTimeSheet()', err);
        }
    }
   
    public editTimesheetForm(timesheetObj:any = {}){
        this.editEmpFrm = this.ts.group({
            timesheet_summary_id:new FormControl(timesheetObj.timesheet_summary_id),
            starting_hours:new FormControl(timesheetObj.starting_hours ? timesheetObj.starting_hours.substring(0,5) : '', [ Validators.required ]),
            ending_hours:new FormControl(timesheetObj.ending_hours ? timesheetObj.ending_hours.substring(0,5) : '', [ Validators.required ]),
           // actual_working_hours:new FormControl(timesheetObj.actual_working_hours ? timesheetObj.actual_working_hours.substring(0,5) : '', [ Validators.required ]),
            remarks:new FormControl(timesheetObj.remarks, [ Validators.required ]),
        });
    }
    get starting_hours() { return this.editEmpFrm.get('starting_hours'); } 
    get ending_hours() { return this.editEmpFrm.get('ending_hours'); }
   // get actual_working_hours() { return this.editEmpFrm.get('actual_working_hours'); }
    get remarks() { return this.editEmpFrm.get('remarks'); }
    
    getDetailList(staff_id, from_date, to_date) {
        let self = this;
        this.isEdit = false;
        var reqObj = {
            "staff_id": staff_id,
            "from_date": from_date,
            "to_date": to_date
        }
        this.util.showProcessing('processing-spinner');
        try {
            this.http.doPost('get-timesheet-summary-details', reqObj, function (error: boolean, response: any) {
                self.util.hideProcessing('processing-spinner');
                if (error) {
                    console.log(response.message);
                } else {
                    self.selectedTimeSheet.timesheetDetails = response.data.timesheet;
                    self.selectedTimeSheet.timesheetDetails.filter(item => item.isEdit = false);
                    self.selectedTimeSheet.timesheetDetails = response.data.timesheet;
                    //console.log(self.selectedTimeSheet.timesheetDetails);
                    self.location.go(self.location.path().split('/').splice(0, self.location.path().split('/').length - 1).join('/')+'/'+self.selectedTimeSheet.staff_id);
                    setTimeout(function() {
                        self.util.scrollDown('timesheetMark');
                    }, 1000);
                }
            });
        }
        catch (err) {
            this.global.addException('timesheet detail list', 'getDetailList()', err);
        }
    }
    editTimesheet(timesheetObj) {
        this.selectedTimeSheet.timesheetDetails.filter(item=> item.isEdit = false);
        timesheetObj.isEdit = true;
        this.isEdit=true;
        //console.log(timesheetObj);
        this.editTimesheetForm(timesheetObj);
    }

    updateTimesheet(form: FormGroup) {
        let self = this;
        self.isError = false;
        self.errMsg = '';
        try {
            if (form.valid) {
                self.util.addSpinner('updateTimesheet', "Update");
                this.http.doPost('update-timesheet-summary', form.value, function (error: boolean, response: any) {
                    self.util.removeSpinner('updateTimesheet', "Update");
                    if (error) {
                        self.isError = true;
                        self.errMsg = response.message;
                    } else {
                        self.util.showDialog(DialogComponent, response.message, []);
                        console.log(response.data);
                        self.isEdit = false;
                        let dataObj: any = {};
                        dataObj.source = 'TIMESHEET_EDIT';
                        dataObj.data = response.data;
                        self.util.changeEvent(dataObj);
                        self.selectedTimeSheet = response.data;
                        //console.log(self.selectedTimeSheet);
                    }
                });
            }
        } catch (err) {
            this.global.addException('Timesheet', 'updateTimesheet()', err);
        }
    }

    getTimeInHHMM(time){ return time ? time.substring(0, 5) : ''; }

    cancelEditInfo() {
        this.selectedTimeSheet.timesheetDetails.filter(item => item.isEdit = false);
        this.isEdit = false;
    }

}