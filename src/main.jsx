// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";   // 👈 ESTE FALTABA
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css"; 

import App from "./App.jsx";
import Privacy from "./pages/Privacy.jsx";
import Terms from "./pages/Terms.jsx";
import FAQ from "./pages/FAQ.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/faq" element={<FAQ />} />
    </Routes>
  </BrowserRouter>
);
