import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { MultiselectDropdownModule } from 'angular-2-dropdown-multiselect';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import { PipeModule } from '../../shared/module/pipe.module';
import { TextMaskModule } from 'angular2-text-mask';
import { FileDropModule } from 'ngx-file-drop';

import { MaterialModule } from '../../shared/module/material.module'; 

import { CSALandingComponent } from '../../component/dashboard/company-super-admin/landing.component';
import { CSAOnboardingComponent } from '../../component/onboarding/dashboard/landing.component';

import { EmployeeListComponent } from '../../component/hr/employee/employee-list/employee-list.component';
import { NewEmployeeComponent } from '../../component/hr/employee/new-employee/new-employee.component';
import { EmployeeReviewComponent } from '../../component/hr/employee/employee-review/employee-review.component';

@NgModule({
	imports: [ 
		CommonModule, 
		MaterialModule, 
		FormsModule, 
		ReactiveFormsModule, 
		RouterModule,

		NgxPaginationModule,
		PipeModule,
		MultiselectDropdownModule,
		TextMaskModule,
		FileDropModule 
	],
	declarations: [ CSALandingComponent, CSAOnboardingComponent, EmployeeListComponent, NewEmployeeComponent, EmployeeReviewComponent ],
	exports: [ CSALandingComponent, CSAOnboardingComponent, EmployeeListComponent, NewEmployeeComponent, EmployeeReviewComponent ]
})
export class TreaCommonModule { }
