// src/pages/PageShell.jsx
import React, { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { FaGlobe } from "react-icons/fa";
import LanguageSwitcher from '../components/LanguageSwitcher.jsx';

/** Envuelve el contenido de página con un marco consistente + SEO básico */
export default function PageShell({ title, description, children }) {
  const { lang } = useParams();
  const { t, i18n } = useTranslation();

  useEffect(() => {
    if (lang && i18n.resolvedLanguage !== lang) {
      i18n.changeLanguage(lang);
    }
  }, [lang, i18n]);

  useEffect(() => {
    if (title) document.title = `${title} | MyWeekly`;
  }, [title]);

  // ===== Selector de idioma fijo (como en App.jsx) =====
  const [openLang, setOpenLang] = useState(false);
  const langRef = useRef(null);

  useEffect(() => {
    function onDocClick(e) {
      if (!langRef.current) return;
      if (!langRef.current.contains(e.target)) setOpenLang(false);
    }
    if (openLang) {
      document.addEventListener('mousedown', onDocClick);
      document.addEventListener('touchstart', onDocClick);
    }
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('touchstart', onDocClick);
    };
  }, [openLang]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white relative">
      {/* Botón fijo arriba a la derecha */}
      <div ref={langRef} className="fixed top-4 right-4 z-50">
        <button
          onClick={() => setOpenLang(v => !v)}
          className="bg-white/90 backdrop-blur px-2 py-2 rounded-full border border-gray-200 text-gray-700 shadow hover:bg-white"
          aria-haspopup="menu"
          aria-expanded={openLang ? 'true' : 'false'}
          aria-label="Selector de idioma"
        >
          <FaGlobe size={20} />
        </button>
        {openLang && (
          <div
            role="menu"
            className="absolute right-0 mt-2 w-48 max-w-[90vw] bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden"
          >
            <LanguageSwitcher onSelect={() => setOpenLang(false)} />
          </div>
        )}
      </div>

      <header className="border-b bg-white/70 backdrop-blur">
        <div className="mx-auto max-w-4xl px-4 py-6 flex items-center justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              {title}
            </h1>
            {description && (
              <p className="mt-1 text-slate-600">{description}</p>
            )}
          </div>

          <Link
            to={`/${lang || i18n.resolvedLanguage}`}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            {t('pages.pageshell.planificador') ?? 'Planificador'}
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8">
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="p-5 sm:p-8">{children}</div>
        </div>
      </main>

      <footer className="text-center pb-10">
        <div className="mx-auto max-w-4xl px-4 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} {t('pages.pageshell.footer')}
        </div>
        <div className="text-center text-sm text-gray-600">
          <Link to={`/${lang || i18n.resolvedLanguage}`} className="mx-2 hover:underline">
            {t('pages.pageshell.planificador') ?? 'Planificador'}
          </Link>
        </div>
        <div className="text-center text-sm text-gray-600">
          <Link to={`/${lang || i18n.resolvedLanguage}/privacy`} className="mx-2 hover:underline">{t('nav.privacy')}</Link>
          <Link to={`/${lang || i18n.resolvedLanguage}/faq`} className="mx-2 hover:underline">{t('nav.faq')}</Link>
          <Link to={`/${lang || i18n.resolvedLanguage}/terms`} className="mx-2 hover:underline">{t('nav.terms')}</Link>
          <Link to={`/${lang || i18n.resolvedLanguage}/history`} className="mx-2 hover:underline">{t('nav.history')}</Link>
          <Link to={`/${lang || i18n.resolvedLanguage}/how-to-use`} className="mx-2 hover:underline">{t('nav.howtouse')}</Link>
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
  );
}

/** Bloque/“Card” reutilizable dentro de las páginas */
export function Card({ title, children }) {
  return (
    <section className="not-prose">
      {title && (
        <h2 className="text-lg font-semibold text-slate-900 mb-3">{title}</h2>
      )}
      <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 sm:p-5">
        {children}
      </div>
    </section>
  );
}
