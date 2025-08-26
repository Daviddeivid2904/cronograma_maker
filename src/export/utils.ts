// src/export/utils.ts
// Funciones utilitarias usadas por SchedulePoster.tsx

import { ScheduleData } from "./types";

// ---------- Tiempo ----------
export function timeStrToMinutes(time: string): number {
  const [h, m] = String(time || "00:00").split(":").map(Number);
  return h * 60 + (m || 0);
}

export function minutesToLabel(minutes: number): string {
  const M = ((minutes % (24 * 60)) + (24 * 60)) % (24 * 60);
  const h = Math.floor(M / 60);
  const m = M % 60;
  const pad = (x: number) => String(x).padStart(2, "0");
  return `${pad(h)}:${pad(m)}`;
}

// ---------- Colores / temas ----------
type ThemeName = "classic" | "light" | "pastel";

export function getThemeColors(theme: ThemeName | undefined) {
  switch (theme) {
    case "classic":
      return {
        grid: "#e5e7eb",
        headerBg: "#ffffff",
        headerText: "#0f172a",
        hourBg: "#f3f4f6",
        hourText: "#111827",
        legendText: "#374151",
      };
    case "pastel":
      return {
        grid: "#eaeaea",
        headerBg: "#ffffff",
        headerText: "#1f2937",
        hourBg: "#fafafa",
        hourText: "#374151",
        legendText: "#4b5563",
      };
    case "light":
    default:
      return {
        grid: "#e6e8eb",
        headerBg: "#ffffff",
        headerText: "#0f172a",
        hourBg: "#f5f7fa",
        hourText: "#111827",
        legendText: "#374151",
      };
  }
}

/** Texto negro/blanco según fondo (YIQ simple). */
export function getTextColorForBg(hexBg: string): string {
  const hex = (hexBg || "").replace("#", "");
  const bigint = parseInt(hex.length === 3
    ? hex.split("").map(ch => ch + ch).join("")
    : hex, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  // YIQ
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 150 ? "#111827" : "#ffffff";
}

// ---------- (Opcional) utilidades varias que otros módulos ya usan ----------
export const truncateText = (text: string, max: number): string =>
  text.length <= max ? text : text.substring(0, max - 3) + "...";

/**
 * Cálculo de ticks mayores/menores para previsualizaciones rápidas.
 * (No es usado directamente por SchedulePoster, pero lo mantenemos para compat.)
 */
export function computeGridTicks(
  minY: number,
  maxY: number,
  majorStep: number,
  subStep?: number
): { minY: number; maxY: number; major: number[]; minor: number[] } {
  const roundDown = (v: number, s: number) => Math.floor(v / s) * s;
  const roundUp = (v: number, s: number) => Math.ceil(v / s) * s;

  const start = roundDown(minY, majorStep);
  const end = roundUp(maxY, majorStep);

  const major: number[] = [];
  for (let t = start; t <= end; t += majorStep) major.push(t);

  const minor: number[] = [];
  if (subStep && subStep > 0) {
    for (let t = roundDown(minY, subStep); t <= end; t += subStep) {
      if (!major.includes(t)) minor.push(t);
    }
  }

  return { minY: start, maxY: end, major, minor };
}
