import { configureMockApi } from './mock';
import { ErrorResponse } from './types';

// Default configuration for the API client
const API_CONFIG = {
  baseUrl: '/api',
  defaultHeaders: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 30000, // 30 seconds
  useMock: process.env.NODE_ENV !== 'production',
};

export interface ApiClientConfig {
  baseUrl: string;
  defaultHeaders?: Record<string, string>;
  timeout?: number;
  useMock?: boolean;
}

/**
 * API client for making HTTP requests to the backend
 */
export class ApiClient {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;
  private timeout: number;
  private fetchImpl: typeof fetch;
  private useMock: boolean;

  constructor(config = API_CONFIG) {
    this.baseUrl = config.baseUrl;
    this.defaultHeaders = { ...config.defaultHeaders };
    this.timeout = config.timeout;
    this.useMock = config.useMock || false;
    this.fetchImpl = typeof window !== 'undefined' ? window.fetch.bind(window) : fetch;

    // Configure mock API if enabled
    if (this.useMock) {
      configureMockApi(this);
    }
  }

  /**
   * Set the fetch implementation to use for requests
   * This can be used to override the default fetch with a mock implementation
   * @param fetchImpl The fetch implementation to use
   */
  setFetchImplementation(fetchImpl: typeof fetch) {
    this.fetchImpl = fetchImpl;
  }

  /**
   * Set the authentication token for all requests
   * @param token The authentication token to use
   */
  setAuthToken(token: string) {
    this.defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  /**
   * Remove the authentication token from all requests
   */
  clearAuthToken() {
    delete this.defaultHeaders['Authorization'];
  }

  /**
   * Enable or disable mock API
   * @param useMock Whether to use the mock API
   */
  setUseMock(useMock: boolean) {
    if (useMock !== this.useMock) {
      this.useMock = useMock;

      if (useMock) {
        configureMockApi(this);
        console.info('Mock API enabled');
      } else {
        // Reset to default fetch implementation
        this.fetchImpl = typeof window !== 'undefined' ? window.fetch.bind(window) : fetch;
        console.info('Mock API disabled');
      }
    }
  }

  /**
   * Make a GET request to the API
   * @param endpoint The API endpoint to request
   * @param params Query parameters to include
   * @param headers Additional headers to include
   * @returns Promise that resolves with the response data
   */
  async get<T>(
    endpoint: string,
    params: Record<string, string | number | boolean | null | undefined> = {},
    headers: Record<string, string> = {},
  ): Promise<T> {
    // Construct the URL with query parameters
    const url = this.buildUrl(endpoint, params);

    // Make the request
    return this.request<T>('GET', url, null, headers);
  }

  /**
   * Make a POST request to the API
   * @param endpoint The API endpoint to request
   * @param data Request body data
   * @param headers Additional headers to include
   * @returns Promise that resolves with the response data
   */
  async post<T>(
    endpoint: string,
    data: unknown = null,
    headers: Record<string, string> = {},
  ): Promise<T> {
    const url = this.buildUrl(endpoint);
    return this.request<T>('POST', url, data, headers);
  }

  /**
   * Make a PUT request to the API
   * @param endpoint The API endpoint to request
   * @param data Request body data
   * @param headers Additional headers to include
   * @returns Promise that resolves with the response data
   */
  async put<T>(
    endpoint: string,
    data: unknown = null,
    headers: Record<string, string> = {},
  ): Promise<T> {
    const url = this.buildUrl(endpoint);
    return this.request<T>('PUT', url, data, headers);
  }

  /**
   * Make a PATCH request to the API
   * @param endpoint The API endpoint to request
   * @param data Request body data
   * @param headers Additional headers to include
   * @returns Promise that resolves with the response data
   */
  async patch<T>(
    endpoint: string,
    data: unknown = null,
    headers: Record<string, string> = {},
  ): Promise<T> {
    const url = this.buildUrl(endpoint);
    return this.request<T>('PATCH', url, data, headers);
  }

  /**
   * Make a DELETE request to the API
   * @param endpoint The API endpoint to request
   * @param data Request body data
   * @param headers Additional headers to include
   * @returns Promise that resolves with the response data
   */
  async delete<T>(
    endpoint: string,
    data: unknown = null,
    headers: Record<string, string> = {},
  ): Promise<T> {
    const url = this.buildUrl(endpoint);
    return this.request<T>('DELETE', url, data, headers);
  }

  /**
   * Make an HTTP request to the API
   * @param method The HTTP method to use
   * @param url The full URL to request
   * @param data Request body data
   * @param headers Additional headers to include
   * @returns Promise that resolves with the response data
   */
  private async request<T>(
    method: string,
    url: string,
    data: unknown = null,
    headers: Record<string, string> = {},
  ): Promise<T> {
    // Merge default headers with provided headers
    const requestHeaders = { ...this.defaultHeaders, ...headers };

    // Prepare the request options
    const options: RequestInit = {
      method,
      headers: requestHeaders,
      credentials: 'include',
    };

    // Add the request body if provided
    if (data !== null) {
      options.body = JSON.stringify(data);
    }

    // Create an AbortController for request timeout
    const controller = new AbortController();
    options.signal = controller.signal;

    // Set a timeout to abort the request if it takes too long
    const timeoutId = setTimeout(() => {
      return controller.abort();
    }, this.timeout);

    try {
      // Make the request
      const response = await this.fetchImpl(url, options);

      // Clear the timeout
      clearTimeout(timeoutId);

      // Parse the response data
      const responseData = await this.parseResponse<T>(response);

      // If the response is not OK (status >= 400), throw an error
      if (!response.ok) {
        throw new ApiError({
          status: response.status,
          statusText: response.statusText,
          data: responseData as unknown as ErrorResponse,
        });
      }

      return responseData;
    } catch (error) {
      // Clear the timeout
      clearTimeout(timeoutId);

      // Handle AbortError (timeout)
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new ApiError({
          status: 408,
          statusText: 'Request Timeout',
          data: { message: 'The request timed out' },
        });
      }

      // Re-throw API errors
      if (error instanceof ApiError) {
        throw error;
      }

      // Handle other errors
      throw new ApiError({
        status: 0,
        statusText: 'Network Error',
        data: { message: error instanceof Error ? error.message : String(error) },
      });
    }
  }

