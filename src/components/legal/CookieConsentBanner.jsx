import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { X, Cookie, Settings } from 'lucide-react';
import { createPageUrl } from '@/utils';

const CONSENT_KEY = 'cookie_consent_v1';

export default function CookieConsentBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState({
    essential: true, // Always true, cannot be disabled
    functional: false,
    analytics: false,
  });

  useEffect(() => {
    // Check if user has already made a choice
    const savedConsent = localStorage.getItem(CONSENT_KEY);
    if (!savedConsent) {
      // Show banner after short delay for better UX
      setTimeout(() => setShowBanner(true), 1000);
    } else {
      // Load saved preferences
      try {
        const parsed = JSON.parse(savedConsent);
        setPreferences(parsed);
      } catch (e) {
        console.error('Failed to parse cookie consent:', e);
      }
    }
  }, []);

  const saveConsent = (acceptAll = false) => {
    const consent = acceptAll
      ? { essential: true, functional: true, analytics: true }
      : preferences;

    localStorage.setItem(CONSENT_KEY, JSON.stringify(consent));
    localStorage.setItem('cookie_consent_timestamp', new Date().toISOString());

    // Apply cookie preferences
    applyCookiePreferences(consent);

    setShowBanner(false);
    setShowSettings(false);
  };

  const applyCookiePreferences = (consent) => {
    // If functional cookies are disabled, clear them
    if (!consent.functional) {
      const cookiesToClear = ['language_preference', 'theme_preference', 'sidebar_state', 'reading_settings'];
      cookiesToClear.forEach(cookie => localStorage.removeItem(cookie));
    }

    // If analytics cookies are disabled, disable analytics
    if (!consent.analytics) {
      localStorage.removeItem('_analytics_session');
      // TODO: Disable analytics tracking if implemented
      if (window.gtag) {
        window.gtag('consent', 'update', {
          analytics_storage: 'denied'
        });
      }
    } else {
      // TODO: Enable analytics tracking if implemented
      if (window.gtag) {
        window.gtag('consent', 'update', {
          analytics_storage: 'granted'
        });
      }
    }
  };

  if (!showBanner) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/20 z-40" />

      {/* Banner */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 pb-safe">
        <Card className="max-w-4xl mx-auto shadow-2xl">
          {!showSettings ? (
            // Simple Banner View
            <div className="p-6">
              <div className="flex items-start gap-4">
                <Cookie className="w-8 h-8 text-orange-500 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h3 className="text-lg font-bold mb-2">We Value Your Privacy</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    We use cookies to enhance your experience, remember your preferences,
                    and analyze site usage (with your consent). We{' '}
                    <strong>do NOT use cookies for advertising or tracking children</strong>.
                  </p>
                  <p className="text-xs text-gray-500 mb-4">
                    Essential cookies are required for the site to function. You can customize
                    optional cookies or learn more in our{' '}
                    <a href={createPageUrl('CookiePolicy')} className="text-blue-600 underline">
                      Cookie Policy
                    </a>
                    .
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      onClick={() => saveConsent(true)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Accept All
                    </Button>
                    <Button
                      onClick={() => saveConsent(false)}
                      variant="outline"
                    >
                      Essential Only
                    </Button>
                    <Button
                      onClick={() => setShowSettings(true)}
                      variant="outline"
                      className="gap-2"
                    >
                      <Settings className="w-4 h-4" />
                      Customize
                    </Button>
                  </div>
                </div>
                <button
                  onClick={() => saveConsent(false)}
                  className="text-gray-400 hover:text-gray-600"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          ) : (
            // Detailed Settings View
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Cookie Preferences</h3>
                <button
                  onClick={() => setShowSettings(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 mb-6">
                {/* Essential Cookies - Always on */}
                <div className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="essential"
                      checked={true}
                      disabled={true}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <Label
                        htmlFor="essential"
                        className="font-semibold text-base cursor-not-allowed"
                      >
                        Essential Cookies (Required)
                      </Label>
                      <p className="text-sm text-gray-600 mt-1">
                        These cookies are necessary for the website to function and cannot be
                        disabled. They include authentication, session management, and
                        security features.
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        Examples: login sessions, CSRF protection, profile selection
                      </p>
                    </div>
                  </div>
                </div>

                {/* Functional Cookies */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="functional"
                      checked={preferences.functional}
                      onCheckedChange={(checked) =>
                        setPreferences((prev) => ({ ...prev, functional: checked }))
                      }
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <Label htmlFor="functional" className="font-semibold text-base cursor-pointer">
                        Functional Cookies (Optional)
                      </Label>
                      <p className="text-sm text-gray-600 mt-1">
                        These cookies remember your preferences and settings to provide a
                        personalized experience.
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        Examples: language preference, theme (light/dark), reading settings
                      </p>
                    </div>
                  </div>
                </div>

                {/* Analytics Cookies */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="analytics"
                      checked={preferences.analytics}
                      onCheckedChange={(checked) =>
                        setPreferences((prev) => ({ ...prev, analytics: checked }))
                      }
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <Label htmlFor="analytics" className="font-semibold text-base cursor-pointer">
                        Analytics Cookies (Optional)
                      </Label>
                      <p className="text-sm text-gray-600 mt-1">
                        These cookies help us understand how visitors interact with our
                        website. All data is anonymized and aggregated.
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        Examples: page views, session duration (no personal identification)
                      </p>
                      <p className="text-xs text-orange-600 mt-2 font-semibold">
                        ✓ COPPA Compliant: No child tracking or behavioral profiling
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-4 border-t">
                <Button
                  onClick={() => saveConsent(false)}
                  className="flex-1 min-w-[150px]"
                >
                  Save Preferences
                </Button>
                <Button
                  onClick={() => saveConsent(true)}
                  variant="outline"
                  className="flex-1 min-w-[150px]"
                >
                  Accept All
                </Button>
              </div>

              <p className="text-xs text-center text-gray-500 mt-4">
                Read our{' '}
                <a href={createPageUrl('CookiePolicy')} className="text-blue-600 underline">
                  Cookie Policy
                </a>
                {' '}for more details
              </p>
            </div>
          )}
        </Card>
      </div>
    </>
  );
}

// Helper function to check if user has consented to specific cookie type
export const hasConsentFor = (type) => {
  const consent = localStorage.getItem(CONSENT_KEY);
  if (!consent) return type === 'essential'; // Only essential by default
  
  try {
    const parsed = JSON.parse(consent);
    return parsed[type] === true;
  } catch {
    return false;
  }
};

// Helper function to get all consent preferences
export const getCookieConsent = () => {
  const consent = localStorage.getItem(CONSENT_KEY);
  if (!consent) return { essential: true, functional: false, analytics: false };
  
  try {
    return JSON.parse(consent);
  } catch {
    return { essential: true, functional: false, analytics: false };
  }
};