import { useCallback, useState } from 'react';

interface FileItem {
  name: string;
  type: string;
  size?: string;
  items?: number;
  lastModified: string;
  children?: FileItem[];
}

type FileSection = {
  [key: string]: FileItem[];
};

const fakeFiles: FileSection = {
  workspace: [
    {
      name: 'Project Documentation',
      type: 'folder',
      items: 12,
      lastModified: '2024-03-15',
      children: [
        {
          name: 'Technical Specs',
          type: 'folder',
          items: 3,
          lastModified: '2024-03-14',
          children: [
            { name: 'Architecture.pdf', type: 'pdf', size: '2.1 MB', lastModified: '2024-03-13' },
            {
              name: 'API Docs',
              type: 'folder',
              items: 2,
              lastModified: '2024-03-12',
              children: [
                { name: 'Endpoints.md', type: 'text', size: '45 KB', lastModified: '2024-03-11' },
                { name: 'Auth.md', type: 'text', size: '32 KB', lastModified: '2024-03-10' },
              ],
            },
          ],
        },
        {
          name: 'User Guides',
          type: 'folder',
          items: 2,
          lastModified: '2024-03-13',
          children: [
            {
              name: 'Getting Started.pdf',
              type: 'pdf',
              size: '1.8 MB',
              lastModified: '2024-03-12',
            },
            {
              name: 'Advanced Features.pdf',
              type: 'pdf',
              size: '2.3 MB',
              lastModified: '2024-03-11',
            },
          ],
        },
      ],
    },
    {
      name: 'Design Assets',
      type: 'folder',
      items: 8,
      lastModified: '2024-03-14',
      children: [
        {
          name: 'Icons',
          type: 'folder',
          items: 2,
          lastModified: '2024-03-13',
          children: [
            {
              name: 'App Icons',
              type: 'folder',
              items: 1,
              lastModified: '2024-03-12',
              children: [
                { name: 'logo.svg', type: 'image', size: '45 KB', lastModified: '2024-03-11' },
              ],
            },
          ],
        },
        {
          name: 'Mockups',
          type: 'folder',
          items: 3,
          lastModified: '2024-03-12',
          children: [
            {
              name: 'Desktop',
              type: 'folder',
              items: 2,
              lastModified: '2024-03-11',
              children: [
                { name: 'Home.png', type: 'image', size: '1.2 MB', lastModified: '2024-03-10' },
                {
                  name: 'Dashboard.png',
                  type: 'image',
                  size: '1.5 MB',
                  lastModified: '2024-03-09',
                },
              ],
            },
          ],
        },
      ],
    },
    { name: 'meeting-notes.txt', type: 'text', size: '2.4 KB', lastModified: '2024-03-13' },
    { name: 'presentation.pdf', type: 'pdf', size: '4.2 MB', lastModified: '2024-03-12' },
    { name: 'logo.png', type: 'image', size: '1.8 MB', lastModified: '2024-03-11' },
    { name: 'app.js', type: 'code', size: '45 KB', lastModified: '2024-03-10' },
  ],
  private: [
    {
      name: 'Personal Notes',
      type: 'folder',
      items: 5,
      lastModified: '2024-03-15',
      children: [
        {
          name: 'Work',
          type: 'folder',
          items: 2,
          lastModified: '2024-03-14',
          children: [
            { name: 'Ideas.txt', type: 'text', size: '12 KB', lastModified: '2024-03-13' },
            { name: 'Tasks.md', type: 'text', size: '8 KB', lastModified: '2024-03-12' },
          ],
        },
        {
          name: 'Personal',
          type: 'folder',
          items: 1,
          lastModified: '2024-03-13',
          children: [
            { name: 'Journal.md', type: 'text', size: '24 KB', lastModified: '2024-03-12' },
          ],
        },
      ],
    },
    {
      name: 'Draft Documents',
      type: 'folder',
      items: 3,
      lastModified: '2024-03-14',
      children: [
        {
          name: 'Blog Posts',
          type: 'folder',
          items: 2,
          lastModified: '2024-03-13',
          children: [
            { name: 'Draft 1.md', type: 'text', size: '15 KB', lastModified: '2024-03-12' },
            { name: 'Draft 2.md', type: 'text', size: '18 KB', lastModified: '2024-03-11' },
          ],
        },
      ],
    },
    { name: 'resume.pdf', type: 'pdf', size: '2.1 MB', lastModified: '2024-03-13' },
    { name: 'profile.jpg', type: 'image', size: '3.5 MB', lastModified: '2024-03-12' },
  ],
};

export const useFileManager = () => {
  const [activeSection, setActiveSection] = useState<'workspace' | 'private'>('workspace');
  const [expandedFolders, setExpandedFolders] = useState<string[]>([]);
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState<'file' | 'folder' | null>(null);
  const [newItemName, setNewItemName] = useState('');

  const createNewItem = useCallback((type: 'file' | 'folder') => {
    setIsCreatingNew(type);
    setNewItemName('');
  }, []);

  const handleCreateItem = useCallback(() => {
    if (!newItemName.trim()) {
      setIsCreatingNew(null);
      return;
    }

    const newItem: FileItem = {
      name: newItemName.trim(),
      type: isCreatingNew === 'folder' ? 'folder' : 'text',
      lastModified: new Date().toISOString().split('T')[0],
      items: isCreatingNew === 'folder' ? 0 : undefined,
      size: isCreatingNew === 'folder' ? undefined : '0 KB',
      children: isCreatingNew === 'folder' ? [] : undefined,
    };

    // Add the new item to the current folder
    const updateFiles = (files: FileItem[]): FileItem[] => {
      return files.map((file) => {
        if (file.type === 'folder' && file.name === currentPath[currentPath.length - 1]) {
          return {
            ...file,
            children: [...(file.children || []), newItem],
            items: (file.items || 0) + 1,
          };
        }
        if (file.children) {
          return {
            ...file,
            children: updateFiles(file.children),
          };
        }
        return file;
      });
    };

    if (currentPath.length === 0) {
      fakeFiles[activeSection] = [...fakeFiles[activeSection], newItem];
    } else {
      fakeFiles[activeSection] = updateFiles(fakeFiles[activeSection]);
    }

    setIsCreatingNew(null);
    setNewItemName('');
  }, [newItemName, isCreatingNew, currentPath, activeSection]);

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
      const current = fakeFiles[activeSection];
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
    let current = fakeFiles[activeSection];
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
    const path = [activeSection === 'workspace' ? 'Workspace' : 'Private'];
    let current = fakeFiles[activeSection];

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
    fakeFiles,
  };
};

export type { FileItem, FileSection };
