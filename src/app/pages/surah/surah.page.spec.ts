import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SurahPage } from './surah.page';

describe('SurahPage', () => {
  let component: SurahPage;
  let fixture: ComponentFixture<SurahPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(SurahPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
