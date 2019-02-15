import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssociaContaClienteComponent } from './associa-conta-cliente.component';

describe('AssociaContaClienteComponent', () => {
  let component: AssociaContaClienteComponent;
  let fixture: ComponentFixture<AssociaContaClienteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssociaContaClienteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssociaContaClienteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
