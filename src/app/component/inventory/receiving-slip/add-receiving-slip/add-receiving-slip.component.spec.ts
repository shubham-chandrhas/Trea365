import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddReceivingSlipComponent } from './add-receiving-slip.component';

describe('AddReceivingSlipComponent', () => {
  let component: AddReceivingSlipComponent;
  let fixture: ComponentFixture<AddReceivingSlipComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddReceivingSlipComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddReceivingSlipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
