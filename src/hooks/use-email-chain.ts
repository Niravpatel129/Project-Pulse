import { newRequest } from '@/utils/newRequest';
import { useQuery, useQueryClient } from '@tanstack/react-query';

interface Participant {
  email: string;
  name: string;
  role: 'sender' | 'recipient';
  isInternal: boolean;
  lastInteraction: string;
}

interface EmailBody {
  mimeType: string;
  parts: {
    mimeType: string;
    filename: string;
    headers: Array<{
      name: string;
      value: string;
    }>;
    parts?: Array<{
      mimeType: string;
      filename: string;
      headers: Array<{
        name: string;
        value: string;
      }>;
      content: string;
    }>;
  }[];
  structure: {
    mimeType: string;
    contentId: string | null;
    filename: string;
    headers: Array<{
      name: string;
      value: string;
    }>;
    parts: Array<{
      mimeType: string;
      contentId: string | null;
      filename: string;
      headers: Array<{
        name: string;
        value: string;
      }>;
      content: string;
    }>;
  };
}

interface EmailContact {
  id: number;
  avatar_type: string;
  class: string;
  source: string;
  url: string;
  namespace: string;
  name: string;
  card_name: string;
  handle: string;
  email: string;
  display_name: string;
  description: string | null;
  avatar: string;
  initials: string;
  role: string;
  is_spammer: boolean;
  recipient_url: string;
}

interface EmailLabel {
  name: string;
  color: string;
  _id: string;
  id: string;
}

interface EmailHeader {
  name: string;
  value: string;
  _id: string;
  id: string;
}

interface MessageReference {
  messageId: string;
  inReplyTo: string;
  references: string[];
  type?: string;
  position?: number;
  _id?: string;
  id?: string;
}

interface Email {
  _id: string;
  gmailMessageId: string;
  threadId: string;
  userId: string;
  workspaceId: string;
  from: EmailContact;
  to: EmailContact[];
  cc: EmailContact[];
  bcc: EmailContact[];
  subject: string;
  body: EmailBody;
  snippet: string;
  internalDate: string;
  attachments: any[];
  inlineImages: any[];
  historyId: string;
  direction: string;
  status: string;
  sentAt: string;
  isSpam: boolean;
  stage: string;
  threadPart: number;
  messageReferences: MessageReference[];
  labels: EmailLabel[];
  headers: EmailHeader[];
  createdAt: string;
  updatedAt: string;
  __v: number;
  id: string;
}

interface EmailChain {
  _id: string;
  threadId: string;
  workspaceId: string;
  title: string;
  stage: string;
  subject: string;
  cleanSubject: string;
  participants: Participant[];
  emails: Email[];
  messageReferences: MessageReference[];
  participantHash: string;
  firstMessageDate: string;
  lastMessageDate: string;
  messageCount: number;
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
  __v: number;
  latestMessage: {
    content: string;
    sender: string;
    timestamp: string;
    type: string;
    isRead: boolean;
  };
}

export function useEmailChain(threadId?: string) {
  const queryClient = useQueryClient();

  return useQuery<EmailChain>({
    queryKey: ['email-chain', threadId],
    queryFn: async () => {
      if (!threadId) {
        throw new Error('Thread ID is required');
      }
      const response = await newRequest.get(`/inbox/${threadId}`);

      queryClient.invalidateQueries({ queryKey: ['inbox-threads'] });
      return response.data;
    },
    enabled: !!threadId,
  });
}
