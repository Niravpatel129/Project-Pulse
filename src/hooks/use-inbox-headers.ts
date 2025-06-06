import { newRequest } from '@/utils/newRequest';
import { useQuery } from '@tanstack/react-query';

const fetchInboxHeaders = async () => {
  const { data } = await newRequest.get('/inbox/inbox-headers');
  return data.data;
};

export const useInboxHeaders = () => {
  return useQuery({
    queryKey: ['inbox-headers'] as const,
    queryFn: () => {
      return fetchInboxHeaders();
    },
  });
};
