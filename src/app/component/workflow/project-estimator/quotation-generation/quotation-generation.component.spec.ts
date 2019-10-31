import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QuotationGenerationComponent } from './quotation-generation.component';

describe('QuotationGenerationComponent', () => {
  let component: QuotationGenerationComponent;
  let fixture: ComponentFixture<QuotationGenerationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QuotationGenerationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuotationGenerationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
