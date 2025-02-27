import { api } from '../client';
import { Attachment, Comment, ListRequestParams, PaginatedResponse, ProjectFile } from '../models';

/**
 * Service for project file-related API calls
 */
export const projectFiles = {
  /**
   * Get all project files with pagination
   * @param params Query parameters for pagination, sorting, and filtering
   */
  getProjectFiles: async (params?: ListRequestParams): Promise<PaginatedResponse<ProjectFile>> => {
    return api.get(
      '/project-files',
      params as Record<string, string | number | boolean | null | undefined>,
    );
  },

  /**
   * Get a single project file by ID
   * @param id Project file ID
   */
  getProjectFileById: async (id: string): Promise<ProjectFile> => {
    return api.get(`/project-files/${id}`);
  },

  /**
   * Create a new project file
   * @param data Project file data to create
   */
  createProjectFile: async (
    data: Omit<ProjectFile, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>,
  ): Promise<ProjectFile> => {
    return api.post('/project-files', data);
  },

  /**
   * Update an existing project file
   * @param id Project file ID
   * @param data Project file data to update
   */
  updateProjectFile: async (id: string, data: Partial<ProjectFile>): Promise<ProjectFile> => {
    return api.put(`/project-files/${id}`, data);
  },

  /**
   * Delete a project file
   * @param id Project file ID
   */
  deleteProjectFile: async (id: string): Promise<{ success: boolean }> => {
    return api.delete(`/project-files/${id}`);
  },

  /**
   * Update the status of a project file
   * @param id Project file ID
   * @param status New status
   */
  updateProjectFileStatus: async (id: string, status: string): Promise<ProjectFile> => {
    return api.patch(`/project-files/${id}/status`, { status });
  },

  /**
   * Add a comment to a project file
   * @param id Project file ID
   * @param comment Comment text
   */
  addCommentToProjectFile: async (id: string, comment: string): Promise<Comment> => {
    return api.post(`/project-files/${id}/comments`, { text: comment });
  },

  /**
   * Add an attachment to a project file
   * @param id Project file ID
   * @param file File to upload
   * @param description Optional description for the file
   */
  addAttachmentToProjectFile: async (
    id: string,
    file: File,
    description?: string,
  ): Promise<Attachment> => {
    const formData = new FormData();
    formData.append('file', file);
    if (description) {
      formData.append('description', description);
    }

    return api.post(`/project-files/${id}/attachments`, formData, {
      'Content-Type': 'multipart/form-data',
    });
  },

  /**
   * Upload a project file attachment (version)
   * @param fileId Project file ID
   * @param attachmentId Attachment ID
   * @param file File to upload
   * @param description Optional description for the version
   */
  uploadFileVersion: async (
    fileId: string,
    attachmentId: string,
    file: File,
    description?: string,
  ): Promise<Attachment> => {
    const formData = new FormData();
    formData.append('file', file);
    if (description) {
      formData.append('description', description);
    }

    return api.post(`/project-files/${fileId}/attachments/${attachmentId}/versions`, formData, {
      'Content-Type': 'multipart/form-data',
    });
  },

  /**
   * Send a project file via email
   */
  sendEmail: (
    fileId: string,
    data: { subject: string; message: string; requestApproval: boolean },
  ) => {
    return api.post<{ success: boolean; message: string }>(
      `project-files/${fileId}/send-email`,
      data,
    );
  },

  /**
   * Add a product to a file item
   */
  addProductToFile: (
    fileId: string,
    data: {
      id?: string;
      name?: string;
      price?: string;
      description?: string;
      isNew: boolean;
    },
  ) => {
    return api.post<ProjectFile>(`project-files/${fileId}/products`, data);
  },

  /**
   * Add a template item to a file
   */
  addTemplateItem: (fileId: string, data: Omit<ProjectFile, 'id' | 'createdAt' | 'updatedAt'>) => {
    return api.post<ProjectFile>(`project-files/${fileId}/template-items`, data);
  },

  /**
   * Update a template item
   */
  updateTemplateItem: (fileId: string, templateItemId: string, data: Partial<ProjectFile>) => {
    return api.put<ProjectFile>(`project-files/${fileId}/template-items/${templateItemId}`, data);
  },

  /**
   * Delete a template item
   */
  deleteTemplateItem: (fileId: string, templateItemId: string) => {
    return api.delete<void>(`project-files/${fileId}/template-items/${templateItemId}`);
  },

  /**
   * Create a variation of a file
   */
  createVariation: (fileId: string, data: { name: string; description: string }) => {
    return api.post<ProjectFile>(`project-files/${fileId}/variations`, data);
  },

  /**
   * Update production status of an item
   */
  updateProductionStatus: (itemId: string, status: string) => {
    return api.put<ProjectFile>(`project-files/${itemId}/production-status`, { status });
  },
};
