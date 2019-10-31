import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { FormControl, FormGroup, FormBuilder, FormArray, Validators, NgForm, AbstractControl } from '@angular/forms';
import {Location} from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Observable } from 'rxjs/Observable';
import { startWith } from 'rxjs/operators/startWith';
import { map } from 'rxjs/operators/map';
import { MapsAPILoader } from '@agm/core';
import { ElementRef, NgZone, ViewChild } from '@angular/core';

import { GlobalService } from '../../../shared/service/global.service';
import { UtilService } from '../../../shared/service/util.service';
import { HttpService } from '../../../shared/service/http.service';
import { ConstantsService } from '../../../shared/service/constants.service';
import { DialogComponent } from '../../../shared/model/dialog/dialog.component';

import { ProjectEstimatorService } from './project-estimator.service';
import { IMultiSelectOption, IMultiSelectSettings, IMultiSelectTexts } from 'angular-2-dropdown-multiselect';
import { ValueTransformer } from '../../../../../node_modules/@angular/compiler/src/util';
@Component({
    selector: '',
    templateUrl: './project-estimator-dialog.component.html',
    styleUrls: ['./project-estimator-dialog.component.css']
})

export class ProjectEstimatorDialog{
    public minDate = new Date();
    inspectForm: FormGroup;
    followInspectForm: FormGroup;
    addClientForm: FormGroup;
    addWorkLocationForm: FormGroup;
    addContactForm:FormGroup;
    addServiceDefinationForm:FormGroup;
    addApproveConfirmationNoteForm:FormGroup;
    errMsg: string = '';
    isError: boolean = false;
    public addTyp:any[] = [];
    public action: string;
    public getClientId: any[];
    public locationType:string;
    public clientId:number=0;
    public clientData: any[];
    public submitted: boolean = false;
    public inspectorList:any[] = [];
    public site_inspection:any ={};
    public filteredInspectors: Observable<any[]>;
    public filteredInspectorsF: Observable<any[]>;
    mulSelSettings: IMultiSelectSettings = { displayAllSelectedText: true };
    public countries: any = [];
    //public states: any = [];
    //public cities: any = [];
    public contactData:any[]=[];
    public businessTypes:any[]=[];
    public serviceTypes:any[]=[];
    public siteInspection:any={};
    public followupDetails:any={};

    @ViewChild("search")
    public searchElementRef: ElementRef;

