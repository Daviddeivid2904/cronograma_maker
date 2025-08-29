// src/components/ExportPanel.jsx
import React, { useRef, useState } from 'react';
import { posterToPng, posterToPdf, downloadFile, downloadBlob } from '../export/exportImage';
import { buildScheduleDataFromState } from '../export/buildScheduleData';

/* ===================== helpers UI ===================== */

function OptionCard({ label, selected, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full cursor-pointer rounded-lg border p-2 flex flex-col items-center justify-center transition
        ${selected ? 'border-blue-600 ring-2 ring-blue-400' : 'border-gray-300 hover:border-gray-400'}`}
      aria-pressed={selected}
      title={label}
    >
      <div className="w-28 h-20 overflow-hidden rounded-sm">{children}</div>
      <span className="mt-1 text-[11px] leading-tight text-center text-gray-800">{label}</span>
    </button>
  );
}

/* ===================== Previews con SVG (auto-contenidos) ===================== */

function MiniFormatPreview({ aspect }) {
  const dims =
    aspect === 'a4' ? { w: 140, h: 198 } :
    aspect === 'widescreen' ? { w: 168, h: 95 } :
    { w: 124, h: 124 };

  const { w, h } = dims;
  const pad = 6;
  const headerH = Math.max(14, Math.round(h * 0.16));
  const leftColW = Math.max(16, Math.round(w * 0.18));
  const gridX = pad + leftColW;
  const gridY = pad + headerH;
  const gridW = w - pad * 2 - leftColW;
  const gridH = h - pad * 2 - headerH;
  const rows = 4, cols = 5;

  const border = '#374151';
  const grid = '#CBD5E1';
  const headerBg = '#F3F4F6';
  const block1 = '#FDE68A';
  const block2 = '#93C5FD';
  const block3 = '#FCA5A5';

  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${w} ${h}`} xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="0" width={w} height={h} fill="#ffffff" />
      <rect x={pad} y={pad} width={w - pad*2} height={h - pad*2} fill="#fff" stroke={border} strokeWidth="1.5" />
      <rect x={gridX} y={pad} width={gridW} height={headerH} fill={headerBg} stroke={border} strokeWidth="1" />
      <rect x={pad} y={gridY} width={leftColW} height={gridH} fill="#fff" stroke={border} strokeWidth="1" />
      <rect x={gridX} y={gridY} width={gridW} height={gridH} fill="#fff" stroke={border} strokeWidth="1" />
      {Array.from({length: cols-1}).map((_,i)=>(
        <line key={'v'+i}
          x1={gridX + (gridW/cols)*(i+1)} y1={gridY}
          x2={gridX + (gridW/cols)*(i+1)} y2={gridY+gridH}
          stroke={grid} strokeWidth="0.8" />
      ))}
      {Array.from({length: rows-1}).map((_,i)=>(
        <line key={'h'+i}
          x1={gridX} y1={gridY + (gridH/rows)*(i+1)}
          x2={gridX+gridW} y2={gridY + (gridH/rows)*(i+1)}
          stroke={grid} strokeWidth="0.8" />
      ))}
      <rect x={gridX + 2} y={gridY + 2} width={gridW/cols - 4} height={gridH/rows - 4} rx="3" fill={block1} stroke={border} strokeWidth="0.8" />
      <rect x={gridX + (gridW/cols)*2 + 2} y={gridY + (gridH/rows) + 2} width={gridW/cols - 4} height={gridH/rows - 4} rx="3" fill={block2} stroke={border} strokeWidth="0.8" />
      <rect x={gridX + (gridW/cols)*3 + 2} y={gridY + (gridH/rows)*2 + 2} width={gridW/cols - 4} height={gridH/rows - 4} rx="3" fill={block3} stroke={border} strokeWidth="0.8" />
      <text x={w/2} y={pad + headerH/2} textAnchor="middle" dominantBaseline="central"
        fontFamily="Inter, system-ui, Arial" fontSize="6.5" fill="#111827">Demo</text>
    </svg>
  );
}

/* ===================== Panel principal ===================== */

