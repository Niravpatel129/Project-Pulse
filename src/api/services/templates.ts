import { api } from '../client';
import { Template } from '../models';
import { ListRequestParams, PaginatedResponse } from '../types';

/**
 * Service for template-related API calls
 */
export const templates = {
  /**
   * Get all templates with pagination
   * @param params Query parameters for pagination, sorting, and filtering
   */
  getAll: async (params?: ListRequestParams): Promise<PaginatedResponse<Template>> => {
    return api.get('/templates', params);
  },

  /**
   * Get a template by ID
   * @param id Template ID
   */
  getById: async (id: string): Promise<Template> => {
    return api.get(`/templates/${id}`);
  },

  /**
   * Create a new template
   * @param data Template data
   */
  create: async (
    data: Omit<Template, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>,
  ): Promise<Template> => {
    return api.post('/templates', data);
  },

  /**
   * Update an existing template
   * @param id Template ID
   * @param data Template data to update
   */
  update: async (id: string, data: Partial<Template>): Promise<Template> => {
    return api.put(`/templates/${id}`, data);
  },

  /**
   * Delete a template
   * @param id Template ID
   */
  delete: async (id: string): Promise<{ success: boolean }> => {
    return api.delete(`/templates/${id}`);
  },
};
