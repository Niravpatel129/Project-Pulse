import { useProject } from '@/contexts/ProjectContext';
import { newRequest } from '@/utils/newRequest';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';
import { Collaborator, Participant, ProjectData, Role, Team } from '../types';

interface Project extends ProjectData {
  name: string;
  projectType: string;
  createdAt: string | Date;
  projectStatus?: string;
  participants: Array<{
    _id: string;
    name: string;
    role: string;
    avatar?: string;
    email?: string;
    status?: string;
  }>;
  [key: string]: unknown;
}

export function useProjectHeader() {
  const { project, error } = useProject();
  const typedProject = project as unknown as Project | undefined;
  const queryClient = useQueryClient();
  const [predefinedRoles, setPredefinedRoles] = useState<Role[]>([]);
  const [isAddParticipantOpen, setIsAddParticipantOpen] = useState(false);
  const [isAddTeamOpen, setIsAddTeamOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');

  // Use React Query to manage collaborators state
  const { data: collaborators = [] } = useQuery<Collaborator[]>({
    queryKey: ['collaborators', typedProject?._id],
    queryFn: async () => {
      if (!typedProject?._id) return [];
      const response = await newRequest.get(`/projects/${typedProject._id}/collaborators`);
      return response.data.data || [];
    },
    enabled: !!typedProject?._id,
  });

  // Use React Query to manage teams state
  const { data: teams = [] } = useQuery<Team[]>({
    queryKey: ['teams', typedProject?._id],
    queryFn: async () => {
      if (!typedProject?._id) return [];
      const response = await newRequest.get(`/projects/${typedProject._id}/team`);
      return response.data.data || [];
    },
    enabled: !!typedProject?._id,
  });

  // Use React Query to manage participants state
  const { data: participants = [] } = useQuery<Participant[]>({
    queryKey: ['participants'],
    queryFn: () => {
      return Promise.resolve([]);
    },
    initialData: [],
  });

  const addParticipantMutation = useMutation({
    mutationFn: (newParticipant: Participant) => {
      return Promise.resolve(newParticipant);
    },
    onSuccess: (newParticipant) => {
      queryClient.setQueryData<Participant[]>(['participants'], (oldData = []) => {
        const exists = oldData.some((p) => {
          return p.id === newParticipant.id;
        });
        if (!exists) {
          return [...oldData, newParticipant];
        }
        return oldData;
      });
    },
  });

  const removeParticipantMutation = useMutation({
    mutationFn: async (participantId: string) => {
      const response = await newRequest.delete(
        `/projects/${typedProject?._id}/participants/${participantId}`,
      );
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to remove participant');
      }
      return participantId;
    },
    onSuccess: (participantId) => {
      queryClient.setQueryData(
        ['project', typedProject?._id],
        (oldData: ProjectData | undefined) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            participants: oldData.participants.filter((p) => {
              return p._id !== participantId;
            }),
          };
        },
      );
      queryClient.invalidateQueries({ queryKey: ['project', typedProject?._id] });
      queryClient.invalidateQueries({ queryKey: ['participants'] });
    },
    onError: (error) => {
      console.error('Error removing participant:', error);
    },
  });

  const removeCollaboratorMutation = useMutation({
    mutationFn: async (collaboratorId: string) => {
      const response = await newRequest.delete(
        `/projects/${typedProject?._id}/collaborators/${collaboratorId}`,
      );
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to remove collaborator');
      }
      return collaboratorId;
    },
    onSuccess: (collaboratorId) => {
      queryClient.setQueryData<Collaborator[]>(
        ['collaborators', typedProject?._id],
        (oldData = []) => {
          return oldData.filter((c) => {
            return c._id !== collaboratorId;
          });
        },
      );
      queryClient.invalidateQueries({ queryKey: ['collaborators', typedProject?._id] });
      queryClient.invalidateQueries({ queryKey: ['project', typedProject?._id] });
    },
    onError: (error) => {
      console.error('Error removing collaborator:', error);
    },
  });

  const removeTeamMutation = useMutation({
    mutationFn: async (teamId: string) => {
      const response = await newRequest.delete(`/projects/${typedProject?._id}/team/${teamId}`);
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to remove team');
      }
      return teamId;
    },
    onSuccess: (teamId) => {
      queryClient.setQueryData<Team[]>(['teams', typedProject?._id], (oldData = []) => {
        return oldData.filter((t) => {
          return t._id !== teamId;
        });
      });
      queryClient.invalidateQueries({ queryKey: ['teams', typedProject?._id] });
      queryClient.invalidateQueries({ queryKey: ['project', typedProject?._id] });
    },
    onError: (error) => {
      console.error('Error removing team:', error);
    },
  });

  const handleRemoveParticipant = (participantId: string) => {
    toast.promise(removeParticipantMutation.mutateAsync(participantId), {
      loading: 'Removing participant...',
      success: 'Participant removed successfully',
      error: 'Failed to remove participant',
    });
  };

  const handleRemoveCollaborator = (collaboratorId: string) => {
    toast.promise(removeCollaboratorMutation.mutateAsync(collaboratorId), {
      loading: 'Removing collaborator...',
      success: 'Collaborator removed successfully',
      error: 'Failed to remove collaborator',
    });
  };

  const handleRemoveTeam = (teamId: string) => {
    toast.promise(removeTeamMutation.mutateAsync(teamId), {
      loading: 'Removing team...',
      success: 'Team removed successfully',
      error: 'Failed to remove team',
    });
  };

  const handleAddParticipant = (participant: Participant) => {
    addParticipantMutation.mutate(participant);
  };

  const handleAddRole = (role: Role) => {
    setPredefinedRoles((prev) => {
      return [...prev, role];
    });
  };

  const handleSelectRole = (roleName: string) => {
    setSelectedRole(roleName);

    if (roleName === 'CLIENT') {
      setIsAddParticipantOpen(true);
      setIsAddTeamOpen(false);
    } else if (roleName === 'COLLABORATOR' || roleName === 'TEAM MEMBER') {
      setIsAddTeamOpen(true);
      setIsAddParticipantOpen(false);
    } else {
      setIsAddParticipantOpen(true);
      setIsAddTeamOpen(false);
    }
  };

  return {
    project: typedProject,
    error,
    collaborators,
    teams,
    participants,
    predefinedRoles,
    isAddParticipantOpen,
    isAddTeamOpen,
    selectedRole,
    setIsAddParticipantOpen,
    setIsAddTeamOpen,
    handleRemoveParticipant,
    handleRemoveCollaborator,
    handleRemoveTeam,
    handleAddParticipant,
    handleAddRole,
    handleSelectRole,
  };
}
