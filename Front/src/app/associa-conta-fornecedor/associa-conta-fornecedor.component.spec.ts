import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssociaContaFornecedorComponent } from './associa-conta-fornecedor.component';

describe('AssociaContaFornecedorComponent', () => {
  let component: AssociaContaFornecedorComponent;
  let fixture: ComponentFixture<AssociaContaFornecedorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssociaContaFornecedorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssociaContaFornecedorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
