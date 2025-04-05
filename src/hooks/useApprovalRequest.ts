import { newRequest } from '@/utils/newRequest';
import { useEffect, useState } from 'react';

interface ApprovalRequest {
  id: string;
  module: string;
  requestedBy: string;
  approver: string;
  dateRequested: string;
  status: 'pending' | 'approved' | 'rejected';
  message: string;
  comments: {
    id: string;
    author: string;
    content: string;
    timestamp: string;
    attachments?: {
      name: string;
      url: string;
    }[];
  }[];
  modulePreview: {
    file: {
      name: string;
      type: string;
      url: string;
      uploadDate: string;
    };
    formResults?: {
      projectName: string;
      department: string;
      budget: string;
      timeline: string;
      description: string;
      expectedOutcomes: string[];
    };
  };
}

export const useApprovalRequest = (id: string) => {
  const [approvalRequest, setApprovalRequest] = useState<ApprovalRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchApprovalRequest = async () => {
      try {
        setLoading(true);
        const response = await newRequest.get(`/approvals/${id}`);
        setApprovalRequest(response.data);
        setError(null);
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

  const addComment = async (content: string, attachments?: File[]) => {
    try {
      const formData = new FormData();
      formData.append('content', content);

      if (attachments) {
        attachments.forEach((file) => {
          formData.append('attachments', file);
        });
      }

      const response = await newRequest.post(`/approvals/${id}/comments`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (approvalRequest) {
        setApprovalRequest({
          ...approvalRequest,
          comments: [...approvalRequest.comments, response.data],
        });
      }
    } catch (err) {
      console.error('Error adding comment:', err);
      throw err;
    }
  };

  const updateStatus = async (status: 'approved' | 'rejected') => {
    try {
      await newRequest.patch(`/approvals/${id}/status`, { status });

      if (approvalRequest) {
        setApprovalRequest({
          ...approvalRequest,
          status,
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
  };
};
