export const PARENTAL_CONSENT_KEY = 'parental_consent_v1';

export const hasParentalConsent = () => {
  const consent = localStorage.getItem(PARENTAL_CONSENT_KEY);
  if (!consent) return false;

  try {
    const parsed = JSON.parse(consent);
    return parsed?.granted === true;
  } catch {
    return false;
  }
};

export const recordParentalConsent = (record) => {
  const payload = {
    granted: true,
    timestamp: new Date().toISOString(),
    ...record,
  };

  localStorage.setItem(PARENTAL_CONSENT_KEY, JSON.stringify(payload));
};
