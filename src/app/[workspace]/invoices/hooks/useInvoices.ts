import { useProject } from '@/contexts/ProjectContext';
import { newRequest } from '@/utils/newRequest';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Invoice } from '../types';

export const useInvoices = () => {
  const { project } = useProject();

  const accountStatusQuery = useQuery({
    queryKey: ['stripe-account-status'],
    queryFn: async () => {
      const res = await newRequest.get('/stripe/connect/account-status');
      return res.data.data;
    },
  });

  const invoicesQuery = useQuery({
    queryKey: ['invoices'],
    queryFn: async () => {
      if (project) {
        const res = await newRequest.get(`/projects/${project._id}/invoices`);
        return res.data.data;
      }

      const res = await newRequest.get('/invoices');
      return res.data.data as Invoice[];
    },
  });

  const createStripeAccountMutation = useMutation({
    mutationFn: async () => {
      const res = await newRequest.post('/stripe/connect/create-account');
      return res.data.data;
    },
  });

  return {
    accountStatus: accountStatusQuery.data,
    isAccountStatusLoading: accountStatusQuery.isLoading,
    invoices: invoicesQuery.data,
    isInvoicesLoading: invoicesQuery.isLoading,
    createStripeAccount: createStripeAccountMutation.mutateAsync,
    isCreatingAccount: createStripeAccountMutation.isPending,
  };
};
