import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardTransferenciasComponent } from './dashboard-transferencias.component';

describe('DashboardTransferenciasComponent', () => {
  let component: DashboardTransferenciasComponent;
  let fixture: ComponentFixture<DashboardTransferenciasComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DashboardTransferenciasComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardTransferenciasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
