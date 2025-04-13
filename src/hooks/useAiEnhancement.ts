import { newRequest } from '@/utils/newRequest';
import { useMutation, UseMutationResult } from '@tanstack/react-query';
import { toast } from 'sonner';

interface EnhanceTextRequest {
  text: string;
  enhanceType: string;
  customPrompt?: string;
}

interface EnhanceTextResponse {
  status: 'success' | 'error';
  data: {
    enhancedText: string;
    originalText: string;
    enhanceType: string;
    customPrompt: string;
  };
}

export const useAiEnhancement = (): UseMutationResult<
  EnhanceTextResponse['data'],
  Error,
  EnhanceTextRequest
> => {
  return useMutation<EnhanceTextResponse['data'], Error, EnhanceTextRequest>({
    mutationFn: async ({ text, enhanceType, customPrompt }) => {
      const response = await newRequest.post<EnhanceTextResponse>('/ai/enhance-text', {
        text,
        enhanceType,
        customPrompt,
      });

      if (response.data.status === 'error') {
        throw new Error('Failed to enhance text');
      }

      return response.data.data;
    },
    onError: (error) => {
      console.error('Error enhancing text:', error);
      toast.error('Failed to enhance text', {
        description: 'There was a problem enhancing your text. Please try again.',
      });
    },
  });
};
