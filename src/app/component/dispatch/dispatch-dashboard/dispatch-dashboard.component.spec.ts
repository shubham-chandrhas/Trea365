import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DispatchDashboardComponent } from './dispatch-dashboard.component';

describe('DispatchDashboardComponent', () => {
  let component: DispatchDashboardComponent;
  let fixture: ComponentFixture<DispatchDashboardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DispatchDashboardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DispatchDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
