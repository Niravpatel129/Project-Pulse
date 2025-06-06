import { newRequest } from '@/utils/newRequest';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';

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

export function useEmailChain() {
  const queryClient = useQueryClient();
  const params = useParams();
  const selectedEmailId = (params.selectedEmailId as string) || '0';

  return useQuery<EmailChain>({
    queryKey: ['email-chain', selectedEmailId],
    queryFn: async () => {
      if (!selectedEmailId) {
        throw new Error('Thread ID is required');
      }
      const response = await newRequest.get(`/inbox/${selectedEmailId}`);

      queryClient.invalidateQueries({ queryKey: ['inbox-threads'] });
      return response.data;
    },
    enabled: !!selectedEmailId,
    placeholderData: (previousData) => {
      return previousData;
    },
    staleTime: 30 * 1000, // Consider data fresh for 30 seconds
    gcTime: 5 * 60 * 1000, // Keep unused data in cache for 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    retry: 1, // Only retry once on failure
    select: (data) => {
      return {
        ...data,
        emails: data.emails.map((email) => {
          return {
            ...email,
            body: {
              ...email.body,
              parts: email.body.parts.map((part) => {
                return {
                  ...part,
                  parts: part.parts?.map((nestedPart) => {
                    return {
                      ...nestedPart,
                      content: nestedPart.content || '',
                    };
                  }),
                };
              }),
            },
          };
        }),
      };
    },
  });
}
