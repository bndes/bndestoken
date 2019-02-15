import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssinadorComponent } from './assinador.component';

describe('AssinadorComponent', () => {
  let component: AssinadorComponent;
  let fixture: ComponentFixture<AssinadorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssinadorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssinadorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
