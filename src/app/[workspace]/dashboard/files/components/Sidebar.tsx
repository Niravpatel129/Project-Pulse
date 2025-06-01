import { type FileItem } from '@/hooks/useFileManager';
import { cn } from '@/lib/utils';
import { FolderLockIcon, FolderMinus, Loader2 } from 'lucide-react';
import { FileTreeItem } from './FileTreeItem';

interface SidebarProps {
  activeSection: string;
  expandedFolders: string[];
  currentPath: string[];
  isLoading: boolean;
  workspaceItems: FileItem[];
  privateItems: FileItem[];
  handleSectionChange: (section: string) => void;
  toggleFolder: (name: string) => void;
  navigateToFolder: (name: string) => void;
  handleDeleteItem: (id: string) => void;
  handleDuplicateFile: (id: string) => void;
  handleDownloadFile: (id: string) => void;
}

export const Sidebar = ({
  activeSection,
  expandedFolders,
  currentPath,
  isLoading,
  workspaceItems,
  privateItems,
  handleSectionChange,
  toggleFolder,
  navigateToFolder,
  handleDeleteItem,
  handleDuplicateFile,
  handleDownloadFile,
}: SidebarProps) => {
  return (
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
            <FolderMinus className='h-4 w-4 text-green-500' />
            <span>Workspace Files</span>
          </button>
          <div className=''>
            {isLoading ? (
              <div className='flex items-center justify-center py-4'>
                <Loader2 className='h-4 w-4 animate-spin text-muted-foreground' />
              </div>
            ) : (
              workspaceItems.map((item, index) => {
                return (
                  <FileTreeItem
                    key={index}
                    item={item}
                    expandedFolders={expandedFolders}
                    onToggleFolder={toggleFolder}
                    onNavigateToFolder={navigateToFolder}
                    onDelete={handleDeleteItem}
                    onDuplicate={handleDuplicateFile}
                    onDownload={handleDownloadFile}
                    currentPath={currentPath}
                  />
                );
              })
            )}
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
            {isLoading ? (
              <div className='flex items-center justify-center py-4'>
                <Loader2 className='h-4 w-4 animate-spin text-muted-foreground' />
              </div>
            ) : (
              privateItems.map((item, index) => {
                return (
                  <FileTreeItem
                    key={index}
                    item={item}
                    expandedFolders={expandedFolders}
                    onToggleFolder={toggleFolder}
                    onNavigateToFolder={navigateToFolder}
                    onDelete={handleDeleteItem}
                    onDuplicate={handleDuplicateFile}
                    onDownload={handleDownloadFile}
                    currentPath={currentPath}
                  />
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
