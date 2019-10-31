import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SubContractorListComponent } from './sub-contractor-list.component';

describe('SubContractorListComponent', () => {
  let component: SubContractorListComponent;
  let fixture: ComponentFixture<SubContractorListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SubContractorListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SubContractorListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
