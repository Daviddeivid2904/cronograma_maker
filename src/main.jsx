// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./index.css";

import App from "./App.jsx";
import Privacy from "./pages/Privacy.jsx";
import Terms from "./pages/Terms.jsx";
import FAQ from "./pages/FAQ.jsx";
import History from "./pages/History.jsx";
import HowToUse from "./pages/HowToUse.jsx";
import "./i18n";

// Debe coincidir con lo que definiste en i18n (rutas/lng que servís)
const supported = [
  "es","en","it","fr","de","pt","zh","hi","ar","ru","ja","ko","nl","pl","tr","vi","id",
  "no","fi","sv","da","cs"
];

// Mapeos útiles: navegadores pueden devolver variantes como zh-CN, pt-BR, etc.
const LNK_MAP_VARIANTS = {
  "zh-cn": "zh",
  "zh": "zh",
  "pt-br": "pt",
  "pt-pt": "pt"
};

function normalizeLang(input) {
  if (!input) return null;
  const base = input.toLowerCase();
  // zh-CN -> zh, pt-BR -> pt, etc.
  if (LNK_MAP_VARIANTS[base]) return LNK_MAP_VARIANTS[base];
  // es-AR -> es
  const short = base.split("-")[0];
  return short;
}

function detectInitialLang() {
  const stored = normalizeLang(localStorage.getItem("i18nextLng"));
  if (stored && supported.includes(stored)) return stored;

  const nav = normalizeLang(navigator.language || navigator.userLanguage);
  if (nav && supported.includes(nav)) return nav;

  return "es"; // fallback
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Root -> redirige al idioma detectado */}
        <Route path="/" element={<Navigate replace to={`/${detectInitialLang()}`} />} />

        {/* Prefijo de idioma */}
        <Route path=":lang">
          <Route index element={<App />} />
          <Route path="privacy" element={<Privacy />} />
          <Route path="terms" element={<Terms />} />
          <Route path="faq" element={<FAQ />} />
          <Route path="history" element={<History />} />
          <Route path="how-to-use" element={<HowToUse />} />
        </Route>

        {/* Cualquier otra ruta -> home del idioma detectado */}
        <Route path="*" element={<Navigate replace to={`/${detectInitialLang()}`} />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
