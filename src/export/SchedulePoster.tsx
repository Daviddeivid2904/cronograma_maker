import React from 'react';
import { PosterProps } from './types';
import { RenderDecoration } from './decorations';

import { 
  getThemeColors,
  getTextColorForBg
} from './utils';
import { 
  buildTimeGrid, 
  toMin, 
  toHHMM, 
  generateMajorTicks, 
  generateSubTicks,
  gcdArray,
} from './timeGrid';

// ancho aproximado de una línea en píxeles (0.58em ≈ promedio latino)
// ancho aproximado de una línea en píxeles (0.58em ≈ promedio latino)
function approxLineWidth(text: string, fontSize: number): number {
  return (text?.length || 0) * fontSize * 0.58;
}

// Parte texto en hasta maxLines líneas para que quepa en maxWidth.
// Si no entra todo en las líneas disponibles, agrega "…" al final.
function wrapWithEllipsis(
  text: string,
  fontSize: number,
  maxWidth: number,
  maxLines: number
): string[] {
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
      if (cur) {
        lines.push(cur);
        cur = w;
        if (lines.length === maxLines - 1) break;
      } else {
        // palabra larguísima: la cortamos “bruscamente”
        // y dejamos que SVG la muestre igual (no reducimos tamaño)
        cur = w;
      }
    }
  }
  if (cur) lines.push(cur);

  // Si sobran palabras y ya no hay más líneas → agregar “…” al final de la última
  const totalJoined = lines.join(" ");
  const usedWords = totalJoined ? totalJoined.split(/\s+/).length : 0;
  if (usedWords < words.length && lines.length === maxLines) {
    const last = lines[lines.length - 1];
    // Ajustar para que quepa “ …”
    let ell = last + " …";
    while (!fits(ell) && ell.length > 1) {
      ell = ell.slice(0, -2) + "…"; // recortamos un poco antes del espacio
    }
    lines[lines.length - 1] = ell;
  }

  return lines.slice(0, maxLines);
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

  // Use translated day names from data.days if available, otherwise fallback to Spanish
  const days = data.days ?? ["Lunes","Martes","Miércoles","Jueves","Viernes"];
  const items = data.items ?? [];

  // Layout
  const margin = 200;
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
      minQuantum: data.tickStepMin ?? 30, 
      maxQuantum: 120, 
      cellCap: data.cellCap ?? 200, 
      padTopMin: 5, 
      padBottomMin: 5 
    }
  );

// extremos reales
const minStart = Math.min(...items.map(i => toMin(i.start)));
const maxEnd   = Math.max(...items.map(i => toMin(i.end)));

// Paso visible = GCD de DURACIONES.
// Si g < 30 -> 60 por legibilidad.
// Opcional: limitar a un máximo (p. ej. 240 = 4 h).
const durations = items
  .map(i => Math.max(1, toMin(i.end) - toMin(i.start)))
  .filter(d => Number.isFinite(d) && d > 0);

let visibleStep = 60; // fallback

if (durations.length) {
  const g = gcdArray(durations);
  const minStart = Math.min(...items.map(i => toMin(i.start)));

  // chequea si todos los bloques empiezan y terminan alineados al gcd
  const allAligned = items.every(it => {
    const s = toMin(it.start) - minStart;
    const e = toMin(it.end) - minStart;
    return s % g === 0 && e % g === 0;
  });

  if (g >= 30 && allAligned) {
    visibleStep = g;   // usar gcd (ej. 120)
  } else {
    visibleStep = 60;  // bajar a 1 hora
  }
}

// opcional clamp
visibleStep = Math.max(30, Math.min(visibleStep, 240));




  // Anclar al inicio más pequeño y calcular fin más grande
  const anchor = minStart;
  const hourEnd = maxEnd;

  // Segmentar por visibleStep
  const segCount = Math.ceil((hourEnd - anchor) / visibleStep);
  const availH   = contentH - headerH - daysHeaderH - legendH;
  // Adaptar altura de segmento al espacio disponible SIN escalar el paso
  const segPx    = Math.max(1, availH / segCount);
  const gridH    = availH;

  // ANCLAR la grilla justo debajo de la cabecera de días (sin gap)
  const gridTop  = margin + headerH + daysHeaderH;
  const pxPerMin = segPx / visibleStep;

  // Escala en px por minuto y utilitario de posición exacta
  const yOfMinExact = (min: number) => gridTop + (min - anchor) * pxPerMin;

  const gridRect = { x: gridLeft, y: gridTop, w: gridW, h: gridH };

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
      xmlnsXlink="http://www.w3.org/1999/xlink"   // 👈  NECESARIO PARA <image xlink:href=…>
    >
      {/* Fondo */}
      <rect width={width} height={height} fill="#ffffff" />
      {/* Decoración de marco (usa el prop theme como nombre de decoración) */}
