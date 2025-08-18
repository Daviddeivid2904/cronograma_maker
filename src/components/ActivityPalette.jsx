// src/components/ActivityPalette.jsx
import React, { useEffect, useRef, useState } from 'react'
import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'

const COLORS = [
  '#60a5fa', '#34d399', '#f472b6', '#f59e0b',
  '#a78bfa', '#fb7185', '#22d3ee', '#4ade80',
  '#ef4444', '#10b981', '#f97316', '#6366f1',
]

function ActivityBlock({ activity }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: `palette-${activity.id}`,
    data: {
      type: 'palette-activity',
      activity,
    },
  })

  const style = {
    transform: CSS.Translate.toString(transform),
    touchAction: 'none', // mejora arrastre en móvil
  }

  return (
    <div className="flex items-center gap-2 select-none">
      <div
        ref={setNodeRef}
        {...attributes}
        {...listeners}
        style={style}
        className="rounded-lg shadow-sm border px-3 py-2 cursor-grab active:cursor-grabbing"
        title="Arrastrá a la grilla"
      >
        <div className="flex items-center gap-2">
          <span
            className="inline-block w-3 h-3 rounded-full border"
            style={{ backgroundColor: activity.color }}
            aria-hidden
          />
          <span className="text-sm font-medium">{activity.name}</span>
        </div>
      </div>

      <button
        type="button"
        className="text-xs rounded-lg border px-2 py-1 tap-target"
        onClick={() => {
          window.dispatchEvent(new CustomEvent('arm-place-activity', { detail: { activity } }))
        }}
        title="Colocar esta actividad tocando una casilla en la grilla"
      >
        Colocar
      </button>
    </div>
  )
}

export default function ActivityPalette({ onAdd, activities = [] }) {
  const [name, setName] = useState('')
  const [color, setColor] = useState(COLORS[0])

  // Popover de "más colores"
  const [showMoreColors, setShowMoreColors] = useState(false)
  const popRef = useRef(null)

  // Cerrar si clickean/tocan fuera
  useEffect(() => {
    function onDocClick(e) {
      if (!showMoreColors) return
      if (popRef.current && !popRef.current.contains(e.target)) {
        setShowMoreColors(false)
      }
    }
    document.addEventListener('mousedown', onDocClick)
    document.addEventListener('touchstart', onDocClick)
    return () => {
      document.removeEventListener('mousedown', onDocClick)
      document.removeEventListener('touchstart', onDocClick)
    }
  }, [showMoreColors])

  function handleSubmit(e) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    onAdd?.({ name: trimmed, color })
    setName('')
  }

  return (
    <div>
      <h2 className="text-sm font-semibold mb-2">Paleta de actividades</h2>

      {/* Formulario responsive para crear actividad */}
      <form onSubmit={handleSubmit} className="grid gap-2">
        <div className="grid gap-1">
          <label className="text-xs" htmlFor="activity-name">Nombre</label>
          <input
            id="activity-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded-lg border px-3 py-2 tap-target"
            placeholder="Ej. Química Inorgánica"
          />
        </div>

        <div className="grid gap-1">
          <span className="text-xs">Color</span>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              {COLORS.slice(0, 6).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className="w-6 h-6 rounded-full border-2"
                  style={{ backgroundColor: c, borderColor: color === c ? '#111827' : 'transparent' }}
                  aria-label={`Elegir color ${c}`}
                  title={c}
                />
              ))}
            </div>

            <button
              type="button"
              className="text-xs rounded-lg border px-2 py-1"
              onClick={() => setShowMoreColors((s) => !s)}
              aria-expanded={showMoreColors}
              aria-controls="more-colors-pop"
              title="Más colores"
            >
              Más colores
            </button>

            {showMoreColors && (
              <div id="more-colors-pop" ref={popRef} className="relative z-20">
                <div className="absolute mt-2 rounded-lg border bg-white p-2 shadow-sm"
                     style={{ minWidth: 180 }}>
                  <div className="grid" style={{ gridTemplateColumns: 'repeat(6, 1fr)', gap: 6 }}>
                    {COLORS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => { setColor(c); setShowMoreColors(false) }}
                        className="w-6 h-6 rounded-full border-2"
                        style={{ backgroundColor: c, borderColor: color === c ? '#111827' : 'transparent' }}
                        aria-label={`Elegir color ${c}`}
                        title={c}
                      />
                    ))}
                  </div>

                  <div className="mt-2">
                    <label className="text-xs">Personalizado</label>
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        type="color"
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        aria-label="Elegir color personalizado"
                        title={color}
                      />
                      <input
                        className="rounded-lg border px-2 py-1 text-xs"
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-8">
          <button type="submit" className="rounded-lg border px-3 py-2 tap-target">
            Agregar
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xs">Seleccionado:</span>
            <span className="inline-flex items-center gap-2 rounded-full border px-2 py-1">
              <span className="w-3 h-3 rounded-full border" style={{ background: color }} />
              <span className="text-xs">{color}</span>
            </span>
          </div>
        </div>
      </form>

      {/* Lista de actividades disponibles para arrastrar o "colocar" */}
      <div className="mt-3">
        <h3 className="text-sm font-medium mb-2">Actividades disponibles</h3>

        {activities.length === 0 ? (
          <div className="text-xs text-gray-500">
            No hay actividades aún. Creá una arriba y arrastrala a la grilla,
            o usá "Colocar" y tocá una casilla.
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {activities.map((activity) => (
              <ActivityBlock key={activity.id} activity={activity} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
