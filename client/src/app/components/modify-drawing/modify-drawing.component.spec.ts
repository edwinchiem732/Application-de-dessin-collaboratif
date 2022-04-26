import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModifyDrawingComponent } from './modify-drawing.component';

describe('ModifyDrawingComponent', () => {
  let component: ModifyDrawingComponent;
  let fixture: ComponentFixture<ModifyDrawingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModifyDrawingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModifyDrawingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
