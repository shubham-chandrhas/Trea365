import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule, MatInputModule, MatProgressSpinnerModule, MatCardModule, MatIconModule, NativeDateAdapter, DateAdapter, MAT_DATE_FORMATS } from '@angular/material';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material';
import { MatDialogModule } from '@angular/material/dialog';
import { MatAutocompleteModule } from '@angular/material/autocomplete';

export class AppDateAdapter extends NativeDateAdapter {
    format(date: Date, displayFormat: Object): string {
        if (displayFormat === 'input') {
            const day = date.getDate();
            const month = date.getMonth() + 1;
            const year = date.getFullYear();
            //return `${day}/${month}/${year}`;
            return `${year}/${month}/${day}`;
        } else {
            return date.toDateString();
        }
    }
}

const APP_DATE_FORMATS = {
    parse: {
        dateInput: {month: 'short', year: 'numeric', day: 'numeric'}
    },
    display: {
        // dateInput: { month: 'short', year: 'numeric', day: 'numeric' },
        dateInput: 'input',
        monthYearLabel: {year: 'numeric', month: 'short'},
        dateA11yLabel: {year: 'numeric', month: 'long', day: 'numeric'},
        monthYearA11yLabel: {year: 'numeric', month: 'long'},
    }
};

@NgModule({
  imports: [MatButtonModule, MatInputModule, MatProgressSpinnerModule, MatCardModule, MatIconModule,MatGridListModule,MatCheckboxModule, MatSelectModule, MatNativeDateModule, MatDatepickerModule, MatDialogModule, MatAutocompleteModule],
  exports: [MatButtonModule, MatInputModule, MatProgressSpinnerModule, MatCardModule, MatIconModule,MatGridListModule,MatCheckboxModule, MatSelectModule, MatNativeDateModule, MatDatepickerModule, MatDialogModule, MatAutocompleteModule],
  providers: [
        { provide: DateAdapter, useClass: AppDateAdapter },
        { provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS }
    ]
})
export class MaterialModule { }
//export class DatePickerModule { }


// https://github.com/angular/material2/issues/5577