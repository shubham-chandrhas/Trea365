import { ValidatorFn, FormGroup, ValidationErrors } from "@angular/forms";

export const scheduleRangeValidator: ValidatorFn = (
  control: FormGroup
): ValidationErrors | null => {
  const startDate = control.get('startDate');
  const endDate = control.get('endDate');
  

  if (new Date(startDate.value) > new Date(endDate.value)) {
    return  { 'invertedRange' : true } ;
  }
  
};