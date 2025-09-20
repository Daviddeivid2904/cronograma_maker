import React from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const languages = [
  { code: 'es', label: 'Español' },
  { code: 'en', label: 'English' },
  { code: 'it', label: 'Italiano' },
  { code: 'fr', label: 'Français' },
  { code: 'de', label: 'Deutsch' },
  { code: 'zh', label: '中文' },
  { code: 'hi', label: 'हिन्दी' },
  { code: 'pt', label: 'Português' },
  { code: 'ar', label: 'العربية' },
  { code: 'ru', label: 'Русский' },
  { code: 'ja', label: '日本語' },
  { code: 'ko', label: '한국어' },
  { code: 'nl', label: 'Nederlands' },
  { code: 'pl', label: 'Polski' },
  { code: 'tr', label: 'Türkçe' },
  { code: 'vi', label: 'Tiếng Việt' },
  { code: 'id', label: 'Bahasa Indonesia' },
  { code: 'no', label: 'Norsk' },
  { code: 'fi', label: 'Suomi' },
  { code: 'cs', label: 'Čeština' },
  { code: 'da', label: 'Dansk' },
  { code: 'sv', label: 'Svenska' },
];

// Recibe onSelect para cerrar el menú en el padre
export default function LanguageSwitcher({ onSelect }) {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const { lang } = useParams();
  const location = useLocation();

  const current = (lang || i18n.resolvedLanguage || 'es').split('-')[0];

  const handleChange = (next) => {
    // Cambia idioma en i18next
    i18n.changeLanguage(next);

    // Reemplaza el primer segmento /:lang preservando query y hash
    const parts = location.pathname.split('/').filter(Boolean);
    if (parts.length === 0) {
      navigate(`/${next}${location.search || ''}${location.hash || ''}`, { replace: true });
    } else {
      parts[0] = next;
      navigate('/' + parts.join('/') + (location.search || '') + (location.hash || ''), { replace: true });
    }

    // Cierra el menú en el padre
    if (onSelect) onSelect();
  };

  return (
    <ul className="py-1 max-h-[70vh] overflow-auto">
      {languages.map(l => (
        <li key={l.code}>
          <button
            type="button"
            onClick={() => handleChange(l.code)}
            className={`block w-full text-left px-4 py-2 hover:bg-gray-100 ${
              current === l.code ? 'font-bold' : ''
            }`}
            aria-current={current === l.code ? 'true' : 'false'}
          >
            {l.label}
          </button>
        </li>
      ))}
    </ul>
  );
}
