import React, { createContext, useState, useContext, useEffect } from 'react';
import { clearStoredToken, getStoredToken } from '@/lib/tokenStorage';
import { logger } from '@/lib/logger';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(false);
  const [authError, setAuthError] = useState(null);

  // Simplified: Don't check auth on mount
  // Let the user decide when to login
  useEffect(() => {
    logger.info('🔐 AuthContext initialized (no auto-check)');
    // App starts in unauthenticated state
    // User can click "Get Started" to login
  }, []);

  const login = async () => {
    try {
      setIsLoadingAuth(true);
      setAuthError(null);
      
      // Import base44 only when needed
      const { base44 } = await import('@/api/base44Client');
      
      // Redirect to Base44 login
      const returnUrl = window.location.href;
      base44.auth.redirectToLogin(returnUrl);
    } catch (error) {
      logger.error('Login redirect failed', error);
      setAuthError({
        type: 'login_failed',
        message: error.message || 'Failed to redirect to login'
      });
      setIsLoadingAuth(false);
    }
  };

  const checkAuth = async () => {
    try {
      setIsLoadingAuth(true);
      
      // Import base44 only when needed
      const { base44 } = await import('@/api/base44Client');
      
      // Check for token in localStorage
      const token = getStoredToken();
      
      if (!token) {
        setIsAuthenticated(false);
        setUser(null);
        setIsLoadingAuth(false);
        return;
      }

      // Set token and check user
      base44.auth.setToken(token);
      const currentUser = await base44.auth.me();
      
      setUser(currentUser);
      setIsAuthenticated(true);
      setIsLoadingAuth(false);
    } catch (error) {
      logger.error('Auth check failed', error);
      
      // Clear invalid token
      clearStoredToken();
      
      setIsAuthenticated(false);
      setUser(null);
      setIsLoadingAuth(false);
    }
  };

  const logout = async (shouldRedirect = true) => {
    try {
      // Import base44 only when needed
      const { base44 } = await import('@/api/base44Client');
      
      setUser(null);
      setIsAuthenticated(false);
      
      if (shouldRedirect) {
        base44.auth.logout(window.location.href);
      } else {
        // Just clear tokens
        clearStoredToken();
      }
    } catch (error) {
      logger.error('Logout failed', error);
      // Force clear even if SDK fails
      clearStoredToken();
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const navigateToLogin = () => {
    login();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoadingAuth,
        isLoadingPublicSettings: false, // Not needed anymore
        authError,
        appPublicSettings: null, // Not needed anymore
        login,
        logout,
        checkAuth,
        navigateToLogin
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
