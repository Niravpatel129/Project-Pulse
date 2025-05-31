'use client';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { cn } from '@/lib/utils';
import {
  Calendar,
  ChevronRight,
  ChevronRightIcon,
  Code,
  File,
  FileAudioIcon,
  FileCodeIcon,
  FileIcon,
  FileImageIcon,
  FilePlus,
  FileText,
  FileTextIcon,
  FileVideoIcon,
  FolderIcon,
  FolderLockIcon,
  FolderPlus,
  Image as ImageIcon,
  Music,
  Video,
  X,
} from 'lucide-react';
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

const getFileIcon = (type: string) => {
  switch (type) {
    case 'folder':
      return <FolderIcon className='h-4 w-4 text-blue-500' />;
    case 'text':
      return <FileTextIcon className='h-4 w-4 text-gray-500' />;
    case 'pdf':
      return <FileIcon className='h-4 w-4 text-red-500' />;
    case 'image':
      return <FileImageIcon className='h-4 w-4 text-green-500' />;
    case 'code':
      return <FileCodeIcon className='h-4 w-4 text-purple-500' />;
    case 'audio':
      return <FileAudioIcon className='h-4 w-4 text-yellow-500' />;
    case 'video':
      return <FileVideoIcon className='h-4 w-4 text-orange-500' />;
    default:
      return <FileIcon className='h-4 w-4 text-gray-500' />;
  }
};

