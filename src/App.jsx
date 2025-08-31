// src/App.jsx
import React, { useMemo, useState, useEffect } from 'react'
import ActivityPalette from './components/ActivityPalette.jsx'
import ActivityList from './components/ActivityList.jsx'
import SettingsBar from './components/SettingsBar.jsx'
import WeekGrid from './components/WeekGrid.jsx'
import ExportPanel from './components/ExportPanel.jsx'
import AdRail from './components/AdRail.jsx';
import { computeDaysRange } from './lib/time.js'
import { saveToStorage, loadFromStorage, STORAGE_KEYS, isStorageAvailable } from './lib/storage.js'

export default function App() {
  // Cargar datos guardados del localStorage al inicializar
  const [activities, setActivities] = useState(() => {
    if (isStorageAvailable()) {
      const loaded = loadFromStorage(STORAGE_KEYS.ACTIVITIES, []);
      console.log('Cargando actividades del localStorage:', loaded);
      return loaded;
    }
    return [];
  });
  
  const [showExportPanel, setShowExportPanel] = useState(false)
  const [blocks, setBlocks] = useState(() => {
    if (isStorageAvailable()) {
      const loaded = loadFromStorage(STORAGE_KEYS.BLOCKS, []);
      console.log('Cargando bloques del localStorage:', loaded);
      return loaded;
    }
    return [];
  });

  // Config (tu versión actual con lunch/horarios y rango de días)
  const [settings, setSettings] = useState(() => {
    if (isStorageAvailable()) {
      return loadFromStorage(STORAGE_KEYS.SETTINGS, {
        startDay: 'Lunes',
        endDay:   'Viernes',
        start: '08:00',
        end:   '18:00',
        stepMin: 60,
        lunchEnabled: false,
        lunchStart: '13:00',
        lunchEnd: '14:00',
      });
    }
    return {
      startDay: 'Lunes',
      endDay:   'Viernes',
      start: '08:00',
      end:   '18:00',
      stepMin: 60,
      lunchEnabled: false,
      lunchStart: '13:00',
      lunchEnd: '14:00',
    };
  });

  const days = useMemo(
    () => computeDaysRange(settings.startDay, settings.endDay),
    [settings.startDay, settings.endDay]
  )

  // Guardar automáticamente en localStorage cuando cambien los datos
  useEffect(() => {
    if (isStorageAvailable()) {
      console.log('Guardando actividades:', activities);
      saveToStorage(STORAGE_KEYS.ACTIVITIES, activities);
    }
  }, [activities]);

  useEffect(() => {
    if (isStorageAvailable()) {
      console.log('Guardando bloques:', blocks);
      saveToStorage(STORAGE_KEYS.BLOCKS, blocks);
    }
  }, [blocks]);

  useEffect(() => {
    if (isStorageAvailable()) {
      console.log('Guardando configuración:', settings);
      saveToStorage(STORAGE_KEYS.SETTINGS, settings);
    }
  }, [settings]);

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
    setBlocks(prev => prev.filter(b => b.activityId !== activityId));

  }

  // Función para forzar el guardado de bloques
  const forceSaveBlocks = () => {
    if (isStorageAvailable()) {
      console.log('Forzando guardado de bloques:', blocks);
      saveToStorage(STORAGE_KEYS.BLOCKS, blocks);
    }
  };

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
  <div className="w-full">
    {/* Contenedor responsive con padding lateral chico en mobile */}
    <div className="mx-auto w-full max-w-screen-2xl px-3 sm:px-4">

      {/* En mobile: una sola columna. En desktop: 3 columnas con rails */}
      <div className="w-full lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1100px)_minmax(0,1fr)] lg:gap-4">

        {/* IZQUIERDA: tira lateral (solo desktop) */}
        <aside className="hidden lg:block sticky top-4 self-start">
          <ins
            className="adsbygoogle"
            style={{ display: "block", width: "160px", height: "600px", margin: "0 auto" }}
            data-ad-client="ca-pub-5238026837919071"
            data-ad-slot="3734034674"
            data-ad-format="auto"
            data-full-width-responsive="true"
          />
        </aside>

        {/* CENTRO: app completa */}
        <main className="min-w-0 w-full">
          <div className="w-full p-4 sm:p-5 space-y-5 bg-white border border-gray-200 rounded-lg">

            <header className="flex items-center justify-between">
              {/* ⚠️ El script de AdSense ponelo en <head> del index.html, no acá */}
              <div>
                <h1 className="text-2xl font-bold">Planificador semanal online gratis</h1>
<p className="text-gray-600">
  Organiza tu semana con una grilla interactiva: arrastrá, estirá, personalizá y descargá tu horario en PDF o PNG.
</p>

              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowExportPanel(true)}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Descargar imagen
                </button>
              </div>
              
            </header>

            <ActivityPalette onAdd={handleAddActivity} />

            <WeekGrid
              activities={activities}
              config={gridConfig}
              blocks={blocks}
              onBlocksChange={setBlocks}
            >
              <ActivityList
                activities={activities}
                onAddToGrid={handleAddToGrid}
                onDelete={handleDeleteActivity}
              />
            </WeekGrid>

            <SettingsBar
              value={settings}
              onChange={setSettings}
              onCreateBreakCard={handleCreateBreakCard}
            />

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
              <p>
    MyWeekly es una herramienta gratuita para crear y exportar tu <strong>horario semanal</strong> de forma rápida y sencilla.
  </p>
  <div className="text-sm text-gray-600">
        <a href="/privacy" className="mx-2 hover:underline">Privacy</a>
        <a href="/faq" className="mx-2 hover:underline">FAQ</a>
        <a href="/terms" className="mx-2 hover:underline">Terms</a>
      </div>
              <a
                href="https://www.linkedin.com/in/david-lekerman/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-indigo-600 hover:underline"
                title="LinkedIn de David Lekerman"
              >
                by David Lekerman
              </a>
            </footer>
          </div>
        </main>

        {/* DERECHA: tira lateral (solo desktop) */}
        <aside className="hidden lg:block sticky top-4 self-start">
          <ins
            className="adsbygoogle"
            style={{ display: "block", width: "160px", height: "600px", margin: "0 auto" }}
            data-ad-client="ca-pub-5238026837919071"
            data-ad-slot="1473900517"
            data-ad-format="auto"
            data-full-width-responsive="true"
          />
        </aside>

      </div>
    </div>
  </div>
);


}
