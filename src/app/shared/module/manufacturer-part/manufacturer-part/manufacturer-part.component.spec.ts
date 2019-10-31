import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManufacturerPartComponent } from './manufacturer-part.component';

describe('ManufacturerPartComponent', () => {
  let component: ManufacturerPartComponent;
  let fixture: ComponentFixture<ManufacturerPartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManufacturerPartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManufacturerPartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
