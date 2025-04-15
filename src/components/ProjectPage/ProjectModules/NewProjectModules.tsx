import { Template } from '@/api/models';
import { Badge } from '@/components/ui/badge';
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
import { PaintRoller } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import {
  LuBook,
  LuCopy,
  LuEllipsis,
  LuFigma,
  LuFileText,
  LuPencil,
  LuPlus,
  LuTrash2,
} from 'react-icons/lu';
import { toast } from 'sonner';
import FigmaManagerModal from '../FileComponents/FigmaManagerModal';
import FileUploadManagerModal from '../FileComponents/FileUploadManagerModal';
import NewTemplateSheet from '../FileComponents/NewTemplateSheet';
import { DeleteModuleDialog } from '../ModuleComponents/DeleteModuleDialog';
import { Module } from '../ModuleComponents/types';
import ModuleDialog from './ModuleDialog';
import NewTemplateModuleModal from './NewTemplateModuleModal';

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
  const [isDuplicateDialogOpen, setIsDuplicateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [moduleToDelete, setModuleToDelete] = useState<Module | null>(null);
  const MAX_NAME_LENGTH = 50;
  const [duplicateModuleName, setDuplicateModuleName] = useState('');
  const [moduleToDuplicate, setModuleToDuplicate] = useState<Module | null>(null);
  const [isTemplateDropdownOpen, setIsTemplateDropdownOpen] = useState(false);
  const queryClient = useQueryClient();

  const handleSaveTemplate = (
    template: Omit<Template, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>,
  ) => {
    // TODO: Implement template saving logic
    console.log('Saving template:', template);
  };

  const handleDeleteModule = async (module: Module) => {
    // Optimistically update the UI
    const previousModules = queryClient.getQueryData(['projectModules']);
    queryClient.setQueryData(['projectModules'], (old: any) => {
      return old.filter((m: any) => {
        return m._id !== module._id;
      });
    });

    try {
      await newRequest.delete(`/project-modules/${module._id}`);
      toast.success('Module deleted successfully');
      setIsDeleteDialogOpen(false);
      setModuleToDelete(null);
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

  const handleDuplicateModule = async (moduleId: string, newName: string) => {
    try {
      const response = await newRequest.post(`/project-modules/${moduleId}/duplicate`, {
        name: newName,
      });

      // Optimistically update the UI
      queryClient.setQueryData(['projectModules'], (old: any) => {
        return [...old, response.data];
      });

      toast.success('Module duplicated successfully');
      setIsDuplicateDialogOpen(false);
      setModuleToDuplicate(null);
      setDuplicateModuleName('');
    } catch (error) {
      console.error('Failed to duplicate module:', error);
      toast.error('Failed to duplicate module');
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

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= MAX_NAME_LENGTH) {
      setDuplicateModuleName(value);
    }
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
            <LuFileText className='h-4 w-4' />
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
                        <LuFileText className='h-4 w-4' />
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
                  <LuPlus className='h-4 w-4' />
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

  const renderTemplateDropdownMenu = () => {
    return (
      <DropdownMenuContent className='w-[180px]' align='end'>
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
                <LuFileText className='h-4 w-4' />
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
          <LuPlus className='h-4 w-4' />
          <div className='text-sm text-popover-foreground'>New Template</div>
          <CommandShortcut className='ml-auto '>
            <span className=''>⌘</span>
            <span className=''>T</span>
          </CommandShortcut>
        </DropdownMenuItem>
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
        className='border rounded-xl w-full aspect-video hover:shadow cursor-pointer flex flex-col relative overflow-hidden min-h-[250px] group'
        onClick={() => {
          return setSelectedModule(item);
        }}
      >
        {/* Top Part */}
        <div className='flex items-center justify-center flex-grow relative'>
          <div className='absolute top-3 left-1'>
            {item.moduleType === 'file' && (
              <div className='px-2 py-1 text-[10px] font-medium tracking-wider uppercase bg-white/90 backdrop-blur-sm rounded-full text-blue-700'>
                {item.moduleType}
              </div>
            )}
            {item.moduleType === 'figma' && (
              <div className='px-2 py-1 text-[10px] font-medium tracking-wider uppercase bg-white/90 backdrop-blur-sm rounded-full text-orange-700'>
                {item.moduleType}
              </div>
            )}
            {item.moduleType === 'template' && (
              <div className='px-2 py-1 text-[10px] font-medium tracking-wider uppercase bg-white/90 backdrop-blur-sm rounded-full text-purple-700'>
                {item.moduleType}
              </div>
            )}
            {!['file', 'figma', 'template'].includes(item.moduleType) && (
              <div className='px-2 py-1 text-[10px] font-medium tracking-wider uppercase bg-white/90 backdrop-blur-sm rounded-full text-gray-700'>
                {item.moduleType}
              </div>
            )}
          </div>
          {isImage ? (
            <div className='h-full w-full p-2 flex items-center justify-center '>
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
            <LuBook className='h-[50%] w-[50%] max-h-[60px] max-w-[60px] text-[#393939]' />
          )}
        </div>
        {/* Bottom Part */}
        <div className='border-t'>
          <div className='absolute bottom-2 right-2'></div>
          <div className='py-3 px-3 flex flex-col gap-1'>
            <div className='text-sm font-medium truncate flex items-center gap-2'>
              {item.name}

              <Badge variant='outline' className='rounded-sm'>
                V{item.currentVersion}
              </Badge>
            </div>
            <div className='text-xs text-gray-500 truncate'>
              Udivdated{' '}
              {formatDistanceToNow(new Date(item.updatedAt), { addSuffix: true }).replace(
                /^about\s+/,
                '',
              )}
            </div>
          </div>
        </div>
        {/* Options Menu */}
        <div className='absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200'>
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
                <LuEllipsis className='h-4 w-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end' className='w-48'>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  setModuleToDuplicate(item);
                  setDuplicateModuleName(`Duplicate of ${item.name}`);
                  setIsDuplicateDialogOpen(true);
                }}
              >
                <LuCopy className='mr-2 h-4 w-4' />
                <span>Duplicate</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  setRenamingModule({ id: item._id, name: item.name });
                  setNewModuleName(item.name);
                  setIsRenameDialogOpen(true);
                }}
              >
                <LuPencil className='mr-2 h-4 w-4' />
                <span>Rename</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  setModuleToDelete(item);
                  setIsDeleteDialogOpen(true);
                }}
                className='text-red-600 focus:text-red-600 focus:bg-red-50'
              >
                <LuTrash2 className='mr-2 h-4 w-4' />
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
  const renderModals = () => {
    return (
      <>
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
          <NewTemplateModuleModal
            isOpen={isNewModuleFromTemplateSheetOpen}
            onClose={() => {
              setIsNewModuleFromTemplateSheetOpen(false);
              setSelectedTemplate(null);
            }}
            template={selectedTemplate}
            templateName={selectedTemplate?.name}
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

        <Dialog open={isDuplicateDialogOpen} onOpenChange={setIsDuplicateDialogOpen}>
          <DialogContent className='sm:max-w-[425px] p-6'>
            <DialogHeader>
              <DialogTitle>Duplicate Module</DialogTitle>
            </DialogHeader>
            <div className='flex flex-col gap-4 py-4'>
              <div className='space-y-2'>
                <p className='text-sm text-muted-foreground'>
                  Create a copy of this module with a new name.
                </p>
              </div>
              <div className='space-y-1'>
                <Input
                  value={duplicateModuleName}
                  onChange={handleNameChange}
                  className='h-9'
                  autoFocus
                  maxLength={MAX_NAME_LENGTH}
                />
                <div className='h-5'>
                  {duplicateModuleName.length > MAX_NAME_LENGTH * 0.8 && (
                    <p className='text-xs text-muted-foreground'>
                      {MAX_NAME_LENGTH - duplicateModuleName.length} characters remaining
                    </p>
                  )}
                </div>
              </div>
              <div className='flex justify-end gap-2'>
                <Button
                  variant='ghost'
                  onClick={() => {
                    setIsDuplicateDialogOpen(false);
                    setModuleToDuplicate(null);
                    setDuplicateModuleName('');
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    if (moduleToDuplicate) {
                      handleDuplicateModule(moduleToDuplicate._id, duplicateModuleName);
                    }
                  }}
                >
                  Create Duplicate
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <DeleteModuleDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          moduleToDelete={moduleToDelete}
          onDelete={handleDeleteModule}
        />
      </>
    );
  };

  if (!isLoading && !modules.length) {
    return (
      <div className='flex justify-center items-center relative z-10'>
        <div className='flex flex-col justify-center p-6 max-w-2xl text-center mt-[50px]'>
          <div className='relative mb-4'>
            <div className='absolute inset-0 bg-gradient-to-r from-green-100 to-blue-100 rounded-full opacity-30 blur-md'></div>
            <div className='relative flex items-center justify-center'>
              <LuBook className='h-16 w-16 mx-auto text-green-500 drop-shadow-md' />
            </div>
          </div>
          <div className='mx-auto'>
            <h2 className='text-3xl font-bold text-gray-800 mb-6'>Project Modules</h2>
            <p className='text-gray-600 mb-6'>
              Add files, Figma designs, and templates to your project. All modules can be versioned,
              shared, and commented on.
            </p>

            <div className='mb-8 flex flex-col items-center gap-6'>
              <div className='grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-3xl'>
                <Button
                  className='bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-md hover:shadow-lg transition-all duration-300 rounded-xl h-[120px] flex flex-col items-center justify-center gap-3'
                  onClick={() => {
                    return setIsFileUploadModalOpen(true);
                  }}
                >
                  <div className='bg-white/20 p-2 rounded-full'>
                    <LuFileText className='h-6 w-6' />
                  </div>
                  <span className='font-medium'>Add File</span>
                </Button>
                <Button
                  variant='outline'
                  className='border-2 hover:border-blue-300 hover:bg-blue-50/50 transition-all duration-300 rounded-xl h-[120px] flex flex-col items-center justify-center gap-3'
                  onClick={() => {
                    return setIsFigmaModalOpen(true);
                  }}
                >
                  <div className='bg-orange-100 p-2 rounded-full'>
                    <LuFigma className='h-6 w-6 text-orange-600' />
                  </div>
                  <span className='font-medium'>Add Figma</span>
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant='outline'
                      className='border-2 hover:border-purple-300 hover:bg-purple-50/50 transition-all duration-300 rounded-xl h-[120px] flex flex-col items-center justify-center gap-3'
                    >
                      <div className='bg-purple-100 p-2 rounded-full'>
                        <PaintRoller className='h-6 w-6 text-purple-600' />
                      </div>
                      <span className='font-medium'>Add from Template</span>
                    </Button>
                  </DropdownMenuTrigger>
                  {renderTemplateDropdownMenu()}
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>
        {renderModals()}
      </div>
    );
  }

  return (
    <div>
      <div className='flex items-center justify-between mb-4'>
        <div className='text-sm font-medium'>All Modules</div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='outline' size='sm'>
              <div className='flex items-center gap-2'>
                <LuPlus className='h-4 w-4' />
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
                  <div key={index} className='flex justify-center w-full h-full'>
                    {renderModuleSkeleton()}
                  </div>
                );
              })}
          </div>
        ) : (
          <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-4 auto-rows-fr'>
            {modules.map((item, index) => {
              return (
                <div key={index} className='flex justify-center w-full h-full'>
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
      {renderModals()}
    </div>
  );
}
