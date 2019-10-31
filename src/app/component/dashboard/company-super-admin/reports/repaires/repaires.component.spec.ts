import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RepairesComponent } from './repaires.component';

describe('RepairesComponent', () => {
  let component: RepairesComponent;
  let fixture: ComponentFixture<RepairesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RepairesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RepairesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
