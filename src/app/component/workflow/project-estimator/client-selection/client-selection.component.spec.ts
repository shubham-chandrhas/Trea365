import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientSelectionComponent } from './client-selection.component';

describe('ClientSelectionComponent', () => {
  let component: ClientSelectionComponent;
  let fixture: ComponentFixture<ClientSelectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClientSelectionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClientSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
