import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetReviewComponent } from './asset-review.component';

describe('AssetReviewComponent', () => {
  let component: AssetReviewComponent;
  let fixture: ComponentFixture<AssetReviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssetReviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssetReviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
