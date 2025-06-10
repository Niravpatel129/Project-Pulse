import { getMockWorkspace } from '@/lib/mock';
import { CMSPage, CMSSettings } from '@/types/cms';

export interface WorkspaceCMSData {
  workspace: string;
  settings: CMSSettings;
  pages: {
    home: CMSPage;
    locations?: Record<string, CMSPage>; // e.g., { "toronto": CMSPage, "brampton": CMSPage }
  };
  navigation: Array<{
    id: string;
    label: string;
    url: string;
    order: number;
    target?: '_self' | '_blank';
  }>;
}

export interface CMSPageSection {
  id: string;
  type:
    | 'heroSection'
    | 'serviceSection'
    | 'contactSection'
    | 'clientsSection'
    | 'outcomesSection'
    | 'storySection'
    | 'socialsSection'
    | 'footerSection';
  title?: string;
  subtitle?: string;
  order: number;

  // Generic configuration options
  variant?: string;
  layout?: string;
  backgroundColor?: string;
  columns?: number;
  showCTA?: boolean;

  // Section-specific data
  data: Record<string, any>;
}

export interface EnhancedCMSPage extends CMSPage {
  type: 'home' | 'location';
  sections: CMSPageSection[];
  locationData?: {
    city: string;
    province: string;
    coordinates?: { lat: number; lng: number };
    serviceAreas?: string[];
    specificServices?: string[];
  };
}

/**
 * Get workspace CMS data by workspace slug
 */
export async function getWorkspaceCMS(workspaceSlug: string): Promise<WorkspaceCMSData | null> {
  try {
    // In development, use our organized mock data
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEV] Fetching CMS data for workspace: ${workspaceSlug}`);
      const mockData = getMockWorkspace(workspaceSlug);
      if (mockData) {
        console.log(`[DEV] Found mock data for workspace: ${workspaceSlug}`);
        return mockData;
      }
      console.log(`[DEV] No mock data found for workspace: ${workspaceSlug}`);
    }

    // In production, this would fetch from your backend/database
    // For now, we'll return null if no mock data found
    return null;
  } catch (error) {
    console.error(`Error fetching CMS data for workspace ${workspaceSlug}:`, error);
    return null;
  }
}

/**
 * Get a specific page for a workspace
 */
export async function getWorkspacePage(
  workspaceSlug: string,
  pageType: 'home' | 'location',
  locationSlug?: string,
): Promise<EnhancedCMSPage | null> {
  try {
    const cmsData = await getWorkspaceCMS(workspaceSlug);
    if (!cmsData) return null;

    if (pageType === 'home') {
      return cmsData.pages.home as EnhancedCMSPage;
    }

    if (pageType === 'location' && locationSlug && cmsData.pages.locations) {
      return (cmsData.pages.locations[locationSlug] as EnhancedCMSPage) || null;
    }

    return null;
  } catch (error) {
    console.error(
      `Error fetching page ${pageType}/${locationSlug} for workspace ${workspaceSlug}:`,
      error,
    );
    return null;
  }
}

/**
 * Check if a location page exists for a workspace
 */
export async function hasLocationPage(
  workspaceSlug: string,
  locationSlug: string,
): Promise<boolean> {
  try {
    console.log(`[DEV] Checking if location page exists: ${workspaceSlug}/${locationSlug}`);
    const cmsData = await getWorkspaceCMS(workspaceSlug);

    if (!cmsData) {
      console.log(`[DEV] No CMS data found for workspace: ${workspaceSlug}`);
      return false;
    }

    const hasLocation = !!cmsData?.pages.locations?.[locationSlug];
    console.log(`[DEV] Location ${locationSlug} exists in ${workspaceSlug}: ${hasLocation}`);

    if (cmsData.pages.locations) {
      console.log(
        `[DEV] Available locations for ${workspaceSlug}:`,
        Object.keys(cmsData.pages.locations),
      );
    }

    return hasLocation;
  } catch (error) {
    console.error(
      `Error checking location page ${locationSlug} for workspace ${workspaceSlug}:`,
      error,
    );
    return false;
  }
}
