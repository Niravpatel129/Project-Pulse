import { newRequest } from '@/utils/newRequest';
import { useQuery } from '@tanstack/react-query';

export interface TeamMember {
  user: {
    _id: string;
    name: string;
    email: string;
    role: string;
    needsPasswordChange: boolean;
  };
  role: string;
  _id: string;
}

export interface Invitation {
  email: string;
  role: string;
  invitedBy: {
    _id: string;
    name: string;
    email: string;
  };
  expiresAt: string;
  token: string;
}

interface WorkspaceResponse {
  statusCode: number;
  data: {
    members: TeamMember[];
    invitations: Invitation[];
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

      return {
        members: response.data.data.members,
        invitations: response.data.data.invitations || [],
      };
    },
  });

  return {
    teamMembers: data?.members || [],
    invitations: data?.invitations || [],
    isLoading,
    error: error ? (error as Error).message : null,
  };
}
