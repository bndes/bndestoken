import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RecuperaAcessoFornecedorComponent } from './recupera-acesso-fornecedor.component';

describe('RecuperaAcessoForncedorComponent', () => {
  let component: RecuperaAcessoFornecedorComponent;
  let fixture: ComponentFixture<RecuperaAcessoFornecedorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RecuperaAcessoFornecedorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RecuperaAcessoFornecedorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
