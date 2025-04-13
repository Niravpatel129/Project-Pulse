import { newRequest } from '@/utils/newRequest';
import { useMutation, UseMutationResult } from '@tanstack/react-query';
import { toast } from 'sonner';

interface EnhanceTextRequest {
  text: string;
  enhanceType: string;
  customPrompt?: string;
}

interface EnhanceTextResponse {
  enhancedText: string;
}

export const useAiEnhancement = (): UseMutationResult<
  EnhanceTextResponse,
  Error,
  EnhanceTextRequest
> => {
  return useMutation<EnhanceTextResponse, Error, EnhanceTextRequest>({
    mutationFn: async ({ text, enhanceType, customPrompt }) => {
      const { data } = await newRequest.post<EnhanceTextResponse>('/ai/enhance-text', {
        text,
        enhanceType,
        customPrompt,
      });
      return data;
    },
    onError: (error) => {
      console.error('Error enhancing text:', error);
      toast.error('Failed to enhance text', {
        description: 'There was a problem enhancing your text. Please try again.',
      });
    },
  });
};
