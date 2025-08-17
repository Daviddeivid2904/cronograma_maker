import React, { useRef, useState } from 'react'
import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'

export default function Block({ block, onResizeStart, onDelete }){
  const {attributes, listeners, setNodeRef, transform} = useDraggable({
    id: block.id,
    data: { type:'block', blockId:block.id }
  })
  const style = {
    transform: CSS.Translate.toString(transform),
    top: block.top,
    height: block.height,
    backgroundColor: block.color,
  }

  return (
    <div ref={setNodeRef}
      {...attributes}
      {...listeners}
      className="absolute left-1 right-1 rounded-lg shadow-sm text-white text-xs px-2 py-1 select-none cursor-grab active:cursor-grabbing hover:shadow-md transition-all duration-200 hover:scale-[1.02]"
      style={style}
    >
      <div className="font-semibold text-[13px] leading-4">{block.name}</div>
      <div className="opacity-90">{block.timeLabel}</div>
      {/* Delete button */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          onDelete(block.id)
        }}
        className="absolute top-1 right-1 w-4 h-4 bg-white/20 hover:bg-white/30 rounded-full text-white text-xs flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
        title="Eliminar actividad"
      >
        ×
      </button>
      {/* Resize handle bottom */}
      <div
        className="absolute bottom-0 left-0 right-0 h-2 cursor-ns-resize hover:bg-black/20 transition-colors"
        onMouseDown={(e)=>onResizeStart(e, block.id, 'bottom')}
        style={{ background: 'rgba(0,0,0,0.15)', borderBottomLeftRadius:8, borderBottomRightRadius:8 }}
      />
      
      {/* Resize handle top */}
      <div
        className="absolute top-0 left-0 right-0 h-2 cursor-ns-resize hover:bg-black/20 transition-colors"
        onMouseDown={(e)=>onResizeStart(e, block.id, 'top')}
        style={{ background: 'rgba(0,0,0,0.15)', borderTopLeftRadius:8, borderTopRightRadius:8 }}
      />
    </div>
  )
}
