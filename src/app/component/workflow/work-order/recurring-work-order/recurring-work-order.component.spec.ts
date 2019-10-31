import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RecurringWorkOrderComponent } from './recurring-work-order.component';

describe('RecurringWorkOrderComponent', () => {
  let component: RecurringWorkOrderComponent;
  let fixture: ComponentFixture<RecurringWorkOrderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RecurringWorkOrderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RecurringWorkOrderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
