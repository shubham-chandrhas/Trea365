import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReceivablesComponent } from './receivables.component';

describe('ReceivablesComponent', () => {
  let component: ReceivablesComponent;
  let fixture: ComponentFixture<ReceivablesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReceivablesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReceivablesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
