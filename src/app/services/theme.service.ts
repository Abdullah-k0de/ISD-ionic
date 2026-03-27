import { Injectable } from '@angular/core';

export interface ThemeConfig {
  id: string;
  name: string;
  description: string;
  bg: string;
  bgGradient: string | null;
  accent: string;
  accentBright: string;
  accentDim: string;
  accentRgb: string;
  accentBrightRgb: string;
  marker: string;
  text: string;
  textMuted: string;
  textRgb: string;
  ringOpacity: string;
  glowIntensity: string;
}

// ---- Dark Themes ----
const DARK_THEMES: Record<string, ThemeConfig> = {
  gold: {
    id: 'gold', name: 'Refined Gold', description: 'The classic. Luxurious restraint.',
    bg: '#080808', bgGradient: null,
    accent: '#d4af37', accentBright: '#e8c252', accentDim: '#b8943a',
    accentRgb: '212, 175, 55', accentBrightRgb: '232, 194, 82',
    marker: '#c8d0d8', text: '#ffffff', textMuted: '#a0a0a0', textRgb: '255, 255, 255',
    ringOpacity: '1', glowIntensity: '1',
  },
  sakura: {
    id: 'sakura', name: 'Sakura Night', description: 'Soft pink under twilight sky.',
    bg: '#16101c', bgGradient: 'linear-gradient(180deg, #1a1228 0%, #16101c 40%, #201830 100%)',
    accent: '#ffb7c5', accentBright: '#ffd4df', accentDim: '#d4909e',
    accentRgb: '255, 183, 197', accentBrightRgb: '255, 212, 223',
    marker: '#ffc8d4', text: '#fff0f3', textMuted: '#c49aa8', textRgb: '255, 240, 243',
    ringOpacity: '1', glowIntensity: '1.3',
  },
  starlight: {
    id: 'starlight', name: 'Lunar Silk', description: 'Gold on silver with a blush of rose.',
    bg: '#0b0a10',
    bgGradient: 'radial-gradient(ellipse at 50% 36%, rgba(206, 214, 224, 0.1) 0%, rgba(172, 182, 197, 0.05) 38%, transparent 70%), radial-gradient(ellipse at 30% 82%, rgba(194, 202, 216, 0.07) 0%, transparent 54%), radial-gradient(ellipse at 70% 24%, rgba(214, 158, 168, 0.08) 0%, transparent 50%)',
    accent: '#cfa685', accentBright: '#e8c2a3', accentDim: '#9f7658',
    accentRgb: '207, 166, 133', accentBrightRgb: '232, 194, 163',
    marker: '#d5beb2', text: '#f1e5dc', textMuted: '#b9a296', textRgb: '241, 229, 220',
    ringOpacity: '1', glowIntensity: '1.35',
  },
  ember: {
    id: 'ember', name: 'Ember Glow', description: 'Crackling warmth. The comfort of firelight.',
    bg: '#110c08',
    bgGradient: 'radial-gradient(ellipse at 50% 100%, rgba(255, 100, 30, 0.25) 0%, rgba(180, 60, 10, 0.1) 40%, transparent 70%)',
    accent: '#ff9944', accentBright: '#ffbb66', accentDim: '#cc6622',
    accentRgb: '255, 153, 68', accentBrightRgb: '255, 187, 102',
    marker: '#ffaa55', text: '#fff4e8', textMuted: '#b88860', textRgb: '255, 244, 232',
    ringOpacity: '1', glowIntensity: '1.4',
  },
  rose: {
    id: 'rose', name: 'Rose Dawn', description: 'Warm rose. The soft blush of Fajr.',
    bg: '#0a0606',
    bgGradient: 'radial-gradient(ellipse at 50% 75%, rgba(120, 50, 55, 0.5) 0%, rgba(80, 35, 40, 0.25) 35%, transparent 65%), radial-gradient(ellipse at 35% 25%, rgba(100, 45, 50, 0.2) 0%, transparent 45%)',
    accent: '#f0a8a0', accentBright: '#ffd4cc', accentDim: '#d08878',
    accentRgb: '240, 168, 160', accentBrightRgb: '255, 212, 204',
    marker: '#c8d0d8', text: '#ffffff', textMuted: '#a0a0a0', textRgb: '255, 255, 255',
    ringOpacity: '1', glowIntensity: '1',
  },
  emerald: {
    id: 'emerald', name: 'Emerald Night', description: 'Traditional Islamic green. Sacred and spiritual.',
    bg: '#080a08',
    bgGradient: 'radial-gradient(ellipse at 50% 30%, rgba(30, 60, 35, 0.3) 0%, transparent 60%)',
    accent: '#88d498', accentBright: '#b0f0c0', accentDim: '#60a070',
    accentRgb: '136, 212, 152', accentBrightRgb: '176, 240, 192',
    marker: '#a0e0b0', text: '#ffffff', textMuted: '#90b898', textRgb: '255, 255, 255',
    ringOpacity: '1', glowIntensity: '1.5',
  },
  ocean: {
    id: 'ocean', name: 'Ocean Depth', description: 'Deep teal waters. Vast and meditative.',
    bg: '#080a0a',
    bgGradient: 'radial-gradient(ellipse at 50% 60%, rgba(25, 50, 50, 0.4) 0%, transparent 60%)',
    accent: '#7cb8b8', accentBright: '#a8d8d8', accentDim: '#5a8a8a',
    accentRgb: '124, 184, 184', accentBrightRgb: '168, 216, 216',
    marker: '#c8d0d8', text: '#ffffff', textMuted: '#a0a0a0', textRgb: '255, 255, 255',
    ringOpacity: '1', glowIntensity: '1',
  },
  twilight: {
    id: 'twilight', name: 'Twilight Sapphire', description: 'Deep midnight blue. Between Maghrib and Isha.',
    bg: '#080c14',
    bgGradient: 'radial-gradient(ellipse at 50% 0%, rgba(30, 50, 80, 0.4) 0%, transparent 60%)',
    accent: '#a8c5d9', accentBright: '#d4e5ef', accentDim: '#6a8fa8',
    accentRgb: '168, 197, 217', accentBrightRgb: '212, 229, 239',
    marker: '#c8d0d8', text: '#ffffff', textMuted: '#a0a0a0', textRgb: '255, 255, 255',
    ringOpacity: '1', glowIntensity: '1',
  },
  coral: {
    id: 'coral', name: 'Coral Reef', description: 'Deep sea and warmth. Where ocean meets sun.',
    bg: '#0a1018',
    bgGradient: 'radial-gradient(ellipse at 50% 40%, rgba(20, 40, 60, 0.5) 0%, transparent 60%), radial-gradient(ellipse at 30% 70%, rgba(15, 35, 55, 0.4) 0%, transparent 50%)',
    accent: '#e8a060', accentBright: '#f8c080', accentDim: '#c88848',
    accentRgb: '232, 160, 96', accentBrightRgb: '248, 192, 128',
    marker: '#c8d0d8', text: '#ffffff', textMuted: '#a0a0a0', textRgb: '255, 255, 255',
    ringOpacity: '1', glowIntensity: '1',
  },
  manuscript: {
    id: 'manuscript', name: 'Medina Ink', description: 'Deep burgundy. The tradition of sacred calligraphy.',
    bg: '#1a0810',
    bgGradient: 'radial-gradient(ellipse at 50% 40%, rgba(80, 20, 35, 0.5) 0%, transparent 60%), radial-gradient(ellipse at 70% 70%, rgba(60, 15, 28, 0.4) 0%, transparent 50%)',
    accent: '#f0a8b8', accentBright: '#ffd0dc', accentDim: '#d08898',
    accentRgb: '240, 168, 184', accentBrightRgb: '255, 208, 220',
    marker: '#c8d0d8', text: '#f5e8d0', textMuted: '#c0a888', textRgb: '245, 232, 208',
    ringOpacity: '1', glowIntensity: '1',
  },
};

