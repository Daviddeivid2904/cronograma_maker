// src/lib/time.js

// Días en español (orden estándar Lunes..Domingo)
export const DAYS = ['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'];

/**
 * Devuelve un arreglo de días desde startDay hasta endDay (incluidos),
 * avanzando hacia adelante y haciendo wrap si es necesario.
 */
export function computeDaysRange(startDay, endDay) {
  const startIdx = DAYS.indexOf(startDay);
  const endIdx   = DAYS.indexOf(endDay);
  if (startIdx === -1 || endIdx === -1) {
    throw new Error('Día inválido. Usa: ' + DAYS.join(', '));
  }
  const result = [];
  let i = startIdx;
  while (true) {
    result.push(DAYS[i]);
    if (i === endIdx) break;
    i = (i + 1) % DAYS.length;
  }
  return result;
}

/**
 * Construye los slots de tiempo entre start (incl) y end (excl) con paso en minutos.
 * Retorna { label: 'HH:MM', slotIndex: 1..N } (slotIndex es 1-based para CSS Grid).
 */
export function buildTimeSlots({ start = '07:00', end = '22:00', stepMin = 30 }) {
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  const startMin = sh * 60 + sm;
  const endMin   = eh * 60 + em;

  if (endMin <= startMin) throw new Error('El fin debe ser mayor que el inicio.');
  if (!Number.isFinite(stepMin) || stepMin <= 0) throw new Error('stepMin inválido.');

  const out = [];
  let i = 1; // grid-row es 1-based
  for (let m = startMin; m < endMin; m += stepMin) {
    const h  = String(Math.floor(m / 60)).padStart(2, '0');
    const mm = String(m % 60).padStart(2, '0');
    out.push({ label: `${h}:${mm}`, slotIndex: i });
    i += 1;
  }
  return out;
}

/** Formatea minutos totales a 'HH:MM' */
export function fmtTime(totalMinutes) {
  const h = String(Math.floor(totalMinutes / 60)).padStart(2, '0');
  const m = String(totalMinutes % 60).padStart(2, '0');
  return `${h}:${m}`;
}

/**
 * Convierte índices de slot a etiqueta "HH:MM–HH:MM"
 * startSlot es inclusivo, endSlotExclusive es exclusivo.
 */
export function slotIndexToLabel(start, stepMin, startSlot, endSlotExclusive) {
  const [sh, sm] = start.split(':').map(Number);
  const base     = sh * 60 + sm;
  const startMin = base + (startSlot - 1) * stepMin;
  const endMin   = base + (endSlotExclusive - 1) * stepMin;
  return `${fmtTime(startMin)}–${fmtTime(endMin)}`;
}

/**
 * Convierte una hora 'HH:MM' a un índice de slot (1-based) redondeando al slot más cercano
 * dentro del rango definido por {start, stepMin}. Si cae fuera, lo clamp-ea a [1..slotsLen].
 */
export function timeToSlotIndexRounded({ start = '07:00', stepMin = 30, time = '13:00', slotsLen = 30 }) {
  const [sh, sm] = start.split(':').map(Number);
  const [th, tm] = time.split(':').map(Number);
  const base = sh * 60 + sm;
  const tmin = th * 60 + tm;
  const diff = tmin - base;
  const approx = Math.round(diff / stepMin); // cantidad de pasos desde el comienzo
  const idx = approx + 1; // 1-based
  return Math.max(1, Math.min(slotsLen, idx));
}
