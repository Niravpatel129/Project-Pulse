import { api } from '../client';
import { ListRequestParams, PaginatedResponse } from '../models';

export interface Activity {
  id: number;
  icon: 'user' | 'file-text' | 'mail' | 'payment' | 'milestone';
  description: string;
  date: string;
  actor?: {
    id: string;
    name: string;
    avatar?: string;
  };
}

/**
 * Service for activity-related API calls
 */
export const activities = {
  /**
   * Get recent activities with pagination
   * @param params Query parameters for pagination, sorting, and filtering
   */
  getRecentActivities: async (params?: ListRequestParams): Promise<PaginatedResponse<Activity>> => {
    return api.get(
      '/activities/recent',
      params as Record<string, string | number | boolean | null | undefined>,
    );
  },
};
