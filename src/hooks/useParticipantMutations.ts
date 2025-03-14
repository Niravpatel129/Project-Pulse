import { participantService } from '@/services/participantService';
import { APIError, Participant } from '@/types/project';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const handleError = (error: APIError) => {
  if (
    error.response?.data?.status === 'error' &&
    error.response?.data?.message === 'Participant is already in this project'
  ) {
    toast.error('Participant Already Added', {
      description: 'This participant is already a member of this project.',
    });
    return;
  }

  const errorMessage =
    error.response?.data?.message ||
    error.message ||
    'There was a problem with the operation. Please try again.';

  toast.error('Error', {
    description: errorMessage,
  });
};

export const useParticipantMutations = (
  projectId: string,
  onOpenChange: (open: boolean) => void,
) => {
  const queryClient = useQueryClient();

  const invalidateQueries = () => {
    queryClient.invalidateQueries({ queryKey: ['participants'] });
    queryClient.invalidateQueries({ queryKey: ['project'] });
  };

  const addParticipantMutation = useMutation({
    mutationFn: (newParticipant: Participant) => {
      return participantService.addNewParticipant(projectId, newParticipant);
    },
    onSuccess: (_, variables) => {
      toast.success('Participant Added', {
        description: `${variables.name} has been added to the project successfully.`,
      });
      invalidateQueries();
      onOpenChange(false);
    },
    onError: (error: APIError) => {
      return handleError(error);
    },
  });

  const addExistingContactMutation = useMutation({
    mutationFn: (contact: Participant) => {
      return participantService.addExistingParticipant(projectId, contact.id);
    },
    onSuccess: (_, variables) => {
      toast.success('Participant Added', {
        description: `${variables.name} has been added to the project successfully.`,
      });
      invalidateQueries();
      onOpenChange(false);
    },
    onError: (error: APIError) => {
      return handleError(error);
    },
  });

  return {
    addParticipantMutation,
    addExistingContactMutation,
  };
};
