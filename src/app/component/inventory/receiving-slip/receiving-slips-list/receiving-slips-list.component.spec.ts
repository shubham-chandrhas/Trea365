import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReceivingSlipsListComponent } from './receiving-slips-list.component';

describe('ReceivingSlipsListComponent', () => {
  let component: ReceivingSlipsListComponent;
  let fixture: ComponentFixture<ReceivingSlipsListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReceivingSlipsListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReceivingSlipsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
