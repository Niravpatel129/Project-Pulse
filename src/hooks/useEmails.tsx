import { newRequest } from '@/utils/newRequest';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
}

interface EmailHistoryItem {
  id: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  body: string;
  sentAt: string;
  sentBy: string;
}

interface SendEmailRequest {
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  body: string;
  projectId: string;
  attachments?: File[];
}

export function useEmails(projectId: string) {
  const queryClient = useQueryClient();

  // Query for email templates
  const templatesQuery = useQuery({
    queryKey: ['emailTemplates'],
    queryFn: async () => {
      const response = await newRequest.get<EmailTemplate[]>('/emails/templates');
      return response.data;
    },
  });

  // Query for email history
  const historyQuery = useQuery({
    queryKey: ['emailHistory', projectId],
    queryFn: async () => {
      const response = await newRequest.get<EmailHistoryItem[]>(`/emails/history/${projectId}`);
      return response.data;
    },
    enabled: !!projectId,
  });

  // Mutation for sending emails
  const sendEmailMutation = useMutation({
    mutationFn: (data: SendEmailRequest) => {
      const formData = new FormData();
      formData.append('to', JSON.stringify(data.to));
      formData.append('cc', JSON.stringify(data.cc || []));
      formData.append('bcc', JSON.stringify(data.bcc || []));
      formData.append('subject', data.subject);
      formData.append('body', data.body);
      formData.append('projectId', data.projectId);

      if (data.attachments) {
        data.attachments.forEach((file) => {
          formData.append('attachments', file);
        });
      }

      return newRequest.post('/emails/send', formData);
    },
    onSuccess: () => {
      // Invalidate and refetch email history
      queryClient.invalidateQueries({ queryKey: ['emailHistory', projectId] });
    },
  });

  // Mutation for saving templates
  const saveTemplateMutation = useMutation({
    mutationFn: (template: Omit<EmailTemplate, 'id'>) => {
      return newRequest.post<EmailTemplate>('/emails/templates', template);
    },
    onSuccess: () => {
      // Invalidate and refetch templates
      queryClient.invalidateQueries({ queryKey: ['emailTemplates'] });
    },
  });

  return {
    templates: templatesQuery.data || [],
    isLoadingTemplates: templatesQuery.isLoading,
    errorTemplates: templatesQuery.error,

    history: historyQuery.data || [],
    isLoadingHistory: historyQuery.isLoading,
    errorHistory: historyQuery.error,

    sendEmail: sendEmailMutation.mutate,
    isSending: sendEmailMutation.isPending,
    sendError: sendEmailMutation.error,

    saveTemplate: saveTemplateMutation.mutate,
    isSavingTemplate: saveTemplateMutation.isPending,
    saveTemplateError: saveTemplateMutation.error,
  };
}
