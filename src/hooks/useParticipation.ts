import { newRequest } from '@/utils/newRequest';
import { useQuery } from '@tanstack/react-query';

interface Participant {
  _id: string;
  name: string;
  email?: string;
  role: string;
  avatar?: string;
  status?: string;
}

export function useParticipation() {
  const { data: participants = [], isLoading } = useQuery<Participant[]>({
    queryKey: ['participants'],
    queryFn: async () => {
      const response = await newRequest.get('/participants');
      return response.data.data || [];
    },
  });

  return {
    participants,
    isLoading,
  };
}
