import { CMSContent, CMSSettings } from './cms';

export interface WorkspaceData {
  name: string;
  description?: string;
  theme?: {
    primaryColor?: string;
    secondaryColor?: string;
  };
  services?: Array<{
    icon: string;
    title: string;
    description: string;
  }>;
  about?: string;
  contact?: {
    email?: string;
    phone?: string;
    address?: string;
  };
  social?: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
    website?: string;
  };
  // CMS Integration
  cms?: CMSContent;
  settings?: CMSSettings;
}

export interface WorkspaceApiResponse {
  success: boolean;
  data?: WorkspaceData;
  error?: string;
}

export interface WorkspacePublicPageProps {
  workspace: string;
  data?: WorkspaceData;
}
