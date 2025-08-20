import React from 'react';
import { PosterProps } from './types';
import { 
  getThemeColors,
  getTextColorForBg
} from './utils';
import { 
  buildTimeGrid, 
  toMin, 
  toHHMM, 
  generateMajorTicks, 
  generateSubTicks 
} from './timeGrid';

// ancho aproximado de una línea en píxeles (0.58em ≈ promedio latino)
function approxLineWidth(text: string, fontSize: number): number {
  return (text?.length || 0) * fontSize * 0.58;
}

// Parte un texto en hasta maxLines líneas para que quepa en maxWidth
function wrapToWidth(text: string, fontSize: number, maxWidth: number, maxLines = 2): string[] {
  if (!text) return [""];
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let cur = "";

  const fits = (s: string) => approxLineWidth(s, fontSize) <= maxWidth;

  for (const w of words) {
    const t = cur ? cur + " " + w : w;
    if (fits(t)) {
      cur = t;
    } else {
      if (!cur) {
        // palabra larguísima: corta duro por caracteres
        let chunk = "";
        for (const ch of w) {
          if (fits(chunk + ch)) chunk += ch;
          else { lines.push(chunk); chunk = ch; }
          if (lines.length === maxLines) return lines;
        }
        cur = chunk;
      } else {
        lines.push(cur);
        cur = w;
        if (lines.length === maxLines - 1) break;
      }
    }
  }
  if (cur) lines.push(cur);
  return lines.slice(0, maxLines);
}

// Busca el tamaño de fuente más grande que entra en el ancho
function fitTitle(title: string, innerW: number, ideal: number, min = 18, maxLines = 2): { size: number; lines: string[] } {
  let size = ideal;
  while (size > min) {
    const lines = wrapToWidth(title, size, innerW, maxLines);
    const widest = Math.max(...lines.map(l => approxLineWidth(l, size)), 0);
    if (widest <= innerW) return { size, lines };
    size -= 1;
  }
  return { size: min, lines: wrapToWidth(title, min, innerW, maxLines) };
}

