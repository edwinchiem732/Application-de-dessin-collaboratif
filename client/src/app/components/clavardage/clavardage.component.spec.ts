import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClavardageComponent } from './clavardage.component';

describe('ClavardageComponent', () => {
  let component: ClavardageComponent;
  let fixture: ComponentFixture<ClavardageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClavardageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ClavardageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
