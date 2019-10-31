import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddTimelineScheduleComponent } from './add-timeline-schedule.component';

describe('AddScheduleComponent', () => {
  let component: AddTimelineScheduleComponent;
  let fixture: ComponentFixture<AddTimelineScheduleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddTimelineScheduleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddTimelineScheduleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
