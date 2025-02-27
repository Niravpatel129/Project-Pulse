import { useCallback, useState } from 'react';
import { api } from '../api/client';
import { inventory } from '../api/services/inventory';
import { invoices } from '../api/services/invoices';
import { projectFiles } from '../api/services/projectFiles';
import { templates } from '../api/services/templates';

// Type defining inventory usage report structure
interface InventoryUsageReport {
  item: {
    id: string;
    name: string;
    sku: string;
    stock: number;
    [key: string]: unknown;
  };
  usageCount: number;
  projectCount: number;
  projects: string[];
}

/**
 * Hook for API data fetching with loading and error states
 */
export function useApi() {
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, Error | null>>({});

  /**
   * Wraps an API call with loading and error handling
   * @param key Unique identifier for this API call
   * @param apiCall Function that makes the API call
   * @returns Function that executes the API call with loading and error handling
   */
  const withLoadingAndErrors = useCallback(
    <T, Args extends unknown[]>(key: string, apiCall: (...args: Args) => Promise<T>) => {
      return async (...args: Args): Promise<T | null> => {
        setLoading((prev) => ({ ...prev, [key]: true }));
        setErrors((prev) => ({ ...prev, [key]: null }));

        try {
          const result = await apiCall(...args);
          return result;
        } catch (error) {
          setErrors((prev) => ({
            ...prev,
            [key]: error instanceof Error ? error : new Error(String(error)),
          }));
          return null;
        } finally {
          setLoading((prev) => ({ ...prev, [key]: false }));
        }
      };
    },
    [],
  );

  // Create wrapped versions of all services
  const wrappedServices = {
    templates: {
      getAll: withLoadingAndErrors('templates.getAll', templates.getAll),
      getById: withLoadingAndErrors('templates.getById', templates.getById),
      create: withLoadingAndErrors('templates.create', templates.create),
      update: withLoadingAndErrors('templates.update', templates.update),
      delete: withLoadingAndErrors('templates.delete', templates.delete),
    },
    inventory: {
      getItems: withLoadingAndErrors('inventory.getItems', inventory.getInventoryItems),
      getItemsByCategory: withLoadingAndErrors(
        'inventory.getItemsByCategory',
        inventory.getInventoryItemsByCategory,
      ),
      getItemById: withLoadingAndErrors('inventory.getItemById', inventory.getInventoryItemById),
      createItem: withLoadingAndErrors('inventory.createItem', inventory.createInventoryItem),
      updateItem: withLoadingAndErrors('inventory.updateItem', inventory.updateInventoryItem),
      deleteItem: withLoadingAndErrors('inventory.deleteItem', inventory.deleteInventoryItem),
      updateStock: withLoadingAndErrors('inventory.updateStock', inventory.updateInventoryStock),
      trackUsage: withLoadingAndErrors('inventory.trackUsage', inventory.trackInventoryUsage),
      getUsageReports: withLoadingAndErrors<InventoryUsageReport[], []>(
        'inventory.getUsageReports',
        inventory.getInventoryUsageReports,
      ),
      getCategories: withLoadingAndErrors(
        'inventory.getCategories',
        inventory.getInventoryCategories,
      ),
      getCategoryById: withLoadingAndErrors(
        'inventory.getCategoryById',
        inventory.getInventoryCategoryById,
      ),
      createCategory: withLoadingAndErrors(
        'inventory.createCategory',
        inventory.createInventoryCategory,
      ),
      updateCategory: withLoadingAndErrors(
        'inventory.updateCategory',
        inventory.updateInventoryCategory,
      ),
      deleteCategory: withLoadingAndErrors(
        'inventory.deleteCategory',
        inventory.deleteInventoryCategory,
      ),
    },
    invoices: {
      getAll: withLoadingAndErrors('invoices.getAll', invoices.getInvoices),
      getById: withLoadingAndErrors('invoices.getById', invoices.getInvoiceById),
      create: withLoadingAndErrors('invoices.create', invoices.createInvoice),
      update: withLoadingAndErrors('invoices.update', invoices.updateInvoice),
      delete: withLoadingAndErrors('invoices.delete', invoices.deleteInvoice),
      send: withLoadingAndErrors('invoices.send', invoices.sendInvoice),
      markAsPaid: withLoadingAndErrors('invoices.markAsPaid', invoices.markInvoiceAsPaid),
      generatePdf: withLoadingAndErrors('invoices.generatePdf', invoices.generateInvoicePdf),
    },
    projectFiles: {
      getAll: withLoadingAndErrors('projectFiles.getAll', projectFiles.getAll),
      getById: withLoadingAndErrors('projectFiles.getById', projectFiles.getById),
      create: withLoadingAndErrors('projectFiles.create', projectFiles.create),
      update: withLoadingAndErrors('projectFiles.update', projectFiles.update),
      delete: withLoadingAndErrors('projectFiles.delete', projectFiles.delete),
      updateStatus: withLoadingAndErrors('projectFiles.updateStatus', projectFiles.updateStatus),
      addComment: withLoadingAndErrors('projectFiles.addComment', projectFiles.addComment),
      addAttachment: withLoadingAndErrors('projectFiles.addAttachment', projectFiles.addAttachment),
      uploadVersion: withLoadingAndErrors('projectFiles.uploadVersion', projectFiles.uploadVersion),
      sendEmail: withLoadingAndErrors('projectFiles.sendEmail', projectFiles.sendEmail),
      addTemplateItem: withLoadingAndErrors(
        'projectFiles.addTemplateItem',
        projectFiles.addTemplateItem,
      ),
      updateTemplateItem: withLoadingAndErrors(
        'projectFiles.updateTemplateItem',
        projectFiles.updateTemplateItem,
      ),
      deleteTemplateItem: withLoadingAndErrors(
        'projectFiles.deleteTemplateItem',
        projectFiles.deleteTemplateItem,
      ),
      restoreTemplateItemVersion: withLoadingAndErrors(
        'projectFiles.restoreTemplateItemVersion',
        projectFiles.restoreTemplateItemVersion,
      ),
      getTemplateItemVersions: withLoadingAndErrors(
        'projectFiles.getTemplateItemVersions',
        projectFiles.getTemplateItemVersions,
      ),
      createTemplateFromProjectFile: withLoadingAndErrors(
        'projectFiles.createTemplateFromProjectFile',
        projectFiles.createTemplateFromProjectFile,
      ),
    },
  };

  // Helper to check if any API calls are currently loading
  const isLoading = useCallback(
    (keys?: string | string[]) => {
      if (!keys) {
        // Check if any API call is loading
        return Object.values(loading).some(Boolean);
      }

      if (typeof keys === 'string') {
        // Check if a specific API call is loading
        return !!loading[keys];
      }

      // Check if any of the specified API calls are loading
      return keys.some((key) => !!loading[key]);
    },
    [loading],
  );

  // Helper to get error for a specific API call
  const getError = useCallback((key: string) => errors[key] || null, [errors]);

  // Helper to clear errors
  const clearErrors = useCallback((keys?: string | string[]) => {
    if (!keys) {
      // Clear all errors
      setErrors({});
      return;
    }

    if (typeof keys === 'string') {
      // Clear a specific error
      setErrors((prev) => {
         
        const { [keys]: omitted, ...rest } = prev;
        return rest;
      });
      return;
    }

    // Clear specified errors
    setErrors((prev) => {
      const result = { ...prev };
      keys.forEach((key) => {
        delete result[key];
      });
      return result;
    });
  }, []);

  return {
    services: wrappedServices,
    api,
    isLoading,
    getError,
    clearErrors,
    errors,
  };
}
