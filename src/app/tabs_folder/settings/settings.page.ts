import { Component } from '@angular/core';
import { ThemeService, ThemeConfig } from '../../services/theme.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage {

  constructor(public themeService: ThemeService) {}

  get currentMode(): 'dark' | 'light' {
    return this.themeService.mode;
  }

  get currentThemeId(): string {
    return this.themeService.themeId;
  }

  get themes(): ThemeConfig[] {
    return this.themeService.getThemeList();
  }

  switchMode(mode: 'dark' | 'light'): void {
    this.themeService.setMode(mode);
  }

  selectTheme(themeId: string): void {
    this.themeService.setTheme(themeId);
  }
}
