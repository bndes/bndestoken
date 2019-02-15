import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LiquidacaoResgateComponent } from './liquidacao-resgate.component';

describe('LiquidacaoResgateComponent', () => {
  let component: LiquidacaoResgateComponent;
  let fixture: ComponentFixture<LiquidacaoResgateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LiquidacaoResgateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LiquidacaoResgateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