export default function ExportPanel({ activities, blocks, config, onClose }) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState('square');
  const [decoration, setDecoration] = useState('none');   // 'none' | 'snoopy' | 'medical' | 'science'
  const [showLegend, setShowLegend] = useState(false);
  const [title, setTitle] = useState('Mi Horario Semanal');
  const [subtitle, setSubtitle] = useState('Planificador de Actividades');

  const formatPresets = {
    a4:         { width: 2480, height: 3508, name: 'A4 (2480×3508)' },
    widescreen: { width: 2560, height: 1440, name: '16:9 (2560×1440)' },
    square:     { width: 2048, height: 2048, name: 'Cuadrado (2048×2048)' },
  };

  async function doExport(kind) {
    if (isExporting) return;
    setIsExporting(true);
    try {
      const base = buildScheduleDataFromState(activities, blocks, config, title, subtitle);
      const data = { ...base, tickStepMin: 5, cellCap: 200 };
      const preset = formatPresets[exportFormat];

      if (kind === 'png') {
        const png = await posterToPng(data, {
          width: preset.width,
          height: preset.height,
          theme: decoration,
          showLegend,
        });
        downloadFile(png, `horario-${exportFormat}.png`);
      } else {
        const pdf = await posterToPdf(data, {
          width: preset.width,
          height: preset.height,
          theme: decoration,
          showLegend,
          dpi: 240,
          jpegQuality: 0.93,
          marginPt: 18,
        });
        downloadBlob(pdf, 'horario.pdf');
      }
    } catch (err) {
      console.error('Export error:', err);
      alert('Error al exportar: ' + (err?.message || err));
    } finally {
      setIsExporting(false);
    }
  }

  /* ====== Decoraciones en carrusel (una sola fila con flechas) ====== */
  const scrollerRef = useRef(null);

  const DECOR_OPTS = [
    { value: 'none',    name: 'Sin dec.', icon: null },
    { value: 'snoopy',  name: 'Snoopy',   icon: '/decors/snoopy/confetti.webp',scale: 1 }, // cambiá a .png si querés
    { value: 'medical', name: 'Médico',   icon: '/decors/medicina/medico.png',scale: 1 },
    { value: 'science', name: 'Científico', icon: '/decors/cientifico/atomo.png',scale: 1},
    // { value: 'flowers', name: 'Flores', icon: '/decors/flores/flores.png' }, // ← por ahora deshabilitado
  ];

  const scrollByAmount = (dir) => {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.querySelector('[data-card]');
    const step = card ? card.getBoundingClientRect().width + 12 : 180; // ancho tarjeta aprox
    el.scrollBy({ left: dir * step, behavior: 'smooth' });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Exportar horario</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600" aria-label="Cerrar">✕</button>
        </div>

        <div className="space-y-4">
          {/* Título / Subtítulo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
            <input value={title} onChange={(e)=>setTitle(e.target.value)} className="w-full border rounded-lg px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subtítulo</label>
            <input value={subtitle} onChange={(e)=>setSubtitle(e.target.value)} className="w-full border rounded-lg px-3 py-2" />
          </div>

          {/* Formato (previews neutrales) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Formato</label>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(formatPresets).map(([key, preset]) => (
                <OptionCard
                  key={key}
                  label={preset.name}
                  selected={exportFormat === key}
                  onClick={() => setExportFormat(key)}
                >
                  <MiniFormatPreview aspect={key} />
                </OptionCard>
              ))}
            </div>
          </div>

          {/* Decoración — carrusel horizontal */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Decoración</label>

            <div className="relative">
              {/* Flechas */}
              <button
                type="button"
                aria-label="Anterior"
                onClick={()=>scrollByAmount(-1)}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 border rounded-full w-7 h-7 grid place-items-center shadow-sm"
              >
                ‹
              </button>
              <button
                type="button"
                aria-label="Siguiente"
                onClick={()=>scrollByAmount(1)}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 border rounded-full w-7 h-7 grid place-items-center shadow-sm"
              >
                ›
              </button>

              {/* Pista scrolleable */}
              <div
                ref={scrollerRef}
                className="flex gap-2 overflow-x-auto no-scrollbar px-8"
                style={{ scrollSnapType: 'x proximity' }}
              >
                {DECOR_OPTS.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    data-card
                    onClick={() => setDecoration(opt.value)}
                    className={`min-w-[7.5rem] max-w-[7.5rem] scroll-snap-align-start rounded-lg border p-2 flex-shrink-0 flex flex-col items-center ${
                      decoration === opt.value ? 'border-blue-600 ring-2 ring-blue-400' : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="w-28 h-16 overflow-hidden rounded-sm flex items-start justify-center bg-white">
                      {opt.icon ? (
                        <img
                          src={opt.icon}
                          alt={opt.name}
                          style={{ transform: `scale(${opt.scale || 1})` }}
                          className="max-h-full max-w-full object-contain"
                          loading="lazy"
                        />
                      ) : (
                        <div className="text-[10px] text-gray-500">—</div>
                      )}
                    </div>
                    <span className="mt-1 text-[11px] text-gray-800">{opt.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <p className="text-[11px] text-gray-500 mt-2">
              Desliza o usá las flechas para ver más opciones.
            </p>
          </div>

          {/* Leyenda */}
          <div className="flex items-center justify-between pt-2">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={showLegend} onChange={e=>setShowLegend(e.target.checked)} />
              <span className="text-sm">Mostrar leyenda</span>
            </label>
          </div>

          {/* Botones */}
          <div className="flex gap-2 pt-4">
            <button
              onClick={()=>doExport('png')}
              disabled={isExporting}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isExporting ? 'Exportando…' : 'Descargar PNG'}
            </button>
            <button
              onClick={()=>doExport('pdf')}
              disabled={isExporting}
              className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              {isExporting ? 'Exportando…' : 'Descargar PDF'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
