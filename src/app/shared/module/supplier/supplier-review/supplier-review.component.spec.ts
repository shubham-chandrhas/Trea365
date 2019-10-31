import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SupplierReviewComponent } from './supplier-review.component';

describe('SupplierReviewComponent', () => {
  let component: SupplierReviewComponent;
  let fixture: ComponentFixture<SupplierReviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SupplierReviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SupplierReviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
