import React from 'react';
import PageShell from './PageShell';
import { useTranslation } from 'react-i18next';

export default function HowToUse() {
  // podés omitir el ns porque defaultNS = 'common', pero lo dejo explícito
  const { t } = useTranslation('common');

  const title = t('pages.howtouse.title');
  const description = t('pages.howtouse.description');

  // OJO: sin esto, i18next no devuelve el array/objeto
  const steps = t('pages.howtouse.steps', { returnObjects: true });

  const stepsArray = Array.isArray(steps) ? steps : [];

  const videoMap = {
  0: "Agregar_actividad.mp4",
  1: "Arrastrar_.mp4",
  2: "editar.mp4",
  3: "Guardar.mp4",
};

  return (
    <PageShell title={title} description={description}>
      <h1 className="text-3xl font-bold mb-4">{title}</h1>
      <p className="mb-4">{description}</p>
{stepsArray.map((step, index) => (
  <div key={index} className="mb-6">
    <h2 className="text-2xl font-semibold mb-2">{step.title}</h2>
    <p className="mb-4">{step.description}</p>

    {videoMap[index] && (
      <video
        src={`/videos/${videoMap[index]}`}
        autoPlay
        loop
        muted
        playsInline
        className="rounded-lg shadow-md max-w-full"
      />
    )}
  </div>
))}
    </PageShell>
  );
}
