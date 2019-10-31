import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';

import { LocationService } from './../location.service';
import { UtilService } from '../../../../shared/service/util.service';
import { AdminService } from '../../admin.service';
import { DialogComponent } from '../../../../shared/model/dialog/dialog.component';
import { GlobalService } from '../../../../shared/service/global.service';


@Component({
  selector: 'app-location-review',
  templateUrl: './location-review.component.html',
  styleUrls: ['./location-review.component.css']
})
export class LocationReviewComponent implements OnInit {
  public errMsg:string = '';
  public isError:boolean = false; 
  public locationObj;
   private routeObj: any;

  constructor(
    private router: Router,
    private util: UtilService, 
    public dialog: MatDialog, 
    private location: LocationService, 
    private admin: AdminService,
    private global: GlobalService
  ) { }

  ngOnInit() {
    this.util.setWindowHeight();
    try{
      if(this.router.url.split('/')[2]=='csa-onboarding'){
        this.util.menuChange({'menu':'guide','subMenu':''});
        this.routeObj = { 'list': '/csa-onboarding/guide', 'add': '/admin/csa-onboarding/add-location' }
      }else{
        this.util.menuChange({'menu':2,'subMenu':12});
        this.routeObj = { 'list': '/admin/csa/location-list/0', 'add': '/admin/csa/add-location' }
      }
      this.locationObj = JSON.parse(sessionStorage.getItem('locationDetails'));
      this.locationObj.tagSample = this.createTagSample(this.locationObj);
      console.log(JSON.stringify(this.locationObj));
    }catch(err){
      this.global.addException('location review','ngOnInit()',err);
    }
  }

  createTagSample(location){
    try{
      let nameArr = location.locationName.split(' '), tag: string = location.shortForm;
      for (var i = 0; i < location.divisions.length; i++) {
        if(location.divisions[i].divisionType == 'Named'){
          tag = tag +'-'+ location.divisions[i].values[0].value.toUpperCase();
        }else{
          tag = tag +'-'+ ('00'+location.divisions[i].values[0].min).substr(-2, 2);
        }
      }
      console.log(tag);
      return tag.toUpperCase();
    }catch(err){
      this.global.addException('location review','createTagSample()',err);
    }
  }

  saveLocation(){
    let self = this;
    try{
      let reqObj = JSON.parse(JSON.stringify(this.locationObj));
      console.log(JSON.stringify(reqObj));
      delete reqObj.divListReview;
      delete reqObj.assetName;
      let divisions: any = []
      for (let i = 0; i < reqObj.divisions.length; i++) {
        let divObj: any = {
          'divisionName' : reqObj.divisions[i].divisionName,
          'divisionType' : reqObj.divisions[i].divisionType,
          'divisionValue' : [],
          'min' : '',
          'max' : ''
        };

        if(reqObj.divisions[i].divisionType == 'Numbered'){
          divObj.min = reqObj.divisions[i].values[0].min;
          divObj.max = reqObj.divisions[i].values[0].max;
        }

        if(reqObj.divisions[i].divisionType == 'Named'){
          for (let j = 0; j < reqObj.divisions[i].values.length; j++) {
            divObj.divisionValue.push({ 'value' : reqObj.divisions[i].values[j].value });
          }
        }
        divisions.push(divObj);
      }
      reqObj.divisions = divisions.length == 0 ? [] : divisions;
      self.util.addSpinner('submit-btn', "Submit");
      this.location.addLocation(reqObj, function(error: boolean, response: any){
        self.util.removeSpinner('submit-btn', "Submit");
        if( error ){
          self.errMsg = response.message;
          self.isError = true;
        }else{
          sessionStorage.removeItem('locationDetails');
          self.util.showDialog(DialogComponent, response.message, [self.routeObj.list, self.routeObj.add]);
        }
      });
    }catch(err){
      this.global.addException('location review','saveLocation()',err);
    }

  }

  editLocation(){
    this.router.navigate([this.routeObj.add]);
  }

  cancelReviewLoc(){
    sessionStorage.removeItem('locationDetails');
    this.router.navigate([this.routeObj.list]);
  }
}
