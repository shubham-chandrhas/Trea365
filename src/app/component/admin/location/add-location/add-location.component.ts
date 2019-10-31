import { Component, OnInit, ElementRef, NgZone, ViewChild, ApplicationRef, Renderer, ViewChildren, QueryList } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
//import { } from 'googlemaps';
import { MapsAPILoader } from '@agm/core';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { FormControl, FormGroup, FormBuilder, FormArray, Validators, NgForm, AbstractControl } from '@angular/forms';
import { LocationService } from '../location.service';
import { UtilService } from '../../../../shared/service/util.service';
import { ConstantsService } from '../../../../shared/service/constants.service';
import { HttpService } from '../../../../shared/service/http.service';
import { GlobalService } from '../../../../shared/service/global.service';


@Component({
    selector: 'app-add-location',
    templateUrl: './add-location.component.html',
    styleUrls: ['./add-location.component.css']
})
export class AddLocationComponent implements OnInit {
    
    pageData: any = { 'permissionList': [],  'errMsg': '', 'isError': false, 'submitted': false , 'isThumbnailSet': false, 'dragOver': false, 'action': 'add', 'tagFormAvailability':'0'};
    addLocationFm: FormGroup;
    errMsg: string = '';
    isError: boolean = false; 
    submitted: boolean = false;
    locationTypeList: any[];
    assetsList: any = [];
    //selectedAsset: any;
    divValValidators = [ Validators.required,Validators.maxLength(30),Validators.pattern(this.constant.CODE39_WITH_SPACE_PATTERN) ];
    divMinValidators = [ Validators.max(99),Validators.min(1),Validators.pattern(this.constant.ONLY_NUMBER) ];
    divMaxValidators = [ Validators.max(99),Validators.min(1),Validators.pattern(this.constant.ONLY_NUMBER) ];
    filteredAsset: Observable<string[]>;

    @ViewChildren('div', { read: ElementRef }) divList:QueryList<any>;
    @ViewChildren('value', { read: ElementRef }) valueList:QueryList<any>;

    @ViewChild("search")
    public searchElementRef: ElementRef;

    constructor(
        private router: Router,
        public util: UtilService,
        private http: HttpService, 
        private fb: FormBuilder, 
        private ref: ApplicationRef,
        private mapsAPILoader: MapsAPILoader,
        private ngZone: NgZone,
        private constant: ConstantsService,
        private locationService: LocationService,
        private global: GlobalService,
        private el: ElementRef,
        private renderer: Renderer,
        private route: ActivatedRoute,
        ) {
            this.locationTypeList = this.router.url.split('/')[2] == 'csa-onboarding' ? ['Fixed'] : ['Fixed', 'Mobile'] ;
    }

    ngOnInit() {
        try{
            this.util.setWindowHeight();
            this.util.setPageTitle(this.route);
            this.router.url.split('/')[2]=='csa-onboarding' ? this.util.menuChange({'menu':'guide','subMenu':''}) : this.util.menuChange({'menu':2,'subMenu':12});

            this.getAssetList();
            if(sessionStorage.getItem('locationDetails')){
                let locObj:any = JSON.parse(sessionStorage.getItem('locationDetails'));
                this.createForm(1, locObj);
                console.log(locObj.locationType,locObj);
                if(locObj.locationType == 'Fixed'){
                    this.util.mapInit(this.mapsAPILoader, this.searchElementRef, this.ngZone, this.addLocationFm.get('address'), [ null, null, null, null, null, this.addLocationFm.get('latitude'), this.addLocationFm.get('longitude') ]);
                }
            }else{
                this.createForm(0);
                this.util.mapInit(this.mapsAPILoader, this.searchElementRef, this.ngZone, this.addLocationFm.get('address'), [ null, null, null, null, null, this.addLocationFm.get('latitude'), this.addLocationFm.get('longitude') ]);
            }

            this.onChanges(); 

            this.addLocationFm.get('locationType').valueChanges.subscribe((type)=>{
                if(type=='Fixed'){
                    this.addLocationFm.get('asset').setValidators([]);
                    this.addLocationFm.get('address').setValidators([Validators.required]);
                    this.util.mapInit(this.mapsAPILoader, this.searchElementRef, this.ngZone, this.addLocationFm.get('address'), [ null, null, null, null, null, this.addLocationFm.get('latitude'), this.addLocationFm.get('longitude') ]);
                }else{
                    this.addLocationFm.get('asset').setValidators([Validators.required]);
                    this.addLocationFm.get('address').setValidators([]);
                }
                this.addLocationFm.get('asset').setValue('');
                this.addLocationFm.get('address').setValue('');

                this.addLocationFm.get('asset').updateValueAndValidity();
                this.addLocationFm.get('address').updateValueAndValidity();
            });
        }catch(err){
            this.global.addException('Location','ngOnInit()', err);
        }    


        //var x = document.getElementsByTagName("form");


    }

