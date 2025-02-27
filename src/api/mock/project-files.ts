import { PaginatedResponse, ProjectFile } from '../models';

// Import mock data
import * as mockData from './data/projectFiles';

/**
 * Handle project files API requests in the mock API
 * @param method HTTP method (GET, POST, PUT, DELETE)
 * @param url Request URL
 * @param params URL parameters
 * @param data Request body
 * @returns Mock API response
 */
export const handleProjectFilesRequest = (
  method: string,
  url: string,
  params: Record<string, string>,
  data?: unknown,
): Promise<unknown> => {
  return new Promise((resolve) => {
    // Simulate network delay
    setTimeout(() => {
      // Get references to mock data
      const mockProjectFiles = mockData.mockProjectFiles;
      const mockTemplateItems = mockData.mockTemplateItems;

      // GET requests
      if (method === 'GET') {
        // Get project file by ID
        if (url.includes('/') && !url.includes('/template-items')) {
          const fileId = url.split('/').pop() as string;
          const file = mockProjectFiles.find((f) => f.id === fileId);

          if (file) {
            resolve(file);
          } else {
            resolve({
              error: 'Project file not found',
              status: 404,
            });
          }

          return;
        }

        // Get template items
        if (url.includes('/template-items')) {
          const templateId = url.split('/').pop() as string;
          const templateItems = mockTemplateItems.filter((item) => item.templateId === templateId);

          const { page = '1', limit = '10' } = params;
          const pageNum = parseInt(page, 10);
          const limitNum = parseInt(limit, 10);

          // Paginate
          const startIndex = (pageNum - 1) * limitNum;
          const endIndex = startIndex + limitNum;
          const paginatedItems = templateItems.slice(startIndex, endIndex);

          const response: PaginatedResponse<ProjectFile> = {
            items: paginatedItems,
            total: templateItems.length,
            page: pageNum,
            limit: limitNum,
            totalPages: Math.ceil(templateItems.length / limitNum),
          };

          resolve(response);
          return;
        }

        // Get all project files with pagination
        const { page = '1', limit = '10', search = '', status = '', type = '' } = params;

        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);

        // Filter files
        let filteredFiles = [...mockProjectFiles];

        if (search) {
          const searchLower = search.toLowerCase();
          filteredFiles = filteredFiles.filter(
            (file) =>
              file.name.toLowerCase().includes(searchLower) ||
              (file.description && file.description.toLowerCase().includes(searchLower)),
          );
        }

        if (status) {
          filteredFiles = filteredFiles.filter((file) => file.status === status);
        }

        if (type) {
          filteredFiles = filteredFiles.filter((file) => file.type === type);
        }

        // Paginate
        const startIndex = (pageNum - 1) * limitNum;
        const endIndex = startIndex + limitNum;
        const paginatedFiles = filteredFiles.slice(startIndex, endIndex);

        const response: PaginatedResponse<ProjectFile> = {
          items: paginatedFiles,
          total: filteredFiles.length,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(filteredFiles.length / limitNum),
        };

        resolve(response);
        return;
      }

      // POST request - Create a new project file
      if (method === 'POST') {
        const newFile: ProjectFile = {
          ...(data as Partial<ProjectFile>),
          id: `file-${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: 'user-1', // Mock user ID
        } as ProjectFile;

        // In a real implementation, we would add this to the database
        resolve(newFile);
        return;
      }

      // PUT request - Update a project file
      if (method === 'PUT') {
        const fileId = url.split('/').pop() as string;
        const fileIndex = mockProjectFiles.findIndex((file) => file.id === fileId);

        if (fileIndex !== -1) {
          // In a real implementation, we would update the database
          const updatedFile: ProjectFile = {
            ...mockProjectFiles[fileIndex],
            ...(data as Partial<ProjectFile>),
            id: fileId, // Ensure ID doesn't change
            updatedAt: new Date().toISOString(),
          } as ProjectFile;

          resolve(updatedFile);
        } else {
          resolve({
            error: 'Project file not found',
            status: 404,
          });
        }

        return;
      }

      // DELETE request - Delete a project file
      if (method === 'DELETE') {
        const fileId = url.split('/').pop() as string;
        const fileIndex = mockProjectFiles.findIndex((file) => file.id === fileId);

        if (fileIndex !== -1) {
          // In a real implementation, we would delete from the database
          resolve({
            success: true,
            message: 'Project file deleted successfully',
          });
        } else {
          resolve({
            error: 'Project file not found',
            status: 404,
          });
        }

        return;
      }

      // If we get here, the request method is not supported
      resolve({
        error: 'Method not supported',
        status: 405,
      });
    }, 300); // 300ms delay to simulate network
  });
};
