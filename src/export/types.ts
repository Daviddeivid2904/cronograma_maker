// src/export/types.ts

// TODOS los temas / decoraciones válidos
export type ThemeName =
  | 'classic'
  | 'light'
  | 'pastel'
  | 'none'
  | 'flowers'
  | 'medical'
  | 'science'
  | 'snoopy';

export type ScheduleItem = {
  dayIndex: number;    // 0..N-1
  start: string;       // "HH:MM"
  end: string;         // "HH:MM"
  title: string;
  subtitle?: string;
  teacher?: string;
  room?: string;
  color?: string;
  textColor?: string;
};

export type ScheduleData = {
  title?: string;
  subtitle?: string;
  days?: string[];     // ← opcional para no romper
  tickStepMin?: number;
  cellCap?: number;
  lunch?: { start: string; durationMin: number; label?: string } | null;
  items: ScheduleItem[];
};

// Props del componente principal del póster
export interface PosterProps {
  data: ScheduleData;
  width?: number;
  height?: number;
  theme?: ThemeName;
  showLegend?: boolean;
  watermark?: string;
}

// Opciones de exportación
export interface ExportOptions {
  width?: number;
  height?: number;
  theme?: ThemeName;
  showLegend?: boolean;
  watermark?: string;
}
