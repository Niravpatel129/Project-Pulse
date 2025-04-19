import { newRequest } from '@/utils/newRequest';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export interface LeadForm {
  _id: string;
  title: string;
  description: string;
  workspace: string;
  formElements: any[];
  status: 'draft' | 'published' | 'archived';
  shareableLink?: string;
  embedCode?: string;
  notifyOnSubmission: boolean;
  notificationEmails: string[];
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  submissions: Array<{
    submittedBy?: string;
    clientEmail?: string;
    clientName?: string;
    clientPhone?: string;
    clientCompany?: string;
    clientAddress?: string;
    submittedAt: string;
    formValues: any;
  }>;
  createdAt: string;
  updatedAt: string;
}

export function useLeadForms(status?: string) {
  const queryClient = useQueryClient();

  // Fetch lead forms
  const {
    data: leadForms = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['leadForms', status],
    queryFn: async () => {
      const url = status ? `/lead-forms?status=${status}` : '/lead-forms';
      const response = await newRequest.get(url);
      return response.data;
    },
  });

  // Delete lead form mutation
  const deleteLeadForm = useMutation({
    mutationFn: async (formId: string) => {
      const response = await newRequest.delete(`/lead-forms/${formId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leadForms'] });
      toast.success('Lead form deleted successfully');
    },
    onError: (error) => {
      console.error('Failed to delete lead form:', error);
      toast.error('Failed to delete lead form');
    },
  });

  // Archive lead form mutation
  const archiveLeadForm = useMutation({
    mutationFn: async (formId: string) => {
      const response = await newRequest.patch(`/lead-forms/${formId}`, {
        status: 'archived',
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leadForms'] });
      toast.success('Lead form archived successfully');
    },
    onError: (error) => {
      console.error('Failed to archive lead form:', error);
      toast.error('Failed to archive lead form');
    },
  });

  // Publish lead form mutation
  const publishLeadForm = useMutation({
    mutationFn: async (formId: string) => {
      const response = await newRequest.patch(`/lead-forms/${formId}`, {
        status: 'published',
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leadForms'] });
      toast.success('Lead form published successfully');
    },
    onError: (error) => {
      console.error('Failed to publish lead form:', error);
      toast.error('Failed to publish lead form');
    },
  });

  return {
    leadForms,
    isLoading,
    error,
    deleteLeadForm,
    archiveLeadForm,
    publishLeadForm,
  };
}
