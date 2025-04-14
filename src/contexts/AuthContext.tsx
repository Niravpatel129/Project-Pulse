'use client';

import { newRequest } from '@/utils/newRequest';
import { deleteCookie, setCookie } from 'cookies-next';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { toast } from 'sonner';

// Define user type
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  avatar: string;
}

// Define Auth context types
interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, options?: { noRedirect?: boolean }) => Promise<void>;
  logout: () => void;
  register: (email: string, password: string, name: string) => Promise<void>;
  reloadAuth: () => void;
}

// Create Auth Context
const AuthContext = createContext<AuthContextType | null>(null);

// Cookie options

interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

// Auth Provider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const loadUserFromCookie = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (token) {
          const response = await newRequest.get('/auth/me');
          const userData = response?.data?.data?.user;
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
  const login = async (email: string, password: string, options?: { noRedirect?: boolean }) => {
    setLoading(true);
    setError(null);

    try {
      const response = await newRequest.post('/auth/login', { email, password });
      const { user: userData, token } = response.data.data;
      console.log('🚀 response:', response);

      localStorage.setItem('authToken', token);
      setCookie('user', JSON.stringify(userData));
      setUser(userData);
      setIsAuthenticated(true);

      if (options?.noRedirect === true) {
        return;
      }

      const localRedirectUrl = localStorage.getItem('redirect');

      if (localRedirectUrl && localRedirectUrl !== '/login') {
        toast.success('Redirecting to previous page');
        localStorage.removeItem('redirect');
        return;
      }

      toast.success('Login successful');
    } catch (err: unknown) {
      const error = err as ApiError;
      setError(error.message || 'An error occurred during login');
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
      const { user: userData, token } = response.data.data;

      // Store token in localStorage
      localStorage.setItem('authToken', token);

      // Store user in cookie
      setCookie('user', JSON.stringify(userData));

      setUser(userData);
      setIsAuthenticated(true);
      return Promise.resolve();
    } catch (err: unknown) {
      const error = err as ApiError;
      const errorMsg = error.message || 'An error occurred during signup';
      setError(errorMsg);
      setLoading(false);
      return Promise.reject(new Error(errorMsg));
    }
  };

  // Reload auth function
  const reloadAuth = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (token) {
        console.log('🚀 reloading auth');
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
