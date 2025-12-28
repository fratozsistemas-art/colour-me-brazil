import { useCallback } from 'react';
import { useTranslation as useI18nextTranslation } from 'react-i18next';
import i18n from '@/i18n';

/**
 * Custom hook for internationalization (i18n)
 * Supports English (en) and Portuguese (pt)
 * @returns {object} - { t, language, setLanguage, toggleLanguage }
 */
export default function useTranslation() {
  const { t } = useI18nextTranslation();
  const language = i18n.language || 'en';

  /**
   * Translation function
   * @param {string} key - Translation key in dot notation (e.g., 'nav.home')
   * @param {object} params - Optional parameters for interpolation
   * @returns {string} - Translated string
   */
  const translate = useCallback((key, params = {}) => t(key, params), [t]);

  const setLanguage = useCallback((nextLanguage) => {
    i18n.changeLanguage(nextLanguage);
  }, []);

  /**
   * Toggle between English and Portuguese
   */
  const toggleLanguage = useCallback(() => {
    const nextLanguage = language === 'en' ? 'pt' : 'en';
    setLanguage(nextLanguage);
  }, [language, setLanguage]);

  return {
    t: translate,
    language,
    setLanguage,
    toggleLanguage,
  };
}
