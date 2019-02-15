import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistroSaldoContasComponent } from './registro-saldo-contas.component';

describe('RegistroSaldoContasComponent', () => {
  let component: RegistroSaldoContasComponent;
  let fixture: ComponentFixture<RegistroSaldoContasComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RegistroSaldoContasComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegistroSaldoContasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
