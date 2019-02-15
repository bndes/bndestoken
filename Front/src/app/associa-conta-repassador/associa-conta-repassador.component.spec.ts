import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssociaContaRepassadorComponent } from './associa-conta-repassador.component';

describe('AssociaContaRepassadorComponent', () => {
  let component: AssociaContaRepassadorComponent;
  let fixture: ComponentFixture<AssociaContaRepassadorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssociaContaRepassadorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssociaContaRepassadorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
