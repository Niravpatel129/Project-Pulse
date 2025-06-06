import { useProject } from '@/contexts/ProjectContext';
import { useCallback, useEffect, useState } from 'react';
import { newRequest } from '../utils/newRequest';

export type InvoiceItem = {
  id: string;
  _id?: string;
  name: string;
  description: string;
  price: number;
  date: string;
  status: 'completed' | 'in-progress' | 'pending';
  type: 'physical' | 'digital';
  sku?: string;
  weight?: string;
  stock?: number;
  tax?: string;
  isAiPriced?: boolean;
  labels?: string[];
  quantity?: number;
  isApiData?: boolean;
  // Dynamic fields from deliverables
  fields?: Record<string, any>;
  // Additional metadata
  createdAt?: string;
  attachments?: Array<{
    type?: string;
    url: string;
    title: string;
  }>;
};

export type Client = {
  id: string;
  name: string;
  email: string;
  // Add other client properties as needed
};

export type InvoiceData = {
  dueDate: Date;
  items: InvoiceItem[];
  client?: Client;
  total: number;
  subtotal: number;
  projectId: string;
};

export const useInvoiceWizard = () => {
  const { project } = useProject();
  const projectId = project?._id;
  const [selectedItems, setSelectedItems] = useState<any[]>([]);

  const [dueDate, setDueDate] = useState(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)); // 30 days from now
  const [aiSuggestions, setAiSuggestions] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | undefined>(undefined);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddItem = (item: InvoiceItem) => {
    setSelectedItems([...selectedItems, item]);
  };

  const handleRemoveItem = (itemId: string) => {
    setSelectedItems(
      selectedItems.filter((item) => {
        return item.id !== itemId;
      }),
    );
  };

  const calculateSubtotal = () => {
    return selectedItems.reduce((sum, item) => {
      const quantity = item.quantity || 1;
      return sum + item.price * quantity;
    }, 0);
  };

  const calculateTotal = () => {
    // For now, just return the subtotal
    // In a real implementation, this would include taxes, discounts, etc.
    return calculateSubtotal();
  };

  const fetchInvoiceDetails = useCallback(async (): Promise<InvoiceData | null> => {
    console.log('🚀 running');
    try {
      const response = await newRequest.get(`/project-invoices/generate/${projectId}`);
      console.log('🚀 response:', response);

      if (response.data.success && response.data.data) {
        const { deliverables, projectTasks } = response.data.data;

        // Convert deliverables to invoice items
        const deliverableItems: InvoiceItem[] = deliverables.map((deliverable: any) => {
          return {
            id: deliverable._id,
            _id: deliverable._id,
            itemType: 'deliverable',
            name: deliverable.name,
            description: deliverable.description,
            price:
              deliverable.fields?.unitPrice ||
              deliverable.fields?.total / (deliverable.fields?.quantity || 1) ||
              0,
            date: new Date(deliverable.createdAt).toLocaleDateString(),
            type: deliverable.labels?.some((label: string) => {
              return ['apparel', 'physical', 'print', 'promotional'].includes(label.toLowerCase());
            })
              ? 'physical'
              : 'digital',
            labels: deliverable.labels,
            quantity: deliverable.fields?.quantity || 1,
            isApiData: true,
            // Save the original fields for reference and rendering
            fields: deliverable.fields,
            createdAt: deliverable.createdAt,
            attachments: deliverable.attachments,
          };
        });

        // Convert project tasks to invoice items
        const taskItems: InvoiceItem[] = projectTasks.map((task: any, index: number) => {
          return {
            _id: task._id,
            itemType: 'task',
            name: task.name,
            description: task.description,
            price: task.total || 0,
            date: new Date().toLocaleDateString(),
            type: 'digital',
            labels: task.labels,
            quantity: task.quantity || 1,
            isApiData: true,
          };
        });

        // Combine all items
        const allItems = [...deliverableItems, ...taskItems];

        // Calculate totals
        const subtotal = allItems.reduce((sum, item) => {
          return sum + item.price;
        }, 0);

        return {
          dueDate,
          items: allItems,
          total: subtotal,
          subtotal,
          projectId: projectId || '',
        };
      }

      return response.data;
    } catch (err) {
      console.log('🚀 err:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      return null;
    }
  }, [projectId, dueDate]);

  const generateInvoice = async (): Promise<InvoiceData | null> => {
    if (!projectId) return null;
    if (selectedItems.length === 0) {
      setError('Please add at least one item to the invoice');
      return null;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await newRequest.post(`/invoices/generate/${projectId}`);
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    const handleFetchInvoiceDetails = async () => {
      const invoiceDetails = await fetchInvoiceDetails();

      if (invoiceDetails?.items?.length) {
        setSelectedItems(invoiceDetails.items);
      }
    };

    if (projectId) {
      handleFetchInvoiceDetails();
    }
  }, [projectId, fetchInvoiceDetails]);

  return {
    selectedItems,
    dueDate,
    aiSuggestions,
    selectedClient,
    isGenerating,
    error,
    setSelectedItems,
    setDueDate,
    setAiSuggestions,
    setSelectedClient,
    handleAddItem,
    handleRemoveItem,
    calculateSubtotal,
    calculateTotal,
    generateInvoice,
  };
};
