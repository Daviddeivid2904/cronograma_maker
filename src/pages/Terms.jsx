import React from "react";
import PageShell, { Card } from "./PageShell";

export default function Terms() {
  return (
    <PageShell
      title="Términos & Condiciones"
      description="Condiciones básicas para usar MyWeekly."
    >
      <div className="grid gap-5">
        <Card title="Uso del servicio">
          <p className="text-slate-700">
            MyWeekly se ofrece “tal cual”, sin garantías. Podés utilizarlo para
            crear y exportar tu cronograma personal. No nos hacemos responsables
            por pérdidas de datos locales ni por decisiones tomadas en base a la
            información que generes.
          </p>
        </Card>

        <Card title="Propiedad intelectual">
          <p className="text-slate-700">
            El software, diseño y marca pertenecen a MyWeekly. Tu contenido
            (títulos, notas, horarios) es tuyo.
          </p>
        </Card>

        <Card title="Limitación de responsabilidad">
          <p className="text-slate-700">
            En ningún caso seremos responsables por daños indirectos, incidentales
            o consecuentes derivados del uso del servicio.
          </p>
        </Card>

        <Card title="Cambios">
          <p className="text-slate-700">
            Podemos modificar estos términos y/o la app. Si los cambios son
            relevantes, lo indicaremos en esta página.
          </p>
        </Card>
      </div>
    </PageShell>
  );
}
