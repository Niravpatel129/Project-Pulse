import { newRequest } from '@/utils/newRequest';
import { useQuery } from '@tanstack/react-query';

interface EmailMessage {
  id: string;
  sender: {
    name: string;
    email: string;
  };
  recipient: string;
  subject: string;
  timestamp: string;
  content: string;
  isRead: boolean;
}

interface EmailChain {
  threadId: string;
  subject: string;
  messages: EmailMessage[];
}

export function useEmailChain(threadId?: string) {
  return useQuery<EmailChain>({
    queryKey: ['email-chain', threadId],
    queryFn: async () => {
      if (!threadId) {
        throw new Error('Thread ID is required');
      }
      const response = await newRequest.get(`/inbox/${threadId}`);
      return response.data;
    },
    enabled: !!threadId,
  });
}
