import { toast } from '@/components/ui/use-toast';
import { newRequest } from '@/utils/newRequest';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

export type FigmaFile = {
  _id: string;
  name: string;
  figmaUrl: string;
  thumbnailUrl?: string;
  workspaceId: string;
  addedBy: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
};

export function useFigmaManager() {
  const [selectedFile, setSelectedFile] = useState<FigmaFile | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const queryClient = useQueryClient();

  // Fetch Figma files from the API
  const { data: files = [], isLoading } = useQuery({
    queryKey: ['figma-files'],
    queryFn: async () => {
      const response = await newRequest.get('/figma/files');
      console.log('🚀 response:', response);
      return response.data.data;
    },
  });

  // Add new Figma file mutation
  const addFigmaFileMutation = useMutation({
    mutationFn: async (figmaUrl: string) => {
      return await newRequest.post('/figma/files', { figmaUrl });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['figma-files'] });
      toast({
        title: 'Figma file added successfully',
        description: 'The Figma file has been added to your storage.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error adding Figma file',
        description: 'There was a problem adding the Figma file. Please try again.',
        variant: 'destructive',
      });
      console.error('Error adding Figma file:', error);
    },
  });

  // Delete Figma file mutation
  const deleteFigmaFileMutation = useMutation({
    mutationFn: async (fileId: string) => {
      return await newRequest.delete(`/figma/files/${fileId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['figma-files'] });
      toast({
        title: 'Figma file removed successfully',
        description: 'The Figma file has been removed from your storage.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error removing Figma file',
        description: 'There was a problem removing the Figma file. Please try again.',
        variant: 'destructive',
      });
      console.error('Error removing Figma file:', error);
    },
  });

  const handleAddFigmaFile = (figmaUrl: string) => {
    addFigmaFileMutation.mutate(figmaUrl);
  };

  const handleRemoveFile = (id: string) => {
    deleteFigmaFileMutation.mutate(id);
    if (selectedFile && selectedFile._id === id) {
      setSelectedFile(null);
      setShowDetails(false);
    }
  };

  const handleViewDetails = (file: FigmaFile) => {
    setSelectedFile(file);
    setShowDetails(true);
  };

  return {
    files,
    isLoading,
    selectedFile,
    showDetails,
    handleAddFigmaFile,
    handleRemoveFile,
    handleViewDetails,
    setShowDetails,
  };
}
