// src/export/timeGrid.ts
// Construcción de grilla temporal y helpers, con compatibilidad hacia atrás,
// soporte buildTimeGrid(items) y opciones extra usadas por SchedulePoster.tsx.
//
// Cambios clave:
// - Exporta gcdArray.
// - buildTimeGrid acepta opciones: minQuantum, maxQuantum, cellCap, padTopMin, padBottomMin.
// - Inferencia de ventana respeta pads superior/inferior.

export type Item = { start: string; end: string };

export type TimeGrid = {
  startMin: number;      // ej. 7*60
  endMin: number;        // ej. 19*60
  quantumMin: number;    // paso real detectado (GCD de duraciones / alineaciones)
  majorTickMin: number;  // paso de renglón “grueso” (coincide con quantum si >=30; si no, 60)
};

// ---------- Conversión HH:MM ----------
export function toMin(hhmm: string): number {
  const [h, m] = String(hhmm || "00:00").split(":").map(Number);
  return h * 60 + (m || 0);
}

export function toHHMM(min: number): string {
  const M = ((min % (24 * 60)) + (24 * 60)) % (24 * 60);
  const h = Math.floor(M / 60);
  const m = M % 60;
  const pad = (x: number) => String(x).padStart(2, "0");
  return `${pad(h)}:${pad(m)}`;
}

// ---------- Aritmética ----------
function gcd(a: number, b: number): number {
  a = Math.abs(a); b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a || 0;
}

// ✅ Exportado (SchedulePoster.tsx lo importa)
export function gcdArray(arr: number[]): number {
  if (!arr.length) return 0;
  return arr.reduce((g, v) => gcd(g, Math.round(v)));
}

function roundDown(v: number, step: number): number {
  return Math.floor(v / step) * step;
}
function roundUp(v: number, step: number): number {
  return Math.ceil(v / step) * step;
}

// ---------- Paso y ventana a partir de items ----------
function inferStepFromItems(items: Item[]): number {
  const starts: number[] = [];
  const durations: number[] = [];
  for (const it of items) {
    const s = toMin(it.start);
    const e = toMin(it.end);
    if (Number.isFinite(s) && Number.isFinite(e)) {
      starts.push(s);
      const d = e - s;
      if (d > 0) durations.push(d);
    }
  }
  const g = gcdArray([...starts, ...durations]);
  return g >= 30 ? g : 60; // regla: si <30 → 60
}

function inferWindowFromItems(
  items: Item[],
  opts?: { paddingMin?: number; padTopMin?: number; padBottomMin?: number }
): { minVisibleMin: number; maxVisibleMin: number } {
  let minS = Number.POSITIVE_INFINITY;
  let maxE = 0;
  for (const it of items) {
    const s = toMin(it.start);
    const e = toMin(it.end);
    if (Number.isFinite(s)) minS = Math.min(minS, s);
    if (Number.isFinite(e)) maxE = Math.max(maxE, e);
  }
  if (!Number.isFinite(minS)) minS = 9 * 60;  // fallback razonable
  if (!Number.isFinite(maxE) || maxE <= minS) maxE = minS + 8 * 60;

  const padTop = Math.max(0, Math.round(opts?.padTopMin ?? opts?.paddingMin ?? 0));
  const padBottom = Math.max(0, Math.round(opts?.padBottomMin ?? opts?.paddingMin ?? 0));

  return {
    minVisibleMin: Math.max(0, minS - padTop),
    maxVisibleMin: Math.min(24 * 60, maxE + padBottom),
  };
}

// ---------- Tipos de opciones ----------
type ItemsOpts = {
  paddingMin?: number;      // padding simétrico (fallback)
  padTopMin?: number;       // padding superior
  padBottomMin?: number;    // padding inferior
  minVisibleMin?: number;
  maxVisibleMin?: number;
  tickStepMin?: number;
  /** Paso mínimo deseado; si tickStepMin es menor, se eleva a este mínimo. */
  minQuantum?: number;
  /** Paso máximo deseado; si tickStepMin es mayor, se baja a este máximo. */
  maxQuantum?: number;
  /** Límite opcional de celdas/segmentos (no lo usamos aquí, pero se acepta). */
  cellCap?: number;
};

type DirectOpts = {
  minVisibleMin: number;
  maxVisibleMin: number;
  tickStepMin?: number;
  minQuantum?: number;
  maxQuantum?: number;
  // no hace falta padTop/padBottom aquí (se supone que ya vienen fijos)
  cellCap?: number;
};

