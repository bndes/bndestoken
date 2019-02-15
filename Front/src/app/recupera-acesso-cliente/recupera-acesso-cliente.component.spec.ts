import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RecuperaAcessoClienteComponent } from './recupera-acesso-cliente.component';

describe('RecuperaAcessoClienteComponent', () => {
  let component: RecuperaAcessoClienteComponent;
  let fixture: ComponentFixture<RecuperaAcessoClienteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RecuperaAcessoClienteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RecuperaAcessoClienteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
