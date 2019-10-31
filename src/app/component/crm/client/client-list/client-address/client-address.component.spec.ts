import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientAddressComponent } from './client-address.component';

describe('ClientAddressComponent', () => {
  let component: ClientAddressComponent;
  let fixture: ComponentFixture<ClientAddressComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClientAddressComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClientAddressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
