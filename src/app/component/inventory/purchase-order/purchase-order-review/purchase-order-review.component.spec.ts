import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchaseOrderReviewComponent } from './purchase-order-review.component';

describe('PurchaseOrderReviewComponent', () => {
  let component: PurchaseOrderReviewComponent;
  let fixture: ComponentFixture<PurchaseOrderReviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PurchaseOrderReviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PurchaseOrderReviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
