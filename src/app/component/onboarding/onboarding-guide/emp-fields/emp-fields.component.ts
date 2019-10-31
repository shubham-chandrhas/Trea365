import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';

import { AdminService } from '../../../admin/admin.service';
import { OnboardingGuideDialogComponent } from '../onboarding-guide.component';
import { HttpService } from '../../../../shared/service/http.service';
import { UtilService } from '../../../../shared/service/util.service';

@Component({
    selector: 'app-emp-fields',
    templateUrl: './emp-fields.component.html',
    styleUrls: ['./emp-fields.component.css']
})

export class EmpFieldsComponent implements OnInit {
    fields: any[] = [];
    constructor(
        public dialog: MatDialog,
        public util:UtilService,
        public router: Router,
        private admin: AdminService,
        private http: HttpService,
        public route: ActivatedRoute
    ) { }

    ngOnInit(){
        let self = this;
        this.util.setWindowHeight();
        this.util.setPageTitle(this.route);
        this.util.menuChange({'menu':'guide','subMenu':''});
        this.getEmpFields();
        this.admin.newRecord.subscribe(status => {
            if(status){ 
                self.getEmpFields();
            }
        });  
    }

    getEmpFields(){
        let self = this;
        this.util.showProcessing('processing-spinner');
        this.http.doGet('extrafields?type=emp', function(error: boolean, response: any){
        self.util.hideProcessing('processing-spinner');
            if(error){}else{
                self.fields = response.data.additional_emp_fields ? response.data.additional_emp_fields : [];
            }
        });
    }

    addFields(){
        this.dialog.open(OnboardingGuideDialogComponent, { data: { 'action': 'addFields', 'fields': JSON.parse(JSON.stringify(this.fields)), 'fieldType': 'emp', 'msgHeader': 'Employee' } });
    }

    next(){
        sessionStorage.removeItem('emp');
        this.router.navigate(['/hr/csa-onboarding/new-employee'])
    }
}
