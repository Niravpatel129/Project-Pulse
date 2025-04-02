import { toast } from '@/components/ui/use-toast';
import { newRequest } from '@/utils/newRequest';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRef, useState } from 'react';

export type FileItem = {
  _id: string;
  name: string;
  originalName: string;
  storagePath: string;
  downloadURL: string;
  contentType: string;
  size: number;
  workspaceId: string;
  uploadedBy: {
    _id: string;
    name: string;
    email: string;
  };
  status: string;
  createdAt: string;
  updatedAt: string;
};

export function useFileUploadManager() {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  // Fetch files from the API
  const { data: files = [], isLoading } = useQuery({
    queryKey: ['files'],
    queryFn: async () => {
      const response = await newRequest.get('/files');
      return response.data.files;
    },
  });

  // Delete file mutation
  const deleteFileMutation = useMutation({
    mutationFn: async (fileId: string) => {
      return await newRequest.delete(`/files/${fileId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
      toast({
        title: 'File removed successfully',
        description: 'The file has been removed from your storage.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error removing file',
        description: 'There was a problem removing the file. Please try again.',
        variant: 'destructive',
      });
      console.error('Error removing file:', error);
    },
  });

  // Upload file mutation
  const uploadFileMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      return await newRequest.post('/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
      toast({
        title: 'Files uploaded successfully',
        description: 'Your files have been added to your storage.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error uploading files',
        description: 'There was a problem uploading your files. Please try again.',
        variant: 'destructive',
      });
      console.error('Error uploading files:', error);
    },
  });

  const handleRemoveFile = (id: string) => {
    deleteFileMutation.mutate(id);

    if (selectedFile && selectedFile._id === id) {
      setSelectedFile(null);
      setShowDetails(false);
    }
  };

  const handleViewDetails = (file: FileItem) => {
    setSelectedFile(file);
    setShowDetails(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    setIsUploading(true);

    const formData = new FormData();
    Array.from(e.target.files).forEach((file) => {
      formData.append('files', file);
    });

    uploadFileMutation.mutate(formData, {
      onSettled: () => {
        setIsUploading(false);
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      },
    });
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  return {
    files,
    isUploading,
    selectedFile,
    showDetails,
    fileInputRef,
    handleRemoveFile,
    handleViewDetails,
    handleFileUpload,
    triggerFileUpload,
    setShowDetails,
    isLoading,
  };
}
