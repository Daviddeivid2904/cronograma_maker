// src/components/SettingsBar.jsx
import React, { useEffect, useMemo, useState } from 'react'
import { DAYS } from '../lib/time.js'

/**
 * value = {
 *   startDay, endDay, start, end, stepMin,
 *   lunchEnabled, lunchTime
 * }
 */
export default function SettingsBar({ value, onChange, onCreateBreakCard }) {
  const [startDay, setStartDay]       = useState(value.startDay)
  const [endDay, setEndDay]           = useState(value.endDay)
  const [start, setStart]             = useState(value.start)
  const [end, setEnd]                 = useState(value.end)
  const [stepMin, setStepMin]         = useState(value.stepMin ?? 60);
  const presetSteps = [5, 10, 15, 20, 30, 45, 50, 60, 90];

  // Estado para el panel de funciones avanzadas
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [lunchEnabled, setLunchEnabled] = useState(value.lunchEnabled ?? false)
  const [lunchStart, setLunchStart] = useState(value.lunchStart ?? '13:00')
  const [lunchEnd, setLunchEnd] = useState(value.lunchEnd ?? '14:00')
  const [breakMinutes, setBreakMinutes] = useState(15)
  const [breakColor, setBreakColor] = useState('#94a3b8')

  // Fin no puede ser igual al inicio
  const endOptions = useMemo(() => DAYS.filter(d => d !== startDay), [startDay])

  useEffect(() => {
    if (endDay === startDay) {
      const idx = DAYS.indexOf(startDay)
      const next = DAYS[(idx + 1) % DAYS.length]
      setEndDay(next)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDay])

  useEffect(() => {
    onChange({ startDay, endDay, start, end, stepMin, lunchEnabled, lunchStart, lunchEnd })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDay, endDay, start, end, stepMin, lunchEnabled, lunchStart, lunchEnd])

  function handleCreateBreak() {
    const name = `Recreo ${breakMinutes}m`
    onCreateBreakCard?.({ name, color: breakColor })
    setShowAdvanced(false)
  }

  return (
    <div className="space-y-3">
      {/* Configuración principal */}
      <div className="rounded-xl border bg-white p-3 grid grid-cols-1 md:grid-cols-5 gap-3">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Día de inicio</label>
          <select className="w-full border rounded-lg px-2 py-2" value={startDay} onChange={e=>setStartDay(e.target.value)}>
            {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Día de fin</label>
          <select className="w-full border rounded-lg px-2 py-2" value={endDay} onChange={e=>setEndDay(e.target.value)}>
            {endOptions.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Desde</label>
          <input type="time" className="w-full border rounded-lg px-2 py-2" value={start} onChange={e=>setStart(e.target.value)} />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Hasta</label>
          <input type="time" className="w-full border rounded-lg px-2 py-2" value={end} onChange={e=>setEnd(e.target.value)} />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Paso (min)</label>
          <select
            className="w-full border rounded-lg px-2 py-2"
            value={stepMin}
            onChange={e => setStepMin(Number(e.target.value))}
          >
            {presetSteps.map(v => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Funciones avanzadas */}
      <div className="flex justify-center">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-sm text-gray-600 hover:text-gray-800 px-4 py-2 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all"
        >
          {showAdvanced ? 'Ocultar funciones avanzadas' : 'Más funciones'}
        </button>
      </div>

      {/* Panel de funciones avanzadas */}
      {showAdvanced && (
        <div className="rounded-xl border bg-white p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Sección de almuerzo */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3 border-b pb-2">Configuración de almuerzo</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <input 
                    id="lunchEnabled" 
                    type="checkbox" 
                    checked={lunchEnabled} 
                    onChange={e => setLunchEnabled(e.target.checked)} 
                  />
                  <label htmlFor="lunchEnabled" className="text-sm">Mostrar línea de almuerzo</label>
                </div>

                {lunchEnabled && (
                  <>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Inicio del almuerzo</label>
                      <input 
                        type="time" 
                        className="w-full border rounded px-2 py-1 text-sm" 
                        value={lunchStart} 
                        onChange={e => setLunchStart(e.target.value)} 
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Fin del almuerzo</label>
                      <input 
                        type="time" 
                        className="w-full border rounded px-2 py-1 text-sm" 
                        value={lunchEnd} 
                        onChange={e => setLunchEnd(e.target.value)} 
                      />
                    </div>

                    <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                      Se mostrará una línea horizontal en la grilla entre {lunchStart} y {lunchEnd}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Sección de recreos */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3 border-b pb-2">Crear recreos</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Duración</label>
                  <select 
                    className="w-full border rounded px-2 py-1 text-sm" 
                    value={breakMinutes} 
                    onChange={e => setBreakMinutes(Number(e.target.value))}
                  >
                    <option value={5}>5 min</option>
                    <option value={10}>10 min</option>
                    <option value={15}>15 min</option>
                    <option value={20}>20 min</option>
                    <option value={30}>30 min</option>
                    <option value={45}>45 min</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-gray-500 mb-1">Color</label>
                  <input 
                    className="w-full border rounded px-2 py-1" 
                    type="color" 
                    value={breakColor} 
                    onChange={e => setBreakColor(e.target.value)} 
                  />
                </div>

                <button 
                  onClick={handleCreateBreak} 
                  className="w-full rounded bg-slate-600 text-white px-3 py-2 text-sm hover:bg-slate-700"
                >
                  Crear recreo
                </button>
              </div>
            </div>
          </div>

          {/* Espacio para futuras funciones */}
          <div className="mt-6 pt-4 border-t">
            <div className="flex items-center justify-center">
              <div className="text-center text-gray-400">
                <div className="text-2xl mb-2">🚀</div>
                <div className="text-sm">Más funciones próximamente...</div>
                <div className="text-xs mt-1">Exportar, plantillas, etc.</div>
              </div>
            </div>
          </div>

          <div className="text-xs text-gray-400 mt-4 pt-3 border-t text-center">
            Arrastrá la tarjeta de recreo a la grilla para insertarla
          </div>
        </div>
      )}
    </div>
  )
}
