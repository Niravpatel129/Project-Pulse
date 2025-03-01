'use client';

import React, { createContext, ReactNode, useContext, useState } from 'react';

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

// Mock users for testing
const MOCK_USERS: User[] = [
  {
    id: '1',
    email: 'admin@example.com',
    name: 'Admin User',
    role: 'admin',
  },
  {
    id: '2',
    email: 'user@example.com',
    name: 'Regular User',
    role: 'user',
  },
];

// Auth Provider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Simple login function
  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      const foundUser = MOCK_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase());

      if (!foundUser) {
        throw new Error('Invalid email or password');
      }

      setUser(foundUser);
      setIsAuthenticated(true);
      return Promise.resolve();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Login failed';
      setError(errorMsg);
      return Promise.reject(new Error(errorMsg));
    } finally {
      setLoading(false);
    }
  };

  // Simple logout function
  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
  };

  // Simple register function
  const register = async (email: string, password: string, name: string) => {
    setLoading(true);
    setError(null);

    try {
      if (MOCK_USERS.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
        throw new Error('User with this email already exists');
      }

      const newUser: User = {
        id: `${MOCK_USERS.length + 1}`,
        email,
        name,
        role: 'user',
      };

      MOCK_USERS.push(newUser);
      setUser(newUser);
      setIsAuthenticated(true);
      return Promise.resolve();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Registration failed';
      setError(errorMsg);
      return Promise.reject(new Error(errorMsg));
    } finally {
      setLoading(false);
    }
  };

  // Simple reload function
  const reloadAuth = () => {
    // No-op in this simplified version
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
