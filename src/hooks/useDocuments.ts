import { newRequest } from '@/utils/newRequest';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export interface Document {
  filename: string;
  documentType: string;
  documentUrl: string;
  uploadDate: string;
  chunks: number;
}

interface DocumentsResponse {
  status: string;
  message: string;
  data: Document[];
}

export function useDocuments() {
  const queryClient = useQueryClient();

  // Fetch documents
  const { data: documents = [], isLoading } = useQuery({
    queryKey: ['documents'],
    queryFn: async () => {
      const response = await newRequest.get<DocumentsResponse>('/ai/documents');
      return response.data.data;
    },
  });

  // Upload document mutation
  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await newRequest.post('/ai/documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });

  // Delete document mutation
  const deleteMutation = useMutation({
    mutationFn: async (documentUrl: string) => {
      await newRequest.delete('/ai/documents/delete', {
        data: { documentUrl },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });

  return {
    documents,
    isLoading,
    uploadDocument: uploadMutation.mutate,
    deleteDocument: deleteMutation.mutate,
    isUploading: uploadMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
