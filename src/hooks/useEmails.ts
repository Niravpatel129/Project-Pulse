import { newRequest } from '@/utils/newRequest';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export interface EmailTemplate {
  _id: string;
  name: string;
  subject: string;
  body: string;
  createdAt: string;
  updatedAt: string;
}

export interface EmailHistoryItem {
  _id: string;
  subject: string;
  body: string;
  to: string[];
  cc: string[];
  bcc: string[];
  from: string;
  attachments: any[];
  sentBy: {
    _id: string;
    name: string;
    email: string;
  };
  status: string;
  sentAt: string;
  createdAt: string;
  updatedAt: string;
}

interface EmailsHookReturn {
  templates: EmailTemplate[];
  isLoadingTemplates: boolean;
  errorTemplates: Error | null;
  history: EmailHistoryItem[];
  isLoadingHistory: boolean;
  errorHistory: Error | null;
  sendEmail: (emailData: {
    to: string[];
    subject: string;
    body: string;
    projectId: string;
    inReplyTo?: string;
    references?: string[];
    trackingData?: {
      shortProjectId: string;
      shortThreadId: string;
      shortUserId: string;
    };
    shortEmailId?: string;
    emailId?: string;
  }) => Promise<any>;
  toggleReadStatus: (emailId: string) => Promise<any>;
}

export function useEmails(projectId: string): EmailsHookReturn {
  const queryClient = useQueryClient();

  const {
    data: templates = [],
    isLoading: isLoadingTemplates,
    error: errorTemplates,
  } = useQuery<EmailTemplate[], Error>({
    queryKey: ['emailTemplates'],
    queryFn: async () => {
      const response = await newRequest.get('/emails/templates');
      return response.data;
    },
    enabled: !!projectId,
  });

  const {
    data: history = [],
    isLoading: isLoadingHistory,
    error: errorHistory,
  } = useQuery<EmailHistoryItem[], Error>({
    queryKey: ['emailHistory', projectId],
    queryFn: async () => {
      const response = await newRequest.get(`/emails/history/${projectId}`);
      return response.data;
    },
    enabled: !!projectId,
  });

  const sendEmail = async (emailData: {
    to: string[];
    subject: string;
    body: string;
    projectId: string;
    inReplyTo?: string;
    references?: string[];
    trackingData?: {
      shortProjectId: string;
      shortThreadId: string;
      shortUserId: string;
    };
    shortEmailId?: string;
    emailId?: string;
  }) => {
    try {
      const response = await newRequest.post('/emails/send', emailData);
      queryClient.invalidateQueries({ queryKey: ['emailHistory', projectId] });
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const toggleReadStatus = async (emailId: string) => {
    try {
      const response = await newRequest.patch(`/emails/${emailId}/toggle-read-status`, {
        projectId,
      });

      // Invalidate the emails query to refresh the data
      queryClient.invalidateQueries({ queryKey: ['emailHistory', projectId] });

      return response.data;
    } catch (error) {
      throw error;
    }
  };

  return {
    templates,
    isLoadingTemplates,
    errorTemplates: errorTemplates || null,
    history,
    isLoadingHistory,
    errorHistory: errorHistory || null,
    sendEmail,
    toggleReadStatus,
  };
}
