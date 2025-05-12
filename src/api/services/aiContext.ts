import { newRequest } from '@/utils/newRequest';

export interface AIContext {
  id: string;
  knowledgePrompt: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Service for AI context-related API calls
 */
export const aiContext = {
  /**
   * Get the current AI context
   */
  get: async (): Promise<AIContext> => {
    const response = await newRequest.get('/ai-settings');
    return response.data.data;
  },

  /**
   * Update the AI context
   * @param data AI context data to update
   */
  update: async (data: { knowledgePrompt: string }): Promise<AIContext> => {
    const response = await newRequest.put('/ai-settings', data);
    return response.data;
  },
};
