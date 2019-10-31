import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AuditReportComponent } from './audit-report.component';

describe('AuditReportComponent', () => {
  let component: AuditReportComponent;
  let fixture: ComponentFixture<AuditReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AuditReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AuditReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
