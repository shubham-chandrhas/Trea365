import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddManufacturerPartComponent } from './add-manufacturer-part.component';

describe('AddManufacturerPartComponent', () => {
  let component: AddManufacturerPartComponent;
  let fixture: ComponentFixture<AddManufacturerPartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddManufacturerPartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddManufacturerPartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
