const ACCESS_TOKEN_KEY = 'base44_access_token';

export const getStoredToken = () => {
  const sessionToken = sessionStorage.getItem(ACCESS_TOKEN_KEY);
  if (sessionToken) {
    return sessionToken;
  }

  const legacyToken = localStorage.getItem(ACCESS_TOKEN_KEY);
  if (legacyToken) {
    sessionStorage.setItem(ACCESS_TOKEN_KEY, legacyToken);
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    return legacyToken;
  }

  return null;
};

export const setStoredToken = (token) => {
  if (!token) {
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    return;
  }

  sessionStorage.setItem(ACCESS_TOKEN_KEY, token);
};

export const clearStoredToken = () => {
  sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem('token');
};
