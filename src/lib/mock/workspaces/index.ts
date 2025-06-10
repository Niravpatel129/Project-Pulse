import { WorkspaceCMSData } from '@/lib/cms';
import { bolocreate } from './bolocreate';
import { localservice } from './localservice';
import { techcorp } from './techcorp';

// Mock workspace data for development
export const MOCK_WORKSPACES: Record<string, WorkspaceCMSData> = {
  bolocreate,
  techcorp,
  localservice,
  // Add more mock workspaces here as needed
};

// Development helper to get all available workspace slugs
export const getMockWorkspaceSlugs = () => {
  return Object.keys(MOCK_WORKSPACES);
};

// Development helper to check if a workspace exists
export const hasMockWorkspace = (slug: string) => {
  return slug in MOCK_WORKSPACES;
};

// Get mock workspace data by slug
export const getMockWorkspace = (slug: string): WorkspaceCMSData | null => {
  return MOCK_WORKSPACES[slug] || null;
};
