// src/App.jsx
import React, { useMemo, useState } from 'react'
import ActivityPalette from './components/ActivityPalette.jsx'
import ActivityList from './components/ActivityList.jsx'
import SettingsBar from './components/SettingsBar.jsx'
import WeekGrid from './components/WeekGrid.jsx'
import ExportPanel from './components/ExportPanel.jsx'
import { computeDaysRange } from './lib/time.js'

export default function App() {
  const [activities, setActivities] = useState([])
  const [showExportPanel, setShowExportPanel] = useState(false)
  const [blocks, setBlocks] = useState([])

  // Config (tu versión actual con lunch/horarios y rango de días)
  const [settings, setSettings] = useState({
    startDay: 'Lunes',
    endDay:   'Viernes',
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
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowExportPanel(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Descargar imagen
          </button>
          <a
            href="https://www.linkedin.com/in/david-lekerman/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-indigo-600 hover:underline"
            title="LinkedIn de David Lekerman"
          >
            by David Lekerman
          </a>
        </div>
      </header>
      <SettingsBar value={settings} onChange={setSettings} onCreateBreakCard={handleCreateBreakCard} />


      <ActivityPalette onAdd={handleAddActivity} />

      <WeekGrid 
        activities={activities} 
        config={gridConfig}
        onBlocksChange={setBlocks}
      >
        <ActivityList
          activities={activities}
          onAddToGrid={handleAddToGrid}
          onDelete={handleDeleteActivity}
        />
      </WeekGrid>

      {/* Panel de exportación */}
      {showExportPanel && (
        <ExportPanel
          activities={activities}
          blocks={blocks}
          config={gridConfig}
          onClose={() => setShowExportPanel(false)}
        />
      )}

      {/* Botón inferior para exportar */}
      <div className="pt-4 flex justify-center">
        <button
          onClick={() => setShowExportPanel(true)}
          className="bg-indigo-600 text-white px-5 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Descargar imagen
        </button>
      </div>

      <footer className="text-center text-xs text-gray-500 pt-4">
        Próximamente: guardar en LocalStorage y exportar a PDF.
      </footer>
    </div>
  )
}
