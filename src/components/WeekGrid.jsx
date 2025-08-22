// src/components/WeekGrid.jsx
import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  DndContext,
  useDroppable,
  useDraggable,
  useSensor,
  useSensors,
  PointerSensor,
  TouchSensor,
} from '@dnd-kit/core'
import {
  DAYS as DAYS_FULL,
  buildTimeSlots,
  slotIndexToLabel,
  timeToSlotIndexRounded,
} from '../lib/time.js'

/* Utils */
const clamp = (v, a, b) => Math.min(b, Math.max(a, v))

/* ===========================
   Bloque con drag + manijas
   =========================== */
function DraggableBlock({
  block,
  selected,
  onSelect,
  onResizePointerDown,   // (id, 'top'|'bottom', event)
  onDelete,
  onUpdateSubtitle,      // << NUEVO: actualizar subtítulo
  onUpdateTitle,         // << NUEVO: actualizar título
  onUpdateTime,          // << NUEVO: actualizar hora
  stepMin,               // << NUEVO: paso de tiempo para cálculos
  start,                 // << NUEVO: hora de inicio del día
  isMobile,              // << NUEVO: si estamos en móvil
}) {
  const [showEditModal, setShowEditModal] = useState(false)
  const [subtitle, setSubtitle] = useState(block.subtitle || '')
  const [title, setTitle] = useState(block.name || '')
  
  // Extraer horas actuales del timeLabel
  const timeMatch = block.timeLabel.match(/(\d{2}:\d{2})–(\d{2}:\d{2})/)
  const [startTime, setStartTime] = useState(() => {
    const match = block.timeLabel.match(/(\d{2}:\d{2})–(\d{2}:\d{2})/)
    return match ? match[1] : '09:00'
  })
  const [endTime, setEndTime] = useState(() => {
    const match = block.timeLabel.match(/(\d{2}:\d{2})–(\d{2}:\d{2})/)
    return match ? match[2] : '10:00'
  })

  // Actualizar horas cuando cambia el block
  useEffect(() => {
    const match = block.timeLabel.match(/(\d{2}:\d{2})–(\d{2}:\d{2})/)
    if (match) {
      setStartTime(match[1])
      setEndTime(match[2])
    }
  }, [block.timeLabel])

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `block-${block.id}`,
    data: { type: 'block', blockId: block.id },
  })

  const style = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    touchAction: 'none',
  }

  const handleSaveChanges = () => {
    onUpdateSubtitle?.(block.id, subtitle)
    onUpdateTitle?.(block.id, title)
    onUpdateTime?.(block.id, startTime, endTime)
    setShowEditModal(false)
  }

  return (
    <>
      <div
        ref={setNodeRef}
        {...attributes}
        {...listeners}
        className={`absolute left-1 right-1 rounded-lg shadow-sm border
                    ${selected ? 'ring-2 ring-indigo-500 ring-offset-2' : 'border-gray-200'}
                    ${isDragging ? 'opacity-80' : 'opacity-100'}`}
        onClick={(e) => { e.stopPropagation(); onSelect(block.id) }}
        style={{
          top: block.topPx,
          height: block.heightPx,
          backgroundColor: block.color,
          color: '#0f172a',
          ...style,
        }}
      >
        {/* botón editar subtítulo */}
        <button
          type="button"
          className="absolute top-1 left-1 w-5 h-5 flex items-center justify-center rounded-full bg-white/80 border text-gray-600 hover:text-blue-600 hover:border-blue-500 shadow-sm"
          onPointerDown={(e)=>e.stopPropagation()}
          onClick={(e) => { e.stopPropagation(); setShowEditModal(true) }}
          aria-label="Editar actividad"
          title="Editar título y subtítulo"
          style={{ touchAction: 'none' }}
        >
          <span className="text-xs">✏️</span>
        </button>

        {/* botón eliminar */}
        <button
          type="button"
          className="absolute top-1 right-1 w-5 h-5 flex items-center justify-center rounded-full bg-white border text-gray-500 hover:text-red-600 hover:border-red-500 shadow-sm"
          onPointerDown={(e)=>e.stopPropagation()}
          onClick={(e) => { e.stopPropagation(); onDelete?.(block.id) }}
          aria-label="Eliminar bloque"
          title="Eliminar"
          style={{ touchAction: 'none' }}
        >
          <span className="text-sm leading-none">×</span>
        </button>

        {/* manija superior (drag directo) */}
        <div
          className="absolute -top-1 left-1/2 -translate-x-1/2 w-7 h-2 rounded-md cursor-ns-resize bg-white/80 border"
          onPointerDown={(e) => { 
            e.preventDefault(); 
            e.stopPropagation(); 
            onResizePointerDown(block.id, 'top', e) 
          }}
          onTouchStart={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onResizePointerDown(block.id, 'top', e);
          }}
          title="Redimensionar"
          style={{ 
            touchAction: 'none',
            // Hacer más grande en móvil
            width: isMobile ? '32px' : '28px',
            height: isMobile ? '8px' : '8px',
            marginLeft: isMobile ? '-16px' : '-14px',
            backgroundColor: isMobile ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.8)',
            border: isMobile ? '2px solid rgba(59,130,246,0.6)' : '1px solid rgba(0,0,0,0.2)'
          }}
        >
          {isMobile && (
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
            </div>
          )}
        </div>

        {/* contenido */}
        <div className="px-2 py-2 text-xs leading-4 select-none text-center">
          <div className="font-semibold truncate">{block.name}</div>
          {block.subtitle && (
            <div className="opacity-70 text-[10px] leading-3 mt-0.5 truncate">{block.subtitle}</div>
          )}
          <div className="opacity-80">{block.timeLabel}</div>
        </div>

        {/* manija inferior (drag directo) */}
        <div
          className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-7 h-2 rounded-md cursor-ns-resize bg-white/80 border"
          onPointerDown={(e) => { 
            e.preventDefault(); 
            e.stopPropagation(); 
            onResizePointerDown(block.id, 'bottom', e) 
          }}
          onTouchStart={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onResizePointerDown(block.id, 'bottom', e);
          }}
          title="Redimensionar"
          style={{ 
            touchAction: 'none',
            // Hacer más grande en móvil
            width: isMobile ? '32px' : '28px',
            height: isMobile ? '8px' : '8px',
            marginLeft: isMobile ? '-16px' : '-14px',
            backgroundColor: isMobile ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.8)',
            border: isMobile ? '2px solid rgba(59,130,246,0.6)' : '1px solid rgba(0,0,0,0.2)'
          }}
        >
          {isMobile && (
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de edición de subtítulo */}
      {showEditModal && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onKeyDown={(e) => e.stopPropagation()}
        >
          <div className="bg-white rounded-lg p-4 w-full max-w-sm">
            <h3 className="text-lg font-semibold mb-3">Editar actividad</h3>
            <p className="text-sm text-gray-600 mb-3">
              Modifica el título y agrega información adicional como "Teórica", "Práctica", profesor, etc.
            </p>
            
            <div className="space-y-3 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Nombre de la actividad"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hora inicio</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    step={stepMin * 60}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hora fin</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    step={stepMin * 60}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subtítulo (opcional)</label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="Ej: Teórica - Prof. García"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveChanges}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

/* ===========================
   Casilla droppable (celda)
   =========================== */
function Cell({ dayIndex, slotIndex, onCellClick, isPlacementArmed }) {
  const id = `cell-${dayIndex}-${slotIndex}`
  const { setNodeRef, isOver } = useDroppable({
    id,
    data: { type: 'cell', dayIndex, slotIndex },
  })

  return (
    <div
      ref={setNodeRef}
      className={`border-l border-gray-100 border-t relative
                  ${isOver ? 'bg-indigo-50/70' : 'bg-white/0'}
                  ${isPlacementArmed ? 'cursor-crosshair' : 'cursor-default'}`}
      onClick={() => onCellClick(dayIndex, slotIndex)}
      role="gridcell"
      aria-label={`Día ${dayIndex}, slot ${slotIndex}`}
      style={{ minHeight: 'var(--slot-height)' }}
    />
  )
}

/* ===========================
   Componente principal
   =========================== */
export default function WeekGrid({ activities, config, children, onBlocksChange }) {
  const {
    days = DAYS_FULL,
    start = '07:00',
    end = '22:00',
    stepMin = 30,
    lunchEnabled = false,
    lunchStart = '13:00',
    lunchEnd = '14:00',
  } = config ?? {}

  const slots = useMemo(() => {
    const [eh, em] = end.split(':').map(Number)
    const endMin = eh * 60 + em
    if (!Number.isFinite(endMin) || !Number.isFinite(stepMin) || stepMin <= 0) {
      return buildTimeSlots({ start, end, stepMin })
    }
    // Extender al próximo múltiplo del paso elegido
    let extendedMin = endMin
    const modStep = extendedMin % stepMin
    extendedMin += modStep === 0 ? stepMin : (stepMin - modStep)
    extendedMin = extendedMin % (24 * 60)
    const ehh = String(Math.floor(extendedMin / 60)).padStart(2, '0')
    const emm = String(extendedMin % 60).padStart(2, '0')
    const endExtended = `${ehh}:${emm}`
    return buildTimeSlots({ start, end: endExtended, stepMin })
  }, [start, end, stepMin])

  const endExtendedLabel = useMemo(() => {
    const [eh, em] = end.split(':').map(Number)
    let extendedMin = eh * 60 + em
    if (!Number.isFinite(extendedMin)) return end
    const modStep = extendedMin % stepMin
    extendedMin += modStep === 0 ? stepMin : (stepMin - modStep)
    extendedMin = extendedMin % (24 * 60)
    const ehh = String(Math.floor(extendedMin / 60)).padStart(2, '0')
    const emm = String(extendedMin % 60).padStart(2, '0')
    return `${ehh}:${emm}`
  }, [end, stepMin])

  // estado bloques
  const [blocks, setBlocks] = useState([])
  useEffect(() => { onBlocksChange?.(blocks) }, [blocks, onBlocksChange])

  const [selectedId, setSelectedId] = useState(null)

  // Resize state (se maneja con listeners globales mientras está activo)
  const [resizing, setResizing] = useState(null) // { id, handle: 'top'|'bottom' }
  const columnRefs = useRef({})
  const resizingCol = useRef(0)

  // "armar" para colocar por click (desde Palette/List/BreakTools)
  const [placeActivity, setPlaceActivity] = useState(null)
  const [moveBlockId, setMoveBlockId] = useState(null)

  // mido el alto del slot desde CSS var (cambia en responsive)
  const slotPxRef = useRef(36)
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth <= 768 : false)

  // sensores: pointer + touch
  const sensors = useSensors(
    useSensor(PointerSensor, { 
      activationConstraint: { 
        distance: isMobile ? 8 : 4 
      } 
    }),
    useSensor(TouchSensor,   { 
      activationConstraint: { 
        delay: isMobile ? 120 : 80, 
        tolerance: isMobile ? 12 : 8 
      } 
    }),
  )

  useEffect(() => {
    const read = () => {
      const v = getComputedStyle(document.documentElement).getPropertyValue('--slot-height').trim()
      const num = parseInt(v)
      if (!Number.isNaN(num)) slotPxRef.current = num
    }
    read()
    const onR = () => read()
    window.addEventListener('resize', onR)
    return () => window.removeEventListener('resize', onR)
  }, [])

  useEffect(() => {
    const handle = () => setIsMobile(window.innerWidth <= 768)
    window.addEventListener('resize', handle)
    return () => window.removeEventListener('resize', handle)
  }, [])

  // helpers top/height
  const toTopPx = (slotIndex) => slotIndex * slotPxRef.current
  const toHeightPx = (startSlot, endSlot) => (endSlot - startSlot) * slotPxRef.current

  // Para el resize, permitir hasta el slot extendido
  const maxSlotIndex = slots.length

  // Actualizar bloques cuando cambia el paso de tiempo
  useEffect(() => {
    if (blocks.length === 0) return
    
    setBlocks(prevBlocks => prevBlocks.map(block => {
      // Extraer las horas actuales del timeLabel
      const timeMatch = block.timeLabel.match(/(\d{2}:\d{2})–(\d{2}:\d{2})/)
      if (!timeMatch) return block
      
      const startTime = timeMatch[1]
      const endTime = timeMatch[2]
      
      // Convertir a minutos desde el inicio del día
      const [startH, startM] = startTime.split(':').map(Number)
      const [endH, endM] = endTime.split(':').map(Number)
      const [baseH, baseM] = start.split(':').map(Number)
      
      const startMinutes = startH * 60 + startM
      const endMinutes = endH * 60 + endM
      const baseMinutes = baseH * 60 + baseM
      
      // Calcular slots basados en el nuevo paso
      const newStartSlot = Math.round((startMinutes - baseMinutes) / stepMin)
      const newEndSlot = Math.round((endMinutes - baseMinutes) / stepMin)
      
      // Asegurar que los slots estén dentro de los límites
      const clampedStartSlot = Math.max(0, Math.min(newStartSlot, maxSlotIndex - 1))
      const clampedEndSlot = Math.max(clampedStartSlot + 1, Math.min(newEndSlot, maxSlotIndex))
      
      // Recalcular posición y altura
      const newTopPx = toTopPx(clampedStartSlot)
      const newHeightPx = toHeightPx(clampedStartSlot, clampedEndSlot)
      
      // Generar nuevo timeLabel
      const newTimeLabel = slotIndexToLabel(start, stepMin, clampedStartSlot + 1, clampedEndSlot + 1)
      
      return {
        ...block,
        startSlot: clampedStartSlot,
        endSlot: clampedEndSlot,
        topPx: newTopPx,
        heightPx: newHeightPx,
        timeLabel: newTimeLabel,
      }
    }))
  }, [stepMin, start, maxSlotIndex])

  // escuchar "arm-place-activity" y "cancel-place-activity"
  useEffect(() => {
    function onArm(ev) { setPlaceActivity(ev.detail?.activity || null) }
    function onCancel() { setPlaceActivity(null) }
    window.addEventListener('arm-place-activity', onArm)
    window.addEventListener('cancel-place-activity', onCancel)
    return () => {
      window.removeEventListener('arm-place-activity', onArm)
      window.removeEventListener('cancel-place-activity', onCancel)
    }
  }, [])

  // add directa "Añadir" desde ActivityList
  useEffect(() => {
    function onAddToGrid(ev) {
      const act = ev.detail
      if (!act) return
      const defaultDur = Math.max(2, Math.round(60 / stepMin)) // ~1h
      addBlockAt({
        dayIndex: 0,
        startSlot: 1,
        durationSlots: defaultDur,
        activity: act,
      })
    }
    window.addEventListener('add-activity-to-grid', onAddToGrid)
    return () => window.removeEventListener('add-activity-to-grid', onAddToGrid)
  }, [stepMin])

  // borrar bloques al eliminar una actividad desde la lista
  useEffect(() => {
    function onDeleteActivity(ev) {
      const { activityId } = ev.detail || {}
      if (!activityId) return
      setBlocks(prev => prev.filter(b => b.activityId !== activityId))
      setSelectedId(s => (prev => prev) && null)
    }
    window.addEventListener('delete-activity', onDeleteActivity)
    return () => window.removeEventListener('delete-activity', onDeleteActivity)
  }, [])

  // borrar con tecla
  useEffect(() => {
    function onKey(e) {
      if (!selectedId) return
      // No borrar si hay un modal abierto
      if (document.querySelector('.fixed.inset-0.bg-black\\/50')) return
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault()
        setBlocks(prev => prev.filter(b => b.id !== selectedId))
        setSelectedId(null)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selectedId])

  // crear bloque
  function addBlockAt({ dayIndex, startSlot, durationSlots, activity }) {
    const endSlot = Math.min(maxSlotIndex + 1, startSlot + durationSlots)
    const newBlock = {
      id: crypto.randomUUID(),
      dayIndex,
      startSlot,
      endSlot,
      topPx: toTopPx(startSlot),
      heightPx: toHeightPx(startSlot, endSlot),
      activityId: activity.id,
      name: activity.name,
      color: activity.color,
      subtitle: '', // << NUEVO: campo para subtítulos
      timeLabel: slotIndexToLabel(start, stepMin, startSlot + 1, endSlot + 1), // 1-based
    }
    
    setBlocks(prev => [...prev, newBlock])
  }

  // seleccionar / mover
  function handleBlockSelect(id) {
    setSelectedId(id)
    setMoveBlockId(id)
    setPlaceActivity(null)
  }

  // click en celda -> colocar o mover
  function handleCellClick(dayIndex, slotIndex) {
    if (moveBlockId) {
      setBlocks(prev => prev.map(b => {
        if (b.id !== moveBlockId) return b
        const duration = b.endSlot - b.startSlot
        const newStart = slotIndex
        const newEnd = Math.min(maxSlotIndex + 1, newStart + duration)
        return {
          ...b,
          dayIndex,
          startSlot: newStart,
          endSlot: newEnd,
          topPx: toTopPx(newStart),
          heightPx: toHeightPx(newStart, newEnd),
          timeLabel: slotIndexToLabel(start, stepMin, newStart + 1, newEnd + 1),
        }
      }))
      setSelectedId(moveBlockId)
      setMoveBlockId(null)
      return
    }
    if (!placeActivity) return
    const defaultDur = Math.max(2, Math.round(60 / stepMin))
    addBlockAt({ dayIndex, startSlot: slotIndex, durationSlots: defaultDur, activity: placeActivity })
    setPlaceActivity(null)
    window.dispatchEvent(new CustomEvent('placed-activity'))
  }

  // dnd end (crear o mover)
  function onDragEnd(ev) {
    const { active, over } = ev
    if (!over) return
    const overData = over.data?.current
    if (!overData || overData.type !== 'cell') return
    const { dayIndex, slotIndex } = overData
    const activeData = active.data?.current

    if (activeData?.type === 'activity' || activeData?.type === 'palette-activity') {
      const activity = activeData.activity
      if (!activity) return
      const defaultDur = Math.max(2, Math.round(60 / stepMin))
      addBlockAt({ dayIndex, startSlot: slotIndex, durationSlots: defaultDur, activity })
      return
    }

    if (activeData?.type === 'block') {
      const id = activeData.blockId
      setBlocks(prev => prev.map(b => {
        if (b.id !== id) return b
        const duration = b.endSlot - b.startSlot
        const newStart = slotIndex
        const newEnd = Math.min(maxSlotIndex + 1, newStart + duration)
        return {
          ...b,
          dayIndex,
          startSlot: newStart,
          endSlot: newEnd,
          topPx: toTopPx(newStart),
          heightPx: toHeightPx(newStart, newEnd),
          timeLabel: slotIndexToLabel(start, stepMin, newStart + 1, newEnd + 1),
        }
      }))
      setSelectedId(id)
    }
  }

  /* ============
     RESIZE REAL
     ============ */
  function onResizePointerDown(blockId, handle, e) {
    // Prevenir que el DnD se active durante el resize
    e.preventDefault()
    e.stopPropagation()
    
    // recordar columna del bloque a redimensionar
    const b = blocks.find(x => x.id === blockId)
    if (b) resizingCol.current = b.dayIndex

    setResizing({ id: blockId, handle })
    
    // capturar el pointer para recibir los moves sin soltar
    try { 
      if (e.pointerId) {
        e.currentTarget.setPointerCapture?.(e.pointerId) 
      }
    } catch {}
  }

  useEffect(() => {
    if (!resizing) return

    const onMove = (ev) => {
      // Prevenir scroll durante el resize
      ev.preventDefault()
      
      const clientY = ev.clientY ?? ev.touches?.[0]?.clientY
      if (clientY == null) return
      const colEl = columnRefs.current?.[resizingCol.current]
      if (!colEl) return

      const rect = colEl.getBoundingClientRect()
      const y = clientY - rect.top
      const slotIndex = clamp(Math.round(y / slotPxRef.current), 0, maxSlotIndex)

      setBlocks(prev => prev.map(b => {
        if (b.id !== resizing.id) return b
        if (resizing.handle === 'bottom') {
          const minEnd = b.startSlot + 1
          const newEnd = clamp(slotIndex + 1, minEnd, maxSlotIndex + 1)
          return {
            ...b,
            endSlot: newEnd,
            heightPx: toHeightPx(b.startSlot, newEnd),
            timeLabel: slotIndexToLabel(start, stepMin, b.startSlot + 1, newEnd + 1),
          }
        } else {
          const maxStart = b.endSlot - 1
          const newStart = clamp(slotIndex, 0, maxStart)
          return {
            ...b,
            startSlot: newStart,
            topPx: toTopPx(newStart),
            heightPx: toHeightPx(newStart, b.endSlot),
            timeLabel: slotIndexToLabel(start, stepMin, newStart + 1, b.endSlot + 1),
          }
        }
      }))
    }

    const onUp = () => setResizing(null)

    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerup', onUp, { passive: true })
    window.addEventListener('pointercancel', onUp, { passive: true })
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
    }
  }, [resizing, start, stepMin, maxSlotIndex])

  // línea/área de almuerzo
  const lunchSlotIndex = useMemo(() => {
    if (!lunchEnabled) return null
    const [sh, sm] = start.split(':').map(Number)
    const [lh, lm] = lunchStart.split(':').map(Number)
    const base = sh * 60 + sm
    const lunch = lh * 60 + lm
    const diff = lunch - base
    const slot = Math.round(diff / stepMin)
    return clamp(slot, 0, slots.length - 1)
  }, [lunchEnabled, lunchStart, start, stepMin, slots.length])

  const lunchEndSlotIndex = useMemo(() => {
    if (!lunchEnabled) return null
    const [sh, sm] = start.split(':').map(Number)
    const [lh, lm] = lunchEnd.split(':').map(Number)
    const base = sh * 60 + sm
    const lunch = lh * 60 + lm
    const diff = lunch - base
    const slot = Math.round(diff / stepMin)
    return clamp(slot, 0, slots.length - 1)
  }, [lunchEnabled, lunchEnd, start, stepMin, slots.length])

  const isPlacementArmed = !!placeActivity

  // columnas: responsive
  const leftColWidth = isMobile ? 'minmax(54px, 78px)' : 'minmax(68px, 92px)'
  const dayColWidth  = isMobile ? 'minmax(160px, 1fr)' : 'minmax(140px, 1fr)'
  const rightHeaderCols = `repeat(${days.length}, ${dayColWidth})`

  return (
    <DndContext sensors={sensors} onDragEnd={onDragEnd}>
      {children}

      <div className="w-full border border-gray-200 rounded-xl bg-white overflow-hidden">
        {/* Contenedor principal */}
        <div className="relative">
          <div className="grid" style={{ gridTemplateColumns: `${leftColWidth} 1fr` }}>
            {/* Columna fija de horas */}
            <div className="relative">
              <div className="sticky top-0 z-30 bg-white p-3 text-xs sm:text-sm font-medium text-gray-600 border-b border-gray-100">
                {isPlacementArmed ? 'Modo colocar' : 'Hora'}
              </div>
              <div className="relative">
                {slots.map((_, i) => {
                  const [sh, sm] = start.split(':').map(Number)
                  const base = sh * 60 + sm
                  const slotTime = base + (i * stepMin)
                  const nextSlotTime = base + ((i + 1) * stepMin)
                  const h = String(Math.floor(slotTime / 60)).padStart(2, '0')
                  const m = String(slotTime % 60).padStart(2, '0')
                  const nextH = String(Math.floor(nextSlotTime / 60)).padStart(2, '0')
                  const nextM = String(nextSlotTime % 60).padStart(2, '0')
                  const timeLabel = `${h}:${m}-${nextH}:${nextM}`
                  return (
                    <div key={i} className="border-t border-gray-100 text-[10px] sm:text-xs text-gray-500 h-[var(--slot-height)] flex items-start justify-end pr-2">
                      {(i % Math.round(60 / stepMin) === 0) && (<span>{timeLabel}</span>)}
                    </div>
                  )
                })}
                {/* línea del fin extendido */}
                <div className="absolute left-0 right-0 text-[10px] sm:text-xs text-gray-500" style={{ top: slots.length * slotPxRef.current }}>
                  <div className="absolute left-0 right-0 border-t border-gray-200" />
                </div>
                {/* Etiqueta final */}
                <div className="border-t border-gray-100 text-[10px] sm:text-xs text-gray-500 h-[var(--slot-height)] flex items-start justify-end pr-2">
                  <span>{endExtendedLabel}</span>
                </div>

                {/* almuerzo (guías) */}
                {lunchSlotIndex != null && (
                  <div className="absolute left-0 right-0 border-t-2 border-rose-300 pointer-events-none" style={{ top: toTopPx(lunchSlotIndex) }} />
                )}
                {lunchEndSlotIndex != null && (
                  <div className="absolute left-0 right-0 border-t-2 border-rose-300 pointer-events-none" style={{ top: toTopPx(lunchEndSlotIndex) }} />
                )}
                {lunchSlotIndex != null && lunchEndSlotIndex != null && (
                  <div className="absolute left-0 right-0 bg-rose-50 pointer-events-none opacity-30" style={{ top: toTopPx(lunchSlotIndex), height: toHeightPx(lunchSlotIndex, lunchEndSlotIndex) }} />
                )}
              </div>
            </div>

            {/* Área de días */}
            <div className="relative overflow-x-auto col-scroll">
              <div className="grid sticky top-0 z-10 bg-white" style={{ gridTemplateColumns: rightHeaderCols }}>
                {days.map(d => (
                  <div key={d} className="p-3 text-center text-xs sm:text-sm font-semibold text-gray-700 border-l border-gray-100 min-w-[160px]">
                    {d}
                  </div>
                ))}
              </div>

              <div className="grid" style={{ gridTemplateColumns: rightHeaderCols }}>
                {days.map((_, dayIndex) => (
                  <div
                    key={dayIndex}
                    className="relative"
                    ref={(el) => { if (el) columnRefs.current[dayIndex] = el }}
                    style={{ minWidth: isMobile ? 160 : 'auto' }}
                  >
                    {slots.map((_, slotIndex) => (
                      <Cell
                        key={slotIndex}
                        dayIndex={dayIndex}
                        slotIndex={slotIndex}
                        onCellClick={handleCellClick}
                        isPlacementArmed={isPlacementArmed}
                      />
                    ))}
                    {/* slot extendido */}
                    <Cell
                      key="extended"
                      dayIndex={dayIndex}
                      slotIndex={slots.length}
                      onCellClick={handleCellClick}
                      isPlacementArmed={isPlacementArmed}
                    />

                    {blocks
                      .filter(b => b.dayIndex === dayIndex)
                      .map(b => (
                        <DraggableBlock
                          key={b.id}
                          block={b}
                          selected={selectedId === b.id}
                          onSelect={handleBlockSelect}
                          onResizePointerDown={onResizePointerDown}
                          onDelete={(id) => setBlocks(prev => prev.filter(x => x.id !== id))}
                          onUpdateSubtitle={(id, newSubtitle) => {
                            setBlocks(prev => prev.map(b => b.id === id ? { ...b, subtitle: newSubtitle } : b))
                          }}
                          onUpdateTitle={(id, newTitle) => {
                            setBlocks(prev => prev.map(b => b.id === id ? { ...b, name: newTitle } : b))
                          }}
                          onUpdateTime={(id, newStartTime, newEndTime) => {
                            
                            setBlocks(prev => prev.map(b => {
                              if (b.id !== id) return b
                              
                              // Convertir horas a minutos
                              const [startH, startM] = newStartTime.split(':').map(Number)
                              const [endH, endM] = newEndTime.split(':').map(Number)
                              const [baseH, baseM] = start.split(':').map(Number)
                              
                              const startMinutes = startH * 60 + startM
                              const endMinutes = endH * 60 + endM
                              const baseMinutes = baseH * 60 + baseM
                              
                              // Calcular slots basados en el paso actual, pero sin redondear
                              const newStartSlot = (startMinutes - baseMinutes) / stepMin
                              const newEndSlot = (endMinutes - baseMinutes) / stepMin
                              
                              // Asegurar que los slots estén dentro de los límites
                              const clampedStartSlot = Math.max(0, Math.min(newStartSlot, maxSlotIndex - 1))
                              const clampedEndSlot = Math.max(clampedStartSlot + 1, Math.min(newEndSlot, maxSlotIndex))
                              
                              // Recalcular posición y altura
                              const newTopPx = toTopPx(clampedStartSlot)
                              const newHeightPx = toHeightPx(clampedStartSlot, clampedEndSlot)
                              
                              // Generar timeLabel con las horas exactas que el usuario ingresó
                              const newTimeLabel = `${newStartTime}–${newEndTime}`
                              
                              return {
                                ...b,
                                startSlot: clampedStartSlot,
                                endSlot: clampedEndSlot,
                                topPx: newTopPx,
                                heightPx: newHeightPx,
                                timeLabel: newTimeLabel,
                              }
                            }))
                          }}
                          stepMin={stepMin}
                          start={start}
                          isMobile={isMobile}
                        />
                      ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {isPlacementArmed && (
        <div
          className="mt-3 p-3 rounded-xl text-sm flex items-center justify-between"
          style={{
            background: 'rgba(238,242,255,1)',
            border: '1px solid rgba(191,219,254,1)',
            color: '#1e3a8a'
          }}
        >
          Modo colocar activo: tocá una casilla.
          <button
            onClick={() => { setPlaceActivity(null); window.dispatchEvent(new CustomEvent('cancel-place-activity')) }}
            className="text-xs rounded-lg border px-3 py-1 hover:bg-white"
          >
            Cancelar
          </button>
        </div>
      )}
      {moveBlockId && (
        <div className="mt-3 p-3 rounded-xl text-sm flex items-center justify-between bg-yellow-50 border border-yellow-200 text-yellow-900">
          Modo mover activo: tocá una celda destino.
          <button
            onClick={() => setMoveBlockId(null)}
            className="text-xs rounded-lg border px-3 py-1 hover:bg-white"
          >
            Cancelar
          </button>
        </div>
      )}
    </DndContext>
  )
}
