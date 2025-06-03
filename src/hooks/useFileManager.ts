import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useFileManagerApi } from './useFileManagerApi';
import { useFileStructureApi } from './useFileStructureApi';

interface FileItem {
  _id: string;
  id?: string;
  name: string;
  type: 'folder' | 'image' | 'text' | 'code' | 'pdf' | 'audio' | 'video' | 'file';
  size?: string;
  items: number;
  lastModified: Date;
  shortid?: string;
  children?: FileItem[];
  fileDetails?: {
    storagePath?: string;
    downloadURL?: string;
    contentType?: string;
    originalName?: string;
  };
  workspaceId: string;
  workspaceShortid?: string;
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

type FileSection = {
  [key: string]: FileItem[];
};

const transformBackendResponse = (items: any[]): FileItem[] => {
  return items
    .map((item) => {
      return {
        ...item,
        id: item._id,
        items: item.children?.length || 0,
        lastModified: new Date(item.updatedAt),
        path: [], // This will be populated by the navigation logic
        createdBy: {
          name: item.createdBy?.name || '',
          email: item.createdBy?.email || '',
        },
      };
    })
    .sort((a, b) => {
      // If both are folders or both are files, sort by name
      if (
        (a.type === 'folder' && b.type === 'folder') ||
        (a.type !== 'folder' && b.type !== 'folder')
      ) {
        return a.name.localeCompare(b.name);
      }
      // If one is a folder and one is a file, folder comes first
      return a.type === 'folder' ? -1 : 1;
    });
};

export const useFileManager = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeSection, setActiveSection] = useState<'workspace' | 'private'>(
    (searchParams.get('section') as 'workspace' | 'private') || 'workspace',
  );
  const [expandedFolders, setExpandedFolders] = useState<string[]>([]);
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState<'file' | 'folder' | null>(null);
  const [newItemName, setNewItemName] = useState('');
  const [uploadAbortController, setUploadAbortController] = useState<AbortController | null>(null);

  // Handle initial path from URL
  useEffect(() => {
    const pathParam = searchParams.get('path');
    if (pathParam) {
      const pathArray = pathParam.split('/').filter(Boolean);
      setCurrentPath(pathArray);
      // Don't reset expanded folders here, just add the new path
      setExpandedFolders((prev) => {
        const newExpanded = new Set([...prev, ...pathArray]);
        return Array.from(newExpanded);
      });
    }
  }, [searchParams]);

  const {
    files,
    isLoading: isFilesLoading,
    createFolder,
    uploadFile,
    moveItem,
    deleteItem,
    renameItem,
  } = useFileManagerApi(activeSection, currentPath);

  const { fileStructure, isLoading: isStructureLoading } = useFileStructureApi();

  // Transform the files data when it's received
  const transformedFiles = useMemo(() => {
    if (!files) return { workspace: [], private: [] };

    return {
      workspace: transformBackendResponse(files.workspace || []),
      private: transformBackendResponse(files.private || []),
    };
  }, [files]);

  // Transform the file structure data
  const transformedFileStructure = useMemo(() => {
    if (!fileStructure) return [];

    return transformBackendResponse(fileStructure);
  }, [fileStructure]);

  const createNewItem = useCallback((type: 'file' | 'folder') => {
    setIsCreatingNew(type);
    setNewItemName('');
  }, []);

  const getCurrentFolderContents = () => {
    if (!files) return [];

    let current = files[activeSection] || [];
    for (const folder of currentPath) {
      const found = current.find((item) => {
        return item.name === folder && item.type === 'folder';
      });
      if (found && found.children) {
        current = found.children;
      }
    }
    // Sort items: folders first, then files, both alphabetically by name
    return [...current].sort((a, b) => {
      // If both are folders or both are files, sort by name
      if (
        (a.type === 'folder' && b.type === 'folder') ||
        (a.type !== 'folder' && b.type !== 'folder')
      ) {
        return a.name.localeCompare(b.name);
      }
      // If one is a folder and one is a file, folder comes first
      return a.type === 'folder' ? -1 : 1;
    });
  };

  const handleCreateItem = useCallback(async () => {
    if (!newItemName.trim()) {
      setIsCreatingNew(null);
      return;
    }

    try {
      if (isCreatingNew === 'folder') {
        const currentFolderId =
          currentPath.length > 0
            ? getCurrentFolderContents().find((f) => {
                return f.name === currentPath[currentPath.length - 1];
              })?._id
            : undefined;

        await createFolder.mutateAsync({
          name: newItemName.trim(),
          parentId: currentFolderId,
          section: activeSection,
          path: currentPath,
        });
      }
      // For files, we'll handle it through the uploadFile mutation
    } catch (error) {
      console.error('Error creating item:', error);
    }

    setIsCreatingNew(null);
    setNewItemName('');
  }, [
    newItemName,
    isCreatingNew,
    currentPath,
    createFolder,
    activeSection,
    getCurrentFolderContents,
  ]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleCreateItem();
      } else if (e.key === 'Escape') {
        setIsCreatingNew(null);
        setNewItemName('');
      }
    },
    [handleCreateItem],
  );

  const toggleFolder = (folderName: string) => {
    setExpandedFolders((prev) => {
      return prev.includes(folderName)
        ? prev.filter((name) => {
            return name !== folderName;
          })
        : [...prev, folderName];
    });
  };

  const handleSectionChange = (section: 'workspace' | 'private', path: string[] = []) => {
    setActiveSection(section);
    setCurrentPath(path);
    // Don't modify expanded folders here
    setSelectedFile(null);

    // Update URL with both section and path
    const params = new URLSearchParams();
    params.set('section', section);
    if (path.length > 0) {
      params.set('path', path.join('/'));
    }
    router.push(`?${params.toString()}`);
  };

  const navigateToFolder = (folderName: string) => {
    // Find the folder in the file structure
    const findFolderPath = (
      items: FileItem[],
      targetName: string,
      currentPath: string[] = [],
    ): { path: string[]; section: 'workspace' | 'private' } | null => {
      for (const item of items) {
        if (item.name === targetName && item.type === 'folder') {
          return { path: [...currentPath, item.name], section: item.section };
        }
        if (item.children) {
          const found = findFolderPath(item.children, targetName, [...currentPath, item.name]);
          if (found) return found;
        }
      }
      return null;
    };

    const found = findFolderPath(fileStructure || [], folderName);

    if (found) {
      // If the folder is in a different section, switch to that section with the new path
      if (found.section !== activeSection) {
        handleSectionChange(found.section, found.path);
      } else {
        // If in the same section, just update the path
        setCurrentPath(found.path);
        // Update URL with the new path
        const params = new URLSearchParams();
        params.set('section', activeSection);
        params.set('path', found.path.join('/'));
        router.push(`?${params.toString()}`);
      }
    }
  };

  const navigateToBreadcrumb = (index: number) => {
    if (index === -1) {
      setCurrentPath([]);
      return;
    }
    setCurrentPath(currentPath.slice(0, index + 1));
  };

  const getBreadcrumbPath = () => {
    if (!fileStructure) return [activeSection === 'workspace' ? 'Workspace' : 'Private'];

    const path = [activeSection === 'workspace' ? 'Workspace' : 'Private'];
    let current = fileStructure.filter((item) => {
      return item.section === activeSection;
    });

    for (const folder of currentPath) {
      const findFolder = (items: FileItem[]): FileItem | undefined => {
        for (const item of items) {
          if (item.name === folder && item.type === 'folder') {
            return item;
          }
          if (item.children) {
            const found = findFolder(item.children);
            if (found) return found;
          }
        }
        return undefined;
      };

      const found = findFolder(current);
      if (found) {
        path.push(found.name);
        if (found.children) {
          current = found.children;
        }
      }
    }

    return path;
  };

  // Helper to get the current folder object based on currentPath
  const getCurrentFolder = () => {
    if (!fileStructure) return undefined;

    // If we're in root directory, return undefined
    if (currentPath.length === 0) return undefined;

    // Start from the root of the file structure
    let current = fileStructure.filter((item) => {
      return item.section === activeSection;
    });
    let folder = undefined;

    // Traverse the path to find the current folder
    for (let i = 0; i < currentPath.length; i++) {
      const folderName = currentPath[i];
      folder = current.find((item) => {
        return item.name === folderName && item.type === 'folder';
      });

      if (!folder) break;

      // If this is the last folder in the path, return it
      if (i === currentPath.length - 1) {
        return folder;
      }

      // Otherwise, continue traversing
      if (folder.children) {
        current = folder.children;
      } else {
        break;
      }
    }

    return folder;
  };

  const handleFileUpload = async (file: File) => {
    try {
      const currentFolder = getCurrentFolder();
      console.log('Current Path:', currentPath);
      console.log('Current Folder:', currentFolder);

      // Get the parentId from the current folder's _id
      const parentId = currentFolder?._id;
      console.log('Parent ID being passed:', parentId);

      if (!parentId && currentPath.length > 0) {
        console.error('Could not find parent folder ID for path:', currentPath);
        toast.error('Upload failed', {
          description: 'Could not determine the upload location. Please try again.',
        });
        return;
      }

      // Create a new AbortController for this upload
      const abortController = new AbortController();
      setUploadAbortController(abortController);

      await uploadFile.mutateAsync({
        files: [file],
        parentId,
        section: activeSection,
        path: currentPath,
        signal: abortController.signal,
      });
    } catch (error) {
      if (error.name === 'AbortError') {
        toast.error('Upload cancelled', {
          description: 'The file upload was cancelled.',
        });
      } else {
        console.error('Error uploading file:', error);
        toast.error('Upload failed', {
          description: 'There was an error uploading your file. Please try again.',
        });
      }
    } finally {
      setUploadAbortController(null);
    }
  };

  const cancelUpload = () => {
    if (uploadAbortController) {
      uploadAbortController.abort();
      setUploadAbortController(null);
    }
  };

  const handleMoveItem = async (itemId: string, newParentId?: string) => {
    try {
      await moveItem.mutateAsync({
        itemId,
        newParentId,
      });
    } catch (error) {
      console.error('Error moving item:', error);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      await deleteItem.mutateAsync(itemId);
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const handleRenameItem = async (itemId: string, newName: string) => {
    try {
      await renameItem.mutateAsync({ itemId, newName });
    } catch (error) {
      console.error('Error renaming item:', error);
    }
  };

  return {
    activeSection,
    expandedFolders,
    currentPath,
    selectedFile,
    isCreatingNew,
    newItemName,
    setNewItemName,
    createNewItem,
    handleCreateItem,
    handleKeyDown,
    toggleFolder,
    navigateToFolder,
    navigateToBreadcrumb,
    getCurrentFolderContents,
    getBreadcrumbPath,
    handleSectionChange,
    setSelectedFile,
    handleFileUpload,
    cancelUpload,
    isUploading: !!uploadAbortController,
    handleMoveItem,
    handleDeleteItem,
    handleRenameItem,
    isLoading: isFilesLoading || isStructureLoading,
    files: transformedFiles,
    fileStructure: transformedFileStructure,
  };
};

export type { FileItem, FileSection };
