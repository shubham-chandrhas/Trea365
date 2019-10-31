import { Component, OnInit, ElementRef, NgZone, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { HttpService } from '../../../../shared/service/http.service';
import { GlobalService } from '../../../../shared/service/global.service';
import { UtilService } from '../../../../shared/service/util.service';
import { ConstantsService } from '../../../../shared/service/constants.service';
import { DispatchDashboardComponent } from '../dispatch-dashboard.component';

@Component({
  selector: 'app-dispatch-wo',
  templateUrl: './dispatch-wo.component.html',
  styleUrls: ['./dispatch-wo.component.css', '../../../workflow/project-estimator/quotation-generation/quotation-generation.component.css', '../dispatch-all/dispatch-all.component.css', '../../../workflow/project-estimator/quotation-list/quotation-list.component.css']
})
export class DispatchWoComponent implements OnInit {

    dispatchTab: string;
    pageData: any = {'workOrders':[], 'listCount': 0, 'sortColumn': 'id', 'sortColumnType': 'N', 'sortOrder': 'DSC', 'isError': false };
    
    latitude: number;
    longitude: number;
    zoom: number;
    mapTypeId: string;
    showMap: boolean = false;
    woList: any=null;
    woListteam: any=null;
    location: any;
    woLocation: any;
    selectedWoList: any;
    public searchList;
    public searchTxt;
    public selectedStaffList: any = null;
   // public selectedWo: any = null;
    

    constructor(public router: Router,
        public util: UtilService,
        private route: ActivatedRoute,
        private http: HttpService,
        private constant:ConstantsService, 
        public dispatch: DispatchDashboardComponent, 
        public global: GlobalService) { }
       
    ngOnInit() {
        this.util.setWindowHeight();
        this.util.setPageTitle(this.route);
        this.util.menuChange({'menu':9,'subMenu':0});
        this.getAllList();
       // this.pageData.paginationKey = { itemsPerPage: 5, currentPage: 1,PAGINATION_ITEMS: [5,10,15,20,25,50] };
        this.pageData.paginationKey = { itemsPerPage: this.constant.ITEMS_PER_PAGE, currentPage: this.constant.CURRENT_PAGE };
        this.zoom = 3;
        this.mapTypeId = 'roadmap';
        this.showMap = true;
    }

    setMapType(mapTypeId: string) { this.mapTypeId = mapTypeId; }
    updateCount(count){ this.constant.ITEM_COUNT = this.pageData.listCount = count ; }
    getSelectedWo(workOrder, indx) {
        try{
            let self = this;
            self.selectedWoList = workOrder;
            console.log('selectedWoList',self.selectedWoList);
            // self.getAllList();
            setTimeout(function() {
                self.util.scrollDown('DispatchD');
            }, 1000);
        }
        catch (err) {
            this.global.addException('SelectedWo', 'getSelectedWo()', err);
        }
    }

    getAllList() {
        let self = this;
        self.selectedWoList ='';
        self.selectedWoList = null;
        self.woLocation = null;
        this.util.showProcessing('processing-spinner');
        try {
            this.http.doGet('getDispatch', function (error: boolean, response: any) {
                self.util.hideProcessing('processing-spinner');
                if (error) {
                    console.log('error',response);
                }
                else {
                    self.woList = response.data.workOrders ? response.data.workOrders:[];
                    self.latitude = response.data.latitude;
                    self.longitude = response.data.longitude;
                    self.zoom = response.data.zoom;
                    if(self.dispatch.selectedWo != '0'){
                        for (let index = 0; index < self.woList.length; index++) {
                            if(self.dispatch.selectedWo ==  self.woList[index].work_order_id){
                                self.getSelectedWo(self.woList[index],index);
                                break;
                            }
                            //self.selectedWo = self.woList[index];
                            
                        }
                    }
                    
                }
            });
        }
        catch (err) {
            this.global.addException('work order list', 'getAllList()', err);
        }
    }

}
