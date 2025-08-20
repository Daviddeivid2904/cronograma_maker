import { ScheduleData } from './types';

// Convertir tiempo "HH:MM" a minutos totales
export function timeStrToMinutes(time: string): number {
  const [hours, minutes] = String(time || '00:00').split(':').map(Number);
  return hours * 60 + (minutes || 0);
}

// Convertir minutos totales a "HH:MM"
export function minutesToLabel(minutes: number): string {
  const h = String(Math.floor(minutes / 60)).padStart(2, '0');
  const m = String(minutes % 60).padStart(2, '0');
  return `${h}:${m}`;
}

// Contraste de texto para un color de fondo (YIQ)
export function getTextColorForBg(hexColor: string): string {
  const hex = (hexColor || '').replace('#', '');
  if (!/^([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(hex)) return '#111111';
  const to255 = (s: string) => (s.length === 1 ? parseInt(s + s, 16) : parseInt(s, 16));
  const r = to255(hex.length === 3 ? hex[0] : hex.substring(0, 2));
  const g = to255(hex.length === 3 ? hex[1] : hex.substring(2, 4));
  const b = to255(hex.length === 3 ? hex[2] : hex.substring(4, 6));
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 150 ? '#111111' : '#ffffff';
}

// Construir slots de tiempo
export function buildTimeSlots(start: string, end: string, stepMin: number) {
  const startMin = timeStrToMinutes(start);
  const endMin = timeStrToMinutes(end);
  const slots = [];
  
  for (let time = startMin; time < endMin; time += stepMin) {
    slots.push({
      time,
      label: minutesToLabel(time)
    });
  }
  
  return slots;
}

// Calcular posición Y de un slot
export function getSlotY(slotIndex: number, slotHeight: number, marginTop: number): number {
  return marginTop + slotIndex * slotHeight;
}

// Calcular altura de un bloque
export function getBlockHeight(startTime: string, endTime: string, stepMin: number, slotHeight: number): number {
  const startMin = timeStrToMinutes(startTime);
  const endMin = timeStrToMinutes(endTime);
  const duration = endMin - startMin;
  const slots = duration / stepMin;
  return slots * slotHeight;
}

// Calcular posición Y de un bloque
export function getBlockY(startTime: string, gridStart: string, stepMin: number, slotHeight: number, marginTop: number): number {
  const startMin = timeStrToMinutes(startTime);
  const gridStartMin = timeStrToMinutes(gridStart);
  const diff = startMin - gridStartMin;
  const slotIndex = diff / stepMin;
  return getSlotY(slotIndex, slotHeight, marginTop);
}

// Tema de colores
export function getThemeColors(theme: 'light' | 'classic' | 'pastel' = 'light') {
  switch (theme) {
    case 'classic':
      return { background: '#ffffff', headerBg: '#f3f4f6', headerText: '#111827', grid: '#000000', text: '#111827' };
    case 'pastel':
      return { background: '#f0f9ff', headerBg: '#e0f2fe', headerText: '#0c4a6e', grid: '#0f172a', text: '#0c4a6e' };
    default:
      return { background: '#ffffff', headerBg: '#f9fafb', headerText: '#374151', grid: '#111111', text: '#111827' };
  }
}

// Eje inteligente: detectar rango y ticks
export function computeTimeAxis({
  items,
  start,
  end,
  tickStepMin = 60,
  subTickMin = 30,
  marginMin = 8,
}: {
  items: Array<{ start: string; end: string }>,
  start?: string,
  end?: string,
  tickStepMin?: number,
  subTickMin?: number | null,
  marginMin?: number,
}) {
  const starts = items.map(i => timeStrToMinutes(i.start));
  const ends = items.map(i => timeStrToMinutes(i.end));
  let minY = Math.min(...starts);
  let maxY = Math.max(...ends);
  if (start) minY = Math.min(minY, timeStrToMinutes(start));
  if (end) maxY = Math.max(maxY, timeStrToMinutes(end));
  minY = Math.max(0, minY - marginMin);
  maxY = Math.min(24 * 60, maxY + marginMin);

  // redondear min/max a múltiplos del subTick/tick
  const base = subTickMin || tickStepMin || 60;
  const roundDown = (v: number, step: number) => Math.floor(v / step) * step;
  const roundUp = (v: number, step: number) => Math.ceil(v / step) * step;
  minY = roundDown(minY, base);
  maxY = roundUp(maxY, base);

  // ticks mayores
  const major: number[] = [];
  for (let t = roundDown(minY, tickStepMin); t <= maxY; t += tickStepMin) major.push(t);

  // subticks opcionales
  const minor: number[] = [];
  if (subTickMin && subTickMin > 0) {
    for (let t = roundDown(minY, subTickMin); t <= maxY; t += subTickMin) {
      if (!major.includes(t)) minor.push(t);
    }
  }

  return { minY, maxY, major, minor };
}

// Truncar texto a máximo caracteres
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + "...";
}
