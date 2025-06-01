import { newRequest } from '@/utils/newRequest';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

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
  createdBy: string;
  section: 'workspace' | 'private';
  path: string[];
  status: 'active' | 'deleted';
  createdAt: Date;
  updatedAt: Date;
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
}

interface MoveItemParams {
  itemId: string;
  newParentId?: string;
}

interface UploadFileParams {
  files: File[];
  parentId?: string;
  section: 'workspace' | 'private';
}

export const useFileManagerApi = () => {
  const queryClient = useQueryClient();

  // Get files and folders
  const { data: files = { workspace: [], private: [] }, isLoading } = useQuery({
    queryKey: ['files'],
    queryFn: async () => {
      // Get both workspace and private files
      const [workspaceResponse, privateResponse] = await Promise.all([
        newRequest.get<FilesResponse>('/file-manager?section=workspace'),
        newRequest.get<FilesResponse>('/file-manager?section=private'),
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
  });

  // Create folder mutation
  const createFolder = useMutation({
    mutationFn: async ({ name, parentId, section }: CreateFolderParams) => {
      const response = await newRequest.post('/file-manager/folders', {
        name,
        parentId,
        section,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
    },
  });

  // Upload file mutation
  const uploadFile = useMutation({
    mutationFn: async ({ files, parentId, section }: UploadFileParams) => {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('files', file);
      });
      if (parentId) {
        formData.append('parentId', parentId);
      }
      formData.append('section', section);

      const response = await newRequest.post('/file-manager/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
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
    },
  });

  return {
    files,
    isLoading,
    createFolder,
    uploadFile,
    moveItem,
    deleteItem,
  };
};
