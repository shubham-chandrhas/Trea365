import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MaterialReviewComponent } from './material-review.component';

describe('MaterialReviewComponent', () => {
  let component: MaterialReviewComponent;
  let fixture: ComponentFixture<MaterialReviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MaterialReviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MaterialReviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
