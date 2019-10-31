
import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';

import { UtilService } from '../../../../shared/service/util.service';
import { HttpService } from '../../../../shared/service/http.service';
import { InventoryDialog } from '../../inventory-dialog.component';
import { DialogComponent } from '../../../../shared/model/dialog/dialog.component';
import { GlobalService } from '../../../../shared/service/global.service';

@Component({
  selector: 'app-material-review',
  templateUrl: './material-review.component.html',
  styleUrls: ['./material-review.component.css']
})
export class MaterialReviewComponent implements OnInit {

  isError: boolean = false;
  errMsg: string = '';
  materialInfo: any;
  currentURL: string;
  private routeObj: any;
  public totalQuantity: number = 0;
  public totalPrice: number = 0;

  constructor(
      public dialog: MatDialog,
      public util:UtilService,
      public router: Router,
      private route: ActivatedRoute,
      private http: HttpService,
      private global: GlobalService
  ) { }

  ngOnInit() {
      this.util.setWindowHeight();
      this.util.setPageTitle(this.route);
      this.currentURL = this.router.url.split('/')[this.router.url.split('/').length-1];
      this.currentURL == 'material-review' ? this.router.url.split('/')[2] == 'csa-onboarding' ? this.util.menuChange({'menu':'guide','subMenu':''}) : this.util.menuChange({'menu':3,'subMenu':34}) : '';
      this.router.url.split('/')[2] == 'csa-onboarding' ? this.routeObj = { 'list': '/csa-onboarding/guide', 'add': '/inventory/csa-onboarding/add-material' } : this.routeObj = { 'list': '/inventory/csa/material-list/0', 'add': '/inventory/csa/add-material' };
      this.materialInfo = JSON.parse(sessionStorage.getItem('materialInfo'));
      console.log("this.materialInfo",this.materialInfo);
      for(let i=0; i<this.materialInfo.requestData.material_location.length; i++){
        this.totalQuantity = this.totalQuantity + parseFloat(this.materialInfo.requestData.material_location[i].quantity);
        this.totalPrice = this.totalPrice + parseFloat(this.materialInfo.requestData.material_location[i].purchase_price);
      }
  }
    submitMaterial() {
        try {
            let self = this;
            let reqObj = JSON.parse(JSON.stringify(this.materialInfo.requestData));
            for (var i = 0; i < reqObj.material_location.length; ++i) {
                delete reqObj.material_location[i].location_name;
                //delete reqObj.material_location[i].location_id;
                delete reqObj.material_location[i].location_tag_name;
                delete reqObj.material_location[i].locationList;
                delete reqObj.material_location[i].locationTagList;
            }
            delete reqObj.supplier;
            // delete reqObj.manufacturer;
            // delete reqObj.manufacturerPart;
            delete reqObj.quantity_ordered;
            self.util.addSpinner('material-sub-btn', "Submit");
            this.http.doPost('invmaterial', reqObj, function (error: boolean, response: any) {
                self.util.removeSpinner('material-sub-btn', "Submit");
                if (error) {
                    self.isError = true;
                    self.errMsg = response.message;
                } else {
                    sessionStorage.removeItem('materialInfo');
                    self.currentURL == 'material-review' ? self.util.showDialog(DialogComponent, response.message, [self.routeObj.list, self.routeObj.add]) : self.onTheFlyEvent({ 'msg': 'New item (' + self.totalQuantity + ' items) succesfully added.' }, 'OTF_ADD_SUCCESS');
                }
            });
        } catch (err) {
            this.global.addException('Material review', 'submitMaterial()', err);
        }
    }

    editMaterial() {
        try {
            this.currentURL == 'material-review' ? this.router.navigate([this.routeObj.add]) : this.onTheFlyEvent({ 'step': 'S1' });
        } catch (err) {
            this.global.addException('Material review', 'editMaterial()', err);
        }
    }

    cancelMaterial() {
        try {
            sessionStorage.removeItem('materialInfo');
            this.currentURL == 'material-review' ? this.router.navigate([this.routeObj.list]) : this.onTheFlyEvent({ 'step': 'S0' });
        } catch (err) {
            this.global.addException('Material review', 'cancelMaterial()', err);
        }
    }

  onTheFlyEvent(data: any, source: string = 'ON_THE_FLY_MATERIAL'): void {
      this.util.changeEvent({
          'source': source, 
          'action': 'ADD',
          'data': data
      });
  }

}
