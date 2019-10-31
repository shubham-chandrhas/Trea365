import { Component, OnInit, ElementRef, NgZone, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { UtilService } from '../../../../shared/service/util.service';
import { HttpService } from '../../../../shared/service/http.service';
import { GlobalService } from '../../../../shared/service/global.service';
import { DispatchDashboardComponent } from '../dispatch-dashboard.component';

@Component({
  selector: 'app-dispatch-all',
  templateUrl: './dispatch-all.component.html',
  styleUrls: ['../../../workflow/project-estimator/quotation-generation/quotation-generation.component.css', './dispatch-all.component.css', '../../../workflow/project-estimator/quotation-list/quotation-list.component.css']
})
export class DispatchAllComponent implements OnInit {
	dispatchTab: string;
    pageData: any = {
        'columnType': 'A', 
        'sortColumn': 'id', 
        'sortOrder': 'DSC', 
    }

    latitude: number;
    longitude: number;
    zoom: number;
    mapTypeId: string;
    location: any;
    woList: any[] = [];
    staffList:any[] = [];
    showMap: boolean = false;
    selectedStaff: string;
    selectedWo: string;
    constructor(public router: Router,
        public util: UtilService,
        private route: ActivatedRoute,
        private http: HttpService,
        public dispatch: DispatchDashboardComponent,
        public global: GlobalService) { }

    ngOnInit() {
        this.util.setWindowHeight();
        this.util.setPageTitle(this.route);
        this.util.menuChange({'menu':9,'subMenu':0});
        this.getAllList();
        this.dispatch.selectedStaff = '0';
        this.dispatch.selectedWo = '0';
        //set google maps defaults
        //this.zoom = 5;
        this.mapTypeId = 'roadmap';
        this.showMap = true;
    }

    setMapType(mapTypeId: string) { this.mapTypeId = mapTypeId; }

    changeDispatchTab(tab,obj){
        this.dispatch.changeDispatchTab(tab);
       //console.log('Neha');
       this.dispatch.selectedWo = obj.work_order_id;
       this.dispatch.selectedStaff = obj.user_id;
        //console.log(obj.user_id);

    }

    getAllList() {
        let self = this;
        this.util.showProcessing('processing-spinner');
        try {
            this.http.doGet('getDispatch', function (error: boolean, response: any) {
                self.util.hideProcessing('processing-spinner');
                if (error) {
                   
                    console.log('error',response);
                }
                else {
                    self.woList = response.data.workOrders ? response.data.workOrders:[];
                    self.staffList = response.data.staff ? response.data.staff:[];
                    self.latitude = response.data.latitude;
                    self.longitude = response.data.longitude;
                    self.zoom = response.data.zoom;
                    self.dispatch.isWoDisableTab = (self.woList.length > 0) ? '0' : '0';
                    self.dispatch.isStaffDisableTab = (self.staffList.length > 0) ? '0' : '0';
                    console.log('woList',self.woList);
                    //self.selectedWoList = response.data.workOrders;

                    //self.constant.ITEM_COUNT = self.timesheetList.length;
                   // self.util.hideProcessing('processing-spinner');
                    //self.route.snapshot.paramMap.get('id') != '0' ? self.showTimesheetDetails() : '';
                }
            });
        }
        catch (err) {
            this.global.addException('work order list', 'getAllList()', err);
        }
    }

    
}
