'use client';

import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface Workspace {
  name: string;
  slug: string;
}

interface WorkspaceContextType {
  workspace: Workspace | null;
  isLoading: boolean;
  error: Error | null;
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
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to get workspace'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <WorkspaceContext.Provider value={{ workspace, isLoading, error }}>
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