// ---- Light Themes ----
const LIGHT_THEMES: Record<string, ThemeConfig> = {
  gold: {
    id: 'gold', name: 'Ottoman Crimson', description: 'Deep crimson with gold thread.',
    bg: '#2a1010',
    bgGradient: 'radial-gradient(ellipse at 50% 40%, rgba(160, 50, 50, 0.7) 0%, rgba(120, 30, 30, 0.4) 50%, transparent 80%), radial-gradient(ellipse at 30% 70%, rgba(140, 40, 40, 0.5) 0%, transparent 60%)',
    accent: '#f0c878', accentBright: '#ffe098', accentDim: '#d0a858',
    accentRgb: '240, 200, 120', accentBrightRgb: '255, 224, 152',
    marker: '#f0e8d0', text: '#fff8e8', textMuted: '#d0c090', textRgb: '255, 248, 232',
    ringOpacity: '2', glowIntensity: '1',
  },
  rose: {
    id: 'rose', name: 'Fajr Blush', description: 'Rose dawn with gold blessing.',
    bg: '#281418',
    bgGradient: 'radial-gradient(ellipse at 50% 30%, rgba(180, 80, 100, 0.6) 0%, rgba(140, 60, 80, 0.35) 50%, transparent 80%), radial-gradient(ellipse at 30% 70%, rgba(160, 70, 90, 0.5) 0%, transparent 60%)',
    accent: '#f8d898', accentBright: '#ffe8b0', accentDim: '#d8b878',
    accentRgb: '248, 216, 152', accentBrightRgb: '255, 232, 176',
    marker: '#f8e8c8', text: '#fff8e0', textMuted: '#d0b888', textRgb: '255, 248, 224',
    ringOpacity: '2', glowIntensity: '1',
  },
  emerald: {
    id: 'emerald', name: 'Cedar Forest', description: 'Deep forest with moonlit silver.',
    bg: '#101c14',
    bgGradient: 'radial-gradient(ellipse at 50% 40%, rgba(40, 90, 60, 0.7) 0%, rgba(25, 60, 40, 0.4) 50%, transparent 80%)',
    accent: '#d8e8e0', accentBright: '#e8f8f0', accentDim: '#b8c8c0',
    accentRgb: '216, 232, 224', accentBrightRgb: '232, 248, 240',
    marker: '#d0e8e0', text: '#f0fff8', textMuted: '#a0b8b0', textRgb: '240, 255, 248',
    ringOpacity: '2', glowIntensity: '1',
  },
  ocean: {
    id: 'ocean', name: 'Persian Tile', description: 'Turquoise depths with coral warmth.',
    bg: '#102428',
    bgGradient: 'radial-gradient(ellipse at 60% 40%, rgba(50, 140, 160, 0.6) 0%, rgba(30, 100, 120, 0.35) 50%, transparent 80%)',
    accent: '#f0a890', accentBright: '#ffc0a8', accentDim: '#d08870',
    accentRgb: '240, 168, 144', accentBrightRgb: '255, 192, 168',
    marker: '#f0e0d8', text: '#fff4ec', textMuted: '#d0a898', textRgb: '255, 244, 236',
    ringOpacity: '2', glowIntensity: '1',
  },
  twilight: {
    id: 'twilight', name: 'Iznik Cobalt', description: 'Deep cobalt with golden fire.',
    bg: '#101830',
    bgGradient: 'radial-gradient(ellipse at 50% 30%, rgba(60, 90, 180, 0.6) 0%, rgba(40, 60, 140, 0.35) 50%, transparent 80%)',
    accent: '#f0c878', accentBright: '#ffe098', accentDim: '#d0a858',
    accentRgb: '240, 200, 120', accentBrightRgb: '255, 224, 152',
    marker: '#f0e8d0', text: '#fffaec', textMuted: '#d0c090', textRgb: '255, 250, 236',
    ringOpacity: '2', glowIntensity: '1',
  },
  manuscript: {
    id: 'manuscript', name: 'Plum Manuscript', description: 'Rich plum with gold illumination.',
    bg: '#281020',
    bgGradient: 'radial-gradient(ellipse at 50% 40%, rgba(140, 60, 100, 0.6) 0%, rgba(100, 40, 70, 0.35) 50%, transparent 80%), radial-gradient(ellipse at 70% 70%, rgba(120, 50, 85, 0.5) 0%, transparent 60%)',
    accent: '#f8d8a0', accentBright: '#ffe8b8', accentDim: '#d8b880',
    accentRgb: '248, 216, 160', accentBrightRgb: '255, 232, 184',
    marker: '#f8e8c8', text: '#fff8e0', textMuted: '#d0c098', textRgb: '255, 248, 224',
    ringOpacity: '2', glowIntensity: '1',
  },
};

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private currentThemeId: string;
  private currentMode: 'dark' | 'light';

  constructor() {
    // Load saved settings
    const savedTheme = localStorage.getItem('azan-theme') || 'gold';
    const savedMode = (localStorage.getItem('azan-theme-mode') || 'dark') as 'dark' | 'light';

    this.currentThemeId = savedTheme;
    this.currentMode = savedMode;

    // Apply on startup
    this.applyTheme();
  }

  /** Get the currently active theme object */
  get activeTheme(): ThemeConfig {
    const pool = this.currentMode === 'light' ? LIGHT_THEMES : DARK_THEMES;
    return pool[this.currentThemeId] || pool['gold'] || DARK_THEMES['gold'];
  }

  get themeId(): string {
    return this.currentThemeId;
  }

  get mode(): 'dark' | 'light' {
    return this.currentMode;
  }

  /** Get all themes for the current mode */
  getThemeList(): ThemeConfig[] {
    const pool = this.currentMode === 'light' ? LIGHT_THEMES : DARK_THEMES;
    return Object.values(pool);
  }

  getDarkThemes(): ThemeConfig[] {
    return Object.values(DARK_THEMES);
  }

  getLightThemes(): ThemeConfig[] {
    return Object.values(LIGHT_THEMES);
  }

  /** Set the active theme by id */
  setTheme(themeId: string): void {
    const pool = this.currentMode === 'light' ? LIGHT_THEMES : DARK_THEMES;
    if (pool[themeId]) {
      this.currentThemeId = themeId;
      localStorage.setItem('azan-theme', themeId);
      this.applyTheme();
    }
  }

  /** Set dark or light mode */
  setMode(mode: 'dark' | 'light'): void {
    this.currentMode = mode;
    localStorage.setItem('azan-theme-mode', mode);

    // If current theme doesn't exist in new mode, fallback to first available
    const pool = mode === 'light' ? LIGHT_THEMES : DARK_THEMES;
    if (!pool[this.currentThemeId]) {
      this.currentThemeId = Object.keys(pool)[0];
      localStorage.setItem('azan-theme', this.currentThemeId);
    }

    this.applyTheme();
  }

  /** Toggle between dark and light mode */
  toggleMode(): void {
    this.setMode(this.currentMode === 'dark' ? 'light' : 'dark');
  }

  /** Apply the current theme to the document */
  private applyTheme(): void {
    const theme = this.activeTheme;
    const root = document.documentElement;

    // Extract RGB from bg hex for compositing
    const bgRgb = this.hexToRgb(theme.bg);

    // ---- Azan theme vars ----
    root.style.setProperty('--theme-bg', theme.bg);
    root.style.setProperty('--theme-bg-rgb', bgRgb);
    root.style.setProperty('--theme-bg-gradient', theme.bgGradient || 'none');
    root.style.setProperty('--theme-accent', theme.accent);
    root.style.setProperty('--theme-accent-bright', theme.accentBright);
    root.style.setProperty('--theme-accent-dim', theme.accentDim);
    root.style.setProperty('--theme-accent-rgb', theme.accentRgb);
    root.style.setProperty('--theme-accent-bright-rgb', theme.accentBrightRgb);
    root.style.setProperty('--theme-marker', theme.marker);
    root.style.setProperty('--theme-text', theme.text);
    root.style.setProperty('--theme-text-muted', theme.textMuted);
    root.style.setProperty('--theme-text-rgb', theme.textRgb);
    root.style.setProperty('--theme-ring-opacity', theme.ringOpacity);
    root.style.setProperty('--theme-glow-intensity', theme.glowIntensity);

    // ---- Map to Ionic CSS vars ----
    root.style.setProperty('--ion-background-color', theme.bg);
    root.style.setProperty('--ion-background-color-rgb', bgRgb);
    root.style.setProperty('--ion-text-color', theme.text);
    root.style.setProperty('--ion-text-color-rgb', theme.textRgb);

    root.style.setProperty('--ion-color-primary', theme.accent);
    root.style.setProperty('--ion-color-primary-rgb', theme.accentRgb);
    root.style.setProperty('--ion-color-primary-contrast', theme.bg);
    root.style.setProperty('--ion-color-primary-shade', theme.accentDim);
    root.style.setProperty('--ion-color-primary-tint', theme.accentBright);

    root.style.setProperty('--ion-toolbar-background', theme.bg);
    root.style.setProperty('--ion-toolbar-color', theme.text);
    root.style.setProperty('--ion-tab-bar-background', `rgba(${bgRgb}, 0.95)`);
    root.style.setProperty('--ion-tab-bar-color', theme.textMuted);
    root.style.setProperty('--ion-tab-bar-color-selected', theme.accent);

    root.style.setProperty('--ion-card-background', `rgba(${theme.textRgb}, 0.04)`);
    root.style.setProperty('--ion-item-background', `rgba(${theme.accentRgb}, 0.06)`);

    root.style.setProperty('--ion-border-color', `rgba(${theme.textRgb}, 0.08)`);

    // Update meta theme-color for mobile browsers
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.setAttribute('content', theme.bg);
    }
  }

  /** Convert hex color to RGB string */
  private hexToRgb(hex: string): string {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return '0, 0, 0';
    return `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`;
  }
}
