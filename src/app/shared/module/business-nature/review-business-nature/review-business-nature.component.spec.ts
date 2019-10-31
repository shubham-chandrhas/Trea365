import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReviewBusinessNatureComponent } from './review-business-nature.component';

describe('ReviewBusinessNatureComponent', () => {
  let component: ReviewBusinessNatureComponent;
  let fixture: ComponentFixture<ReviewBusinessNatureComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReviewBusinessNatureComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReviewBusinessNatureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