export default function SchedulePoster({ 
  data, 
  width = 2480, 
  height = 3508, 
  theme = "classic", 
  showLegend = false, 
  watermark 
}: PosterProps) {
  const colors = getThemeColors(theme);

  const days = data.days ?? ["Lunes","Martes","Miércoles","Jueves","Viernes"];
  const items = data.items ?? [];

  // Layout
  const margin = 64;
  const headerH = 140;
  const daysHeaderH = 72;
  const legendH = showLegend ? 96 : 0;

  const contentW = width - margin * 2;
  const contentH = height - margin * 2;
  const leftColW = 240; // columna de horas
  const gridLeft = margin + leftColW;
  const gridW = contentW - leftColW;

  const colW = gridW / days.length;
  const borderColor = '#000';

  // Grilla temporal inteligente
  const grid = buildTimeGrid(
    items.map(i => ({ start: i.start, end: i.end })),
    { 
      minQuantum: data.tickStepMin ?? 5, 
      maxQuantum: 60, 
      cellCap: data.cellCap ?? 200, 
      padTopMin: 5, 
      padBottomMin: 5 
    }
  );

  // extremos reales
  const minStart = Math.min(...items.map(i => toMin(i.start)));
  const maxEnd = Math.max(...items.map(i => toMin(i.end)));

  // anclar a horas cerradas
  const hourStart = Math.floor(minStart / 60) * 60;
  const hourEnd = Math.ceil(maxEnd / 60) * 60;
  const hourCount = Math.max(1, (hourEnd - hourStart) / 60);

  // NUEVO: ocupar el alto disponible sin centrar
  const availH = contentH - headerH - daysHeaderH - legendH;
  const hourPx = Math.max(100, Math.min(140, Math.floor(availH / hourCount))); // ~100–140 px por hora
  const gridH  = hourPx * hourCount;

  // ANCLAR la grilla justo debajo de la cabecera de días (sin gap)
  const gridTop  = margin + headerH + daysHeaderH;
  const pxPerMin = hourPx / 60;

  // Escala y posicionamiento (después de calcular gridTop)
  const total = grid.endMin - grid.startMin;
  const scale = gridH / total;
  const yOf = (hhmm: string) => gridTop + (toMin(hhmm) - grid.startMin) * scale;
  const yOfMin = (min: number) => gridTop + (min - grid.startMin) * scale;

  // Leyenda (materia→color)
  const legend = (() => {
    const map = new Map<string,string>();
    items.forEach((it) => { if (!map.has(it.title)) map.set(it.title, it.color || '#e5e7eb'); });
    return Array.from(map.entries());
  })();

  return (
    <svg 
      width={width} 
      height={height} 
      viewBox={`0 0 ${width} ${height}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Fondo */}
      <rect width={width} height={height} fill={colors.background} />

      {/* Header */}
      <g transform={`translate(${margin}, ${margin})`}>
        {data.title && (
          <text x={0} y={0} fontFamily="Inter, system-ui, Arial" fontWeight="700" fontSize="72" fill="#0f172a" dominantBaseline="hanging">
            {data.title}
          </text>
        )}
        {data.subtitle && (
          <text x={0} y={84} fontFamily="Inter, system-ui, Arial" fontWeight="500" fontSize="32" fill="#475569" dominantBaseline="hanging">
            {data.subtitle}
          </text>
        )}
      </g>

      {/* Cabecera de días */}
      <g transform={`translate(${gridLeft}, ${margin + headerH})`}>
        <rect x={-leftColW} y={0} width={gridW + leftColW} height={daysHeaderH} fill={colors.headerBg} stroke={borderColor} strokeWidth="2" />
        {days.map((d, i) => (
          <g key={d} transform={`translate(${i * colW}, 0)`}>
            <rect x={0} y={0} width={colW} height={daysHeaderH} fill={colors.headerBg} stroke={borderColor} strokeWidth="2" />
            <text x={colW / 2} y={daysHeaderH / 2} fontFamily="Inter, system-ui, Arial" fontWeight="700" fontSize="26" textAnchor="middle" dominantBaseline="central" fill={colors.headerText}>{d}</text>
          </g>
        ))}
        <line x1={-2} y1={0} x2={-2} y2={daysHeaderH} stroke={borderColor} strokeWidth="2" />
      </g>

      {/* Columna izquierda de horas */}
      <g transform={`translate(${margin}, ${gridTop})`}>
        {/* Borde externo de la columna */}
        <rect x={0} y={0} width={leftColW} height={gridH} fill="#fff" stroke={borderColor} strokeWidth="2" />
        
        {/* Filas de tiempo por hora */}
        {Array.from({ length: hourCount }, (_, k) => (
          <g key={`hour-${k}`}>
            <rect 
              x={0} 
              y={k * hourPx} 
              width={leftColW} 
              height={hourPx} 
              fill="#f3f4f6" 
              stroke={borderColor} 
              strokeWidth="1.5" 
            />
            <text 
              x={leftColW/2} 
              y={k * hourPx + hourPx/2}
              textAnchor="middle" 
              dominantBaseline="central"
              fontFamily="Inter, system-ui, Arial" 
              fontWeight="700" 
              fontSize="26" 
              fill="#0f172a"
            >
              {`${toHHMM(hourStart + k * 60)} – ${toHHMM(hourStart + (k + 1) * 60)}`}
            </text>
          </g>
        ))}
      </g>

      {/* Grilla vertical por días */}
      <g transform={`translate(${gridLeft}, ${gridTop})`}>
        {/* Borde externo */}
        <rect x={0} y={0} width={gridW} height={gridH} fill="#fff" stroke={borderColor} strokeWidth="2" />
        
        {/* Verticales */}
        {days.map((_, i) => (
          <line key={`v-${i}`} x1={i * colW} y1={0} x2={i * colW} y2={gridH} stroke={borderColor} strokeWidth="1.5" />
        ))}
        <line x1={gridW} y1={0} x2={gridW} y2={gridH} stroke={borderColor} strokeWidth="2" />
        
        {/* Horizontales por hora */}
        {Array.from({ length: hourCount + 1 }, (_, k) => (
          <line key={`h-${k}`} x1={0} y1={k * hourPx} x2={gridW} y2={k * hourPx} stroke={borderColor} strokeWidth="1.5" />
        ))}
      </g>

      {/* Almuerzo */}
      {data.lunch && (() => {
        const s = toMin(data.lunch!.start);
        const e = s + Number(data.lunch!.durationMin || 0);
        if (e <= grid.startMin || s >= grid.endMin) return null;
        
        // Encontrar las horas que cubre el almuerzo
        const startHour = Math.floor((s - hourStart) / 60);
        const endHour = Math.ceil((e - hourStart) / 60);
        
        if (startHour < 0 || endHour > hourCount) return null;
        
        const y = gridTop + startHour * hourPx;
        const h = (endHour - startHour) * hourPx;
        
        return (
          <g transform={`translate(${gridLeft}, ${gridTop})`}>
            <rect x={0} y={startHour * hourPx} width={gridW} height={h} fill="rgba(253,230,138,.35)" />
            <line x1={0} y1={startHour * hourPx} x2={gridW} y2={startHour * hourPx} stroke={borderColor} strokeWidth="2" />
            <line x1={0} y1={startHour * hourPx + h} x2={gridW} y2={startHour * hourPx + h} stroke={borderColor} strokeWidth="2" />
            <text x={gridW / 2} y={startHour * hourPx + h / 2} textAnchor="middle" dominantBaseline="central" fontFamily="Inter, system-ui, Arial" fontWeight="700" fontSize="20" fill="#92400e">{data.lunch!.label || 'Almuerzo'}</text>
          </g>
        );
      })()}

      {/* Bloques */}
      <g transform={`translate(${gridLeft}, ${gridTop})`}>
        {items.map((it, idx) => {
          // suponiendo q = quantumMin (GCD) ya calculado
          const roundDownQ = (m: number) => Math.floor(m / grid.quantumMin) * grid.quantumMin;
          const roundUpQ = (m: number) => Math.ceil(m / grid.quantumMin) * grid.quantumMin;

          const sMin = roundDownQ(toMin(it.start));
          const eMin = roundUpQ(toMin(it.end));

          const y = (sMin - hourStart) * pxPerMin;
          const h = Math.max(4, (eMin - sMin) * pxPerMin); // mínimo 4px
          const x = it.dayIndex * colW + 2;
          const w = colW - 4;

          const fg = it.textColor || getTextColorForBg(it.color);
          // === Texto grande centrado dentro del bloque ===
          const inner = Math.max(16, Math.min(28, Math.floor(w * 0.08))); // padding lateral
          const usableW = w - inner * 2;

          // TAMAÑOS: subimos bastante el ideal del título y del horario
          const idealTitle = Math.min(Math.max(28, Math.floor(h * 0.34)), 56);
          const { size: titleSize, lines: titleLines } =
            fitTitle(String(it.title || ""), usableW, idealTitle, 18, 2);

          const timeSize = Math.min(Math.max(14, Math.floor(h * 0.20)), 28);
          const gap = Math.max(6, Math.floor(h * 0.07));

          // Alto total de texto para centrar vertical
          const titleBlockH = titleLines.length * titleSize + (titleLines.length - 1) * 4;
          const totalTextH = titleBlockH + gap + timeSize;
          const baseY = y + (h - totalTextH) / 2;

          const cx = x + w / 2;

          const svgChildren: React.ReactNode[] = [];

          // Título (hasta 2 líneas), centrado y grande
          titleLines.forEach((ln, iLine) => {
            const ly = baseY + titleSize * (iLine + 1) + 4 * iLine;
            svgChildren.push(
              <text
                key={`t-${idx}-${iLine}`}
                x={cx}
                y={ly}
                textAnchor="middle"
                dominantBaseline="alphabetic"
                fontFamily="Inter, system-ui, Arial"
                fontWeight="800"
                fontSize={titleSize}
                fill={fg}
              >
                {ln}
              </text>
            );
          });

          // Horario, centrado y un poco más chico
          svgChildren.push(
            <text
              key={`time-${idx}`}
              x={cx}
              y={baseY + titleBlockH + gap + timeSize}
              textAnchor="middle"
              dominantBaseline="alphabetic"
              fontFamily="Inter, system-ui, Arial"
              fontWeight="650"
              fontSize={timeSize}
              fill={fg}
            >
              {`${it.start} – ${it.end}`}
            </text>
          );

          return (
            <g key={idx}>
              <rect x={x} y={y} width={w} height={h} rx={8} ry={8} fill={it.color} stroke="#000" strokeWidth="1" />
              {svgChildren}
            </g>
          );
        })}
      </g>

      {/* Leyenda */}
      {showLegend && legend.length > 0 && (
        <g transform={`translate(${margin}, ${height - margin - legendH + 24})`}>
          {legend.map(([title, color], i) => (
            <g key={`lg-${i}`} transform={`translate(${i * 260}, 0)`}>
              <rect x={0} y={-14} width={24} height={24} rx={4} fill={color} stroke={borderColor} strokeWidth="1" />
              <text x={32} y={0} fontFamily="Inter, system-ui, Arial" fontSize="18" dominantBaseline="central">{title}</text>
            </g>
          ))}
        </g>
      )}

      {/* Watermark */}
      {watermark && (
        <text x={width - margin} y={height - margin} fontSize={16} textAnchor="end" fill="#94a3b8" fontFamily="Inter, system-ui, Arial">{watermark}</text>
      )}
    </svg>
  );
}
