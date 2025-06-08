import { newRequest } from '@/utils/newRequest';
import { useMutation } from '@tanstack/react-query';

interface PosPaymentIntentResponse {
  success: boolean;
  data: {
    clientSecret: string;
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
