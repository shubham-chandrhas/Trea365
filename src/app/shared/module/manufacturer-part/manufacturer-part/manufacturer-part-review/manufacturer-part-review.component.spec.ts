import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManufacturerPartReviewComponent } from './manufacturer-part-review.component';

describe('ManufacturerPartReviewComponent', () => {
  let component: ManufacturerPartReviewComponent;
  let fixture: ComponentFixture<ManufacturerPartReviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManufacturerPartReviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManufacturerPartReviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
