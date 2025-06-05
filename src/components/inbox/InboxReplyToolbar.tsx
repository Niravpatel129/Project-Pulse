import { Button } from '@/components/ui/button';
import {
  MdAttachFile,
  MdDelete,
  MdFormatBold,
  MdFormatItalic,
  MdFormatListBulleted,
  MdFormatQuote,
  MdFormatUnderlined,
  MdImage,
  MdInsertEmoticon,
  MdLink,
  MdMoreVert,
  MdSend,
} from 'react-icons/md';

export function InboxReplyToolbar() {
  return (
    <div className='sticky bottom-0 z-10 bg-background border-t p-2 shadow-sm'>
      <div className='flex items-center justify-between w-full'>
        {/* Left side: formatting options */}
        <div className='flex items-center gap-0.5'>
          <Button variant='ghost' size='icon' className='h-8 w-8 hover:bg-muted/50' title='Bold'>
            <MdFormatBold size={18} className='text-gray-600' />
          </Button>
          <Button variant='ghost' size='icon' className='h-8 w-8 hover:bg-muted/50' title='Italic'>
            <MdFormatItalic size={18} className='text-gray-600' />
          </Button>
          <Button
            variant='ghost'
            size='icon'
            className='h-8 w-8 hover:bg-muted/50'
            title='Underline'
          >
            <MdFormatUnderlined size={18} className='text-gray-600' />
          </Button>
          <Button
            variant='ghost'
            size='icon'
            className='h-8 w-8 hover:bg-muted/50'
            title='Bullet List'
          >
            <MdFormatListBulleted size={18} className='text-gray-600' />
          </Button>
          <Button
            variant='ghost'
            size='icon'
            className='h-8 w-8 hover:bg-muted/50'
            title='Insert Link'
          >
            <MdLink size={18} className='text-gray-600' />
          </Button>
          <Button
            variant='ghost'
            size='icon'
            className='h-8 w-8 hover:bg-muted/50'
            title='Insert Image'
          >
            <MdImage size={18} className='text-gray-600' />
          </Button>
          <Button
            variant='ghost'
            size='icon'
            className='h-8 w-8 hover:bg-muted/50'
            title='Insert Quote'
          >
            <MdFormatQuote size={18} className='text-gray-600' />
          </Button>
          <Button
            variant='ghost'
            size='icon'
            className='h-8 w-8 hover:bg-muted/50'
            title='Insert Emoji'
          >
            <MdInsertEmoticon size={18} className='text-gray-600' />
          </Button>
          <Button
            variant='ghost'
            size='icon'
            className='h-8 w-8 hover:bg-muted/50'
            title='Attach File'
          >
            <MdAttachFile size={18} className='text-gray-600' />
          </Button>
          <Button
            variant='ghost'
            size='icon'
            className='h-8 w-8 hover:bg-muted/50'
            title='More Options'
          >
            <MdMoreVert size={18} className='text-gray-600' />
          </Button>
          <Button variant='ghost' size='icon' className='h-8 w-8 hover:bg-muted/50' title='Delete'>
            <MdDelete size={18} className='text-gray-600' />
          </Button>
        </div>

        {/* Right side: send button */}
        <Button variant='default' className='gap-2 bg-blue-600 hover:bg-blue-700 text-white'>
          Send <MdSend size={18} />
        </Button>
      </div>
    </div>
  );
}
