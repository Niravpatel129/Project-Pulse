import { Project, ProjectStats } from '../services/projects';
import { PaginatedResponse } from '../types';

// Mock data
const mockProjects: Project[] = [
  {
    _id: '1',
    name: 'Enterprise CRM Implementation',
    description: 'Complete CRM system implementation for Acme Corp',
    projectType: 'software',
    workspace: 'workspace-1',
    manager: 'user-1',
    leadSource: 'referral',
    stage: 'in-progress',
    status: 'active',
    clients: ['client-1'],
    startDate: '2023-09-15',
    targetDate: '2024-01-31',
    modulesCount: 3,
    attachments: [],
    isActive: true,
    isClosed: false,
    isArchived: false,
    createdBy: 'user-1',
    createdAt: '2023-09-01T10:00:00Z',
    updatedAt: '2023-11-15T14:30:00Z',
  },
  {
    _id: '2',
    name: 'Brand Redesign Project',
    description: 'Complete brand refresh including logo, website, and marketing materials',
    projectType: 'design',
    workspace: 'workspace-1',
    manager: 'user-2',
    leadSource: 'website',
    stage: 'planning',
    status: 'active',
    clients: ['client-2'],
    startDate: '2023-10-01',
    targetDate: '2023-12-31',
    modulesCount: 4,
    attachments: [],
    isActive: true,
    isClosed: false,
    isArchived: false,
    createdBy: 'user-2',
    createdAt: '2023-09-15T09:30:00Z',
    updatedAt: '2023-11-10T11:20:00Z',
  },
];

// Mock time tracking data
const mockTimeEntries: Record<
  string,
  Array<{ hours: number; description: string; date: string }>
> = {
  '1': [
    { hours: 3.5, description: 'Initial client meeting', date: '2023-09-16T10:00:00Z' },
    { hours: 5, description: 'Requirements gathering', date: '2023-09-17T09:00:00Z' },
    { hours: 8, description: 'Database architecture design', date: '2023-09-20T08:30:00Z' },
    { hours: 6, description: 'Frontend mockups review', date: '2023-09-22T13:00:00Z' },
    { hours: 4.5, description: 'API development', date: '2023-09-25T09:15:00Z' },
  ],
  '2': [
    { hours: 2, description: 'Kickoff meeting', date: '2023-10-02T10:00:00Z' },
    { hours: 4, description: 'Brand strategy session', date: '2023-10-05T11:00:00Z' },
    { hours: 6, description: 'Logo design concepts', date: '2023-10-10T09:30:00Z' },
    { hours: 3.5, description: 'Color palette selection', date: '2023-10-12T14:00:00Z' },
  ],
};

// Mock deliverables data
const mockDeliverables: Record<string, any[]> = {
  '1': [
    { _id: 'd1', name: 'Database Schema', description: 'Complete database schema documentation' },
    { _id: 'd2', name: 'Admin Dashboard', description: 'Admin control panel interface' },
    { _id: 'd3', name: 'Mobile API', description: 'REST API for mobile applications' },
    { _id: 'd4', name: 'User Documentation', description: 'End-user documentation and guides' },
  ],
  '2': [
    { _id: 'd5', name: 'Logo Package', description: 'Logo in various formats and sizes' },
    { _id: 'd6', name: 'Brand Style Guide', description: 'Comprehensive brand style guide' },
    { _id: 'd7', name: 'Website Design', description: 'Complete website redesign mockups' },
  ],
};

// Mock project stats
const mockProjectStats: Record<string, ProjectStats> = {
  '1': {
    timeTracked: 27, // sum of all time entries
    deliverableCount: 4,
    tasksTotal: 12,
    tasksCompleted: 8,
    status: 'active',
    lastUpdated: '2023-11-15T14:30:00Z',
  },
  '2': {
    timeTracked: 15.5, // sum of all time entries
    deliverableCount: 3,
    tasksTotal: 9,
    tasksCompleted: 4,
    status: 'active',
    lastUpdated: '2023-11-10T11:20:00Z',
  },
};

