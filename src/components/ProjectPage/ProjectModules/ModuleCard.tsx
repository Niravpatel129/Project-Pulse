import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { LuBook, LuCopy, LuEllipsis, LuFigma, LuPencil, LuTrash2 } from 'react-icons/lu';

const ModuleCard = ({
  item,
  setSelectedModule,
  setModuleToDuplicate,
  setDuplicateModuleName,
  setIsDuplicateDialogOpen,
  setRenamingModule,
  setNewModuleName,
  setIsRenameDialogOpen,
  setModuleToDelete,
  setIsDeleteDialogOpen,
  itemVariants,
}) => {
  const isImage =
    item.moduleType === 'file' &&
    item.content?.fileId?.contentType &&
    item.content.fileId.contentType.startsWith('image/');

  // find thumbnail image from template data
  let thumbnailUrl = null;
  if (item.moduleType === 'template' && item.versions && item.versions.length > 0) {
    // Get the latest version (the one with the highest number)
    const latestVersion = item.versions.reduce((latest, current) => {
      return current.number > latest.number ? current : latest;
    }, item.versions[0]);

    // Scan through all sections and fields to find the first image
    if (latestVersion.contentSnapshot && latestVersion.contentSnapshot.sections) {
      for (const section of latestVersion.contentSnapshot.sections) {
        if (section.fields && section.fields.length > 0) {
          for (const field of section.fields) {
            if (
              field.fieldValue &&
              field.fieldValue.contentType &&
              field.fieldValue.contentType.startsWith('image/') &&
              field.fieldValue.downloadURL
            ) {
              thumbnailUrl = field.fieldValue.downloadURL;
              break;
            }
          }
          if (thumbnailUrl) break;
        }
      }
    }
  }

  return (
    <motion.div
      layout
      variants={itemVariants}
      initial='hidden'
      animate='visible'
      exit='exit'
      className='border rounded-xl w-full aspect-video hover:shadow cursor-pointer flex flex-col relative overflow-hidden min-h-[250px] group'
      onClick={() => {
        return setSelectedModule(item);
      }}
    >
      {/* Top Part */}
      <div className='flex items-center justify-center flex-grow relative'>
        <div className='absolute top-4 left-4 z-10 bg-opacity-50 overflow-hidden rounded bg-white/60 backdrop-blur-sm'>
          {item.moduleType === 'file' && (
            <div className='px-2 py-1 text-[10px] font-medium tracking-wider uppercase backdrop-blur-sm rounded text-blue-700'>
              {item.moduleType}
            </div>
          )}
          {item.moduleType === 'figma' && (
            <div className='px-2 py-1 text-[10px] font-medium tracking-wider uppercase backdrop-blur-sm rounded text-orange-700'>
              {item.moduleType}
            </div>
          )}
          {item.moduleType === 'template' && (
            <div className='px-2 py-1 text-[10px] font-medium tracking-wider uppercase backdrop-blur-sm rounded text-purple-700'>
              {item.moduleType}
            </div>
          )}
          {!['file', 'figma', 'template'].includes(item.moduleType) && (
            <div className='px-2 py-1 text-[10px] font-medium tracking-wider uppercase backdrop-blur-sm rounded text-gray-700 z-10'>
              {item.moduleType}
            </div>
          )}
        </div>
        {isImage ? (
          <div className='h-full w-full p-2 flex items-center justify-center '>
            <Image
              src={item.content.fileId.downloadURL}
              alt={item.name}
              className='max-h-full max-w-full object-cover p-3 !rounded-2xl'
              fill
            />
          </div>
        ) : thumbnailUrl ? (
          <div className='h-full w-full p-2 flex items-center justify-center '>
            <Image
              src={thumbnailUrl}
              alt={item.name}
              className='max-h-full max-w-full object-cover p-3 !rounded-2xl'
              fill
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
    </motion.div>
  );
};

export default ModuleCard;
