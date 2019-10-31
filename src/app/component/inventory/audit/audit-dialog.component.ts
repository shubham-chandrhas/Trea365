import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';

import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
    selector: '',
    templateUrl: './audit-dialog.component.html',
    styleUrls: ['./audit-dialog.component.css']
  })
  
export class AuditDialog{
    public action: string;

    constructor(
        private router: Router,
        public dialogRef: MatDialogRef<AuditDialog>, 
        @Inject(MAT_DIALOG_DATA) public dataObj: any, 
      ) {
          this.action = dataObj.action;
      }

      ngOnInit() {}


    closeDialog(): void {
        this.dialogRef.close();
    }
  }