import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangeRequestReviewChangesComponent } from './change-request-review-changes.component';

describe('ChangeRequestReviewChangesComponent', () => {
  let component: ChangeRequestReviewChangesComponent;
  let fixture: ComponentFixture<ChangeRequestReviewChangesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChangeRequestReviewChangesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChangeRequestReviewChangesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
