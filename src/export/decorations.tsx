// src/export/decorations.tsx
import React from 'react';

export type DecorationName = 'none' | 'flowers' | 'medical' | 'science';

/**
 * Dibuja un marco decorativo vectorial, escalable a cualquier width/height.
 * Se pinta DETRÁS del contenido (vos lo montás antes de la grilla).
 */
export function RenderDecoration({
  name,
  width,
  height,
  margin = 24, // deja un borde interior para que no tape la grilla
}: {
  name: DecorationName;
  width: number;
  height: number;
  margin?: number;
}) {
  if (name === 'none') return null;

  const W = width;
  const H = height;
  const x0 = margin;
  const y0 = margin;
  const x1 = W - margin;
  const y1 = H - margin;

  switch (name) {
    case 'flowers':
      return (
        <g opacity={0.95}>
          {/* marco fino */}
          <rect x={x0} y={y0} width={x1 - x0} height={y1 - y0} rx={12} ry={12} fill="none" stroke="#d97706" strokeWidth={3} />
          {/* esquinas estilo geométrico */}
          {cornerLines('#d97706', x0, y0, x1, y1, 18)}
          {/* ramilletes: arriba derecha y abajo izquierda */}
          {flowersCluster(x1 - 80, y0 + 30, 1.0)}
          {flowersCluster(x0 + 50, y1 - 40, 0.9, true)}
        </g>
      );

    case 'medical':
      return (
        <g opacity={0.95}>
          {/* marco recto */}
          <rect x={x0} y={y0} width={x1 - x0} height={y1 - y0} rx={10} ry={10} fill="none" stroke="#ef4444" strokeWidth={3} />
          {/* cruzes médicas distribuidas */}
          {medicalIcons(x0, y0, x1, y1)}
        </g>
      );

    case 'science':
      return (
        <g opacity={0.95}>
          {/* marco discontinuo */}
          <rect x={x0} y={y0} width={x1 - x0} height={y1 - y0} rx={12} ry={12}
                fill="none" stroke="#0ea5e9" strokeWidth={3} strokeDasharray="10 6" />
          {/* átomos / matraces estilizados */}
          {scienceIcons(x0, y0, x1, y1)}
        </g>
      );

    default:
      return null;
  }
}

/* ---------- helpers visuales ---------- */

function cornerLines(color: string, x0: number, y0: number, x1: number, y1: number, len: number) {
  return (
    <g stroke={color} strokeWidth={3}>
      {/* TL */}
      <line x1={x0} y1={y0 + len} x2={x0} y2={y0} />
      <line x1={x0} y1={y0} x2={x0 + len} y2={y0} />
      {/* TR */}
      <line x1={x1} y1={y0 + len} x2={x1} y2={y0} />
      <line x1={x1 - len} y1={y0} x2={x1} y2={y0} />
      {/* BL */}
      <line x1={x0} y1={y1 - len} x2={x0} y2={y1} />
      <line x1={x0} y1={y1} x2={x0 + len} y2={y1} />
      {/* BR */}
      <line x1={x1} y1={y1 - len} x2={x1} y2={y1} />
      <line x1={x1 - len} y1={y1} x2={x1} y2={y1} />
    </g>
  );
}

function flowersCluster(cx: number, cy: number, s = 1, flip = false) {
  const k = flip ? -1 : 1;
  return (
    <g transform={`translate(${cx},${cy}) scale(${s})`}>
      {/* hojas */}
      <path d={`M ${-40*k},0 C ${-20*k},-30 ${10*k},-30 ${30*k},0`} fill="none" stroke="#16a34a" strokeWidth={3} />
      <path d={`M ${-30*k},10 C ${-10*k},-10 ${10*k},-5 ${25*k},15`} fill="none" stroke="#16a34a" strokeWidth={3} />
      {/* flor principal */}
      <circle cx={0} cy={0} r={14} fill="#ec4899" opacity={0.85}/>
      <circle cx={3} cy={-2} r={5} fill="#f59e0b" />
      {/* pétalos */}
      <ellipse cx={-10} cy={-8} rx={8} ry={5} fill="#f472b6" />
      <ellipse cx={10} cy={-6} rx={7} ry={5} fill="#f472b6" />
      <ellipse cx={-6} cy={8} rx={8} ry={5} fill="#f472b6" />
      <ellipse cx={10} cy={8} rx={7} ry={4} fill="#f472b6" />
    </g>
  );
}

function medicalIcons(x0: number, y0: number, x1: number, y1: number) {
  const pts = [
    [x0 + 40, y0 + 40],
    [x1 - 40, y0 + 50],
    [x0 + 60, y1 - 50],
    [x1 - 60, y1 - 40],
  ];
  return (
    <g>
      {pts.map(([x, y], i) => (
        <g key={i} transform={`translate(${x},${y})`}>
          {/* cruz */}
          <rect x={-10} y={-3} width={20} height={6} fill="#ef4444" />
          <rect x={-3} y={-10} width={6} height={20} fill="#ef4444" />
          {/* circ contorno */}
          <circle cx={0} cy={0} r={16} fill="none" stroke="#ef4444" strokeWidth={2} opacity={0.6}/>
        </g>
      ))}
      {/* estetoscopio simple */}
      <path
        d={`M ${x0 + 90},${y0 + 70} q 30,40 0,80 q -15,20 -35,0`}
        fill="none" stroke="#ef4444" strokeWidth={3} strokeLinecap="round"
      />
    </g>
  );
}

function scienceIcons(x0: number, y0: number, x1: number, y1: number) {
  return (
    <g>
      {/* átomo */}
      <g transform={`translate(${x0 + 70},${y0 + 60})`}>
        <ellipse rx="26" ry="12" fill="none" stroke="#0ea5e9" strokeWidth="2.5" />
        <ellipse rx="26" ry="12" transform="rotate(60)" fill="none" stroke="#0ea5e9" strokeWidth="2.5" />
        <ellipse rx="26" ry="12" transform="rotate(-60)" fill="none" stroke="#0ea5e9" strokeWidth="2.5" />
        <circle r="4" fill="#0ea5e9" />
      </g>
      {/* matraz */}
      <g transform={`translate(${x1 - 80},${y1 - 70})`}>
        <path d="M -10,-25 h 20 v 6 l 6,16 a 26,26 0 0 1 -32,0 l 6,-16 z" fill="#bae6fd" stroke="#0ea5e9" strokeWidth="2.5"/>
        <path d="M -6,-19 h 12" stroke="#0ea5e9" strokeWidth="2"/>
      </g>
    </g>
  );
}
