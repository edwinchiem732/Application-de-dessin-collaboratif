import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilterCanalComponent } from './filter-canal.component';

describe('FilterCanalComponent', () => {
  let component: FilterCanalComponent;
  let fixture: ComponentFixture<FilterCanalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FilterCanalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FilterCanalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
