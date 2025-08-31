// src/pages/PageShell.jsx
import React, { useEffect } from "react";

/** Envuelve el contenido de página con un marco consistente + SEO básico */
export default function PageShell({ title, description, children }) {
  useEffect(() => {
    if (title) document.title = `${title} | MyWeekly`;
  }, [title]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <header className="border-b bg-white/70 backdrop-blur">
        <div className="mx-auto max-w-4xl px-4 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              {title}
            </h1>
            {description && (
              <p className="mt-1 text-slate-600">{description}</p>
            )}
          </div>
          {/* Botón para volver al planificador */}
          <button
            onClick={() => window.location.href = "/"}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700 ml-4"
          >
            Volver al planificador
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8">
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="p-5 sm:p-8">{children}</div>
        </div>
      </main>

      <footer className="text-center pb-10">
        <div className="mx-auto max-w-4xl px-4 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} MyWeekly — Hecho con ❤️
        </div>
        <div className="text-center text-sm text-gray-600">
          <a href="/" className="mx-2 hover:underline">Planificador</a>
        </div>
        <div className="text-center text-sm text-gray-600">
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
