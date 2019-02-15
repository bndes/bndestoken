import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ValidacaoCadastroComponent } from './validacao-cadastro.component';

describe('ValidacaoCadastroComponent', () => {
  let component: ValidacaoCadastroComponent;
  let fixture: ComponentFixture<ValidacaoCadastroComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ValidacaoCadastroComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ValidacaoCadastroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
