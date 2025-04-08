import { newRequest } from '@/utils/newRequest';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

interface FileData {
  _id: string;
  name: string;
  originalName: string;
  downloadURL: string;
  contentType: string;
  size: number;
  updatedAt?: string;
}

interface User {
  _id: string;
  name: string;
  email: string;
  avatar: string | null;
}

interface Version {
  number: number;
  contentSnapshot: {
    fileId: FileData;
    fileName?: string;
    fileSize?: number;
    fields: any[];
  };
  updatedBy: User;
  _id: string;
  updatedAt: string;
}

interface Module {
  _id: string;
  name: string;
  status: string;
  moduleType: string;
  versions: Version[];
  currentVersion: number;
  addedBy: User;
  content: {
    fileId: FileData;
    figmaUrl?: string;
  };
}

interface ApprovalRequest {
  _id: string;
  moduleId: Module;
  requestedBy: User;
  approverId: string | null;
  approverEmail: string;
  message: string;
  status: 'pending' | 'approved' | 'rejected';
  allowComments: boolean;
  moduleDetails: {
    name: string;
    version: number;
    updatedAt: string;
  };
  sendReminder: boolean;
  timeline: {
    action: string;
    description: string;
    createdAt: string;
    _id: string;
    author?: string;
  }[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface ApiResponse {
  status: string;
  data: ApprovalRequest;
}

export const useApprovalRequest = (id: string, userId?: string) => {
  const [selectedVersion, setSelectedVersion] = useState<number | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['approvalRequest', id],
    queryFn: async () => {
      const response = await newRequest.get<ApiResponse>(`/approvals/${id}`);
      if (response.data.status === 'success') {
        const data = response.data.data;
        setSelectedVersion(data.moduleId.currentVersion);
        return data;
      }
      throw new Error('Failed to fetch approval request');
    },
    enabled: !!id,
  });

  const switchVersion = (versionNumber: number) => {
    if (!data) return;

    const version = data.moduleId.versions.find((v) => {
      return v.number === versionNumber;
    });
    if (!version) return;

    setSelectedVersion(versionNumber);
  };

  const addCommentMutation = useMutation({
    mutationFn: async ({ content, attachments }: { content: string; attachments?: File[] }) => {
      const formData = new FormData();
      formData.append('content', content);

      if (attachments) {
        attachments.forEach((file) => {
          formData.append('attachments', file);
        });
      }

      return await newRequest.post(`/approvals/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    },
    onSuccess: (response, variables) => {
      queryClient.setQueryData(['approvalRequest', id], (oldData: ApprovalRequest | undefined) => {
        if (!oldData) return oldData;

        return {
          ...oldData,
          timeline: [
            ...oldData.timeline,
            {
              action: 'commented',
              description: variables.content,
              createdAt: new Date().toISOString(),
              _id: response.data._id,
              author: 'You',
            },
          ],
        };
      });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({
      status,
      comment,
    }: {
      status: 'approved' | 'rejected';
      comment?: string;
    }) => {
      return await newRequest.post(`/approvals/${id}/status`, { status, comment, userId });
    },
    onSuccess: (_, variables) => {
      queryClient.setQueryData(['approvalRequest', id], (oldData: ApprovalRequest | undefined) => {
        if (!oldData) return oldData;

        return {
          ...oldData,
          status: variables.status,
          timeline: variables.comment
            ? [
                ...oldData.timeline,
                {
                  action: variables.status === 'approved' ? 'approved' : 'rejected',
                  description: variables.comment,
                  createdAt: new Date().toISOString(),
                  _id: Date.now().toString(),
                  author: 'You',
                },
              ]
            : oldData.timeline,
        };
      });
    },
  });

  const addComment = async (content: string, attachments?: File[]) => {
    try {
      await addCommentMutation.mutateAsync({ content, attachments });
    } catch (err) {
      console.error('Error adding comment:', err);
      throw err;
    }
  };

  const updateStatus = async (status: 'approved' | 'rejected', comment?: string) => {
    try {
      await updateStatusMutation.mutateAsync({ status, comment });
    } catch (err) {
      console.error('Error updating status:', err);
      throw err;
    }
  };

  return {
    approvalRequest: data,
    loading: isLoading,
    error: error ? (error as Error).message : null,
    addComment,
    updateStatus,
    selectedVersion,
    switchVersion,
  };
};
