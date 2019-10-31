import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ScheduleReviewComponent } from './schedule-review.component';

describe('ScheduleReviewComponent', () => {
  let component: ScheduleReviewComponent;
  let fixture: ComponentFixture<ScheduleReviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ScheduleReviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScheduleReviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
