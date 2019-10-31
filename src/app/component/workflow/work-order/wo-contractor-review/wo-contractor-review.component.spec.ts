import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WoContractorReviewComponent } from './wo-contractor-review.component';

describe('WoContractorReviewComponent', () => {
  let component: WoContractorReviewComponent;
  let fixture: ComponentFixture<WoContractorReviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WoContractorReviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WoContractorReviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
