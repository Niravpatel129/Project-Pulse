import { api } from '../client';
import { Attachment, Comment, ProjectFile, TemplateItemVersion } from '../models';
import { ListRequestParams, PaginatedResponse } from '../types';

/**
 * Service for project file-related API calls
 */
export const projectFiles = {
  /**
   * Get all project files with pagination
   * @param params Query parameters for pagination, sorting, and filtering
   */
  getAll: async (params?: ListRequestParams): Promise<PaginatedResponse<ProjectFile>> => {
    return api.get(
      '/project-files',
      params as Record<string, string | number | boolean | null | undefined>,
    );
  },

  /**
   * Get a single project file by ID
   * @param id Project file ID
   */
  getById: async (id: string): Promise<ProjectFile> => {
    return api.get(`/project-files/${id}`);
  },

  /**
   * Create a new project file
   * @param data Project file data to create
   */
  create: async (
    data: Omit<ProjectFile, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>,
  ): Promise<ProjectFile> => {
    return api.post('/project-files', data);
  },

  /**
   * Update an existing project file
   * @param id Project file ID
   * @param data Project file data to update
   */
  update: async (id: string, data: Partial<ProjectFile>): Promise<ProjectFile> => {
    return api.put(`/project-files/${id}`, data);
  },

  /**
   * Delete a project file
   * @param id Project file ID
   */
  delete: async (id: string): Promise<{ success: boolean }> => {
    return api.delete(`/project-files/${id}`);
  },

  /**
   * Update the status of a project file
   * @param id Project file ID
   * @param status New status value
   */
  updateStatus: async (id: string, status: string): Promise<ProjectFile> => {
    return api.patch(`/project-files/${id}/status`, { status });
  },

  /**
   * Add a comment to a project file
   * @param id Project file ID
   * @param comment Comment data
   */
  addComment: async (
    id: string,
    comment: Omit<Comment, 'id' | 'createdAt'>,
  ): Promise<ProjectFile> => {
    return api.post(`/project-files/${id}/comments`, comment);
  },

  /**
   * Add an attachment to a project file
   * @param id Project file ID
   * @param file File to upload
   */
  addAttachment: async (id: string, file: File): Promise<ProjectFile> => {
    const formData = new FormData();
    formData.append('file', file);

    // For the mock API, we'll just return the response
    return api.post(`/project-files/${id}/attachments`, formData);
  },

  /**
   * Upload a new version of a file
   * @param attachmentId Attachment ID
   * @param file File to upload
   * @param description Description of the changes
   */
  uploadVersion: async (
    attachmentId: string,
    file: File,
    description: string,
  ): Promise<Attachment> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('description', description);

    // For the mock API, we'll just return the response
    return api.post(`/attachments/${attachmentId}/versions`, formData);
  },

  /**
   * Send an email with the project file
   * @param id Project file ID
   * @param to Email recipients
   * @param cc Copy recipients (optional)
   * @param subject Email subject
   * @param message Email message
   */
  sendEmail: async (
    id: string,
    to: string[],
    subject: string,
    message: string,
    cc?: string[],
  ): Promise<{ success: boolean; message: string }> => {
    return api.post(`/project-files/${id}/send-email`, {
      to,
      cc,
      subject,
      message,
    });
  },

  /**
   * Add a template item to a project file
   * @param id Project file ID
   * @param templateItem Template item data
   */
  addTemplateItem: async (
    id: string,
    templateItem: Omit<ProjectFile, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>,
  ): Promise<ProjectFile> => {
    return api.post(`/project-files/${id}/template-items`, templateItem);
  },

  /**
   * Update a template item
   * @param projectFileId Project file ID
   * @param templateItemId Template item ID
   * @param data Template item data to update
   */
  updateTemplateItem: async (
    projectFileId: string,
    templateItemId: string,
    data: Partial<ProjectFile>,
  ): Promise<ProjectFile> => {
    return api.put(`/project-files/${projectFileId}/template-items/${templateItemId}`, data);
  },

  /**
   * Delete a template item
   * @param projectFileId Project file ID
   * @param templateItemId Template item ID
   */
  deleteTemplateItem: async (
    projectFileId: string,
    templateItemId: string,
  ): Promise<{ success: boolean }> => {
    return api.delete(`/project-files/${projectFileId}/template-items/${templateItemId}`);
  },

  /**
   * Get all versions of a template item
   * @param projectFileId Project file ID
   * @param templateItemId Template item ID
   */
  getTemplateItemVersions: async (
    projectFileId: string,
    templateItemId: string,
  ): Promise<TemplateItemVersion[]> => {
    return api.get(`/project-files/${projectFileId}/template-items/${templateItemId}/versions`);
  },

  /**
   * Restore a previous version of a template item
   * @param projectFileId Project file ID
   * @param templateItemId Template item ID
   * @param versionId Version ID to restore
   */
  restoreTemplateItemVersion: async (
    projectFileId: string,
    templateItemId: string,
    versionId: string,
  ): Promise<ProjectFile> => {
    return api.post(
      `/project-files/${projectFileId}/template-items/${templateItemId}/versions/${versionId}/restore`,
      {},
    );
  },

  /**
   * Create a template from an existing project file
   * @param projectFileId Project file ID to convert to a template
   * @param templateData Template data
   */
  createTemplateFromProjectFile: async (
    projectFileId: string,
    templateData: {
      name: string;
      description?: string;
      icon?: string;
    },
  ): Promise<ProjectFile> => {
    return api.post(`/project-files/${projectFileId}/create-template`, templateData);
  },
};
