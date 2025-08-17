// src/components/WeekGrid.jsx
import React, { useEffect, useMemo, useState } from 'react'
import { DndContext, PointerSensor, useDroppable, useSensor, useSensors } from '@dnd-kit/core'
import Block from './Block.jsx'
import {
  DAYS as DAYS_FULL,
  buildTimeSlots,
  slotIndexToLabel,
  timeToSlotIndexRounded
} from '../lib/time.js'

function Cell({ dayIndex, slotIndex, onCellHover, onCellClick, isPlacementArmed, isMoveArmed }) {
  const id = `cell-${dayIndex}-${slotIndex}`
  const { setNodeRef, isOver } = useDroppable({
    id,
    data: { type: 'cell', dayIndex, slotIndex },
  })

  const hoverClass = isOver
    ? 'bg-indigo-50/40'
    : (isPlacementArmed || isMoveArmed) ? 'hover:bg-indigo-50/30 cursor-pointer' : ''

  return (
    <div
      ref={setNodeRef}
      onMouseEnter={() => onCellHover?.(dayIndex, slotIndex)}
      onClick={() => onCellClick?.(dayIndex, slotIndex)}
      className={`relative border-t border-l border-gray-100 ${hoverClass}`}
      style={{ gridColumn: dayIndex + 2, gridRow: slotIndex, minHeight: 36 }}
    />
  )
}

