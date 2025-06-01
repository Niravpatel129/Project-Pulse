import { newRequest } from '@/utils/newRequest';
import { useQuery } from '@tanstack/react-query';
import { type FileItem } from './useFileManager';

interface FileStructureResponse {
  success: boolean;
  items: FileItem[];
}

export const useFileStructureApi = () => {
  // Get file structure for sidebar
  const { data: fileStructure = [], isLoading } = useQuery({
    queryKey: ['file-structure'],
    queryFn: async () => {
      const response = await newRequest.get<FileStructureResponse>('/file-manager/structure');

      if (!response.data.success) {
        throw new Error('Failed to fetch file structure');
      }

      return response.data.items;
    },
    staleTime: 30000, // Data will be considered fresh for 30 seconds
    gcTime: 5 * 60 * 1000, // Cache will be kept for 5 minutes
  });

  return {
    fileStructure,
    isLoading,
  };
};
