import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WoSetupComponent } from './wo-setup.component';

describe('WoSetupComponent', () => {
  let component: WoSetupComponent;
  let fixture: ComponentFixture<WoSetupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WoSetupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WoSetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
