'use client';

import { Invoice } from '@/api/models';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { useApi } from './ApiContext';

interface InvoicesContextState {
  // State
  invoices: Invoice[];
  currentInvoice: Invoice | null;
  isLoading: boolean;
  error: Error | null;

  // Actions
  loadInvoices: (params?: Record<string, unknown>) => Promise<void>;
  loadInvoice: (id: string) => Promise<Invoice | null>;
  createInvoice: (invoice: Partial<Invoice>) => Promise<Invoice | null>;
  updateInvoice: (id: string, updates: Partial<Invoice>) => Promise<Invoice | null>;
  deleteInvoice: (id: string) => Promise<boolean>;
  markAsPaid: (id: string) => Promise<Invoice | null>;
  sendInvoice: (
    id: string,
    emailData: { to: string; subject?: string; message?: string },
  ) => Promise<boolean>;
  searchInvoices: (query: string) => Promise<void>;
  filterInvoicesByStatus: (status: string) => Promise<void>;
  filterInvoicesByDateRange: (startDate: string, endDate: string) => Promise<void>;
  clearFilters: () => Promise<void>;
}

const InvoicesContext = createContext<InvoicesContextState | undefined>(undefined);

interface InvoicesProviderProps {
  children: ReactNode;
}

export const InvoicesProvider: React.FC<InvoicesProviderProps> = ({ children }) => {
  const { services } = useApi();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [currentInvoice, setCurrentInvoice] = useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Load all invoices
  const loadInvoices = async (params: Record<string, unknown> = {}) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await services.invoices.getInvoices(params);
      if (response) {
        setInvoices(response.items);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load invoices'));
    } finally {
      setIsLoading(false);
    }
  };

  // Load a single invoice by ID
  const loadInvoice = async (id: string): Promise<Invoice | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const invoice = await services.invoices.getInvoiceById(id);
      setCurrentInvoice(invoice);
      return invoice;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load invoice'));
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Create a new invoice
  const createInvoice = async (invoice: Partial<Invoice>): Promise<Invoice | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const newInvoice = await services.invoices.createInvoice(
        invoice as Omit<Invoice, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>,
      );
      setInvoices((prev) => {return [...prev, newInvoice]});
      return newInvoice;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to create invoice'));
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Update an existing invoice
  const updateInvoice = async (id: string, updates: Partial<Invoice>): Promise<Invoice | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const updatedInvoice = await services.invoices.updateInvoice(id, updates);
      setInvoices((prev) => {return prev.map((invoice) => {return (invoice.id === id ? updatedInvoice : invoice)})});

      if (currentInvoice?.id === id) {
        setCurrentInvoice(updatedInvoice);
      }

      return updatedInvoice;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update invoice'));
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Delete an invoice
  const deleteInvoice = async (id: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await services.invoices.deleteInvoice(id);

      if (result.success) {
        setInvoices((prev) => {return prev.filter((invoice) => {return invoice.id !== id})});
        if (currentInvoice?.id === id) {
          setCurrentInvoice(null);
        }
        return true;
      }

      return false;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete invoice'));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Mark an invoice as paid
  const markAsPaid = async (id: string): Promise<Invoice | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const updatedInvoice = await services.invoices.markInvoiceAsPaid(
        id,
        new Date().toISOString(),
        'bank_transfer',
      );

      setInvoices((prev) => {return prev.map((invoice) => {return (invoice.id === id ? updatedInvoice : invoice)})});

      if (currentInvoice?.id === id) {
        setCurrentInvoice(updatedInvoice);
      }

      return updatedInvoice;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to mark invoice as paid'));
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Send an invoice via email
  const sendInvoice = async (
    id: string,
    emailData: { to: string; subject?: string; message?: string },
  ): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await services.invoices.sendInvoice(id, emailData.message);
      return result.success;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to send invoice'));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Search invoices
  const searchInvoices = async (query: string) => {
    await loadInvoices({ search: query });
  };

  // Filter invoices by status
  const filterInvoicesByStatus = async (status: string) => {
    await loadInvoices({ status });
  };

  // Filter invoices by date range
  const filterInvoicesByDateRange = async (startDate: string, endDate: string) => {
    await loadInvoices({ startDate, endDate });
  };

  // Clear all filters
  const clearFilters = async () => {
    await loadInvoices();
  };

  // Load initial data
  useEffect(() => {
    loadInvoices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Context value
  const value: InvoicesContextState = {
    invoices,
    currentInvoice,
    isLoading,
    error,
    loadInvoices,
    loadInvoice,
    createInvoice,
    updateInvoice,
    deleteInvoice,
    markAsPaid,
    sendInvoice,
    searchInvoices,
    filterInvoicesByStatus,
    filterInvoicesByDateRange,
    clearFilters,
  };

  return <InvoicesContext.Provider value={value}>{children}</InvoicesContext.Provider>;
};

// Custom hook to use the invoices context
export const useInvoices = (): InvoicesContextState => {
  const context = useContext(InvoicesContext);
  if (context === undefined) {
    throw new Error('useInvoices must be used within an InvoicesProvider');
  }
  return context;
};
