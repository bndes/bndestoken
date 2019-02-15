import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardResgatesLiquidacoesComponent } from './dashboard-resgates-liquidacoes.component';

describe('DashboardResgatesLiquidacoesComponent', () => {
  let component: DashboardResgatesLiquidacoesComponent;
  let fixture: ComponentFixture<DashboardResgatesLiquidacoesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DashboardResgatesLiquidacoesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardResgatesLiquidacoesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
