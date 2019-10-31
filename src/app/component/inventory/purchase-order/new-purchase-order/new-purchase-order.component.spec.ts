import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NewPurchaseOrderComponent } from './new-purchase-order.component';

describe('NewPurchaseOrderComponent', () => {
  let component: NewPurchaseOrderComponent;
  let fixture: ComponentFixture<NewPurchaseOrderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewPurchaseOrderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewPurchaseOrderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