    // mapInit(){
    //     try{
    //         //load Places Autocomplete
    //         this.mapsAPILoader.load().then(() => {
    //             let autocomplete = new google.maps.places.Autocomplete(this.searchElementRef.nativeElement, {
    //             //types: ["address"]
    //         });
    //             autocomplete.addListener("place_changed", () => {
    //                 this.ngZone.run(() => {
    //                 //get the place result
    //                 let place: google.maps.places.PlaceResult = autocomplete.getPlace();
    //                 //verify result
    //                 if (place.geometry === undefined || place.geometry === null) {
    //                     return;
    //                 }
    //                 //console.log(place.formatted_address);
    //                 this.addLocationFm.get('address').setValue(place.formatted_address);
    //                 console.log("Latitude : "+place.geometry.location.lat()+" Longitude : "+place.geometry.location.lng());
    //                 });
    //             });
    //         });
    //     }catch(err){
    //         this.global.addException('add location','mapInit()',err);
    //     }
    // }

    onChanges(): void{
        try{
            const divisionControl = this.divisions;
            divisionControl.valueChanges.forEach((value: any) => {
                this.submitted = false;
                for(let i = 0; i < value.length; i++){
                    if(value[i].divisionType == 'Numbered' && value[i].values.length > 1){
                        for (var j = 1; j < value[i].values.length; j++) {
                            this.removeValue(i, j);
                        }
                    }
                }
            });
        }catch(err){
            this.global.addException('Location','ngOnInit()', err);
        } 
    }

    // ===============   ASSET  =================== //
    getAssetList(){
        let self = this;
        try{
            this.http.doGet('assets', function(error: boolean, response: any){
                if( error ){ console.log(response) }else{
                    self.assetsList = response.data;
                    self.filteredAsset = self.asset_name.valueChanges.pipe(startWith(''),map(value => self.assetFilter(value)));
                }
            });
        }catch(err){
            this.global.addException('add location','getAssetList()',err);
        }
    }
    
    getSelectedAsset(event: any, asset): void { 
        if(event.isUserInput){
            console.log(asset);
            this.asset.setValue(asset.data.asset_id);
            this.selectedAsset.setValue(asset.data);
            //this.selectedAsset = asset.data;
        }
    }
    private assetFilter(value: string): string[] {
        try{
            return this.assetsList.filter(option => option.data.short_tag.toLowerCase().includes(value ? value.toLowerCase() : ''));
        }catch(err){
            this.global.addException('add location','assetFilter()',err);
        }
    }
    public validateAsset(event:any){
        try{
            let permission = event.target.value;
            let match = this.assetsList.filter(item=>item.data.short_tag.toLowerCase() == permission.toLowerCase());
            console.log(match);
            if(permission == ''){ 
                this.asset.setValue('');
                return;
            }
            if(match.length > 0){
                this.asset.setValue(match[0].data.asset_id);
                this.asset_name.setValue(match[0].data.short_tag);
            }
        }catch(err){
            this.global.addException('add location','validateAsset()',err);
        }
    }
    // ==============   END ASSET  =============== //

    getMinValue(group){
        group.get('max').value != '' ? group.get('max').value <= group.get('min').value ? group.get('max').setValue('') : '' : '';
        group.get('max').setValidators([Validators.required,Validators.max(99),Validators.min((group.get('min').value*1)+1),Validators.pattern(this.constant.ONLY_NUMBER)]);
        group.get('max').updateValueAndValidity();
        group.get('maxValidation').setValue(group.get('min').value);
    }

