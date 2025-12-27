import { useState, useEffect, useCallback } from 'react';
import useLocalStorage from './useLocalStorage';
import { translations } from '../i18n/translations';

/**
 * Custom hook for internationalization (i18n)
 * Supports English (en) and Portuguese (pt)
 * @returns {object} - { t, language, setLanguage, toggleLanguage }
 */
export default function useTranslation() {
  // Detect browser language or default to English
  const getBrowserLanguage = () => {
    const browserLang = navigator.language || navigator.userLanguage;
    return browserLang.startsWith('pt') ? 'pt' : 'en';
  };

  const [language, setLanguage] = useLocalStorage('language', getBrowserLanguage());

  // Update HTML lang attribute when language changes
  useEffect(() => {
    document.documentElement.lang = language === 'pt' ? 'pt-BR' : 'en-US';
  }, [language]);

  /**
   * Translation function
   * @param {string} key - Translation key in dot notation (e.g., 'nav.home')
   * @param {object} params - Optional parameters for interpolation
   * @returns {string} - Translated string
   */
  const t = useCallback((key, params = {}) => {
    const keys = key.split('.');
    let value = translations[language];

    // Navigate through the nested object
    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) {
        console.warn(`Translation key not found: ${key} (language: ${language})`);
        return key; // Return key if translation not found
      }
    }

    // Simple parameter interpolation
    if (typeof value === 'string' && params) {
      return value.replace(/\{(\w+)\}/g, (match, param) => {
        return params[param] !== undefined ? params[param] : match;
      });
    }

    return value;
  }, [language]);

  /**
   * Toggle between English and Portuguese
   */
  const toggleLanguage = useCallback(() => {
    setLanguage(prevLang => prevLang === 'en' ? 'pt' : 'en');
  }, [setLanguage]);

  return {
    t,
    language,
    setLanguage,
    toggleLanguage,
  };
}
