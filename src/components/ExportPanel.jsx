import React, { useState } from 'react';
import { posterToPng, posterToPdf, downloadFile, downloadBlob } from '../export/exportImage';
import { buildScheduleDataFromState } from '../export/buildScheduleData';

export default function ExportPanel({ activities, blocks, config, onClose }) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState('square');
  const [theme, setTheme] = useState('classic');
  const [showLegend, setShowLegend] = useState(false);
  const [title, setTitle] = useState('Mi Horario Semanal');
  const [subtitle, setSubtitle] = useState('Planificador de Actividades');

  const formatPresets = {
    a4: { width: 2480, height: 3508, name: 'A4 (2480×3508)' },
    widescreen: { width: 2560, height: 1440, name: '16:9 (2560×1440)' },
    square: { width: 2048, height: 2048, name: 'Cuadrado (2048×2048)' }
  };

  const themes = [
    { value: 'classic', name: 'Clásico', description: 'Bordes negros' },
    { value: 'light', name: 'Claro', description: 'Líneas grises' },
    { value: 'pastel', name: 'Pastel', description: 'Suave' }
  ];

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
          showLegend
        });
        downloadFile(png, `horario-${exportFormat}.png`);
      } else {
        const pdf = await posterToPdf(data, { theme, showLegend });
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
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
            <input value={title} onChange={(e)=>setTitle(e.target.value)} className="w-full border rounded-lg px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subtítulo</label>
            <input value={subtitle} onChange={(e)=>setSubtitle(e.target.value)} className="w-full border rounded-lg px-3 py-2" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Formato</label>
            <select value={exportFormat} onChange={(e)=>setExportFormat(e.target.value)} className="w-full border rounded-lg px-3 py-2">
              {Object.entries(formatPresets).map(([k,p]) => <option key={k} value={k}>{p.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tema</label>
            <select value={theme} onChange={(e)=>setTheme(e.target.value)} className="w-full border rounded-lg px-3 py-2">
              {themes.map(t => <option key={t.value} value={t.value}>{t.name} — {t.description}</option>)}
            </select>
          </div>

          <div className="flex items-center justify-between pt-2">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={showLegend} onChange={e=>setShowLegend(e.target.checked)} />
              <span className="text-sm">Mostrar leyenda</span>
            </label>
          </div>

          <div className="flex gap-2 pt-4">
            <button onClick={()=>doExport('png')} disabled={isExporting}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50">
              {isExporting ? 'Exportando…' : 'Descargar PNG'}
            </button>
            <button onClick={()=>doExport('pdf')} disabled={isExporting}
                    className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 disabled:opacity-50">
              {isExporting ? 'Exportando…' : 'Descargar PDF'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
