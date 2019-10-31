import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import 'rxjs/add/operator/pairwise';
import 'rxjs/add/operator/filter';

import { UtilService } from '../../../shared/service/util.service';

@Component({
  selector: 'app-e404',
  templateUrl: './e404.component.html',
  styleUrls: ['./e404.component.css']
})
export class E404Component implements OnInit {
    constructor(private router: Router, private util: UtilService, public route:ActivatedRoute) { 

    }

    ngOnInit() {
      this.util.setPageTitle(this.route);
    	this.router.events
	        .filter(e => e.constructor.name === 'RoutesRecognized')
	        .pairwise()
	        .subscribe((e: any[]) => {
	      	this.util.previousRoute = e[0].urlAfterRedirects;
        });
    }

    goToBack(){
    	let route = JSON.parse(JSON.stringify(this.util.previousRoute));
    	this.util.previousRoute = "";
    	this.router.navigate([route == "" ? "" : route]);
    }

}
