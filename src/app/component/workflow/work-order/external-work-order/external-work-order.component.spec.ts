import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExternalWorkOrderComponent } from './external-work-order.component';

describe('ExternalWorkOrderComponent', () => {
  let component: ExternalWorkOrderComponent;
  let fixture: ComponentFixture<ExternalWorkOrderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExternalWorkOrderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExternalWorkOrderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
