import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';

import { UtilService } from '../../../../shared/service/util.service';

@Component({
  selector: 'app-audit-report',
  templateUrl: './audit-report.component.html',
  styleUrls: ['./../audit-list/audit-list.component.css']
})
export class AuditReportComponent implements OnInit {
  public sortColumn: string = 'employee_id';
  constructor(
    public dialog: MatDialog,
		public util:UtilService,
    public router: Router,
    private route: ActivatedRoute,
  ) { }

  ngOnInit() {
    this.util.menuChange({'menu':3,'subMenu':24});
    this.util.setWindowHeight();
    this.util.setPageTitle(this.route);
    window.scrollTo(0, 0);
  }

}
