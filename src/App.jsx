import React, { useState, useMemo, useRef } from 'react'
import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import ActivityPalette from './components/ActivityPalette.jsx'
import WeekGrid from './components/WeekGrid.jsx'
import { DAYS, buildTimeLabels } from './lib/time.js'

export default function App(){
  const [activities, setActivities] = useState([])
  const [blocks, setBlocks] = useState([])
  const [activeId, setActiveId] = useState(null)
  const containerRef = useRef(null)

  // Constants for time grid
  const SLOT_HEIGHT = 40 // altura de cada casilla en píxeles
  const START_HOUR = 7
  const END_HOUR = 22
  
  // Generar etiquetas de hora
  const timeLabels = useMemo(() => buildTimeLabels(START_HOUR, END_HOUR), [])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } })
  )

  function handleAddActivity({name, color}){
    setActivities(a => [...a, { id: Date.now().toString() + Math.random().toString(36).substr(2, 9), name, color }])
  }

  function onDragStart(e) {
    setActiveId(e.active.id)
  }

  function onDragEnd(e) {
    const { over, active } = e
    if(!over) { 
      setActiveId(null)
      return 
    }
    
    const overDay = over?.data?.current?.day
    if(!overDay) { 
      setActiveId(null)
      return 
    }

    // Check if this is a new activity from palette
    if (active.data?.current?.type === 'palette-activity') {
      const activity = active.data.current.activity
      const dayIndex = DAYS.indexOf(overDay)
      
      // Identificar directamente la casilla donde está el mouse
      const rect = containerRef.current.getBoundingClientRect()
      const mouseY = e.activatorEvent.clientY - rect.top
      const rowIndex = Math.floor(mouseY / SLOT_HEIGHT)
      
      // Asegurar que esté dentro de los límites
      const maxRows = timeLabels.length
      const clampedRowIndex = Math.max(0, Math.min(rowIndex, maxRows - 2)) // -2 para dejar espacio para 1 hora
      
      // Calcular posición y altura
      const top = clampedRowIndex * SLOT_HEIGHT
      const height = SLOT_HEIGHT * 2 // 1 hora por defecto
      
      // Generar etiqueta de tiempo simple
      const startTime = timeLabels[clampedRowIndex]
      const endTime = timeLabels[clampedRowIndex + 2]
      
      const newBlock = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name: activity.name,
        color: activity.color,
        dayIndex: dayIndex,
        top: top,
        height: height,
        timeLabel: `${startTime}–${endTime}`
      }
      
      setBlocks(prev => [...prev, newBlock])
      setActiveId(null)
      return
    }

    // Handle existing block movement
    setBlocks(prev => prev.map(bl => {
      if(bl.id !== active.id) return bl
      
      // Move horizontally to another day if needed
      const newDayIdx = DAYS.indexOf(overDay)
      
      // Identificar directamente la casilla donde está el mouse
      const rect = containerRef.current.getBoundingClientRect()
      const mouseY = e.activatorEvent.clientY - rect.top
      const rowIndex = Math.floor(mouseY / SLOT_HEIGHT)
      
      // Asegurar que esté dentro de los límites
      const maxRows = timeLabels.length
      const clampedRowIndex = Math.max(0, Math.min(rowIndex, maxRows - (bl.height / SLOT_HEIGHT)))
      
      // Calcular nueva posición
      const newTop = clampedRowIndex * SLOT_HEIGHT
      
      // Generar nueva etiqueta de tiempo simple
      const startTime = timeLabels[clampedRowIndex]
      const endTime = timeLabels[clampedRowIndex + (bl.height / SLOT_HEIGHT)]
      
      return {
        ...bl,
        dayIndex: newDayIdx,
        top: newTop,
        timeLabel: `${startTime}–${endTime}`
      }
    }))
    setActiveId(null)
  }

  return (
    <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd}>
      <div className="max-w-6xl mx-auto p-5 space-y-5">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Planificador semanal</h1>
            <p className="text-gray-600">Crea tu horario arrastrando bloques en la grilla. Simple, rápido y editable.</p>
          </div>
          <a href="https://aike.com.ar" target="_blank" className="text-sm text-indigo-600 hover:underline">by AIKE</a>
        </header>

        <ActivityPalette onAdd={handleAddActivity} activities={activities} />

        <WeekGrid 
          activities={activities} 
          setActivities={setActivities}
          blocks={blocks}
          setBlocks={setBlocks}
          containerRef={containerRef}
          timeLabels={timeLabels}
          SLOT_HEIGHT={SLOT_HEIGHT}
        />

        <footer className="text-center text-xs text-gray-500 pt-4">
          Tip: Próximamente podrás guardar en LocalStorage y exportar a PDF.
        </footer>

        <DragOverlay>
          {activeId ? (
            <div className="bg-indigo-600 text-white px-3 py-2 rounded-lg shadow-lg">
              {activeId.startsWith('palette-') ? 'Nueva actividad' : 'Moviendo...'}
            </div>
          ) : null}
        </DragOverlay>
      </div>
    </DndContext>
  )
}
