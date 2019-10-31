import { Component, OnInit, ElementRef, NgZone, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { UtilService } from '../../../shared/service/util.service';

@Component({
  selector: 'app-dispatch-dashboard',
  templateUrl: './dispatch-dashboard.component.html',
  styleUrls: ['./dispatch-dashboard.component.css']
})
export class DispatchDashboardComponent implements OnInit {
    dispatchTab: string = 'all';
    isWoDisableTab: string = '1';
    isStaffDisableTab: string = '1';
    selectedStaff: string = '0';
    selectedWo: string = '0';
    constructor(
        public router: Router,
        public util: UtilService,
        private route: ActivatedRoute,
    ) { 
        
    }

  ngOnInit() {
    this.util.setWindowHeight();
    this.util.setPageTitle(this.route);
    this.util.menuChange({'menu':9,'subMenu':0});
    this.selectedStaff = '0';
    this.selectedWo = '0';
  }

   changeDispatchTab(tabName){ 
     this.dispatchTab = tabName;
     }
   // setMapType(mapTypeId: string) { this.mapTypeId = mapTypeId; }

}
