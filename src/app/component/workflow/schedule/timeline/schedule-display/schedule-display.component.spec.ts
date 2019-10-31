import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ScheduleDisplayComponent } from './schedule-display.component';

describe('ScheduleDisplayComponent', () => {
  let component: ScheduleDisplayComponent;
  let fixture: ComponentFixture<ScheduleDisplayComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ScheduleDisplayComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScheduleDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
