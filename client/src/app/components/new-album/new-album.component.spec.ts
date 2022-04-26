import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewAlbumComponent } from './new-album.component';

describe('NewAlbumComponent', () => {
  let component: NewAlbumComponent;
  let fixture: ComponentFixture<NewAlbumComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NewAlbumComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NewAlbumComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
