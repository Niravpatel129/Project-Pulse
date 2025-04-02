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
import { FileText, PaintRoller, Plus } from 'lucide-react';
import Image from 'next/image';
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
                    <DropdownMenuItem key={index}>
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
    );
  };

  const renderProjectItem = (item) => {
    const isImage =
      item.moduleType === 'file' &&
      item.content?.fileId?.contentType &&
      item.content.fileId.contentType.startsWith('image/');

    return (
      <div className='border rounded-xl w-full aspect-square max-w-[220px] hover:bg-muted/50 cursor-pointer flex flex-col'>
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
        <div className='grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-5 gap-4 auto-rows-fr'>
          {modules.map((item, index) => {
            return (
              <div key={index} className='flex justify-center'>
                {renderProjectItem(item)}
              </div>
            );
          })}
        </div>

        {!modules.length && (
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
    </div>
  );
}
