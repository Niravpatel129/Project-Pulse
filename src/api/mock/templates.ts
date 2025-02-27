import { PaginatedResponse, Template } from '../models';
import { mockTemplates } from './data/templates';

/**
 * Handle templates API requests in the mock API
 * @param method HTTP method (GET, POST, PUT, DELETE)
 * @param url Request URL
 * @param params URL parameters
 * @param data Request body
 * @returns Mock API response
 */
export const handleTemplatesRequest = (
  method: string,
  url: string,
  params: Record<string, string>,
  data?: any,
): Promise<any> => {
  return new Promise((resolve) => {
    // Simulate network delay
    setTimeout(() => {
      // GET requests
      if (method === 'GET') {
        // Get all templates with pagination
        if (!url.includes('/')) {
          const { page = '1', limit = '10', search = '', sort = 'name', order = 'asc' } = params;

          const pageNum = parseInt(page, 10);
          const limitNum = parseInt(limit, 10);

          // Filter templates based on search term
          let filteredTemplates = [...mockTemplates];
          if (search) {
            const searchLower = search.toLowerCase();
            filteredTemplates = filteredTemplates.filter(
              (template) =>
                template.name.toLowerCase().includes(searchLower) ||
                template.description.toLowerCase().includes(searchLower),
            );
          }

          // Sort templates
          filteredTemplates.sort((a, b) => {
            const aValue = (a as any)[sort];
            const bValue = (b as any)[sort];

            if (order === 'asc') {
              return aValue > bValue ? 1 : -1;
            } else {
              return aValue < bValue ? 1 : -1;
            }
          });

          // Paginate templates
          const startIndex = (pageNum - 1) * limitNum;
          const endIndex = startIndex + limitNum;
          const paginatedTemplates = filteredTemplates.slice(startIndex, endIndex);

          const response: PaginatedResponse<Template> = {
            items: paginatedTemplates,
            meta: {
              total: filteredTemplates.length,
              page: pageNum,
              limit: limitNum,
              totalPages: Math.ceil(filteredTemplates.length / limitNum),
            },
          };

          resolve(response);
          return;
        }

        // Get template by ID
        const templateId = url.split('/').pop() as string;
        const template = mockTemplates.find((t) => t.id === templateId);

        if (template) {
          resolve(template);
        } else {
          resolve({
            error: 'Template not found',
            status: 404,
          });
        }

        return;
      }

      // POST request - Create a new template
      if (method === 'POST') {
        const newTemplate: Template = {
          ...data,
          id: `template-${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        // In a real implementation, we would add this to the database
        // For the mock, we'll just return the new template
        resolve(newTemplate);
        return;
      }

      // PUT request - Update a template
      if (method === 'PUT') {
        const templateId = url.split('/').pop() as string;
        const templateIndex = mockTemplates.findIndex((t) => t.id === templateId);

        if (templateIndex !== -1) {
          // In a real implementation, we would update the database
          // For the mock, we'll just return the updated template
          const updatedTemplate: Template = {
            ...mockTemplates[templateIndex],
            ...data,
            id: templateId, // Ensure ID doesn't change
            updatedAt: new Date().toISOString(),
          };

          resolve(updatedTemplate);
        } else {
          resolve({
            error: 'Template not found',
            status: 404,
          });
        }

        return;
      }

      // DELETE request - Delete a template
      if (method === 'DELETE') {
        const templateId = url.split('/').pop() as string;
        const templateIndex = mockTemplates.findIndex((t) => t.id === templateId);

        if (templateIndex !== -1) {
          // In a real implementation, we would delete from the database
          // For the mock, we'll just return a success message
          resolve({
            success: true,
            message: 'Template deleted successfully',
          });
        } else {
          resolve({
            error: 'Template not found',
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
