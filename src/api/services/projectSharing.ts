import { api } from '../client';

interface SharingSettings {
  privacyLevel: 'signup_required' | 'email_restricted' | 'public';
  requirePassword: boolean;
  password: string;
  teamMembers: string[];
  customMessage: string;
  expirationDays: string;
  allowedEmails: string[];
}

interface ShareResponse {
  success: boolean;
  portalUrl: string;
  message?: string;
}

/**
 * Service for project sharing-related API calls
 */
export const projectSharing = {
  /**
   * Get sharing settings for a project
   * @param projectId Project ID
   */
  getSettings: async (projectId: string): Promise<SharingSettings> => {
    return api.get(`/projects/${projectId}/sharing`);
  },

  /**
   * Update sharing settings for a project
   * @param projectId Project ID
   * @param settings Sharing settings to update
   */
  updateSettings: async (
    projectId: string,
    settings: Partial<SharingSettings>,
  ): Promise<SharingSettings> => {
    return api.put(`/projects/${projectId}/sharing`, settings);
  },

  /**
   * Send client portal link via email
   * @param projectId Project ID
   * @param email Client email address
   * @param settings Sharing settings to apply
   */
  sendPortalLink: async (
    projectId: string,
    email: string,
    settings: SharingSettings,
  ): Promise<ShareResponse> => {
    return api.post(`/projects/${projectId}/share`, {
      email,
      settings,
    });
  },

  /**
   * Get portal URL for a project
   * @param projectId Project ID
   */
  getPortalUrl: async (projectId: string): Promise<{ url: string }> => {
    return api.get(`/projects/${projectId}/portal-url`);
  },
};
