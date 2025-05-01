import { newRequest } from '@/utils/newRequest';
import { useQuery } from '@tanstack/react-query';

interface InvoiceSettings {
  taxId?: string;
  showTaxId?: boolean;
  brandColor?: string;
  accentColor?: string;
  icon?: string;
  logo?: string;
  taxes?: Array<{
    id: string;
    name: string;
    rate: number;
  }>;
  shippingMethods?: Array<{
    id: string;
    name: string;
    carrier: string;
    price: number;
    estimatedDays: string;
  }>;
  currency?: string;
}

interface ApiResponse {
  status: string;
  data: {
    invoiceSettings: InvoiceSettings;
  };
}

export const useInvoiceSettings = () => {
  return useQuery({
    queryKey: ['invoiceSettings'],
    queryFn: async () => {
      try {
        const response = await newRequest.get<ApiResponse>('/invoices/invoice-settings');
        if (response.data.status === 'success') {
          return response.data.data.invoiceSettings;
        }
        throw new Error('Failed to fetch invoice settings');
      } catch (error) {
        // For new accounts, return default values
        return {
          taxId: '',
          showTaxId: false,
          icon: '',
          logo: '',
          taxes: [],
          shippingMethods: [],
        };
      }
    },
  });
};
