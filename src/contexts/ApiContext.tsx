'use client';

import { ApiClient } from '@/api/client';
import { inventory } from '@/api/services/inventory';
import { invoices } from '@/api/services/invoices';
import { projectFiles } from '@/api/services/projectFiles';
import { templates } from '@/api/services/templates';
import React, { createContext, ReactNode, useContext, useMemo, useState } from 'react';

// Combine all services
const services = {
  projectFiles,
  templates,
  invoices,
  inventory,
};

// Type for API client config
interface ApiClientConfig {
  baseUrl: string;
  defaultHeaders: Record<string, string>;
  timeout: number;
  useMock: boolean;
}

interface ApiContextState {
  services: typeof services;
  isLoading: (key: string) => boolean;
  setLoading: (key: string, isLoading: boolean) => void;
  getError: (key: string) => Error | null;
  setError: (key: string, error: Error | null) => void;
  clearAllErrors: () => void;
  client: ApiClient;
  setConfig: (config: Partial<ApiClientConfig>) => void;
}

const ApiContext = createContext<ApiContextState | undefined>(undefined);

interface ApiProviderProps {
  children: ReactNode;
  initialConfig?: Record<string, unknown>;
}

export const ApiProvider: React.FC<ApiProviderProps> = ({ children, initialConfig }) => {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, Error | null>>({});
  const client = useMemo(() => new ApiClient(), []);

  // Apply initial configuration if provided
  useMemo(() => {
    if (initialConfig) {
      if (initialConfig.useMock !== undefined) {
        client.setUseMock(initialConfig.useMock as boolean);
      }
    }
  }, [client, initialConfig]);

  // Wrap services with loading and error handling
  const wrappedServices = useMemo(() => {
    return Object.entries(services).reduce((acc, [serviceName, service]) => {
      const wrappedService = Object.entries(service).reduce((serviceAcc, [methodName, method]) => {
        const wrappedMethod = async (...args: unknown[]) => {
          const key = `${serviceName}.${methodName}`;
          setLoading(key, true);
          setError(key, null);

          try {
            const result = await (method as (...args: unknown[]) => Promise<unknown>)(...args);
            return result;
          } catch (error) {
            setError(key, error instanceof Error ? error : new Error(String(error)));
            throw error;
          } finally {
            setLoading(key, false);
          }
        };

        return {
          ...serviceAcc,
          [methodName]: wrappedMethod,
        };
      }, {});

      return {
        ...acc,
        [serviceName]: wrappedService,
      };
    }, {} as typeof services);
  }, []);

  // Helper methods for loading and error states
  const isLoading = (key: string): boolean => !!loadingStates[key];
  const setLoading = (key: string, loading: boolean) => {
    setLoadingStates((prev) => ({ ...prev, [key]: loading }));
  };

  const getError = (key: string): Error | null => errors[key] || null;
  const setError = (key: string, error: Error | null) => {
    setErrors((prev) => ({ ...prev, [key]: error }));
  };
  const clearAllErrors = () => setErrors({});

  // Update API client configuration
  const setConfig = (config: Partial<ApiClientConfig>) => {
    if (config.useMock !== undefined) {
      client.setUseMock(config.useMock);
    }
  };

  // Create context value
  const contextValue = useMemo(
    () => ({
      services: wrappedServices,
      isLoading,
      setLoading,
      getError,
      setError,
      clearAllErrors,
      client,
      setConfig,
    }),
    [client, wrappedServices],
  );

  return <ApiContext.Provider value={contextValue}>{children}</ApiContext.Provider>;
};

// Hook to use the API context
export const useApi = (): ApiContextState => {
  const context = useContext(ApiContext);
  if (!context) {
    throw new Error('useApi must be used within an ApiProvider');
  }
  return context;
};
