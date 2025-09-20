import React from 'react';
import PageShell from './PageShell';
import { useTranslation } from 'react-i18next';

export default function History() {
  const { t } = useTranslation();
  const content = t('pages.history.content', { returnObjects: true });

  return (
    <PageShell
      title={t('pages.history.title')}
      description={t('pages.history.description')}
    >
      {Array.isArray(content) ? (
        content.map((paragraph, index) => (
          <p key={index} className="mb-4">
            {paragraph}
          </p>
        ))
      ) : (
        <p className="mb-4">{content}</p>
      )}
    </PageShell>
  );
}
