import { api } from '../client';
import { InventoryCategory, InventoryItem, ListRequestParams, PaginatedResponse } from '../models';

/**
 * Service for inventory-related API calls
 */
export const inventory = {
  /**
   * Get all inventory items with pagination
   * @param params Query parameters for pagination, sorting, and filtering
   */
  getInventoryItems: async (
    params?: ListRequestParams,
  ): Promise<PaginatedResponse<InventoryItem>> => {
    return api.get(
      '/inventory/items',
      params as Record<string, string | number | boolean | null | undefined>,
    );
  },

  /**
   * Get inventory items filtered by category
   * @param categoryId Category ID to filter by
   * @param params Additional query parameters for pagination, sorting, and filtering
   */
  getInventoryItemsByCategory: async (
    categoryId: string,
    params?: ListRequestParams,
  ): Promise<PaginatedResponse<InventoryItem>> => {
    return api.get('/inventory/items', {
      ...(params as Record<string, string | number | boolean | null | undefined>),
      category: categoryId,
    });
  },

  /**
   * Get a single inventory item by ID
   * @param id Inventory item ID
   */
  getInventoryItemById: async (id: string): Promise<InventoryItem> => {
    return api.get(`/inventory/items/${id}`);
  },

  /**
   * Create a new inventory item
   * @param data Inventory item data to create
   */
  createInventoryItem: async (
    data: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>,
  ): Promise<InventoryItem> => {
    return api.post('/inventory/items', data);
  },

  /**
   * Update an existing inventory item
   * @param id Inventory item ID
   * @param data Inventory item data to update
   */
  updateInventoryItem: async (id: string, data: Partial<InventoryItem>): Promise<InventoryItem> => {
    return api.put(`/inventory/items/${id}`, data);
  },

  /**
   * Delete an inventory item
   * @param id Inventory item ID
   */
  deleteInventoryItem: async (id: string): Promise<{ success: boolean }> => {
    return api.delete(`/inventory/items/${id}`);
  },

  /**
   * Update the stock quantity of an inventory item
   * @param id Inventory item ID
   * @param quantity New stock quantity (can be negative to decrease stock)
   */
  updateInventoryStock: async (id: string, quantity: number): Promise<InventoryItem> => {
    return api.patch(`/inventory/items/${id}/stock`, { quantity });
  },

  /**
   * Track usage of an inventory item in a project
   * @param itemId Inventory item ID
   * @param templateItemId Template item ID
   * @param projectId Project ID
   */
  trackInventoryUsage: async (
    itemId: string,
    templateItemId: string,
    projectId?: string,
  ): Promise<{ success: boolean }> => {
    return api.post('/inventory/usage', {
      itemId,
      templateItemId,
      projectId,
    });
  },

  /**
   * Get reports on inventory usage
   * @param params Query parameters for pagination, sorting, and filtering
   */
  getInventoryUsageReports: async (params?: ListRequestParams): Promise<any> => {
    return api.get(
      '/inventory/usage/reports',
      params as Record<string, string | number | boolean | null | undefined>,
    );
  },

  /**
   * Get all inventory categories with pagination
   * @param params Query parameters for pagination, sorting, and filtering
   */
  getInventoryCategories: async (
    params?: ListRequestParams,
  ): Promise<PaginatedResponse<InventoryCategory>> => {
    return api.get(
      '/inventory/categories',
      params as Record<string, string | number | boolean | null | undefined>,
    );
  },

  /**
   * Get a single inventory category by ID
   * @param id Inventory category ID
   */
  getInventoryCategoryById: async (id: string): Promise<InventoryCategory> => {
    return api.get(`/inventory/categories/${id}`);
  },

  /**
   * Create a new inventory category
   * @param data Inventory category data to create
   */
  createInventoryCategory: async (
    data: Omit<InventoryCategory, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>,
  ): Promise<InventoryCategory> => {
    return api.post('/inventory/categories', data);
  },

  /**
   * Update an existing inventory category
   * @param id Inventory category ID
   * @param data Inventory category data to update
   */
  updateInventoryCategory: async (
    id: string,
    data: Partial<InventoryCategory>,
  ): Promise<InventoryCategory> => {
    return api.put(`/inventory/categories/${id}`, data);
  },

  /**
   * Delete an inventory category
   * @param id Inventory category ID
   */
  deleteInventoryCategory: async (id: string): Promise<{ success: boolean }> => {
    return api.delete(`/inventory/categories/${id}`);
  },
};
