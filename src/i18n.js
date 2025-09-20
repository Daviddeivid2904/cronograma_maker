import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import esCommon from './locales/es/common.json';
import enCommon from './locales/en/common.json';
import itCommon from './locales/it/common.json';
import frCommon from './locales/fr/common.json';
import deCommon from './locales/de/common.json';
import ptCommon from './locales/pt/common.json';
import nlCommon from './locales/nl/common.json';
import plCommon from './locales/pl/common.json';
import trCommon from './locales/tr/common.json';
import viCommon from './locales/vi/common.json';
import idCommon from './locales/id/common.json';
import ruCommon from './locales/ru/common.json';
import arCommon from './locales/ar/common.json';
import koCommon from './locales/ko/common.json';
import zhCommon from './locales/zh/common.json';
import hiCommon from './locales/hi/common.json';
import jaCommon from './locales/ja/common.json';
import noCommon from './locales/no/common.json';
import fiCommon from './locales/fi/common.json';
import svCommon from './locales/sv/common.json';
import daCommon from './locales/da/common.json';
import csCommon from './locales/cs/common.json';

const supportedLngs = ['es','en','it','fr','de','zh','hi','pt','ar','ru','ja','ko','nl','pl','tr','vi','id','no','fi','sv','da','cs'];

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      es: { common: esCommon },
      en: { common: enCommon },
      it: { common: itCommon },
      fr: { common: frCommon },
      de: { common: deCommon },
      pt: { common: ptCommon },
      nl: { common: nlCommon },
      pl: { common: plCommon },
      tr: { common: trCommon },
      vi: { common: viCommon },
      id: { common: idCommon },
      ru: { common: ruCommon },
      ar: { common: arCommon },
      ko: { common: koCommon },
      zh: { common: zhCommon },
      hi: { common: hiCommon },
      ja: { common: jaCommon },
      no: { common: noCommon },
      fi: { common: fiCommon },
      sv: { common: svCommon },
      da: { common: daCommon },
      cs: { common: csCommon },
    },
    fallbackLng: 'es',
    supportedLngs,
    ns: ['common'],
    defaultNS: 'common',
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage','navigator','htmlTag'],
      caches: ['localStorage'],
    },
  });

// Keep <html> lang/dir in sync
const updateHtmlLangDir = (lng) => {
  const html = document.documentElement;
  html.lang = lng || i18n.resolvedLanguage || 'es';
  const rtlLangs = new Set(['ar','he','fa','ur']);
  html.dir = rtlLangs.has(html.lang) ? 'rtl' : 'ltr';
};

updateHtmlLangDir(i18n.resolvedLanguage);
i18n.on('languageChanged', (lng) => updateHtmlLangDir(lng));

export default i18n;