export default function WeekGrid({ activities, children, config }) {
  // Defaults si config viene undefined
  const {
    days = DAYS_FULL,
    start = '07:00',
    end = '22:00',
    stepMin = 30,
    lunchEnabled = false,
    lunchTime = '13:00',
  } = config ?? {}

  const slots = useMemo(() => buildTimeSlots({ start, end, stepMin }), [start, end, stepMin])

  const [blocks, setBlocks] = useState([])
  const [resizingId, setResizingId] = useState(null)        // { id, handle }
  const [selectedId, setSelectedId] = useState(null)        // bloque seleccionado
  const [placeActivity, setPlaceActivity] = useState(null)  // actividad en modo “colocar”
  const [moveBlockId, setMoveBlockId] = useState(null)      // bloque en modo “teletransportar”

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }))
  const headerCols = `120px repeat(${days.length}, 1fr)`

  /* ---- Modo colocar: viene de ActivityList al tocar una tarjeta ---- */
  useEffect(() => {
    function onArm(ev) { setPlaceActivity(ev.detail?.activity || null); setMoveBlockId(null) }
    function onCancel() { setPlaceActivity(null) }
    window.addEventListener('arm-place-activity', onArm)
    window.addEventListener('cancel-place-activity', onCancel)
    return () => {
      window.removeEventListener('arm-place-activity', onArm)
      window.removeEventListener('cancel-place-activity', onCancel)
    }
  }, [])

  /* ---- Añadir por botón “Añadir a grilla” ---- */
  useEffect(() => {
    function onAddToGrid(ev) {
      const act = ev.detail
      if (!act) return
      const defaultDuration = Math.max(2, Math.round(60 / stepMin))
      addBlockAt({ dayIndex: 0, startSlot: 1, durationSlots: defaultDuration, activity: act })
    }
    window.addEventListener('add-activity-to-grid', onAddToGrid)
    return () => window.removeEventListener('add-activity-to-grid', onAddToGrid)
  }, [stepMin])

  /* ---- Borrar todos los bloques de una actividad (cuando se borra la tarjeta) ---- */
  useEffect(() => {
    function onDeleteActivity(ev) {
      const { activityId } = ev.detail || {}
      if (!activityId) return
      setBlocks(prev => prev.filter(b => b.activityId !== activityId))
      if (selectedId && !blocks.find(b => b.id === selectedId)) setSelectedId(null)
      if (moveBlockId && !blocks.find(b => b.id === moveBlockId)) setMoveBlockId(null)
    }
    window.addEventListener('delete-activity', onDeleteActivity)
    return () => window.removeEventListener('delete-activity', onDeleteActivity)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, moveBlockId, blocks])

  /* ---- Borrar bloque seleccionado con Delete/Backspace ---- */
  useEffect(() => {
    function onKey(e) {
      if (!selectedId) return
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault()
        setBlocks(prev => prev.filter(b => b.id !== selectedId))
        setSelectedId(null)
        setMoveBlockId(null)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selectedId])

  /* ---- Ajustar bloques si cambia configuración ---- */
  useEffect(()=>{
    setBlocks(prev => prev.map(b => {
      const maxRow = slots.length + 1
      const startSlot = Math.min(Math.max(b.startSlot, 1), maxRow - 1)
      const endSlot   = Math.min(Math.max(b.endSlot, startSlot + 1), maxRow)
      const dayIndex  = Math.min(Math.max(b.dayIndex, 0), days.length - 1)
      return {
        ...b, startSlot, endSlot, dayIndex,
        timeLabel: slotIndexToLabel(start, stepMin, startSlot, endSlot)
      }
    }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days.length, slots.length, start, stepMin])

  /* ---- utilidades ---- */
  function addBlockAt({ dayIndex, startSlot, durationSlots = 2, activity }) {
    const endSlot = startSlot + durationSlots
    setBlocks(prev => [
      ...prev,
      {
        id: crypto.randomUUID(),
        activityId: activity.id,
        name: activity.name,
        color: activity.color,
        dayIndex,
        startSlot,
        endSlot,
        timeLabel: slotIndexToLabel(start, stepMin, startSlot, endSlot),
      },
    ])
  }

  /* ---- TAP en casilla: colocar o teletransportar ---- */
  function handleCellClick(dayIndex, slotIndex) {
    // 1) Modo colocar (desde tarjeta)
    if (placeActivity) {
      const defaultDuration = Math.max(2, Math.round(60 / stepMin))
      addBlockAt({ dayIndex, startSlot: slotIndex, durationSlots: defaultDuration, activity: placeActivity })
      setPlaceActivity(null)
      window.dispatchEvent(new CustomEvent('placed-activity'))
      return
    }
    // 2) Modo teletransporte de un bloque existente
    if (moveBlockId) {
      setBlocks(prev => prev.map(b => {
        if (b.id !== moveBlockId) return b
        const duration = b.endSlot - b.startSlot
        const newStart = slotIndex
        const newEnd   = newStart + duration
        return {
          ...b,
          dayIndex,
          startSlot: newStart,
          endSlot: newEnd,
          timeLabel: slotIndexToLabel(start, stepMin, newStart, newEnd),
        }
      }))
      setSelectedId(moveBlockId)
      setMoveBlockId(null)
      return
    }
  }

  function handleCellHover(dayIndex, slotIndex) {
    if (!resizingId) return
    setBlocks(prev =>
      prev.map(b => {
        if (b.id !== resizingId.id) return b
        if (b.dayIndex !== dayIndex) return b

        if (resizingId.handle === 'bottom') {
          const minEnd = b.startSlot + 1
          const newEnd = Math.max(minEnd, slotIndex + 1)
          if (newEnd === b.endSlot) return b
          return { ...b, endSlot: newEnd, timeLabel: slotIndexToLabel(start, stepMin, b.startSlot, newEnd) }
        }

        if (resizingId.handle === 'top') {
          const maxStart = b.endSlot - 1
          const newStart = Math.min(maxStart, slotIndex)
          if (newStart === b.startSlot) return b
          return { ...b, startSlot: newStart, timeLabel: slotIndexToLabel(start, stepMin, newStart, b.endSlot) }
        }

        return b
      })
    )
  }

  function onResizeStart(e, id, handle) {
    e.stopPropagation()
    setResizingId({ id, handle })
    const onUp = () => setResizingId(null)
    window.addEventListener('mouseup', onUp, { once: true })
  }

  function deleteSingleBlock(id) {
    setBlocks(prev => prev.filter(b => b.id !== id))
    if (selectedId === id) setSelectedId(null)
    if (moveBlockId === id) setMoveBlockId(null)
  }

  function handleDragEnd(event) {
    const { active, over } = event
    if (!over) return
    const overData = over?.data?.current
    const activeData = active?.data?.current
    if (!overData || !activeData) return

    // Tarjeta → crear por drag
    if (activeData.type === 'activity' && overData.type === 'cell') {
      const act = activeData.activity
      const dayIndex = overData.dayIndex
      const startSlot = overData.slotIndex
      const defaultDuration = Math.max(2, Math.round(60 / stepMin))
      addBlockAt({ dayIndex, startSlot, durationSlots: defaultDuration, activity: act })
      return
    }

    // Bloque → mover por drag
    if (activeData.type === 'block' && overData.type === 'cell') {
      const bid = activeData.blockId
      setSelectedId(bid)
      setMoveBlockId(null) // si estaba armado, lo desarmo
      setBlocks(prev =>
        prev.map(b => {
          if (b.id !== bid) return b
          const duration = b.endSlot - b.startSlot
          const newStart = overData.slotIndex
          const newEnd = newStart + duration
          return {
            ...b,
            dayIndex: overData.dayIndex,
            startSlot: newStart,
            endSlot: newEnd,
            timeLabel: slotIndexToLabel(start, stepMin, newStart, newEnd),
          }
        })
      )
    }
  }

  // Slot de Almuerzo (opcional)
  const lunchSlot = useMemo(() => {
    if (!lunchEnabled) return null
    return timeToSlotIndexRounded({ start, stepMin, time: lunchTime, slotsLen: slots.length })
  }, [lunchEnabled, lunchTime, start, stepMin, slots.length])

  const isPlacementArmed = !!placeActivity
  const isMoveArmed = !!moveBlockId

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      {children}

      <div className="w-full border border-gray-200 rounded-xl overflow-hidden bg-white">
        {/* Cabecera */}
        <div className="grid" style={{ gridTemplateColumns: headerCols }}>
          <div className="bg-gray-50 p-3 text-sm font-medium text-gray-600">
            {isPlacementArmed
              ? 'Modo colocar: tocá una casilla'
              : isMoveArmed
                ? 'Modo mover: tocá una casilla destino'
                : 'Hora'}
          </div>
          {days.map(d => (
            <div key={d} className="p-3 text-center text-sm font-semibold text-gray-700 border-l border-gray-100">
              {d}
            </div>
          ))}
        </div>

        {/* Grilla */}
        <div
          style={{ display:'grid', gridTemplateColumns: headerCols, gridTemplateRows:`repeat(${slots.length},1fr)` }}
          className="relative"
        >
          {/* Columna 1: horas */}
          {slots.map((s) => (
            <div
              key={`time-${s.slotIndex}`}
              className="text-xs text-gray-500 pr-2 flex items-start justify-end"
              style={{ gridColumn: 1, gridRow: s.slotIndex, paddingTop: 4, paddingRight: 8 }}
            >
              {s.label}
            </div>
          ))}

          {/* Celdas */}
          {days.map((_, dayIndex) =>
            slots.map(s => (
              <Cell
                key={`cell-${dayIndex}-${s.slotIndex}`}
                dayIndex={dayIndex}
                slotIndex={s.slotIndex}
                onCellHover={handleCellHover}
                onCellClick={handleCellClick}
                isPlacementArmed={isPlacementArmed}
                isMoveArmed={isMoveArmed}
              />
            ))
          )}

          {/* Línea de Almuerzo */}
          {lunchSlot && (
            <>
              <div
                className="text-[10px] text-amber-700 font-semibold flex items-center justify-end pr-2"
                style={{ gridColumn: 1, gridRow: lunchSlot }}
              >
                Almuerzo
              </div>
              {days.map((_, dayIndex) => (
                <div
                  key={`lunch-line-${dayIndex}`}
                  className="border-t-2 border-amber-500/70"
                  style={{ gridColumn: dayIndex + 2, gridRow: lunchSlot }}
                />
              ))}
            </>
          )}

          {/* Bloques */}
          {blocks.map(b => (
            <Block
              key={b.id}
              block={b}
              isResizing={!!resizingId && resizingId.id === b.id}
              isSelected={selectedId === b.id}
              onResizeStart={onResizeStart}
              onSelect={setSelectedId}
              onDelete={deleteSingleBlock}
              onArmMove={(id) => { setMoveBlockId(id); setPlaceActivity(null); setSelectedId(id) }}
            />
          ))}
        </div>
      </div>

      {(isPlacementArmed || isMoveArmed) && (
        <div
          className="mt-3 p-3 rounded-xl text-sm flex items-center justify-between"
          style={{
            background: isPlacementArmed ? 'rgba(238,242,255,1)' : 'rgba(239,246,255,1)',
            border: '1px solid rgba(191,219,254,1)',
            color: '#1e3a8a'
          }}
        >
          {isPlacementArmed ? 'Modo colocar activo: tocá una casilla.' : 'Modo mover activo: tocá una casilla destino.'}
          <button
            onClick={() => { setPlaceActivity(null); setMoveBlockId(null); window.dispatchEvent(new CustomEvent('cancel-place-activity')) }}
            className="text-xs rounded-lg border px-2 py-1 hover:bg-white"
          >
            Cancelar
          </button>
        </div>
      )}
    </DndContext>
  )
}
