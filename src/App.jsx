// src/App.jsx
import React, { useMemo, useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import ActivityPalette from './components/ActivityPalette.jsx'
import ActivityList from './components/ActivityList.jsx'
import SettingsBar from './components/SettingsBar.jsx'
import WeekGrid from './components/WeekGrid.jsx'
import ExportPanel from './components/ExportPanel.jsx'
import AdRail from './components/AdRail.jsx'
import { computeDaysRange } from './lib/time.js'
import { saveToStorage, loadFromStorage, STORAGE_KEYS, isStorageAvailable } from './lib/storage.js'
import LanguageSwitcher from './components/LanguageSwitcher.jsx'
import { FaGlobe } from 'react-icons/fa';

export default function App() {
  const { lang } = useParams();
  const { t, i18n } = useTranslation();

  useEffect(() => {
    if (lang && i18n.resolvedLanguage !== lang) {
      i18n.changeLanguage(lang);
    }
  }, [lang, i18n]);

  const [activities, setActivities] = useState(() => {
    if (isStorageAvailable()) {
      const loaded = loadFromStorage(STORAGE_KEYS.ACTIVITIES, []);
      return loaded;
    }
    return [];
  });

  const [showExportPanel, setShowExportPanel] = useState(false)
  const [blocks, setBlocks] = useState(() => {
    if (isStorageAvailable()) {
      const loaded = loadFromStorage(STORAGE_KEYS.BLOCKS, []);
      return loaded;
    }
    return [];
  });

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

  const translatedDays = useMemo(() => {
    const dayTranslations = {
      'Lunes': t('days.mon'),
      'Martes': t('days.tue'),
      'Miércoles': t('days.wed'),
      'Jueves': t('days.thu'),
      'Viernes': t('days.fri'),
      'Sábado': t('days.sat'),
      'Domingo': t('days.sun')
    };
    return days.map(day => dayTranslations[day] || day);
  }, [days, t])

  useEffect(() => {
    if (isStorageAvailable()) {
      saveToStorage(STORAGE_KEYS.ACTIVITIES, activities);
    }
  }, [activities]);

  useEffect(() => {
    if (isStorageAvailable()) {
      saveToStorage(STORAGE_KEYS.BLOCKS, blocks);
    }
  }, [blocks]);

  useEffect(() => {
    if (isStorageAvailable()) {
      saveToStorage(STORAGE_KEYS.SETTINGS, settings);
    }
  }, [settings]);

  function handleAddActivity({ name, color }) {
    setActivities(a => [...a, { id: crypto.randomUUID(), name, color }])
  }

  function handleCreateBreakCard({ name, color }) {
    setActivities(a => [...a, { id: crypto.randomUUID(), name, color }])
  }

  function handleAddToGrid(activity) {
    const ev = new CustomEvent('add-activity-to-grid', { detail: activity })
    window.dispatchEvent(ev)
  }

  function handleDeleteActivity(activityId) {
    setActivities(prev => prev.filter(a => a.id !== activityId))
    const ev = new CustomEvent('delete-activity', { detail: { activityId } })
    window.dispatchEvent(ev)
    setBlocks(prev => prev.filter(b => b.activityId !== activityId));
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

  const exportConfig = {
    ...gridConfig,
    days: translatedDays,
  }

  // ===== Selector de idioma fijo arriba a la derecha =====
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const menuRef = useRef(null);

  // Cerrar por click afuera
  useEffect(() => {
    function onDocClick(e) {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target)) setShowLanguageMenu(false);
    }
    if (showLanguageMenu) {
      document.addEventListener('mousedown', onDocClick);
      document.addEventListener('touchstart', onDocClick);
    }
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('touchstart', onDocClick);
    };
  }, [showLanguageMenu]);

  return (
    <div id="app-container" className="relative w-full overflow-x-hidden">
      {/* Botón fijo arriba-derecha */}
      <div
        ref={menuRef}
        className="fixed top-4 right-4 z-50"
      >
        <button
          onClick={() => setShowLanguageMenu(prev => !prev)}
          className="bg-white/90 backdrop-blur px-2 py-2 rounded-full border border-gray-200 text-gray-700 shadow hover:bg-white"
          aria-haspopup="menu"
          aria-expanded={showLanguageMenu ? 'true' : 'false'}
          aria-label="Language Selector"
        >
          <FaGlobe size={20} />
        </button>
        {showLanguageMenu && (
          <div
            role="menu"
            className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
          >
            <LanguageSwitcher onSelect={() => setShowLanguageMenu(false)} />
          </div>
        )}
      </div>

      {/* Contenedor principal */}
      <div className="mx-auto w-full max-w-screen-2xl px-3 sm:px-4">
        <div className="w-full lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1100px)_minmax(0,1fr)] lg:gap-4">

          {/* IZQUIERDA: Ads */}
          <aside className="hidden lg:block self-start">
            <div className="mx-auto space-y-4" style={{ width: "160px" }}>
              <ins className="adsbygoogle" style={{ display: "inline-block", width: "160px", height: "600px" }} data-ad-client="ca-pub-5238026837919071" data-ad-slot="3734034674"></ins>
              <script dangerouslySetInnerHTML={{ __html: `(adsbygoogle = window.adsbygoogle || []).push({});` }} />
              <ins className="adsbygoogle" style={{ display: "inline-block", width: "160px", height: "600px" }} data-ad-client="ca-pub-5238026837919071" data-ad-slot="7362840807"></ins>
              <script dangerouslySetInnerHTML={{ __html: `(adsbygoogle = window.adsbygoogle || []).push({});` }} />
            </div>
          </aside>

          {/* CENTRO */}
          <main className="min-w-0 w-full">
            <div className="w-full p-4 sm:p-5 space-y-5 bg-white border border-gray-200 rounded-lg">
              <header className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold">{t('title')}</h1>
                  <p className="text-gray-600">{t('subtitle')}</p>
                </div>
                {/* Nota: el selector fijo ya está fuera del header */}
                <button
                  onClick={() => setShowExportPanel(true)}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                  id="click-descargar-imagen-header"
                >
                  {t('downloadImage')}
                </button>
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

              {showExportPanel && (
                <ExportPanel
                  activities={activities}
                  blocks={blocks}
                  config={exportConfig}
                  onClose={() => setShowExportPanel(false)}
                />
              )}

              <div className="pt-4 flex justify-center">
                <button
                  onClick={() => setShowExportPanel(true)}
                  className="bg-indigo-600 text-white px-5 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
                  id="click-descargar-imagen-footer"
                >
                  {t('downloadImage')}
                </button>
              </div>

              <footer id="footer" className="text-center text-xs text-gray-500 pt-4">
                <p>{t('footer.blurb')}</p>
                <div id="footer-links" className="text-sm text-gray-600">
                  <Link id="click-privacy" to={`/${lang || i18n.resolvedLanguage}/privacy`} className="mx-2 hover:underline">{t('nav.privacy')}</Link>
                  <Link id="click-faq" to={`/${lang || i18n.resolvedLanguage}/faq`} className="mx-2 hover:underline">{t('nav.faq')}</Link>
                  <Link id="click-terms" to={`/${lang || i18n.resolvedLanguage}/terms`} className="mx-2 hover:underline">{t('nav.terms')}</Link>
                  <Link id="click-history" to={`/${lang || i18n.resolvedLanguage}/history`} className="mx-2 hover:underline">{t('nav.history')}</Link>
                  <Link id="click-how-to-use" to={`/${lang || i18n.resolvedLanguage}/how-to-use`} className="mx-2 hover:underline">{t('nav.howtouse')}</Link>
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

          {/* DERECHA: Ads */}
          <aside className="hidden lg:block self-start">
            <div className="mx-auto space-y-4" style={{ width: "160px" }}>
              <ins className="adsbygoogle" style={{ display: "inline-block", width: "160px", height: "600px" }} data-ad-client="ca-pub-5238026837919071" data-ad-slot="1473900517"></ins>
              <script dangerouslySetInnerHTML={{ __html: `(adsbygoogle = window.adsbygoogle || []).push({});` }} />
              <ins className="adsbygoogle" style={{ display: "inline-block", width: "160px", height: "600px" }} data-ad-client="ca-pub-5238026837919071" data-ad-slot="4489249542"></ins>
              <script dangerouslySetInnerHTML={{ __html: `(adsbygoogle = window.adsbygoogle || []).push({});` }} />
            </div>
          </aside>

        </div>
      </div>
    </div>
  );
}
