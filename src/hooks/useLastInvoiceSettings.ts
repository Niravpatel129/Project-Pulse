import { newRequest } from '@/utils/newRequest';
import { useQuery } from '@tanstack/react-query';

interface LastInvoiceSettings {
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
  notes: string;
  logo: string;
  from: string;
  newInvoiceNumber: string;
}

interface LastInvoiceSettingsResponse {
  status: string;
  data: {
    invoiceSettings: LastInvoiceSettings;
  };
}

export function useLastInvoiceSettings() {
  const {
    data: settingsResponse,
    isLoading,
    error,
  } = useQuery<LastInvoiceSettingsResponse>({
    queryKey: ['lastInvoiceSettings'],
    queryFn: async () => {
      try {
        const response = await newRequest.get('/invoices2/settings/last');
        console.log('🚀 Raw API response:', response);
        return response.data;
      } catch (err) {
        console.error('Failed to fetch last invoice settings:', err);
        throw err;
      }
    },
  });

  console.log('🚀 Transformed settings:', settingsResponse?.data?.invoiceSettings);

  const settings = settingsResponse?.data?.invoiceSettings;

  return {
    settings,
    isLoading,
    error,
  };
}