<RenderDecoration
          name={theme as any}
          width={width}
          height={height}
          grid={gridRect}
        />


      {/* Header centrado */}
      <g transform={`translate(${width/2}, ${margin})`}>
        {data.title && (
          <text x={0} y={0} textAnchor="middle" fontFamily="Inter, system-ui, Arial" fontWeight="700" fontSize="72" fill="#0f172a" dominantBaseline="hanging">
            {data.title}
          </text>
        )}
        {data.subtitle && (
          <text x={0} y={84} textAnchor="middle" fontFamily="Inter, system-ui, Arial" fontWeight="500" fontSize="32" fill="#475569" dominantBaseline="hanging">
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

      {/* Columna izquierda por segmento visible */}
      <g transform={`translate(${margin}, ${gridTop})`}>
        {/* Borde externo de la columna */}
        <rect x={0} y={0} width={leftColW} height={gridH} fill="#fff" stroke={borderColor} strokeWidth="2" />
        
        {/* Filas de tiempo por segmento */}
        {Array.from({ length: segCount }, (_, k) => (
          <g key={`hour-${k}`}>
            <rect 
              x={0} 
              y={k * segPx} 
              width={leftColW} 
              height={segPx} 
              fill={colors.headerBg} 
              stroke={borderColor} 
              strokeWidth="1.5" 
            />
            <text 
              x={leftColW/2} 
              y={k * segPx + segPx/2}
              textAnchor="middle" 
              dominantBaseline="central"
              fontFamily="Inter, system-ui, Arial" 
              fontWeight="700" 
              fontSize="24" 
              fill="#0f172a"
            >
              {`${toHHMM(anchor + k * visibleStep)} – ${toHHMM(anchor + (k + 1) * visibleStep)}`}
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
        
        {/* Horizontales por segmento */}
        {Array.from({ length: segCount + 1 }, (_, k) => (
          <line key={`h-${k}`} x1={0} y1={k * segPx} x2={gridW} y2={k * segPx} stroke={borderColor} strokeWidth={k === 0 || k === segCount ? 2 : 1.5} />
        ))}
      </g>

      {/* Almuerzo */}
      {data.lunch && (() => {
        const s = toMin(data.lunch!.start);
        const e = s + Number(data.lunch!.durationMin || 0);
        if (e <= grid.startMin || s >= grid.endMin) return null;
        
        // Hora exacta con tolerancia mínima
        const EPS = 2; // minutos
        const alignTolerant = (m: number) => {
          const rel = m - anchor;
          const mod = ((rel % visibleStep) + visibleStep) % visibleStep;
          if (mod <= EPS) return m - mod;
          if (visibleStep - mod <= EPS) return m + (visibleStep - mod);
          return m;
        };
        const Ls = alignTolerant(s);
        const Le = alignTolerant(e);
        
        const y = yOfMinExact(Ls);
        const h = Math.max(0, (Le - Ls) * pxPerMin);
        
        return (
          <g transform={`translate(${gridLeft}, ${gridTop})`}>
            <rect x={0} y={y - gridTop} width={gridW} height={h} fill="rgba(253,230,138,.35)" />
            <line x1={0} y1={y - gridTop} x2={gridW} y2={y - gridTop} stroke={borderColor} strokeWidth="2" />
            <line x1={0} y1={y - gridTop + h} x2={gridW} y2={y - gridTop + h} stroke={borderColor} strokeWidth="2" />
            <text x={gridW / 2} y={y - gridTop + h / 2} textAnchor="middle" dominantBaseline="central" fontFamily="Inter, system-ui, Arial" fontWeight="700" fontSize="20" fill="#92400e">{data.lunch!.label || 'Almuerzo'}</text>
          </g>
        );
      })()}

      {/* Bloques */}
      <g transform={`translate(${gridLeft}, ${gridTop})`}>
{items.map((it, idx) => {
  // geometría
  const sMin = toMin(it.start);
  const eMin = toMin(it.end);
  const y = (sMin - anchor) * pxPerMin;
  const h = Math.max(12, (eMin - sMin) * pxPerMin);
  const x = it.dayIndex * colW + 2;
  const w = colW - 4;

  const fg = it.textColor || getTextColorForBg(it.color);

  // tamaños FIJOS
  const PADDING_X = Math.max(16, Math.floor(w * 0.08));
  const PADDING_Y = 10;
  const LINE_GAP = 4;
  const GROUP_GAP = 12;  // separación entre secciones

  const TITLE_SIZE = 40;
  const SUBTITLE_SIZE = 27;
  const TIME_SIZE = 25;

  const cx = x + w / 2;
  const usableW = w - PADDING_X * 2;
  const hasSubtitle = !!(it.subtitle && it.subtitle.trim());

  // alto disponible para todo el stack de texto
  const available = h - PADDING_Y * 2;

  // número máximo de líneas de título que entran (1..3)
  const maxTitleLinesTheoretical = Math.floor(
    (available - (hasSubtitle ? (GROUP_GAP + SUBTITLE_SIZE) : 0) - (GROUP_GAP + TIME_SIZE) + LINE_GAP)
    / (TITLE_SIZE + LINE_GAP)
  );
  const maxTitleLines = Math.max(1, Math.min(3, maxTitleLinesTheoretical));

  // construir líneas
  const titleLines = wrapWithEllipsis(String(it.title || ""), TITLE_SIZE, usableW, maxTitleLines);

  // chequeo si el subtítulo entra, si no lo omitimos
  const titleBlockH = titleLines.length * TITLE_SIZE + (titleLines.length - 1) * LINE_GAP;
  let showSubtitle = hasSubtitle;
  if (showSubtitle) {
    const needed = titleBlockH + GROUP_GAP + SUBTITLE_SIZE + GROUP_GAP + TIME_SIZE;
    if (needed > available) showSubtitle = false;
  }

  // alto total del grupo (centrado verticalmente)
  const subBlockH = showSubtitle ? (GROUP_GAP + SUBTITLE_SIZE) : 0;
  const timeBlockH = GROUP_GAP + TIME_SIZE;
  const totalTextH = titleBlockH + subBlockH + timeBlockH;

  const baseY = y + PADDING_Y + Math.max(0, (available - totalTextH) / 2);

  // render
  const texts: React.ReactNode[] = [];

  // título (centrado)
  titleLines.forEach((ln, i) => {
    const ly = baseY + TITLE_SIZE * (i + 1) + LINE_GAP * i;
    texts.push(
      <text
        key={`t-${idx}-${i}`}
        x={cx}
        y={ly}
        textAnchor="middle"
        dominantBaseline="alphabetic"
        fontFamily="Inter, system-ui, Arial"
        fontWeight="800"
        fontSize={TITLE_SIZE}
        fill={fg}
      >
        {ln}
      </text>
    );
  });

  // subtítulo (si entra)
  if (showSubtitle) {
    const ly = baseY + titleBlockH + GROUP_GAP + SUBTITLE_SIZE;
    texts.push(
      <text
        key={`s-${idx}`}
        x={cx}
        y={ly}
        textAnchor="middle"
        dominantBaseline="alphabetic"
        fontFamily="Inter, system-ui, Arial"
        fontWeight="600"
        fontSize={SUBTITLE_SIZE}
        fill={fg}
        opacity="0.9"
      >
        {String(it.subtitle || "")}
      </text>
    );
  }

  // hora (debajo del grupo, no pegada al borde)
  const timeY = baseY + titleBlockH + (showSubtitle ? (GROUP_GAP + SUBTITLE_SIZE) : 0) + GROUP_GAP + TIME_SIZE;
  texts.push(
    <text
      key={`time-${idx}`}
      x={cx}
      y={timeY}
      textAnchor="middle"
      dominantBaseline="alphabetic"
      fontFamily="Inter, system-ui, Arial"
      fontWeight="700"
      fontSize={TIME_SIZE}
      fill={fg}
    >
      {`${it.start} – ${it.end}`}
    </text>
  );

  return (
    <g key={idx}>
      <rect x={x} y={y} width={w} height={h} rx={8} ry={8} fill={it.color} stroke="#000" strokeWidth="1" />
      {texts}
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
      <g pointerEvents="none">
<RenderDecoration
          name={theme as any}
          width={width}
          height={height}
          grid={gridRect}
        />
</g>
    </svg>
  );
}
