import { useProject } from '@/contexts/ProjectContext';
import { newRequest } from '@/utils/newRequest';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface ModuleDialogHookProps {
  moduleId: string;
}

interface Approver {
  id?: string;
  name: string;
  email: string;
  isProjectParticipant?: boolean;
}

export function useModuleDialog({ moduleId }: ModuleDialogHookProps) {
  const { project } = useProject();
  const [activeTab, setActiveTab] = useState<'preview' | 'history' | 'comments'>('preview');
  const [selectedVersion, setSelectedVersion] = useState(1);
  const [moduleStatus, setModuleStatus] = useState<'active' | 'archived'>('active');
  const [showApproverDialog, setShowApproverDialog] = useState(false);
  const [selectedApprovers, setSelectedApprovers] = useState<Approver[]>([]);
  const [manualEmail, setManualEmail] = useState('');
  const queryClient = useQueryClient();

  // Fetch module data
  const { data: module, isLoading } = useQuery({
    queryKey: ['module', moduleId],
    queryFn: async () => {
      const { data } = await newRequest.get(`/project-modules/module/${moduleId}`);
      return data.data;
    },
    enabled: !!moduleId,
  });

  // Fetch approval details
  const { data: approvalDetails, isLoading: isLoadingApprovalDetails } = useQuery({
    queryKey: ['module-approvals', moduleId],
    queryFn: async () => {
      const { data } = await newRequest.get(`/approvals/modules/${moduleId}`);
      return data.data;
    },
    enabled: !!moduleId,
  });

  useEffect(() => {
    if (module) {
      setSelectedVersion(module.currentVersion);
    }
  }, [module]);

  const deleteApprovalMutation = useMutation({
    mutationFn: async (approvalId: string) => {
      const { data } = await newRequest.delete(`/approvals/${approvalId}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['module-approvals', moduleId] });
      toast.success('Approval deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete approval');
    },
  });

  // Update module status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async (status: 'active' | 'archived') => {
      const { data } = await newRequest.put(`/project-modules/${moduleId}/status`, { status });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['module', moduleId] });
      toast.success('Module status updated successfully');
    },
    onError: () => {
      toast.error('Failed to update module status');
    },
  });

  // Get all potential approvers from project participants
  const potentialApprovers =
    project?.participants.map((p) => {
      return {
        id: p._id,
        name: p.name,
        email: p.email,
        isProjectParticipant: true,
      };
    }) || [];

  // Add manual email to approvers
  const handleAddManualEmail = () => {
    if (
      manualEmail &&
      !selectedApprovers.some((a) => {
        return a.email === manualEmail;
      })
    ) {
      setSelectedApprovers((prev) => {
        return [
          ...prev,
          {
            name: manualEmail.split('@')[0],
            email: manualEmail,
            isProjectParticipant: false,
          },
        ];
      });
      setManualEmail('');
    }
  };

  // Remove approver
  const handleRemoveApprover = (email: string) => {
    setSelectedApprovers((prev) => {
      return prev.filter((a) => {
        return a.email !== email;
      });
    });
  };

  // Request approval mutation
  const requestApprovalMutation = useMutation({
    mutationFn: async () => {
      if (selectedApprovers.length === 0) {
        throw new Error('Please select at least one approver');
      }

      const { data } = await newRequest.post(`/project-modules/${moduleId}/request-approval`, {
        approvers: selectedApprovers,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['module', moduleId] });
      queryClient.invalidateQueries({ queryKey: ['module-approvals', moduleId] });
      setShowApproverDialog(false);
      setSelectedApprovers([]);
      toast.success('Approval requested successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to request approval');
    },
  });

  // Delete module mutation
  const deleteModuleMutation = useMutation({
    mutationFn: async () => {
      if (!moduleId) return toast.error('Module ID is required');
      const { data } = await newRequest.delete(`/project-modules/${moduleId}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projectModules'] });
    },
    onError: () => {
      toast.error('Failed to delete module');
    },
  });

  // Replace file mutation
  const replaceFileMutation = useMutation({
    mutationFn: async (fileId: string) => {
      const { data } = await newRequest.patch(`/project-modules/${moduleId}/file`, { fileId });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['module', moduleId] });
      toast.success('File replaced successfully');
    },
    onError: () => {
      toast.error('Failed to replace file');
    },
  });

  // Replace Figma file mutation
  const replaceFigmaMutation = useMutation({
    mutationFn: async (fileId: string) => {
      const { data } = await newRequest.patch(`/project-modules/${moduleId}/figma`, { fileId });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['module', moduleId] });
      toast.success('Figma file replaced successfully');
    },
    onError: () => {
      toast.error('Failed to replace Figma file');
    },
  });

  // Restore version mutation
  const restoreVersionMutation = useMutation({
    mutationFn: async (versionNumber: number) => {
      const { data } = await newRequest.patch(`/project-modules/${moduleId}/restore-version`, {
        versionNumber,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['module', moduleId] });
      toast.success('Version restored successfully');
    },
    onError: () => {
      toast.error('Failed to restore version');
    },
  });

  // Approve approval mutation
  const approveApprovalMutation = useMutation({
    mutationFn: async (approvalId: string) => {
      const { data } = await newRequest.patch(`/approvals/modules/${approvalId}/approve`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['module-approvals', moduleId] });
      toast.success('Approval request approved successfully');
    },
    onError: () => {
      toast.error('Failed to approve request');
    },
  });

  // Reject approval mutation
  const rejectApprovalMutation = useMutation({
    mutationFn: async (approvalId: string) => {
      const { data } = await newRequest.patch(`/approvals/modules/${approvalId}/reject`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['module-approvals', moduleId] });
      toast.success('Approval request rejected successfully');
    },
    onError: () => {
      toast.error('Failed to reject request');
    },
  });

  // Helper functions
  const getApprovalStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 hover:bg-green-100';
      case 'rejected':
        return 'bg-red-100 text-red-800 hover:bg-red-100';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
    }
  };

  const getApprovalStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Approved';
      case 'rejected':
        return 'Rejected';
      case 'pending':
        return 'Pending Approval';
      default:
        return 'Not Requested';
    }
  };

  const getModuleTypeLabel = (type: string) => {
    switch (type) {
      case 'file':
        return 'File';
      case 'template':
        return 'Form Response';
      case 'figma':
        return 'Figma';
      default:
        return 'Unknown';
    }
  };

  const getModuleTypeColor = (type: string) => {
    switch (type) {
      case 'file':
        return 'bg-purple-100 text-purple-800 hover:bg-purple-100';
      case 'template':
        return 'bg-teal-100 text-teal-800 hover:bg-teal-100';
      case 'figma':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
    }
  };

  return {
    module,
    isLoading,
    activeTab,
    setActiveTab,
    selectedVersion,
    setSelectedVersion,
    moduleStatus,
    setModuleStatus,
    updateStatusMutation,
    deleteModuleMutation,
    replaceFileMutation,
    replaceFigmaMutation,
    restoreVersionMutation,
    getApprovalStatusColor,
    getApprovalStatusText,
    getModuleTypeLabel,
    getModuleTypeColor,
    showApproverDialog,
    setShowApproverDialog,
    selectedApprovers,
    setSelectedApprovers,
    manualEmail,
    setManualEmail,
    handleAddManualEmail,
    handleRemoveApprover,
    deleteApprovalMutation,
    requestApprovalMutation,
    approvalDetails,
    isLoadingApprovalDetails,
    approveApprovalMutation,
    rejectApprovalMutation,
  };
}
