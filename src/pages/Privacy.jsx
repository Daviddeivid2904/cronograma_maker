import React from "react";
import PageShell, { Card } from "./PageShell";

export default function Privacy() {
  return (
    <PageShell
      title="Política de Privacidad"
      description="Cómo tratamos tus datos y qué información almacenamos."
    >
      <div className="prose prose-slate max-w-none">
        <p>
          En MyWeekly valoramos tu privacidad. Esta app funciona principalmente
          en tu navegador y la información de tus horarios se guarda en{" "}
          <strong>almacenamiento local (localStorage)</strong> del dispositivo,
          no en nuestros servidores.
        </p>
      </div>

      <div className="mt-6 grid gap-5">
        <Card title="Información que almacenamos">
          <ul className="list-disc pl-5 text-slate-700">
            <li>Actividades y bloques que creás dentro del planificador.</li>
            <li>Ajustes de la grilla (días, horas, paso, etc.).</li>
            <li>
              Métricas anónimas de uso (si habilitás cookies/analytics) para
              mejorar la experiencia.
            </li>
          </ul>
        </Card>

        <Card title="Cookies y analítica">
          <p className="text-slate-700">
            Podemos usar herramientas de medición (p. ej., Google Analytics o
            Tag Manager) para estadísticas agregadas. No vendemos tus datos ni
            realizamos perfiles individuales.
          </p>
        </Card>

        <Card title="Publicidad">
          <p className="text-slate-700">
            Si ves anuncios, provienen de redes de terceros (como Google
            AdSense). Esas redes pueden usar cookies propias según sus
            políticas.
          </p>
        </Card>

        <Card title="Tus controles">
          <ul className="list-disc pl-5 text-slate-700">
            <li>
              Podés borrar tu horario y ajustes desde el navegador (limpiando
              datos del sitio) o usando los botones de “reset” si la app los
              provee.
            </li>
            <li>
              Podés desactivar cookies de terceros desde la configuración de tu
              navegador.
            </li>
          </ul>
        </Card>

        <Card title="Contacto">
          <p className="text-slate-700">
            Si tenés dudas, escribinos a <a className="text-indigo-600 hover:underline" href="mailto:hello@myweekly.online">hello@myweekly.online</a>.
          </p>
        </Card>
      </div>
    </PageShell>
  );
}
