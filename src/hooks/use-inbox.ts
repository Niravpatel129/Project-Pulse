import { newRequest } from '@/utils/newRequest';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';

interface Participant {
  email: string;
  name: string;
  role: 'sender' | 'recipient';
  isInternal: boolean;
  lastInteraction: string;
}

interface LatestMessage {
  content: string;
  sender: string;
  timestamp: string;
  type: string;
}

interface InboxThread {
  latestMessage: LatestMessage;
  messageCount: number;
  _id: string;
  threadId: string;
  workspaceId: string;
  title: string;
  subject: string;
  participants: Participant[];
  emails: string[];
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
  messageReferences: any[];
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

const fetchInboxThreads = async ({
  pageParam = 1,
  stage,
}: {
  pageParam?: number;
  stage: string;
}): Promise<PaginatedResponse> => {
  const { data } = await newRequest.get('/inbox', {
    params: {
      stage: stage,
      page: pageParam,
      limit: 10,
    },
  });
  return data;
};

export const useInbox = () => {
  const params = useParams();
  const stage = (params.state as string) || 'unassigned';

  return useInfiniteQuery({
    queryKey: ['inbox-threads', stage] as const,
    queryFn: ({ pageParam }) => {
      return fetchInboxThreads({ pageParam, stage });
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination.page < lastPage.pagination.pages) {
        return lastPage.pagination.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
  });
};
