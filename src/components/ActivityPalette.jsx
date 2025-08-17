import React, { useState } from 'react'
import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'

const COLORS = [
  '#60a5fa','#34d399','#f472b6','#f59e0b','#a78bfa','#fb7185','#22d3ee','#4ade80'
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
        <div>
          <label className="block text-sm text-gray-700 mb-1">Color</label>
          <div className="flex gap-2 flex-wrap">
            {COLORS.map(c=>(
              <button type="button" key={c}
                onClick={()=>setColor(c)}
                className="w-7 h-7 rounded-lg border"
                style={{ backgroundColor:c, outline: color===c ? '3px solid rgba(0,0,0,0.2)' : 'none' }}
                aria-label={`color ${c}`}
              />
            ))}
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
