// src/components/ActivityPalette.jsx
import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'

// Colores rápidos (no cambiar): defaults fuertes
const QUICK_COLORS = [
  '#fde68a', '#fbcfe8', '#bfdbfe', '#bbf7d0',
  '#ddd6fe', '#fecaca',
];

// Más colores: mitad pasteles NUEVOS y mitad fuertes normales
const MORE_PASTEL_COLORS = [
  '#bae6fd', '#fde2e2',
  '#e9d5ff', '#c7d2fe', '#fee2b3', '#d1fae5',
  '#60a5fa', '#34d399', '#f472b6', '#f59e0b',
  '#a78bfa', '#fb7185', 
];

const MORE_STRONG_COLORS = [
  '#22d3ee', '#4ade80', '#ef4444', '#10b981',
  '#f97316', '#6366f1', '#0ea5e9', '#14b8a6',
  '#eab308', '#db2777', '#7c3aed', '#ea580c',
];

const MORE_COLORS = [...MORE_PASTEL_COLORS, ...MORE_STRONG_COLORS];

function ActivityBlock({ activity }) {
  const { t } = useTranslation();
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: `palette-${activity.id}`,
    data: {
      type: 'palette-activity',
      activity,
    },
  })

  const style = {
    transform: CSS.Translate.toString(transform),
    touchAction: 'none',
  }

  return (
    <div className="flex items-center gap-2 select-none">
      <div
        ref={setNodeRef}
        {...attributes}
        {...listeners}
        style={style}
        className="rounded-lg shadow-sm border px-3 py-2 cursor-grab active:cursor-grabbing"
        title={t('palette.dragToGrid')}
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
        title={t('palette.placeTip')}
      >
        {t('palette.place')}
      </button>
    </div>
  )
}

export default function ActivityPalette({ onAdd, activities = [] }) {
  const { t } = useTranslation();
  const [name, setName] = useState('')
  const [defaultIdx, setDefaultIdx] = useState(0)
  const [color, setColor] = useState(QUICK_COLORS[0])

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

  function getColorByIndex(idx) {
    const totalQuick = QUICK_COLORS.length
    if (idx < totalQuick) return QUICK_COLORS[idx]
    const offset = idx - totalQuick
    const totalMore = MORE_COLORS.length
    if (offset < totalMore) return MORE_COLORS[offset]
    // wrap
    return QUICK_COLORS[0]
  }

  function handleSubmit(e) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    onAdd?.({ name: trimmed, color })
    setName('')
    // Avanzar el color por defecto al siguiente para la próxima tarjeta
    const totalCount = QUICK_COLORS.length + MORE_COLORS.length
    const next = (defaultIdx + 1) % totalCount
    setDefaultIdx(next)
    setColor(getColorByIndex(next))
  }

  return (
    <div id="activity-palette" className="bg-white rounded-lg border p-4 shadow-sm">
      <h2 id="palette-title" className="text-sm font-semibold mb-3">{t('palette.create')}</h2>

      <form id="palette-form" onSubmit={handleSubmit} className="space-y-3">
        <div>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
            placeholder={t('palette.namePlaceholder')}
          />
        </div>

        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1">
              {QUICK_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className="w-5 h-5 rounded-full border-2"
                  style={{ backgroundColor: c, borderColor: color === c ? '#111827' : 'transparent' }}
                  title={c}
                />
              ))}
            </div>

            <button
              type="button"
              className="text-xs rounded border px-2 py-1"
              onClick={() => setShowMoreColors((s) => !s)}
            title={t('palette.moreColors')}
            >
            {t('palette.more')}
            </button>

            {showMoreColors && (
              <div ref={popRef} className="relative z-20">
                <div className="absolute mt-2 rounded-lg border bg-white p-2 shadow-sm"
                     style={{ minWidth: 160 }}>
                  <div className="grid" style={{ gridTemplateColumns: 'repeat(6, 1fr)', gap: 4 }}>
                    {MORE_COLORS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => { setColor(c); setShowMoreColors(false) }}
                        className="w-5 h-5 rounded-full border-2"
                        style={{ backgroundColor: c, borderColor: color === c ? '#111827' : 'transparent' }}
                        title={c}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <button
          id="add-button"
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg text-sm hover:bg-blue-700"
        >
        {t('palette.add')}
        </button>
      </form>

      {activities.length > 0 && (
        <div className="mt-4 pt-3 border-t">
          <h3 className="text-xs font-medium text-gray-600 mb-2">{t('palette.activities')}</h3>
          <div className="space-y-2">
            {activities.map((activity, index) => (
              <ActivityBlock key={activity.id} activity={activity} id={`activity-block-${index}`} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
