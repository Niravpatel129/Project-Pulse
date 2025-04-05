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
  moduleId: Module;
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

interface ApiResponse {
  status: string;
  data: {
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
    comments: any[];
    createdAt: string;
    updatedAt: string;
    __v: number;
  };
}

export const useApprovalRequest = (id: string) => {
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
          const currentVersion = data.moduleId.versions.find((v) => {
            return v.number === data.moduleId.currentVersion;
          });
          const currentFile =
            currentVersion?.contentSnapshot.fileId || data.moduleId.content.fileId;

          const transformedData: ApprovalRequest = {
            id: data._id,
            module: data.moduleId.name,
            requestedBy: data.requestedBy.name,
            approver: data.approverEmail,
            dateRequested: new Date(data.createdAt).toLocaleDateString(),
            status: data.status,
            message: data.message,
            comments: data.comments.map((comment) => {
              return {
                id: comment._id,
                author: comment.author.name,
                content: comment.content,
                timestamp: new Date(comment.createdAt).toLocaleString(),
                attachments: comment.attachments?.map((att) => {
                  return {
                    name: att.name,
                    url: att.url,
                  };
                }),
              };
            }),
            moduleId: data.moduleId,
            modulePreview: {
              file: {
                name: currentFile.originalName,
                type: currentFile.contentType,
                url: currentFile.downloadURL,
                uploadDate: new Date(
                  currentVersion?.updatedAt || data.moduleId.content.fileId.updatedAt,
                ).toLocaleDateString(),
              },
            },
          };

          setApprovalRequest(transformedData);
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

    const file = version.contentSnapshot.fileId;
    setSelectedVersion(versionNumber);
    setApprovalRequest({
      ...data,
      modulePreview: {
        ...data.modulePreview,
        file: {
          name: file.originalName,
          type: file.contentType,
          url: file.downloadURL,
          uploadDate: new Date(version.updatedAt).toLocaleDateString(),
        },
      },
    });
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

      const response = await newRequest.post(`/approvals/${id}/comments`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (approvalRequest) {
        setApprovalRequest({
          ...approvalRequest,
          comments: [
            ...approvalRequest.comments,
            {
              id: response.data._id,
              author: response.data.author.name,
              content: response.data.content,
              timestamp: new Date(response.data.createdAt).toLocaleString(),
              attachments: response.data.attachments?.map((att) => {
                return {
                  name: att.name,
                  url: att.url,
                };
              }),
            },
          ],
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
    selectedVersion,
    switchVersion,
  };
};
