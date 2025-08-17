import React, { useEffect, useRef, useState } from 'react'
import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'

const COLORS = [
  '#60a5fa','#34d399','#f472b6','#f59e0b','#a78bfa','#fb7185','#22d3ee','#4ade80'
]

// Pasteles lindos para el popover
const EXTRA_COLORS = [
  '#fde2e4','#fad2e1','#e2ece9','#bee1e6','#cddafd',
  '#d1d1e9','#ffe5ec','#fff1e6','#e2f0cb','#cdeac0',
  '#ffe0ac','#ffd6a5','#ffc6ff','#bde0fe','#caffbf'
]

// Componente para cada bloque de actividad en la paleta
function ActivityBlock({ activity }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: `palette-${activity.id}`,
    data: { 
      type: 'palette-activity',
      activity: activity 
    }
  })

  const style = {
    transform: CSS.Translate.toString(transform),
  }

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className="flex items-center justify-center p-3 rounded-lg shadow-sm cursor-grab active:cursor-grabbing hover:shadow-md transition-all duration-200 hover:scale-105"
      style={{ ...style, backgroundColor: activity.color }}
    >
      <div className="text-white font-medium text-sm text-center">{activity.name}</div>
    </div>
  )
}

export default function ActivityPalette({ onAdd, activities = [] }){
  const [name, setName] = useState('')
  const [color, setColor] = useState(COLORS[0])

  // Estado y refs para el popover de “más colores”
  const [showMoreColors, setShowMoreColors] = useState(false)
  const moreBtnRef = useRef(null)
  const popRef = useRef(null)

  // Cerrar el popover si se clickea fuera
  useEffect(() => {
    function onDown(e) {
      if (!showMoreColors) return
      if (popRef.current?.contains(e.target)) return
      if (moreBtnRef.current?.contains(e.target)) return
      setShowMoreColors(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [showMoreColors])

  function handleAdd(e){
    e.preventDefault()
    const n = name.trim()
    if(!n) return
    onAdd({ name: n, color })
    setName('')
  }

  return (
    <div className="space-y-4">
      {/* Formulario para agregar actividades */}
      <form onSubmit={handleAdd} className="flex flex-col gap-2 md:flex-row items-stretch md:items-end">
        <div className="flex-1">
          <label className="block text-sm text-gray-700 mb-1">Nueva actividad / materia</label>
          <input
            className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Ej: Matematica"
            value={name}
            onChange={e=>setName(e.target.value)}
          />
        </div>
        <div className="relative">
          <label className="block text-sm text-gray-700 mb-1">Color</label>
          <div className="relative flex gap-2 flex-wrap">
            {/* Renderizamos todos menos el último */}
            {COLORS.slice(0, COLORS.length - 1).map(c=>(
              <button type="button" key={c}
                onClick={()=>setColor(c)}
                className="w-7 h-7 rounded-lg border"
                style={{ backgroundColor:c, outline: color===c ? '3px solid rgba(0,0,0,0.2)' : 'none' }}
                aria-label={`color ${c}`}
                title={c}
              />
            ))}

            {/* Botón + en lugar del último color */}
            <button
              ref={moreBtnRef}
              type="button"
              onClick={() => setShowMoreColors(v => !v)}
              className="w-7 h-7 rounded-lg border flex items-center justify-center text-gray-600 hover:bg-gray-50"
              aria-expanded={showMoreColors ? 'true' : 'false'}
              title={showMoreColors ? 'Ocultar más colores' : 'Más colores'}
            >
              {showMoreColors ? '–' : '+'}
            </button>

            {/* Mini-pestañita con colores pasteles (pegada al +) */}
            {showMoreColors && (
              <div
                ref={popRef}
                className="absolute z-20 top-full mt-2 right-0 rounded-xl border bg-white shadow-lg p-3"
              >
                <div className="text-[11px] text-gray-500 mb-2">Más colores</div>
                <div className="flex flex-wrap gap-2 max-w-[220px]">
                  {EXTRA_COLORS.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => { setColor(c); setShowMoreColors(false) }}
                      className="w-6 h-6 rounded-full border-2"
                      style={{ backgroundColor: c, borderColor: color === c ? 'black' : 'transparent' }}
                      aria-label={`Elegir color ${c}`}
                      title={c}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        <button className="mt-2 md:mt-0 rounded-lg bg-indigo-600 text-white px-4 py-2 hover:bg-indigo-700">
          Agregar
        </button>
      </form>

      {/* Paleta de actividades creadas */}
      {activities.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">Actividades disponibles - Arrastra a la grilla</h3>
          <div className="flex flex-wrap gap-3">
            {activities.map(activity => (
              <ActivityBlock key={activity.id} activity={activity} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
