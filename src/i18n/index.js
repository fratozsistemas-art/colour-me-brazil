import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { translations } from './translations';

const LANGUAGE_STORAGE_KEY = 'language';

const getStoredLanguage = () => {
  const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
  if (!stored) return null;

  try {
    return JSON.parse(stored);
  } catch {
    return stored;
  }
};

const getBrowserLanguage = () => {
  const browserLang = navigator.language || navigator.userLanguage;
  return browserLang?.startsWith('pt') ? 'pt' : 'en';
};

const initialLanguage = getStoredLanguage() || getBrowserLanguage();

void i18n.use(initReactI18next).init({
  resources: {
    en: { translation: translations.en },
    pt: { translation: translations.pt },
  },
  lng: initialLanguage,
  fallbackLng: 'en',
  supportedLngs: ['en', 'pt'],
  interpolation: {
    escapeValue: false,
  },
});

i18n.on('languageChanged', (language) => {
  localStorage.setItem(LANGUAGE_STORAGE_KEY, JSON.stringify(language));
  document.documentElement.lang = language === 'pt' ? 'pt-BR' : 'en-US';
});

export default i18n;
