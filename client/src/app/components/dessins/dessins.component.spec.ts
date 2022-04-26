import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DessinsComponent } from './dessins.component';

describe('DessinsComponent', () => {
  let component: DessinsComponent;
  let fixture: ComponentFixture<DessinsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DessinsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DessinsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
