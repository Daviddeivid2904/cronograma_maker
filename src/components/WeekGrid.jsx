import React, { useState } from 'react'
import { useDroppable } from '@dnd-kit/core'
import Block from './Block.jsx'
import { DAYS } from '../lib/time.js'

function DayColumn({ day, children, SLOT_HEIGHT }){
  const { setNodeRef } = useDroppable({ id: `day-${day}`, data:{ type:'day', day } })
  return (
    <div ref={setNodeRef} className="relative border-l border-gray-200 min-h-full col-scroll">
      {/* slot lines */}
      <div className="absolute inset-0">
        {Array.from({length: 30 }).map((_,i)=>(
          <div key={i} className="absolute left-0 right-0 border-t border-gray-100"
               style={{ top: i*SLOT_HEIGHT }} />
        ))}
      </div>
      {children}
    </div>
  )
}

export default function WeekGrid({ 
  activities, 
  setActivities, 
  blocks, 
  setBlocks, 
  containerRef, 
  timeLabels, 
  SLOT_HEIGHT
}){
  const [resizingId, setResizingId] = useState(null)



  // Resizing
  function handleResizeStart(e, id, direction = 'bottom'){
    e.stopPropagation()
    setResizingId(id)
    const startY = e.clientY
    const orig = blocks.find(b=>b.id===id)
    
    const onMove = (ev)=>{
      const dy = ev.clientY - startY
      setBlocks(prev => prev.map(bl => {
        if(bl.id !== id) return bl
        
        let newTop = bl.top
        let newHeight = bl.height
        
        if (direction === 'bottom') {
          // Resize from bottom
          newHeight = Math.max(SLOT_HEIGHT, Math.round((orig.height + dy)/SLOT_HEIGHT)*SLOT_HEIGHT)
        } else if (direction === 'top') {
          // Resize from top
          const newTopOffset = Math.round(dy / SLOT_HEIGHT) * SLOT_HEIGHT
          const maxTopOffset = orig.height - SLOT_HEIGHT
          const clampedTopOffset = Math.max(-maxTopOffset, Math.min(0, newTopOffset))
          
          newTop = orig.top + clampedTopOffset
          newHeight = orig.height - clampedTopOffset
        }
        
        // Ensure minimum height
        if (newHeight < SLOT_HEIGHT) {
          newHeight = SLOT_HEIGHT
          if (direction === 'top') {
            newTop = bl.top + bl.height - SLOT_HEIGHT
          }
        }
        
        // Generar etiqueta de tiempo simple
        const startRowIndex = Math.round(newTop / SLOT_HEIGHT)
        const endRowIndex = startRowIndex + (newHeight / SLOT_HEIGHT)
        const startTime = timeLabels[startRowIndex]
        const endTime = timeLabels[endRowIndex]
        
        return { 
          ...bl, 
          top: newTop, 
          height: newHeight, 
          timeLabel: `${startTime}–${endTime}` 
        }
      }))
    }
    
    const onUp = ()=>{
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
      setResizingId(null)
    }
    
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  // layout
  return (
    <div className="w-full border border-gray-200 rounded-xl overflow-hidden">
      <div className="grid grid-cols-8 bg-white sticky top-0 z-10">
        <div className="bg-gray-50 p-3 text-sm font-medium text-gray-600">Hora</div>
        {DAYS.map(d=>(
          <div key={d} className="p-3 text-center text-sm font-semibold text-gray-700 border-l border-gray-100">{d}</div>
        ))}
      </div>

      <div ref={containerRef} className="grid grid-cols-8 bg-white" style={{ minHeight: timeLabels.length * SLOT_HEIGHT }}>
        {/* Time labels */}
        <div className="relative">
          {timeLabels.map((label, i)=>(
            <div key={label} className="absolute left-0 right-0 text-xs text-gray-500 pr-2"
                 style={{ top: i*SLOT_HEIGHT - 6 }}>
              <div className="text-right pr-2">{label}</div>
            </div>
          ))}
        </div>

        {/* Day columns */}
        {DAYS.map((d, idx)=>(
          <DayColumn key={d} day={d} SLOT_HEIGHT={SLOT_HEIGHT}>
            {blocks.filter(b=>b.dayIndex===idx).map(b=>(
              <Block 
                key={b.id} 
                block={b} 
                onResizeStart={handleResizeStart}
                onDelete={(id) => setBlocks(prev => prev.filter(bl => bl.id !== id))}
              />
            ))}
          </DayColumn>
        ))}
      </div>

      <div className="p-3 bg-gray-50 border-t">
        <span className="text-sm text-gray-500">Tip: Arrastra actividades desde la paleta superior y ajusta su duración desde el borde inferior del bloque.</span>
      </div>
    </div>
  )
}
