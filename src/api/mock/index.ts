import { handleInventoryCategoriesRequest, handleInventoryItemsRequest } from './inventory';
import { handleInvoicesRequest } from './invoices';
import { handleProjectFilesRequest } from './project-files';
import { handleTemplatesRequest } from './templates';

// Simulate network delay (between 200-500ms)
const NETWORK_DELAY = () => Math.random() * 300 + 200;

type ApiHandler = (
  method: string,
  path: string,
  params: Record<string, string>,
  data?: unknown,
) => Promise<unknown>;

/**
 * Map API paths to their respective handler functions
 */
const API_HANDLERS: Record<string, ApiHandler> = {
  '/project-files': handleProjectFilesRequest,
  '/templates': handleTemplatesRequest,
  '/inventory/items': handleInventoryItemsRequest,
  '/inventory/categories': handleInventoryCategoriesRequest,
  '/invoices': handleInvoicesRequest,
};

/**
 * Handle mock API requests by routing to the appropriate handler
 */
export const handleMockApiRequest = async (
  method: string,
  path: string,
  params: Record<string, string> = {},
  data?: unknown,
): Promise<unknown> => {
  // Wait to simulate network delay
  await new Promise((resolve) => setTimeout(resolve, NETWORK_DELAY()));

  // Find the appropriate handler for this endpoint
  const pathPattern = Object.keys(API_HANDLERS).find((pattern) => {
    // Exact match
    if (pattern === path) return true;

    // Path with ID parameter (e.g. /templates/123)
    if (path.match(new RegExp(`^${pattern}/[\\w-]+$`))) return true;

    return false;
  });

  if (!pathPattern) {
    console.error(`No mock handler found for ${path}`);
    return {
      success: false,
      error: 'Not Found',
      status: 404,
    };
  }

  const handler = API_HANDLERS[pathPattern];

  // Get the ID if this is a resource-specific request
  const id = path.startsWith(pathPattern + '/')
    ? path.substring(pathPattern.length + 1)
    : undefined;

  try {
    // Call the handler with the method, path, params, and data
    return await handler(
      method,
      path,
      params,
      id ? { ...(data as Record<string, unknown>), id } : data,
    );
  } catch (error) {
    console.error(`Error in mock handler for ${path}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      status: 500,
    };
  }
};

/**
 * Create a mock Response object for the fetch API
 */
const createMockResponse = (data: unknown): Response => {
  // Create a mock response object
  const mockResponse = {
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(JSON.stringify(data)),
    blob: () => Promise.resolve(new Blob([JSON.stringify(data)])),
    ok: true,
    status: 200,
    statusText: 'OK',
    headers: new Headers({
      'Content-Type': 'application/json',
    }),
    clone: function () {
      return this;
    },
    redirected: false,
    type: 'basic' as ResponseType,
    url: '',
    body: null,
    bodyUsed: false,
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
    formData: () => Promise.resolve(new FormData()),
  };

  return mockResponse as unknown as Response;
};

/**
 * Set up the mock API implementation by overriding the fetch implementation
 */
export const configureMockApi = (apiClient: {
  setFetchImplementation: (impl: typeof fetch) => void;
}) => {
  // Replace the fetch implementation with our mock
  apiClient.setFetchImplementation(
    async (url: URL | RequestInfo, init?: RequestInit): Promise<Response> => {
      try {
        // Parse the URL
        const urlString = url.toString();

        // Add a base URL if the URL is relative
        const urlObj = new URL(
          urlString.startsWith('http')
            ? urlString
            : `http://localhost${urlString.startsWith('/') ? '' : '/'}${urlString}`,
        );

        // Extract the path from the URL
        const path = urlObj.pathname;

        // Only intercept API requests
        if (!path.startsWith('/api/')) {
          // Pass through to real fetch for non-API requests
          return fetch(url, init);
        }

        // Get the API-specific path
        const apiPath = path.replace(/^\/api/, '');

        // Extract query parameters
        const params: Record<string, string> = {};
        urlObj.searchParams.forEach((value, key) => {
          params[key] = value;
        });

        // Get the request method
        const method = init?.method || 'GET';

        // Get the request body
        let data;
        if (init?.body) {
          if (typeof init.body === 'string') {
            try {
              data = JSON.parse(init.body);
            } catch (e) {
              data = init.body;
            }
          } else if (init.body instanceof FormData) {
            // Convert FormData to object
            data = {};
            init.body.forEach((value, key) => {
              (data as Record<string, string>)[key] = value.toString();
            });
          } else {
            data = init.body;
          }
        }

        // Make the mock API request
        const response = await handleMockApiRequest(method, apiPath, params, data);

        // Create a mock Response object
        return createMockResponse(response);
      } catch (error) {
        console.error('Mock API error:', error);

        // Create an error response
        return createMockResponse({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          status: 500,
        });
      }
    },
  );
};
