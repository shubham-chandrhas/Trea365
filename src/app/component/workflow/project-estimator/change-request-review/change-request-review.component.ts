import { Component, OnInit,Input } from '@angular/core';
import { HttpService } from '../../../../shared/service/http.service';
import { UtilService } from '../../../../shared/service/util.service';
import { ConstantsService } from '../../../../shared/service/constants.service';
import { GlobalService } from '../../../../shared/service/global.service';
import { ProjectEstimatorService } from '../../project-estimator/project-estimator.service';
import { Router, ActivatedRoute } from '@angular/router';
@Component({
    selector: 'app-change-request-review',
    templateUrl: './change-request-review.component.html',
    styleUrls: ['./change-request-review.component.scss']
})
export class ChangeRequestReviewComponent implements OnInit {

    @Input() selectedQuotation: any = '';
    @Input() versions :any ='';

    CRchecked:any[] = [];
    CRstatus:String = '';
    isError: boolean = false;
    errMsg: string = '';
    constructor(
        private http: HttpService,
        public util:UtilService,
        public constant:ConstantsService,
        private global: GlobalService,
        private PEService: ProjectEstimatorService,
        public router: Router,
        private route: ActivatedRoute,
    ) {

    }

    ngOnInit() {
        this.util.setPageTitle(this.route);
        this.selectedQuotation = sessionStorage.getItem('CrDetails') ? JSON.parse(sessionStorage.getItem('CrDetails')) : this.selectedQuotation;
        this.selectedQuotation.services.map(item => {
            item.fontColor = item.is_cr == '1' && (item.is_approved == '0' || item.is_approved == '2') ? 'change-request' : '';
        });
        this.selectedQuotation.product_materials.map(item => {
            item.fontColor = item.is_cr == '1' && (item.is_approved == '0' || item.is_approved == '2') ? 'change-request' : '';
        });
        console.log('Change Request....');
    }

    next(){
        //console.log(JSON.stringify(this.selectedQuotation));
        let count: number = 0;
        this.selectedQuotation.services.map(item => {
            if(item.is_cr == '1' && item.is_approved == '0'){ count++; };
        });
        this.selectedQuotation.product_materials.map(item => {
            if(item.is_cr == '1' && item.is_approved == '0'){ count++; };
        });
        if(count > 0){
            this.isError = true;
            this.errMsg = 'Please mark Approve/Reject all Service and Product/Material.';
        }else{
            sessionStorage.setItem('CrDetails', JSON.stringify(this.selectedQuotation));
            sessionStorage.setItem('versions', JSON.stringify(this.versions));
            this.router.navigate(['/workflow/quote/csa/change-request-review']);    
        }
    }

}

