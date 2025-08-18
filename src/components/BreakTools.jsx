// src/components/BreakTools.jsx
import React, { useState } from 'react'

/**
 * Panel expandible para funciones avanzadas como recreos.
 * Puede crecer para incluir más funcionalidades en el futuro.
 */
export default function BreakTools({ onCreateBreakCard }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [minutes, setMinutes] = useState(15)
  const [color, setColor] = useState('#94a3b8') // gris azulado para distinguir

  function handleCreate() {
    const name = `Recreo ${minutes}m`
    onCreateBreakCard({ name, color })
    setIsExpanded(false) // cerrar después de crear
  }

  return (
    <div className="relative">
      {/* Botón principal más visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="text-sm text-gray-600 hover:text-gray-800 px-3 py-1 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all"
        title="Funciones avanzadas"
      >
        {isExpanded ? 'Ocultar funciones' : 'Más funciones'}
      </button>

      {/* Panel desplegable */}
      {isExpanded && (
        <div className="absolute top-full right-0 mt-2 w-72 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-20">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-700">Funciones avanzadas</span>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-gray-400 hover:text-gray-600 text-lg"
            >
              ×
            </button>
          </div>

          {/* Sección de recreos */}
          <div className="space-y-3">
            <div className="border-b pb-3">
              <h4 className="text-xs font-medium text-gray-600 mb-2 uppercase tracking-wide">Recreos</h4>
              
              <div className="space-y-2">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Duración</label>
                  <select 
                    className="w-full border rounded px-2 py-1 text-xs" 
                    value={minutes} 
                    onChange={e => setMinutes(Number(e.target.value))}
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
                    value={color} 
                    onChange={e => setColor(e.target.value)} 
                  />
                </div>

                <button 
                  onClick={handleCreate} 
                  className="w-full rounded bg-slate-600 text-white px-3 py-1 text-xs hover:bg-slate-700"
                >
                  Crear recreo
                </button>
              </div>
            </div>

            {/* Espacio para futuras funciones */}
            <div className="text-center py-2">
              <div className="text-xs text-gray-400">
                Más funciones próximamente...
              </div>
            </div>
          </div>

          <div className="text-xs text-gray-400 mt-3 pt-2 border-t">
            Arrastrá la tarjeta de recreo a la grilla para insertarla
          </div>
        </div>
      )}
    </div>
  )
}
