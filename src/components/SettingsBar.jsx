// src/components/SettingsBar.jsx
import React, { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { DAYS } from '../lib/time.js'
import { clearAllStorage } from '../lib/storage.js'

/**
 * value = {
 *   startDay, endDay, start, end, stepMin,
 *   lunchEnabled, lunchTime
 * }
 */
export default function SettingsBar({ value, onChange, onCreateBreakCard }) {
  const { t } = useTranslation();
  const [startDay, setStartDay]       = useState(value.startDay)
  const [endDay, setEndDay]           = useState(value.endDay ?? 'Viernes')
  const [start, setStart]             = useState(value.start)
  const [end, setEnd]                 = useState(value.end)
  const [stepMin, setStepMin]         = useState(value.stepMin ?? 60);
  const presetSteps = [5, 10, 15, 20, 30, 45, 50, 60, 70, 80, 90];

  const [showAdvanced, setShowAdvanced] = useState(false)
  const [lunchEnabled, setLunchEnabled] = useState(value.lunchEnabled ?? false)
  const [lunchStart, setLunchStart] = useState(value.lunchStart ?? '13:00')
  const [lunchEnd, setLunchEnd] = useState(value.lunchEnd ?? '14:00')

  // Fin no puede ser igual al inicio
  const endOptions = useMemo(() => DAYS.filter(d => d !== startDay), [startDay])
  const dayNameToKey = {
    'Lunes': 'mon',
    'Martes': 'tue',
    'Miércoles': 'wed',
    'Jueves': 'thu',
    'Viernes': 'fri',
    'Sábado': 'sat',
    'Domingo': 'sun',
  };

  useEffect(() => {
    if (endDay === startDay) {
      const idx = DAYS.indexOf(startDay)
      const next = DAYS[(idx + 1) % DAYS.length]
      setEndDay(next)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDay])

  useEffect(() => {
    onChange({ startDay, endDay, start, end, stepMin, lunchEnabled, lunchStart, lunchEnd })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDay, endDay, start, end, stepMin, lunchEnabled, lunchStart, lunchEnd])

  // Recreos eliminados de esta barra; mantenemos la firma por compatibilidad

  return (
    <div id="settings-bar" className="space-y-3">
      {/* Configuración principal */}
      <div className="rounded-xl border bg-white p-3 grid grid-cols-1 md:grid-cols-5 gap-3">
        <div>
          <label id="start-day-label" className="block text-xs text-gray-500 mb-1">{t('settings.startDay')}</label>
          <select id="start-day-select" className="w-full border rounded-lg px-2 py-3 sm:py-2" value={startDay} onChange={e=>setStartDay(e.target.value)}>
            {DAYS.map(d => <option key={d} value={d}>{t(`days.${dayNameToKey[d]}`) || d}</option>)}
          </select>
        </div>
        <div>
          <label id="end-day-label" className="block text-xs text-gray-500 mb-1">{t('settings.endDay')}</label>
          <select id="end-day-select" className="w-full border rounded-lg px-2 py-3 sm:py-2" value={endDay} onChange={e=>setEndDay(e.target.value)}>
            {endOptions.map(d => <option key={d} value={d}>{t(`days.${dayNameToKey[d]}`) || d}</option>)}
          </select>
        </div>
        <div>
          <label id="start-time-label" className="block text-xs text-gray-500 mb-1">{t('settings.from')}</label>
          <input id="start-time-input" type="time" className="w-full border rounded-lg px-2 py-3 sm:py-2" value={start} onChange={e=>setStart(e.target.value)} />
        </div>
        <div>
          <label id="end-time-label" className="block text-xs text-gray-500 mb-1">{t('settings.to')}</label>
          <input id="end-time-input" type="time" className="w-full border rounded-lg px-2 py-3 sm:py-2" value={end} onChange={e=>setEnd(e.target.value)} />
        </div>
        <div>
          <label id="step-min-label" className="block text-xs text-gray-500 mb-1">{t('settings.step')}</label>
          <select
            id="step-min-select"
            className="w-full border rounded-lg px-2 py-3 sm:py-2"
            value={stepMin}
            onChange={e => setStepMin(Number(e.target.value))}
          >
            {presetSteps.map(v => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Más funciones (oculto por defecto) */}
      <div className="flex justify-center">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-sm text-gray-600 hover:text-gray-800 px-4 py-2 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all"
        >
          {showAdvanced ? t('settings.hideAdvanced') : t('settings.more')}
        </button>
      </div>

      {showAdvanced && (
        <div className="rounded-xl border bg-white p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Sección de almuerzo */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3 border-b pb-2">{t('settings.lunch.title')}</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <input 
                    id="lunchEnabled" 
                    type="checkbox" 
                    checked={lunchEnabled} 
                    onChange={e => setLunchEnabled(e.target.checked)} 
                  />
                  <label htmlFor="lunchEnabled" className="text-sm">{t('settings.lunch.show')}</label>
                </div>

                {lunchEnabled && (
                  <>
                    <div>
                      <label id="lunch-start-label" className="block text-xs text-gray-500 mb-1">{t('settings.lunch.start')}</label>
                      <input 
                        id="lunch-start-input"
                        type="time" 
                        className="w-full border rounded px-2 py-1 text-sm" 
                        value={lunchStart} 
                        onChange={e => setLunchStart(e.target.value)} 
                      />
                    </div>

                    <div>
                      <label id="lunch-end-label" className="block text-xs text-gray-500 mb-1">{t('settings.lunch.end')}</label>
                      <input 
                        id="lunch-end-input"
                        type="time" 
                        className="w-full border rounded px-2 py-1 text-sm" 
                        value={lunchEnd} 
                        onChange={e => setLunchEnd(e.target.value)} 
                      />
                    </div>

                    <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                    {t('settings.lunch.desc')} {lunchStart} and {lunchEnd}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Sección de almacenamiento */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3 border-b pb-2">{t('settings.storage.title')}</h4>
              <div className="space-y-3">
                <div className="text-xs text-gray-600 bg-blue-50 p-3 rounded border border-blue-200">
                  <p className="font-medium mb-1">💾 {t('settings.storage.autoSave')}</p>
                  <p>{t('settings.storage.autoSaveDesc')}</p>
                  <ul className="list-disc list-inside mt-1 ml-2">
                    <li>{t('settings.storage.items.activities')}</li>
                    <li>{t('settings.storage.items.blocks')}</li>
                    <li>{t('settings.storage.items.config')}</li>
                  </ul>
                </div>
                
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('¿Estás seguro de que quieres borrar todos los datos guardados? Esta acción no se puede deshacer.')) {
                      clearAllStorage();
                      window.location.reload();
                    }
                  }}
                  className="w-full bg-red-600 text-white py-2 px-4 rounded-lg text-sm hover:bg-red-700 transition-colors"
                >
                  🗑️ {t('settings.storage.reset')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
