// src/components/Block.jsx
import React from 'react'
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
 */
export default function Block({ block, isResizing, isSelected, onResizeStart, onSelect, onDelete, onArmMove }) {
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

  const style = {
    transform: CSS.Translate.toString(transform),
    gridColumn: block.dayIndex + 2,
    gridRow: `${block.startSlot} / ${block.endSlot}`,
    backgroundColor: block.color,
    pointerEvents: isResizing ? 'none' : 'auto',
    outline: isSelected ? '2px solid rgba(59,130,246,0.9)' : 'none', // azul
    outlineOffset: '0px',
    borderRadius: '0.5rem',
  }

  // Función para manejar el resize en móvil
  const handleResizeStart = (e, direction) => {
    e.preventDefault()
    e.stopPropagation()
    onResizeStart(e, block.id, direction)
  }

  return (
    <div
      ref={setNodeRef}
      className="shadow-sm text-white text-xs px-2 py-1 select-none relative"
      style={style}
    >
      {/* Área central: activa drag y además selecciona/arma teletransporte con TAP */}
      <div
        ref={setActivatorNodeRef}
        className="absolute inset-x-0 top-2 bottom-2 cursor-grab active:cursor-grabbing"
        {...attributes}
        {...listeners}
        onMouseDown={(e) => { e.stopPropagation(); onSelect?.(block.id) }}
        onClick={(e) => { e.stopPropagation(); onArmMove?.(block.id) }}   // << TAP para "teletransportar"
        title="Tocar para mover a otra casilla; arrastrar para reubicar"
      />

      {/* Contenido visual */}
      <div className="relative z-[1]">
        <div className="font-semibold text-[13px] leading-4 pointer-events-none">{block.name}</div>
        {block.timeLabel ? <div className="opacity-90 pointer-events-none">{block.timeLabel}</div> : null}
      </div>

      {/* Botón borrar solo este bloque */}
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onDelete?.(block.id) }}
        className="absolute top-0.5 right-0.5 w-5 h-5 grid place-items-center rounded-full bg-black/30 hover:bg-black/50 text-white text-[11px] z-[3]"
        title="Borrar este bloque"
        aria-label="Borrar bloque"
      >
        ×
      </button>

      {/* Handle superior (resize arriba) - Separado del drag */}
      <div
        className="absolute top-0 left-0 right-0 h-3 cursor-ns-resize z-[4] touch-none"
        onMouseDown={(e) => handleResizeStart(e, 'top')}
        onTouchStart={(e) => handleResizeStart(e, 'top')}
        style={{ 
          background: 'rgba(0,0,0,0.15)', 
          borderTopLeftRadius: 8, 
          borderTopRightRadius: 8,
          pointerEvents: 'auto'
        }}
        title="Estirar hacia arriba"
      />

      {/* Handle inferior (resize abajo) - Separado del drag */}
      <div
        className="absolute bottom-0 left-0 right-0 h-3 cursor-ns-resize z-[4] touch-none"
        onMouseDown={(e) => handleResizeStart(e, 'bottom')}
        onTouchStart={(e) => handleResizeStart(e, 'bottom')}
        style={{ 
          background: 'rgba(0,0,0,0.15)', 
          borderBottomLeftRadius: 8, 
          borderBottomRightRadius: 8,
          pointerEvents: 'auto'
        }}
        title="Estirar hacia abajo"
      />

      {/* Indicadores visuales para móvil */}
      <div className="absolute top-1 left-1 w-2 h-2 bg-white/30 rounded-full pointer-events-none z-[1]" />
      <div className="absolute bottom-1 left-1 w-2 h-2 bg-white/30 rounded-full pointer-events-none z-[1]" />
    </div>
  )
}
