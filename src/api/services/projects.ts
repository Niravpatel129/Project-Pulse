import { api } from '../client';
import { ListRequestParams, PaginatedResponse } from '../types';

/**
 * Project model with all possible properties
 */
export interface Project {
  _id: string;
  name: string;
  description: string;
  projectType: string;
  workspace: string;
  manager?: string;
  leadSource: string;
  stage: string;
  status: string;
  clients: string[];
  startDate?: Date | string;
  targetDate?: Date | string;
  modulesCount?: number;
  attachments: string[];
  isActive: boolean;
  isClosed?: boolean;
  isArchived?: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Project stats model
 */
export interface ProjectStats {
  timeTracked: number; // in hours
  deliverableCount: number;
  tasksTotal: number;
  tasksCompleted: number;
  status: string;
  lastUpdated: string;
}

/**
 * Service for project-related API calls
 */
export const projects = {
  /**
   * Get all projects with pagination
   * @param params Query parameters for pagination, sorting, and filtering
   */
  getAll: async (params?: ListRequestParams): Promise<PaginatedResponse<Project>> => {
    return api.get(
      '/projects',
      params as Record<string, string | number | boolean | null | undefined>,
    );
  },

  /**
   * Get a single project by ID
   * @param id Project ID
   */
  getById: async (id: string): Promise<Project> => {
    return api.get(`/projects/${id}`);
  },

  /**
   * Create a new project
   * @param data Project data to create
   */
  create: async (
    data: Omit<Project, '_id' | 'createdAt' | 'updatedAt' | 'createdBy'>,
  ): Promise<Project> => {
    return api.post('/projects', data);
  },

  /**
   * Update an existing project
   * @param id Project ID
   * @param data Project data to update
   */
  update: async (id: string, data: Partial<Project>): Promise<Project> => {
    return api.patch(`/projects/${id}`, data);
  },

  /**
   * Delete a project
   * @param id Project ID
   */
  delete: async (id: string): Promise<{ success: boolean }> => {
    return api.delete(`/projects/${id}`);
  },

  /**
   * Update the status of a project
   * @param id Project ID
   * @param status New status value (open, closed, archived)
   */
  updateStatus: async (id: string, status: 'open' | 'closed' | 'archived'): Promise<Project> => {
    return api.patch(`/projects/${id}/status`, { status });
  },

  /**
   * Get project statistics
   * @param id Project ID
   */
  getStats: async (id: string): Promise<ProjectStats> => {
    return api.get(`/projects/${id}/stats`);
  },

  /**
   * Get all tasks for a project
   * @param id Project ID
   */
  getTasks: async (id: string): Promise<any[]> => {
    return api.get(`/projects/${id}/tasks`);
  },

  /**
   * Get all time entries for a project
   * @param id Project ID
   */
  getTimeEntries: async (id: string): Promise<any[]> => {
    return api.get(`/projects/${id}/time-entries`);
  },
};