    constructor(
        public dialog: MatDialog,
        public util: UtilService,
        public http: HttpService,
        public global: GlobalService,
        private fb: FormBuilder,
        public router: Router,
        public constant: ConstantsService,
        private mapsAPILoader: MapsAPILoader,
        private ngZone: NgZone,
        public dialogRef: MatDialogRef<ProjectEstimatorDialog>,
        @Inject(MAT_DIALOG_DATA) public dataObj: any,
        private PEService: ProjectEstimatorService ,
        private _location: Location,
        public route:ActivatedRoute

    ) {
        this.action = dataObj.action;
        this.getClientId = dataObj.clientId;
        this.locationType = dataObj.type;
       // this.clientData=dataObj.clientData;
        if(dataObj.clientData){
            //alert();
           // console.log("dc:"+JSON.stringify(dataObj.clientData));
            //console.log("dc1:"+dataObj.clientData.client.client_id);
            this.clientData = dataObj.clientData.address;
            //this.getClientId= dataObj.clientData.client.client_id;
            this.getClientId= dataObj.clientData.client_id;
            this.getcontactData();
        }
        this.setInspectForm();
        this.setFollowUpForm();
        //dataObj.action == 'addWorkLocation' ? this.createAddWorkLocationForm() : '' ;
        this.createAddContactForm();
        this.createAddClientForm();
        this.createAddServiceDefinationForm();
        this.action = dataObj.action;
        //this.action == 'saveForFollowUp' ? this.getInspectorListForFollowUp() : '' ;
        this.action == 'saveForFollowUp' ? this.getEmployeeForFollowUp() : '' ;
    }
    setFollowUpForm(){
        //this.action=='saveForFollowUp' ? this.PEService.projectEstimatorData =JSON.parse(sessionStorage.getItem('quotationDetails')):'';
        console.log(JSON.stringify(this.PEService.projectEstimatorData));
        // this.PEService.projectEstimatorData = JSON.parse(sessionStorage.getItem('quotationDetails'));
        if(this.PEService.projectEstimatorData.follow_up_by && this.PEService.projectEstimatorData.follow_up_by!=0){
            this.createFollowUpForm(1,this.PEService.projectEstimatorData);
        }else{
            this.createFollowUpForm(0);
        }

    }
    setInspectForm(){
          //this.action == 'siteInspection' ? this.PEService.projectEstimatorData =JSON.parse(sessionStorage.getItem('quotationDetails')): '';
         console.log(this.PEService.projectEstimatorData);

        if(this.PEService.projectEstimatorData.site_inspection){
            this.PEService.projectEstimatorData.site_inspection.start_time =this.PEService.projectEstimatorData.site_inspection.start_time.substring(0,5);

            this.PEService.projectEstimatorData.site_inspection.end_time=this.PEService.projectEstimatorData.site_inspection.end_time.substring(0,5);

            this.createInspectForm(1,this.PEService.projectEstimatorData.site_inspection);
            if(this.PEService.projectEstimatorData.site_inspection){
                let reqObj: any = {
                    'date': this.PEService.projectEstimatorData.site_inspection.inspection_date,
                    'start_time': this.PEService.projectEstimatorData.site_inspection.start_time,
                    'start_time_format': this.PEService.projectEstimatorData.site_inspection.start_time_format,
                    'end_time': this.PEService.projectEstimatorData.site_inspection.end_time,
                    'end_time_format': this.PEService.projectEstimatorData.site_inspection.end_time_format
                }
                this.getInspectorList(reqObj);
            }

            //console.log("data:"+JSON.stringify(this.PEService.projectEstimatorData.site_inspection));
			//this.addServicesForm('1', this.PEService.projectEstimatorData.servicesDetails);
		}else{
            this.createInspectForm(0);
			//this.addServicesForm('0');
        }
    }
    public addressTypeList: IMultiSelectOption[]  = [
        { id: 1, name: 'Main Address' },
        { id: 2, name: 'Billing Address' },
        { id: 3, name: 'Work Location Address' }
    ];
    public selectText: IMultiSelectTexts = {
        defaultTitle: ''
    };
    gi



    public contactAddrList: IMultiSelectOption[] = this.contactData;

    ngOnInit() {
        //this.getInspectorList();
        this.util.setPageTitle(this.route);
        this.dataObj.action == 'addWorkLocation' ? this.getCountries() : '' ;
        //this.getCountries();
        this.dataObj.action == 'addServiceDefination' ? this.getBusinessType() : '';
        //this.getBusinessType();
        this.addressTypeChange('contact');
        this.createApproveConfirmationForm();
        this.dataObj.action == 'addWorkLocation' ? this.createAddWorkLocationForm() : '' ;
    }

    getEmployeeForFollowUp()
    {
        var self = this;
        try{
            // inspectors
            this.http.doGet('followerList', function(error: boolean, response: any){
                self.util.hideProcessing('processing-spinner');
                if(error){
                    console.log("error",response);
                }else{
                   // console.log(response);
                    self.inspectorList = [];
                    self.inspectorList = response.data.filter(item=>item.name = item.first_name + ' ' + item.last_name);
                   // console.log(self.inspectorList);
                    self.filteredInspectors = self.inspector_name.valueChanges.pipe(startWith(''),map(value => self.inspectorList.slice()));
                    //self.filteredInspectorsF = self.inspector_name_follow.valueChanges.pipe(startWith(''),map(value => self.inspectorList.slice()));
                    self.filteredInspectorsF = self.inspector_name_follow.valueChanges.pipe(startWith(''), map(data => data ? self.filterInspectors(data, self.inspectorList) : self.inspectorList.slice()) );
                }
            });
        }catch(err){
            this.global.addException('Schedule Site Inspection','getInspectorListForFollowUp()',err);
        }
    }

