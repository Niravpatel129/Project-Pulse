import { useProject } from '@/contexts/ProjectContext';
import { newRequest } from '@/utils/newRequest';
import { useMutation, useQuery } from '@tanstack/react-query';

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
      if (!project?._id) {
        throw new Error('Project ID is required');
      }
      const res = await newRequest.get(`/projects/${project._id}/invoices`);
      return res.data.data;
    },
    enabled: !!project?._id,
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
