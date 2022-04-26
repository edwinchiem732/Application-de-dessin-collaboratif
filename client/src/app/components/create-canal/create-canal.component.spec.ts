import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateCanalComponent } from './create-canal.component';

describe('CreateCanalComponent', () => {
  let component: CreateCanalComponent;
  let fixture: ComponentFixture<CreateCanalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateCanalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateCanalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
