/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { Test_chatComponent } from './test_chat.component';

describe('Test_chatComponent', () => {
  let component: Test_chatComponent;
  let fixture: ComponentFixture<Test_chatComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Test_chatComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Test_chatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