// Mock project invoice data
const mockProjectInvoices: Record<string, any> = {
  '1': {
    invoice: {
      selectedItems: [
        {
          id: 'item1',
          name: 'Database Schema Document',
          description: 'Detailed database schema with documentation',
          price: 1500,
          date: '2023-09-25',
          type: 'deliverable',
          itemType: 'deliverable',
          labels: ['documentation', 'technical'],
          quantity: 1,
          isApiData: true,
          createdAt: '2023-09-25T10:00:00Z',
          _id: 'd1',
        },
        {
          id: 'item2',
          name: 'Admin Dashboard Development',
          description: 'Development of admin control panel',
          price: 2500,
          date: '2023-10-10',
          type: 'deliverable',
          itemType: 'deliverable',
          labels: ['development', 'interface'],
          quantity: 1,
          isApiData: true,
          createdAt: '2023-10-10T14:30:00Z',
          _id: 'd2',
        },
        {
          id: 'item3',
          name: 'Requirements Gathering',
          description: 'Initial requirements gathering session',
          price: 750,
          date: '2023-09-17',
          type: 'task',
          itemType: 'task',
          labels: ['meeting', 'planning'],
          quantity: 1,
          isApiData: true,
          createdAt: '2023-09-17T09:00:00Z',
        },
      ],
      subtotal: 4750,
      taxAmount: 475,
      shippingTotal: 0,
      total: 5225,
      currency: 'USD',
    },
  },
  '2': {
    invoice: {
      selectedItems: [
        {
          id: 'item4',
          name: 'Logo Package',
          description: 'Full logo package in various formats',
          price: 1200,
          date: '2023-10-20',
          type: 'deliverable',
          itemType: 'deliverable',
          labels: ['design', 'branding'],
          quantity: 1,
          isApiData: true,
          createdAt: '2023-10-20T11:15:00Z',
          _id: 'd5',
        },
        {
          id: 'item5',
          name: 'Brand Style Guide',
          description: 'Comprehensive brand identity guidelines',
          price: 1800,
          date: '2023-11-05',
          type: 'deliverable',
          itemType: 'deliverable',
          labels: ['design', 'documentation'],
          quantity: 1,
          isApiData: true,
          createdAt: '2023-11-05T09:30:00Z',
          _id: 'd6',
        },
      ],
      subtotal: 3000,
      taxAmount: 300,
      shippingTotal: 0,
      total: 3300,
      currency: 'USD',
    },
  },
};

/**
 * Handle project API requests in the mock API
 * @param method HTTP method (GET, POST, PUT, DELETE, PATCH)
 * @param url Request URL
 * @param params URL parameters
 * @param data Request body
 * @returns Mock API response
 */
