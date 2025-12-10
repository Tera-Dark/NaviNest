import { useState, useEffect } from 'react';
import { translations, getLanguage, type Language } from '../utils/i18n';

export const useTranslation = () => {
  const [lang, setLangState] = useState<Language>('en');

  useEffect(() => {
    setLangState(getLanguage());
  }, []);

  const t = (key: keyof typeof translations.en) => {
    return translations[lang][key] || key;
  };

  return { t, lang };
};
