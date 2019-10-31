import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LocationReviewComponent } from './location-review.component';

describe('LocationReviewComponent', () => {
  let component: LocationReviewComponent;
  let fixture: ComponentFixture<LocationReviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LocationReviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LocationReviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
