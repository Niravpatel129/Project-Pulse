import { newRequest } from '@/utils/newRequest';
import { useQuery } from '@tanstack/react-query';

interface PaymentMethodDetails {
  card?: {
    brand: string;
    last4: string;
    exp_month: number;
    exp_year: number;
  } | null;
}

interface TransferData {
  destination: string;
  amount?: number;
}

interface PaymentStatus {
  paymentIntentId: string;
  status:
    | 'succeeded'
    | 'processing'
    | 'requires_payment_method'
    | 'requires_confirmation'
    | 'requires_action'
    | 'canceled';
  amount: number;
  amount_received: number;
  currency: string;
  payment_method: string | null;
  payment_method_types: string[];
  created: number;
  client_secret: string;
  payment_method_details: PaymentMethodDetails;
  transfer_data: TransferData | null;
  metadata: Record<string, string>;
}

export const usePosPaymentStatus = (paymentIntentId: string | null) => {
  return useQuery<PaymentStatus | null>({
    queryKey: ['payment-status', paymentIntentId],
    queryFn: async () => {
      if (!paymentIntentId) return null;
      const response = await newRequest.get<{ status: string; data: PaymentStatus }>(
        `/pos/payment-status?paymentIntentId=${paymentIntentId}`,
      );
      return response.data.data;
    },
    enabled: !!paymentIntentId,
    refetchInterval: 2000,
    refetchIntervalInBackground: false,
  });
};
