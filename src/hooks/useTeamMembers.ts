import { newRequest } from '@/utils/newRequest';
import { useQuery } from '@tanstack/react-query';

export interface TeamMember {
  _id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

interface WorkspaceMember {
  user: {
    _id: string;
    name: string;
    email: string;
  };
  role: string;
  _id: string;
}

interface WorkspaceResponse {
  statusCode: number;
  data: {
    members: WorkspaceMember[];
  };
  message: string;
  success: boolean;
}

export function useTeamMembers() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['teamMembers'],
    queryFn: async () => {
      const response = await newRequest.get<WorkspaceResponse>('/workspaces/team');
      if (!response.data.success) {
        throw new Error(response.data.message);
      }

      // Transform the response to match our TeamMember interface
      return response.data.data.members.map((member) => {
        return {
          _id: member.user._id,
          name: member.user.name,
          email: member.user.email,
          role: member.role,
        };
      });
    },
  });

  return {
    teamMembers: data || [],
    isLoading,
    error: error ? (error as Error).message : null,
  };
}