const FileTreeItem = ({
  item,
  level = 0,
  expandedFolders,
  onToggleFolder,
  onNavigateToFolder,
}: {
  item: FileItem;
  level?: number;
  expandedFolders: string[];
  onToggleFolder: (name: string) => void;
  onNavigateToFolder: (name: string) => void;
}) => {
  const isExpanded = expandedFolders.includes(item.name);
  const hasChildren = item.children && item.children.length > 0;

  return (
    <div>
      <div
        className={cn(
          'flex items-center gap-2 px-2 py-1.5 rounded-md text-sm',
          'hover:bg-[#e5e5e7] dark:hover:bg-[#2c2c2e] transition-colors',
          'text-foreground',
        )}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
      >
        {hasChildren && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFolder(item.name);
            }}
            className='p-0.5 hover:bg-[#d1d1d6] dark:hover:bg-[#3a3a3c] rounded-sm transition-colors'
          >
            <ChevronRight
              className={cn('h-4 w-4 transition-transform', isExpanded ? 'rotate-90' : '')}
            />
          </button>
        )}
        <button
          onClick={() => {
            return onNavigateToFolder(item.name);
          }}
          className={cn(
            'flex items-center gap-2 flex-1',
            'hover:bg-[#e5e5e7] dark:hover:bg-[#2c2c2e] transition-colors',
            'rounded-md px-1 py-0.5',
          )}
        >
          {getFileIcon(item.type)}
          <span className='truncate'>{item.name}</span>
        </button>
      </div>
      {hasChildren && isExpanded && (
        <div>
          {item.children.map((child, index) => {
            return (
              <FileTreeItem
                key={index}
                item={child}
                level={level + 1}
                expandedFolders={expandedFolders}
                onToggleFolder={onToggleFolder}
                onNavigateToFolder={onNavigateToFolder}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

const FilePreview = ({ file, onClose }: { file: FileItem | null; onClose: () => void }) => {
  if (!file) return null;

  const getPreviewContent = () => {
    switch (file.type) {
      case 'image':
        return (
          <div className='flex items-center justify-center h-48 bg-gray-100 dark:bg-gray-800 rounded-lg'>
            <div className='flex flex-col items-center gap-2'>
              <ImageIcon className='h-8 w-8 text-gray-400' aria-hidden='true' />
              <span className='text-sm text-gray-500'>Image Preview</span>
            </div>
          </div>
        );
      case 'text':
        return (
          <div className='p-4 bg-gray-100 dark:bg-gray-800 rounded-lg'>
            <div className='flex items-center gap-2 mb-2'>
              <FileText className='h-4 w-4 text-gray-400' />
              <span className='text-sm font-medium'>Text Preview</span>
            </div>
            <div className='text-sm text-gray-600 dark:text-gray-300'>
              {file.name} - {file.size}
            </div>
          </div>
        );
      case 'code':
        return (
          <div className='p-4 bg-gray-100 dark:bg-gray-800 rounded-lg'>
            <div className='flex items-center gap-2 mb-2'>
              <Code className='h-4 w-4 text-gray-400' />
              <span className='text-sm font-medium'>Code Preview</span>
            </div>
            <div className='text-sm text-gray-600 dark:text-gray-300'>
              {file.name} - {file.size}
            </div>
          </div>
        );
      case 'pdf':
        return (
          <div className='p-4 bg-gray-100 dark:bg-gray-800 rounded-lg'>
            <div className='flex items-center gap-2 mb-2'>
              <File className='h-4 w-4 text-gray-400' />
              <span className='text-sm font-medium'>PDF Preview</span>
            </div>
            <div className='text-sm text-gray-600 dark:text-gray-300'>
              {file.name} - {file.size}
            </div>
          </div>
        );
      case 'audio':
        return (
          <div className='p-4 bg-gray-100 dark:bg-gray-800 rounded-lg'>
            <div className='flex items-center gap-2 mb-2'>
              <Music className='h-4 w-4 text-gray-400' />
              <span className='text-sm font-medium'>Audio Preview</span>
            </div>
            <div className='text-sm text-gray-600 dark:text-gray-300'>
              {file.name} - {file.size}
            </div>
          </div>
        );
      case 'video':
        return (
          <div className='p-4 bg-gray-100 dark:bg-gray-800 rounded-lg'>
            <div className='flex items-center gap-2 mb-2'>
              <Video className='h-4 w-4 text-gray-400' />
              <span className='text-sm font-medium'>Video Preview</span>
            </div>
            <div className='text-sm text-gray-600 dark:text-gray-300'>
              {file.name} - {file.size}
            </div>
          </div>
        );
      default:
        return (
          <div className='p-4 bg-gray-100 dark:bg-gray-800 rounded-lg'>
            <div className='flex items-center gap-2 mb-2'>
              <File className='h-4 w-4 text-gray-400' />
              <span className='text-sm font-medium'>File Preview</span>
            </div>
            <div className='text-sm text-gray-600 dark:text-gray-300'>
              {file.name} - {file.size}
            </div>
          </div>
        );
    }
  };

  return (
    <div className='w-80 border-l border-border bg-[#f5f5f7] dark:bg-[#1c1c1e]'>
      <div className='flex items-center justify-between p-4 border-b border-border'>
        <div className='flex items-center gap-2'>
          {getFileIcon(file.type)}
          <h3 className='font-medium'>{file.name}</h3>
        </div>
        <button
          onClick={onClose}
          className='p-1 hover:bg-[#e5e5e7] dark:hover:bg-[#2c2c2e] rounded-md transition-colors'
        >
          <X className='h-4 w-4 text-muted-foreground' />
        </button>
      </div>

      <div className='p-4'>
        <div className='mb-4'>
          <div className='text-sm text-muted-foreground'>
            {file.type === 'folder' ? `${file.items} items` : file.size}
          </div>
        </div>

        <div className='space-y-4'>
          <div className='space-y-2'>
            <div className='flex items-center gap-2 text-sm text-muted-foreground'>
              <Calendar className='h-4 w-4' />
              <span>Modified: {new Date(file.lastModified).toLocaleDateString()}</span>
            </div>
            <div className='flex items-center gap-2 text-sm text-muted-foreground'>
              <FileText className='h-4 w-4' />
              <span>Type: {file.type.charAt(0).toUpperCase() + file.type.slice(1)}</span>
            </div>
          </div>

          {file.type !== 'folder' && (
            <div className='mt-4'>
              <h4 className='text-sm font-medium mb-2'>Preview</h4>
              {getPreviewContent()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const EmptyFolderState = () => {
  return (
    <div className='flex flex-col items-center justify-center py-16 px-4 text-center'>
      <div className='w-16 h-16 mb-4 rounded-full bg-[#f5f5f7] dark:bg-[#2c2c2e] flex items-center justify-center'>
        <FolderIcon className='h-8 w-8 text-muted-foreground' />
      </div>
      <h3 className='text-lg font-medium mb-1'>This folder is empty</h3>
      <p className='text-sm text-muted-foreground mb-6'>
        Add files or create a new folder to get started
      </p>
      <div className='flex items-center gap-2'>
        <button
          onClick={() => {
            return createNewItem('folder');
          }}
          className='flex items-center gap-2 px-3 py-1.5 text-sm rounded-md bg-[#e5e5e7] dark:bg-[#2c2c2e] hover:bg-[#d1d1d6] dark:hover:bg-[#3a3a3c] transition-colors'
        >
          <FolderPlus className='h-4 w-4' />
          <span>New Folder</span>
        </button>
        <button
          onClick={() => {
            return createNewItem('file');
          }}
          className='flex items-center gap-2 px-3 py-1.5 text-sm rounded-md bg-[#e5e5e7] dark:bg-[#2c2c2e] hover:bg-[#d1d1d6] dark:hover:bg-[#3a3a3c] transition-colors'
        >
          <FilePlus className='h-4 w-4' />
          <span>New File</span>
        </button>
      </div>
    </div>
  );
};

const Files = () => {
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

  return (
    <div className='flex min-h-screen w-full bg-background'>
      {/* Custom macOS-inspired Sidebar */}
      <div className='w-64 border-r border-border bg-[#f5f5f7] dark:bg-[#1c1c1e] p-4'>
        <div className='space-y-6'>
          {/* Workspace Files Section */}
          <div>
            <h3 className='text-xs font-medium text-muted-foreground mb-2 px-2'>WORKSPACE</h3>
            <button
              onClick={() => {
                return handleSectionChange('workspace');
              }}
              className={cn(
                'w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm',
                'hover:bg-[#e5e5e7] dark:hover:bg-[#2c2c2e] transition-colors',
                activeSection === 'workspace' ? 'bg-[#e5e5e7] dark:bg-[#2c2c2e]' : '',
                'text-foreground',
              )}
            >
              <FolderIcon className='h-4 w-4 text-blue-500' />
              <span>Workspace Files</span>
            </button>
            <div className='mt-2'>
              {fakeFiles.workspace.map((item, index) => {
                return (
                  <FileTreeItem
                    key={index}
                    item={item}
                    expandedFolders={expandedFolders}
                    onToggleFolder={toggleFolder}
                    onNavigateToFolder={navigateToFolder}
                  />
                );
              })}
            </div>
          </div>

          {/* My Folder Section */}
          <div>
            <h3 className='text-xs font-medium text-muted-foreground mb-2 px-2'>PRIVATE</h3>
            <button
              onClick={() => {
                return handleSectionChange('private');
              }}
              className={cn(
                'w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm',
                'hover:bg-[#e5e5e7] dark:hover:bg-[#2c2c2e] transition-colors',
                activeSection === 'private' ? 'bg-[#e5e5e7] dark:bg-[#2c2c2e]' : '',
                'text-foreground',
              )}
            >
              <FolderLockIcon className='h-4 w-4 text-yellow-500' />
              <span>My Folder</span>
            </button>
            <div className='mt-2'>
              {fakeFiles.private.map((item, index) => {
                return (
                  <FileTreeItem
                    key={index}
                    item={item}
                    expandedFolders={expandedFolders}
                    onToggleFolder={toggleFolder}
                    onNavigateToFolder={navigateToFolder}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className='flex-1 p-6'>
        <div className='mb-6'>
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='text-2xl font-semibold mb-2'>
                {activeSection === 'workspace' ? 'Workspace Files' : 'My Folder'}
              </h1>
              <p className='text-sm text-muted-foreground'>
                {activeSection === 'workspace'
                  ? 'Shared files and folders for the workspace'
                  : 'Your private files and folders'}
              </p>
            </div>
            <div className='flex items-center gap-2'>
              <button
                onClick={() => {
                  return createNewItem('folder');
                }}
                className='flex items-center gap-2 px-3 py-1.5 text-sm rounded-md bg-[#e5e5e7] dark:bg-[#2c2c2e] hover:bg-[#d1d1d6] dark:hover:bg-[#3a3a3c] transition-colors'
              >
                <FolderPlus className='h-4 w-4' />
                <span>New Folder</span>
              </button>
              <button
                onClick={() => {
                  return createNewItem('file');
                }}
                className='flex items-center gap-2 px-3 py-1.5 text-sm rounded-md bg-[#e5e5e7] dark:bg-[#2c2c2e] hover:bg-[#d1d1d6] dark:hover:bg-[#3a3a3c] transition-colors'
              >
                <FilePlus className='h-4 w-4' />
                <span>New File</span>
              </button>
            </div>
          </div>
        </div>

        {/* Breadcrumbs */}
        <div className='flex items-center gap-1 mb-4 text-sm'>
          {getBreadcrumbPath().map((folder, index) => {
            return (
              <div key={index} className='flex items-center'>
                {index > 0 && <ChevronRightIcon className='h-4 w-4 text-muted-foreground mx-1' />}
                <button
                  onClick={() => {
                    return navigateToBreadcrumb(index - 1);
                  }}
                  className={cn(
                    'text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300',
                    'px-1 py-0.5 rounded-sm hover:bg-[#e5e5e7] dark:hover:bg-[#2c2c2e] transition-colors',
                    index === 0 && 'font-medium',
                  )}
                >
                  {folder}
                </button>
              </div>
            );
          })}
        </div>

        {/* File Browser */}
        <ContextMenu>
          <ContextMenuTrigger>
            <div className='bg-white dark:bg-[#1c1c1e] rounded-lg border border-border'>
              {/* Column Headers */}
              <div className='grid grid-cols-12 gap-4 px-4 py-2 border-b border-border text-sm text-muted-foreground'>
                <div className='col-span-6'>Name</div>
                <div className='col-span-3'>Size</div>
                <div className='col-span-3'>Last Modified</div>
              </div>

              {/* File List */}
              <div className='divide-y divide-border'>
                {isCreatingNew && (
                  <div className='grid grid-cols-12 gap-4 px-4 py-2 text-sm group hover:bg-[#f5f5f7] dark:hover:bg-[#2c2c2e] transition-colors'>
                    <div className='col-span-6 flex items-center gap-2'>
                      <div className='relative w-8 h-8 flex items-center justify-center'>
                        {isCreatingNew === 'folder' ? (
                          <FolderIcon className='h-4 w-4 text-blue-500' />
                        ) : (
                          <FileTextIcon className='h-4 w-4 text-gray-500' />
                        )}
                      </div>
                      <input
                        type='text'
                        value={newItemName}
                        onChange={(e) => {
                          return setNewItemName(e.target.value);
                        }}
                        onKeyDown={handleKeyDown}
                        onBlur={handleCreateItem}
                        autoFocus
                        className='flex-1 bg-transparent border-none outline-none focus:ring-0'
                        placeholder={`New ${isCreatingNew} name...`}
                      />
                    </div>
                    <div className='col-span-3 text-muted-foreground'>
                      {isCreatingNew === 'folder' ? '0 items' : '0 KB'}
                    </div>
                    <div className='col-span-3 text-muted-foreground'>
                      {new Date().toLocaleDateString()}
                    </div>
                  </div>
                )}
                {getCurrentFolderContents().length === 0 ? (
                  <EmptyFolderState />
                ) : (
                  getCurrentFolderContents().map((file, index) => {
                    return (
                      <div
                        key={index}
                        className={cn(
                          'grid grid-cols-12 gap-4 px-4 py-2 text-sm group',
                          'hover:bg-[#f5f5f7] dark:hover:bg-[#2c2c2e] transition-colors',
                          'cursor-pointer',
                          selectedFile?.name === file.name && 'bg-[#e5e5e7] dark:bg-[#2c2c2e]',
                        )}
                        onClick={() => {
                          if (file.type === 'folder') {
                            navigateToFolder(file.name);
                          } else {
                            setSelectedFile(file);
                          }
                        }}
                      >
                        <div className='col-span-6 flex items-center gap-2'>
                          <div className='relative w-8 h-8 flex items-center justify-center'>
                            {getFileIcon(file.type)}
                            <div className='absolute inset-0 bg-blue-500/10 rounded-md opacity-0 group-hover:opacity-100 transition-opacity' />
                          </div>
                          <span className='truncate'>{file.name}</span>
                          {file.type === 'folder' && (
                            <ChevronRight
                              className={cn(
                                'h-4 w-4 transition-transform',
                                expandedFolders.includes(file.name) ? 'rotate-90' : '',
                              )}
                            />
                          )}
                        </div>
                        <div className='col-span-3 text-muted-foreground'>
                          {file.type === 'folder' ? `${file.items} items` : file.size}
                        </div>
                        <div className='col-span-3 text-muted-foreground'>
                          {new Date(file.lastModified).toLocaleDateString()}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem
              onClick={() => {
                return createNewItem('folder');
              }}
            >
              <FolderPlus className='h-4 w-4 mr-2' />
              New Folder
            </ContextMenuItem>
            <ContextMenuItem
              onClick={() => {
                return createNewItem('file');
              }}
            >
              <FilePlus className='h-4 w-4 mr-2' />
              New File
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      </div>

      {/* File Preview Panel */}
      {selectedFile && (
        <FilePreview
          file={selectedFile}
          onClose={() => {
            return setSelectedFile(null);
          }}
        />
      )}
    </div>
  );
};

export default Files;
