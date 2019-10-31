import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DispatchWoComponent } from './dispatch-wo.component';

describe('DispatchWoComponent', () => {
  let component: DispatchWoComponent;
  let fixture: ComponentFixture<DispatchWoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DispatchWoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DispatchWoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
