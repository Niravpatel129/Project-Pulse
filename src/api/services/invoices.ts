import { api } from '../client';
import { Invoice } from '../models';
import { ListRequestParams, PaginatedResponse } from '../types';

/**
 * Service for invoice-related API calls
 */
export const invoices = {
  /**
   * Get all invoices with pagination
   * @param params Query parameters for pagination, sorting, and filtering
   */
  getInvoices: async (params?: ListRequestParams): Promise<PaginatedResponse<Invoice>> => {
    return api.get(
      '/invoices',
      params as Record<string, string | number | boolean | null | undefined>,
    );
  },

  /**
   * Get a single invoice by ID
   * @param id Invoice ID
   */
  getInvoiceById: async (id: string): Promise<Invoice> => {
    return api.get(`/invoices/${id}`);
  },

  /**
   * Create a new invoice
   * @param data Invoice data to create
   */
  createInvoice: async (
    data: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>,
  ): Promise<Invoice> => {
    return api.post('/invoices', data);
  },

  /**
   * Update an existing invoice
   * @param id Invoice ID
   * @param data Invoice data to update
   */
  updateInvoice: async (id: string, data: Partial<Invoice>): Promise<Invoice> => {
    return api.put(`/invoices/${id}`, data);
  },

  /**
   * Delete an invoice
   * @param id Invoice ID
   */
  deleteInvoice: async (id: string): Promise<{ success: boolean }> => {
    return api.delete(`/invoices/${id}`);
  },

  /**
   * Send an invoice via email
   * @param id Invoice ID
   * @param message Optional message to include in the email
   * @param cc Optional CC email addresses
   */
  sendInvoice: async (
    id: string,
    message?: string,
    cc?: string[],
  ): Promise<{ success: boolean; message: string }> => {
    return api.post(`/invoices/${id}/send`, { message, cc });
  },

  /**
   * Mark an invoice as paid
   * @param id Invoice ID
   * @param paymentDate Date of payment
   * @param paymentMethod Method of payment
   */
  markInvoiceAsPaid: async (
    id: string,
    paymentDate: string,
    paymentMethod: string,
  ): Promise<Invoice> => {
    return api.post(`/invoices/${id}/paid`, { paymentDate, paymentMethod });
  },

  /**
   * Generate a PDF for an invoice
   * @param id Invoice ID
   */
  generateInvoicePdf: async (id: string): Promise<{ success: boolean; pdfUrl: string }> => {
    return api.get(`/invoices/${id}/pdf`);
  },
};
