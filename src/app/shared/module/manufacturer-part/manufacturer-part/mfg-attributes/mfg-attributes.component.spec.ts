import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MfgAttributesComponent } from './mfg-attributes.component';

describe('MfgAttributesComponent', () => {
  let component: MfgAttributesComponent;
  let fixture: ComponentFixture<MfgAttributesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MfgAttributesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MfgAttributesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
