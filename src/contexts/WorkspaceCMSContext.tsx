import { EnhancedCMSPage } from '@/lib/cms';
import { CMSPage, CMSSettings } from '@/types/cms';
import { newRequest } from '@/utils/newRequest';
import { createContext, ReactNode, useContext, useEffect } from 'react';

export interface WorkspaceCMSData {
  workspace: string;
  settings: CMSSettings;
  pages: {
    home: CMSPage;
    locations?: Record<string, CMSPage>;
  };
  navigation: Array<{
    id: string;
    label: string;
    url: string;
    order: number;
    target?: '_self' | '_blank';
  }>;
}

interface WorkspaceCMSContextType {
  cmsData: WorkspaceCMSData | null;
  pageData: EnhancedCMSPage | null;
  loading: boolean;
  error: string | null;
  workspace: string;
  pageType: 'home' | 'location';
  locationSlug?: string;
}

const WorkspaceCMSContext = createContext<WorkspaceCMSContextType | undefined>(undefined);

interface WorkspaceCMSProviderProps {
  children: ReactNode;
  value: WorkspaceCMSContextType;
}

export function WorkspaceCMSProvider({ children, value }: WorkspaceCMSProviderProps) {
  console.log('Hello from workspace CMS');

  useEffect(() => {
    // whats the current domain and subdomain
    const domain = window.location.hostname;
    const subdomain = domain.split('.')[0];
    console.log('🚀 domain:', domain);
    console.log('🚀 subdomain:', subdomain);

    const getWorkspaceId = async () => {
      const response = await newRequest.get(`/workspaces/url`, {
        params: {
          domain,
          subdomain,
        },
      });
      console.log('🚀 response:', response);
    };

    getWorkspaceId();
  }, []);

  return <WorkspaceCMSContext.Provider value={value}>{children}</WorkspaceCMSContext.Provider>;
}

export function useWorkspaceCMS() {
  const context = useContext(WorkspaceCMSContext);
  if (context === undefined) {
    throw new Error('useWorkspaceCMS must be used within a WorkspaceCMSProvider');
  }
  return context;
}
