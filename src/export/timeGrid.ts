export type Item = { start: string; end: string };

export type TimeGrid = {
  startMin: number;      // p.ej. 7*60
  endMin: number;        // p.ej. 19*60
  quantumMin: number;    // GCD de duraciones, con límites
  majorTickMin: number;  // 60 (horas)
};

// Convertir "HH:MM" a minutos totales
export function toMin(hhmm: string): number {
  const [hours, minutes] = String(hhmm || '00:00').split(':').map(Number);
  return hours * 60 + (minutes || 0);
}

// Convertir minutos totales a "HH:MM"
export function toHHMM(min: number): string {
  const h = String(Math.floor(min / 60)).padStart(2, '0');
  const m = String(min % 60).padStart(2, '0');
  return `${h}:${m}`;
}

// Algoritmo de Euclides para GCD
export function gcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) {
    [a, b] = [b, a % b];
  }
  return a;
}

// GCD de un array de números
export function gcdArray(nums: number[]): number {
  if (nums.length === 0) return 1;
  if (nums.length === 1) return nums[0];
  return nums.reduce((acc, num) => gcd(acc, num));
}

/**
 * Construye la grilla temporal "inteligente".
 * - startMin = min(items.start)
 * - endMin   = max(items.end)
 * - quantumMin = clamp(gcd(duraciones), min=5, max=60) y subir hasta no pasar cellCap
 * - majorTickMin = 60
 */
export function buildTimeGrid(items: Item[], opts?: {
  minQuantum?: number;   // default 5
  maxQuantum?: number;   // default 60
  padTopMin?: number;    // default 0..10
  padBottomMin?: number; // default 0..10
  cellCap?: number;      // máximo de filas menores (default 180)
}): TimeGrid {
  if (items.length === 0) {
    return { startMin: 7 * 60, endMin: 18 * 60, quantumMin: 60, majorTickMin: 60 };
  }

  // 1) extremos
  const starts = items.map(i => toMin(i.start));
  const ends = items.map(i => toMin(i.end));
  let startMin = Math.min(...starts);
  let endMin = Math.max(...ends);

  // padding suave (evita tocar bordes)
  const padTop = opts?.padTopMin ?? Math.min(10, Math.max(0, Math.floor((endMin - startMin) * 0.02)));
  const padBot = opts?.padBottomMin ?? Math.min(10, Math.max(0, Math.floor((endMin - startMin) * 0.02)));
  startMin = Math.max(0, startMin - padTop);
  endMin = endMin + padBot;

  // 2) gcd de duraciones
  const durs = items.map(i => Math.max(1, toMin(i.end) - toMin(i.start)));
  let q = gcdArray(durs);

  // clamps y salvaguardas
  const minQ = opts?.minQuantum ?? 5;
  const maxQ = opts?.maxQuantum ?? 60;
  q = Math.min(maxQ, Math.max(minQ, q));

  // 3) limitar cantidad de mini-celdas
  const cap = opts?.cellCap ?? 180; // p.ej. 12h con quantum 4' serían 180
  while (Math.ceil((endMin - startMin) / q) > cap && q < maxQ) {
    q *= 2;
  }

  return { startMin, endMin, quantumMin: q, majorTickMin: 60 };
}

// Generar ticks mayores (cada hora)
export function generateMajorTicks(grid: TimeGrid): number[] {
  const ticks: number[] = [];
  const startHour = Math.ceil(grid.startMin / 60);
  const endHour = Math.floor(grid.endMin / 60);
  
  for (let hour = startHour; hour <= endHour; hour++) {
    const tick = hour * 60;
    if (tick >= grid.startMin && tick <= grid.endMin) {
      ticks.push(tick);
    }
  }
  
  return ticks;
}

// Generar sub-ticks (cada quantum)
export function generateSubTicks(grid: TimeGrid): number[] {
  const ticks: number[] = [];
  for (let t = grid.startMin; t <= grid.endMin; t += grid.quantumMin) {
    // No incluir si ya está en majorTicks
    if (t % grid.majorTickMin !== 0) {
      ticks.push(t);
    }
  }
  return ticks;
}
