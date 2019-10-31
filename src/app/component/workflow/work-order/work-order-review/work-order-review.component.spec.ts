import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkOrderReviewComponent } from './work-order-review.component';

describe('WorkOrderReviewComponent', () => {
  let component: WorkOrderReviewComponent;
  let fixture: ComponentFixture<WorkOrderReviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkOrderReviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkOrderReviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
