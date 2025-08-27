// src/components/AdRail.jsx
import React, { useEffect } from "react";

/**
 * Tira lateral de AdSense (side-rail). Por defecto muestra 160x600/300x600
 * y se oculta en pantallas chicas (lo controlás desde el padre).
 */
export default function AdRail({
  slot,                 // tu data-ad-slot
  client = "ca-pub-5238026837919071", // tu client
  width = 160,          // 160 o 300 recomendado
  height = 600,         // 600 recomendado
  responsive = true,    // si querés responsive (fluid)
  style = {},
}) {
  useEffect(() => {
    try {
      // dispara el render del anuncio
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {}
  }, []);

  return (
    <ins
      className="adsbygoogle"
      style={{
        display: "block",
        width: `${width}px`,
        height: `${height}px`,
        ...style,
      }}
      data-ad-client={client}
      data-ad-slot={slot}
      // Para side-rail, podés dejar auto, o fluid si querés responsive:
      data-ad-format={responsive ? "auto" : undefined}
      data-full-width-responsive={responsive ? "true" : "false"}
    />
  );
}
