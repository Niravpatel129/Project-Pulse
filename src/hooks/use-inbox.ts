import { newRequest } from '@/utils/newRequest';
import { useInfiniteQuery } from '@tanstack/react-query';

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

interface PaginatedResponse {
  success: boolean;
  data: InboxThread[];
  pagination: {
    total: number;
    page: number;
    pages: number;
    limit: number;
  };
}

const fetchInboxThreads = async ({ pageParam = 1 }): Promise<PaginatedResponse> => {
  const { data } = await newRequest.get('/inbox', {
    params: {
      page: pageParam,
      limit: 10,
    },
  });
  return data;
};

export const useInbox = () => {
  return useInfiniteQuery({
    queryKey: ['inbox-threads'],
    queryFn: fetchInboxThreads,
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination.page < lastPage.pagination.pages) {
        return lastPage.pagination.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
  });
};
