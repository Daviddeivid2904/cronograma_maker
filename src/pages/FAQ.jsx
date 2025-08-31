import React from "react";
import PageShell, { Card } from "./PageShell";

const QA = ({ q, a }) => (
  <details className="rounded-lg border border-slate-200 bg-white p-4 open:bg-slate-50">
    <summary className="cursor-pointer select-none font-medium text-slate-900">
      {q}
    </summary>
    <div className="mt-2 text-slate-700">{a}</div>
  </details>
);

export default function FAQ() {
  return (
    <PageShell
      title="Preguntas Frecuentes"
      description="Respuestas rápidas sobre cómo usar MyWeekly."
    >
      <div className="grid gap-4">
        <Card>
          <div className="grid gap-3">
            <QA
              q="¿Dónde se guardan mis horarios?"
              a="En tu propio navegador (localStorage). No subimos tus horarios a servidores."
            />
            <QA
              q="¿Puedo exportar en PDF o PNG?"
              a="Sí. Abrí el panel de exportación y elegí el formato y tamaño que prefieras."
            />
            <QA
              q="¿Cómo muevo las decoraciones/sellos?"
              a="En la exportación, elige el tema; las imágenes se anclan automáticamente a las esquinas/límites de la grilla según el formato."
            />
            <QA
              q="¿Es gratis?"
              a="Sí, MyWeekly es gratuito. Podemos mostrar anuncios para sostener el servicio."
            />
            <QA
              q="Me gustaría sugerir una mejora"
              a={
                <>
                  Escribinos a{" "}
                  <a className="text-indigo-600 hover:underline" href="mailto:hello@myweekly.online">
                    davidlekerman04@gmail.com
                  </a>{" "}
                  con tu idea. ¡Gracias!
                </>
              }
            />
          </div>
        </Card>
      </div>
    </PageShell>
  );
}
