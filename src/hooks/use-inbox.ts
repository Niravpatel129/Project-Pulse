import { newRequest } from '@/utils/newRequest';
import { useQuery } from '@tanstack/react-query';

interface EmailParticipant {
  name: string;
  email: string;
}

interface EmailBody {
  text: string;
  html: string;
}

interface Attachment {
  filename: string;
  mimeType: string;
  size: number;
  attachmentId: string;
  storageUrl: string;
}

interface Token {
  accessToken: string;
  refreshToken: string;
  expiryDate: string;
  scope: string;
}

export interface InboxThread {
  _id: string;
  gmailMessageId: string;
  threadId: string;
  userId: string;
  workspaceId: string;
  from: EmailParticipant;
  to: EmailParticipant[];
  cc: EmailParticipant[];
  bcc: EmailParticipant[];
  subject: string;
  body: EmailBody;
  labels: string[];
  snippet: string;
  internalDate: string;
  attachments: Attachment[];
  isRead: boolean;
  historyId: string;
  threadPart: number;
  messageSource: string;
  rawHeaders: Record<string, any>;
  token: Token;
  syncedAt: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

const fetchInboxThreads = async (): Promise<InboxThread[]> => {
  const { data } = await newRequest.get('/inbox');
  return data;
};

export const useInbox = () => {
  return useQuery({
    queryKey: ['inbox-threads'],
    queryFn: fetchInboxThreads,
  });
};
