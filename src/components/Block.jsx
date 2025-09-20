// src/components/Block.jsx
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'

/**
 * Props:
 * - block
 * - isResizing
 * - isSelected
 * - onResizeStart(e, id, 'top'|'bottom')
 * - onSelect(id)
 * - onDelete(id)
 * - onArmMove(id)    // << NUEVO: tocar el bloque para "armar teletransporte"
 * - onUpdateSubtitle(id, subtitle) // << NUEVO: actualizar subtítulo
 */
export default function Block({ block, isResizing, isSelected, onResizeStart, onSelect, onDelete, onArmMove, onUpdateSubtitle }) {
  const { t } = useTranslation();
  const [showEditModal, setShowEditModal] = useState(false)
  const [subtitle, setSubtitle] = useState(block.subtitle || '')

  const {
    attributes,
    listeners,
    setNodeRef,             // contenedor que se mueve
    setActivatorNodeRef,    // zona que activa el drag
    transform
  } = useDraggable({
    id: `block-${block.id}`,
    data: { type: 'block', blockId: block.id, block },
  })

  // Determinar color de texto según el color de fondo para asegurar contraste
  const getContrastTextColor = (bg) => {
    try {
      if (!bg) return '#ffffff'
      let r, g, b
      if (bg.startsWith('#')) {
        const hex = bg.slice(1)
        const full = hex.length === 3 ? hex.split('').map(c=>c+c).join('') : hex
        r = parseInt(full.slice(0,2),16)
        g = parseInt(full.slice(2,4),16)
        b = parseInt(full.slice(4,6),16)
      } else if (bg.startsWith('rgb')) {
        const m = bg.match(/rgb\s*\(\s*(\d+),\s*(\d+),\s*(\d+)/)
        if (!m) return '#ffffff'
        r = +m[1]; g = +m[2]; b = +m[3]
      } else {
        return '#ffffff'
      }
      const lum = (0.2126 * (r/255) + 0.7152 * (g/255) + 0.0722 * (b/255))
      return lum > 0.6 ? '#0f172a' : '#ffffff'
    } catch (e) {
      return '#ffffff'
    }
  }
  const textColor = getContrastTextColor(block.color)

  const style = {
    transform: CSS.Translate.toString(transform),
    gridColumn: block.dayIndex + 2,
    gridRow: `${block.startSlot} / ${block.endSlot}`,
    backgroundColor: block.color,
    pointerEvents: isResizing ? 'none' : 'auto',
    outline: isSelected ? '2px solid rgba(59,130,246,0.9)' : 'none', // azul
    outlineOffset: '0px',
    borderRadius: '0.5rem',
    color: textColor,
  }

  // Función para manejar el resize en móvil
  const handleResizeStart = (e, direction) => {
    e.preventDefault()
    e.stopPropagation()
    onResizeStart(e, block.id, direction)
  }

  const handleSaveSubtitle = () => {
    onUpdateSubtitle?.(block.id, subtitle)
    setShowEditModal(false)
  }

  return (
    <>
      <div
        ref={setNodeRef}
        id={`block-${block.id}`}
        className="shadow-sm text-xs px-2 py-1 select-none relative"
        style={style}
      >
        {/* Área central: activa drag y además selecciona/arma teletransporte con TAP */}
        <div
          ref={setActivatorNodeRef}
          id={`block-activator-${block.id}`}
          className="absolute inset-x-0 top-2 bottom-2 cursor-grab active:cursor-grabbing"
          {...attributes}
          {...listeners}
          onMouseDown={(e) => { e.stopPropagation(); onSelect?.(block.id) }}
          onClick={(e) => { e.stopPropagation(); onArmMove?.(block.id) }}   // << TAP para "teletransportar"
          title={t('block.tapToMove')}
        />

        {/* Contenido visual */}
        <div className="relative z-[1]">
          <div className="font-semibold text-[13px] leading-4 pointer-events-none">{block.name}</div>
          {block.timeLabel ? <div className="opacity-90 pointer-events-none">{block.timeLabel}</div> : null}
          {block.subtitle && (
            <div className="opacity-80 pointer-events-none text-[11px] leading-3 mt-0.5">{block.subtitle}</div>
          )}
        </div>

        {/* Botón editar subtítulo */}
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); setShowEditModal(true) }}
          className="absolute top-0.5 left-0.5 w-5 h-5 grid place-items-center rounded-full bg-black/30 hover:bg-black/50 text-white text-[10px] z-[3]"
          title={t('block.editSubtitle')}
          aria-label={t('block.editSubtitle')}
          id={`block-edit-subtitle-${block.id}`}
        >
          ✏️
        </button>

        {/* Botón borrar solo este bloque */}
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onDelete?.(block.id) }}
          className="absolute top-0.5 right-0.5 w-5 h-5 grid place-items-center rounded-full bg-black/30 hover:bg-black/50 text-white text-[11px] z-[3]"
          title={t('block.deleteThis')}
          aria-label={t('block.delete')}
          id={`block-delete-${block.id}`}
        >
          ×
        </button>

        {/* Handle superior (resize arriba) - Separado del drag */}
        <div
          id={`block-resize-top-${block.id}`}
          className="absolute top-0 left-0 right-0 h-3 cursor-ns-resize z-[4] touch-none"
          onMouseDown={(e) => handleResizeStart(e, 'top')}
          onTouchStart={(e) => handleResizeStart(e, 'top')}
          style={{ 
            background: 'rgba(0,0,0,0.15)', 
            borderTopLeftRadius: 8, 
            borderTopRightRadius: 8,
            pointerEvents: 'auto'
          }}
          title={t('block.resizeUp')}
        />

        {/* Handle inferior (resize abajo) - Separado del drag */}
        <div
          id={`block-resize-bottom-${block.id}`}
          className="absolute bottom-0 left-0 right-0 h-3 cursor-ns-resize z-[4] touch-none"
          onMouseDown={(e) => handleResizeStart(e, 'bottom')}
          onTouchStart={(e) => handleResizeStart(e, 'bottom')}
          style={{ 
            background: 'rgba(0,0,0,0.15)', 
            borderBottomLeftRadius: 8, 
            borderBottomRightRadius: 8,
            pointerEvents: 'auto'
          }}
          title={t('block.resizeDown')}
        />

        {/* Indicadores visuales para móvil */}
        <div className="absolute top-1 left-1 w-2 h-2 bg-white/30 rounded-full pointer-events-none z-[1]" />
        <div className="absolute bottom-1 left-1 w-2 h-2 bg-white/30 rounded-full pointer-events-none z-[1]" />
      </div>

      {/* Modal de edición de subtítulo */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 w-full max-w-sm">
            <h3 className="text-lg font-semibold mb-3">{t('block.modal.title')}</h3>
            <p className="text-sm text-gray-600 mb-3">{t('block.modal.desc')}</p>
            
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder={t('block.subtitlePlaceholder')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
              id={`subtitle-input-${block.id}`}
            />
            
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                id={`cancel-edit-subtitle-${block.id}`}
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleSaveSubtitle}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                id={`save-edit-subtitle-${block.id}`}
              >
                {t('common.save')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
