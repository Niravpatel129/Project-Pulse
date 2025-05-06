'use client';

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
    // In a real app, this would redirect to Stripe Connect OAuth flow
    // Example:
    // window.location.href = `https://connect.stripe.com/oauth/authorize?response_type=code&client_id=${process.env.STRIPE_CLIENT_ID}&scope=read_write&redirect_uri=${encodeURIComponent(redirectUri)}`;

    try {
      // Mock implementation for demo purposes
      setWorkspace((prev) => {
        return prev
          ? { ...prev, stripeConnected: true, stripeAccountId: `acct_${Date.now()}` }
          : prev;
      });
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to connect Stripe'));
    }
  };

  const disconnectStripe = async () => {
    try {
      // Mock implementation for demo purposes
      setWorkspace((prev) => {
        return prev ? { ...prev, stripeConnected: false, stripeAccountId: undefined } : prev;
      });
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to disconnect Stripe'));
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
