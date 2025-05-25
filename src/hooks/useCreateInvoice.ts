import { newRequest } from '@/utils/newRequest';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface InvoiceItem {
  description: string;
  quantity: number;
  price: number;
  total: number;
}

interface CreateInvoiceData {
  customer: {
    id: string;
    name: string;
    email: string;
  };
  from: string;
  to: string;
  issueDate: Date;
  dueDate: Date;
  items: InvoiceItem[];
  totals: {
    subtotal: number;
    taxAmount: number;
    vatAmount: number;
    discount: number;
    total: number;
  };
  settings: {
    currency: string;
    dateFormat: string;
    salesTax: {
      enabled: boolean;
      rate: number;
    };
    vat: {
      enabled: boolean;
      rate: number;
    };
    discount: {
      enabled: boolean;
      amount: number;
    };
    decimals: 'yes' | 'no';
  };
  notes?: string;
  logo?: string;
}

export const useCreateInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateInvoiceData) => {
      const response = await newRequest.post('/invoices2/', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
};
