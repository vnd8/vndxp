import { ThemeConfig, ThemePalette } from '../types';

export const THEMES: Record<ThemePalette, ThemeConfig> = {
  xp_blue: {
    id: 'xp_blue',
    name: 'Windows XP Luna Classic',
    nameAr: 'ويندوز XP لونا الأصلي (Classic Blue)',
    primary: '#0058e6',
    secondary: '#ffe09e',
    accent: '#3a83ee',
    titleBarGradient: 'linear-gradient(180deg, #0058e6 0%, #3a83ee 8%, #2062d8 40%, #1040ab 88%, #1952c4 93%, #3c82ed 100%)',
    taskbarGradient: 'linear-gradient(180deg, #245edb 0%, #3f8cf3 9%, #245edb 18%, #1941a5 92%, #1941a5 100%)',
    startButtonBg: 'linear-gradient(180deg, #388e3c 0%, #4caf50 15%, #2e7d32 85%, #1b5e20 100%)',
  },
  olive: {
    id: 'olive',
    name: 'Windows XP Olive Green',
    nameAr: 'ويندوز XP الأخضر الزيتوني (Olive Green)',
    primary: '#738855',
    secondary: '#e5e9c0',
    accent: '#8aa665',
    titleBarGradient: 'linear-gradient(180deg, #a4be7b 0%, #76954a 40%, #5d753b 100%)',
    taskbarGradient: 'linear-gradient(180deg, #819b5b 0%, #5d7438 100%)',
    startButtonBg: 'linear-gradient(180deg, #d38c35 0%, #b86e24 100%)',
  },
  silver: {
    id: 'silver',
    name: 'Windows XP Silver',
    nameAr: 'ويندوز XP الفضي الكلاسيكي (Silver)',
    primary: '#8c93a4',
    secondary: '#ffffff',
    accent: '#abb1c0',
    titleBarGradient: 'linear-gradient(180deg, #e4e6eb 0%, #c4c7d0 40%, #9ba0ab 100%)',
    taskbarGradient: 'linear-gradient(180deg, #bcc0cb 0%, #9aa0ae 100%)',
    startButtonBg: 'linear-gradient(180deg, #4285f4 0%, #2960bd 100%)',
  },
  burgundy: {
    id: 'burgundy',
    name: 'Royale Burgundy & Gold',
    nameAr: 'نبيذي فاخر وذهبي (#952f3c)',
    primary: '#952f3c',
    secondary: '#ffe09e',
    accent: '#fd9cbb',
    titleBarGradient: 'linear-gradient(180deg, #952f3c 0%, #80222f 12%, #681823 45%, #501018 88%, #78202d 100%)',
    taskbarGradient: 'linear-gradient(180deg, #741d28 0%, #5d151e 15%, #460e15 90%, #30080e 100%)',
    startButtonBg: 'linear-gradient(180deg, #ffe09e 0%, #f7d17e 15%, #d4a742 85%, #b58728 100%)',
  }
};