    setValidation(div:any){
        if(div.get('divisionType').value == 'Numbered'){
            div.get('values').at(0).get('min').setValidators(this.divMinValidators);
            div.get('values').at(0).get('max').setValidators(this.divMaxValidators);
            div.get('values').at(0).get('value').setValidators([]);

        }else{
            div.get('values').at(0).get('min').setValidators([]);
            div.get('values').at(0).get('max').setValidators([]);
            div.get('values').at(0).get('value').setValidators(this.divValValidators);
        }
        div.get('values').at(0).get('min').setValue('');
        div.get('values').at(0).get('max').setValue('');
        div.get('values').at(0).get('value').setValue('');

        div.get('values').at(0).get('min').updateValueAndValidity();
        div.get('values').at(0).get('max').updateValueAndValidity();
        div.get('values').at(0).get('value').updateValueAndValidity();
    }

    public createForm(option, locObj: any = {}){
        //locObj.locationType
        this.addLocationFm = this.fb.group({
            locationType: new FormControl(option == 1 ? locObj.locationType : 'Fixed'), 
            locationName: new FormControl(option == 1 ? locObj.locationName : '', [  
                Validators.required,
                Validators.minLength(2),
                Validators.maxLength(this.constant.DEFAULT_TEXT_MAXLENGTH)
                
                ]),
            shortForm: new FormControl(option == 1 ? locObj.shortForm : '', [  
                Validators.required,
                Validators.maxLength(6),
                Validators.pattern(this.constant.CODE39_WITHOUT_SPACE_PATTERN)
                ]),
            address: new FormControl(option == 1 ? locObj.address : '', option == 1 ? locObj.locationType == 'Fixed' ? [Validators.required] : [] :[Validators.required]),
            address2: new FormControl(option == 1 ? locObj.address2 : ''),
            latitude: new FormControl(option == 1 ? locObj.latitude : ''), 
            longitude: new FormControl(option == 1 ? locObj.longitude : ''),
            asset: new FormControl(option == 1 ? locObj.asset : '', option == 1 ? locObj.locationType == 'Fixed' ? [] : [Validators.required] : []),
            asset_name: new FormControl(option == 1 ? locObj.asset_name : '', option == 1 ? locObj.locationType == 'Fixed' ? [] : [Validators.required] : []),
            divisions: this.fb.array([]),
            selectedAsset: new FormControl(option == 1 ? locObj.selectedAsset : null) 
        });
        if(option == 1){
            for (let i = 0; i < locObj.divisions.length; i++) {
                this.addDivision(i, option, locObj.divisions[i]);
            }
        }
    }

    

    get locationType() { return this.addLocationFm.get('locationType'); }
    get locationName() { return this.addLocationFm.get('locationName'); }
    get shortForm() { return this.addLocationFm.get('shortForm'); }
    get address() { return this.addLocationFm.get('address'); } 
    get address2() { return this.addLocationFm.get('address2'); } 
    get asset() { return this.addLocationFm.get('asset'); }
    get asset_name() { return this.addLocationFm.get('asset_name'); }
    get selectedAsset() { return this.addLocationFm.get('selectedAsset'); }
    get divisions(): FormArray{ return <FormArray>this.addLocationFm.get('divisions') as FormArray; };
    values(index): FormArray { return <FormArray>this.divisions.at(index).get('values') as FormArray; };

    getDivisionAt(index){ return this.divisions.at(index) };
    getValuesAt(divIndx, valIndx){ return this.values(divIndx).at(valIndx) };

    addDivision(divIndx, option: number = 0, divObj: any = {}){
        this.submitted = false;
        try{
            this.divisions.push(this.fb.group({
                divisionName: new FormControl(option == 1 ? divObj.divisionName : '', [  
                    Validators.required,
                    Validators.maxLength(30)
                    ]),
                divisionType: new FormControl(option == 1 ? divObj.divisionType : 'Named'),
                values: this.fb.array([])
            }));
            if(option == 1){
                if(divObj.divisionType == 'Named'){
                    for (let i = 0; i < divObj.values.length; i++) {
                        this.addValue(divIndx, option, divObj.values[i], divObj.divisionType);
                    }
                }else{
                    this.addValue(divIndx, option, divObj.values[0], divObj.divisionType);
                }

            }else{
                this.addValue(divIndx);
            }
            setTimeout(() => this.setFocusOnDiv(divIndx), 500);
        }catch(err){
            this.global.addException('add location','addDivision()',err);
        }
    }