// ---------- Grid principal ----------
//
// Formatos aceptados:
//   A) buildTimeGrid(items: Item[]): TimeGrid
//   B) buildTimeGrid(items: Item[], opts?: ItemsOpts): TimeGrid
//   C) buildTimeGrid(opts: DirectOpts): TimeGrid
//   D) buildTimeGrid(minVisibleMin: number, maxVisibleMin: number): TimeGrid
//   E) buildTimeGrid(minVisibleMin: number, maxVisibleMin: number, tickStepMin: number): TimeGrid
//
export function buildTimeGrid(
  a: Item[] | DirectOpts | number,
  b?: ItemsOpts | number,
  c?: number
): TimeGrid {
  let minVisibleMin: number;
  let maxVisibleMin: number;
  let tickStepMin: number;
  let minQuantum: number | undefined;
  let maxQuantum: number | undefined;

  if (Array.isArray(a)) {
    // Caso A/B: items + (opts?)
    const items = a as Item[];
    const opts = (typeof b === "object" && b !== null ? b : {}) as ItemsOpts;

    const inferredStep = inferStepFromItems(items);
    tickStepMin = opts.tickStepMin ?? inferredStep;
    minQuantum = opts.minQuantum;
    maxQuantum = opts.maxQuantum;

    if (typeof opts.minVisibleMin === "number" && typeof opts.maxVisibleMin === "number") {
      minVisibleMin = opts.minVisibleMin;
      maxVisibleMin = opts.maxVisibleMin;
    } else {
      const { minVisibleMin: mn, maxVisibleMin: mx } = inferWindowFromItems(items, {
        paddingMin: opts.paddingMin,
        padTopMin: opts.padTopMin,
        padBottomMin: opts.padBottomMin,
      });
      minVisibleMin = mn;
      maxVisibleMin = mx;
    }
  } else if (typeof a === "object" && a !== null) {
    // Caso C: objeto directo
    const opts = a as DirectOpts;
    minVisibleMin = opts.minVisibleMin;
    maxVisibleMin = opts.maxVisibleMin;
    tickStepMin = opts.tickStepMin ?? 60;
    minQuantum = opts.minQuantum;
    maxQuantum = opts.maxQuantum;
  } else {
    // Caso D/E: números legacy
    minVisibleMin = a as number;
    maxVisibleMin = (b as number) ?? (a as number) + 60;
    tickStepMin = c ?? 60;
    minQuantum = undefined;
    maxQuantum = undefined;
  }

  // Aplicar min/maxQuantum si vienen
  const rawCandidate = Math.max(5, Math.round(tickStepMin || 60));
  const enforcedMin = typeof minQuantum === "number" ? Math.max(5, Math.round(minQuantum)) : 0;
  const enforcedMax = typeof maxQuantum === "number" ? Math.max(5, Math.round(maxQuantum)) : Infinity;
  const raw = Math.min(Math.max(rawCandidate, enforcedMin), enforcedMax);

  // Regla final del mayor (grilla visible): si <30 → 60
  const major = raw >= 30 ? raw : 60;

  const startMin = roundDown(minVisibleMin, major);
  const endMin = roundUp(maxVisibleMin, major);

  return { startMin, endMin, quantumMin: raw, majorTickMin: major };
}

// ---------- Ticks ----------
//
// NUEVO (preferido):
//   generateMajorTicks(grid: TimeGrid)
//
// LEGACY (compat):
//   generateMajorTicks(grid: TimeGrid, /*cualquier segundo arg*/)
//
// El segundo argumento (si existe) se ignora para mantener compatibilidad.
//
export function generateMajorTicks(grid: TimeGrid, _legacyArg?: unknown): number[] {
  const out: number[] = [];
  const step = grid.majorTickMin;
  const first = roundUp(grid.startMin, step);
  for (let t = first; t <= grid.endMin; t += step) out.push(t);
  return out;
}

// NUEVO:
//   generateSubTicks(grid: TimeGrid)
//
// LEGACY (compat):
//   generateSubTicks(grid: TimeGrid, /*cualquier segundo arg*/)
//
// El segundo argumento (si existe) se ignora.
//
export function generateSubTicks(grid: TimeGrid, _legacyArg?: unknown): number[] {
  const major = grid.majorTickMin;
  const divisors = [6, 5, 3, 2];
  let sub = 0;
  for (const d of divisors) {
    if (major % d === 0) { sub = major / d; break; }
  }
  if (!sub || sub < 10) return [];

  const res: number[] = [];
  const first = roundUp(grid.startMin, sub);
  for (let t = first; t <= grid.endMin; t += sub) {
    if ((t - grid.startMin) % major !== 0) res.push(t); // evitar duplicar donde ya hay mayor
  }
  return res;
}
