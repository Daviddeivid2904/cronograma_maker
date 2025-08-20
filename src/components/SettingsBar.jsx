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

  const [lunchEnabled, setLunchEnabled] = useState(value.lunchEnabled ?? false)
  const [lunchStart, setLunchStart] = useState(value.lunchStart ?? '13:00')
  const [lunchEnd, setLunchEnd] = useState(value.lunchEnd ?? '14:00')

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

  // Recreos eliminados de esta barra; mantenemos la firma por compatibilidad

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

      {/* Configuración de almuerzo directamente en la barra */}
      <div className="rounded-xl border bg-white p-3 grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="flex items-center gap-2">
          <input
            id="lunchEnabled"
            type="checkbox"
            checked={lunchEnabled}
            onChange={e => setLunchEnabled(e.target.checked)}
          />
          <label htmlFor="lunchEnabled" className="text-sm">Mostrar franja de almuerzo</label>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Inicio del almuerzo</label>
          <input
            type="time"
            className="w-full border rounded px-2 py-2 text-sm"
            value={lunchStart}
            onChange={e => setLunchStart(e.target.value)}
            disabled={!lunchEnabled}
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Fin del almuerzo</label>
          <input
            type="time"
            className="w-full border rounded px-2 py-2 text-sm"
            value={lunchEnd}
            onChange={e => setLunchEnd(e.target.value)}
            disabled={!lunchEnabled}
          />
        </div>
      </div>
    </div>
  )
}
