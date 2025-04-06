import { newRequest } from '@/utils/newRequest';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

interface PipelineSettings {
  stages: string[];
  statuses: string[];
}

export function usePipelineSettings() {
  const queryClient = useQueryClient();
  const [isEditStatusDialogOpen, setIsEditStatusDialogOpen] = useState(false);
  const [newStageName, setNewStageName] = useState('');
  const [newStatusName, setNewStatusName] = useState('');
  const [newStatusColor, setNewStatusColor] = useState('slate');
  const [customColor, setCustomColor] = useState('#94a3b8');
  const [editingStageIndex, setEditingStageIndex] = useState<number | null>(null);
  const [editingStatusIndex, setEditingStatusIndex] = useState<number | null>(null);
  const [isAddingStage, setIsAddingStage] = useState(false);

  // Fetch pipeline settings
  const { data: pipelineSettings, isLoading } = useQuery<PipelineSettings>({
    queryKey: ['pipelineSettings'],
    queryFn: async () => {
      const response = await newRequest.get('/pipeline/settings');
      return response.data;
    },
    initialData: {
      stages: ['Initial Contact', 'Needs Analysis', 'Proposal', 'Closed Won', 'Closed Lost'],
      statuses: ['Not Started', 'On Track', 'At Risk', 'Delayed', 'Completed'],
    },
  });

  // Update stages mutation
  const updateStagesMutation = useMutation({
    mutationFn: async (newStages: string[]) => {
      return await newRequest.put('/pipeline/settings/stages', { stages: newStages });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pipelineSettings'] });
    },
  });

  // Update statuses mutation
  const updateStatusesMutation = useMutation({
    mutationFn: async (newStatuses: string[]) => {
      return await newRequest.put('/pipeline/settings/statuses', { statuses: newStatuses });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pipelineSettings'] });
    },
  });

  const handleAddStage = () => {
    if (newStageName.trim() && pipelineSettings) {
      const updatedStages = [...pipelineSettings.stages];
      if (editingStageIndex !== null) {
        updatedStages[editingStageIndex] = newStageName;
      } else {
        updatedStages.push(newStageName);
      }
      updateStagesMutation.mutate(updatedStages);
      setNewStageName('');
      setEditingStageIndex(null);
      setIsAddingStage(false);
    }
  };

  const handleDeleteStage = (index: number) => {
    if (pipelineSettings) {
      const updatedStages = [...pipelineSettings.stages];
      updatedStages.splice(index, 1);
      updateStagesMutation.mutate(updatedStages);
    }
  };

  const handleEditStage = (index: number) => {
    if (pipelineSettings) {
      setNewStageName(pipelineSettings.stages[index]);
      setEditingStageIndex(index);
      setIsAddingStage(true);
    }
  };

  const handleEditStatus = (index: number) => {
    if (pipelineSettings) {
      setNewStatusName(pipelineSettings.statuses[index]);
      setEditingStatusIndex(index);
      setIsEditStatusDialogOpen(true);
    }
  };

  const handleUpdateStatus = () => {
    if (newStatusName.trim() && editingStatusIndex !== null && pipelineSettings) {
      const updatedStatuses = [...pipelineSettings.statuses];
      updatedStatuses[editingStatusIndex] = newStatusName;
      updateStatusesMutation.mutate(updatedStatuses);
      setNewStatusName('');
      setNewStatusColor('slate');
      setCustomColor('#94a3b8');
      setEditingStatusIndex(null);
      setIsEditStatusDialogOpen(false);
    }
  };

  const handleDeleteStatus = (index: number) => {
    if (pipelineSettings) {
      const updatedStatuses = [...pipelineSettings.statuses];
      updatedStatuses.splice(index, 1);
      updateStatusesMutation.mutate(updatedStatuses);
    }
  };

  const moveStage = (index: number, direction: 'up' | 'down') => {
    if (!pipelineSettings) return;

    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === pipelineSettings.stages.length - 1)
    ) {
      return;
    }

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const updatedStages = [...pipelineSettings.stages];
    [updatedStages[index], updatedStages[newIndex]] = [
      updatedStages[newIndex],
      updatedStages[index],
    ];
    updateStagesMutation.mutate(updatedStages);
  };

  return {
    stages: pipelineSettings?.stages || [],
    statuses: pipelineSettings?.statuses || [],
    isEditStatusDialogOpen,
    newStageName,
    newStatusName,
    newStatusColor,
    customColor,
    editingStageIndex,
    editingStatusIndex,
    isAddingStage,
    isLoading,
    setNewStageName,
    setNewStatusName,
    setNewStatusColor,
    setCustomColor,
    setIsEditStatusDialogOpen,
    handleAddStage,
    handleDeleteStage,
    handleEditStage,
    handleEditStatus,
    handleUpdateStatus,
    handleDeleteStatus,
    moveStage,
    setEditingStageIndex,
    setEditingStatusIndex,
    setIsAddingStage,
  };
}
