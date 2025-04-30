import { useState } from 'react';
import { newRequest } from '../utils/newRequest';

export type InvoiceItem = {
  id: string;
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
};

export type Client = {
  id: string;
  name: string;
  email: string;
  // Add other client properties as needed
};

export type InvoiceData = {
  invoiceNumber: string;
  dueDate: Date;
  items: InvoiceItem[];
  client?: Client;
  total: number;
  subtotal: number;
  projectId: string;
};

interface UseInvoiceWizardProps {
  projectId: string;
  clients?: Client[];
}

export const useInvoiceWizard = ({ projectId, clients = [] }: UseInvoiceWizardProps) => {
  const [selectedItems, setSelectedItems] = useState<InvoiceItem[]>([]);
  const [invoiceNumber, setInvoiceNumber] = useState(
    `INV-${Math.floor(100000 + Math.random() * 900000)}`,
  );
  const [dueDate, setDueDate] = useState(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)); // 30 days from now
  const [aiSuggestions, setAiSuggestions] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | undefined>(undefined);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sample items - in a real implementation, this would come from an API
  const sampleItems: InvoiceItem[] = [
    {
      id: '1',
      name: 'Custom T-Shirt Design',
      description: "Original artwork for client's band merchandise",
      price: 250.0,
      date: 'Jun 15, 2023',
      status: 'completed',
      type: 'physical',
      sku: 'TSHIRT-CUSTOM-001',
      weight: '0.25 kg',
      stock: 50,
      tax: 'Standard',
    },
    {
      id: '2',
      name: 'Brand Identity Package',
      description: 'Logo, color palette, and brand guidelines',
      price: 1800.0,
      date: 'Jul 2, 2023',
      status: 'completed',
      type: 'digital',
    },
    {
      id: '3',
      name: 'Marketing Materials',
      description: 'Digital assets for social media campaign',
      price: 950.0,
      date: 'Jul 20, 2023',
      status: 'in-progress',
      type: 'digital',
      isAiPriced: true,
    },
    {
      id: '4',
      name: 'SEO Optimization',
      description: 'Keyword research and on-page optimization',
      price: 750.0,
      date: 'Aug 5, 2023',
      status: 'pending',
      type: 'digital',
      isAiPriced: true,
    },
  ];

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
      return sum + item.price;
    }, 0);
  };

  const calculateTotal = () => {
    // For now, just return the subtotal
    // In a real implementation, this would include taxes, discounts, etc.
    return calculateSubtotal();
  };

  const generateInvoice = async (): Promise<InvoiceData | null> => {
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
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    selectedItems,
    invoiceNumber,
    dueDate,
    aiSuggestions,
    selectedClient,
    isGenerating,
    error,
    sampleItems,
    setSelectedItems,
    setInvoiceNumber,
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
