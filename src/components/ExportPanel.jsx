// src/panels/ExportPanel.jsx
import React, { useState, useEffect } from 'react';
import { posterToPng, posterToPdf, downloadFile, downloadBlob } from '../export/exportImage';
import { buildScheduleDataFromState } from '../export/buildScheduleData';

/* ======= UI helpers ======= */

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
      <div className="w-24 h-16 flex items-center justify-center">{children}</div>
      <span className="mt-1 text-[11px] leading-tight text-center text-gray-800">{label}</span>
    </button>
  );
}

// Preview geométrico simple según formato
function FormatPreview({ kind }) {
  const style =
    kind === 'a4'
      ? { width: 36, height: 54 }
      : kind === 'widescreen'
      ? { width: 54, height: 30 }
      : { width: 40, height: 40 }; // square
  return (
    <div
      className="bg-gray-100 border border-gray-400 rounded-sm shadow-inner"
      style={style}
      aria-hidden
    />
  );
}

// Mini “grid” para mostrar estilo del tema
function ThemePreview({ theme }) {
  // Colores representativos por tema (no es render real; es indicativo)
  const palette = {
    classic: ['#111827', '#E5E7EB', '#FDE68A', '#BFDBFE'],
    light: ['#9CA3AF', '#F3F4F6', '#FDE68A', '#E5E7EB'],
    pastel: ['#94A3B8', '#F8FAFC', '#FBCFE8', '#A7F3D0'],
  }[theme] || ['#111827', '#E5E7EB', '#FDE68A', '#BFDBFE'];

  return (
    <div className="w-full h-full grid grid-cols-4 gap-[2px]">
      <div className="h-3" style={{ background: palette[0] }} />
      <div className="h-3" style={{ background: palette[1] }} />
      <div className="h-3" style={{ background: palette[2] }} />
      <div className="h-3" style={{ background: palette[3] }} />
      <div className="h-3 col-span-4" style={{ background: palette[1] }} />
      <div className="h-3 col-span-1" style={{ background: palette[2] }} />
      <div className="h-3 col-span-1" style={{ background: palette[3] }} />
      <div className="h-3 col-span-1" style={{ background: palette[2] }} />
      <div className="h-3 col-span-1" style={{ background: palette[3] }} />
    </div>
  );
}

/* ======= Panel ======= */

export default function ExportPanel({ activities, blocks, config, onClose }) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState('square');
  const [theme, setTheme] = useState('classic');
  const [showLegend, setShowLegend] = useState(false);
  const [title, setTitle] = useState('Mi Horario Semanal');
  const [subtitle, setSubtitle] = useState('Planificador de Actividades');

  // Presets
  const formatPresets = {
    a4: { width: 2480, height: 3508, name: 'A4 (2480×3508)' },
    widescreen: { width: 2560, height: 1440, name: '16:9 (2560×1440)' },
    square: { width: 2048, height: 2048, name: 'Cuadrado (2048×2048)' },
  };

  const themes = [
    { value: 'classic', name: 'Clásico', description: 'Bordes negros' },
    { value: 'light', name: 'Claro', description: 'Líneas grises' },
    { value: 'pastel', name: 'Pastel', description: 'Suave' },
  ];

  // Inicializa ads (si usás AdSense en el modal)
  useEffect(() => {
    try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch {}
  }, []);

  async function doExport(kind) {
    if (isExporting) return;
    setIsExporting(true);
    try {
      const base = buildScheduleDataFromState(activities, blocks, config, title, subtitle);
      // Siempre usar quantumMin=5 y cellCap=200
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
          dpi: 200,          // subí a 240–300 si querés más nitidez
          jpegQuality: 0.99, // 0.9–0.95 suele ser suficiente
          marginPt: 18,      // 18pt ~ 6mm
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

          {/* Formato con previews */}
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
                  <FormatPreview kind={key} />
                </OptionCard>
              ))}
            </div>
          </div>

          {/* Tema con previews */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tema</label>
            <div className="grid grid-cols-3 gap-2">
              {themes.map(t => (
                <OptionCard
                  key={t.value}
                  label={`${t.name}`}
                  selected={theme === t.value}
                  onClick={() => setTheme(t.value)}
                >
                  <ThemePreview theme={t.value} />
                </OptionCard>
              ))}
            </div>
            <p className="text-[11px] text-gray-500 mt-1">
              La preview es referencial; el render final usa tus datos actuales.
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
