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
}

// Create Auth Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Default mock user data - only used if no mock_users in localStorage
const DEFAULT_MOCK_USERS: User[] = [
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

// Get mock users from localStorage or use defaults
const getMockUsers = (): User[] => {
  if (typeof window === 'undefined') return DEFAULT_MOCK_USERS;

  try {
    const storedUsers = localStorage.getItem('mock_users');
    if (storedUsers) {
      return JSON.parse(storedUsers);
    }
    // Initialize with defaults if none found
    localStorage.setItem('mock_users', JSON.stringify(DEFAULT_MOCK_USERS));
    return DEFAULT_MOCK_USERS;
  } catch (error) {
    console.error('Failed to parse mock users:', error);
    return DEFAULT_MOCK_USERS;
  }
};

// Provider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [mockUsers, setMockUsers] = useState<User[]>([]);
  const [isClient, setIsClient] = useState(false);

  // Set isClient flag when component mounts (client-side only)
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Initialize mock users - only on client side
  useEffect(() => {
    if (isClient) {
      setMockUsers(getMockUsers());
    }
  }, [isClient]);

  // Listen for changes to mock users in localStorage (for dev tools) - only on client side
  useEffect(() => {
    if (!isClient) return;

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'mock_users' && event.newValue) {
        try {
          setMockUsers(JSON.parse(event.newValue));
        } catch (error) {
          console.error('Failed to parse updated mock users:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [isClient]);

  // Check if user is already logged in (from localStorage) - only on client side
  useEffect(() => {
    if (!isClient) return;

    const checkLoggedIn = async () => {
      try {
        const storedUser = localStorage.getItem('auth_user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (err) {
        console.error('Failed to restore auth state:', err);
      } finally {
        setLoading(false);
      }
    };

    checkLoggedIn();
  }, [isClient]);

  // Login function - mock implementation
  const login = async (email: string, password: string) => {
    // Early return with error if not on client side
    if (typeof window === 'undefined' || !isClient) {
      console.error('Login attempted during server rendering');
      return Promise.reject(new Error('Login not available during server rendering'));
    }

    setLoading(true);
    setError(null);

    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Get latest mock users
      const currentMockUsers = getMockUsers();

      // Find user in mock data
      const foundUser = currentMockUsers.find((u) => u.email === email);

      if (!foundUser) {
        throw new Error('Invalid email or password');
      }

      // In a real app, you would validate the password here
      // For mock purposes, we'll accept any password

      // Save to state and localStorage
      setUser(foundUser);
      localStorage.setItem('auth_user', JSON.stringify(foundUser));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Register function - mock implementation
  const register = async (email: string, password: string, name: string) => {
    // Early return with error if not on client side
    if (typeof window === 'undefined' || !isClient) {
      console.error('Registration attempted during server rendering');
      return Promise.reject(new Error('Registration not available during server rendering'));
    }

    setLoading(true);
    setError(null);

    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Get latest mock users
      const currentMockUsers = getMockUsers();

      // Check if user already exists
      if (currentMockUsers.some((u) => u.email === email)) {
        throw new Error('User with this email already exists');
      }

      // Create new user
      const newUser: User = {
        id: `${currentMockUsers.length + 1}`,
        email,
        name,
        role: 'user',
      };

      // Update mock users
      const updatedUsers = [...currentMockUsers, newUser];
      localStorage.setItem('mock_users', JSON.stringify(updatedUsers));
      setMockUsers(updatedUsers);

      // Auto-login after registration
      setUser(newUser);
      localStorage.setItem('auth_user', JSON.stringify(newUser));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    // Skip localStorage operations if not on client side
    if (typeof window === 'undefined' || !isClient) {
      console.warn('Logout attempted during server rendering');
      return;
    }

    setUser(null);
    localStorage.removeItem('auth_user');
  };

  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    login,
    logout,
    register,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);

  // Return a safe default object if context is not available (during SSR or outside provider)
  if (context === undefined) {
    // Log warning instead of error to reduce console noise
    if (typeof window !== 'undefined') {
      console.warn(
        'useAuth hook was called outside of AuthProvider or before it was fully initialized. Using fallback values.',
      );
    }

    // Return a more forgiving fallback that doesn't throw errors
    return {
      user: null,
      loading: false,
      error: null,
      isAuthenticated: false,
      login: async (email: string, password: string) => {
        // Just log and return a resolved promise with null
        console.warn('Auth context not available - login operation had no effect');
        return Promise.resolve();
      },
      logout: () => {
        console.warn('Auth context not available - logout operation had no effect');
      },
      register: async (email: string, password: string, name: string) => {
        // Just log and return a resolved promise with null
        console.warn('Auth context not available - register operation had no effect');
        return Promise.resolve();
      },
    };
  }

  return context;
};
