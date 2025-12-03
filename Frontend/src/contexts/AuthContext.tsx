import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../apis/auth';
//import { createCookieMonitor, hasAuthCookie } from '../utils/cookieUtils';
import { useAuthMonitor } from '../hooks/useAuthMonitor';
import { startTokenChecker, stopTokenChecker } from '../libs/axios';

interface AuthUser {
  id: string;
  name: string;
  email: string;
  age?: number;
  gender?: string;
  phone?: string;
  role: 'user' | 'admin';
}

interface AuthContextType {
  user: AuthUser | null;
  login: (user: AuthUser) => void;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

//JWT
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if user is authenticated on app load
  useEffect(() => {
    const verifyToken = async () => {
      try {
        const response = await authApi.verify();
        setUser(response.data.user);
      } catch (error) {
        // Token is invalid or expired, user is not authenticated
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, []);

  // Listen for auth logout events (from axios interceptor)
  useEffect(() => {
    const handleAuthLogout = () => {
      setUser(null);
    };

    window.addEventListener('auth:logout', handleAuthLogout);
    return () => window.removeEventListener('auth:logout', handleAuthLogout);
  }, []);

  // Monitor token deletion for automatic logout
  useAuthMonitor(() => {
    if (user) {
      setUser(null);
    }
  });

  // Start/stop token checker based on auth state
  useEffect(() => {
    if (user) {
      startTokenChecker(); // Start checking every 5 seconds when logged in
    } else {
      stopTokenChecker(); // Stop checking when logged out
    }

    return () => stopTokenChecker(); // Cleanup on unmount
  }, [user]);

  const login = (userData: AuthUser) => {
    setUser(userData);
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
    }
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated, loading }}>
      {children}
    </AuthContext.Provider>
  );
};