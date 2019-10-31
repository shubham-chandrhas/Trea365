import { Component, OnInit, Inject, NgZone, ViewChild, ElementRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { MapsAPILoader } from '@agm/core';
import { FormControl,FormGroupDirective, Validators, FormGroup, FormBuilder } from '@angular/forms';
import { IMultiSelectOption, IMultiSelectSettings, IMultiSelectTexts } from 'angular-2-dropdown-multiselect';

import { HttpService } from '../../../service/http.service';
import { UtilService } from '../../../service/util.service';
import { ConstantsService } from '../../../service/constants.service';
import { GlobalService } from '../../../../shared/service/global.service';
@Component({
    selector: 'app-add-supplier',
    templateUrl: './add-supplier.component.html',
    styleUrls: ['./add-supplier.component.css']
})
export class AddSupplierComponent implements OnInit {
    public errMsg:string = '';
    public isEdit:boolean = false;
    public isError:boolean = false;
    public submitted:boolean = false;
    public isCountry:boolean = false;
    public isProvince:boolean = false;
    public isCity:boolean = false;
    addNewSupFrm:FormGroup;
    public suppliertypeList:any[] = [];
    public countries: any = [];
    public stateList: any = [];
    public cityList: any = [];
    private routeObj: any;
    currentPath: string;
    currentPathOnList: string;
    mulSelSettings: IMultiSelectSettings = { displayAllSelectedText: true };
    supplierTypeList: IMultiSelectOption[] = [];
    selectText: IMultiSelectTexts = { defaultTitle: '' };
    filteredCountry: Observable<string[]>;
    filteredProvince: Observable<string[]>;
    filteredCity: Observable<string[]>;

    @ViewChild("search")
    public searchElementRef: ElementRef;

    constructor(
        public util: UtilService,
        private http: HttpService,
        private router: Router,
        private fb: FormBuilder,
        public constant: ConstantsService,
        private route: ActivatedRoute,
        private mapsAPILoader: MapsAPILoader,
        private ngZone: NgZone,
        private global: GlobalService
    ) { }

    ngOnInit() {
        this.currentPath = this.router.url.split('/')[this.router.url.split('/').length - 1];
        this.currentPathOnList = this.router.url.split('/')[this.router.url.split('/').length - 2];
        //this.suppliertypeList = this.currentPath == 'add-product' ? [{name: 'Material'}] : this.currentPath == 'add-asset' ? [{name: 'Assets'},{name: 'Finance'}] : [{name: 'Material'},{name: 'Assets'},{name: 'Finance'},{name: 'Contractors'},{name: 'Repair Services'}];
        this.currentPath == 'add-supplier' ? this.router.url.split('/')[2] == 'csa-onboarding' ? this.util.menuChange({'menu':'guide','subMenu':''}) : this.util.menuChange({'menu':2,'subMenu':16}) : '' ;
        this.router.url.split('/')[2]=='csa-onboarding' ? this.routeObj = { 'list': '/csa-onboarding/guide', 'review': '/admin/csa-onboarding/supplier-review' } : this.routeObj = { 'list': '/admin/csa/supplier-list/0', 'review': '/admin/csa/supplier-review' } ;
        this.util.setWindowHeight();
        this.util.setPageTitle(this.route);
        if( sessionStorage.getItem('supplierObject') ){
            this.isEdit = true;
            let supObj:any = {};
            supObj = JSON.parse(sessionStorage.getItem('supplierObject'));
            //this.getProviences(supObj.reqObj.countryId);
            //this.getCities(supObj.reqObj.provinceId);
            this.createSupplierForm('edit', supObj.reqObj);
        }else{
            this.isEdit = false;
            this.createSupplierForm('add');
        }
        this.getSupplierTypes();
        //this.setSupplierTypeList();
        this.getCountries();
        this.onChanges();
    }

    ngOnDestroy(){

    } 

    // setSupplierTypeList(): void {
    //     switch (this.currentPath) {
    //         case "add-product":
    //             //this.suppliertypeList = [{name: 'Material'}];
    //             this.suppliertypeList = this.suppliertypeList.filter(item=>item.type_id == 1);
    //             this.supplierTypeList = this.suppliertypeList.filter(item => (item.id = item.type_id, item.name = item.status));
    //             break;
    //         case "add-asset":
    //             //this.suppliertypeList = sessionStorage.getItem('supOTF') == 'ASSET' ? [{name: 'Assets'}] : [{name: 'Finance'}];
    //             this.suppliertypeList = sessionStorage.getItem('supOTF') == 'ASSET' ? this.suppliertypeList.filter(item=>item.type_id == 2) : this.suppliertypeList.filter(item=>item.type_id == 3);
    //             this.supplierTypeList = this.suppliertypeList.filter(item => (item.id = item.type_id, item.name = item.status));
    //             sessionStorage.removeItem('supOTF');
    //             break;
    //         default:
    //             //this.suppliertypeList = [{name: 'Material'},{name: 'Assets'},{name: 'Finance'},{name: 'Contractors'},{name: 'Repair Services'}];
    //             this.supplierTypeList = this.suppliertypeList.filter(item => (item.id = item.type_id, item.name = item.status));
    //             this.suppliertypeList = this.suppliertypeList;
    //             break;
    //     }
    // }

    getCountries() {
        try {
            var self = this;
            // this.isCountry = true;
            this.isCountry = this.isEdit ? false : true;
            this.http.doGet('country', function (error: boolean, response: any) {
                if (error) { self.countries = []; } else {
                    self.countries = response.data;
                    //self.filteredCountry = self.countryName.valueChanges.pipe(startWith(''),map(value => self.countryFilter(value)));
                    self.isCountry = false;

                    self.util.mapInit(self.mapsAPILoader, self.searchElementRef, self.ngZone, self.addNewSupFrm.get('address1'), [self.addNewSupFrm.get('countryId'), self.addNewSupFrm.get('provinceId'), self.addNewSupFrm.get('cityId'), self.addNewSupFrm.get('postalCode'), { 'countries': self.countries }, self.addNewSupFrm.get('latitude'), self.addNewSupFrm.get('longitude')]);
                }
            });
        } catch (err) {
            this.global.addException('Add Supplier', 'getCountries()', err);
        }
    }
    // private countryFilter(value: string): string[] {
    //     return this.countries.filter(option => option.country_name.toLowerCase().includes(value ? value.toLowerCase() : ''));
    // }
    // getSelectedCountry(country,event:any): void {
    //     if(event){
    //         if(event.isUserInput){
    //             this.countryId.setValue(country.country_id);
    //             //this.getProviences(country.country_id);
    //             //this.isProvince = true;
    //         }
    //     }
    // }
    // public validateCountry(event:any){
    //     let country = event.target.value;
    //     let match = this.countries.filter(item=>item.country_name.toLowerCase() == country.toLowerCase());
    //     if(country == ''){
    //         this.countryId.setValue('');
    //         return;
    //     }
    //     if(match.length > 0){
    //         this.countryId.setValue(match[0].country_id);
    //         this.countryName.setValue(match[0].country_name);
    //         //this.isProvince = true;
    //         //this.getProviences(match[0].country_id);
    //     }else{
    //         this.countryId.setValue('');
    //     }
    // }


    // getProviences(countryId){
    //     var self = this;
    //     this.http.doGet('provinces/'+countryId, function(error: boolean, response: any){
    //         if( error ){ self.stateList = []; }else{
    //             self.stateList = response.data;
    //             self.filteredProvince = self.provinceName.valueChanges.pipe(startWith(''),map(value => self.provinceFilter(value)));
    //             self.isProvince = false;
    //         }
    //     });
    // }
    // private provinceFilter(value: string): string[] {
    //     return this.stateList.filter(option => option.province_name.toLowerCase().includes(value ? value.toLowerCase() : ''));
    // }
    // getSelectedProvince(province,event:any): void {
    //     if(event){
    //         if(event.isUserInput){
    //             this.provinceId.setValue(province.province_id);
    //             this.getCities(province.province_id);
    //             this.isCity = true;
    //         }
    //     }
    // }
    // public validateProvince(event:any){
    //     let province = event.target.value;
    //     let match = this.countries.filter(item=>item.province_name.toLowerCase() == province.toLowerCase());
    //     if(province == ''){
    //         this.provinceId.setValue('');
    //         return;
    //     }
    //     if(match.length > 0){
    //         this.provinceId.setValue(match[0].province_id);
    //         this.provinceName.setValue(match[0].province_name);
    //         this.isCity = true;
    //         this.getCities(match[0].province_id);
    //     }else{
    //         this.provinceId.setValue('');
    //     }
    // }
    // getCities(provienceId){
    //     var self = this;
    //     this.http.doGet('city/'+provienceId, function(error: boolean, response: any){
    //         if( error ){ self.cityList = []; }else{
    //             self.cityList = response.data;
    //             self.filteredCity = self.cityName.valueChanges.pipe(startWith(''),map(value => self.cityFilter(value)));
    //             self.isCity = false;
    //         }
    //     });
    // }
    // private cityFilter(value: string): string[] {
    //     return this.cityList.filter(option => option.city_name.toLowerCase().includes(value ? value.toLowerCase() : ''));
    // }
    // getSelectedCity(city,event:any): void {
    //     if(event){
    //         if(event.isUserInput){
    //             this.cityId.setValue(city.city_id);
    //         }
    //     }
    // }
    // public validateCity(event:any){
    //     let city = event.target.value;
    //     let match = this.countries.filter(item=>item.city_name.toLowerCase() == city.toLowerCase());
    //     if(city == ''){
    //         this.cityId.setValue('');
    //         return;
    //     }
    //     if(match.length > 0){
    //         this.cityId.setValue(match[0].city_id);
    //         this.cityName.setValue(match[0].city_name);
    //     }else{
    //         this.cityId.setValue('');
    //     }
    // }



    onChanges(): void {
        // this.addNewSupFrm.get('countryId').valueChanges.subscribe(selCountry => {
        //     this.addNewSupFrm.get('provinceId').setValue('');
        //     this.addNewSupFrm.get('cityId').setValue('');
        //     this.getProviences(selCountry);
        // });

        // this.addNewSupFrm.get('provinceId').valueChanges.subscribe(selProvinence => {
        //     this.addNewSupFrm.get('cityId').setValue('');
        //     if(selProvinence != ''){
        //         this.getCities(selProvinence);
        //     }
        // });
    }

    getSupplierTypes() {
        try {
            var self = this;
            this.http.doGet('getCommonStatus/SUPPLIER_TYPE', function (error: boolean, response: any) {
                if (error) { console.log(error); } else {
                    self.suppliertypeList = [];
                    self.suppliertypeList = response.data.statusList;
                    console.log("suppliertypeList", self.suppliertypeList);
                    self.supplierTypeList = self.suppliertypeList.filter(item => (item.id = item.type_id, item.name = item.status));
                    self.suppliertypeList = self.suppliertypeList;
                    // self.setSupplierTypeList();
                }
            });
        } catch (err) {
            this.global.addException('Add Supplier', 'getSupplierTypes()', err);
        }
    }
    public createSupplierForm(action, supplierObj:any = {}){
        this.addNewSupFrm = this.fb.group({
            supplierType:new FormControl(action == 'edit' ? supplierObj.supplierType : [], []),
            supplierName:new FormControl(action == 'edit' ? supplierObj.supplierName : '', [
                Validators.required,
                Validators.minLength(2),
                Validators.maxLength(this.constant.DEFAULT_TEXT_MAXLENGTH)
            ]),
            address1:new FormControl(action == 'edit' ? supplierObj.address1 : '', []),  //Validators.maxLength(this.constant.DEFAULT_TEXT_MAXLENGTH)
            address2:new FormControl(action == 'edit' ? supplierObj.address2 : '',[]),  //Validators.maxLength(this.constant.DEFAULT_TEXT_MAXLENGTH)
            countryName:new FormControl(action == 'edit' ? supplierObj.countryName : ''),
            provinceName:new FormControl(action == 'edit' ? supplierObj.provinceName : ''),
            // cityName:new FormControl(action == 'edit' ? supplierObj.cityName : ''),
            // countryId:new FormControl(action == 'edit' ? supplierObj.countryId : '', [
            //     Validators.required
            // ]),
            // provinceId:new FormControl(action == 'edit' ? supplierObj.provinceId : '', [
            //     Validators.required
            // ]),
            // cityId:new FormControl(action == 'edit' ? supplierObj.cityId : '', [
            //     Validators.required,
            // ]),
            // postalCode:new FormControl(action == 'edit' ? supplierObj.postalCode : '', [
            //     Validators.required,
            //     Validators.minLength(3),
            //     Validators.maxLength(10),
            //     Validators.pattern(this.constant.POSTAL_CODE_PATTERN)
            // ]),
            emailId:new FormControl(action == 'edit' ? supplierObj.emailId : '', [
                // Validators.required,
                Validators.pattern(this.constant.EMAIL_PATTERN)
            ]),
            phoneNumber:new FormControl(action == 'edit' ? supplierObj.phoneNumber : '', [
                // Validators.required,
                Validators.pattern(this.constant.PHONE_PATTERN)
            ]),
            countryId:new FormControl(action == 'edit' ? supplierObj.countryId : ''),
            provinceId:new FormControl(action == 'edit' ? supplierObj.provinceId : ''),
            cityId:new FormControl(action == 'edit' ? supplierObj.cityId : ''),
            postalCode:new FormControl(action == 'edit' ? supplierObj.postalCode : ''),
            latitude: new FormControl(''),
            longitude: new FormControl(''),
            comment:new FormControl(action == 'edit' ? supplierObj.comment : '', [
                Validators.maxLength(this.constant.DEFAULT_COMMENT_MAXLENGTH)]),
        });
    }
    get supplierType() { return this.addNewSupFrm.get('supplierType'); }
    get supplierName() { return this.addNewSupFrm.get('supplierName'); }
    get address1() { return this.addNewSupFrm.get('address1'); }
    get address2() { return this.addNewSupFrm.get('address2'); }
    get countryName() { return this.addNewSupFrm.get('countryName'); }
    get countryId() { return this.addNewSupFrm.get('countryId'); }
    get provinceName() { return this.addNewSupFrm.get('provinceName'); }
    get provinceId() { return this.addNewSupFrm.get('provinceId'); }
    get cityName() { return this.addNewSupFrm.get('cityName'); }
    get cityId() { return this.addNewSupFrm.get('cityId'); }
    get postalCode() { return this.addNewSupFrm.get('postalCode'); }
    get emailId() { return this.addNewSupFrm.get('emailId'); }
    get phoneNumber() { return this.addNewSupFrm.get('phoneNumber'); }
    get comment() { return this.addNewSupFrm.get('comment'); }


    addsupplier(form: FormGroup) {
        let self = this;
        this.util.addBulkValidators(this.addNewSupFrm, ['supplierType'], [Validators.required]);
        this.errMsg = '';
        this.isError = false;
        this.submitted = true;
        try {
            if (form.valid) {
                let supplier: any = { 'supTyps': [] };
                supplier.reqObj = form.value;
                //supplier.supplierTypeName = this.suppliertypeList.filter(item => item.type_id == form.value.supplierType)[0].status;
                //supplier.countryName = this.countries.filter(item => item.country_id == form.value.countryId)[0].country_name;
                //supplier.provinceName = this.stateList.filter(item => item.province_id == form.value.provinceId)[0].province_name;
                //supplier.cityName = this.cityList.filter(item => item.city_id == form.value.cityId)[0].city_name;
                if ((this.currentPath == "add-product" || this.currentPath == "add-material") && form.value.supplierType.indexOf(1) == -1) {
                    this.errMsg = 'Please Select Product And Material Supplier Type.';
                    this.isError = true;
                    return;
                }else if(this.currentPath == "add-asset" || this.currentPathOnList == "asset-list" || this.currentPath == "add-receiving-slip"){
                    if(this.util.getOTFSupType() != ''){
                        if(this.util.getOTFSupType() == '2' && form.value.supplierType.indexOf(2) == -1){
                            this.errMsg = 'Please Select Asset Supplier Type.';
                            this.isError = true;
                            return;
                        }else if(this.util.getOTFSupType() == '3' && form.value.supplierType.indexOf(3) == -1){
                            this.errMsg = 'Please Select Finance Supplier Type.';
                            this.isError = true;
                            return;
                        }else if(this.util.getOTFSupType() == '6' && form.value.supplierType.indexOf(6) == -1){
                            this.errMsg = 'Please Select Warranty Supplier Type.';
                            this.isError = true;
                            return;
                        }

                    }
                }

                form.value.supplierType.map(selectedType => { self.suppliertypeList.map(supType => { selectedType == supType.type_id ? supplier.supTyps.push(supType.status) : '' }) });
                console.log(supplier.supTyps);

                sessionStorage.setItem('supplierObject', JSON.stringify(supplier));
                this.currentPath == 'add-supplier' ? this.router.navigate([this.routeObj.review]) : this.onTheFlyEvent({ 'step': 'S2' });
            }
        } catch (err) {
            this.global.addException('Add Supplier', 'addsupplier()', err);
        }
    }

    cancelSupplier() {
        try {
            this.currentPath == 'add-supplier' ? this.router.navigate([this.routeObj.list]) : this.onTheFlyEvent({ 'step': 'S0' });
        } catch (err) {
            this.global.addException('Add Supplier', 'cancelSupplier()', err);
        }
    }

    onTheFlyEvent(data): void {
        this.util.changeEvent({
            'source': 'ON_THE_FLY_SUPPLIER',
            'action': 'ADD',
            'data': data
        });
    }
}
