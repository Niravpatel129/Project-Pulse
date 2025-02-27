import { InventoryCategory, InventoryItem, PaginatedResponse } from '../models';
import { mockInventoryCategories, mockInventoryItems } from './data/inventory';

/**
 * Handle inventory items API requests in the mock API
 * @param method HTTP method (GET, POST, PUT, DELETE)
 * @param url Request URL
 * @param params URL parameters
 * @param data Request body
 * @returns Mock API response
 */
export const handleInventoryItemsRequest = (
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
        // Handle different GET endpoints

        // Get by category
        if (url.includes('/category/')) {
          const categoryId = url.split('/category/').pop() as string;
          const filteredItems = mockInventoryItems.filter((item) => item.category === categoryId);

          // Apply pagination and other filters
          const { page = '1', limit = '10', sort = 'name', order = 'asc' } = params;
          const pageNum = parseInt(page, 10);
          const limitNum = parseInt(limit, 10);

          // Sort items
          filteredItems.sort((a, b) => {
            let aValue = a[sort as keyof InventoryItem];
            let bValue = b[sort as keyof InventoryItem];

            if (typeof aValue === 'string' && typeof bValue === 'string') {
              aValue = aValue.toLowerCase();
              bValue = bValue.toLowerCase();
            }

            return order === 'asc' ? (aValue < bValue ? -1 : 1) : aValue > bValue ? -1 : 1;
          });

          // Paginate
          const startIndex = (pageNum - 1) * limitNum;
          const endIndex = startIndex + limitNum;
          const paginatedItems = filteredItems.slice(startIndex, endIndex);

          const response: PaginatedResponse<InventoryItem> = {
            items: paginatedItems,
            pagination: {
              total: filteredItems.length,
              page: pageNum,
              limit: limitNum,
              totalPages: Math.ceil(filteredItems.length / limitNum),
            },
          };

          resolve(response);
          return;
        }

        // Get by ID
        if (url.includes('/') && !url.includes('/category/')) {
          const itemId = url.split('/').pop() as string;
          const item = mockInventoryItems.find((item) => item.id === itemId);

          if (item) {
            resolve(item);
          } else {
            resolve({
              error: 'Inventory item not found',
              status: 404,
            });
          }

          return;
        }

        // Get all with pagination
        const {
          page = '1',
          limit = '10',
          search = '',
          sort = 'name',
          order = 'asc',
          category = '',
        } = params;

        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);

        // Filter items
        let filteredItems = [...mockInventoryItems];

        if (search) {
          const searchLower = search.toLowerCase();
          filteredItems = filteredItems.filter(
            (item) =>
              item.name.toLowerCase().includes(searchLower) ||
              item.description.toLowerCase().includes(searchLower) ||
              item.sku.toLowerCase().includes(searchLower),
          );
        }

        if (category) {
          filteredItems = filteredItems.filter((item) => item.category === category);
        }

        // Sort items
        filteredItems.sort((a, b) => {
          let aValue = a[sort as keyof InventoryItem];
          let bValue = b[sort as keyof InventoryItem];

          if (typeof aValue === 'string' && typeof bValue === 'string') {
            aValue = aValue.toLowerCase();
            bValue = bValue.toLowerCase();
          }

          return order === 'asc' ? (aValue < bValue ? -1 : 1) : aValue > bValue ? -1 : 1;
        });

        // Paginate
        const startIndex = (pageNum - 1) * limitNum;
        const endIndex = startIndex + limitNum;
        const paginatedItems = filteredItems.slice(startIndex, endIndex);

        const response: PaginatedResponse<InventoryItem> = {
          items: paginatedItems,
          pagination: {
            total: filteredItems.length,
            page: pageNum,
            limit: limitNum,
            totalPages: Math.ceil(filteredItems.length / limitNum),
          },
        };

        resolve(response);
        return;
      }

      // POST request - Create a new inventory item
      if (method === 'POST') {
        const newItem: InventoryItem = {
          ...(data as Partial<InventoryItem>),
          id: `inventory-${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } as InventoryItem;

        // In a real implementation, we would add this to the database
        resolve(newItem);
        return;
      }

      // PUT request - Update an inventory item
      if (method === 'PUT') {
        const itemId = url.split('/').pop() as string;
        const itemIndex = mockInventoryItems.findIndex((item) => item.id === itemId);

        if (itemIndex !== -1) {
          // In a real implementation, we would update the database
          const updatedItem: InventoryItem = {
            ...mockInventoryItems[itemIndex],
            ...(data as Partial<InventoryItem>),
            id: itemId, // Ensure ID doesn't change
            updatedAt: new Date().toISOString(),
          } as InventoryItem;

          resolve(updatedItem);
        } else {
          resolve({
            error: 'Inventory item not found',
            status: 404,
          });
        }

        return;
      }

      // DELETE request - Delete an inventory item
      if (method === 'DELETE') {
        const itemId = url.split('/').pop() as string;
        const itemIndex = mockInventoryItems.findIndex((item) => item.id === itemId);

        if (itemIndex !== -1) {
          // In a real implementation, we would delete from the database
          resolve({
            success: true,
            message: 'Inventory item deleted successfully',
          });
        } else {
          resolve({
            error: 'Inventory item not found',
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

/**
 * Handle inventory categories API requests in the mock API
 * @param method HTTP method (GET, POST, PUT, DELETE)
 * @param url Request URL
 * @param params URL parameters
 * @param data Request body
 * @returns Mock API response
 */
export const handleInventoryCategoriesRequest = (
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
        // Get by ID
        if (url.includes('/')) {
          const categoryId = url.split('/').pop() as string;
          const category = mockInventoryCategories.find((cat) => cat.id === categoryId);

          if (category) {
            resolve(category);
          } else {
            resolve({
              error: 'Category not found',
              status: 404,
            });
          }

          return;
        }

        // Get all with pagination
        const { page = '1', limit = '10', search = '', sort = 'name', order = 'asc' } = params;

        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);

        // Filter categories
        let filteredCategories = [...mockInventoryCategories];

        if (search) {
          const searchLower = search.toLowerCase();
          filteredCategories = filteredCategories.filter(
            (category) =>
              category.name.toLowerCase().includes(searchLower) ||
              (category.description && category.description.toLowerCase().includes(searchLower)),
          );
        }

        // Sort categories
        filteredCategories.sort((a, b) => {
          let aValue = a[sort as keyof InventoryCategory];
          let bValue = b[sort as keyof InventoryCategory];

          if (typeof aValue === 'string' && typeof bValue === 'string') {
            aValue = aValue.toLowerCase();
            bValue = bValue.toLowerCase();
          }

          return order === 'asc' ? (aValue < bValue ? -1 : 1) : aValue > bValue ? -1 : 1;
        });

        // Paginate
        const startIndex = (pageNum - 1) * limitNum;
        const endIndex = startIndex + limitNum;
        const paginatedCategories = filteredCategories.slice(startIndex, endIndex);

        const response: PaginatedResponse<InventoryCategory> = {
          items: paginatedCategories,
          pagination: {
            total: filteredCategories.length,
            page: pageNum,
            limit: limitNum,
            totalPages: Math.ceil(filteredCategories.length / limitNum),
          },
        };

        resolve(response);
        return;
      }

      // POST request - Create a new category
      if (method === 'POST') {
        const newCategory: InventoryCategory = {
          ...(data as Partial<InventoryCategory>),
          id: `category-${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } as InventoryCategory;

        // In a real implementation, we would add this to the database
        resolve(newCategory);
        return;
      }

      // PUT request - Update a category
      if (method === 'PUT') {
        const categoryId = url.split('/').pop() as string;
        const categoryIndex = mockInventoryCategories.findIndex((cat) => cat.id === categoryId);

        if (categoryIndex !== -1) {
          // In a real implementation, we would update the database
          const updatedCategory: InventoryCategory = {
            ...mockInventoryCategories[categoryIndex],
            ...(data as Partial<InventoryCategory>),
            id: categoryId, // Ensure ID doesn't change
            updatedAt: new Date().toISOString(),
          } as InventoryCategory;

          resolve(updatedCategory);
        } else {
          resolve({
            error: 'Category not found',
            status: 404,
          });
        }

        return;
      }

      // DELETE request - Delete a category
      if (method === 'DELETE') {
        const categoryId = url.split('/').pop() as string;
        const categoryIndex = mockInventoryCategories.findIndex((cat) => cat.id === categoryId);

        if (categoryIndex !== -1) {
          // In a real implementation, we would delete from the database
          resolve({
            success: true,
            message: 'Category deleted successfully',
          });
        } else {
          resolve({
            error: 'Category not found',
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
