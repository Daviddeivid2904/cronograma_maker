import React from "react";
import PageShell, { Card } from "./PageShell";
import { useTranslation } from 'react-i18next';

export default function Privacy() {
  const { t } = useTranslation();
  return (
    <PageShell
      title={t('pages.privacy.title')}
      description={t('pages.privacy.description')}
    >
      <div className="prose prose-slate max-w-none">
        <p>{t('privacy.p1')}</p>
      </div>

      <div className="mt-6 grid gap-5">
        <Card title={t('privacy.info.title')}>
          <ul className="list-disc pl-5 text-slate-700">
            <li>{t('privacy.info.list1')}</li>
            <li>{t('privacy.info.list2')}</li>
            <li>{t('privacy.info.list3')}</li>
          </ul>
        </Card>

        <Card title={t('privacy.cookies.title')}>
          <p className="text-slate-700">{t('privacy.cookies.p')}</p>
        </Card>

        <Card title={t('privacy.ads.title')}>
          <p className="text-slate-700">{t('privacy.ads.p')}</p>
        </Card>

        <Card title={t('privacy.controls.title')}>
          <ul className="list-disc pl-5 text-slate-700">
            <li>{t('privacy.controls.list1')}</li>
            <li>{t('privacy.controls.list2')}</li>
          </ul>
        </Card>

        <Card title={t('privacy.contact.title')}>
          <p className="text-slate-700">
            {t('privacy.contact.p')} {" "}
          </p>
        </Card>
      </div>
    </PageShell>
  );
}
