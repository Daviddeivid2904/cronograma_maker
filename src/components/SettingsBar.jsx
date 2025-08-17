// src/components/SettingsBar.jsx
import React, { useEffect, useMemo, useState } from 'react'
import { DAYS } from '../lib/time.js'

/**
 * value = {
 *   startDay, endDay, start, end, stepMin,
 *   lunchEnabled, lunchTime
 * }
 */
export default function SettingsBar({ value, onChange }) {
  const [startDay, setStartDay]       = useState(value.startDay)
  const [endDay, setEndDay]           = useState(value.endDay)
  const [start, setStart]             = useState(value.start)
  const [end, setEnd]                 = useState(value.end)
  const [stepMin, setStepMin]         = useState(value.stepMin)
  const [lunchEnabled, setLunchEnabled] = useState(value.lunchEnabled ?? false)
  const [lunchTime, setLunchTime]     = useState(value.lunchTime ?? '13:00')

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
    onChange({ startDay, endDay, start, end, stepMin, lunchEnabled, lunchTime })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDay, endDay, start, end, stepMin, lunchEnabled, lunchTime])

  return (
    <div className="rounded-xl border bg-white p-3 grid grid-cols-1 md:grid-cols-7 gap-3">
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
        <select className="w-full border rounded-lg px-2 py-2" value={stepMin} onChange={e=>setStepMin(Number(e.target.value))}>
          <option value={30}>30</option>
          <option value={45}>45</option>
          <option value={60}>60</option>
          <option value={90}>90</option>
        </select>
      </div>
      <div className="flex items-center gap-2">
        <input id="lunchEnabled" type="checkbox" checked={lunchEnabled} onChange={e=>setLunchEnabled(e.target.checked)} />
        <label htmlFor="lunchEnabled" className="text-sm">Mostrar línea de almuerzo</label>
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-1">Hora de almuerzo</label>
        <input type="time" className="w-full border rounded-lg px-2 py-2" value={lunchTime} onChange={e=>setLunchTime(e.target.value)} disabled={!lunchEnabled} />
      </div>
    </div>
  )
}
