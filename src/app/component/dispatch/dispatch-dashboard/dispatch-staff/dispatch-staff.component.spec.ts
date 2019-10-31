import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DispatchStaffComponent } from './dispatch-staff.component';

describe('DispatchStaffComponent', () => {
  let component: DispatchStaffComponent;
  let fixture: ComponentFixture<DispatchStaffComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DispatchStaffComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DispatchStaffComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
