import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [authError, setAuthError] = useState(null);
  const { toast } = useToast();

  const isTokenValid = (token) => {
    if (!token || typeof token !== 'string') return false;

    try {
      const parts = token.split('.');
      if (parts.length !== 3) return false;

      const payload = JSON.parse(atob(parts[1]));
      if (!payload.exp) return true;

      const now = Math.floor(Date.now() / 1000);
      return payload.exp > (now + 300);
    } catch (error) {
      console.error('❌ Token validation failed:', error);
      return false;
    }
  };

  const checkAuth = useCallback(async () => {
    setIsLoadingAuth(true);
    setAuthError(null);

    try {
      const { base44Client } = await import('@/api/base44Client');
      const token = localStorage.getItem('base44_access_token');

      if (!token || !isTokenValid(token)) {
        console.warn('⚠️ Invalid or expired token found, clearing auth state');
        localStorage.removeItem('base44_access_token');
        localStorage.removeItem('token');
        setUser(null);
        setIsAuthenticated(false);
        setIsLoadingAuth(false);
        return false;
      }

      base44Client.setToken(token);
      const currentUser = await base44Client.auth.me();

      if (!currentUser || !currentUser.id) {
        throw new Error('Invalid user data received');
      }

      setUser(currentUser);
      setIsAuthenticated(true);
      console.log('✅ Authentication successful:', currentUser.email);
      setIsLoadingAuth(false);
      return true;
    } catch (error) {
      console.error('❌ Authentication check failed:', error);

      localStorage.removeItem('base44_access_token');
      localStorage.removeItem('token');
      setUser(null);
      setIsAuthenticated(false);

      if (error?.status === 401) {
        setAuthError({
          type: 'session_expired',
          message: 'Your session has expired. Please log in again.',
        });
      } else {
        setAuthError({
          type: 'auth_failed',
          message: 'Authentication failed. Please try again.',
        });
      }

      setIsLoadingAuth(false);
      return false;
    }
  }, []);

  useEffect(() => {
    console.log('🔵 AuthProvider mounted, checking authentication...');
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === 'base44_access_token') {
        console.log('🔄 Token changed in another tab, re-checking auth...');
        checkAuth();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [checkAuth]);

  const login = async () => {
    try {
      setIsLoadingAuth(true);
      setAuthError(null);
      
      // Import base44 only when needed
      const { base44Client } = await import('@/api/base44Client');
      
      // Redirect to Base44 login
      const returnUrl = window.location.href;
      await base44Client.auth.redirectToLogin(returnUrl);
    } catch (error) {
      console.error('Login redirect failed:', error);
      setAuthError({
        type: 'login_failed',
        message: error.message || 'Failed to redirect to login',
      });
      setIsLoadingAuth(false);
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: 'Unable to redirect to login page.',
      });
    }
  };

  const logout = async (shouldRedirect = true) => {
    try {
      // Import base44 only when needed
      const { base44Client } = await import('@/api/base44Client');
      
      setUser(null);
      setIsAuthenticated(false);
      
      if (shouldRedirect) {
        const returnUrl = window.location.origin;
        await base44Client.auth.logout(returnUrl);
      } else {
        // Just clear tokens
        localStorage.removeItem('base44_access_token');
        localStorage.removeItem('token');
      }
      console.log('✅ Logout successful');
    } catch (error) {
      console.error('Logout failed:', error);
      // Force clear even if SDK fails
      localStorage.removeItem('base44_access_token');
      localStorage.removeItem('token');
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
