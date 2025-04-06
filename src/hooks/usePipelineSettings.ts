import { useState } from 'react';

export function usePipelineSettings() {
  const [stages, setStages] = useState([
    'Initial Contact',
    'Needs Analysis',
    'Proposal',
    'Closed Won',
    'Closed Lost',
  ]);

  const [statuses, setStatuses] = useState([
    'Not Started',
    'On Track',
    'At Risk',
    'Delayed',
    'Completed',
  ]);

  const [isEditStatusDialogOpen, setIsEditStatusDialogOpen] = useState(false);
  const [newStageName, setNewStageName] = useState('');
  const [newStatusName, setNewStatusName] = useState('');
  const [newStatusColor, setNewStatusColor] = useState('slate');
  const [customColor, setCustomColor] = useState('#94a3b8'); // Default slate color
  const [editingStageIndex, setEditingStageIndex] = useState<number | null>(null);
  const [editingStatusIndex, setEditingStatusIndex] = useState<number | null>(null);
  const [isAddingStage, setIsAddingStage] = useState(false);

  const handleAddStage = () => {
    if (newStageName.trim()) {
      if (editingStageIndex !== null) {
        // Edit existing stage
        const updatedStages = [...stages];
        updatedStages[editingStageIndex] = newStageName;
        setStages(updatedStages);
        setEditingStageIndex(null);
      } else {
        // Add new stage
        setStages([...stages, newStageName]);
      }
      setNewStageName('');
      setIsAddingStage(false);
    }
  };

  const handleDeleteStage = (index: number) => {
    const updatedStages = [...stages];
    updatedStages.splice(index, 1);
    setStages(updatedStages);
  };

  const handleEditStage = (index: number) => {
    setNewStageName(stages[index]);
    setEditingStageIndex(index);
    setIsAddingStage(true);
  };

  const handleEditStatus = (index: number) => {
    setNewStatusName(statuses[index]);

    // Set the current color based on the status
    switch (statuses[index]) {
      case 'Completed':
        setNewStatusColor('green');
        setCustomColor('#22c55e');
        break;
      case 'On Track':
        setNewStatusColor('blue');
        setCustomColor('#3b82f6');
        break;
      case 'At Risk':
        setNewStatusColor('amber');
        setCustomColor('#f59e0b');
        break;
      case 'Delayed':
        setNewStatusColor('red');
        setCustomColor('#ef4444');
        break;
      case 'Not Started':
      default:
        setNewStatusColor('slate');
        setCustomColor('#94a3b8');
        break;
    }

    setEditingStatusIndex(index);
    setIsEditStatusDialogOpen(true);
  };

  const handleUpdateStatus = () => {
    if (newStatusName.trim() && editingStatusIndex !== null) {
      const updatedStatuses = [...statuses];
      updatedStatuses[editingStatusIndex] = newStatusName;
      setStatuses(updatedStatuses);
      setNewStatusName('');
      setNewStatusColor('slate');
      setCustomColor('#94a3b8');
      setEditingStatusIndex(null);
      setIsEditStatusDialogOpen(false);
    }
  };

  const handleDeleteStatus = (index: number) => {
    const updatedStatuses = [...statuses];
    updatedStatuses.splice(index, 1);
    setStatuses(updatedStatuses);
  };

  const moveStage = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === stages.length - 1)
    ) {
      return;
    }

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const updatedStages = [...stages];
    [updatedStages[index], updatedStages[newIndex]] = [
      updatedStages[newIndex],
      updatedStages[index],
    ];
    setStages(updatedStages);
  };

  return {
    stages,
    statuses,
    isEditStatusDialogOpen,
    newStageName,
    newStatusName,
    newStatusColor,
    customColor,
    editingStageIndex,
    editingStatusIndex,
    isAddingStage,
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