    getInspectorListForFollowUp(){
        var self = this;
        try{
            // inspectors
            this.http.doGet('inspectors', function(error: boolean, response: any){
                self.util.hideProcessing('processing-spinner');
                if(error){
                    console.log("error",response);
                }else{
                   // console.log(response);
                    self.inspectorList = [];
                    self.inspectorList = response.data.filter(item=>item.name = item.first_name + ' ' + item.last_name);
                   // console.log(self.inspectorList);
                    //self.filteredInspectors = self.inspector_name.valueChanges.pipe(startWith(''), map(data => data ? self.filterInspectors(data, self.inspectorList) : self.inspectorList.slice()) );
                    self.filteredInspectorsF = self.inspector_name_follow.valueChanges.pipe(startWith(''), map(data => data ? self.filterInspectors(data, self.inspectorList) : self.inspectorList.slice()) );
                }
            });
        }catch(err){
            this.global.addException('Schedule Site Inspection','getInspectorListForFollowUp()',err);
        }
    }

    getInspectorList(reqObj){
        var self = this;
        try{
            // inspectors
            this.http.doPost('inspectorLists', reqObj, function(error: boolean, response: any){
                self.util.hideProcessing('processing-spinner');
                if(error){
                    console.log("error",response);
                }else{
                   // console.log(response);
                    self.inspectorList = [];
                    self.inspectorList = response.data.filter(item=>item.name = item.first_name + ' ' + item.last_name);
                   // console.log(self.inspectorList);
                    self.filteredInspectors = self.inspector_name.valueChanges.pipe(startWith(''), map(data => data ? self.filterInspectors(data, self.inspectorList) : self.inspectorList.slice()) );
                    self.filteredInspectorsF = self.inspector_name_follow.valueChanges.pipe(startWith(''), map(data => data ? self.filterInspectors(data, self.inspectorList) : self.inspectorList.slice()) );
                }
            });
        }catch(err){
            this.global.addException('Schedule Site Inspection','getInspectorList()',err);
        }
    }

    getList(){
        if(this.inspection_date.valid && this.start_time.valid && this.start_time_format.valid && this.end_time.valid && this.end_time_format.valid){
            let reqObj = {
                'date': this.util.getYYYYMMDDDate(this.inspection_date.value),
                'start_time': this.start_time.value,
                'start_time_format': this.start_time_format.value,
                'end_time': this.end_time.value,
                'end_time_format': this.end_time_format.value
            }
            this.getInspectorList(reqObj);
        }
    }

    public getcontactData() {
        var self = this;
        //console.log(this.clientData);
        try {
            this.clientData.forEach(function (value) {
                self.contactData.push({
                    id: value.client_address_id,
                    name: value.address_line_1
                });
            });

            return self.contactData;
        } catch (err) {
            this.global.addException('Project Estimator', 'getcontactData()', err);
        }
    }
    filterInspectors(name: string, list: any[]) {
        try{
            return list.filter(data => data.name.toLowerCase().indexOf(name.toLowerCase()) === 0);

        }catch(err){
            this.global.addException('Schedule Site Inspection','filterInspectors()',err);
        }
    }
    getSelectedInspector(selInspector: any, event){
        try{
            if(event && event.isUserInput){
                console.log(selInspector);
                this.inspector.setValue(selInspector.id);
            }
        }catch(err){
            this.global.addException('Schedule Site Inspection','getSelectedInspector()',err);
        }
    }
    public validateInspector(event:any){
        try{
            let inspector = event.target.value;
            if(inspector == ''){
                this.inspector.setValue('');
                this.inspector_name.setValue('');
                return;
            }
            let match = this.inspectorList.filter(item=>item.name.toLowerCase() == inspector.toLowerCase());
            if(match.length > 0){
                this.inspector.setValue(match[0].id);
                this.inspector_name.setValue(match[0].name);
            }else{
                this.inspector.setValue('');
            }
        }catch(err){
            this.global.addException('Schedule Site Inspection','validateInspector()',err);
        }
    }

    getSelectedInspectorF(selInspector: any, event){
        try{
            if(event && event.isUserInput){
                console.log(selInspector);
                this.inspector_follow.setValue(selInspector.id);
            }
        }catch(err){
            this.global.addException('Schedule Site Inspection','getSelectedInspectorF()',err);
        }
    }


