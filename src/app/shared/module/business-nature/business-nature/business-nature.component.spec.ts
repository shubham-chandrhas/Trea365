import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BusinessNatureComponent } from './business-nature.component';

describe('BusinessNatureComponent', () => {
  let component: BusinessNatureComponent;
  let fixture: ComponentFixture<BusinessNatureComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BusinessNatureComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BusinessNatureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
