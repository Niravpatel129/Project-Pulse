import { Button } from '@/components/ui/button';
import {
  FiArchive,
  FiChevronLeft,
  FiChevronRight,
  FiCopy,
  FiMoreHorizontal,
  FiStar,
  FiTrash2,
  FiX,
} from 'react-icons/fi';

export default function InvoiceActionBar() {
  return (
    <div className='flex items-center py-2.5 px-4 border-b border-b-[#222]'>
      <Button variant='ghost' size='sm' className='text-[#8b8b8b]'>
        <FiX size={16} />
      </Button>
      <div className='w-[1px] h-[18px] bg-[#222] mr-4' />
      <Button variant='ghost' size='sm' className='text-[#8b8b8b]'>
        <FiChevronLeft size={16} />
      </Button>
      <Button variant='ghost' size='sm' className='text-[#8b8b8b]'>
        <FiChevronRight size={16} />
      </Button>
      <div className='flex-1' />
      <div className='flex items-center gap-1'>
        <Button
          variant='default'
          size='icon'
          className='text-[#8b8b8b] bg-[#313131] hover:bg-[#3a3a3a] h-8 w-8'
        >
          <FiCopy size={14} />
        </Button>
        <Button
          variant='default'
          size='icon'
          className='text-[#8b8b8b] bg-[#313131] hover:bg-[#3a3a3a] h-8 w-8'
        >
          <FiStar size={14} />
        </Button>
        <Button
          variant='default'
          size='icon'
          className='text-[#8b8b8b] bg-[#313131] hover:bg-[#3a3a3a] h-8 w-8'
        >
          <FiArchive size={14} />
        </Button>
        <Button
          variant='default'
          size='icon'
          className='text-[#f63e68] bg-[#451a26] h-8 w-8 border-2 border-[#6e2535] hover:bg-[#6e2535]'
        >
          <FiTrash2 size={14} />
        </Button>
        <Button
          variant='default'
          size='icon'
          className='text-[#8b8b8b] bg-[#313131] hover:bg-[#3a3a3a] h-8 w-8'
        >
          <FiMoreHorizontal size={14} />
        </Button>
      </div>
    </div>
  );
}
