import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EmpFieldsComponent } from './emp-fields.component';

describe('EmpFieldsComponent', () => {
  let component: EmpFieldsComponent;
  let fixture: ComponentFixture<EmpFieldsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EmpFieldsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmpFieldsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
