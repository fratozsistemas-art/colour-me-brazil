import { getCookieConsent } from '@/components/legal/CookieConsentBanner';
import { logger } from '@/lib/logger';

export const initAnalytics = () => {
  const enabled = import.meta.env.VITE_ENABLE_ANALYTICS === 'true';
  if (!enabled) {
    return;
  }

  const consent = getCookieConsent();
  if (!consent.analytics) {
    logger.info('Analytics disabled by consent.');
    return;
  }

  if (typeof window.gtag === 'function') {
    window.gtag('consent', 'update', { analytics_storage: 'granted' });
    logger.info('Analytics consent granted.');
  }
};
