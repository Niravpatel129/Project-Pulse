import { Button } from '@/components/ui/button';
import { CommandShortcut } from '@/components/ui/command';
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
import { useProjectModules } from '@/hooks/useProjectModules';
import { formatDistanceToNow } from 'date-fns';
import { ChevronRight, FilePlus, FileText, PaintRoller, Plus } from 'lucide-react';
import { FcDocument } from 'react-icons/fc';
import FileUploadManagerModal from '../FileComponents/FileUploadManagerModal';

export default function NewProjectModules() {
  const {
    isFileUploadModalOpen,
    setIsFileUploadModalOpen,
    templates,
    handleAddFileToProject,
    modules,
  } = useProjectModules();

  const renderProjectItem = (item) => {
    return (
      <div className='border rounded-xl w-full aspect-square max-w-[220px] hover:bg-muted/50 cursor-pointer flex flex-col'>
        {/* Top Part */}
        <div className='flex items-center justify-center flex-grow'>
          <FcDocument className='h-[50%] w-[50%] max-h-[60px] max-w-[60px]' />
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
      </div>
    );
  };

  const renderAddNewModule = () => {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className='border border-dashed rounded-xl w-full aspect-square max-w-[220px] hover:bg-muted/50 cursor-pointer flex flex-col items-center justify-center'>
            <div className='flex flex-col items-center gap-2'>
              <div className='rounded-full bg-muted p-3'>
                <Plus className='h-6 w-6 text-muted-foreground' />
              </div>
              <div className='text-center px-4'>
                <p className='text-sm font-medium'>Add New Module</p>
                <p className='text-xs text-muted-foreground mt-1'>Click to create a new module</p>
              </div>
            </div>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent className='p-0'>
          {/* Left side - Main menu */}
          <div className=''>
            <div className='p-2'>
              <DropdownMenuItem
                className='flex items-center gap-2 px-2 py-2 cursor-pointer'
                onClick={() => {
                  return setIsFileUploadModalOpen(true);
                }}
              >
                <FilePlus className='h-4 w-4' />
                <span className='text-sm'>Add File</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className='my-2' />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className='flex items-center justify-between px-2 py-2 hover:bg-muted rounded-md cursor-pointer'>
                    <div className='flex items-center gap-2'>
                      <FileText className='h-4 w-4' />
                      <span className='text-sm'>Custom Template</span>
                    </div>
                    <ChevronRight className='h-4 w-4' />
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent className='p-0' side='right'>
                  <div className='p-2'>
                    {templates.map((template, index) => {
                      return (
                        <DropdownMenuItem key={index} className='px-2 py-2 cursor-pointer'>
                          <div>
                            <p className='text-sm font-medium'>{template.name}</p>
                            <p className='text-xs text-muted-foreground'>{template.description}</p>
                          </div>
                        </DropdownMenuItem>
                      );
                    })}
                    <DropdownMenuSeparator className='my-2' />
                    <DropdownMenuItem className='flex items-center gap-2 px-2 py-2 cursor-pointer'>
                      <Plus className='h-4 w-4' />
                      <span className='text-sm'>Add New Template</span>
                    </DropdownMenuItem>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
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
          <DropdownMenuContent className='min-w-[230px]' align='end'>
            <DropdownMenuItem
              onClick={() => {
                return setIsFileUploadModalOpen(true);
              }}
            >
              <>
                <FileText className='h-4 w-4' />
                <div className='text-sm text-popover-foreground'>New File</div>
                {/* keyboard shortcut with shadcn CommandShortcut */}
                <CommandShortcut className='ml-auto '>
                  <span className=''>⌘</span>
                  <span className=''>N</span>
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
                    <DropdownMenuItem>
                      <div className='flex items-center gap-2 justify-between'>
                        <PaintRoller className='h-4 w-4' />
                        <div className='text-sm text-popover-foreground'>Bolo Canvas</div>
                      </div>
                      <CommandShortcut className='ml-auto '>
                        <span className=''>⌘</span>
                        <span className=''>1</span>
                      </CommandShortcut>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
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
        </DropdownMenu>
      </div>
      <div className=''>
        <div className='grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-5 gap-4 auto-rows-fr'>
          {modules.map((item, index) => {
            return (
              <div key={index} className='flex justify-center'>
                {renderProjectItem(item)}
              </div>
            );
          })}
          <div className='flex justify-center'>{renderAddNewModule()}</div>
        </div>
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
    </div>
  );
}
