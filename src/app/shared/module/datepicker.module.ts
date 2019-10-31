import { NgModule }  from '@angular/core';
import { MatDatepickerModule, MatNativeDateModule, NativeDateAdapter, DateAdapter, MAT_DATE_FORMATS  }  from '@angular/material';

export class AppDateAdapter extends NativeDateAdapter {
    format(date: Date, displayFormat: Object): string {
        if (displayFormat === 'input') {
            const day = date.getDate();
            const month = date.getMonth() + 1;
            const year = date.getFullYear();
            return `${day}/${month}/${year}`;
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
    declarations:  [ ],
    imports:  [ ],
        exports:  [ MatDatepickerModule, MatNativeDateModule ],
    providers: [
        {
            provide: DateAdapter, useClass: AppDateAdapter
        },
        {
            provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS
        }
    ]
})

export class DatePickerModule {}