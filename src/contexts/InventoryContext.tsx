'use client';

import { InventoryCategory, InventoryItem, ListRequestParams } from '@/api/models';
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { useApi } from './ApiContext';

interface InventoryContextState {
  // State
  items: InventoryItem[];
  categories: InventoryCategory[];
  currentItem: InventoryItem | null;
  currentCategory: InventoryCategory | null;
  isLoading: boolean;
  error: Error | null;

  // Actions
  loadItems: (params?: ListRequestParams) => Promise<void>;
  loadItemById: (id: string) => Promise<InventoryItem | null>;
  loadCategories: (params?: ListRequestParams) => Promise<void>;
  loadCategoryById: (id: string) => Promise<InventoryCategory | null>;
  createItem: (item: Partial<InventoryItem>) => Promise<InventoryItem | null>;
  updateItem: (id: string, updates: Partial<InventoryItem>) => Promise<InventoryItem | null>;
  deleteItem: (id: string) => Promise<boolean>;
  createCategory: (category: Partial<InventoryCategory>) => Promise<InventoryCategory | null>;
  updateCategory: (
    id: string,
    updates: Partial<InventoryCategory>,
  ) => Promise<InventoryCategory | null>;
  deleteCategory: (id: string) => Promise<boolean>;
  searchItems: (query: string) => Promise<void>;
  filterItemsByCategory: (categoryId: string) => Promise<void>;
}

const InventoryContext = createContext<InventoryContextState | undefined>(undefined);

interface InventoryProviderProps {
  children: ReactNode;
}

export const InventoryProvider: React.FC<InventoryProviderProps> = ({ children }) => {
  const { services } = useApi();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [categories, setCategories] = useState<InventoryCategory[]>([]);
  const [currentItem, setCurrentItem] = useState<InventoryItem | null>(null);
  const [currentCategory, setCurrentCategory] = useState<InventoryCategory | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Load all inventory items
  const loadItems = useCallback(
    async (params: ListRequestParams = {}) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await services.inventory.getInventoryItems(params);
        if (response) {
          setItems(response.items);
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load inventory items'));
      } finally {
        setIsLoading(false);
      }
    },
    [services.inventory],
  );

  // Load a single inventory item by ID
  const loadItemById = async (id: string): Promise<InventoryItem | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const item = await services.inventory.getInventoryItemById(id);
      setCurrentItem(item);
      return item;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load inventory item'));
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Load all inventory categories
  const loadCategories = useCallback(
    async (params: ListRequestParams = {}) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await services.inventory.getInventoryCategories(params);
        if (response) {
          setCategories(response.items);
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load inventory categories'));
      } finally {
        setIsLoading(false);
      }
    },
    [services.inventory],
  );

  // Load a single inventory category by ID
  const loadCategoryById = async (id: string): Promise<InventoryCategory | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const category = await services.inventory.getInventoryCategoryById(id);
      setCurrentCategory(category);
      return category;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load inventory category'));
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Create a new inventory item
  const createItem = async (item: Partial<InventoryItem>): Promise<InventoryItem | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const newItem = await services.inventory.createInventoryItem(
        item as Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>,
      );
      setItems((prev) => [...prev, newItem]);
      return newItem;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to create inventory item'));
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Update an existing inventory item
  const updateItem = async (
    id: string,
    updates: Partial<InventoryItem>,
  ): Promise<InventoryItem | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const updatedItem = await services.inventory.updateInventoryItem(id, updates);
      setItems((prev) => prev.map((item) => (item.id === id ? updatedItem : item)));

      if (currentItem?.id === id) {
        setCurrentItem(updatedItem);
      }

      return updatedItem;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update inventory item'));
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Delete an inventory item
  const deleteItem = async (id: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await services.inventory.deleteInventoryItem(id);

      if (result.success) {
        setItems((prev) => prev.filter((item) => item.id !== id));

        if (currentItem?.id === id) {
          setCurrentItem(null);
        }

        return true;
      }

      return false;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete inventory item'));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Create a new inventory category
  const createCategory = async (
    category: Partial<InventoryCategory>,
  ): Promise<InventoryCategory | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const newCategory = await services.inventory.createInventoryCategory(
        category as Omit<InventoryCategory, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>,
      );
      setCategories((prev) => [...prev, newCategory]);
      return newCategory;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to create inventory category'));
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Update an existing inventory category
  const updateCategory = async (
    id: string,
    updates: Partial<InventoryCategory>,
  ): Promise<InventoryCategory | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const updatedCategory = await services.inventory.updateInventoryCategory(id, updates);
      setCategories((prev) =>
        prev.map((category) => (category.id === id ? updatedCategory : category)),
      );

      if (currentCategory?.id === id) {
        setCurrentCategory(updatedCategory);
      }

      return updatedCategory;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update inventory category'));
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Delete an inventory category
  const deleteCategory = async (id: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await services.inventory.deleteInventoryCategory(id);

      if (result.success) {
        setCategories((prev) => prev.filter((category) => category.id !== id));

        if (currentCategory?.id === id) {
          setCurrentCategory(null);
        }

        return true;
      }

      return false;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete inventory category'));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Search inventory items
  const searchItems = async (query: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await services.inventory.getInventoryItems({ search: query });
      if (response) {
        setItems(response.items);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to search inventory items'));
    } finally {
      setIsLoading(false);
    }
  };

  // Filter items by category
  const filterItemsByCategory = async (categoryId: string) => {
    await loadItems({ categoryId });
  };

  // Load initial data
  useEffect(() => {
    loadItems();
    loadCategories();
  }, [loadItems, loadCategories]);

  // Context value
  const value: InventoryContextState = {
    items,
    categories,
    currentItem,
    currentCategory,
    isLoading,
    error,
    loadItems,
    loadItemById,
    loadCategories,
    loadCategoryById,
    createItem,
    updateItem,
    deleteItem,
    createCategory,
    updateCategory,
    deleteCategory,
    searchItems,
    filterItemsByCategory,
  };

  return <InventoryContext.Provider value={value}>{children}</InventoryContext.Provider>;
};

// Custom hook to use the inventory context
export const useInventory = (): InventoryContextState => {
  const context = useContext(InventoryContext);
  if (context === undefined) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
};
