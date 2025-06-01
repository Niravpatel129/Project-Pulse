import { useCallback, useState } from 'react';
import { useFileManagerApi } from './useFileManagerApi';

interface FileItem {
  _id: string;
  name: string;
  type: 'folder' | 'file';
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

type FileSection = {
  [key: string]: FileItem[];
};

export const useFileManager = () => {
  const [activeSection, setActiveSection] = useState<'workspace' | 'private'>('workspace');
  const [expandedFolders, setExpandedFolders] = useState<string[]>([]);
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState<'file' | 'folder' | null>(null);
  const [newItemName, setNewItemName] = useState('');

  const { files, isLoading, createFolder, uploadFile, moveItem, deleteItem } = useFileManagerApi();

  const createNewItem = useCallback((type: 'file' | 'folder') => {
    setIsCreatingNew(type);
    setNewItemName('');
  }, []);

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
        });
      }
      // For files, we'll handle it through the uploadFile mutation
    } catch (error) {
      console.error('Error creating item:', error);
    }

    setIsCreatingNew(null);
    setNewItemName('');
  }, [newItemName, isCreatingNew, currentPath, createFolder, activeSection]);

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
      setCurrentPath(currentPath.slice(0, existingIndex + 1));
    } else {
      const current = files?.[activeSection] || [];
      let found = false;
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

      if (findFolder(current, folderName)) {
        setCurrentPath(newPath);
        found = true;
      }

      if (!found) {
        setCurrentPath((prev) => {
          return [...prev, folderName];
        });
      }
    }

    if (!expandedFolders.includes(folderName)) {
      setExpandedFolders((prev) => {
        return [...prev, folderName];
      });
    }
  };

  const navigateToBreadcrumb = (index: number) => {
    if (index === -1) {
      setCurrentPath([]);
      return;
    }
    setCurrentPath(currentPath.slice(0, index + 1));
  };

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

  const handleFileUpload = async (file: File) => {
    try {
      const currentFolderId =
        currentPath.length > 0
          ? getCurrentFolderContents().find((f) => {
              return f.name === currentPath[currentPath.length - 1];
            })?._id
          : undefined;

      await uploadFile.mutateAsync({
        file,
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
    isLoading,
    files,
  };
};

export type { FileItem, FileSection };
