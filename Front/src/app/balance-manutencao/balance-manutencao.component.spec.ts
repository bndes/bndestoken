import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BalanceManutencaoComponent } from './balance-manutencao.component';

describe('BalanceManutencaoComponent', () => {
  let component: BalanceManutencaoComponent;
  let fixture: ComponentFixture<BalanceManutencaoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BalanceManutencaoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BalanceManutencaoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
