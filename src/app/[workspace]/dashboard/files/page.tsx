'use client';
import { Button } from '@/components/ui/button';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent } from '@/components/ui/popover';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useFileManager, type FileItem } from '@/hooks/useFileManager';
import { cn } from '@/lib/utils';
import {
  Calendar,
  Check,
  ChevronRight,
  ChevronRightIcon,
  Code,
  Copy,
  Download,
  File,
  FilePlus,
  FileText,
  FileTextIcon,
  FolderIcon,
  FolderPlus,
  Image as ImageIcon,
  Loader2,
  MoreVertical,
  Music,
  Trash2,
  Video,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { getFileIcon } from './utils/fileIcons';

// Function to generate a short ID from MongoDB ID
const generateShortId = (mongoId: string): string => {
  return mongoId.slice(0, 8);
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

  const handleDownload = () => {
    if (file.fileDetails?.downloadURL) {
      window.open(file.fileDetails.downloadURL, '_blank');
    }
  };

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
    <Sheet open={!!file} onOpenChange={onClose}>
      <SheetContent side='right' className='w-[400px] sm:w-[540px]'>
        <SheetHeader>
          <div className='flex items-center justify-between'>
            <SheetTitle className='flex items-center gap-2'>
              {getFileIcon(file.type)}
              <span>{file.name}</span>
            </SheetTitle>
            {file.type !== 'folder' && (
              <Button
                variant='outline'
                size='sm'
                onClick={handleDownload}
                className='flex items-center gap-2'
              >
                <Download className='h-4 w-4' />
                <span>Download</span>
              </Button>
            )}
          </div>
        </SheetHeader>

        <div className='mt-6 space-y-6'>
          <div className='space-y-2'>
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
      </SheetContent>
    </Sheet>
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
    handleRenameItem,
    isLoading,
    files,
    fileStructure,
  } = useFileManager();
  console.log('🚀 fileStructure:', fileStructure);

  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [isEmailPopoverOpen, setIsEmailPopoverOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [emailAddress, setEmailAddress] = useState('workspace@example.com'); // This should be dynamic based on your workspace

  // Get the current folder's ID for email address
  const getCurrentFolderId = () => {
    if (currentPath.length === 0) return null;

    // Start from the root of the file structure
    const currentFolder = fileStructure?.find((item) => {
      return item.name === currentPath[0];
    });
    console.log('🚀 currentFolder:', currentFolder);

    return currentFolder?.shortid || null;
  };

  // Generate email address based on current state
  const generateEmailAddress = () => {
    const workspaceId = fileStructure?.[0]?.workspaceShortid || 'workspace';
    const parentId = getCurrentFolderId();
    const section = activeSection === 'workspace' ? 'ws' : 'pv';

    // Use short IDs for both workspace and parent
    const shortParentId = parentId ? generateShortId(parentId) : '';

    return `${section}-${workspaceId}${shortParentId ? `-${shortParentId}` : ''}@hourblock.com`;
  };

  // Update email address when relevant state changes
  useEffect(() => {
    setEmailAddress(generateEmailAddress());
  }, [activeSection, currentPath, fileStructure]);

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

  const handleRename = async () => {
    if (!selectedFile || !newFileName.trim()) return;
    await handleRenameItem(selectedFile._id, newFileName.trim());
    setIsRenameDialogOpen(false);
    setNewFileName('');
  };

  return (
    <div className='flex min-h-screen w-full bg-background'>
      <Sidebar
        activeSection={activeSection}
        expandedFolders={expandedFolders}
        currentPath={currentPath}
        isLoading={isLoading}
        workspaceItems={workspaceItems}
        privateItems={privateItems}
        handleSectionChange={handleSectionChange}
        toggleFolder={toggleFolder}
        navigateToFolder={navigateToFolder}
        handleDeleteItem={handleDeleteItem}
        handleDuplicateFile={handleDuplicateFile}
        handleDownloadFile={handleDownloadFile}
      />

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
                className='flex items-center gap-2 px-3 py-1.5 text-sm rounded-md bg-[#e5e5e7] dark:bg-[#2c2c2e] hover:bg-[#d1d1d6] dark:hover:bg-[#3a3a3c] transition-colors'
                onClick={() => {
                  return (
                    document.querySelector('input[type="file"]') as HTMLInputElement
                  )?.click();
                }}
              >
                <FilePlus className='h-4 w-4' />
                <span>New File</span>
              </button>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className='relative w-[300px]'>
                      <Input
                        value={emailAddress}
                        readOnly
                        className='w-full font-mono text-sm pr-20 cursor-help'
                      />
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => {
                          navigator.clipboard.writeText(emailAddress);
                          setIsCopied(true);
                          setTimeout(() => {
                            return setIsCopied(false);
                          }, 2000);
                        }}
                        className={cn(
                          'absolute right-1 top-1/2 -translate-y-1/2 h-7 transition-all duration-200',
                          isCopied ? 'bg-green-500 hover:bg-green-600 text-white' : '',
                        )}
                      >
                        {isCopied ? <Check className='h-4 w-4' /> : 'Copy'}
                      </Button>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side='bottom' className='max-w-[300px]'>
                    <p className='text-sm'>
                      Send files to this email address and they will automatically appear in this
                      folder. The address updates as you navigate through folders.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <input type='file' className='hidden' onChange={handleFileInputChange} />
            </div>
          </div>
        </div>

        {/* Email Popover */}
        <Popover open={isEmailPopoverOpen} onOpenChange={setIsEmailPopoverOpen}>
          <PopoverContent className='w-80'>
            <div className='space-y-4'>
              <div className='space-y-2'>
                <h4 className='font-medium text-sm'>Add File Via Email</h4>
                <p className='text-sm text-muted-foreground'>
                  Send files to this email address and they will appear in your workspace
                </p>
              </div>
              <div className='space-y-2'>
                <div className='flex items-center gap-2'>
                  <Input value={emailAddress} readOnly className='font-mono text-sm' />
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => {
                      navigator.clipboard.writeText(emailAddress);
                    }}
                  >
                    Copy
                  </Button>
                </div>
                <p className='text-xs text-muted-foreground'>
                  Files sent to this address will be automatically added to your workspace
                </p>
              </div>
            </div>
          </PopoverContent>
        </Popover>

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
                <div className='col-span-5'>Name</div>
                <div className='col-span-3'>Size</div>
                <div className='col-span-3'>Last Modified</div>
                <div className='col-span-1 text-right'>Actions</div>
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
                        <div className='col-span-5 flex items-center gap-2'>
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
                        <div className='col-span-1'></div>
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
                              'cursor-pointer items-center',
                              selectedFile?.name === file.name && 'bg-[#e5e5e7] dark:bg-[#2c2c2e]',
                            )}
                            onClick={() => {
                              if (file.type === 'folder') {
                                navigateToFolder(file.name);
                              } else {
                                setSelectedFile(file);
                              }
                            }}
                            onDoubleClick={() => {
                              if (file.type !== 'folder') {
                                handleDownloadFile(file._id);
                              }
                            }}
                            onContextMenu={(e) => {
                              e.preventDefault();
                              setSelectedFile(file);
                            }}
                          >
                            <div className='col-span-5 flex items-center gap-2'>
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
                            <div className='col-span-1 flex justify-end'>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <button
                                    className='p-1 hover:bg-[#d1d1d6] dark:hover:bg-[#3a3a3c] rounded-sm transition-colors'
                                    onClick={(e) => {
                                      return e.stopPropagation();
                                    }}
                                  >
                                    <MoreVertical className='h-4 w-4 text-muted-foreground' />
                                  </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align='end'>
                                  {file.type !== 'folder' && (
                                    <DropdownMenuItem
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDownloadFile(file._id);
                                      }}
                                    >
                                      <Download className='h-4 w-4 mr-2' />
                                      Download
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedFile(file);
                                      setNewFileName(file.name);
                                      setIsRenameDialogOpen(true);
                                    }}
                                  >
                                    <FileText className='h-4 w-4 mr-2' />
                                    Rename
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDuplicateFile(file._id);
                                    }}
                                  >
                                    <Copy className='h-4 w-4 mr-2' />
                                    Duplicate
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteItem(file._id);
                                    }}
                                    className='text-red-600 dark:text-red-400'
                                  >
                                    <Trash2 className='h-4 w-4 mr-2' />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
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
                    setNewFileName(selectedFile.name);
                    setIsRenameDialogOpen(true);
                  }}
                >
                  <FileText className='h-4 w-4 mr-2' />
                  Rename
                </ContextMenuItem>
                <ContextMenuItem
                  onClick={() => {
                    return handleDeleteItem(selectedFile._id);
                  }}
                  className='text-red-600 dark:text-red-400'
                >
                  <Trash2 className='h-4 w-4 mr-2' />
                  Delete
                </ContextMenuItem>
              </>
            )}
          </ContextMenuContent>
        </ContextMenu>
      </div>

      {/* File Preview Sheet */}
      <FilePreview
        file={selectedFile}
        onClose={() => {
          return setSelectedFile(null);
        }}
      />

      {/* Rename Dialog */}
      <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
        <DialogContent className='sm:max-w-[425px]'>
          <DialogHeader>
            <DialogTitle>Rename {selectedFile?.type === 'folder' ? 'Folder' : 'File'}</DialogTitle>
          </DialogHeader>
          <div className='grid gap-4 py-4'>
            <Input
              value={newFileName}
              onChange={(e) => {
                return setNewFileName(e.target.value);
              }}
              placeholder={`Enter new ${selectedFile?.type === 'folder' ? 'folder' : 'file'} name`}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => {
                return setIsRenameDialogOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleRename}>Rename</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Files;
