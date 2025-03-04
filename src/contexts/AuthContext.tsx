'use client';

import { newRequest } from '@/utils/newRequest';
import { deleteCookie, setCookie } from 'cookies-next';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

// Define user type
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
}

// Define Auth context types
interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (email: string, password: string, name: string) => Promise<void>;
  reloadAuth: () => void;
}

// Create Auth Context
const AuthContext = createContext<AuthContextType | null>(null);

// Cookie options
const cookieOptions = {
  path: '/',
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 7 * 24 * 60 * 60, // 7 days
};

// Auth Provider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Load user from cookie on initial render
  useEffect(() => {
    const loadUserFromCookie = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (token) {
          const response = await newRequest.get('/auth/me');
          const userData = response.data;
          setUser(userData);
          setIsAuthenticated(true);
        }
      } catch (e) {
        console.error('Failed to load user:', e);
        localStorage.removeItem('authToken');
        deleteCookie('user');
      } finally {
        setLoading(false);
      }
    };

    loadUserFromCookie();
  }, []);

  // Login function using passport backend
  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await newRequest.post('/auth/login', { email, password });
      const { user: userData, token } = response.data;

      // Store token in localStorage (already handled by interceptor)
      localStorage.setItem('authToken', token);

      // Store user in cookie
      setCookie('user', JSON.stringify(userData), cookieOptions);

      setUser(userData);
      setIsAuthenticated(true);
      return Promise.resolve();
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Login failed';
      setError(errorMsg);
      return Promise.reject(new Error(errorMsg));
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await newRequest.post('/auth/logout');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      // Remove token and user data
      localStorage.removeItem('authToken');
      deleteCookie('user');
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  // Register function
  const register = async (email: string, password: string, name: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await newRequest.post('/auth/register', { email, password, name });
      const { user: userData, token } = response.data;

      // Store token in localStorage
      localStorage.setItem('authToken', token);

      // Store user in cookie
      setCookie('user', JSON.stringify(userData), cookieOptions);

      setUser(userData);
      setIsAuthenticated(true);
      return Promise.resolve();
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Registration failed';
      setError(errorMsg);
      return Promise.reject(new Error(errorMsg));
    } finally {
      setLoading(false);
    }
  };

  // Reload auth function
  const reloadAuth = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (token) {
        const response = await newRequest.get('/auth/me');
        const userData = response.data;
        setUser(userData);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (e) {
      console.error('Failed to reload auth:', e);
      localStorage.removeItem('authToken');
      deleteCookie('user');
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const value = {
    user,
    loading,
    error,
    isAuthenticated,
    login,
    logout,
    register,
    reloadAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};
