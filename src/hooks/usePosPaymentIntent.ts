import { newRequest } from '@/utils/newRequest';
import { useMutation } from '@tanstack/react-query';

interface PosPaymentIntentResponse {
  status: string;
  data: {
    id: string;
    status: string;
    amount: number;
    amount_received: number;
    currency: string;
    payment_method: null | any;
    payment_method_types: string[];
    created: number;
    client_secret: string;
    payment_method_details: {
      card: null | any;
    };
    transfer_data: null | any;
    metadata: {
      invoiceId: string;
      workspaceId: string;
    };
  };
}

interface PosPaymentIntentVariables {
  invoiceId: string;
  readerId: string;
}

export function usePosPaymentIntent() {
  return useMutation<PosPaymentIntentResponse, Error, PosPaymentIntentVariables>({
    mutationFn: async ({ invoiceId, readerId }) => {
      const response = await newRequest.post('/pos/payment-intent', {
        invoiceId,
        readerId,
      });
      return response.data;
    },
  });
}
