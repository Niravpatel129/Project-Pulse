import { newRequest } from '@/utils/newRequest';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface UpdateInvoiceSettings {
  taxId?: string;
  showTaxId?: boolean;
  brandColor?: string;
  accentColor?: string;
  icon?: string;
  logo?: string;
}

export const useUpdateInvoiceSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      settings,
      showToast = true,
    }: {
      settings: UpdateInvoiceSettings;
      showToast?: boolean;
    }) => {
      const response = await newRequest.patch<{ data: { invoiceSettings: UpdateInvoiceSettings } }>(
        '/invoices/invoice-settings',
        { invoiceSettings: settings },
      );
      return { data: response.data.data.invoiceSettings, showToast };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['invoiceSettings'] });
      if (result.showToast) {
        toast.success('Invoice settings updated successfully');
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update invoice settings');
    },
  });
};
