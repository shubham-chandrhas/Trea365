import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SubContractorReviewComponent } from './sub-contractor-review.component';

describe('SubContractorReviewComponent', () => {
  let component: SubContractorReviewComponent;
  let fixture: ComponentFixture<SubContractorReviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SubContractorReviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SubContractorReviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
