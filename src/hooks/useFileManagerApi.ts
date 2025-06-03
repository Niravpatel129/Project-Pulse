import { newRequest } from '@/utils/newRequest';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface FileItem {
  _id: string;
  id?: string;
  name: string;
  type: 'folder' | 'image' | 'text' | 'code' | 'pdf' | 'audio' | 'video' | 'file';
  size?: string;
  items: number;
  lastModified: Date;
  children?: FileItem[];
  fileDetails?: {
    storagePath?: string;
    downloadURL?: string;
    contentType?: string;
    originalName?: string;
  };
  workspaceId: string;
  createdBy: {
    name: string;
    email: string;
  };
  section: 'workspace' | 'private';
  path: string[];
  status: 'active' | 'deleted';
  createdAt: Date;
  updatedAt: Date;
  parent?: string | null;
}

interface FilesResponse {
  success: boolean;
  items: FileItem[];
}

interface OrganizedFiles {
  workspace: FileItem[];
  private: FileItem[];
}

interface CreateFolderParams {
  name: string;
  parentId?: string;
  section: 'workspace' | 'private';
  path?: string[];
}

interface MoveItemParams {
  itemId: string;
  newParentId?: string;
}

interface RenameItemParams {
  itemId: string;
  newName: string;
}

interface UploadFileParams {
  files: File[];
  parentId?: string;
  section: 'workspace' | 'private';
  path?: string[];
  signal?: AbortSignal;
}

export const useFileManagerApi = (
  activeSection: 'workspace' | 'private',
  currentPath: string[] = [],
) => {
  const queryClient = useQueryClient();

  // Get files and folders
  const { data: files = { workspace: [], private: [] }, isLoading } = useQuery({
    queryKey: ['files', activeSection, currentPath],
    queryFn: async () => {
      // Get both workspace and private files
      const [workspaceResponse, privateResponse] = await Promise.all([
        newRequest.get<FilesResponse>(
          `/file-manager?section=workspace&path=${JSON.stringify(currentPath)}`,
        ),
        newRequest.get<FilesResponse>(
          `/file-manager?section=private&path=${JSON.stringify(currentPath)}`,
        ),
      ]);

      if (!workspaceResponse.data.success || !privateResponse.data.success) {
        throw new Error('Failed to fetch files');
      }

      // Organize items by section
      const organizedFiles: OrganizedFiles = {
        workspace: workspaceResponse.data.items,
        private: privateResponse.data.items,
      };

      return organizedFiles;
    },
    staleTime: 30000, // Data will be considered fresh for 30 seconds
    gcTime: 5 * 60 * 1000, // Cache will be kept for 5 minutes
    placeholderData: (previousData) => {
      return previousData;
    }, // Keep showing previous data while loading new data
  });

  // Create folder mutation
  const createFolder = useMutation({
    mutationFn: async ({ name, parentId, section, path }: CreateFolderParams) => {
      const response = await newRequest.post('/file-manager/folders', {
        name,
        parentId,
        section,
        path,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
      queryClient.invalidateQueries({ queryKey: ['file-structure'] });
    },
  });

  // Upload file mutation
  const uploadFile = useMutation({
    mutationFn: async ({ files, parentId, section, path, signal }: UploadFileParams) => {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('files', file);
      });

      // If we have a path, we need to find the parentId
      if (path && path.length > 0) {
        // Get the current files to find the parent folder
        const response = await newRequest.get<FilesResponse>(
          `/file-manager?section=${section}&path=${JSON.stringify(path.slice(0, -1))}`,
        );

        if (response.data.success) {
          const parentFolder = response.data.items.find((item) => {
            return item.name === path[path.length - 1] && item.type === 'folder';
          });
          if (parentFolder) {
            formData.append('parentId', parentFolder._id);
          }
        }
      } else {
        // If no path, use the provided parentId or null
        formData.append('parentId', parentId || '');
      }

      formData.append('section', section);

      const toastId = toast.loading(
        `Uploading ${files.length} file${files.length > 1 ? 's' : ''}...`,
        {
          description: 'Please wait while your files are being uploaded.',
        },
      );

      try {
        const response = await newRequest.post('/file-manager/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          signal,
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / (progressEvent.total || 1),
            );
            toast.loading(`Uploading ${files.length} file${files.length > 1 ? 's' : ''}...`, {
              id: toastId,
              description: `Progress: ${percentCompleted}%`,
            });
          },
        });

        toast.success('Upload complete!', {
          id: toastId,
          description: 'Your files have been successfully uploaded.',
        });

        return response.data;
      } catch (error) {
        if (error.name === 'CanceledError') {
          toast.error('Upload cancelled', {
            id: toastId,
            description: 'The file upload was cancelled.',
          });
        } else {
          toast.error('Upload failed', {
            id: toastId,
            description: 'There was an error uploading your files. Please try again.',
          });
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
      queryClient.invalidateQueries({ queryKey: ['file-structure'] });
    },
  });

  // Move item mutation
  const moveItem = useMutation({
    mutationFn: async ({ itemId, newParentId }: MoveItemParams) => {
      const response = await newRequest.put(`/file-manager/${itemId}/move`, {
        newParentId,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
      queryClient.invalidateQueries({ queryKey: ['file-structure'] });
    },
  });

  // Delete item mutation
  const deleteItem = useMutation({
    mutationFn: async (itemId: string) => {
      const response = await newRequest.delete(`/file-manager/${itemId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
      queryClient.invalidateQueries({ queryKey: ['file-structure'] });
    },
  });

  // Rename item mutation
  const renameItem = useMutation({
    mutationFn: async ({ itemId, newName }: RenameItemParams) => {
      const response = await newRequest.put(`/file-manager/${itemId}/rename`, {
        newName,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
      queryClient.invalidateQueries({ queryKey: ['file-structure'] });
    },
  });

  return {
    files,
    isLoading,
    createFolder,
    uploadFile,
    moveItem,
    deleteItem,
    renameItem,
  };
};
