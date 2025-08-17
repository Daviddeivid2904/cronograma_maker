// src/components/BreakTools.jsx
import React, { useState } from 'react'

/**
 * Panel para crear tarjetas de "Recreo" rápidamente, con duración seleccionable.
 * La tarjeta se agrega a la lista de actividades (como actividad especial).
 */
export default function BreakTools({ onCreateBreakCard }) {
  const [minutes, setMinutes] = useState(15)
  const [color, setColor] = useState('#94a3b8') // gris azulado para distinguir

  function handleCreate() {
    const name = `Recreo ${minutes}m`
    onCreateBreakCard({ name, color })
  }

  return (
    <div className="rounded-xl border bg-white p-3 flex flex-col sm:flex-row gap-3 items-start sm:items-end">
      <div>
        <label className="block text-xs text-gray-500 mb-1">Duración del recreo (min)</label>
        <select className="border rounded-lg px-2 py-2" value={minutes} onChange={e=>setMinutes(Number(e.target.value))}>
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={15}>15</option>
          <option value={20}>20</option>
          <option value={30}>30</option>
          <option value={45}>45</option>
        </select>
      </div>

      <div>
        <label className="block text-xs text-gray-500 mb-1">Color</label>
        <input className="border rounded-lg px-2 py-2" type="color" value={color} onChange={e=>setColor(e.target.value)} />
      </div>

      <button onClick={handleCreate} className="rounded-lg bg-slate-700 text-white px-4 py-2 hover:bg-slate-800">
        Crear tarjeta “Recreo”
      </button>

      <div className="text-xs text-gray-500 sm:ml-auto">
        Tip: arrastrá la tarjeta “Recreo” sobre una celda para insertarlo entre bloques.
      </div>
    </div>
  )
}
