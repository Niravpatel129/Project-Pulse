/**
 * Generic API response type
 */
export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: string | null;
  status: number;
}

/**
 * Error response from the API
 */
export interface ErrorResponse {
  message: string;
  code?: string;
  details?: Record<string, unknown>;
}

/**
 * Pagination parameters for list requests
 */
export interface PaginationParams {
  page: number;
  limit: number;
}

/**
 * Paginated response from the API
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Sorting parameters for list requests
 */
export interface SortParams {
  field: string;
  order: 'asc' | 'desc';
}

/**
 * Filter parameters for list requests
 */
export interface FilterParams {
  [key: string]: string | number | boolean | string[] | undefined;
}

/**
 * Search parameters for list requests
 */
export interface SearchParams {
  query: string;
  fields?: string[];
}

/**
 * Common parameters for list requests
 */
export interface ListRequestParams {
  pagination?: PaginationParams;
  sort?: SortParams;
  filter?: FilterParams;
  search?: SearchParams;
}

/**
 * User role types
 */
export type UserRole = 'admin' | 'manager' | 'user' | 'client';

/**
 * User status
 */
export type UserStatus = 'active' | 'inactive' | 'pending';

/**
 * Base user model
 */
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
}

/**
 * Authentication response
 */
export interface AuthResponse {
  user: User;
  token: string;
}

/**
 * Login request payload
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Register request payload
 */
export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}
