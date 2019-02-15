import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MetamsgComponent } from './metamsg.component';

describe('MetamsgComponent', () => {
  let component: MetamsgComponent;
  let fixture: ComponentFixture<MetamsgComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MetamsgComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MetamsgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
