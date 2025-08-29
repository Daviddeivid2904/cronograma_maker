// src/export/utils.ts
import type { ThemeName } from './types';

export function getTextColorForBg(bg?: string): string {
  if (!bg) return '#111827';
  // luminancia simple
  const c = bg.replace('#', '');
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  const y = (r * 299 + g * 587 + b * 114) / 1000;
  return y >= 150 ? '#111827' : '#ffffff';
}

type ThemeColors = {
  headerBg: string;
  headerText: string;
  grid: string;
  border: string;
};

const THEMES_BASE: Record<'classic' | 'light' | 'pastel', ThemeColors> = {
  classic: { headerBg: '#f8fafc', headerText: '#0f172a', grid: '#cbd5e1', border: '#000000' },
  light:   { headerBg: '#f1f5f9', headerText: '#0f172a', grid: '#d1d5db', border: '#64748b' },
  pastel:  { headerBg: '#fdf2f8', headerText: '#1f2937', grid: '#e5e7eb', border: '#64748b' },
};

export function getThemeColors(theme?: ThemeName): ThemeColors {
  // decoraciones y 'none' usan la base 'light' por defecto (o ajustá como prefieras)
  if (!theme) return THEMES_BASE.light;
  if (theme === 'classic' || theme === 'light' || theme === 'pastel') {
    return THEMES_BASE[theme];
  }
  // flowers/medical/science/snoopy/none → base 'light'
  return THEMES_BASE.light;
}
