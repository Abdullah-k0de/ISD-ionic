import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ImageModalPage } from './image-modal.page';

describe('ImageModalPage', () => {
  let component: ImageModalPage;
  let fixture: ComponentFixture<ImageModalPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(ImageModalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
