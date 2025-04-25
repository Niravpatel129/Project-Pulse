import { newRequest } from '@/utils/newRequest';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';

export interface ProjectAlert {
  _id: string;
  project: string;
  type: string;
  message: string;
  isDismissed: boolean;
  createdBySystem: boolean;
  sentAt: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  __v: number;
}

interface AlertResponse {
  status: string;
  results: number;
  data: ProjectAlert[];
}

const useProjectAlert = () => {
  const { id: projectId } = useParams();
  const queryClient = useQueryClient();

  const {
    data: alerts,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['projectAlert', projectId],
    queryFn: async () => {
      const response = await newRequest.get<AlertResponse>(`/alerts/project/${projectId}`);
      if (response.data.status !== 'success') {
        throw new Error('Failed to fetch project alerts');
      }
      return response.data.data;
    },
  });

  const dismissMutation = useMutation({
    mutationFn: async (alertId: string) => {
      return await newRequest.patch(`/alerts/${alertId}/dismiss`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projectAlert', projectId] });
    },
  });

  const remindLaterMutation = useMutation({
    mutationFn: async (alertId: string) => {
      return await newRequest.post(`/alerts/project/${alertId}/remind`, { days: 3 });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projectAlert', projectId] });
    },
  });

  const updateProjectStatusMutation = useMutation({
    mutationFn: async ({ status }: { status: string }) => {
      return await newRequest.patch(`/projects/${projectId}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projectAlert', projectId] });
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
    },
  });

  const markProjectFinishedMutation = useMutation({
    mutationFn: async () => {
      return await newRequest.patch(`/projects/${projectId}/complete`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projectAlert', projectId] });
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
    },
  });

  const dismissAlert = (alertId: string) => {
    dismissMutation.mutate(alertId);
  };

  const remindInThreeDays = (alertId: string) => {
    remindLaterMutation.mutate(alertId);
  };

  const updateProjectStatus = (status: string) => {
    updateProjectStatusMutation.mutate({ status });
  };

  const markProjectAsFinished = () => {
    markProjectFinishedMutation.mutate();
  };

  return {
    alerts,
    isLoading,
    error,
    dismissAlert,
    remindInThreeDays,
    updateProjectStatus,
    markProjectAsFinished,
    isDismissing: dismissMutation.isPending,
    isReminding: remindLaterMutation.isPending,
    isUpdatingStatus: updateProjectStatusMutation.isPending,
    isMarkingFinished: markProjectFinishedMutation.isPending,
  };
};

export default useProjectAlert;
