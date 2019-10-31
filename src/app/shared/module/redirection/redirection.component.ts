import { Component, OnInit } from '@angular/core';

import { Router, ActivatedRoute } from '@angular/router';
import { UtilService } from '../../../shared/service/util.service';

@Component({
  selector: 'app-redirection',
  templateUrl: './redirection.component.html',
  styleUrls: ['./redirection.component.scss']
})
export class RedirectionComponent implements OnInit {

  constructor( public util: UtilService, private route: ActivatedRoute, public router: Router ) { 
  }

  ngOnInit() {
	  this.util.setWindowHeight();
	  this.util.setPageTitle(this.route); 
  	this.util.showProcessing('processing-spinner');

  	console.log(this.route.snapshot.paramMap.get('page'));
  	console.log(this.route.snapshot.paramMap.get('id'));
  	this.goToRespectivePage();
  }

  	goToRespectivePage(): void {
	  	let page = this.route.snapshot.paramMap.get('page'); 
	  	let id = this.route.snapshot.paramMap.get('id');
	  	switch (page) {
	  		case "crm":      // DONE
	  			sessionStorage.setItem('CLIENT_ID', id);
	  			this.router.navigate(['/crm/csa/client-list/'+id]);
	  			break;

	  		case "pe":      // DONE
	  			sessionStorage.setItem('PE_ID', id);
	  			this.router.navigate(['/workflow/quote/csa/quotation-list/'+id]);
	  			break;
	  		
	  		case "invoice": // DONE
	  			sessionStorage.setItem('INVOICE_ID', id);
	  			this.router.navigate(['/account/csa/invoice-list/'+id]);
	  			break;

	  		case "po":     // DONE
	  			sessionStorage.setItem('POID', id);
	  			this.router.navigate(['/inventory/po/csa/purchase-order-list/'+id]);
	  			break;

	  		case "wo":    // DONE
	  			sessionStorage.setItem('WO_ID', id);
	  			this.router.navigate(['/workflow/wo/csa/work-order-list/'+id]);
	  			break;	

	  		case "supplier": // DONE
	  			sessionStorage.setItem('SUPPLIER_ID', id);
	  			this.router.navigate(['/admin/csa/supplier-list/'+id]);
					break;
					
	  		case "asset":    // DONE
	  			sessionStorage.setItem('ASSET_ID', id);
	  			this.router.navigate(['/inventory/csa/asset-list/'+id]);
					break;
						  				
	  		case "product": //  DONE 
	  			sessionStorage.setItem('PRODUCT_ID', id);
	  			this.router.navigate(['/inventory/csa/product-list/'+id]);
	  			break;
	  			
	  		case "material": // DONE
	  			sessionStorage.setItem('MATERIAL_ID', id);
	  			this.router.navigate(['/inventory/csa/material-list/'+id]);
	  			break;
	  			
			case "maintenance": // DONE
				sessionStorage.setItem('MAINTENANCE_ID', id);
				this.router.navigate(['/inventory/csa/maintenance-list/'+id]);
				break;

	  		case "schedule":  // DONE
	  			sessionStorage.setItem('SCHEDULE_ID', id);
	  			this.router.navigate(['/workflow/schedule/csa/schedule-list/'+id]);
	  			break;	

	  		case "rs":     //  DONE
	  			sessionStorage.setItem('RS_ID', id);
	  			this.router.navigate(['/inventory/rs/csa/receiving-slips-list/'+id]);
	  			break;	
	  						
	  		default:
	  			// code...
	  			break;
	  	}
  	}

}


@Component({
  	selector: 'app-maintenance',
  	templateUrl: './maintenance.component.html',
  	styleUrls: ['./redirection.component.scss']
})
export class MaintenanceComponent implements OnInit {
	message: string;
  	constructor( public util: UtilService, private route: ActivatedRoute, public router: Router ) { 
  	}

  	ngOnInit() {
  		this.util.setWindowHeight();
  		//this.util.showProcessing('processing-spinner');
  		//console.log(atob(this.route.snapshot.paramMap.get('msg')));
  		this.message = atob(this.route.snapshot.paramMap.get('msg'));
  	}

  	

}