import React from "react";
import PageShell, { Card } from "./PageShell";
import { useTranslation } from 'react-i18next';

const QA = ({ q, a }) => (
  <details className="rounded-lg border border-slate-200 bg-white p-4 open:bg-slate-50">
    <summary className="cursor-pointer select-none font-medium text-slate-900">
      {q}
    </summary>
    <div className="mt-2 text-slate-700">{a}</div>
  </details>
);

export default function FAQ() {
  const { t } = useTranslation();
  return (
    <PageShell
      title={t('pages.faq.title')}
      description={t('pages.faq.description')}
    >
      <div className="grid gap-4">
        <Card>
          <div className="grid gap-3">
            <QA
              q={t('faq.q1')}
              a={t('faq.a1')}
            />
            <QA
              q={t('faq.q2')}
              a={t('faq.a2')}
            />
            <QA
              q={t('faq.q3')}
              a={t('faq.a3')}
            />
            <QA
              q={t('faq.q4')}
              a={t('faq.a4')}
            />
            <QA
              q={t('faq.q5')}
              a={
                <>
                  {t('faq.a5')} {" "}
                </>
              }
            />
          </div>
        </Card>
      </div>
    </PageShell>
  );
}
