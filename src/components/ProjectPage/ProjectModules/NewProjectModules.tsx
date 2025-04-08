import { Template } from '@/api/models';
import { Button } from '@/components/ui/button';
import { CommandShortcut } from '@/components/ui/command';
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
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useProjectModules } from '@/hooks/useProjectModules';
import { newRequest } from '@/utils/newRequest';
import { useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { FileText, MoreVertical, PaintRoller, Pencil, Plus, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { FcDocument } from 'react-icons/fc';
import { LuFigma } from 'react-icons/lu';
import { toast } from 'sonner';
import FigmaManagerModal from '../FileComponents/FigmaManagerModal';
import FileUploadManagerModal from '../FileComponents/FileUploadManagerModal';
import NewModuleFromTemplateSheet from '../FileComponents/NewModuleFromTemplateSheet';
import NewTemplateSheet from '../FileComponents/NewTemplateSheet';
import { Module } from '../ModuleComponents/types';
import ModuleDialog from './ModuleDialog';

export default function NewProjectModules() {
  const {
    isFileUploadModalOpen,
    setIsFileUploadModalOpen,
    templates,
    handleAddFileToProject,
    modules,
    addModule,
    isLoading,
  } = useProjectModules();

  const [isFigmaModalOpen, setIsFigmaModalOpen] = useState(false);
  const [isNewTemplateSheetOpen, setIsNewTemplateSheetOpen] = useState(false);
  const [isNewModuleFromTemplateSheetOpen, setIsNewModuleFromTemplateSheetOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [renamingModule, setRenamingModule] = useState<{ id: string; name: string } | null>(null);
  const [newModuleName, setNewModuleName] = useState('');
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const handleSaveTemplate = (
    template: Omit<Template, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>,
  ) => {
    // TODO: Implement template saving logic
    console.log('Saving template:', template);
  };

  const handleDeleteModule = async (moduleId: string) => {
    // Optimistically update the UI
    const previousModules = queryClient.getQueryData(['projectModules']);
    queryClient.setQueryData(['projectModules'], (old: any) => {
      return old.filter((module: any) => {
        return module._id !== moduleId;
      });
    });

    try {
      await newRequest.delete(`/project-modules/${moduleId}`);
      toast.success('Module deleted successfully');
    } catch (error) {
      // Revert on error
      queryClient.setQueryData(['projectModules'], previousModules);
      console.error('Failed to delete module:', error);
      toast.error('Failed to delete module');
    }
  };

  const handleRenameModule = async (moduleId: string, newName: string) => {
    // Optimistically update the UI
    const previousModules = queryClient.getQueryData(['projectModules']);
    queryClient.setQueryData(['projectModules'], (old: any) => {
      return old.map((module: any) => {
        if (module._id === moduleId) {
          return { ...module, name: newName };
        }
        return module;
      });
    });

    try {
      await newRequest.patch(`/project-modules/${moduleId}`, {
        name: newName,
      });
      toast.success('Module renamed successfully');
      setRenamingModule(null);
      setIsRenameDialogOpen(false);
    } catch (error) {
      // Revert on error
      queryClient.setQueryData(['projectModules'], previousModules);
      console.error('Failed to rename module:', error);
      toast.error('Failed to rename module');
    }
  };

  const handleAddFigmaToProject = (figmaFile: any) => {
    addModule({
      type: 'figma',
      content: {
        figmaUrl: figmaFile.figmaUrl,
        thumbnailUrl: figmaFile.thumbnailUrl,
        name: figmaFile.name,
      },
    });
    setIsFigmaModalOpen(false);
  };

  const renderDropdownMenu = () => {
    return (
      <DropdownMenuContent className='min-w-[230px]' align='end'>
        <DropdownMenuItem
          onClick={() => {
            return setIsFileUploadModalOpen(true);
          }}
        >
          <>
            <FileText className='h-4 w-4' />
            <div className='text-sm text-popover-foreground'>New File</div>
            <CommandShortcut className='ml-auto '>
              <span className=''>⌘</span>
              <span className=''>N</span>
            </CommandShortcut>
          </>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            return setIsFigmaModalOpen(true);
          }}
        >
          <>
            <LuFigma className='h-4 w-4' />
            <div className='text-sm text-popover-foreground'>New Figma</div>
            <CommandShortcut className='ml-auto '>
              <span className=''>⌘</span>
              <span className=''>F</span>
            </CommandShortcut>
          </>
        </DropdownMenuItem>
        <DropdownMenuGroup>
          <DropdownMenuSeparator className='my-2' />

          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <PaintRoller className='h-4 w-4' />
              <div className='text-sm text-popover-foreground'>Templates</div>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent className='text-sm text-popover-foreground min-w-[220px]'>
                {templates.map((template, index) => {
                  return (
                    <DropdownMenuItem
                      key={index}
                      onClick={() => {
                        setSelectedTemplate(template);
                        setIsNewModuleFromTemplateSheetOpen(true);
                      }}
                    >
                      <div className='flex items-center gap-2'>
                        <FileText className='h-4 w-4' />
                        <div>
                          <p className='text-sm font-medium'>{template.name}</p>
                          <p className='text-xs text-muted-foreground'>{template.description}</p>
                        </div>
                      </div>
                    </DropdownMenuItem>
                  );
                })}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    return setIsNewTemplateSheetOpen(true);
                  }}
                >
                  <Plus className='h-4 w-4' />
                  <div className='text-sm text-popover-foreground'>New Template</div>
                  <CommandShortcut className='ml-auto '>
                    <span className=''>⌘</span>
                    <span className=''>T</span>
                  </CommandShortcut>
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    );
  };

  const renderProjectItem = (item) => {
    const isImage =
      item.moduleType === 'file' &&
      item.content?.fileId?.contentType &&
      item.content.fileId.contentType.startsWith('image/');

    return (
      <div
        className='border rounded-xl w-full aspect-square max-w-[220px] hover:bg-muted/50 cursor-pointer flex flex-col relative'
        onClick={() => {
          return setSelectedModule(item);
        }}
      >
        {/* Top Part */}
        <div className='flex items-center justify-center flex-grow'>
          {isImage ? (
            <div className='h-full w-full p-2 flex items-center justify-center'>
              <Image
                src={item.content.fileId.downloadURL}
                alt={item.name}
                className='max-h-full max-w-full object-contain'
                width={100}
                height={100}
              />
            </div>
          ) : item.moduleType === 'figma' ? (
            <LuFigma className='h-[50%] w-[50%] max-h-[60px] max-w-[60px] text-[#F24E1E]' />
          ) : (
            <FcDocument className='h-[50%] w-[50%] max-h-[60px] max-w-[60px]' />
          )}
        </div>
        {/* Bottom Part */}
        <div className='border-t'>
          <div className='py-3 px-3 flex flex-col gap-1'>
            <p className='text-sm font-medium truncate'>{item.name}</p>
            <p className='text-xs text-gray-500 truncate'>
              {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
            </p>
          </div>
        </div>
        {/* Options Menu */}
        <div className='absolute top-2 right-2'>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant='ghost'
                size='icon'
                className='h-8 w-8 hover:bg-muted/50'
                onClick={(e) => {
                  return e.stopPropagation();
                }}
              >
                <MoreVertical className='h-4 w-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end' className='w-48'>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  setRenamingModule({ id: item._id, name: item.name });
                  setNewModuleName(item.name);
                  setIsRenameDialogOpen(true);
                }}
              >
                <Pencil className='mr-2 h-4 w-4' />
                <span>Rename</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteModule(item._id);
                }}
                className='text-red-600 focus:text-red-600 focus:bg-red-50'
              >
                <Trash2 className='mr-2 h-4 w-4' />
                <span>Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    );
  };

  const renderModuleSkeleton = () => {
    return (
      <div className='border rounded-xl w-full aspect-square max-w-[220px] flex flex-col'>
        {/* Top Part Skeleton */}
        <div className='flex items-center justify-center flex-grow p-4'>
          <Skeleton className='h-[60px] w-[60px] rounded-md' />
        </div>
        {/* Bottom Part Skeleton */}
        <div className='border-t'>
          <div className='py-3 px-3 flex flex-col gap-2'>
            <Skeleton className='h-4 w-3/4' />
            <Skeleton className='h-3 w-1/2' />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className='flex items-center justify-between mb-4'>
        <div className='text-sm font-medium'>All Modules</div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='outline' size='sm'>
              <div className='flex items-center gap-2'>
                <Plus className='h-4 w-4' />
                <div className='text-sm text-muted-foreground'>Add New</div>
              </div>
            </Button>
          </DropdownMenuTrigger>
          {renderDropdownMenu()}
        </DropdownMenu>
      </div>
      <div className=''>
        {isLoading ? (
          <div className='grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-5 gap-4 auto-rows-fr'>
            {Array(5)
              .fill(0)
              .map((_, index) => {
                return (
                  <div key={index} className='flex justify-center'>
                    {renderModuleSkeleton()}
                  </div>
                );
              })}
          </div>
        ) : (
          <div className='grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-5 gap-4 auto-rows-fr'>
            {modules.map((item, index) => {
              return (
                <div key={index} className='flex justify-center'>
                  {renderProjectItem(item)}
                </div>
              );
            })}
          </div>
        )}

        {!isLoading && !modules.length && (
          <div className='flex items-center justify-center h-full'>
            <p className='text-sm text-muted-foreground'>No modules found</p>
          </div>
        )}
      </div>

      <FileUploadManagerModal
        isOpen={isFileUploadModalOpen}
        onClose={() => {
          return setIsFileUploadModalOpen(false);
        }}
        handleAddFileToProject={(files) => {
          return handleAddFileToProject({ type: 'file', content: files });
        }}
      />

      <FigmaManagerModal
        isOpen={isFigmaModalOpen}
        onClose={() => {
          return setIsFigmaModalOpen(false);
        }}
        handleAddFigmaToProject={handleAddFigmaToProject}
      />

      <NewTemplateSheet
        isOpen={isNewTemplateSheetOpen}
        onClose={() => {
          return setIsNewTemplateSheetOpen(false);
        }}
        onSave={handleSaveTemplate}
      />

      {selectedTemplate && (
        <NewModuleFromTemplateSheet
          isOpen={isNewModuleFromTemplateSheetOpen}
          onClose={() => {
            setIsNewModuleFromTemplateSheetOpen(false);
            setSelectedTemplate(null);
          }}
          template={selectedTemplate}
        />
      )}

      {selectedModule && (
        <ModuleDialog
          moduleId={selectedModule?._id}
          onOpenChange={(open) => {
            return !open && setSelectedModule(null);
          }}
        />
      )}

      <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
        <DialogContent className='sm:max-w-[425px]'>
          <DialogHeader>
            <DialogTitle>Rename Module</DialogTitle>
          </DialogHeader>
          <div className='py-4'>
            <Input
              value={newModuleName}
              onChange={(e) => {
                return setNewModuleName(e.target.value);
              }}
              placeholder='Enter new name'
              className='w-full'
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
            <Button
              onClick={() => {
                if (renamingModule) {
                  handleRenameModule(renamingModule.id, newModuleName);
                }
              }}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
