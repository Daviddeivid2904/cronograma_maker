// src/components/ExportPanel.jsx
import React, { useState } from 'react';
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

// Colores representativos por tema (coinciden con tu idea de classic/light/pastel)
function getThemePreviewColors(theme) {
  if (theme === 'light') {
    return {
      headerBg: '#F3F4F6', headerText: '#111827',
      grid: '#D1D5DB', border: '#9CA3AF',
      block1: '#BFDBFE', block2: '#FDE68A', block3: '#E5E7EB'
    };
  }
  if (theme === 'pastel') {
    return {
      headerBg: '#F8FAFC', headerText: '#0F172A',
      grid: '#CBD5E1', border: '#94A3B8',
      block1: '#FBCFE8', block2: '#BBF7D0', block3: '#BFDBFE'
    };
  }
  // classic
  return {
    headerBg: '#FFFFFF', headerText: '#0F172A',
    grid: '#000000', border: '#000000',
    block1: '#FDE68A', block2: '#BFDBFE', block3: '#FECACA'
  };
}

// Dibuja una mini “hoja” con cabecera y grilla; aspect: 'a4' | 'widescreen' | 'square'
function MiniPosterSVG({ theme, aspect }) {
  const { headerBg, headerText, grid, border, block1, block2, block3 } = getThemePreviewColors(theme);

  // Tamaño base del SVG (solo para preview)
  const dims =
    aspect === 'a4'        ? { w: 140, h: 198 } :
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

  // líneas de división (3×4 aprox)
  const rows = 4, cols = 5;

  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${w} ${h}`} xmlns="http://www.w3.org/2000/svg">
      {/* fondo */}
      <rect x="0" y="0" width={w} height={h} fill="#ffffff" />

      {/* borde */}
      <rect x={pad} y={pad} width={w - pad*2} height={h - pad*2} fill="#fff" stroke={border} strokeWidth="1.5" />

      {/* cabecera de días */}
      <rect x={gridX} y={pad} width={gridW} height={headerH} fill={headerBg} stroke={border} strokeWidth="1" />
      {/* columna de horas */}
      <rect x={pad} y={gridY} width={leftColW} height={gridH} fill="#fff" stroke={border} strokeWidth="1" />

      {/* grilla */}
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

      {/* bloques de ejemplo */}
      <rect x={gridX + 2} y={gridY + 2} width={gridW/cols - 4} height={gridH/rows - 4} rx="3" fill={block1} stroke={border} strokeWidth="0.8" />
      <rect x={gridX + (gridW/cols)*2 + 2} y={gridY + (gridH/rows) + 2} width={gridW/cols - 4} height={gridH/rows - 4} rx="3" fill={block2} stroke={border} strokeWidth="0.8" />
      <rect x={gridX + (gridW/cols)*4 - (gridW/cols) + 2} y={gridY + (gridH/rows)*2 + 2} width={gridW/cols - 4} height={gridH/rows - 4} rx="3" fill={block3} stroke={border} strokeWidth="0.8" />

      {/* título pequeñito para diferenciar aún más los temas (color de texto cambia) */}
      <text x={w/2} y={pad + headerH/2} textAnchor="middle" dominantBaseline="central"
        fontFamily="Inter, system-ui, Arial" fontSize="6.5" fill={headerText}>Demo</text>
    </svg>
  );
}

/* ===================== Panel principal ===================== */

export default function ExportPanel({ activities, blocks, config, onClose }) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState('square'); // 'a4' | 'widescreen' | 'square'
  const [theme, setTheme] = useState('classic');              // 'classic' | 'light' | 'pastel'
  const [showLegend, setShowLegend] = useState(false);
  const [title, setTitle] = useState('Mi Horario Semanal');
  const [subtitle, setSubtitle] = useState('Planificador de Actividades');

  const formatPresets = {
    a4:         { width: 2480, height: 3508, name: 'A4 (2480×3508)' },
    widescreen: { width: 2560, height: 1440, name: '16:9 (2560×1440)' },
    square:     { width: 2048, height: 2048, name: 'Cuadrado (2048×2048)' },
  };

  const themes = [
    { value: 'classic', name: 'Clásico' },
    { value: 'light',   name: 'Claro'   },
    { value: 'pastel',  name: 'Pastel'  },
  ];

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
          theme,
          showLegend,
        });
        downloadFile(png, `horario-${exportFormat}.png`);
      } else {
        const pdf = await posterToPdf(data, {
          width: preset.width,
          height: preset.height,
          theme,
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
            <input
              value={title}
              onChange={(e)=>setTitle(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subtítulo</label>
            <input
              value={subtitle}
              onChange={(e)=>setSubtitle(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          {/* Formato con previews (varía proporción, respeta tema actual) */}
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
                  <MiniPosterSVG theme={theme} aspect={key} />
                </OptionCard>
              ))}
            </div>
          </div>

          {/* Tema con previews (varía colores, respeta el formato elegido) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tema</label>
            <div className="grid grid-cols-3 gap-2">
              {themes.map(t => (
                <OptionCard
                  key={t.value}
                  label={t.name}
                  selected={theme === t.value}
                  onClick={() => setTheme(t.value)}
                >
                  <MiniPosterSVG theme={t.value} aspect={exportFormat} />
                </OptionCard>
              ))}
            </div>
            <p className="text-[11px] text-gray-500 mt-1">
              La preview es referencial; el archivo final usa tus actividades actuales.
            </p>
          </div>

          {/* Leyenda */}
          <div className="flex items-center justify-between pt-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={showLegend}
                onChange={e=>setShowLegend(e.target.checked)}
              />
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
