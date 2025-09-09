// src/components/ActivityList.jsx
import React, { useEffect, useState } from 'react'
import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import clsx from 'clsx'

function ActivityCard({ activity, onAddToGrid, onDelete, armedId, onArm }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `activity-${activity.id}`,
    data: { type: 'activity', activity }
  })

  const isArmed = armedId === activity.id
  

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={clsx(
        'flex items-center justify-between rounded-xl border px-3 py-2 select-none shadow-sm bg-white',
        isDragging && 'opacity-70',
        isArmed && 'ring-2 ring-indigo-500'
      )}
      style={{ transform: CSS.Translate.toString(transform), borderColor: activity.color }}
      // TAP para "armar" modo colocar (mobile-friendly)
      onClick={(e) => { e.stopPropagation(); onArm(activity) }}
      title="Tocar para colocar en una casilla (o arrastrar)"
    >
      <div className="flex items-center gap-3">
        <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: activity.color }} />
        <div className="text-sm font-medium">{activity.name}</div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={(e) => { e.stopPropagation(); onAddToGrid(activity) }}
          className="text-xs rounded-lg bg-indigo-600 text-white px-3 py-1 hover:bg-indigo-700"
          title="Añadir a grilla"
        >
          Añadir
        </button>

        {/* Cruz para borrar */}
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(activity.id) }}
          className="w-6 h-6 grid place-items-center rounded-full border text-gray-500 hover:text-red-600 hover:border-red-500"
          title="Borrar tarjeta y sus bloques"
          aria-label="Borrar"
        >
          ×
        </button>
      </div>
    </div>
  )
}

export default function ActivityList({ activities, onAddToGrid, onDelete }) {
  const [armedId, setArmedId] = useState(null)

  // Cuando WeekGrid termina de colocar, desarmamos
  useEffect(() => {
    function onPlaced() { setArmedId(null) }
    function onCancel() { setArmedId(null) }
    window.addEventListener('placed-activity', onPlaced)
    window.addEventListener('cancel-place-activity', onCancel)
    return () => {
      window.removeEventListener('placed-activity', onPlaced)
      window.removeEventListener('cancel-place-activity', onCancel)
    }
  }, [])

  function arm(activity) {
    setArmedId(activity.id)
    const ev = new CustomEvent('arm-place-activity', { detail: { activity } })
    window.dispatchEvent(ev)
  }

  if (!activities.length) return null

  return (
    <div id="activity-list" className="activity-list space-y-2">
      <div className="flex items-center justify-between">
        <div className="text-xs text-gray-500">
          Arrastrá a la grilla o <span className="font-semibold">tocá</span> una tarjeta y luego una casilla.
        </div>
        {armedId && (
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('cancel-place-activity'))}
            className="text-xs rounded-lg border px-2 py-1 hover:bg-gray-50"
            title="Salir del modo colocar"
          >
            Cancelar
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {activities.map((act, index) => (
          <ActivityCard
            key={act.id}
            activity={act}
            onAddToGrid={onAddToGrid}
            onDelete={onDelete}
            armedId={armedId}
            onArm={arm}
            id={`activity-item-${index}`}
          />
        ))}
      </div>
    </div>
  )
}