    public validateInspectorF(event:any){
        try{
            let inspector = event.target.value;
            if(inspector == ''){
                this.inspector_follow.setValue('');
                this.inspector_name_follow.setValue('');
                return;
            }
            let match = this.inspectorList.filter(item=>item.first_name.toLowerCase() == inspector.toLowerCase());
            if(match.length > 0){
                this.inspector_follow.setValue(match[0].id);
                this.inspector_name_follow.setValue(match[0].name);
            }else{
                this.inspector_follow.setValue('');
            }
        }catch(err){
            this.global.addException('Schedule Site Inspection','validateInspectorF()',err);
        }
    }

    public createInspectForm(option, data: any = {}){
        this.inspectForm = this.fb.group({
            inspection_date: new FormControl(option == '1' ? this.util.getTimeZoneDate(data.inspection_date ): '', [Validators.required]),
            start_time: new FormControl(option == '1' ? data.start_time : '', [Validators.required, Validators.pattern(this.constant.TIME_PATTERN)]),
            start_time_format: new FormControl(option == '1' ? data.start_time_format : 'am', [Validators.required]),
            end_time: new FormControl(option == '1' ? data.end_time : '', [Validators.required, Validators.pattern(this.constant.TIME_PATTERN)]),
            end_time_format: new FormControl(option == '1' ? data.end_time_format :'am', [Validators.required]),
            inspector: new FormControl(option == '1' ? data.inspector :'', [Validators.required]),
            inspector_name: new FormControl(option == '1' ? data.inspector_details.first_name+' '+data.inspector_details.last_name :'')
        });
    }

    get inspection_date() { return this.inspectForm.get('inspection_date'); }
    get start_time() { return this.inspectForm.get('start_time'); }
    get start_time_format() { return this.inspectForm.get('start_time_format'); }
    get end_time() { return this.inspectForm.get('end_time'); }
    get end_time_format() { return this.inspectForm.get('end_time_format'); }
    get inspector() { return this.inspectForm.get('inspector'); }
    get inspector_name() { return this.inspectForm.get('inspector_name'); }

    public createFollowUpForm(option,data: any = {}){
        this.followInspectForm = this.fb.group({
            comment: new FormControl(option == '1' ? data.follow_up_comment : '', []),
            inspector_follow: new FormControl(option == '1' ? data.follow_up_by :'', [Validators.required]),
            inspector_name_follow: new FormControl(option == '1' ? data.follower.first_name + ' ' + data.follower.last_name :'')
        });
    }
    get comment() { return this.followInspectForm.get('comment'); }
    get inspector_follow() { return this.followInspectForm.get('inspector_follow'); }
    get inspector_name_follow() { return this.followInspectForm.get('inspector_name_follow'); }

    public createAddClientForm() {

        this.addClientForm = this.fb.group({

            client_type: new FormControl('',[Validators.required]),
            company_name:new FormControl(''),
            first_name:new FormControl(''),
            last_name:new FormControl(''),
            payment_term:new FormControl(''),
            legal_name:new FormControl(''),
            comment:new FormControl(''),
        });
        this.clientTypeValueChanged();
        //console.log(this.addClientForm.controls);
    }

    public clientTypeValueChanged() {
        this.addClientForm.get('client_type').valueChanges.subscribe(type=>{
           // console.log(this.addClientForm.get('client_type').value);
            if(type=="Company"){
                this.addClientForm.get('first_name').setValidators([]);
                this.addClientForm.get('last_name').setValidators([]);
                this.addClientForm.get('company_name').setValidators([Validators.required,Validators.minLength(2), Validators.maxLength(100)]);
            }else if(type=="Individual"){
                this.addClientForm.get('company_name').setValidators([]);
                this.addClientForm.get('first_name').setValidators([Validators.required,Validators.minLength(2), Validators.maxLength(100)]);
                this.addClientForm.get('last_name').setValidators([Validators.required,Validators.minLength(2), Validators.maxLength(100)]);
            }
        });
    }
    public createAddWorkLocationForm(){
        let self = this;
        this.addWorkLocationForm = this.fb.group({
            client_id: new FormControl(this.getClientId),
            address_type: new FormControl([],[Validators.required]),
            address_line_1:new FormControl('',[Validators.required]),
            address_line_2:new FormControl(''),
            country_id:new FormControl(''),
            city_id : new FormControl(''),
            province_id:new FormControl(''),
            postal_code:new FormControl(''),
            latitude: new FormControl(''), //Hidden
            longitude: new FormControl(''), //Hidden
        });

        //setTimeout(function(){ self.mapInit(); }, 500);
    }

