import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardIdEmpresaComponent } from './dashboard-id-empresa.component';

describe('DashboardIdEmpresaComponent', () => {
  let component: DashboardIdEmpresaComponent;
  let fixture: ComponentFixture<DashboardIdEmpresaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DashboardIdEmpresaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardIdEmpresaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
