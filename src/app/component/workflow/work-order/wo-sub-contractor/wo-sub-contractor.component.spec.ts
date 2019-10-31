import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WoSubContractorComponent } from './wo-sub-contractor.component';

describe('WoSubContractorComponent', () => {
  let component: WoSubContractorComponent;
  let fixture: ComponentFixture<WoSubContractorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WoSubContractorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WoSubContractorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
