import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RoleReviewComponent } from './role-review.component';

describe('RoleReviewComponent', () => {
  let component: RoleReviewComponent;
  let fixture: ComponentFixture<RoleReviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RoleReviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RoleReviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
