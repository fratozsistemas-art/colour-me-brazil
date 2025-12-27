import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(false);
  const [authError, setAuthError] = useState(null);

  // Simplified: Don't check auth on mount
  // Let the user decide when to login
  useEffect(() => {
    console.log('🔐 AuthContext initialized (no auto-check)');
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
      console.error('Login redirect failed:', error);
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
      const token = localStorage.getItem('base44_access_token');
      
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
      console.error('Auth check failed:', error);
      
      // Clear invalid token
      localStorage.removeItem('base44_access_token');
      localStorage.removeItem('token');
      
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
        localStorage.removeItem('base44_access_token');
        localStorage.removeItem('token');
      }
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
