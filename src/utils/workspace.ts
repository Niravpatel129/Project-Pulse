import { WorkspaceData } from '@/types/workspace';
import { fetchCMSContent, fetchCMSSettings } from '@/utils/cms';
import { newRequest } from './newRequest';

/**
 * Fetches workspace configuration and content from the backend
 * @param workspaceSlug - The workspace identifier (usually subdomain)
 * @returns Promise<WorkspaceData | null>
 */
export async function fetchWorkspaceData(workspaceSlug: string): Promise<WorkspaceData | null> {
  try {
    // Make API call to fetch workspace data using newRequest
    const response = await newRequest({
      method: 'GET',
      url: '/workspaces/public',
      headers: {
        workspace: workspaceSlug,
      },
    });

    if (response.data?.success === false) {
      console.warn(`Invalid workspace data response for ${workspaceSlug}:`, response.data.error);
      return null;
    }

    return response.data?.data || response.data || null;
  } catch (error: any) {
    console.error(
      `Error fetching workspace data for ${workspaceSlug}:`,
      error.response?.data || error.message,
    );
    return null;
  }
}

/**
 * Validates workspace data structure
 * @param data - The workspace data to validate
 * @returns boolean
 */
export function validateWorkspaceData(data: any): data is WorkspaceData {
  return (
    typeof data === 'object' &&
    data !== null &&
    typeof data.name === 'string' &&
    data.name.length > 0
  );
}

/**
 * Gets workspace configuration with CMS content and fallback defaults
 * @param workspaceSlug - The workspace identifier
 * @returns Promise<WorkspaceData>
 */
export async function getWorkspaceConfig(workspaceSlug: string): Promise<WorkspaceData> {
  // Fetch workspace data and CMS content in parallel
  const [workspaceData, cmsContent, cmsSettings] = await Promise.all([
    fetchWorkspaceData(workspaceSlug),
    fetchCMSContent(workspaceSlug),
    fetchCMSSettings(workspaceSlug),
  ]);

  // Start with fetched workspace data or fallback defaults
  let config: WorkspaceData;

  if (workspaceData && validateWorkspaceData(workspaceData)) {
    config = workspaceData;
  } else {
    // Fallback defaults
    config = {
      name: workspaceSlug.charAt(0).toUpperCase() + workspaceSlug.slice(1),
      description: 'Your trusted partner for exceptional service and solutions',
      about: `We are dedicated to providing exceptional service and innovative solutions that help
             our clients achieve their goals. With years of experience and a commitment to
             excellence, we're here to support your success.`,
      services: [
        {
          icon: '🚀',
          title: 'Professional Services',
          description: 'Expert solutions tailored to your business needs with proven results.',
        },
        {
          icon: '💼',
          title: 'Business Solutions',
          description: 'Comprehensive business tools to streamline your operations.',
        },
        {
          icon: '🎯',
          title: 'Strategic Consulting',
          description: 'Strategic guidance to help your business reach its full potential.',
        },
      ],
    };
  }

  // Integrate CMS content if available
  if (cmsContent) {
    config.cms = cmsContent;
  }

  // Integrate CMS settings if available
  if (cmsSettings) {
    config.settings = cmsSettings;

    // Override workspace data with CMS settings when available
    if (cmsSettings.siteName) {
      config.name = cmsSettings.siteName;
    }
    if (cmsSettings.siteDescription) {
      config.description = cmsSettings.siteDescription;
    }
    if (cmsSettings.theme) {
      config.theme = {
        ...config.theme,
        ...cmsSettings.theme,
      };
    }
    if (cmsSettings.contact) {
      config.contact = {
        ...config.contact,
        ...cmsSettings.contact,
      };
    }
    if (cmsSettings.socialMedia) {
      config.social = {
        ...config.social,
        linkedin: cmsSettings.socialMedia.linkedin,
        twitter: cmsSettings.socialMedia.twitter,
        facebook: cmsSettings.socialMedia.facebook,
        website: config.social?.website,
      };
    }
  }

  return config;
}
