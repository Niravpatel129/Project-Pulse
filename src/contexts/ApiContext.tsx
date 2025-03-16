'use client';

import { ApiClient, ApiClientConfig } from '@/api/client';
import { inventory } from '@/api/services/inventory';
import { invoices } from '@/api/services/invoices';
import { projectFiles } from '@/api/services/projectFiles';
import { projectSharing } from '@/api/services/projectSharing';
import { templates } from '@/api/services/templates';
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

const defaultApiConfig: ApiClientConfig = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
  timeout: 30000,
};

interface ApiContextState {
  services: {
    projectFiles: typeof projectFiles;
    templates: typeof templates;
    inventory: typeof inventory;
    invoices: typeof invoices;
    projectSharing: typeof projectSharing;
  };
  isLoading: (key: string) => boolean;
  setLoading: (key: string, value: boolean) => void;
  getError: (key: string) => Error | null;
  setError: (key: string, error: Error | null) => void;
  clearAllErrors: () => void;
  client: ApiClient;
  setConfig: (config: Partial<ApiClientConfig>) => void;
}

interface ApiProviderProps {
  children: ReactNode;
  initialConfig?: Partial<ApiClientConfig>;
}

const ApiContext = createContext<ApiContextState | undefined>(undefined);

export const ApiProvider: React.FC<ApiProviderProps> = ({ children, initialConfig }) => {
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, Error | null>>({});
  const [config, setApiConfig] = useState<ApiClientConfig>(defaultApiConfig);
  const client = useMemo(() => {
    return new ApiClient();
  }, []);

  const isLoading = useCallback(
    (key: string) => {
      return loading[key] || false;
    },
    [loading],
  );
  const getError = useCallback(
    (key: string) => {
      return errors[key] || null;
    },
    [errors],
  );
  const clearAllErrors = useCallback(() => {
    return setErrors({});
  }, []);
  const setLoadingState = useCallback((key: string, value: boolean) => {
    setLoading((prev) => {
      return { ...prev, [key]: value };
    });
  }, []);

  const setErrorState = useCallback((key: string, error: Error | null) => {
    setErrors((prev) => {
      return { ...prev, [key]: error };
    });
  }, []);

  const services = useMemo(() => {
    const wrapService = <T extends Record<string, (...args: unknown[]) => Promise<unknown>>>(
      service: T,
      serviceName: string,
    ): T => {
      const wrapped = {} as T;

      Object.entries(service).forEach(([methodName, method]) => {
        if (typeof method !== 'function') {
          wrapped[methodName as keyof T] = method;
          return;
        }

        const wrappedMethod = async (...args: unknown[]) => {
          const key = `${serviceName}.${methodName}`;
          setLoadingState(key, true);
          setErrorState(key, null);

          try {
            const result = await method(...args);
            return result;
          } catch (error) {
            setErrorState(key, error instanceof Error ? error : new Error(String(error)));
            throw error;
          } finally {
            setLoadingState(key, false);
          }
        };

        wrapped[methodName as keyof T] = wrappedMethod as T[keyof T];
      });

      return wrapped;
    };

    return {
      projectFiles: wrapService(projectFiles, 'projectFiles'),
      templates: wrapService(templates, 'templates'),
      inventory: wrapService(inventory, 'inventory'),
      invoices: wrapService(invoices, 'invoices'),
      projectSharing: wrapService(projectSharing, 'projectSharing'),
    };
  }, [setLoadingState, setErrorState]);

  const handleSetConfig = useCallback((newConfig: Partial<ApiClientConfig>) => {
    setApiConfig((prev) => {
      return { ...prev, ...newConfig };
    });
  }, []);

  const value = useMemo(() => {
    return {
      services,
      isLoading,
      setLoading: setLoadingState,
      getError,
      setError: setErrorState,
      clearAllErrors,
      client,
      setConfig: handleSetConfig,
    };
  }, [
    services,
    isLoading,
    setLoadingState,
    getError,
    setErrorState,
    clearAllErrors,
    client,
    handleSetConfig,
  ]);

  useEffect(() => {
    if (initialConfig) {
      handleSetConfig(initialConfig);
    }
  }, [initialConfig, handleSetConfig]);

  return <ApiContext.Provider value={value}>{children}</ApiContext.Provider>;
};

export const useApi = () => {
  const context = useContext(ApiContext);
  if (context === undefined) {
    throw new Error('useApi must be used within an ApiProvider');
  }
  return context;
};
