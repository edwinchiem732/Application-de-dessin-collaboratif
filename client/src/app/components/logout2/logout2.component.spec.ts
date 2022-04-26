/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { Logout2Component } from './logout2.component';

describe('Logout2Component', () => {
  let component: Logout2Component;
  let fixture: ComponentFixture<Logout2Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Logout2Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Logout2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
