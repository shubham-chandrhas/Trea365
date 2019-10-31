import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PayablesComponent } from './payables.component';

describe('PayablesComponent', () => {
  let component: PayablesComponent;
  let fixture: ComponentFixture<PayablesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PayablesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PayablesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
