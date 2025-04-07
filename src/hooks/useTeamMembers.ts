import { newRequest } from '@/utils/newRequest';
import { useQuery } from '@tanstack/react-query';

export interface TeamMember {
  _id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

export function useTeamMembers() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['teamMembers'],
    queryFn: async () => {
      const response = await newRequest.get<TeamMember[]>('/team-members');
      return response.data;
    },
  });

  return {
    teamMembers: data || [],
    isLoading,
    error: error ? (error as Error).message : null,
  };
}
