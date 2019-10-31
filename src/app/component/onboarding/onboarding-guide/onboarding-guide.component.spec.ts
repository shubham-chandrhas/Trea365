import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OnboardingGuideComponent } from './onboarding-guide.component';

describe('OnboardingGuideComponent', () => {
  let component: OnboardingGuideComponent;
  let fixture: ComponentFixture<OnboardingGuideComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OnboardingGuideComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OnboardingGuideComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
