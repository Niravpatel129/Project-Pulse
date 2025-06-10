'use client';

import { newRequest } from '@/utils/newRequest';
import { useParams } from 'next/navigation';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

interface Workspace {
  _id?: string;
  name: string;
  slug: string;
  stripeConnected?: boolean;
  stripeAccountId?: string;
}

interface POSReader {
  id: string;
  // Add other POS reader properties as needed
}

interface WorkspaceContextType {
  workspace: Workspace | null;
  isLoading: boolean;
  error: Error | null;
  connectStripe?: () => Promise<void>;
  disconnectStripe?: () => Promise<void>;
  posReaders: POSReader[];
  isLoadingReaders: boolean;
  readerId: string | null;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

interface WorkspaceProviderProps {
  children: ReactNode;
}

export function WorkspaceProvider({ children }: WorkspaceProviderProps) {
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [posReaders, setPosReaders] = useState<POSReader[]>([]);
  const [isLoadingReaders, setIsLoadingReaders] = useState(false);
  const [readerId, setReaderId] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();
  const { workspace: workspaceParam } = useParams();

  const fetchPOSReaders = async () => {
    setIsLoadingReaders(true);
    try {
      const response = await newRequest.get('/pos/readers');
      setPosReaders(response.data.data || []);
      setReaderId(response.data.data[0]?.readerId || 'tmr_GEIKoAySImfx6N');
    } catch (err) {
      console.error('Error fetching POS readers:', err);
    } finally {
      setIsLoadingReaders(false);
    }
  };

  useEffect(() => {
    // dont fetch if not logged in
    if (!isAuthenticated) return;
    if (!workspaceParam) return;

    try {
      const fetchWorkspace = async () => {
        try {
          const response = await newRequest.get('/workspaces/current');
          setWorkspace(response.data.data);
          // Fetch POS readers after workspace is loaded
          await fetchPOSReaders();
        } catch (err) {
          console.error('Error fetching workspace:', err);
          if (typeof window !== 'undefined') {
            const hostname = window.location.hostname;
            if (hostname !== 'localhost') {
              const subdomain = hostname.split('.')[0];
              setWorkspace({
                name: subdomain.charAt(0).toUpperCase() + subdomain.slice(1),
                slug: subdomain,
                stripeConnected: false,
              });
            } else {
              // For localhost development, extract from URL path
              const pathParts = window.location.pathname.split('/');
              if (pathParts.length > 1 && pathParts[1]) {
                const workspaceSlug = pathParts[1];
                setWorkspace({
                  name: workspaceSlug.charAt(0).toUpperCase() + workspaceSlug.slice(1),
                  slug: workspaceSlug,
                });
              }
            }
          }
        } finally {
          setIsLoading(false);
        }
      };

      fetchWorkspace();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to get workspace'));
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

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
        posReaders,
        readerId,
        isLoadingReaders,
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
