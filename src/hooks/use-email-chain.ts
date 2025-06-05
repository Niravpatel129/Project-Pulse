import { newRequest } from '@/utils/newRequest';
import { useQuery } from '@tanstack/react-query';

interface Participant {
  email: string;
  name: string;
  role: 'sender' | 'recipient';
  isInternal: boolean;
  lastInteraction: string;
}

interface EmailBody {
  text: string;
  html: string;
}

interface EmailContact {
  id: number;
  name: string;
  email: string;
  avatar: string;
  initials: string;
  role: string;
}

interface Email {
  _id: string;
  gmailMessageId: string;
  threadId: string;
  from: EmailContact;
  to: EmailContact[];
  cc: EmailContact[];
  bcc: EmailContact[];
  subject: string;
  body: EmailBody;
  snippet: string;
  internalDate: string;
  attachments: any[];
  isRead: boolean;
  historyId: string;
  messageSource: string;
  syncedAt: string;
  createdAt: string;
  updatedAt: string;
}

interface EmailChain {
  _id: string;
  threadId: string;
  workspaceId: string;
  title: string;
  subject: string;
  participants: Participant[];
  emails: Email[];
  status: string;
  priority: string;
  lastActivity: string;
  isRead: boolean;
  isStarred: boolean;
  isPinned: boolean;
  customFields: Record<string, any>;
  metadata: Record<string, any>;
  labels: string[];
  notes: any[];
  createdAt: string;
  updatedAt: string;
  messageCount: number;
  latestMessage: {
    content: string;
    sender: string;
    timestamp: string;
    type: string;
  };
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