export const handleProjectsRequest = (
  method: string,
  url: string,
  params: Record<string, string>,
  data?: unknown,
): Promise<unknown> => {
  return new Promise((resolve) => {
    // Simulate network delay
    setTimeout(() => {
      // GET requests
      if (method === 'GET') {
        // Handle project invoices endpoint
        if (url.includes('/project-invoices/')) {
          const projectId = url.split('/project-invoices/')[1]; // Extract project ID from URL
          const invoiceData = mockProjectInvoices[projectId];

          if (invoiceData) {
            resolve({
              success: true,
              data: invoiceData,
            });
          } else {
            resolve({
              success: false,
              error: 'Project invoice not found',
              status: 404,
            });
          }
          return;
        }

        // Get project stats
        if (url.includes('/stats')) {
          const projectId = url.split('/')[2]; // Extract project ID from URL
          const stats = mockProjectStats[projectId];

          if (stats) {
            resolve({
              success: true,
              data: stats,
            });
          } else {
            resolve({
              success: false,
              error: 'Project stats not found',
              status: 404,
            });
          }
          return;
        }

        // Get time entries
        if (url.includes('/time-entries')) {
          const projectId = url.split('/')[2]; // Extract project ID from URL
          const timeEntries = mockTimeEntries[projectId] || [];

          resolve({
            success: true,
            data: timeEntries,
          });
          return;
        }

        // Get project deliverables
        if (url.includes('/deliverables') || url.includes('/project/')) {
          const parts = url.split('/');
          const projectId = parts[parts.length - 1]; // Extract project ID from URL
          const deliverables = mockDeliverables[projectId] || [];

          resolve({
            success: true,
            data: deliverables,
          });
          return;
        }

        // Get single project by ID
        if (url.match(/\/projects\/[^\/]+$/)) {
          const projectId = url.split('/').pop() as string;
          const project = mockProjects.find((p) => {
            return p._id === projectId;
          });

          if (project) {
            resolve({
              success: true,
              data: project,
            });
          } else {
            resolve({
              success: false,
              error: 'Project not found',
              status: 404,
            });
          }
          return;
        }

        // Get all projects with pagination
        const { page = '1', limit = '10' } = params;
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);

        // Paginate
        const startIndex = (pageNum - 1) * limitNum;
        const endIndex = startIndex + limitNum;
        const paginatedProjects = mockProjects.slice(startIndex, endIndex);

        const response: PaginatedResponse<Project> = {
          items: paginatedProjects,
          total: mockProjects.length,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(mockProjects.length / limitNum),
        };

        resolve({
          success: true,
          data: response,
        });
        return;
      }

      // POST request - Create a new project
      if (method === 'POST' && url === '/projects') {
        const newProject: Project = {
          ...(data as Partial<Project>),
          _id: `project-${Date.now()}`,
          isActive: true,
          isClosed: false,
          isArchived: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: 'current-user',
        } as Project;

        // In a real implementation, we would add this to the database
        resolve({
          success: true,
          data: newProject,
        });
        return;
      }

      // PATCH request - Update a project
      if (method === 'PATCH' && url.match(/\/projects\/[^\/]+$/)) {
        const projectId = url.split('/').pop() as string;
        const projectIndex = mockProjects.findIndex((p) => {
          return p._id === projectId;
        });

        if (projectIndex !== -1) {
          // In a real implementation, we would update the database
          const updatedProject: Project = {
            ...mockProjects[projectIndex],
            ...(data as Partial<Project>),
            _id: projectId, // Ensure ID doesn't change
            updatedAt: new Date().toISOString(),
          };

          resolve({
            success: true,
            data: updatedProject,
          });
        } else {
          resolve({
            success: false,
            error: 'Project not found',
            status: 404,
          });
        }
        return;
      }

      // PATCH request - Update project status
      if (method === 'PATCH' && url.match(/\/projects\/[^\/]+\/status$/)) {
        const projectId = url.split('/')[2]; // Extract project ID from URL
        const projectIndex = mockProjects.findIndex((p) => {
          return p._id === projectId;
        });

        if (projectIndex !== -1) {
          const status = (data as { status: string }).status;
          const updatedProject = { ...mockProjects[projectIndex] };

          if (status === 'open') {
            updatedProject.isActive = true;
            updatedProject.isClosed = false;
            updatedProject.isArchived = false;
          } else if (status === 'closed') {
            updatedProject.isActive = false;
            updatedProject.isClosed = true;
            updatedProject.isArchived = false;
          } else if (status === 'archived') {
            updatedProject.isActive = false;
            updatedProject.isClosed = true;
            updatedProject.isArchived = true;
          }

          updatedProject.updatedAt = new Date().toISOString();

          resolve({
            success: true,
            data: updatedProject,
          });
        } else {
          resolve({
            success: false,
            error: 'Project not found',
            status: 404,
          });
        }
        return;
      }

      // DELETE request - Delete a project
      if (method === 'DELETE' && url.match(/\/projects\/[^\/]+$/)) {
        const projectId = url.split('/').pop() as string;
        const projectIndex = mockProjects.findIndex((p) => {
          return p._id === projectId;
        });

        if (projectIndex !== -1) {
          // In a real implementation, we would delete from the database
          resolve({
            success: true,
            message: 'Project deleted successfully',
          });
        } else {
          resolve({
            success: false,
            error: 'Project not found',
            status: 404,
          });
        }
        return;
      }

      // If we get here, the request method or URL is not supported
      resolve({
        success: false,
        error: 'Method or URL not supported',
        status: 405,
      });
    }, 300); // 300ms delay to simulate network
  });
};