    mapInit(){
        try{
            let self = this
            self.util.mapInit(self.mapsAPILoader, self.searchElementRef, self.ngZone, self.addWorkLocationForm.get('address_line_1'), [ self.addWorkLocationForm.get('country_id'), self.addWorkLocationForm.get('province_id'), self.addWorkLocationForm.get('city_id'), self.addWorkLocationForm.get('postal_code'), { 'countries': self.countries }, self.addWorkLocationForm.get('latitude'), self.addWorkLocationForm.get('longitude') ]);

            //load Places Autocomplete
            // this.mapsAPILoader.load().then(() => {
            //     let autocomplete = new google.maps.places.Autocomplete(this.searchElementRef.nativeElement, {
            //     //types: ["address"]
            // });
            //     autocomplete.addListener("place_changed", () => {
            //         this.ngZone.run(() => {
            //         //get the place result
            //         let place: google.maps.places.PlaceResult = autocomplete.getPlace();
            //         //verify result
            //         if (place.geometry === undefined || place.geometry === null) {
            //             return;
            //         }
            //         //console.log(place.formatted_address);
            //         this.addWorkLocationForm.get('address_line_1').setValue(place.formatted_address);
            //         console.log("Latitude : "+place.geometry.location.lat()+" Longitude : "+place.geometry.location.lng());

            //         this.addWorkLocationForm.get('latitude').setValue(place.geometry.location.lat());
            //         this.addWorkLocationForm.get('longitude').setValue(place.geometry.location.lng());
            //         });
            //     });
            // });
        }catch(err){
            this.global.addException('PE Add Address OTF','mapInit()',err);
        }
    }

    getCountries(){
        let self = this;
        this.global.getCountries(function(list){ self.countries = list; self.mapInit(); });

    }
    // countryChange(countryId, address){
    //     this.getProviences(countryId);

    // }

    // stateChange(stateId, address){
    //     this.getCities(stateId);
    // }

    // cityChange(indx, cityId, address){
    //     this.updateAddress(address, 'selectedCity', address.get('selVal').value.city.filter(item => item.city_id == cityId)[0].city_name);
    //     this.updateContactAddress(indx, address);
    // }
   // getCities(stateId){
   //  let self = this;
   //  this.global.getCities(stateId, function(list){
   //        self.cities=list;
   //        console.log(list);
   //      });
   // }
   //  getProviences(countryId){
   //      let self = this;
   //      this.global.getProviences(countryId, function(list){
   //            self.states=list;
   //          });
   //  }
    addressTypeChange(type){
        this.addTyp=[];
        console.log("type :: ",type);
        if(type=='location'){
            for (let i = 0; i < this.addWorkLocationForm.get('address_type').value.length; i++){
                this.addTyp.push(this.addressTypeList.filter(item => item.id == this.addWorkLocationForm.get('address_type').value[i])[0].name);
                // console.log(this.addWorkLocationForm.get('address_type').value[i],this.addTyp);
                //this.updateAddress(this.addWorkLocationForm, 'selectedAddressType', this.addTyp);
            }

        }else if(type=='contact'){
            for (let i = 0; i < this.addContactForm.get('client_address_id').value.length; i++){
                this.addTyp.push(this.contactAddrList.filter(item => item.id == this.addContactForm.get('client_address_id').value[i])[0].name);
            }
            console.log(this.contactAddrList)
        }

    }
    updateAddress(address, newField, newVal) {
        try {
            // this.addWorkLocationForm.address_type.selVal = {};
            let selValObj = address.get('address_type').selVal.value;
            selValObj[newField] = newVal;
            address.get('address_type').setValue(selValObj[newField]);
            console.log(address.get('address_type').value);
            //console.log(this.addWorkLocationForm.get('address_type').value);
        }
        catch (err) {
            this.global.addException('Project Estimator', 'updateAddress()', err);
        }
    }

    public createAddContactForm(){
        this.addContactForm = this.fb.group({
            client_id: new FormControl(this.getClientId),
            client_address_id: new FormControl([]),
            address: new FormControl(''),
            contact_type:new FormControl(''),
            name:new FormControl('',[Validators.required]),
            phone_no : new FormControl('',[Validators.required,
                                           Validators.pattern(this.constant.PHONE_PATTERN)]),
            email_id:new FormControl('',[Validators.required,
                                         Validators.pattern(this.constant.EMAIL_PATTERN)])
            });
    }


