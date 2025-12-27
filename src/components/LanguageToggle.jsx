import React from 'react';
import { Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';
import useTranslation from '@/hooks/useTranslation';

/**
 * Language Toggle Component
 * Switches between English (EN) and Portuguese (PT-BR)
 */
export default function LanguageToggle({ className = '' }) {
  const { language, toggleLanguage } = useTranslation();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleLanguage}
      className={`relative ${className}`}
      aria-label={`Switch to ${language === 'en' ? 'Portuguese' : 'English'}`}
      title={`Switch to ${language === 'en' ? 'Português' : 'English'}`}
    >
      <Languages className="h-5 w-5 transition-all" />
      <span className="absolute -bottom-1 -right-1 text-[10px] font-bold bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center">
        {language.toUpperCase()}
      </span>
    </Button>
  );
}
