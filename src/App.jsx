// src/App.jsx
import React, { useMemo, useState } from 'react'
import ActivityPalette from './components/ActivityPalette.jsx'
import ActivityList from './components/ActivityList.jsx'
import SettingsBar from './components/SettingsBar.jsx'
import WeekGrid from './components/WeekGrid.jsx'
import { computeDaysRange } from './lib/time.js'

export default function App() {
  const [activities, setActivities] = useState([])

  // Config (tu versión actual con lunch/horarios y rango de días)
  const [settings, setSettings] = useState({
    startDay: 'Lunes',
    endDay:   'Domingo',
    start: '08:00',
    end:   '18:00',
    stepMin: 60,
    lunchEnabled: false,
    lunchStart: '13:00',
    lunchEnd: '14:00',
  })

  const days = useMemo(
    () => computeDaysRange(settings.startDay, settings.endDay),
    [settings.startDay, settings.endDay]
  )

  function handleAddActivity({ name, color }) {
    setActivities(a => [...a, { id: crypto.randomUUID(), name, color }])
  }

  function handleCreateBreakCard({ name, color }) {
    setActivities(a => [...a, { id: crypto.randomUUID(), name, color }])
  }

  // Añadir a la grilla por botón en la tarjeta
  function handleAddToGrid(activity) {
    const ev = new CustomEvent('add-activity-to-grid', { detail: activity })
    window.dispatchEvent(ev)
  }

  // Borrar tarjeta y sus bloques en la grilla
  function handleDeleteActivity(activityId) {
    // 1) removemos la tarjeta
    setActivities(prev => prev.filter(a => a.id !== activityId))
    // 2) notificamos a la grilla que elimine todos los bloques de esa actividad
    const ev = new CustomEvent('delete-activity', { detail: { activityId } })
    window.dispatchEvent(ev)
  }

  const gridConfig = {
    days,
    start: settings.start,
    end:   settings.end,
    stepMin: settings.stepMin,
    lunchEnabled: settings.lunchEnabled,
    lunchStart: settings.lunchStart,
    lunchEnd: settings.lunchEnd,
  }

  return (
    <div className="max-w-6xl mx-auto p-5 space-y-5">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Planificador semanal</h1>
          <p className="text-gray-600">Grilla por celdas: arrastrá, estirá y personalizá.</p>
        </div>
        <span className="text-sm text-indigo-600">by AIKE</span>
      </header>

      <SettingsBar value={settings} onChange={setSettings} onCreateBreakCard={handleCreateBreakCard} />

      <ActivityPalette onAdd={handleAddActivity} />

      <WeekGrid activities={activities} config={gridConfig}>
        <ActivityList
          activities={activities}
          onAddToGrid={handleAddToGrid}
          onDelete={handleDeleteActivity}
        />
      </WeekGrid>

      <footer className="text-center text-xs text-gray-500 pt-4">
        Próximamente: guardar en LocalStorage y exportar a PDF.
      </footer>
    </div>
  )
}
