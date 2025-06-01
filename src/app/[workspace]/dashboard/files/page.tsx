'use client';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useFileManager, type FileItem } from '@/hooks/useFileManager';
import { cn } from '@/lib/utils';
import {
  Calendar,
  ChevronRight,
  ChevronRightIcon,
  Code,
  Copy,
  Download,
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
  Loader2,
  MoreVertical,
  Music,
  Trash2,
  Video,
  X,
} from 'lucide-react';

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
  onDelete,
  onDuplicate,
  onDownload,
  currentPath,
}: {
  item: FileItem;
  level?: number;
  expandedFolders: string[];
  onToggleFolder: (name: string) => void;
  onNavigateToFolder: (name: string) => void;
  onDelete?: (id: string) => void;
  onDuplicate?: (id: string) => void;
  onDownload?: (id: string) => void;
  currentPath: string[];
}) => {
  const isExpanded = expandedFolders.includes(item.name);
  const hasChildren = item.children && item.children.length > 0;
  const isSelected = currentPath.includes(item.name);

  return (
    <div>
      <div
        className={cn(
          'flex items-center gap-2 px-2 py-1.5 rounded-md text-sm group',
          'hover:bg-[#e5e5e7] dark:hover:bg-[#2c2c2e] transition-colors',
          'text-foreground',
          isSelected && 'bg-[#e5e5e7] dark:bg-[#2c2c2e]',
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
            'flex items-center gap-2 flex-1 min-w-0 text-left',
            'hover:bg-[#e5e5e7] dark:hover:bg-[#2c2c2e] transition-colors',
            'rounded-md px-1 py-0.5',
          )}
        >
          {getFileIcon(item.type)}
          <span className='truncate w-[calc(256px-4rem)] text-left' title={item.name}>
            {item.name}
          </span>
        </button>
        <DropdownMenu>
          <DropdownMenuTrigger
            asChild
            onClick={(e) => {
              return e.stopPropagation();
            }}
          >
            <button className='p-1 hover:bg-[#d1d1d6] dark:hover:bg-[#3a3a3c] rounded-sm transition-colors opacity-0 group-hover:opacity-100'>
              <MoreVertical className='h-4 w-4 text-muted-foreground' />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            {item.type !== 'folder' && (
              <DropdownMenuItem
                onClick={() => {
                  return onDownload?.(item._id);
                }}
              >
                <Download className='h-4 w-4 mr-2' />
                Download
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              onClick={() => {
                return onDuplicate?.(item._id);
              }}
            >
              <Copy className='h-4 w-4 mr-2' />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                return onDelete?.(item._id);
              }}
              className='text-red-600 dark:text-red-400'
            >
              <Trash2 className='h-4 w-4 mr-2' />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
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
                onDelete={onDelete}
                onDuplicate={onDuplicate}
                onDownload={onDownload}
                currentPath={currentPath}
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

const EmptyFolderState = ({
  onCreateNew,
  onFileUpload,
}: {
  onCreateNew: (type: 'file' | 'folder') => void;
  onFileUpload: (file: File) => void;
}) => {
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
            return onCreateNew('folder');
          }}
          className='flex items-center gap-2 px-3 py-1.5 text-sm rounded-md bg-[#e5e5e7] dark:bg-[#2c2c2e] hover:bg-[#d1d1d6] dark:hover:bg-[#3a3a3c] transition-colors'
        >
          <FolderPlus className='h-4 w-4' />
          <span>New Folder</span>
        </button>
        <label className='flex items-center gap-2 px-3 py-1.5 text-sm rounded-md bg-[#e5e5e7] dark:bg-[#2c2c2e] hover:bg-[#d1d1d6] dark:hover:bg-[#3a3a3c] transition-colors cursor-pointer'>
          <FilePlus className='h-4 w-4' />
          <span>New File</span>
          <input
            type='file'
            className='hidden'
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                onFileUpload(file);
              }
              e.target.value = '';
            }}
          />
        </label>
      </div>
    </div>
  );
};

const Files = () => {
  const {
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
    fileStructure,
  } = useFileManager();

  // Filter file structure items by section
  const workspaceItems =
    fileStructure?.filter((item) => {
      return item.section === 'workspace';
    }) || [];
  const privateItems =
    fileStructure?.filter((item) => {
      return item.section === 'private';
    }) || [];

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
    // Reset the input
    e.target.value = '';
  };

  const handleDuplicateFile = async (fileId: string) => {
    try {
      // For files, we'll use moveItem to create a copy in the same location
      await handleMoveItem(fileId);
    } catch (error) {
      console.error('Error duplicating file:', error);
    }
  };

  const handleDownloadFile = async (fileId: string) => {
    try {
      const file = getCurrentFolderContents().find((f) => {
        return f._id === fileId;
      });
      if (file?.fileDetails?.downloadURL) {
        window.open(file.fileDetails.downloadURL, '_blank');
      }
    } catch (error) {
      console.error('Error downloading file:', error);
    }
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
              <label className='flex items-center gap-2 px-3 py-1.5 text-sm rounded-md bg-[#e5e5e7] dark:bg-[#2c2c2e] hover:bg-[#d1d1d6] dark:hover:bg-[#3a3a3c] transition-colors cursor-pointer'>
                <FilePlus className='h-4 w-4' />
                <span>New File</span>
                <input type='file' className='hidden' onChange={handleFileInputChange} />
              </label>
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
                {isLoading ? (
                  <div className='flex items-center justify-center py-8'>
                    <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
                  </div>
                ) : (
                  <>
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
                      <EmptyFolderState
                        onCreateNew={createNewItem}
                        onFileUpload={handleFileUpload}
                      />
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
                  </>
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
                return (document.querySelector('input[type="file"]') as HTMLInputElement)?.click();
              }}
            >
              <FilePlus className='h-4 w-4 mr-2' />
              New File
            </ContextMenuItem>
            {selectedFile && (
              <>
                <ContextMenuItem
                  onClick={() => {
                    return handleDeleteItem(selectedFile._id);
                  }}
                >
                  <X className='h-4 w-4 mr-2' />
                  Delete
                </ContextMenuItem>
              </>
            )}
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
