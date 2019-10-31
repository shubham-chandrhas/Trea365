import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DispatchAllComponent } from './dispatch-all.component';

describe('DispatchAllComponent', () => {
  let component: DispatchAllComponent;
  let fixture: ComponentFixture<DispatchAllComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DispatchAllComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DispatchAllComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
