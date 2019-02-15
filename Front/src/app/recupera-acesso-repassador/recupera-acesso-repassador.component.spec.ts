import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RecuperaAcessoRepassadorComponent } from './recupera-acesso-repassador.component';

describe('RecuperaAcessoRepassadorComponent', () => {
  let component: RecuperaAcessoRepassadorComponent;
  let fixture: ComponentFixture<RecuperaAcessoRepassadorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RecuperaAcessoRepassadorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RecuperaAcessoRepassadorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