    public createApproveConfirmationForm(){
        this.addApproveConfirmationNoteForm = this.fb.group({
            approve_note: new FormControl(''),
        });
    }

    public createAddServiceDefinationForm(){
        this.addServiceDefinationForm = this.fb.group({
            business_type: new FormControl(''),
            service_type_id: new FormControl('',[Validators.required]),
            service_definition: new FormControl('',[Validators.required]),
            price:new FormControl('',[Validators.required,Validators.pattern(this.constant.AMOUNT_PATTERN)]),
            });
    }

    getBusinessType(){
        var self = this;
        self.util.showProcessing('processing-spinner');
        try{
            this.http.doGet('businessType', function(error: boolean, response: any){
                self.util.hideProcessing('processing-spinner');
                if(error){
                    console.log("error",response);
                }else{
                    console.log(response);
                    self.businessTypes = [];
                    self.businessTypes = response.data;
                    console.log(self.businessTypes);
                }
            });
        }catch(err){
            this.global.addException('Schedule Site Inspection','getInspectorList()',err);
        }
    }

    public getServices(businessTypeId) {
        try {
            // console.log(businessTypeId);
            var self = this;
            self.serviceTypes = [];
            this.businessTypes.forEach(businessType => {
                if (businessTypeId == businessType.businessTypeId) {
                    self.serviceTypes.push(businessType.services);
                }
            });
        } catch (err) {
            this.global.addException('Project Estimator', 'getServices()', err);
        }
        // console.log(self.serviceTypes);
    }

    closeDialog(): void {
        this.dialogRef.close();
    }
    submit(form: FormGroup): void {
        let self = this;
        //let responseData;
        self.errMsg = '';
        self.isError = false;
        console.log("DAta:" + JSON.stringify(this.PEService.projectEstimatorData));
        try {
            if (form.valid) {
                self.siteInspection = { 'project_estimate_id': this.PEService.projectEstimatorData.project_estimate_id };
                self.siteInspection.inspection = [];
                self.siteInspection.inspection.push(form.value);
                self.siteInspection.inspection.forEach(function (value, key) {
                    self.siteInspection.inspection[key].pe_site_inspection_id = self.PEService.projectEstimatorData.site_inspection ? self.PEService.projectEstimatorData.site_inspection.pe_site_inspection_id : '';
                    self.siteInspection.inspection[key].inspection_date = self.util.getYYYYMMDDDate(value.inspection_date);
                });
                if (this.PEService.projectEstimatorData.project_estimate_id) {
                    self.util.addSpinner('submit-btn', "Submit");
                    this.http.doPost('WorkflowPEInspection', self.siteInspection, function (error: boolean, response: any) {
                        self.util.removeSpinner('submit-btn', "Submit");
                        if (error) {
                            self.errMsg = response.message;
                            self.isError = true;
                        } else {
                            self.dialogRef.close();
                            self.util.showDialog(DialogComponent, response.message);
                            self.PEService.projectEstimatorData.site_inspection = response.data.site_inspection;
                            //sessionStorage.removeItem('quotationDetails');
                            //responseData = self.PEService.setResponseForPE(response.data);
                            //sessionStorage.setItem('quotationDetails', responseData);
                            self.setInspectForm();
                            if(self._location.path().includes("quotation-list")){
                                console.log("Include");
                                self.util.changeEvent({
                                    'source': 'SITE_INSPECTION',
                                    'action': 'INSPECTION',
                                    'data': response.data
                                });
                            }
                        }
                    });
                }
            }
        } catch (err) {
            this.global.addException('Project Estimator', 'submit()', err);
        }
    }

