import { newRequest } from '@/utils/newRequest';
import { useEffect, useState } from 'react';

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
  const [approvalRequest, setApprovalRequest] = useState<ApprovalRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVersion, setSelectedVersion] = useState<number | null>(null);

  useEffect(() => {
    const fetchApprovalRequest = async () => {
      try {
        setLoading(true);
        const response = await newRequest.get<ApiResponse>(`/approvals/${id}`);

        if (response.data.status === 'success') {
          const data = response.data.data;
          setSelectedVersion(data.moduleId.currentVersion);
          setApprovalRequest(data);
          setError(null);
        } else {
          throw new Error('Failed to fetch approval request');
        }
      } catch (err) {
        setError('Failed to fetch approval request');
        console.error('Error fetching approval request:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchApprovalRequest();
    }
  }, [id]);

  const switchVersion = (versionNumber: number) => {
    if (!approvalRequest) return;

    const data = approvalRequest;
    const version = data.moduleId.versions.find((v) => {
      return v.number === versionNumber;
    });
    if (!version) return;

    setSelectedVersion(versionNumber);
  };

  const addComment = async (content: string, attachments?: File[]) => {
    try {
      const formData = new FormData();
      formData.append('content', content);

      if (attachments) {
        attachments.forEach((file) => {
          formData.append('attachments', file);
        });
      }

      const response = await newRequest.post(`/approvals/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (approvalRequest) {
        setApprovalRequest({
          ...approvalRequest,
          timeline: [
            ...approvalRequest.timeline,
            {
              action: 'commented',
              description: content,
              createdAt: new Date().toISOString(),
              _id: response.data._id,
              author: 'You',
            },
          ],
        });
      }
    } catch (err) {
      console.error('Error adding comment:', err);
      throw err;
    }
  };

  const updateStatus = async (status: 'approved' | 'rejected', comment?: string) => {
    try {
      await newRequest.post(`/approvals/${id}/status`, { status, comment, userId });

      if (approvalRequest) {
        setApprovalRequest({
          ...approvalRequest,
          status,
          timeline: comment
            ? [
                ...approvalRequest.timeline,
                {
                  action: 'commented',
                  description: comment,
                  createdAt: new Date().toISOString(),
                  _id: Date.now().toString(), // Temporary ID until we get the real one from the server
                  author: 'You',
                },
              ]
            : approvalRequest.timeline,
        });
      }
    } catch (err) {
      console.error('Error updating status:', err);
      throw err;
    }
  };

  return {
    approvalRequest,
    loading,
    error,
    addComment,
    updateStatus,
    selectedVersion,
    switchVersion,
  };
};
