import { Component, OnInit, ElementRef, NgZone, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { UtilService } from '../../../../shared/service/util.service';
import { HttpService } from '../../../../shared/service/http.service';
import { GlobalService } from '../../../../shared/service/global.service';
import { ConstantsService } from '../../../../shared/service/constants.service';
import { DispatchDashboardComponent } from '../dispatch-dashboard.component';
@Component({
  selector: 'app-dispatch-staff',
  templateUrl: './dispatch-staff.component.html',
  styleUrls: ['./dispatch-staff.component.css','../../../workflow/project-estimator/quotation-generation/quotation-generation.component.css', '../dispatch-all/dispatch-all.component.css', '../../../workflow/project-estimator/quotation-list/quotation-list.component.css']
})
export class DispatchStaffComponent implements OnInit {

    dispatchTab: string;
    // pageData: any = {
    //     'columnType': 'A', 
    //     'sortColumn': 'id', 
    //     'sortOrder': 'DSC', 
    // }
    pageData: any = {'staffList':[], 'listCount': 0, 'sortColumn': 'id', 'sortColumnType': 'N', 'sortOrder': 'DSC', 'isError': false };
    

    latitude: number;
    longitude: number;
    zoom: number;
    mapTypeId: string;
    showMap: boolean = false;
    staffList: any[] = [];
    location: any;
    staffLocation: any;
    public selectedStaffList: any = null;
    //public selectedStaff: any = null;

    constructor(public router: Router,
        public util: UtilService,
        private route: ActivatedRoute,
        private http: HttpService,
        public global: GlobalService,
        private constant:ConstantsService,
        public dispatch: DispatchDashboardComponent
        ) { }

    ngOnInit() {
        this.util.setWindowHeight();
        this.util.setPageTitle(this.route);
        this.util.menuChange({'menu':9,'subMenu':0});
        this.getAllList();
        //this.pageData.paginationKey = { itemsPerPage: 5, currentPage: 1,PAGINATION_ITEMS: [5,10,15,20,25,50] };
        this.pageData.paginationKey = { itemsPerPage: this.constant.ITEMS_PER_PAGE, currentPage: this.constant.CURRENT_PAGE };
        //set google maps defaults
        this.zoom = 3;
        this.mapTypeId = 'roadmap';
        this.showMap = true;
    }

    setMapType(mapTypeId: string) { this.mapTypeId = mapTypeId; }
    updateCount(count){ this.constant.ITEM_COUNT = this.pageData.listCount = count ; }
    getSelectedStaff(staff, indx) {
        try{
        let self = this;
        self.selectedStaffList = staff;
       setTimeout(function() {
        self.util.scrollDown('DispatchD');
    }, 1000);
        }
        catch (err) {
            this.global.addException('Selectedstaff', 'getSelectedStaff()', err);
        }
    }

    getAllList() {
        let self = this;
        self.selectedStaffList ='';
        self.selectedStaffList = null;
        self.staffLocation = null;
        this.util.showProcessing('processing-spinner');
        try {
            this.http.doGet('getDispatch', function (error: boolean, response: any) {
                self.util.hideProcessing('processing-spinner');
                if (error) {
                    //console.log('Neha');
                    console.log('error',response);
                }
                else {
                    self.staffList = response.data.staff ? response.data.staff:[];
                    for (let i = 0; i < self.staffList.length; i++) {
                        self.staffList[i].woAddress = self.staffList[i].wo_address?self.staffList[i].wo_address:'';
                    }
                    self.latitude = response.data.latitude;
                    self.longitude = response.data.longitude;
                    self.zoom = response.data.zoom;
                    self.pageData.staff = response.data.staff;
                    if(self.dispatch.selectedStaff != '0'){
                        for (let index = 0; index < self.staffList.length; index++) {
                           if(self.dispatch.selectedStaff ==  self.staffList[index].user_id){
                            self.getSelectedStaff(self.staffList[index],index);
                            break;
                           }
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
