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

/* ===========================
   Bloque con drag + manijas
   =========================== */
function DraggableBlock({
  block,
  selected,
  onSelect,
  onResizeStartTop,
  onResizeStartBottom,
}) {
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

  return (
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
      }}
    >
      {/* manija superior */}
      <div
        className="absolute -top-1 left-1/2 -translate-x-1/2 w-7 h-2 rounded-md cursor-ns-resize bg-white/80 border"
        onPointerDown={(e) => { e.stopPropagation(); onResizeStartTop(block.id) }}
        onTouchStart={(e) => { e.stopPropagation(); onResizeStartTop(block.id) }}
        aria-label="Redimensionar desde arriba"
        title="Redimensionar"
      />
      {/* contenido */}
      <div className="px-2 py-2 text-xs leading-4">
        <div className="font-semibold truncate">{block.name}</div>
        <div className="opacity-80">{block.timeLabel}</div>
      </div>
      {/* manija inferior */}
      <div
        className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-7 h-2 rounded-md cursor-ns-resize bg-white/80 border"
        onPointerDown={(e) => { e.stopPropagation(); onResizeStartBottom(block.id) }}
        onTouchStart={(e) => { e.stopPropagation(); onResizeStartBottom(block.id) }}
        aria-label="Redimensionar desde abajo"
        title="Redimensionar"
      />
    </div>
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
export default function WeekGrid({ activities, config, children }) {
  const {
    days = DAYS_FULL,
    start = '07:00',
    end = '22:00',
    stepMin = 30,
    lunchEnabled = false,
    lunchStart = '13:00',
    lunchEnd = '14:00',
  } = config ?? {}

  const slots = useMemo(() => buildTimeSlots({ start, end, stepMin }), [start, end, stepMin])

  // estado bloques
  const [blocks, setBlocks] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [resizing, setResizing] = useState(null) // { id, handle: 'top'|'bottom' }

  // "armar" para colocar por click (desde Palette/List/BreakTools)
  const [placeActivity, setPlaceActivity] = useState(null)

  // sensores: pointer + touch (mejor drag en móvil)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor,   { activationConstraint: { delay: 80, tolerance: 8 } }),
  )

  // mido el alto del slot desde CSS var (cambia en responsive)
  const slotPxRef = useRef(36)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)
  
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

  // Detectar cambios en el tamaño de la ventana
  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth <= 768)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // helpers top/height
  const toTopPx = (slotIndex) => slotIndex * slotPxRef.current
  const toHeightPx = (startSlot, endSlot) => (endSlot - startSlot) * slotPxRef.current

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
      if (selectedId && !blocks.find(b => b.id === selectedId)) setSelectedId(null)
    }
    window.addEventListener('delete-activity', onDeleteActivity)
    return () => window.removeEventListener('delete-activity', onDeleteActivity)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, blocks])

  // borrar con tecla
  useEffect(() => {
    function onKey(e) {
      if (!selectedId) return
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
    const endSlot = Math.min(slots.length, startSlot + durationSlots)
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
      timeLabel: slotIndexToLabel(start, stepMin, startSlot, endSlot),
    }
    setBlocks(prev => [...prev, newBlock])
  }

  // click en celda -> colocar si está armado
  function handleCellClick(dayIndex, slotIndex) {
    if (!placeActivity) return
    const defaultDur = Math.max(2, Math.round(60 / stepMin))
    addBlockAt({ dayIndex, startSlot: slotIndex, durationSlots: defaultDur, activity: placeActivity })
    setPlaceActivity(null)
    window.dispatchEvent(new CustomEvent('placed-activity'))
  }

  // drag end (desde paleta/lista o mover bloque)
  function onDragEnd(ev) {
    const { active, over } = ev
    if (!over) return
    const overData = over.data?.current
    if (!overData || overData.type !== 'cell') return

    const { dayIndex, slotIndex } = overData
    const activeData = active.data?.current

    // soltar una actividad nueva
    if (activeData?.type === 'activity' || activeData?.type === 'palette-activity') {
      const activity = activeData.activity
      if (!activity) return
      const defaultDur = Math.max(2, Math.round(60 / stepMin))
      addBlockAt({ dayIndex, startSlot: slotIndex, durationSlots: defaultDur, activity })
      return
    }

    // mover un bloque existente
    if (activeData?.type === 'block') {
      const id = activeData.blockId
      setBlocks(prev => prev.map(b => {
        if (b.id !== id) return b
        const duration = b.endSlot - b.startSlot
        const newStart = slotIndex
        const newEnd = Math.min(slots.length, newStart + duration)
        return {
          ...b,
          dayIndex,
          startSlot: newStart,
          endSlot: newEnd,
          topPx: toTopPx(newStart),
          heightPx: toHeightPx(newStart, newEnd),
          timeLabel: slotIndexToLabel(start, stepMin, newStart, newEnd),
        }
      }))
      setSelectedId(id)
      return
    }
  }

  // resize (arrastre de manijas)
  const columnRefs = useRef({})
  const resizingCol = useRef(0)

  function beginResize(id, handle) {
    setResizing({ id, handle }) // top/bottom
    const b = blocks.find(x => x.id === id)
    if (b) resizingCol.current = b.dayIndex
  }
  function onMouseMove(e) {
    if (!resizing) return
    const colEl = columnRefs.current?.[resizingCol.current]
    if (!colEl) return
    const rect = colEl.getBoundingClientRect()
    const y = e.clientY - rect.top
    const slotIndex = Math.min(
      Math.max(0, Math.round(y / slotPxRef.current)),
      slots.length - 1
    )
    setBlocks(prev => prev.map(b => {
      if (b.id !== resizing.id) return b
      if (resizing.handle === 'bottom') {
        const minEnd = b.startSlot + 1
        const newEnd = Math.max(minEnd, slotIndex + 1)
        return {
          ...b,
          endSlot: newEnd,
          heightPx: toHeightPx(b.startSlot, newEnd),
          timeLabel: slotIndexToLabel(start, stepMin, b.startSlot, newEnd),
        }
      } else {
        const maxStart = b.endSlot - 1
        const newStart = Math.min(maxStart, slotIndex)
        return {
          ...b,
          startSlot: newStart,
          topPx: toTopPx(newStart),
          heightPx: toHeightPx(newStart, b.endSlot),
          timeLabel: slotIndexToLabel(start, stepMin, newStart, b.endSlot),
        }
      }
    }))
  }
  function endResize() { setResizing(null) }

  // línea de almuerzo
  const lunchSlotIndex = useMemo(() => {
    if (!lunchEnabled) return null
    // Calcular el slot basado en la hora real
    const [sh, sm] = start.split(':').map(Number)
    const [lh, lm] = lunchStart.split(':').map(Number)
    const base = sh * 60 + sm
    const lunch = lh * 60 + lm
    const diff = lunch - base
    const slot = Math.round(diff / stepMin)
    return Math.max(0, Math.min(slots.length - 1, slot))
  }, [lunchEnabled, lunchStart, start, stepMin, slots.length])

  const lunchEndSlotIndex = useMemo(() => {
    if (!lunchEnabled) return null
    // Calcular el slot basado en la hora real
    const [sh, sm] = start.split(':').map(Number)
    const [lh, lm] = lunchEnd.split(':').map(Number)
    const base = sh * 60 + sm
    const lunch = lh * 60 + lm
    const diff = lunch - base
    const slot = Math.round(diff / stepMin)
    return Math.max(0, Math.min(slots.length - 1, slot))
  }, [lunchEnabled, lunchEnd, start, stepMin, slots.length])

  const isPlacementArmed = !!placeActivity

  // columnas: responsive - desktop sin scroll, mobile con scroll sincronizado
  const headerCols = isMobile
    ? `minmax(48px, 70px) repeat(${days.length}, minmax(160px, 1fr))`
    : `minmax(80px, 120px) repeat(${days.length}, minmax(140px, 1fr))`

  return (
    <DndContext sensors={sensors} onDragEnd={onDragEnd}>
      {/* children: normalmente ActivityList; queda cerca de la grilla en móvil */}
      {children}

      <div
        className="w-full border border-gray-200 rounded-xl bg-white overflow-hidden"
        onMouseMove={onMouseMove}
        onMouseUp={endResize}
        onTouchMove={(e) => {
          if (!resizing) return
          const t = e.touches[0]
          if (!t) return
          onMouseMove({ clientY: t.clientY })
        }}
        onTouchEnd={endResize}
      >
        {/* Contenedor principal con scroll sincronizado solo en móvil */}
        <div className={`relative ${isMobile ? 'overflow-x-auto col-scroll' : 'w-full'}`}>
          {/* Cabecera */}
          <div className="grid sticky top-0 z-10 bg-white"
               style={{ gridTemplateColumns: headerCols }}>
            <div className="p-3 text-xs sm:text-sm font-medium text-gray-600 min-w-[48px]">
              {isPlacementArmed ? 'Modo colocar' : 'Hora'}
            </div>
            {days.map(d => (
              <div key={d}
                   className="p-3 text-center text-xs sm:text-sm font-semibold text-gray-700 border-l border-gray-100 min-w-[160px]">
                {d}
              </div>
            ))}
          </div>

          {/* Grilla */}
          <div className="grid" style={{ gridTemplateColumns: headerCols }}>
              {/* columna horas */}
              <div className="relative">
                {slots.map((_, i) => {
                  // Calcular la hora real para este slot
                  const [sh, sm] = start.split(':').map(Number)
                  const base = sh * 60 + sm
                  const slotTime = base + (i * stepMin)
                  const h = String(Math.floor(slotTime / 60)).padStart(2, '0')
                  const m = String(slotTime % 60).padStart(2, '0')
                  const timeLabel = `${h}:${m}`
                  
                  return (
                    <div key={i}
                         className="border-t border-gray-100 text-[10px] sm:text-xs text-gray-500 h-[var(--slot-height)] flex items-start justify-end pr-2">
                      {(i % Math.round(60 / stepMin) === 0) && (
                        <span>
                          {timeLabel}
                        </span>
                      )}
                    </div>
                  )
                })}
                {lunchSlotIndex != null && (
                  <div
                    className="absolute left-0 right-0 border-t-2 border-rose-300 pointer-events-none"
                    style={{ top: toTopPx(lunchSlotIndex) }}
                  />
                )}
                {lunchEndSlotIndex != null && (
                  <div
                    className="absolute left-0 right-0 border-t-2 border-rose-300 pointer-events-none"
                    style={{ top: toTopPx(lunchEndSlotIndex) }}
                  />
                )}
                {lunchSlotIndex != null && lunchEndSlotIndex != null && (
                  <div
                    className="absolute left-0 right-0 bg-rose-50 pointer-events-none opacity-30"
                    style={{ 
                      top: toTopPx(lunchSlotIndex), 
                      height: toHeightPx(lunchSlotIndex, lunchEndSlotIndex) 
                    }}
                  />
                )}
              </div>

              {/* columnas por día */}
              {days.map((_, dayIndex) => (
                <div
                  key={dayIndex}
                  className="relative"
                  ref={(el) => { if (el) columnRefs.current[dayIndex] = el }}
                  style={{ minWidth: isMobile ? 160 : 'auto' }}
                >
                  {/* celdas */}
                  {slots.map((_, slotIndex) => (
                    <Cell
                      key={slotIndex}
                      dayIndex={dayIndex}
                      slotIndex={slotIndex}
                      onCellClick={handleCellClick}
                      isPlacementArmed={isPlacementArmed}
                    />
                  ))}

                  {/* bloques de este día */}
                  {blocks
                    .filter(b => b.dayIndex === dayIndex)
                    .map(b => (
                      <DraggableBlock
                        key={b.id}
                        block={b}
                        selected={selectedId === b.id}
                        onSelect={setSelectedId}
                        onResizeStartTop={(id) => beginResize(id, 'top')}
                        onResizeStartBottom={(id) => beginResize(id, 'bottom')}
                      />
                    ))}
                </div>
              ))}
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
    </DndContext>
  )
}
