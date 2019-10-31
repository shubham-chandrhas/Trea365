import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WoQuotationReviewComponent } from './wo-quotation-review.component';

describe('WoQuotationReviewComponent', () => {
  let component: WoQuotationReviewComponent;
  let fixture: ComponentFixture<WoQuotationReviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WoQuotationReviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WoQuotationReviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
