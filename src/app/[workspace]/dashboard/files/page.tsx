'use client';
import { cn } from '@/lib/utils';
import {
  ChevronRight,
  FileAudioIcon,
  FileCodeIcon,
  FileIcon,
  FileImageIcon,
  FileTextIcon,
  FileVideoIcon,
  FolderIcon,
  FolderLockIcon,
} from 'lucide-react';
import { useState } from 'react';

// Fake file data with nested structure
const fakeFiles = {
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

interface FileItem {
  name: string;
  type: string;
  size?: string;
  items?: number;
  lastModified: string;
  children?: FileItem[];
}

const FileTreeItem = ({
  item,
  level = 0,
  expandedFolders,
  onToggleFolder,
}: {
  item: FileItem;
  level?: number;
  expandedFolders: string[];
  onToggleFolder: (name: string) => void;
}) => {
  const isExpanded = expandedFolders.includes(item.name);
  const hasChildren = item.children && item.children.length > 0;

  return (
    <div>
      <div
        className={cn(
          'flex items-center gap-2 px-2 py-1.5 rounded-md text-sm cursor-pointer',
          'hover:bg-[#e5e5e7] dark:hover:bg-[#2c2c2e] transition-colors',
          'text-foreground',
        )}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
        onClick={() => {
          return hasChildren && onToggleFolder(item.name);
        }}
      >
        {hasChildren && (
          <ChevronRight
            className={cn('h-4 w-4 transition-transform', isExpanded ? 'rotate-90' : '')}
          />
        )}
        {getFileIcon(item.type)}
        <span className='truncate'>{item.name}</span>
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
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

const Files = () => {
  const [activeSection, setActiveSection] = useState<'workspace' | 'private'>('workspace');
  const [expandedFolders, setExpandedFolders] = useState<string[]>([]);

  const toggleFolder = (folderName: string) => {
    setExpandedFolders((prev) => {
      return prev.includes(folderName)
        ? prev.filter((name) => {
            return name !== folderName;
          })
        : [...prev, folderName];
    });
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
                return setActiveSection('workspace');
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
                return setActiveSection('private');
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
          <h1 className='text-2xl font-semibold mb-2'>
            {activeSection === 'workspace' ? 'Workspace Files' : 'My Folder'}
          </h1>
          <p className='text-sm text-muted-foreground'>
            {activeSection === 'workspace'
              ? 'Shared files and folders for the workspace'
              : 'Your private files and folders'}
          </p>
        </div>

        {/* File Browser */}
        <div className='bg-white dark:bg-[#1c1c1e] rounded-lg border border-border'>
          {/* Column Headers */}
          <div className='grid grid-cols-12 gap-4 px-4 py-2 border-b border-border text-sm text-muted-foreground'>
            <div className='col-span-6'>Name</div>
            <div className='col-span-3'>Size</div>
            <div className='col-span-3'>Last Modified</div>
          </div>

          {/* File List */}
          <div className='divide-y divide-border'>
            {fakeFiles[activeSection].map((file, index) => {
              return (
                <div
                  key={index}
                  className={cn(
                    'grid grid-cols-12 gap-4 px-4 py-2 text-sm',
                    'hover:bg-[#f5f5f7] dark:hover:bg-[#2c2c2e] transition-colors',
                    'cursor-pointer',
                  )}
                  onClick={() => {
                    return file.type === 'folder' && toggleFolder(file.name);
                  }}
                >
                  <div className='col-span-6 flex items-center gap-2'>
                    {getFileIcon(file.type)}
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
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Files;
