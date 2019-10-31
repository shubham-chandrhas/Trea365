import { Component, OnInit } from '@angular/core';

import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormControl, FormGroupDirective, NgForm, Validators, FormGroup, FormBuilder } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { GlobalService } from '../../../../shared/service/global.service';
import { ElementRef, NgZone, ViewChild } from '@angular/core';
import { } from 'googlemaps';
import { MapsAPILoader } from '@agm/core';

import { UtilService } from '../../../../shared/service/util.service';

import { ProjectEstimatorDialog } from '../project-estimator-dialog.component';
@Component({
  selector: 'app-client-selection',
  templateUrl: './client-selection.component.html',
  styleUrls: ['./client-selection.component.css']
})
export class ClientSelectionComponent implements OnInit {

	clientSelFm: FormGroup;
  public latitude: number;
  public longitude: number;
  public searchControl: FormControl;
  public zoom: number;
  public mapTypeId: string;

  @ViewChild("search")
  public searchElementRef: ElementRef;
  
  constructor(
  	private fb: FormBuilder,
		public dialog: MatDialog,
		public util:UtilService,
    public router: Router,
    private route: ActivatedRoute,
    private mapsAPILoader: MapsAPILoader,
    private ngZone: NgZone,
    private global: GlobalService
  ) { }

  ngOnInit() {
		this.util.menuChange({'menu':4,'subMenu':25});
  		this.createForm();
        this.onChanges();
        window.scrollTo(0, 0);

      //set google maps defaults
    this.zoom = 18;
    this.latitude = -79.40638519999999;
    this.longitude = 43.66798389999999;
    this.mapTypeId = 'roadmap';

    //create search FormControl
    this.searchControl = new FormControl();

    //set current position
    this.setCurrentPosition();
    this.util.setPageTitle(this.route);

    //load Places Autocomplete
    this.mapsAPILoader.load().then(() => {
      let autocomplete = new google.maps.places.Autocomplete(this.searchElementRef.nativeElement, {
        types: ["address"]
      });
      autocomplete.addListener("place_changed", () => {
        this.ngZone.run(() => {
          //get the place result
          let place: google.maps.places.PlaceResult = autocomplete.getPlace();

          //verify result
          if (place.geometry === undefined || place.geometry === null) {
            return;
          }

          //set latitude, longitude and zoom
          this.latitude = place.geometry.location.lat();
          this.longitude = place.geometry.location.lng();
          this.zoom = 18;
          this.mapTypeId = 'roadmap';

          console.log("Latitude : "+this.latitude+" Longitude : "+this.longitude);
        });
      });
    });
  	}

    setMapType(mapTypeId: string) {
        //this.map.setMapTypeId(mapTypeId) 

        //this.ngZone.run(() => {
          this.mapTypeId = mapTypeId;
        //}
    }

    private setCurrentPosition() {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition((position) => {
          //this.latitude = position.coords.latitude;
          //this.longitude = position.coords.longitude;

          this.latitude = 43.66798389999999;
          this.longitude = -79.40638519999999;
          this.zoom = 18;
          this.mapTypeId = 'roadmap';
        });
      }
    }

  	createForm(){
  		this.clientSelFm = this.fb.group({
        	workLocation: new FormControl('30 Walmar Road, Toronto, ON M5R 2W3', [ Validators.required ])
        });
  	};

  onChanges() {
    try {
      this.clientSelFm.get('workLocation').valueChanges.subscribe(location => {
        if (location == "New Work Location") {
          this.dialog.open(ProjectEstimatorDialog, { data: { 'action': 'addLocation' } });
          //this.dialog.open(ProjectEstimatorDialog, { data: { 'action': 'siteInspection' } });
        }
      });
    } catch(err){
      this.global.addException('clientSelection', 'onChanges()', err);
    }
  }

    get workLocation() { return this.clientSelFm.get('workLocation'); }
}
