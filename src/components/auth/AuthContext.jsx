import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { rateLimiter } from '@/components/utils/rateLimiter';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [authError, setAuthError] = useState(null);

  // ✅ CRITICAL FIX: Enhanced JWT validation with proper checks
  const isTokenValid = (token) => {
    if (!token || typeof token !== 'string') {
      console.warn('⚠️ Token is null or not a string');
      return false;
    }
    
    try {
      // ✅ Validate JWT format (header.payload.signature)
      const parts = token.split('.');
      if (parts.length !== 3) {
        console.warn('⚠️ Invalid JWT format - expected 3 parts');
        return false;
      }
      
      // ✅ Decode and validate payload
      const payload = JSON.parse(atob(parts[1]));
      
      // ✅ Validate required JWT claims
      if (!payload.sub && !payload.user_id) {
        console.warn('⚠️ Token missing subject/user_id claim');
        return false;
      }
      
      // ✅ Check expiration with 5 minute safety margin
      if (payload.exp) {
        const now = Math.floor(Date.now() / 1000);
        const fiveMinutes = 300;
        
        if (payload.exp <= now) {
          console.warn('⚠️ Token expired at:', new Date(payload.exp * 1000).toISOString());
          return false;
        }
        
        // Warn if expiring soon
        if (payload.exp <= now + fiveMinutes) {
          console.warn('⚠️ Token expiring in less than 5 minutes');
        }
      }
      
      return true;
    } catch (e) {
      console.error('❌ Token validation error:', e);
      return false;
    }
  };

  // ✅ Robust authentication check
  const checkAuth = useCallback(async () => {
    setIsLoadingAuth(true);
    setAuthError(null);

    try {
      const { base44 } = await import('@/api/base44Client');
      const token = localStorage.getItem('base44_access_token');

      // ✅ Token validation
      if (!token || !isTokenValid(token)) {
        console.warn('⚠️ Invalid or expired token found, clearing auth state');
        localStorage.removeItem('base44_access_token');
        localStorage.removeItem('token');
        setUser(null);
        setIsAuthenticated(false);
        setIsLoadingAuth(false);
        return false;
      }

      // ✅ Try to fetch current user
      const currentUser = await base44.auth.me();
      
      if (!currentUser || !currentUser.id) {
        throw new Error('Invalid user data received');
      }

      setUser(currentUser);
      setIsAuthenticated(true);
      console.log('✅ Authentication successful:', currentUser.email);
      setIsLoadingAuth(false);
      return true;

    } catch (error) {
      console.error('❌ Authentication check failed:', error.message);
      
      // ✅ Clear state completely on error
      localStorage.removeItem('base44_access_token');
      localStorage.removeItem('token');
      setUser(null);
      setIsAuthenticated(false);
      
      // ✅ Set friendly error
      if (error.status === 401) {
        setAuthError('Your session has expired. Please log in again.');
      } else {
        setAuthError('Authentication failed. Please try again.');
      }
      
      setIsLoadingAuth(false);
      return false;
    }
  }, []);

  // ✅ Check authentication automatically on mount
  useEffect(() => {
    console.log('🔵 AuthProvider mounted, checking authentication...');
    checkAuth();
  }, []); // Remove checkAuth dependency to prevent infinite loops

  // ✅ Monitor localStorage changes (multi-tab sync)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'base44_access_token') {
        console.log('🔄 Token changed in another tab, re-checking auth...');
        checkAuth();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [checkAuth]);

  const login = async () => {
    // ✅ CRITICAL FIX: Rate limiting to prevent brute force
    const rateCheck = rateLimiter.checkLimit('login_attempt', 5, 300000); // 5 attempts per 5 minutes
    
    if (!rateCheck.allowed) {
      const errorMsg = `Too many login attempts. Please wait ${rateCheck.waitTime} seconds.`;
      setAuthError(errorMsg);
      toast.error('Rate Limit Exceeded', {
        description: errorMsg,
      });
      return;
    }

    setIsLoadingAuth(true);
    setAuthError(null);

    try {
      rateLimiter.recordAttempt('login_attempt');
      
      const { base44 } = await import('@/api/base44Client');
      const returnUrl = window.location.href;
      
      console.log('🔐 Redirecting to Base44 login...');
      await base44.auth.redirectToLogin(returnUrl);
      
      // Clear rate limit on successful redirect
      rateLimiter.clearLimit('login_attempt');
    } catch (error) {
      console.error('❌ Login redirect failed:', error);
      setAuthError('Failed to initiate login. Please try again.');
      setIsLoadingAuth(false);
      
      toast.error('Login Failed', {
        description: 'Unable to redirect to login page.',
      });
    }
  };

  const logout = async (shouldRedirect = true) => {
    try {
      const { base44 } = await import('@/api/base44Client');
      
      setUser(null);
      setIsAuthenticated(false);

      if (shouldRedirect) {
        const returnUrl = window.location.origin;
        await base44.auth.logout(returnUrl);
      } else {
        localStorage.removeItem('base44_access_token');
        localStorage.removeItem('token');
      }

      console.log('✅ Logout successful');
    } catch (error) {
      console.error('❌ Logout failed:', error);
      // ✅ Force cleanup even on error
      localStorage.removeItem('base44_access_token');
      localStorage.removeItem('token');
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const navigateToLogin = () => {
    login();
  };

  const value = {
    user,
    isAuthenticated,
    isLoadingAuth,
    isLoadingPublicSettings: false,
    authError,
    appPublicSettings: null,
    login,
    logout,
    checkAuth,
    navigateToLogin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};