    saveForFollowUp(form: FormGroup): void {
        try {
            let self = this;
            //let responseData = JSON.parse(sessionStorage.getItem('quotationDetails'));
            self.errMsg = '';
            self.isError = false;
            console.log(form);
            if (form.valid) {
                //console.log(form.value);
                self.followupDetails = {
                    'project_estimate_id': this.PEService.projectEstimatorData.project_estimate_id,
                    'follow_up_by': form.value.inspector_follow,
                    'name_follow_up_by': form.value.inspector_name_follow,
                    'follow_up_comment': form.value.comment
                }
                //sessionStorage.setItem('quotationDetails', JSON.stringify(this.PEService.projectEstimatorData));
                //sessionStorage.setItem('quotationFormFlag', JSON.stringify(this.PEService.getFormValidationStatus));
                self.util.addSpinner('save-btn', "Save");
                if (this.PEService.projectEstimatorData.project_estimate_id) {
                    this.http.doPost('WorkflowPEFollowup', self.followupDetails, function (error: boolean, response: any) {
                        self.util.removeSpinner('save-btn', "Save");
                        if (error) {
                            self.errMsg = response.message;
                            self.isError = true;
                        } else {
                            self.dialogRef.close();
                            self.util.showDialog(DialogComponent, response.message);
                            //sessionStorage.removeItem('quotationDetails');
                            //responseData.follow_up_by = response.data.follow_up_by;
                            //responseData.follow_up_comment = response.data.follow_up_comment;
                            //responseData.follower = response.data.follower;
                            self.PEService.projectEstimatorData.follow_up_by = response.data.follow_up_by;
                            self.PEService.projectEstimatorData.follow_up_comment = response.data.follow_up_comment;
                            self.PEService.projectEstimatorData.follower = response.data.follower;
                            //responseData = self.PEService.setResponseForPE(responseData);
                            //sessionStorage.setItem('quotationDetails', self.PEService.setResponseForPE(self.PEService.projectEstimatorData));
                            self.setFollowUpForm();
                            if(self._location.path().includes("quotation-list")){
                                self.util.changeEvent({
                                    'source': 'SAVE_FOR_FOLLOW_UP',
                                    'action': 'FOLLOW_UP',
                                    'data': response.data
                                });
                            }
                        }
                    });
                }

            }
        } catch (err) {
            this.global.addException('Project Estimator', 'saveForFollowUp()', err);
        }
    }

    addClient(form: FormGroup): void {
        try {
            let self = this;
            self.errMsg = '';
            self.submitted = true;
            // console.log(form);
            if (form.value.client_type == 'Company') {
                //form.value.company_name= form.value.company_name.trim();
                if (form.value.company_name.trim() == "") {
                    self.addClientForm.get('company_name').setValue('');
                    return;
                }
            } else if (form.value.client_type == 'Individual') {
                if (form.value.first_name.trim() == "") {
                    self.addClientForm.get('first_name').setValue('');
                    return;
                }
                if (form.value.last_name.trim() == "") {
                    self.addClientForm.get('last_name').setValue('');
                    return;
                }
            }

            //console.log(form.valid);return;
            if (form.valid) {
                JSON.stringify(form.value);
                self.util.addSpinner('save-btn', "Save");
                this.http.doPost('clients', form.value, function (error: boolean, response: any) {
                    self.util.removeSpinner('save-btn', "Save");
                    if (error) {
                        self.errMsg = response.message;
                        self.isError = true;
                        console.log(response.message);
                    } else {
                        console.log(response);

                        self.util.changeEvent({
                            'source': 'QUOTATION_GENERATION',
                            'action': 'ADD_CLIENT',
                            'data': { 'client_id': 'default' }
                        });
                        self.util.removeSpinner('save-btn', "Save");
                        self.closeDialog();
                    }
                });
            }
            else {
                console.log(form);
            }
        } catch (err) {
            this.global.addException('Project Estimator', 'addClient()', err);
        }
    }
    addWorkLocation(form: FormGroup): void {
        try {
            let self = this;
            self.errMsg = '';
            self.submitted = true;
            if (form.valid) {
                JSON.stringify(form.value);
                console.log(form.value);
                console.log(self.addTyp);
                // if (!self.addTyp.includes('Work Location Address'))
                //     self.addTyp.push('Work Location Address');

                if(self.locationType == 'workLocation')
                {
                    if (!self.addTyp.includes('Work Location Address'))
                    {
                        self.isError = true;
                        self.errMsg = 'Please select work location address type';
                        return;
                    }
                }
                else if(self.locationType == 'billLocation')
                {
                    if (!self.addTyp.includes('Billing Address'))
                    {
                        self.isError = true;
                        self.errMsg = 'Please select billing address type';
                        return;
                    }
                }

                form.value.address_type = JSON.stringify(self.addTyp);
                console.log(form.value.address_type);
                self.util.addSpinner('save-btn', "Save");
                this.http.doPost('client/address', form.value, function (error: boolean, response: any) {
                    self.util.removeSpinner('save-btn', "Save");
                    if (error) {
                        self.errMsg = response.message;
                        self.isError = true;
                   } else {

                        self.util.changeEvent({
                            'source': 'QUOTATION_GENERATION',
                            'action': 'ADD_LOCATION',
                            'type': self.locationType,
                            'data': { 'client_id': form.value.client_id }
                        });
                        self.util.removeSpinner('save-btn', "Save");
                        self.closeDialog();
                    }
                });
            }
        } catch (err) {
            this.global.addException('Project Estimator', 'addWorkLocation()', err);
        }

    }
    addContact(form: FormGroup): void {
        let self = this;
        self.errMsg = '';
        self.submitted = true;
        try {
            if (form.valid) {
                JSON.stringify(form.value);
                form.value.client_address_id = JSON.stringify(form.value.client_address_id);
                form.value.address = JSON.stringify(self.addTyp);
                self.util.addSpinner('save-btn', "Save");
                //console.log(form.value);
                this.http.doPost('client/contact', form.value, function (error: boolean, response: any) {
                    if (error) {
                        self.util.removeSpinner('save-btn', "Save");
                        self.errMsg = response.message;
                        self.isError = true;
                        //console.log(response.message);
                    } else {
                        //console.log(response);
                        self.util.removeSpinner('save-btn', "Save");
                        self.util.changeEvent({
                            'source': 'QUOTATION_GENERATION',
                            'action': 'ADD_CONTACT',
                            'data': { 'client_id': form.value.client_id }
                        });

                        self.closeDialog();
                    }
                });
            }
        } catch (err) {
            this.global.addException('Project Estimator', 'addContact()', err);
        }

    }

