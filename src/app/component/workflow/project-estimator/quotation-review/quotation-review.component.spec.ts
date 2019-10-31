import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QuotationReviewComponent } from './quotation-review.component';

describe('QuotationReviewComponent', () => {
  let component: QuotationReviewComponent;
  let fixture: ComponentFixture<QuotationReviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QuotationReviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuotationReviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
