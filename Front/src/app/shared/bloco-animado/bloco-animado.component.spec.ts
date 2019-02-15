import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BlocoAnimadoComponent } from './bloco-animado.component';

describe('BlocoAnimadoComponent', () => {
  let component: BlocoAnimadoComponent;
  let fixture: ComponentFixture<BlocoAnimadoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BlocoAnimadoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BlocoAnimadoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
