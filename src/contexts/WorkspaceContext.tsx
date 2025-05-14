'use client';

import { newRequest } from '@/utils/newRequest';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface Workspace {
  name: string;
  slug: string;
  stripeConnected?: boolean;
  stripeAccountId?: string;
}

interface WorkspaceContextType {
  workspace: Workspace | null;
  isLoading: boolean;
  error: Error | null;
  connectStripe?: () => Promise<void>;
  disconnectStripe?: () => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

interface WorkspaceProviderProps {
  children: ReactNode;
}

export function WorkspaceProvider({ children }: WorkspaceProviderProps) {
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        if (hostname !== 'localhost') {
          const subdomain = hostname.split('.')[0];
          setWorkspace({
            name: subdomain.charAt(0).toUpperCase() + subdomain.slice(1),
            slug: subdomain,
            stripeConnected: false, // This would be fetched from your API in a real app
          });
        } else {
          // For localhost development, extract from URL path
          const pathParts = window.location.pathname.split('/');
          if (pathParts.length > 1 && pathParts[1]) {
            const workspaceSlug = pathParts[1];
            setWorkspace({
              name: workspaceSlug.charAt(0).toUpperCase() + workspaceSlug.slice(1),
              slug: workspaceSlug,
              stripeConnected: false, // This would be fetched from your API in a real app
            });
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to get workspace'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const connectStripe = async () => {
    try {
      // Create Stripe Express account and get onboarding URL
      const response = await newRequest.post('/stripe/connect/create-account');

      if (!response.data.success || !response.data.data.onboardingUrl) {
        throw new Error('Failed to create Stripe account');
      }

      // Update local state if account was created
      if (response.data.data.account) {
        setWorkspace((prev) => {
          return prev
            ? {
                ...prev,
                stripeConnected: true,
                stripeAccountId: response.data.data.account.accountId,
              }
            : prev;
        });
      }

      // Redirect to Stripe onboarding
      window.location.href = response.data.data.onboardingUrl;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to connect Stripe'));
      throw err; // Re-throw to let the UI handle the error
    }
  };

  const disconnectStripe = async () => {
    try {
      // Call backend to disconnect the Stripe account
      await newRequest.post('/stripe/connect/disconnect');

      setWorkspace((prev) => {
        return prev ? { ...prev, stripeConnected: false, stripeAccountId: undefined } : prev;
      });
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to disconnect Stripe'));
      throw err;
    }
  };

  return (
    <WorkspaceContext.Provider
      value={{
        workspace,
        isLoading,
        error,
        connectStripe,
        disconnectStripe,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
}
