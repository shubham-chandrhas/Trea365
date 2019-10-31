import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TimelineScheduleReviewComponent } from './timeline-schedule-review.component';

describe('TimelineScheduleReviewComponent', () => {
  let component: TimelineScheduleReviewComponent;
  let fixture: ComponentFixture<TimelineScheduleReviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TimelineScheduleReviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TimelineScheduleReviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
