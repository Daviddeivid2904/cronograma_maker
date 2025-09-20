import React from "react";
import PageShell, { Card } from "./PageShell";
import { useTranslation } from 'react-i18next';

export default function Terms() {
  const { t } = useTranslation();
  return (
    <PageShell
      title={t('pages.terms.title')}
      description={t('pages.terms.description')}
    >
      <div className="grid gap-5">
        <Card title={t('terms.service.title')}>
          <p className="text-slate-700">{t('terms.service.p')}</p>
        </Card>

        <Card title={t('terms.ip.title')}>
          <p className="text-slate-700">{t('terms.ip.p')}</p>
        </Card>

        <Card title={t('terms.liability.title')}>
          <p className="text-slate-700">{t('terms.liability.p')}</p>
        </Card>

        <Card title={t('terms.changes.title')}>
          <p className="text-slate-700">{t('terms.changes.p')}</p>
        </Card>
      </div>
    </PageShell>
  );
}
