import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';

import { FormControl, FormGroup, FormBuilder, FormArray, Validators, NgForm, AbstractControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { UtilService } from '../../../../shared/service/util.service';
import { AuditDialog } from '../audit-dialog.component';
import { HttpService } from '../../../../shared/service/http.service';
import { ConstantsService } from '../../../../shared/service/constants.service';
import { GlobalService } from '../../../../shared/service/global.service';

declare var $ :any;
@Component({
    selector: 'app-new-audit',
    templateUrl: './new-audit.component.html',
    styleUrls: ['./new-audit.component.css']
})
export class NewAuditComponent implements OnInit {
    public sortColumn: string = 'manf_name';
    public sortColumnType: string = 'A';
    public sortOrder: string = 'ASC';
    public empList:any = [];
    public locationList:any = [];
    public selectedLocation:any = [];
    public auditLocationList:any = [];
    public errMsg:string = '';
    public errMsgN:string = '';
    public isError:boolean = false;
    public submitted: boolean = false;
    public isEditLocation: boolean = false;
    public isViewItemList: boolean = false;

    public searchList: string;
    public searchTxt: string;
    public mfgSearch;
    public mfgPartSearch;
    public scanCodeSearch;
    public upcSearch;
    public paginationKey:any;
    public listCount:number = 0;

    public locationTypeFilter:string = 'Fixed';
    updateLocFrm: FormGroup;

    public divMinValidators = [ Validators.max(99),Validators.min(0),Validators.pattern(this.constant.ONLY_NUMBER) ];
    public divMaxValidators = [ Validators.max(100),Validators.min(1),Validators.pattern(this.constant.ONLY_NUMBER) ];
    filteredAuditor: Observable<string[]>;
    filteredLocation: Observable<string[]>;

    constructor(
        public dialog: MatDialog,
        public util:UtilService,
        public constant: ConstantsService,
        private http: HttpService,
        private fb: FormBuilder,
        public router: Router,
        private route: ActivatedRoute,
        private global: GlobalService
    ) { }

    ngOnInit() {
        this.util.menuChange({'menu':3,'subMenu':24});
        this.util.setWindowHeight();
        this.util.setPageTitle(this.route);
        this.paginationKey = { itemsPerPage: this.constant.ITEMS_PER_PAGE, currentPage: this.constant.CURRENT_PAGE };
        this.getEmpList();
        this.getLocationList();
        this.createForm()
    }
    updateCount(count){ this.constant.ITEM_COUNT = count ;this.listCount = count; }
    getSearchTxt(filterValue: string) { if(filterValue == ''){ this.searchTxt = '' } }
    changePage(event){this.paginationKey.currentPage = event;window.scrollTo(0, 0);}
    changeItemPerPage(){window.scrollTo(0, 0);}

    // ===============   AUDITOR  =================== //
    getEmpList() {
        try {
            let self = this;
            this.util.showProcessing('processing-spinner');
            this.http.doGet('getAuditors', function (error: boolean, response: any) {
                self.util.hideProcessing('processing-spinner');
                if (error) { console.log(response); } else {
                    console.log(response.data);
                    self.empList = [];
                    self.empList = response.data;
                    for (let i = 0; i < response.data.length; i++) {
                        self.empList[i].auditor_name = response.data[i].first_name + " " + response.data[i].last_name;
                    }
                    self.filteredAuditor = self.auditor.valueChanges.pipe(startWith(''), map(value => self.auditorFilter(value)));
                }
            });
        }
        catch (err) {
            this.global.addException('New Audit', 'getEmpList()', err);
        }
    }

    getSelectedAuditor(auditor, event: any): void {
        try {
            if (event.isUserInput) {
                console.log(auditor);
                this.auditor_id.setValue(auditor.id);
            }
        }
        catch (err) {
            this.global.addException('New Audit', 'getSelectedAuditor()', err);
        }
    }
    private auditorFilter(value: string): string[] {
        try{
        return this.empList.filter(option => option.auditor_name.toLowerCase().includes(value ? value.toLowerCase() : ''));
         }catch (err) {
            this.global.addException('New Audit', 'auditorFilter()', err);
        }
    }
    public validateAuditor(event: any) {
        try {
            let audit = event.target.value;
            let match = this.empList.filter(item => item.auditor_name.toLowerCase() == audit.toLowerCase());
            console.log(match);
            if (audit == '') {
                this.auditor_id.setValue('');
                return;
            }
            if (match.length > 0) {
                this.auditor_id.setValue(match[0].id);
                this.auditor.setValue(match[0].auditor_name);
            }
        } catch (err) {
            this.global.addException('New Audit', 'validateAuditor()', err);
        }
    }
    // ==============   END AUDITOR  =============== //
    // ===============   LOCATION  =================== //
    getLocationList() {
        try {
            let self = this;
            //this.util.showProcessing('processing-spinner');
            this.http.doGet('location/list', function (error: boolean, response: any) {
                //self.util.hideProcessing('processing-spinner');
                if (error) { } else {
                    self.locationList = response.data;
                    console.log("loc List", self.locationList);
                    self.filteredLocation = self.location.valueChanges.pipe(startWith(''), map(value => self.locationFilter(value)));
                }
            });
        } catch (err) {
            this.global.addException('New Audit', 'getLocationList()', err);
        }
    }

    getSelectedLocation(location, event: any): void {
        try {
            //console.log("getSelectedLocation",location);
            if (event.isUserInput) {
                this.location_id.setValue(location.location_id);
                this.selLocation();
            }
        } catch (err) {
            this.global.addException('New Audit', 'getSelectedLocation()', err);
        }
    }
    private locationFilter(value: string): string[] {
        try {
            return this.locationList.filter(option => option.location_name.toLowerCase().includes(value ? value.toLowerCase() : ''));
        } catch (err) {
            this.global.addException('New Audit', 'locationFilter()', err);
        }
    }
    public validateLocation(event: any) {
        try {
            let location = event.target.value;
            let match = this.locationList.filter(item => item.location_name.toLowerCase() == location.toLowerCase());

            if (location == '') {
                this.location_id.setValue('');
                // this.selLocation();
                return;
            }
            if (match.length > 0) {
                this.location_id.setValue(match[0].location_id);
                this.location.setValue(match[0].location_name);
                this.selLocation();
            }
        }
        catch (err) {
            this.global.addException('New Audit', 'validateLocation()', err);
        }
    }
    // ==============   END LOCATION  =============== //
    public clearAutoComplete(name,id){
        // let str = this.updateLocFrm.get(name).value;
        // str = str.split('');
        // console.log(str);
        // for (let i = str.length - 1; i >= 0; i--) {
        //     str.splice(i, 1);
        //     let newStr = str.join('');
        //     console.log(newStr);
        //     this.updateLocFrm.get(name).setValue(newStr);
        // }
        this.updateLocFrm.get(id).setValue('');
        this.updateLocFrm.get(name).setValue('');
    }


    setFilterToList(locType:string){
        let self = this;
        //self.locationList = self.locationList.filter(item=>(item.location_type == locType));
        this.locationTypeFilter = locType;
        console.log("loc List",self.locationList);
    }

    public createForm(){
        this.updateLocFrm = this.fb.group({
            auditor: new FormControl('', [Validators.required]),
            auditor_id: new FormControl('', [Validators.required]),
            locationType: new FormControl(''),
            location_tag_id: new FormControl(''),
            location_tag: new FormControl(''),
            location_id: new FormControl('', [Validators.required]),
            location: new FormControl('', [Validators.required]),
            short_form: new FormControl(''),
            divisions: this.fb.array([])
        });
    }

    get auditor() { return this.updateLocFrm.get('auditor'); }
    get auditor_id() { return this.updateLocFrm.get('auditor_id'); }
    get locationType() { return this.updateLocFrm.get('locationType'); }
    get location_tag_id() { return this.updateLocFrm.get('location_tag_id'); }
    get location_tag() { return this.updateLocFrm.get('location_tag'); }
    get location_id() { return this.updateLocFrm.get('location_id'); }
    get location() { return this.updateLocFrm.get('location'); }
    get short_form() { return this.updateLocFrm.get('short_form'); }
    get divisions(): FormArray{ return <FormArray>this.updateLocFrm.get('divisions') as FormArray; };
    getDivisionAt(index){ return this.divisions.at(index) };

    addDivision(divIndx, divObj: any = {}) {
        try {
            //let divVal = option == 1 && divObj.division_type!='Named' ? divObj.min+'-'+divObj.max : [];
            this.submitted = false;
            this.divisions.push(this.fb.group({
                division_name: new FormControl(divObj.division_name),
                division_type: new FormControl(divObj.division_type),
                division_value: new FormControl('', divObj.division_type != 'Named' ? [Validators.max(divObj.max), Validators.min(divObj.min)] : []),
                named_div_arr: new FormControl(divObj.division_type != 'Named' ? [] : divObj.division_value),
                max: new FormControl(divObj.max ? ('00'+divObj.max).slice(-2) : ''),
                min: new FormControl(divObj.min ? ('00'+divObj.min).slice(-2) : '')
            }));
        } catch (err) {
            this.global.addException('New Audit', 'addDivision()', err);
        }
    }

    selLocation() {
        try {
            for (let i = this.divisions.length - 1; i >= 0; i--) {
                this.divisions.removeAt(i)
            }
            this.selectedLocation = {};
            this.selectedLocation = this.locationList.filter(item => (item.location_id == this.location_id.value))[0];
            //console.log("selLocation",this.selectedLocation);
            this.updateLocFrm.get('short_form').setValue(this.selectedLocation.short_form);
            if (this.selectedLocation) {
                for (let i = 0; i < this.selectedLocation.divisions.length; i++) {
                    this.selectedLocation.divisions[i].division_value = Array.isArray(this.selectedLocation.divisions[i].division_value) ? this.selectedLocation.divisions[i].division_value : this.selectedLocation.divisions[i].division_value.split(',');
                    this.addDivision(i, this.selectedLocation.divisions[i]);
                }
            }
        }
        catch (err) {
            this.global.addException('New Audit', 'selLocation()', err);
        }
        //console.log("divisionsNew",this.divisions);
    }

    createTagSample(location) {
        try {
            let tag: string = location.short_form;
            for (var i = 0; i < location.divisions.length; i++) {
                console.log("location.divisions", location.divisions[i]);
                if (location.divisions[i].division_type == 'Named') {
                    tag = tag + (location.divisions[i].division_value ? '-' + (location.divisions[i].division_value ? location.divisions[i].division_value.toUpperCase() : '') : '');
                } else {
                    //let indx = '00'+location.divisions[i].division_value;
                    if (location.divisions[i].max > 9 && location.divisions[i].max < 100) {
                        tag = tag + (location.divisions[i].division_value ? '-' + ('00' + location.divisions[i].division_value).substr(-2, 2) : '');
                    } else {
                        tag = tag + (location.divisions[i].division_value ? '-' + location.divisions[i].division_value : '');
                    }
                }
            }
            return tag.toUpperCase();
        } catch (err) {
            this.global.addException('New Audit', 'createTagSample()', err);
        }
    }

    updateLocation(form: FormGroup) {
        try {
            this.updateLocFrm.get('location_tag').setValue(this.createTagSample(form.value));
            console.log(form.value);
            let self = this;
            this.errMsg = '';
            this.isError = false;
            this.submitted = true;
            if (form.valid) {
                let reqObj: any = {}, formData = JSON.parse(JSON.stringify(form.value));
                reqObj.location_tag = formData.location_tag;
                reqObj.location_id = formData.location_id;
                reqObj.short_form = formData.short_form;
                reqObj.divisions = formData.divisions;
                for (let i = 0; i < reqObj.divisions.length; ++i) {
                    delete reqObj.divisions[i].named_div_arr;
                }
                self.util.addSpinner('updateLocation', "View Item List");
                this.http.doPost('getAuditItem', reqObj, function (error: boolean, response: any) {
                    self.util.removeSpinner('updateLocation', "View Item List");
                    if (error) { } else {
                        self.isEditLocation = true;
                        self.auditLocationList = [];
                        // if(response.data == null){
                        //     console.log('Data is Nnull');
                        // }
                        if (response.data) {
                            self.isViewItemList = true;
                            self.auditLocationList = [...response.data.assets, ...response.data.products, ...response.data.materials]
                            console.log("Audit item List", self.auditLocationList);
                        }else{
                            self.isError = true;
                            self.errMsgN ='There are no items stored at this location. Please change the location to create new audit.';
                        }
                    }
                });
            }
        } catch (err) {
            this.global.addException('New Audit', 'updateLocation()', err);
        }
    }

    editLocation(){
        this.isEditLocation=false;
    }
    cancelEditLocation(){
        this.isEditLocation=true;
    }
    cancelAudit(){
        let self = this;
        self.router.navigate(['/inventory/audit/csa/audit-list/0']);
    }
    submitAudit(form: FormGroup) {
        try {
            let self = this;
            this.errMsg = '';
            this.isError = false;
            this.submitted = true;

            if (form.valid) {
                let reqObj: any = {};
                reqObj.location_tag = form.value.location_tag;
                reqObj.location_id = form.value.location_id;
                reqObj.auditors = [];
                reqObj.auditors.push(form.value.auditor_id);
                self.util.addSpinner('createAudit', "Create");
                this.http.doPost('audit', reqObj, function (error: boolean, response: any) {
                    self.util.removeSpinner('createAudit', "Create");
                    if (error) {
                        self.isError = true;
                        self.errMsg = response.message;
                    } else {
                        console.log(response);
                        self.router.navigate(['/inventory/audit/csa/audit-list/0']);
                    }
                });
            }
        }
        catch (err) {
            this.global.addException('New Audit', 'submitAudit()', err);
        }
    }
}
