import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
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

type FileSection = {
  [key: string]: FileItem[];
};

const transformBackendResponse = (items: any[]): FileItem[] => {
  return items.map((item) => {
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

  // Update URL when section changes
  useEffect(() => {
    const params = new URLSearchParams();
    params.set('section', activeSection);
    router.push(`?${params.toString()}`);
  }, [activeSection, router]);

  // Handle initial path from URL
  useEffect(() => {
    const pathParam = searchParams.get('path');
    if (pathParam) {
      const pathArray = pathParam.split('/').filter(Boolean);
      setCurrentPath(pathArray);
      setExpandedFolders(pathArray);
    }
  }, [searchParams]);

  const {
    files,
    isLoading: isFilesLoading,
    createFolder,
    uploadFile,
    moveItem,
    deleteItem,
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
    return current;
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

  const navigateToFolder = (folderName: string) => {
    const existingIndex = currentPath.indexOf(folderName);
    if (existingIndex !== -1) {
      // When navigating to a parent folder, keep all folders up to that point expanded
      const newPath = currentPath.slice(0, existingIndex + 1);
      setCurrentPath(newPath);
      // Keep all folders in the new path expanded
      setExpandedFolders((prev) => {
        const newExpanded = new Set([...prev, ...newPath]);
        return Array.from(newExpanded);
      });
      // Update URL with the new path
      const params = new URLSearchParams(searchParams.toString());
      params.set('path', newPath.join('/'));
      router.push(`?${params.toString()}`);
    } else {
      const current = files?.[activeSection] || [];
      const found = false;
      let newPath: string[] = [];

      const findFolder = (items: FileItem[], targetName: string, path: string[] = []): boolean => {
        for (const item of items) {
          if (item.name === targetName && item.type === 'folder') {
            newPath = [...path, item.name];
            return true;
          }
          if (item.children) {
            if (findFolder(item.children, targetName, [...path, item.name])) {
              return true;
            }
          }
        }
        return false;
      };

      findFolder(current, folderName);
      if (newPath.length > 0) {
        setCurrentPath(newPath);
        setExpandedFolders((prev) => {
          const newExpanded = new Set([...prev, ...newPath]);
          return Array.from(newExpanded);
        });
        // Update URL with the new path
        const params = new URLSearchParams(searchParams.toString());
        params.set('path', newPath.join('/'));
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
    if (!files) return [activeSection === 'workspace' ? 'Workspace' : 'Private'];

    const path = [activeSection === 'workspace' ? 'Workspace' : 'Private'];
    let current = files[activeSection] || [];

    for (const folder of currentPath) {
      const found = current.find((item) => {
        return item.name === folder && item.type === 'folder';
      });
      if (found) {
        path.push(found.name);
        if (found.children) {
          current = found.children;
        }
      }
    }

    return path;
  };

  const handleSectionChange = (section: 'workspace' | 'private') => {
    setActiveSection(section);
    setCurrentPath([]);
    setExpandedFolders([]);
    setSelectedFile(null);
  };

  // Helper to get the current folder object based on currentPath
  const getCurrentFolder = () => {
    if (!files) return undefined;
    let current = files[activeSection] || [];
    let folder = undefined;
    for (const folderName of currentPath) {
      folder = current.find((item) => {
        return item.name === folderName && item.type === 'folder';
      });
      if (folder && folder.children) {
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
      const currentFolderId = currentFolder?._id;

      await uploadFile.mutateAsync({
        files: [file],
        parentId: currentFolderId,
        section: activeSection,
      });
    } catch (error) {
      console.error('Error uploading file:', error);
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
    handleMoveItem,
    handleDeleteItem,
    isLoading: isFilesLoading || isStructureLoading,
    files: transformedFiles,
    fileStructure: transformedFileStructure,
  };
};

export type { FileItem, FileSection };
