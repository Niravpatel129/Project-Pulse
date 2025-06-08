import { newRequest } from '@/utils/newRequest';
import { useMutation } from '@tanstack/react-query';

interface CancelPaymentParams {
  paymentIntentId: string;
}

export const usePosPaymentCancel = () => {
  return useMutation({
    mutationFn: async ({ paymentIntentId }: CancelPaymentParams) => {
      const response = await newRequest.post<{ status: string; message?: string }>(
        '/pos/cancel-payment-intent',
        {
          paymentIntentId,
        },
      );
      return response.data;
    },
  });
};