  /**
   * Build a full URL from an endpoint and query parameters
   * @param endpoint The API endpoint to request
   * @param params Query parameters to include
   * @returns The full URL with query parameters
   */
  private buildUrl(
    endpoint: string,
    params: Record<string, string | number | boolean | null | undefined> = {},
  ): string {
    // Add leading slash to the endpoint if not present
    if (!endpoint.startsWith('/')) {
      endpoint = `/${endpoint}`;
    }

    // Combine base URL and endpoint
    let url = `${this.baseUrl}${endpoint}`;

    // Add query parameters if provided
    const queryParams = new URLSearchParams();

    for (const [key, value] of Object.entries(params)) {
      if (value !== null && value !== undefined) {
        queryParams.append(key, String(value));
      }
    }

    const queryString = queryParams.toString();

    if (queryString) {
      url += `?${queryString}`;
    }

    return url;
  }

  /**
   * Parse the response data based on content type
   * @param response The fetch Response object
   * @returns The parsed response data
   */
  private async parseResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get('Content-Type') || '';

    if (contentType.includes('application/json')) {
      return await response.json();
    }

    if (contentType.includes('text/')) {
      return (await response.text()) as unknown as T;
    }

    if (contentType.includes('multipart/form-data')) {
      return (await response.formData()) as unknown as T;
    }

    return (await response.blob()) as unknown as T;
  }
}

/**
 * Error class for API errors
 */
export class ApiError extends Error {
  status: number;
  statusText: string;
  data: ErrorResponse;

  constructor({
    status,
    statusText,
    data,
  }: {
    status: number;
    statusText: string;
    data: ErrorResponse;
  }) {
    super(data.message || statusText);
    this.name = 'ApiError';
    this.status = status;
    this.statusText = statusText;
    this.data = data;
  }
}

// Create a singleton instance of the API client
export const api = new ApiClient();
