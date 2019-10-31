import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditBusinessNatureComponent } from './edit-business-nature.component';

describe('EditBusinessNatureComponent', () => {
  let component: EditBusinessNatureComponent;
  let fixture: ComponentFixture<EditBusinessNatureComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditBusinessNatureComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditBusinessNatureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