    addServiceDefinition(form: FormGroup): void {
        let self = this;
        self.errMsg = '';
        self.submitted = true;
        try {
            if (form.valid) {
                self.util.addSpinner('add-service-btn', "Submit");
                this.http.doPost('addservicedefination', form.value, function (error: boolean, response: any) {
                    self.util.removeSpinner('add-service-btn', "Submit");
                    if (error) {
                        self.errMsg = response.message;
                        self.isError = true;
                    } else {
                        self.util.changeEvent({
                            'source': 'QUOTATION_GENERATION',
                            'action': 'ADD_SERVICE_DEFINITION',
                            'data': { 'service_definition': form.value.service_definition }
                        });

                        self.closeDialog();
                    }
                });
            }
        } catch (err) {
            this.global.addException('Project Estimator', 'addServiceDefinition()', err);
        }
    }

    confirm(): void {
        let self = this;
        let responseData;
        self.errMsg = '';
        self.isError = false;
        try {
            let updatedPE = JSON.parse(sessionStorage.getItem('quotationDetails'));
            updatedPE.approveNote = this.addApproveConfirmationNoteForm.get('approve_note').value;
            sessionStorage.setItem('quotationDetails', JSON.stringify(updatedPE));

            self.util.addSpinner('confirm-btn', 'Confirm');
            this.PEService.saveProjectEstimator(this.dataObj.apiAction, 'APPROVE', function (error: boolean, response: any) {
                self.util.removeSpinner('confirm-btn', 'Confirm');
                if (error) {
                    self.errMsg = response.message;
                    self.isError = true;
                } else {
                    self.closeDialog();
                    self.PEService.updateFormStatus('materialsFm', false);
                    self.PEService.updateFormStatus('paymentScheduleFm', false);
                    self.PEService.updateFormStatus('servicesFm', false);
                    self.PEService.updateFormStatus('scheduleFm', false);
                    self.util.showDialog(DialogComponent, response.message, ['/workflow/quote/csa/quotation-list/0']);
                    if(self._location.path().includes("quotation-list")){
                        console.log("include");
                        self.util.changeEvent({
                            'source': 'APPROVE_PE',
                            'action': 'APPROVE_PE',
                            'data': response.data
                        });
                    }
                }
            });
        } catch (err) {
            this.global.addException('Project Estimator', 'confirm()', err);
        }

    }
}