    setFocusOnDiv(index){
        let count: number = 0;
        this.divList.forEach(divInstance => {
            if(count == index)
                setTimeout(() => divInstance.nativeElement.focus(), 100);
            count++;
        });
    }

    setFocusOnDivValue(divIndx, valIndx){
        let count: number = 0;
        let valFieldIndx: number = 0;
        for (let i = 0; i <= divIndx; i++) {
            valFieldIndx += this.values(i).length - 1;
        }
        valFieldIndx = valFieldIndx + divIndx;
        this.valueList.forEach(valInstance => {
            if(count == valFieldIndx)
                setTimeout(() => valInstance.nativeElement.focus(), 100);
            count++;
        });
    }

    addValue(divIndx, option: number = 0, valObj: any = {}, divType: string = 'Named'){ 
        this.submitted = false;
        try{
            this.values(divIndx).push(new FormGroup({
                value: new FormControl(option == 1 ? valObj.value : '', option == 1 ?   divType == 'Named' ? this.divValValidators : [] : this.divValValidators),
                min: new FormControl(option == 1 ? valObj.min : '', option == 1 ?   divType == 'Named' ? [] : this.divMinValidators : []),
                max: new FormControl(option == 1 ? valObj.max : '', option == 1 ?   divType == 'Named' ? [] : this.divMaxValidators : []),
                minValidation: new FormControl(99),
                maxValidation: new FormControl(0), 
            })); 

            setTimeout(() => this.values(divIndx).length > 1 ? this.setFocusOnDivValue(divIndx, this.values(divIndx).length - 1) : '', 500);
        }catch(err){
            this.global.addException('add location','addValue()',err);
        }
    }

    removeDivision(divIndx){ this.divisions.removeAt(divIndx); }
    removeValue(divIndx, valIndx){ this.values(divIndx).removeAt(valIndx); }

    addLocation(form: FormGroup) {
        this.pageData.submitted = true;
        let self = this;
        this.submitted = true;
        console.log(form.valid);
        console.log(form.value);
        try{
            if(form.valid &&  this.pageData.tagFormAvailability == '0'){

                form.value.assetName = form.value.asset ? self.assetsList.filter(item => item.data.asset_id == form.value.asset)[0].data.short_tag : '';
                let newLocObj: any = JSON.parse(JSON.stringify(form.value));
                let reviewDiv: any = [];
                for (var i =0; i < newLocObj.divisions.length; i++) {
                    let divRow = [];
                    for (var j = 0; j < 2; j++) {
                        if(i < newLocObj.divisions.length){
                            newLocObj.divisions[i].id = i + 1;
                            divRow.push(newLocObj.divisions[i]);
                        }else{
                            break
                        }
                        if(j == 0){ i++; }
                    }
                    reviewDiv.push({ 'row' : divRow });
                }
                newLocObj.divListReview = reviewDiv;
                console.log("newLocObj=",newLocObj);
                sessionStorage.setItem('locationDetails', JSON.stringify(newLocObj)); 
                self.router.url.split('/')[2] == 'csa-onboarding' ? self.router.navigate(['/admin/csa-onboarding/location-review']) : self.router.navigate(['/admin/csa/location-review']);

            }
        }catch(err){
            this.global.addException('add location','addLocation()',err);
        }
    }

    cancelNewLocation(){
        sessionStorage.removeItem('locationDetails');
        this.router.url.split('/')[2]=='csa-onboarding' ? this.router.navigate(['/csa-onboarding/guide']) : this.router.navigate(['/admin/csa/location-list/0']);
    }

    validateTagForm(event: any) {
        let self = this;
        self.pageData.isError = false;
        if (!self.shortForm.valid && !self.shortForm.dirty) {
            return;
        }
        var reqObj = {
            "shortForm": this.shortForm.value
        }
        try {
            this.http.doPost('location/validate', reqObj, function (error: boolean, response: any) {
                //console.log(response);
                if (error) {
                    console.log(response.message);
                } else {
                    self.pageData.isError = true;
                    self.pageData.tagFormAvailability = response.data.is_available;
                    console.log(self.pageData.tagFormAvailability);
                }
            });
        }
        catch (err) {
            this.global.addException('tag form list', 'validateTagForm()', err);
        }
    }

}
